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
        
        const requestData = req.body;
        
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
           .text(requestData.title || 'Reporte de Suministros y Materiales', 40, 40);
           
        if (requestData.subtitle) {
            doc.fontSize(14)
               .fillColor(colors.secondary)
               .text(requestData.subtitle, 40, 75);
        }

        // Fecha de generación
        doc.fontSize(10)
           .fillColor(colors.secondary)
           .text(`Generado el: ${new Date().toLocaleDateString('es-MX')} a las ${new Date().toLocaleTimeString('es-MX')}`, 40, 100);

        let currentY = 130;

        // Información de filtros aplicados
        if (requestData.filters && Object.keys(requestData.filters).some(key => requestData.filters[key])) {
            doc.fontSize(14)
               .fillColor(colors.primary)
               .text('Filtros Aplicados:', 40, currentY);
            currentY += 25;

            doc.fontSize(10)
               .fillColor(colors.secondary);

            const filtros = requestData.filters;
            if (filtros.busqueda) {
                doc.text(`Búsqueda: ${filtros.busqueda}`, 60, currentY);
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
            if (filtros.estado) {
                doc.text(`Estado: ${filtros.estado}`, 60, currentY);
                currentY += 15;
            }
            currentY += 20;
        }

        // Estadísticas generales
        if (requestData.statistics) {
            // Verificar si hay espacio suficiente, si no, nueva página
            if (currentY > 400) {
                doc.addPage();
                currentY = 40;
            }

            doc.fontSize(16)
               .fillColor(colors.primary)
               .text('Estadísticas Generales', 40, currentY);
            currentY += 30;

            const stats = requestData.statistics;
            
            // Crear una caja con fondo para las estadísticas principales
            doc.rect(40, currentY, 720, 80)
               .fillAndStroke('#f8f9fa', '#e9ecef');
            
            // Estadísticas principales en línea
            const boxY = currentY + 15;
            const statWidth = 180;
            
            // Total de registros
            doc.fontSize(14)
               .fillColor(colors.primary)
               .text(stats.total?.toLocaleString() || '0', 50, boxY)
               .fontSize(9)
               .fillColor(colors.secondary)
               .text('Total Registros', 50, boxY + 20);
            
            // Valor total
            const valorTotal = stats.totalValue || 0;
            doc.fontSize(14)
               .fillColor(colors.primary)
               .text(`$${valorTotal.toLocaleString('es-CO', { minimumFractionDigits: 0 })}`, 230, boxY)
               .fontSize(9)
               .fillColor(colors.secondary)
               .text('Valor Total', 230, boxY + 20);
            
            // Stock bajo
            doc.fontSize(14)
               .fillColor('#dc3545')
               .text((stats.lowStock || 0).toString(), 410, boxY)
               .fontSize(9)
               .fillColor(colors.secondary)
               .text('Stock Bajo', 410, boxY + 20);
            
            // Alto valor
            doc.fontSize(14)
               .fillColor('#28a745')
               .text((stats.highValue || 0).toString(), 590, boxY)
               .fontSize(9)
               .fillColor(colors.secondary)
               .text('Alto Valor (>$1M)', 590, boxY + 20);

            currentY += 100;

            // Mostrar categorías si existen
            if (stats.byCategory && Object.keys(stats.byCategory).length > 0) {
                currentY += 20; // Usar currentY actual en lugar de startY indefinido
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
        if (requestData.data && requestData.data.length > 0) {
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
            const tableHeaders = requestData.tableFormat === 'enumerated' 
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
            const maxRows = Math.min(requestData.data.length, 15); // Limitar filas para que quepa
            for (let i = 0; i < maxRows; i++) {
                const row = requestData.data[i];
                tableX = tableStartX;
                
                const rowData = [
                    requestData.tableFormat === 'enumerated' ? (i + 1).toString() : row.id_suministro?.toString() || '',
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

            if (requestData.data.length > maxRows) {
                currentY += 10;
                doc.fontSize(10)
                   .fillColor(colors.secondary)
                   .text(`... y ${requestData.data.length - maxRows} registros más`, tableStartX, currentY);
            }
        }

        // Gráficos (información textual)
        if (requestData.includeCharts && requestData.charts) {
            if (currentY > 450) {
                doc.addPage();
                currentY = 40;
            }

            doc.fontSize(16)
               .fillColor(colors.primary)
               .text('Gráficos Incluidos', 40, currentY);
            currentY += 30;

            const selectedCharts = Object.entries(requestData.charts)
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

/**
 * Exportar dashboard de suministros a PDF (básico)
 */
const exportDashboardToPDF = async (req, res) => {
    try {
        // Obtener datos del dashboard
        const dashboardData = await getDashboardData(req.query);
        
        // Crear configuración básica
        const config = {
            title: 'Reporte de Suministros y Materiales',
            subtitle: 'Dashboard Estándar',
            includeFilters: true,
            includeStats: true,
            includeData: true
        };
        
        // Gráficos activos por defecto
        const activeCharts = {
            consumoPorObra: { enabled: true },
            distribucionProveedores: { enabled: true },
            categorias: { enabled: true },
            consumoMensual: { enabled: true }
        };
        
        // Reutilizar la función personalizada
        req.body = { config, activeCharts, dashboardData, ...req.query };
        return await exportDashboardCustomToPDF(req, res);
        
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
 * Exportar dashboard de suministros a Excel (básico)
 */
const exportDashboardToExcel = async (req, res) => {
    try {
        // Obtener datos del dashboard
        const dashboardData = await getDashboardData(req.query);
        
        // Crear configuración básica
        const config = {
            title: 'Reporte de Suministros y Materiales',
            subtitle: 'Dashboard Estándar',
            includeFilters: true,
            includeStats: true,
            includeData: true
        };
        
        // Gráficos activos por defecto
        const activeCharts = {
            consumoPorObra: { enabled: true },
            distribucionProveedores: { enabled: true },
            categorias: { enabled: true },
            consumoMensual: { enabled: true }
        };
        
        // Reutilizar la función personalizada
        req.body = { config, activeCharts, dashboardData, ...req.query };
        return await exportDashboardCustomToExcel(req, res);
        
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
 * Exportar dashboard personalizado a Excel
 */
const exportDashboardCustomToExcel = async (req, res) => {
    try {
        const { config, activeCharts, dashboardData, ...filtros } = req.body;
        
        // Crear workbook
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema VLock';
        workbook.created = new Date();

        // Hoja principal con resumen
        const summarySheet = workbook.addWorksheet('Resumen');
        
        // Configurar columnas
        summarySheet.columns = [
            { header: 'Concepto', key: 'concepto', width: 30 },
            { header: 'Valor', key: 'valor', width: 20 }
        ];

        // Título
        summarySheet.mergeCells('A1:B1');
        summarySheet.getCell('A1').value = config.title || 'Reporte de Suministros y Materiales';
        summarySheet.getCell('A1').style = {
            font: { size: 16, bold: true },
            alignment: { horizontal: 'center' }
        };

        let currentRow = 3;

        // Información básica
        summarySheet.getCell(`A${currentRow}`).value = 'Fecha de Generación:';
        summarySheet.getCell(`B${currentRow}`).value = new Date().toLocaleDateString('es-MX');
        currentRow++;

        if (config.subtitle) {
            summarySheet.getCell(`A${currentRow}`).value = 'Subtítulo:';
            summarySheet.getCell(`B${currentRow}`).value = config.subtitle;
            currentRow++;
        }

        // Generar buffer del archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${config.title?.replace(/\s+/g, '_') || 'reporte'}.xlsx"`);
        res.send(buffer);

    } catch (error) {
        console.error('Error exportando Excel personalizado:', error);
        res.status(500).json({
            success: false,
            message: 'Error al generar el reporte Excel personalizado',
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

// Función auxiliar para obtener datos del dashboard
const getDashboardData = async (filtros) => {
    // Retornar datos básicos para compatibilidad
    return {
        estadisticasGenerales: {
            total_registros: 0,
            total_gastado: 0,
            total_proveedores: 0,
            total_obras: 0
        },
        consumoPorObra: [],
        distribicionProveedores: [],
        analisisCategorias: [],
        consumoMensual: []
    };
};

module.exports = {
    getDashboardSuministros,
    exportDashboardToPDF,
    exportDashboardToExcel,
    exportDashboardCustomToPDF,
    exportDashboardCustomToExcel,
    getReporteComparativo
};
