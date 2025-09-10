const { models, sequelize } = require('../models');
const { Op } = require('sequelize');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

/**
 * Controlador de reportes con datos reales de la base de datos
 * Actualizado con funcionalidades de exportación personalizables
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
        if (categoria) whereClause.tipo_suministro = categoria;
        
        if (fecha_inicio && fecha_fin) {
            whereClause.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
        } else if (fecha_inicio) {
            whereClause.fecha = { [Op.gte]: fecha_inicio };
        } else if (fecha_fin) {
            whereClause.fecha = { [Op.lte]: fecha_fin };
        }

        // 1. Consumo por proyecto/obra - Datos reales desde la base de datos
        const consumoPorProyectoRaw = await sequelize.query(`
            SELECT 
                s.id_proyecto,
                p.nombre as nombre_proyecto,
                p.ubicacion,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN s.costo_total IS NOT NULL AND s.costo_total != '' 
                    THEN CAST(s.costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(s.precio_unitario AS DECIMAL(10,2)) * CAST(s.cantidad AS DECIMAL(10,2))
                END) as total_costo,
                COUNT(s.id_suministro) as total_registros
            FROM suministros s
            LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
            WHERE 1=1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY s.id_proyecto, p.nombre, p.ubicacion
            ORDER BY total_costo DESC
            LIMIT 10
        `, { type: sequelize.QueryTypes.SELECT });
        
        const consumoPorProyecto = consumoPorProyectoRaw;

        // 2. Distribución por proveedores activos - Datos reales desde la base de datos
        const distribucionProveedoresRaw = await sequelize.query(`
            SELECT 
                s.id_proveedor,
                pr.nombre as nombre_proveedor,
                pr.tipo_proveedor,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN s.costo_total IS NOT NULL AND s.costo_total != '' 
                    THEN CAST(s.costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(s.precio_unitario AS DECIMAL(10,2)) * CAST(s.cantidad AS DECIMAL(10,2))
                END) as total_costo,
                COUNT(s.id_suministro) as total_entregas
            FROM suministros s
            LEFT JOIN proveedores pr ON s.id_proveedor = pr.id_proveedor
            WHERE pr.activo = 1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY s.id_proveedor, pr.nombre, pr.tipo_proveedor
            ORDER BY total_costo DESC
            LIMIT 10
        `, { type: sequelize.QueryTypes.SELECT });
        
        const distribucionProveedores = distribucionProveedoresRaw;

        // 3. Tipos de materiales más utilizados - Datos reales desde la base de datos
        const tiposMaterialesRaw = await sequelize.query(`
            SELECT 
                s.tipo_suministro as categoria,
                s.nombre as descripcion,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN s.costo_total IS NOT NULL AND s.costo_total != '' 
                    THEN CAST(s.costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(s.precio_unitario AS DECIMAL(10,2)) * CAST(s.cantidad AS DECIMAL(10,2))
                END) as total_costo,
                COUNT(s.id_suministro) as frecuencia_uso
            FROM suministros s
            WHERE 1=1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY s.tipo_suministro, s.nombre
            ORDER BY frecuencia_uso DESC, total_costo DESC
            LIMIT 15
        `, { type: sequelize.QueryTypes.SELECT });
        
        const tiposMateriales = tiposMaterialesRaw;

        // 4. Consumo por meses (últimos 6 meses) - Datos reales desde la base de datos
        const consumoMensualRaw = await sequelize.query(`
            SELECT 
                DATE_FORMAT(s.fecha, '%Y-%m') as mes,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN s.costo_total IS NOT NULL AND s.costo_total != '' 
                    THEN CAST(s.costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(s.precio_unitario AS DECIMAL(10,2)) * CAST(s.cantidad AS DECIMAL(10,2))
                END) as total_costo,
                COUNT(s.id_suministro) as total_entregas
            FROM suministros s
            WHERE s.fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY DATE_FORMAT(s.fecha, '%Y-%m')
            ORDER BY mes ASC
        `, { type: sequelize.QueryTypes.SELECT });
        
        const consumoMensual = consumoMensualRaw;

        // 5. Estadísticas generales - Datos reales desde la base de datos
        const estadisticasRaw = await sequelize.query(`
            SELECT 
                COUNT(*) as total_registros,
                COUNT(DISTINCT id_proveedor) as total_proveedores,
                COUNT(DISTINCT id_proyecto) as total_obras,
                SUM(CAST(cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN costo_total IS NOT NULL AND costo_total != '' 
                    THEN CAST(costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(precio_unitario AS DECIMAL(10,2)) * CAST(cantidad AS DECIMAL(10,2))
                END) as total_gastado
            FROM suministros s
            WHERE 1=1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
        `, { type: sequelize.QueryTypes.SELECT });
        
        const estadisticas = estadisticasRaw[0];
        const totalRegistros = estadisticas.total_registros || 0;
        const totalProveedores = estadisticas.total_proveedores || 0;
        const totalObras = estadisticas.total_obras || 0;
        const totalCantidad = estadisticas.total_cantidad || 0;
        const totalGastado = estadisticas.total_gastado || 0;

        // 6. Proveedores más eficientes - Datos reales desde la base de datos
        const proveedoresEficientesRaw = await sequelize.query(`
            SELECT 
                s.id_proveedor,
                pr.nombre as nombre_proveedor,
                pr.contacto_principal as contacto,
                AVG(CAST(s.precio_unitario AS DECIMAL(10,2))) as costo_promedio,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                COUNT(s.id_suministro) as total_entregas
            FROM suministros s
            LEFT JOIN proveedores pr ON s.id_proveedor = pr.id_proveedor
            WHERE pr.activo = 1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY s.id_proveedor, pr.nombre, pr.contacto_principal
            HAVING COUNT(s.id_suministro) >= 3
            ORDER BY costo_promedio ASC
            LIMIT 8
        `, { type: sequelize.QueryTypes.SELECT });
        
        const proveedoresEficientes = proveedoresEficientesRaw;

        // 7. Análisis de categorías - Datos reales desde la base de datos
        const analisisCategoriasRaw = await sequelize.query(`
            SELECT 
                s.tipo_suministro as categoria,
                COUNT(s.id_suministro) as total_registros,
                SUM(CAST(s.cantidad AS DECIMAL(10,2))) as total_cantidad,
                SUM(CASE 
                    WHEN s.costo_total IS NOT NULL AND s.costo_total != '' 
                    THEN CAST(s.costo_total AS DECIMAL(10,2)) 
                    ELSE CAST(s.precio_unitario AS DECIMAL(10,2)) * CAST(s.cantidad AS DECIMAL(10,2))
                END) as total_costo,
                AVG(CAST(s.precio_unitario AS DECIMAL(10,2))) as costo_promedio
            FROM suministros s
            WHERE 1=1
            ${id_proyecto ? `AND s.id_proyecto = ${id_proyecto}` : ''}
            ${id_proveedor ? `AND s.id_proveedor = ${id_proveedor}` : ''}
            ${categoria ? `AND s.tipo_suministro = '${categoria}'` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY s.tipo_suministro
            ORDER BY total_costo DESC
        `, { type: sequelize.QueryTypes.SELECT });
        
        const analisisCategorias = analisisCategoriasRaw;

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
            consumoPorObra: consumoPorProyecto.map(item => ({
                obra: item.nombre_proyecto || 'Sin proyecto',
                ubicacion: item.ubicacion || 'N/A',
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_costo: parseFloat(item.total_costo) || 0,
                total_registros: parseInt(item.total_registros) || 0
            })),
            distribicionProveedores: distribucionProveedores.map(item => ({
                proveedor: item.nombre_proveedor || 'Sin proveedor',
                tipo: item.tipo_proveedor || 'N/A',
                total_entregas: parseInt(item.total_entregas) || 0,
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_costo: parseFloat(item.total_costo) || 0
            })),
            tiposMateriales: tiposMateriales.map(item => ({
                categoria: item.categoria || 'Sin categoría',
                descripcion: item.descripcion || 'Sin descripción',
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_costo: parseFloat(item.total_costo) || 0,
                frecuencia_uso: parseInt(item.frecuencia_uso) || 0
            })),
            consumoMensual: consumoMensual.map(item => ({
                mes: item.mes,
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_costo: parseFloat(item.total_costo) || 0,
                total_entregas: parseInt(item.total_entregas) || 0
            })),
            proveedoresEficientes: proveedoresEficientes.map(item => ({
                proveedor: item.nombre_proveedor || 'Sin proveedor',
                contacto: item.contacto || 'N/A',
                costo_promedio: parseFloat(item.costo_promedio) || 0,
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_entregas: parseInt(item.total_entregas) || 0
            })),
            analisisCategorias: analisisCategorias.map(item => ({
                categoria: item.categoria || 'Sin categoría',
                total_registros: parseInt(item.total_registros) || 0,
                total_cantidad: parseFloat(item.total_cantidad) || 0,
                total_costo: parseFloat(item.total_costo) || 0,
                costo_promedio: parseFloat(item.costo_promedio) || 0
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
 * Exportar dashboard personalizado a PDF
 */
