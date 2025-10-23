const models = require('../models');
const Auditoria = models.Auditoria;
const Usuario = models.Usuarios;
const { Op, fn, col, literal } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Registrar una acción en el sistema de auditoría
 * @param {number} id_usuario - ID del usuario que realiza la acción
 * @param {string} accion - Tipo de acción realizada (ej. LOGIN, CREATE, UPDATE, DELETE)
 * @param {string} tabla - Tabla afectada
 * @param {string} descripcion - Descripción de la acción
 * @param {Object} datos_antiguos - Datos antes del cambio (para UPDATE/DELETE)
 * @param {Object} datos_nuevos - Datos después del cambio (para CREATE/UPDATE)
 */
const registrarAuditoria = async (id_usuario, accion, tabla, descripcion, datos_antiguos = null, datos_nuevos = null) => {
    try {
        await Auditoria.create({
            id_usuario,
            accion,
            tabla,
            descripcion,
            fecha_hora: new Date(),
            datos_antiguos: datos_antiguos ? JSON.stringify(datos_antiguos) : null,
            datos_nuevos: datos_nuevos ? JSON.stringify(datos_nuevos) : null
        });
        return true;
    } catch (error) {
        console.error('Error al registrar auditoría:', error);
        return false;
    }
};

/**
 * Obtener registros de auditoría con filtros
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getRegistrosAuditoria = async (req, res) => {
    try {
        const {
            id_usuario,
            accion,
            tabla,
            fecha_inicio,
            fecha_fin,
            limite = 100,
            pagina = 1
        } = req.query;

        // Construir filtros
        const where = {};

        if (id_usuario) where.id_usuario = id_usuario;
        if (accion) where.accion = accion;
        if (tabla) where.tabla = tabla;

        // Filtro por fechas
        if (fecha_inicio || fecha_fin) {
            where.fecha_hora = {};

            if (fecha_inicio) {
                where.fecha_hora[Op.gte] = new Date(fecha_inicio);
            }

            if (fecha_fin) {
                where.fecha_hora[Op.lte] = new Date(fecha_fin);
            }
        }

        // Calcular offset para paginación
        const offset = (pagina - 1) * limite;

        // Obtener registros
        const { count, rows: registros } = await Auditoria.findAndCountAll({
            where,
            include: [{
                model: Usuario,
                attributes: ['id_usuario', 'nombre_usuario'],
                as: 'usuario'
            }],
            order: [['fecha_hora', 'DESC']],
            limit: parseInt(limite),
            offset: parseInt(offset)
        });

        // Calcular total de páginas
        const totalPaginas = Math.ceil(count / limite);

        res.status(200).json({
            message: 'Registros de auditoría obtenidos exitosamente',
            registros,
            paginacion: {
                total: count,
                pagina: parseInt(pagina),
                limite: parseInt(limite),
                totalPaginas
            }
        });
    } catch (error) {
        console.error('Error al obtener registros de auditoría:', error);
        res.status(500).json({
            message: 'Error al obtener registros de auditoría',
            error: error.message
        });
    }
};

/**
 * Obtener un registro de auditoría específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getRegistroAuditoria = async (req, res) => {
    try {
        const { id } = req.params;

        const registro = await Auditoria.findByPk(id, {
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['id_usuario', 'nombre_usuario']
            }]
        });

        if (!registro) {
            return res.status(404).json({
                message: 'Registro de auditoría no encontrado'
            });
        }

        res.status(200).json({
            message: 'Registro de auditoría obtenido exitosamente',
            registro
        });
    } catch (error) {
        console.error('Error al obtener registro de auditoría:', error);
        res.status(500).json({
            message: 'Error al obtener registro de auditoría',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de auditoría
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getEstadisticas = async (req, res) => {
    try {
        const {
            fecha_inicio,
            fecha_fin,
            id_usuario,
            tabla
        } = req.query;

        // Construir filtros base
        const where = {};
        if (id_usuario) where.id_usuario = id_usuario;
        if (tabla) where.tabla = tabla;
        if (fecha_inicio || fecha_fin) {
            where.fecha_hora = {};
            if (fecha_inicio) where.fecha_hora[Op.gte] = new Date(fecha_inicio);
            if (fecha_fin) where.fecha_hora[Op.lte] = new Date(fecha_fin);
        }

        // Total de registros
        const totalRegistros = await Auditoria.count({ where });

        // Total de usuarios únicos
        const totalUsuarios = await Auditoria.count({
            where,
            distinct: true,
            col: 'id_usuario'
        });

        // Total de acciones
        const totalAcciones = totalRegistros;

        // Total de tablas únicas
        const totalTablas = await Auditoria.count({
            where,
            distinct: true,
            col: 'tabla'
        });

        // Acciones por tipo
        const accionesPorTipo = await Auditoria.findAll({
            where,
            attributes: [
                'accion',
                [fn('COUNT', col('id_auditoria')), 'cantidad']
            ],
            group: ['accion'],
            raw: true
        });

        // Actividad por usuario (top 10)
        const actividadPorUsuario = await Auditoria.findAll({
            where,
            attributes: [
                'id_usuario',
                [fn('COUNT', col('id_auditoria')), 'cantidad']
            ],
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['nombre_usuario']
            }],
            group: ['id_usuario', 'usuario.id_usuario', 'usuario.nombre_usuario'],
            order: [[fn('COUNT', col('id_auditoria')), 'DESC']],
            limit: 10
        });

        // Formatear actividad por usuario
        const actividadUsuarioFormateada = actividadPorUsuario.map(item => ({
            usuario: item.usuario?.nombre_usuario || 'Desconocido',
            cantidad: parseInt(item.dataValues.cantidad)
        }));

        // Actividad por tabla (top 10)
        const actividadPorTabla = await Auditoria.findAll({
            where,
            attributes: [
                'tabla',
                [fn('COUNT', col('id_auditoria')), 'cantidad']
            ],
            group: ['tabla'],
            order: [[fn('COUNT', col('id_auditoria')), 'DESC']],
            limit: 10,
            raw: true
        });

        // Actividad por día (últimos 30 días)
        const hace30Dias = new Date();
        hace30Dias.setDate(hace30Dias.getDate() - 30);
        
        const whereConFecha = { ...where };
        if (!whereConFecha.fecha_hora) {
            whereConFecha.fecha_hora = {};
        }
        whereConFecha.fecha_hora[Op.gte] = hace30Dias;

        const actividadPorDia = await Auditoria.findAll({
            where: whereConFecha,
            attributes: [
                [fn('DATE', col('fecha_hora')), 'fecha'],
                [fn('COUNT', col('id_auditoria')), 'cantidad']
            ],
            group: [fn('DATE', col('fecha_hora'))],
            order: [[fn('DATE', col('fecha_hora')), 'ASC']],
            raw: true
        });

        // Acciones de hoy
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const accionesHoy = await Auditoria.count({
            where: {
                ...where,
                fecha_hora: {
                    [Op.gte]: hoy
                }
            }
        });

        // Sesiones activas (logins sin logout en las últimas 24 horas)
        const hace24Horas = new Date();
        hace24Horas.setHours(hace24Horas.getHours() - 24);
        
        const sesionesActivas = await Auditoria.count({
            where: {
                accion: 'LOGIN',
                fecha_hora: {
                    [Op.gte]: hace24Horas
                }
            },
            distinct: true,
            col: 'id_usuario'
        });

        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            estadisticas: {
                totalRegistros,
                totalUsuarios,
                totalAcciones,
                totalTablas,
                accionesPorTipo,
                actividadPorUsuario: actividadUsuarioFormateada,
                actividadPorTabla,
                actividadPorDia,
                accionesHoy,
                sesionesActivas
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

/**
 * Obtener lista de tablas disponibles
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getTablas = async (req, res) => {
    try {
        const tablas = await Auditoria.findAll({
            attributes: [[fn('DISTINCT', col('tabla')), 'tabla']],
            order: [['tabla', 'ASC']],
            raw: true
        });

        res.status(200).json({
            message: 'Tablas obtenidas exitosamente',
            tablas: tablas.map(t => t.tabla)
        });
    } catch (error) {
        console.error('Error al obtener tablas:', error);
        res.status(500).json({
            message: 'Error al obtener tablas',
            error: error.message
        });
    }
};

/**
 * Exportar registros a Excel
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const exportarExcel = async (req, res) => {
    try {
        const {
            id_usuario,
            accion,
            tabla,
            fecha_inicio,
            fecha_fin
        } = req.query;

        // Construir filtros
        const where = {};
        if (id_usuario) where.id_usuario = id_usuario;
        if (accion) where.accion = accion;
        if (tabla) where.tabla = tabla;
        if (fecha_inicio || fecha_fin) {
            where.fecha_hora = {};
            if (fecha_inicio) where.fecha_hora[Op.gte] = new Date(fecha_inicio);
            if (fecha_fin) where.fecha_hora[Op.lte] = new Date(fecha_fin);
        }

        // Obtener registros
        const registros = await Auditoria.findAll({
            where,
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['nombre_usuario']
            }],
            order: [['fecha_hora', 'DESC']],
            limit: 10000 // Límite de seguridad
        });

        // Crear libro de Excel
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Auditoría');

        // Definir columnas
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Fecha y Hora', key: 'fecha_hora', width: 20 },
            { header: 'Usuario', key: 'usuario', width: 20 },
            { header: 'Acción', key: 'accion', width: 15 },
            { header: 'Tabla', key: 'tabla', width: 20 },
            { header: 'Descripción', key: 'descripcion', width: 40 },
            { header: 'IP', key: 'ip', width: 15 }
        ];

        // Agregar datos
        registros.forEach(registro => {
            worksheet.addRow({
                id: registro.id_auditoria,
                fecha_hora: registro.fecha_hora,
                usuario: registro.usuario?.nombre_usuario || 'N/A',
                accion: registro.accion,
                tabla: registro.tabla,
                descripcion: registro.descripcion || '',
                ip: registro.ip || ''
            });
        });

        // Estilo del encabezado
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
        };
        worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };

        // Configurar respuesta
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=auditoria_${new Date().toISOString().split('T')[0]}.xlsx`
        );

        // Enviar archivo
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error al exportar a Excel:', error);
        res.status(500).json({
            message: 'Error al exportar a Excel',
            error: error.message
        });
    }
};

/**
 * Exportar registros a PDF
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const exportarPDF = async (req, res) => {
    try {
        const {
            id_usuario,
            accion,
            tabla,
            fecha_inicio,
            fecha_fin
        } = req.query;

        // Construir filtros
        const where = {};
        if (id_usuario) where.id_usuario = id_usuario;
        if (accion) where.accion = accion;
        if (tabla) where.tabla = tabla;
        if (fecha_inicio || fecha_fin) {
            where.fecha_hora = {};
            if (fecha_inicio) where.fecha_hora[Op.gte] = new Date(fecha_inicio);
            if (fecha_fin) where.fecha_hora[Op.lte] = new Date(fecha_fin);
        }

        // Obtener registros
        const registros = await Auditoria.findAll({
            where,
            include: [{
                model: Usuario,
                as: 'usuario',
                attributes: ['nombre_usuario']
            }],
            order: [['fecha_hora', 'DESC']],
            limit: 1000 // Límite de seguridad para PDF
        });

        // Crear documento PDF
        const doc = new PDFDocument({ margin: 50 });

        // Configurar respuesta
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=auditoria_${new Date().toISOString().split('T')[0]}.pdf`
        );

        // Pipe del documento a la respuesta
        doc.pipe(res);

        // Título
        doc.fontSize(20).text('Reporte de Auditoría', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generado: ${new Date().toLocaleString('es-MX')}`, { align: 'center' });
        doc.moveDown(2);

        // Información de filtros
        if (fecha_inicio || fecha_fin || id_usuario || accion || tabla) {
            doc.fontSize(14).text('Filtros Aplicados:', { underline: true });
            doc.fontSize(10);
            if (fecha_inicio) doc.text(`Fecha Inicio: ${fecha_inicio}`);
            if (fecha_fin) doc.text(`Fecha Fin: ${fecha_fin}`);
            if (id_usuario) doc.text(`Usuario ID: ${id_usuario}`);
            if (accion) doc.text(`Acción: ${accion}`);
            if (tabla) doc.text(`Tabla: ${tabla}`);
            doc.moveDown();
        }

        // Resumen
        doc.fontSize(14).text('Resumen:', { underline: true });
        doc.fontSize(10).text(`Total de registros: ${registros.length}`);
        doc.moveDown(2);

        // Registros
        doc.fontSize(14).text('Registros:', { underline: true });
        doc.moveDown();

        registros.forEach((registro, index) => {
            if (doc.y > 700) {
                doc.addPage();
            }

            doc.fontSize(10);
            doc.text(`${index + 1}. ${registro.fecha_hora.toLocaleString('es-MX')}`, { continued: true });
            doc.text(` - ${registro.usuario?.nombre_usuario || 'N/A'}`, { continued: true });
            doc.text(` - ${registro.accion}`);
            doc.fontSize(9);
            doc.text(`   Tabla: ${registro.tabla}`);
            if (registro.descripcion) {
                doc.text(`   Descripción: ${registro.descripcion}`);
            }
            doc.moveDown(0.5);
        });

        // Finalizar documento
        doc.end();
    } catch (error) {
        console.error('Error al exportar a PDF:', error);
        res.status(500).json({
            message: 'Error al exportar a PDF',
            error: error.message
        });
    }
};

module.exports = {
    registrarAuditoria,
    getRegistrosAuditoria,
    getRegistroAuditoria,
    getEstadisticas,
    getTablas,
    exportarExcel,
    exportarPDF
};
