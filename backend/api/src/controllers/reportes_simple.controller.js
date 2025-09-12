const { models, sequelize } = require('../models');
const { Op } = require('sequelize');

/**
 * Controlador de reportes con datos reales de la base de datos
 */

/**
 * Obtener dashboard completo de suministros con datos reales
 */
const getDashboardSuministros = async (req, res) => {
    try {
        console.log('Generando dashboard de suministros con datos reales...');
        
        const { fecha_inicio, fecha_fin, id_proyecto, id_proveedor, categoria } = req.query;
        
        // Construcción de la cláusula WHERE dinámica
        const whereClause = {};
        
        if (id_proyecto) whereClause.id_proyecto = id_proyecto;
        if (id_proveedor) whereClause.id_proveedor = id_proveedor;
        if (categoria) whereClause.categoria = categoria;
        
        if (fecha_inicio && fecha_fin) {
            whereClause.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
        } else if (fecha_inicio) {
            whereClause.fecha = { [Op.gte]: fecha_inicio };
        } else if (fecha_fin) {
            whereClause.fecha = { [Op.lte]: fecha_fin };
        }

        // 1. Consumo por proyecto/obra
        const consumoPorProyecto = await models.Suministros.findAll({
            where: whereClause,
            include: [
                { 
                    model: models.Proyectos, 
                    as: 'proyecto', 
                    attributes: ['nombre', 'ubicacion'] 
                }
            ],
            attributes: [
                'id_proyecto',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'total_costo'],
                [sequelize.fn('COUNT', sequelize.col('Suministros.id_suministro')), 'total_registros']
            ],
            group: ['id_proyecto', 'proyecto.id_proyecto'],
            order: [[sequelize.fn('SUM', sequelize.col('costo_total')), 'DESC']],
            limit: 10
        });

        // 2. Distribución por proveedores activos
        const distribucionProveedores = await models.Suministros.findAll({
            where: whereClause,
            include: [
                { 
                    model: models.Proveedores, 
                    as: 'proveedor', 
                    attributes: ['nombre', 'tipo_proveedor'],
                    where: { activo: true }
                }
            ],
            attributes: [
                'id_proveedor',
                [sequelize.fn('COUNT', sequelize.col('Suministros.id_suministro')), 'total_entregas'],
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'total_costo']
            ],
            group: ['id_proveedor', 'proveedor.id_proveedor'],
            order: [[sequelize.fn('SUM', sequelize.col('costo_total')), 'DESC']],
            limit: 10
        });

        // 3. Tipos de materiales más utilizados
        const tiposMateriales = await models.Suministros.findAll({
            where: whereClause,
            attributes: [
                'categoria',
                'descripcion',
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'total_costo'],
                [sequelize.fn('COUNT', sequelize.col('id_suministro')), 'frecuencia_uso']
            ],
            group: ['categoria', 'descripcion'],
            order: [
                [sequelize.fn('COUNT', sequelize.col('id_suministro')), 'DESC'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'DESC']
            ],
            limit: 15
        });

        // 4. Consumo por meses (últimos 6 meses)
        const consumoMensual = await models.Suministros.findAll({
            where: {
                ...whereClause,
                fecha: {
                    [Op.gte]: sequelize.literal("DATE_SUB(CURDATE(), INTERVAL 6 MONTH)")
                }
            },
            attributes: [
                [sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'mes'],
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'total_costo'],
                [sequelize.fn('COUNT', sequelize.col('id_suministro')), 'total_entregas']
            ],
            group: [sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m')],
            order: [[sequelize.fn('DATE_FORMAT', sequelize.col('fecha'), '%Y-%m'), 'ASC']]
        });

        // 5. Estadísticas generales
        const totalRegistros = await models.Suministros.count({ where: whereClause });
        
        const totalProveedores = await models.Suministros.count({
            where: whereClause,
            distinct: true,
            col: 'id_proveedor'
        });

        const totalObras = await models.Suministros.count({
            where: whereClause,
            distinct: true,
            col: 'id_proyecto'
        });

        const totalCantidadResult = await models.Suministros.sum('cantidad', {
            where: whereClause
        });

        const totalCostoResult = await models.Suministros.sum('costo_total', {
            where: whereClause
        });

        const totalCantidad = totalCantidadResult || 0;
        const totalGastado = totalCostoResult || 0;

        // 6. Proveedores más eficientes (mejor relación costo/cantidad)
        const proveedoresEficientes = await models.Suministros.findAll({
            where: whereClause,
            include: [
                { 
                    model: models.Proveedores, 
                    as: 'proveedor', 
                    attributes: ['nombre', 'contacto'],
                    where: { activo: true }
                }
            ],
            attributes: [
                'id_proveedor',
                [sequelize.fn('AVG', sequelize.col('costo_unitario')), 'costo_promedio'],
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('COUNT', sequelize.col('Suministros.id_suministro')), 'total_entregas']
            ],
            group: ['id_proveedor', 'proveedor.id_proveedor'],
            having: sequelize.where(sequelize.fn('COUNT', sequelize.col('Suministros.id_suministro')), '>=', 5),
            order: [[sequelize.fn('AVG', sequelize.col('costo_unitario')), 'ASC']],
            limit: 8
        });

        // 7. Análisis de categorías
        const analisisCategorias = await models.Suministros.findAll({
            where: whereClause,
            attributes: [
                'categoria',
                [sequelize.fn('COUNT', sequelize.col('id_suministro')), 'total_registros'],
                [sequelize.fn('SUM', sequelize.col('cantidad')), 'total_cantidad'],
                [sequelize.fn('SUM', sequelize.col('costo_total')), 'total_costo'],
                [sequelize.fn('AVG', sequelize.col('costo_unitario')), 'costo_promedio']
            ],
            group: ['categoria'],
            order: [[sequelize.fn('SUM', sequelize.col('costo_total')), 'DESC']]
        });

        // Preparar datos para el dashboard
        const estadisticasGenerales = {
            total_registros: totalRegistros,
            total_cantidad: Math.round(totalCantidad * 100) / 100,
            total_gastado: Math.round(totalGastado * 100) / 100,
            total_proveedores: totalProveedores,
            total_obras: totalObras,
            promedio_por_entrega: totalRegistros > 0 ? Math.round((totalGastado / totalRegistros) * 100) / 100 : 0
        };

        const dashboardData = {
            consumoPorProyecto: consumoPorProyecto.map(item => ({
                proyecto: item.proyecto ? item.proyecto.nombre : 'Sin proyecto',
                ubicacion: item.proyecto ? item.proyecto.ubicacion : 'N/A',
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_costo: parseFloat(item.dataValues.total_costo) || 0,
                total_registros: parseInt(item.dataValues.total_registros) || 0
            })),
            distribucionProveedores: distribucionProveedores.map(item => ({
                proveedor: item.proveedor ? item.proveedor.nombre : 'Sin proveedor',
                tipo: item.proveedor ? item.proveedor.tipo_proveedor : 'N/A',
                total_entregas: parseInt(item.dataValues.total_entregas) || 0,
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_costo: parseFloat(item.dataValues.total_costo) || 0
            })),
            tiposMateriales: tiposMateriales.map(item => ({
                categoria: item.categoria || 'Sin categoría',
                descripcion: item.descripcion || 'Sin descripción',
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_costo: parseFloat(item.dataValues.total_costo) || 0,
                frecuencia_uso: parseInt(item.dataValues.frecuencia_uso) || 0
            })),
            consumoMensual: consumoMensual.map(item => ({
                mes: item.dataValues.mes,
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_costo: parseFloat(item.dataValues.total_costo) || 0,
                total_entregas: parseInt(item.dataValues.total_entregas) || 0
            })),
            proveedoresEficientes: proveedoresEficientes.map(item => ({
                proveedor: item.proveedor ? item.proveedor.nombre : 'Sin proveedor',
                contacto: item.proveedor ? item.proveedor.contacto : 'N/A',
                costo_promedio: parseFloat(item.dataValues.costo_promedio) || 0,
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_entregas: parseInt(item.dataValues.total_entregas) || 0
            })),
            analisisCategorias: analisisCategorias.map(item => ({
                categoria: item.categoria || 'Sin categoría',
                total_registros: parseInt(item.dataValues.total_registros) || 0,
                total_cantidad: parseFloat(item.dataValues.total_cantidad) || 0,
                total_costo: parseFloat(item.dataValues.total_costo) || 0,
                costo_promedio: parseFloat(item.dataValues.costo_promedio) || 0
            })),
            estadisticasGenerales,
            filtros: {
                fecha_inicio,
                fecha_fin,
                id_proyecto,
                id_proveedor,
                categoria
            },
            generado_en: new Date().toISOString()
        };

        res.json({
            success: true,
            data: dashboardData,
            message: `Dashboard generado con ${totalRegistros} registros de suministros`
        });

    } catch (error) {
        console.error('Error generando dashboard de suministros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

/**
 * Exportar dashboard de suministros a PDF (placeholder)
 */
const exportDashboardToPDF = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: 'Funcionalidad de exportación PDF en desarrollo',
            note: 'Se implementará en próxima versión'
        });
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte PDF',
            error: error.message
        });
    }
};

