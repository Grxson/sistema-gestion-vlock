const models = require('../models');
const Auditoria = models.Auditoria;
const Usuario = models.Usuarios;
const { Op } = require('sequelize');

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

module.exports = {
    registrarAuditoria,
    getRegistrosAuditoria,
    getRegistroAuditoria
};
