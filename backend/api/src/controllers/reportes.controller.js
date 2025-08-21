const models = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/db');

/**
 * Obtener datos para dashboard de suministros
 */
const getDashboardSuministros = async (req, res) => {
    try {
        const { fecha_inicio, fecha_fin, id_proyecto } = req.query;
        
        // Por ahora devolvemos datos de ejemplo para demostrar las gráficas
        // Cuando tengamos datos reales de suministros, este endpoint consultará la base de datos
        
        // 1. Consumo por obra (gráfica de barras)
        const consumoPorObra = [
            { obra: 'Flex Park', total_cantidad: 450.5, total_entregas: 25 },
            { obra: 'Residencial Norte', total_cantidad: 320.0, total_entregas: 18 },
            { obra: 'Centro Comercial Plaza', total_cantidad: 180.0, total_entregas: 12 }
        ];

        // 2. Consumo mensual (gráfica de líneas)
        const consumoMensual = [
            { mes: '2025-07', obra: 'Flex Park', total_cantidad: 120.0 },
            { mes: '2025-08', obra: 'Flex Park', total_cantidad: 180.5 },
            { mes: '2025-07', obra: 'Residencial Norte', total_cantidad: 80.0 },
            { mes: '2025-08', obra: 'Residencial Norte', total_cantidad: 110.0 }
        ];

        // 3. Distribución por proveedores (gráfica de dona)
        const distribicionProveedores = [
            { proveedor: 'PADILLAS', total_entregas: 35, total_cantidad: 420.0 },
            { proveedor: 'CEMEX', total_entregas: 15, total_cantidad: 280.0 },
            { proveedor: 'OTROS', total_entregas: 5, total_cantidad: 150.0 }
        ];

        // 4. Tipos de materiales más utilizados
        const tiposMateriales = [
            { descripcion: 'Retroexcavadora 415F', frecuencia: 25, total_cantidad: 25.0 },
            { descripcion: 'Grava 1 1/2', frecuencia: 8, total_cantidad: 240.0 },
            { descripcion: 'Tepetate', frecuencia: 12, total_cantidad: 420.0 },
            { descripcion: 'Grava 1/2', frecuencia: 4, total_cantidad: 67.0 },
            { descripcion: 'Grava 3/4', frecuencia: 3, total_cantidad: 10.0 }
        ];

        // 5. Estadísticas generales
        const estadisticasGenerales = {
            total_registros: 55,
            total_cantidad: 950.5,
            total_proveedores: 3,
            total_obras: 3
        };

        res.json({
            success: true,
            data: {
                consumoPorObra,
                consumoMensual,
                distribicionProveedores,
                tiposMateriales,
                estadisticasGenerales
            }
        });

    } catch (error) {
        console.error('Error al generar dashboard de suministros:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar dashboard de suministros',
            error: error.message
        });
    }
};

/**
 * Obtener reporte comparativo entre obras
 */
const getReporteComparativo = async (req, res) => {
    try {
        const { obras, fecha_inicio, fecha_fin } = req.body;
        
        // Por ahora devolvemos datos de ejemplo
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
            },
            {
                obra: 'Residencial Norte',
                descripcion: 'Retroexcavadora 415F',
                total_cantidad: 20.0,
                total_entregas: 12,
                promedio_entrega: 1.67
            },
            {
                obra: 'Residencial Norte',
                descripcion: 'Tepetate',
                total_cantidad: 180.0,
                total_entregas: 6,
                promedio_entrega: 30.0
            }
        ];

        res.json({
            success: true,
            data: comparativo
        });

    } catch (error) {
        console.error('Error al generar reporte comparativo:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte comparativo',
            error: error.message
        });
    }
};

module.exports = {
    getDashboardSuministros,
    getReporteComparativo
};