/**
 * Exportar dashboard de suministros a Excel (placeholder)
 */
const exportDashboardToExcel = async (req, res) => {
    try {
        res.json({ 
            success: true, 
            message: 'Funcionalidad de exportación Excel en desarrollo',
            note: 'Se implementará en próxima versión'
        });
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte Excel',
            error: error.message
        });
    }
};

/**
 * Obtener reporte comparativo entre obras (funcionalidad legacy)
 */
const getReporteComparativo = async (req, res) => {
    try {
        const { obras, fecha_inicio, fecha_fin } = req.body;
        
        // Por ahora devolvemos datos de ejemplo para mantener compatibilidad
        const comparativo = [
            {
                obra: 'Flex Park',
                descripcion: 'Retroexcavadora 415F',
                total_cantidad: 25.0,
                total_entregas: 15,
                promedio_entrega: 1.67
            },
            {
                obra: 'Flex Park',
                descripcion: 'Grava 1 1/2',
                total_cantidad: 240.0,
                total_entregas: 8,
                promedio_entrega: 30.0
            }
        ];

        res.json({
            success: true,
            data: comparativo
        });
        
    } catch (error) {
        console.error('Error en reporte comparativo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte comparativo',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardSuministros,
    exportDashboardToPDF,
    exportDashboardToExcel,
    getReporteComparativo
};