const exportDashboardCustomToPDF = async (req, res) => {
    try {
        console.log('Recibiendo datos para PDF personalizado:', JSON.stringify(req.body, null, 2));
        
        const data = req.body;
        
        // Crear documento PDF en formato horizontal
        const doc = new PDFDocument({ 
            size: 'A4', 
            layout: 'landscape', // Formato horizontal
            margins: { top: 40, bottom: 40, left: 40, right: 40 }
        });
        
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        
        // Configuración de colores
        const colors = {
            primary: '#1f2937',
            secondary: '#6b7280',
            accent: '#3b82f6',
            success: '#10b981',
            warning: '#f59e0b',
            danger: '#ef4444'
        };

        // Header del documento
        doc.fontSize(24)
           .fillColor(colors.primary)
           .text(data.title || 'Reporte de Suministros y Materiales', 40, 40);
           
        if (data.subtitle) {
            doc.fontSize(14)
               .fillColor(colors.secondary)
               .text(data.subtitle, 40, 75);
        }

        // Fecha de generación
        doc.fontSize(10)
           .fillColor(colors.secondary)
           .text(`Generado el: ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`, 40, 100);

        let currentY = 130;

        // Información de filtros aplicados
        if (data.filters && Object.keys(data.filters).some(key => data.filters[key])) {
            doc.fontSize(14)
               .fillColor(colors.primary)
               .text('Filtros Aplicados:', 40, currentY);
            currentY += 25;

            doc.fontSize(10)
               .fillColor(colors.secondary);

            const filtros = data.filters;
            if (filtros.fechaInicio || filtros.fechaFin) {
                doc.text(`Período: ${filtros.fechaInicio || 'Sin fecha inicial'} - ${filtros.fechaFin || 'Sin fecha final'}`, 60, currentY);
                currentY += 15;
            }
            if (filtros.proyecto) {
                doc.text(`Proyecto: ${filtros.proyecto}`, 60, currentY);
                currentY += 15;
            }
            if (filtros.proveedor) {
                doc.text(`Proveedor: ${filtros.proveedor}`, 60, currentY);
                currentY += 15;
            }
            if (filtros.busqueda) {
                doc.text(`Búsqueda: ${filtros.busqueda}`, 60, currentY);
                currentY += 15;
            }
            currentY += 20;
        }

        // Estadísticas generales
        if (data.includeStatistics && data.statistics) {
            doc.fontSize(16)
               .fillColor(colors.primary)
               .text('Estadísticas Generales', 40, currentY);
            currentY += 30;

            const stats = data.statistics;
            
            // Crear dos columnas para las estadísticas
            const col1X = 60;
            const col2X = 400;
            const startY = currentY;

            // Columna 1
            doc.fontSize(11)
               .fillColor(colors.secondary)
               .text('Total de Registros:', col1X, currentY)
               .fillColor(colors.primary)
               .text(stats.total?.toLocaleString() || '0', col1X + 120, currentY);
            currentY += 20;

            doc.fillColor(colors.secondary)
               .text('Valor Total:', col1X, currentY)
               .fillColor(colors.primary)
               .text(`$${stats.totalValue?.toLocaleString() || '0'}`, col1X + 120, currentY);
            currentY += 20;

            doc.fillColor(colors.secondary)
               .text('Stock Bajo:', col1X, currentY)
               .fillColor(colors.primary)
               .text(stats.lowStock?.toString() || '0', col1X + 120, currentY);

            // Columna 2
            currentY = startY;
            doc.fillColor(colors.secondary)
               .text('Valores Altos:', col2X, currentY)
               .fillColor(colors.primary)
               .text(stats.highValue?.toString() || '0', col2X + 120, currentY);
            currentY += 20;

            // Categorías
            if (stats.byCategory && Object.keys(stats.byCategory).length > 0) {
                currentY = startY + 60;
                doc.fontSize(12)
                   .fillColor(colors.primary)
                   .text('Por Categorías:', 60, currentY);
                currentY += 20;

                Object.entries(stats.byCategory).forEach(([categoria, cantidad]) => {
                    doc.fontSize(10)
                       .fillColor(colors.secondary)
                       .text(`• ${categoria}:`, 80, currentY)
                       .fillColor(colors.primary)
                       .text(cantidad.toString(), 200, currentY);
                    currentY += 15;
                });
            }

            currentY += 30;
        }

        // Tabla de datos
        if (data.includeTable && data.data && data.data.length > 0) {
            // Verificar si hay espacio suficiente, si no, nueva página
            if (currentY > 400) {
                doc.addPage();
                currentY = 40;
            }

            doc.fontSize(16)
               .fillColor(colors.primary)
               .text('Tabla de Suministros', 40, currentY);
            currentY += 30;

            // Headers de la tabla
            const tableHeaders = data.tableFormat === 'enumerated' 
                ? ['#', 'Descripción', 'Cantidad', 'Precio Unit.', 'Total', 'Proyecto', 'Proveedor']
                : ['ID', 'Descripción', 'Cantidad', 'Precio Unit.', 'Total', 'Proyecto', 'Proveedor'];
            
            const colWidths = [30, 150, 60, 80, 80, 120, 120];
            const tableStartX = 40;
            let tableX = tableStartX;

            // Dibujar headers
            doc.fontSize(10)
               .fillColor(colors.primary);
            tableHeaders.forEach((header, i) => {
                doc.rect(tableX, currentY, colWidths[i], 20)
                   .fillAndStroke('#f3f4f6', '#d1d5db')
                   .fillColor(colors.primary)
                   .text(header, tableX + 5, currentY + 5, { width: colWidths[i] - 10 });
                tableX += colWidths[i];
            });
            currentY += 20;

            // Datos de la tabla (limitados por espacio)
            const maxRows = Math.min(data.data.length, 15); // Limitar filas para que quepa
            for (let i = 0; i < maxRows; i++) {
                const row = data.data[i];
                tableX = tableStartX;
                
                const rowData = [
                    data.tableFormat === 'enumerated' ? (i + 1).toString() : row.id_suministro?.toString() || '',
                    row.descripcion || '',
                    row.cantidad?.toString() || '',
                    `$${parseFloat(row.precio_unitario || 0).toFixed(2)}`,
                    `$${(parseFloat(row.precio_unitario || 0) * parseFloat(row.cantidad || 0)).toFixed(2)}`,
                    row.proyecto || '',
                    row.proveedor || ''
                ];

                doc.fontSize(8)
                   .fillColor(colors.secondary);
                
                rowData.forEach((cellData, j) => {
                    doc.rect(tableX, currentY, colWidths[j], 15)
                       .stroke('#d1d5db')
                       .text(cellData, tableX + 3, currentY + 3, { 
                           width: colWidths[j] - 6, 
                           height: 12,
                           ellipsis: true
                       });
                    tableX += colWidths[j];
                });
                currentY += 15;

                // Nueva página si es necesario
                if (currentY > 520) {
                    doc.addPage();
                    currentY = 40;
                }
            }

            if (data.data.length > maxRows) {
                currentY += 10;
                doc.fontSize(10)
                   .fillColor(colors.secondary)
                   .text(`... y ${data.data.length - maxRows} registros más`, tableStartX, currentY);
            }
        }

        // Gráficos (información textual)
        if (data.includeCharts && data.charts) {
            if (currentY > 450) {
                doc.addPage();
                currentY = 40;
            }

            doc.fontSize(16)
               .fillColor(colors.primary)
               .text('Gráficos Incluidos', 40, currentY);
            currentY += 30;

            const selectedCharts = Object.entries(data.charts)
                .filter(([key, value]) => value === true)
                .map(([key]) => key);

            if (selectedCharts.length > 0) {
                doc.fontSize(11)
                   .fillColor(colors.secondary)
                   .text('Los siguientes gráficos están incluidos en este reporte:', 60, currentY);
                currentY += 25;

                selectedCharts.forEach((chart) => {
                    const chartNames = {
                        gastosPorMes: 'Gastos por Mes',
                        valorPorCategoria: 'Valor por Categoría',
                        suministrosPorMes: 'Cantidad por Mes',
                        gastosPorProyecto: 'Gastos por Proyecto',
                        gastosPorProveedor: 'Gastos por Proveedor',
                        cantidadPorEstado: 'Cantidad por Estado',
                        distribucionTipos: 'Distribución de Tipos',
                        tendenciaEntregas: 'Tendencia de Entregas',
                        codigosProducto: 'Códigos de Producto',
                        analisisTecnicoConcreto: 'Análisis Técnico',
                        concretoDetallado: 'Concreto Detallado',
                        totalM3Concreto: 'Total m³ (Concreto)',
                        distribucionPorUnidades: 'Distribución por Unidades',
                        horasPorMes: 'Horas por Mes',
                        horasPorProyecto: 'Horas por Proyecto',
                        topEquiposPorHoras: 'Top Equipos por Horas',
                        horasVsCosto: 'Horas vs Costo'
                    };

                    doc.fontSize(10)
                       .fillColor(colors.primary)
                       .text(`• ${chartNames[chart] || chart}`, 80, currentY);
                    currentY += 15;
                });
            }
        }

        // Footer
        doc.fontSize(8)
           .fillColor(colors.secondary)
           .text(`Página generada por Sistema de Gestión VLock - ${new Date().toISOString()}`, 40, 560);

        doc.end();

        return new Promise((resolve, reject) => {
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                console.log('PDF generado exitosamente, tamaño:', pdfBuffer.length);
                
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', 'attachment; filename=reporte-suministros.pdf');
                res.setHeader('Content-Length', pdfBuffer.length);
                
                resolve(res.end(pdfBuffer));
            });
            
            doc.on('error', (error) => {
                console.error('Error generando PDF:', error);
                reject(error);
            });
        });

    } catch (error) {
        console.error('Error generando reporte PDF personalizado:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor', 
            details: error.message 
        });
    }
};

module.exports = {
    getDashboardSuministros,
    exportDashboardCustomToPDF
};
