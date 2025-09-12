/**
 * Exportar dashboard personalizado a PDF - Versión corregida
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
    exportDashboardCustomToPDF
};
