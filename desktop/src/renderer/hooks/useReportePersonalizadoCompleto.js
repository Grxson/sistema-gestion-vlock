import { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { formatCurrency, formatNumber } from '../utils/formatters';

const useReportePersonalizado = () => {
  // Función helper para formatear fechas
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  const { showSuccess, showError } = useToast();
  const previewRef = useRef(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [reportConfig, setReportConfig] = useState({
    title: 'REPORTE DE SUMINISTROS',
    subtitle: 'Sistema de Gestión VLock',
    includeStatistics: true,
    includeTable: true,
    includeCharts: true,
    tableFormat: 'id', // 'id' o 'enumerated'
    charts: {} // Objeto para almacenar las gráficas seleccionadas
  });

  // Función para preparar los datos de tabla completa
  const prepareTableData = (suministros, config) => {
    if (!suministros || suministros.length === 0) return [];

    return suministros.map((suministro, index) => {
      const row = {};
      
      if (config.tableFormat === 'enumerated') {
        row.numero = index + 1;
      }
      
      row.id = suministro.id_suministro;
      row.nombre = suministro.nombre_suministro || '';
      row.categoria = suministro.categoria || suministro.tipo_suministro || 'N/A';
      row.proveedor = suministro.nombre_proveedor || suministro.proveedor || 'N/A';
      row.cantidad = parseFloat(suministro.cantidad) || 0;
      row.unidad = suministro.unidad_medida || 'N/A';
      row.precio_unitario = parseFloat(suministro.precio_unitario) || 0;
      row.total = row.cantidad * row.precio_unitario;
      row.estado = suministro.estado || 'N/A';
      row.fecha = suministro.fecha_solicitud || suministro.fecha || '';
      
      return row;
    });
  };

  // Función para generar HTML del reporte completo
  const generateReportHTML = (data, statistics, config, chartsData = {}) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    const tableData = prepareTableData(data, config);
    
    // Función para renderizar tabla paginada
    const renderTablePage = (pageData, pageNumber, totalPages) => {
      const headers = config.tableFormat === 'enumerated' 
        ? ['#', 'ID', 'Nombre', 'Categoría', 'Proveedor', 'Cantidad', 'Unidad', 'Precio Unit.', 'Total', 'Estado', 'Fecha']
        : ['ID', 'Nombre', 'Categoría', 'Proveedor', 'Cantidad', 'Unidad', 'Precio Unit.', 'Total', 'Estado', 'Fecha'];
      
      return `
        <div class="page-content" style="page-break-before: ${pageNumber > 1 ? 'always' : 'auto'}; padding: 20px; background: #ffffff;">
          <h2 style="font-size: 20px; font-weight: bold; margin-bottom: 16px; color: #1f2937;">
            Tabla de Suministros (Página ${pageNumber} de ${totalPages})
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 8px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                ${headers.map(header => `
                  <th style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: left; font-weight: 600; color: #374151;">
                    ${header}
                  </th>
                `).join('')}
              </tr>
            </thead>
            <tbody>
              ${pageData.map(item => `
                <tr style="border-bottom: 1px solid #e5e7eb;">
                  ${config.tableFormat === 'enumerated' ? `<td style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: center;">${item.numero}</td>` : ''}
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">${item.id}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px; max-width: 150px; overflow: hidden; text-overflow: ellipsis;">${item.nombre}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">${item.categoria}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">${item.proveedor}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: right;">${formatNumber(item.cantidad, 2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">${item.unidad}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: right;">${formatCurrency(item.precio_unitario, 2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px; text-align: right; font-weight: 600;">${formatCurrency(item.total, 2)}</td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">
                    <span style="padding: 2px 6px; border-radius: 4px; font-size: 7px; background-color: ${
                      item.estado === 'Recibido' ? '#dcfce7; color: #166534' :
                      item.estado === 'Pendiente' ? '#fef3c7; color: #92400e' :
                      '#fee2e2; color: #991b1b'
                    };">${item.estado}</span>
                  </td>
                  <td style="border: 1px solid #d1d5db; padding: 4px 6px;">${formatDate(item.fecha)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    };

    // Dividir datos en páginas (50 registros por página para PDF)
    const itemsPerPage = 50;
    const totalPages = Math.ceil(tableData.length / itemsPerPage);
    const tablePages = [];
    
    for (let i = 0; i < totalPages; i++) {
      const startIndex = i * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, tableData.length);
      const pageData = tableData.slice(startIndex, endIndex);
      tablePages.push(renderTablePage(pageData, i + 1, totalPages));
    }

    return `
      <div style="background: #ffffff; font-family: system-ui, -apple-system, sans-serif; line-height: 1.4;">
        <!-- PORTADA -->
        <div class="page-content" style="padding: 60px 40px; text-align: center; page-break-after: always;">
          <div style="margin-bottom: 40px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #3b82f6, #1e40af); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 36px; font-weight: bold;">V</span>
            </div>
            <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">VLOCK SISTEMAS</h1>
            <p style="color: #6b7280; font-size: 16px;">Sistema de Gestión de Suministros</p>
          </div>

          <div style="border-top: 2px solid #e5e7eb; border-bottom: 2px solid #e5e7eb; padding: 40px 0; margin: 40px 0;">
            <h2 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 16px;">
              ${config.title}
            </h2>
            ${config.subtitle ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 16px;">${config.subtitle}</p>` : ''}
            <p style="color: #9ca3af; font-size: 14px;">
              Reporte generado el ${formatDate(new Date())}
            </p>
          </div>

          <div style="text-align: left; max-width: 400px; margin: 0 auto;">
            <h3 style="font-weight: 600; color: #1f2937; margin-bottom: 12px;">Contenido del Reporte:</h3>
            <ul style="color: #6b7280; font-size: 14px; line-height: 1.6;">
              ${config.includeStatistics ? '<li>• Estadísticas Generales</li>' : ''}
              ${config.includeTable ? `<li>• Tabla Completa de Suministros (${tableData.length} registros)</li>` : ''}
              ${config.selectedCharts?.length > 0 ? `<li>• ${config.selectedCharts.length} Gráfica(s) de Análisis</li>` : ''}
            </ul>
          </div>
        </div>

        <!-- RESUMEN EJECUTIVO -->
        ${config.includeStatistics && statistics ? `
        <div class="page-content" style="padding: 40px; page-break-after: always;">
          <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 24px; border-bottom: 3px solid #3b82f6; padding-bottom: 8px;">
            RESUMEN EJECUTIVO
          </h2>
          
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px;">
            <div style="background: linear-gradient(135deg, #dbeafe, #bfdbfe); padding: 20px; border-radius: 8px; border: 1px solid #93c5fd;">
              <h3 style="font-size: 12px; font-weight: 600; color: #1e40af; margin-bottom: 8px;">Total Suministros</h3>
              <p style="font-size: 24px; font-weight: bold; color: #1e3a8a;">${formatNumber(statistics.total || 0)}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #dcfce7, #bbf7d0); padding: 20px; border-radius: 8px; border: 1px solid #86efac;">
              <h3 style="font-size: 12px; font-weight: 600; color: #166534; margin-bottom: 8px;">Inversión Total</h3>
              <p style="font-size: 24px; font-weight: bold; color: #14532d;">${formatCurrency(statistics.totalValue || 0)}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f3e8ff, #e9d5ff); padding: 20px; border-radius: 8px; border: 1px solid #c4b5fd;">
              <h3 style="font-size: 12px; font-weight: 600; color: #7c3aed; margin-bottom: 8px;">Categorías</h3>
              <p style="font-size: 24px; font-weight: bold; color: #5b21b6;">${Object.keys(statistics.byCategory || {}).length}</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fed7aa, #fdba74); padding: 20px; border-radius: 8px; border: 1px solid #fb923c;">
              <h3 style="font-size: 12px; font-weight: 600; color: #ea580c; margin-bottom: 8px;">Promedio por Item</h3>
              <p style="font-size: 24px; font-weight: bold; color: #c2410c;">${formatCurrency((statistics.totalValue || 0) / (statistics.total || 1))}</p>
            </div>
          </div>

          <div style="margin-top: 32px;">
            <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 12px;">Análisis del Período</h3>
            <p style="color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
              Durante el período analizado, se registraron un total de <strong>${formatNumber(statistics.total || 0)}</strong> suministros
              con una inversión total de <strong>${formatCurrency(statistics.totalValue || 0)}</strong>.
            </p>
            
            ${statistics.byCategory ? `
              <p style="color: #4b5563; margin-bottom: 16px; line-height: 1.6;">
                La distribución por categorías muestra <strong>${Object.keys(statistics.byCategory).length}</strong> categorías diferentes,
                siendo la principal <strong>${Object.entries(statistics.byCategory).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}</strong>
                con ${Object.entries(statistics.byCategory).sort(([,a], [,b]) => b - a)[0]?.[1] || 0} registros.
              </p>
            ` : ''}
            
            <p style="color: #4b5563; line-height: 1.6;">
              El promedio de inversión por suministro es de <strong>${formatCurrency((statistics.totalValue || 0) / (statistics.total || 1))}</strong>,
              indicando una gestión equilibrada de los recursos.
            </p>
          </div>
        </div>
        ` : ''}

        <!-- TABLA DE SUMINISTROS -->
        ${config.includeTable && tableData.length > 0 ? tablePages.join('') : ''}

        <!-- PIE DE PÁGINA -->
        <div style="padding: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 10px; color: #6b7280;">
          <p>
            Reporte generado por VLOCK Sistema de Gestión - ${formatDate(new Date())} - 
            Confidencial y de uso interno únicamente
          </p>
        </div>
      </div>
    `;
  };

  // Exportar a PDF con múltiples páginas y gráficas
  const exportToPDF = async (data, statistics, config, filtros, chartsData = {}) => {
    setLoading(true);
    setProgress(10);

    try {
      const pdf = new jsPDF({
        orientation: 'landscape', // Formato horizontal como solicitaste
        unit: 'mm',
        format: 'a4'
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      const contentHeight = pageHeight - (margin * 2);

      let currentPage = 1;

      // PÁGINA 1: PORTADA
      pdf.setFontSize(24);
      pdf.setFont(undefined, 'bold');
      pdf.text('VLOCK SISTEMAS', pageWidth / 2, 50, { align: 'center' });
      
      pdf.setFontSize(18);
      pdf.setFont(undefined, 'normal');
      pdf.text('Sistema de Gestión de Suministros', pageWidth / 2, 65, { align: 'center' });
      
      pdf.setFontSize(20);
      pdf.setFont(undefined, 'bold');
      pdf.text(config.title, pageWidth / 2, 90, { align: 'center' });
      
      if (config.subtitle) {
        pdf.setFontSize(14);
        pdf.setFont(undefined, 'normal');
        pdf.text(config.subtitle, pageWidth / 2, 105, { align: 'center' });
      }

      pdf.setFontSize(12);
      pdf.text(`Reporte generado el ${formatDate(new Date())}`, pageWidth / 2, 120, { align: 'center' });
      
      // Resumen del contenido
      let yPos = 140;
      pdf.setFontSize(14);
      pdf.setFont(undefined, 'bold');
      pdf.text('Contenido del Reporte:', margin, yPos);
      
      yPos += 10;
      pdf.setFontSize(11);
      pdf.setFont(undefined, 'normal');
      
      if (config.includeStatistics) {
        pdf.text('• Estadísticas Generales del Sistema', margin + 10, yPos);
        yPos += 6;
      }
      
      if (config.includeTable) {
        pdf.text(`• Tabla Completa de Suministros (${data.length} registros)`, margin + 10, yPos);
        yPos += 6;
      }
      
      if (config.includeCharts) {
        const selectedCharts = Object.keys(config.charts).filter(key => config.charts[key]);
        if (selectedCharts.length > 0) {
          pdf.text(`• ${selectedCharts.length} Gráfica(s) de Análisis Incluidas`, margin + 10, yPos);
          yPos += 6;
        }
      }

      setProgress(20);

      // PÁGINA 2: ESTADÍSTICAS (si están incluidas)
      if (config.includeStatistics && statistics) {
        pdf.addPage();
        currentPage++;
        
        pdf.setFontSize(18);
        pdf.setFont(undefined, 'bold');
        pdf.text('ESTADÍSTICAS GENERALES', margin, 30);
        
        yPos = 50;
        pdf.setFontSize(12);
        pdf.setFont(undefined, 'normal');
        
        // Crear grid de estadísticas
        const statsPerRow = 3;
        const statsKeys = Object.keys(statistics);
        
        for (let i = 0; i < statsKeys.length; i += statsPerRow) {
          const rowStats = statsKeys.slice(i, i + statsPerRow);
          
          rowStats.forEach((key, index) => {
            const xPos = margin + (index * (contentWidth / statsPerRow));
            
            // Título de la estadística
            pdf.setFont(undefined, 'bold');
            pdf.text(key.replace(/([A-Z])/g, ' $1').trim(), xPos, yPos);
            
            // Valor de la estadística
            pdf.setFont(undefined, 'normal');
            let value = statistics[key];
            if (typeof value === 'number') {
              if (key.toLowerCase().includes('total') || key.toLowerCase().includes('promedio')) {
                value = formatCurrency(value);
              } else {
                value = formatNumber(value);
              }
            }
            pdf.text(String(value), xPos, yPos + 8);
          });
          
          yPos += 25;
        }
      }

      setProgress(40);

      // PÁGINAS DE GRÁFICAS (si están incluidas)
      if (config.includeCharts && chartsData) {
        const selectedCharts = Object.keys(config.charts).filter(key => config.charts[key]);
        
        for (const chartKey of selectedCharts) {
          if (chartsData[chartKey]) {
            pdf.addPage();
            currentPage++;
            
            // Capturar la gráfica
            const chartElement = document.querySelector(`[data-chart-id="${chartKey}"]`);
            if (chartElement) {
              try {
                const canvas = await html2canvas(chartElement, {
                  backgroundColor: '#ffffff',
                  scale: 2,
                  logging: false
                });
                
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = contentWidth;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                
                pdf.text(`Gráfica: ${chartKey.replace(/([A-Z])/g, ' $1').trim()}`, margin, 30);
                pdf.addImage(imgData, 'PNG', margin, 40, imgWidth, Math.min(imgHeight, contentHeight - 50));
              } catch (error) {
                console.error('Error capturando gráfica:', error);
                pdf.text(`Error: No se pudo capturar la gráfica ${chartKey}`, margin, 50);
              }
            }
          }
        }
      }

      setProgress(60);

      // PÁGINAS DE TABLA (si está incluida)
      if (config.includeTable && data.length > 0) {
        const tableData = prepareTableData(data, config);
        const rowsPerPage = 25; // Para formato horizontal
        const totalPages = Math.ceil(tableData.length / rowsPerPage);
        
        for (let page = 0; page < totalPages; page++) {
          pdf.addPage();
          currentPage++;
          
          // Título de la página
          pdf.setFontSize(16);
          pdf.setFont(undefined, 'bold');
          pdf.text(`TABLA DE SUMINISTROS - Página ${page + 1} de ${totalPages}`, margin, 25);
          
          // Preparar datos de la página
          const startIndex = page * rowsPerPage;
          const endIndex = Math.min(startIndex + rowsPerPage, tableData.length);
          const pageData = tableData.slice(startIndex, endIndex);
          
          // Configurar tabla
          const headers = [];
          const columnWidths = [];
          
          if (config.tableFormat === 'enumerated') {
            headers.push('#');
            columnWidths.push(10);
          }
          
          headers.push('ID', 'Nombre', 'Categoría', 'Proveedor', 'Cant.', 'Unidad', 'Precio', 'Total', 'Estado');
          columnWidths.push(...[15, 40, 25, 30, 15, 15, 20, 20, 20]);
          
          // Dibujar headers
          let yPos = 40;
          let xPos = margin;
          
          pdf.setFontSize(9);
          pdf.setFont(undefined, 'bold');
          
          headers.forEach((header, index) => {
            pdf.text(header, xPos, yPos);
            xPos += columnWidths[index];
          });
          
          yPos += 8;
          
          // Dibujar filas
          pdf.setFont(undefined, 'normal');
          pageData.forEach((row) => {
            xPos = margin;
            
            if (config.tableFormat === 'enumerated') {
              pdf.text(String(row.numero), xPos, yPos);
              xPos += columnWidths[0];
            }
            
            pdf.text(String(row.id), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 1 : 0];
            
            pdf.text(String(row.nombre).substring(0, 25), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 2 : 1];
            
            pdf.text(String(row.categoria).substring(0, 15), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 3 : 2];
            
            pdf.text(String(row.proveedor).substring(0, 20), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 4 : 3];
            
            pdf.text(String(row.cantidad), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 5 : 4];
            
            pdf.text(String(row.unidad), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 6 : 5];
            
            pdf.text(formatCurrency(row.precio_unitario), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 7 : 6];
            
            pdf.text(formatCurrency(row.total), xPos, yPos);
            xPos += columnWidths[config.tableFormat === 'enumerated' ? 8 : 7];
            
            pdf.text(String(row.estado).substring(0, 10), xPos, yPos);
            
            yPos += 6;
          });
        }
      }

      setProgress(80);

      // Agregar numeración de páginas
      const totalPagesCount = pdf.getNumberOfPages();
      for (let i = 1; i <= totalPagesCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setFont(undefined, 'normal');
        pdf.text(`Página ${i} de ${totalPagesCount}`, pageWidth - margin - 30, pageHeight - 10);
      }

      setProgress(90);

      // Descargar el PDF
      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      setProgress(100);
      showSuccess('PDF generado exitosamente');

    } catch (error) {
      console.error('Error generando PDF:', error);
      showError('Error al generar el PDF: ' + error.message);
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Exportar a Excel
  const exportToExcel = async (data, statistics, config, filtros) => {
    setLoading(true);
    setProgress(10);

    try {
      const workbook = XLSX.utils.book_new();
      const tableData = prepareTableData(data, config);

      setProgress(30);

      // Hoja 1: Estadísticas
      if (config.includeStatistics && statistics) {
        const statsData = [
          ['REPORTE DE SUMINISTROS'],
          [config.title],
          [config.subtitle || ''],
          [''],
          ['Fecha de Generación:', formatDate(new Date())],
          [''],
          ['ESTADÍSTICAS GENERALES'],
          ['Total de Suministros:', statistics.total || 0],
          ['Inversión Total:', statistics.totalValue || 0],
          ['Promedio por Item:', (statistics.totalValue || 0) / (statistics.total || 1)],
          ['Categorías Diferentes:', Object.keys(statistics.byCategory || {}).length]
        ];

        const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');
      }

      setProgress(50);

      // Hoja 2: Tabla de Suministros
      if (config.includeTable && tableData.length > 0) {
        const headers = config.tableFormat === 'enumerated' 
          ? ['#', 'ID', 'Nombre', 'Categoría', 'Proveedor', 'Cantidad', 'Unidad', 'Precio Unit.', 'Total', 'Estado', 'Fecha']
          : ['ID', 'Nombre', 'Categoría', 'Proveedor', 'Cantidad', 'Unidad', 'Precio Unit.', 'Total', 'Estado', 'Fecha'];

        const excelData = [headers];

        tableData.forEach((item) => {
          const row = [];
          
          if (config.tableFormat === 'enumerated') {
            row.push(item.numero);
          }
          
          row.push(
            item.id,
            item.nombre,
            item.categoria,
            item.proveedor,
            item.cantidad,
            item.unidad,
            item.precio_unitario,
            item.total,
            item.estado,
            item.fecha
          );
          
          excelData.push(row);
        });

        const tableSheet = XLSX.utils.aoa_to_sheet(excelData);
        
        // Configurar anchos de columna
        const colWidths = config.tableFormat === 'enumerated'
          ? [{ wch: 5 }, { wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }]
          : [{ wch: 10 }, { wch: 40 }, { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 12 }];
        
        tableSheet['!cols'] = colWidths;
        
        XLSX.utils.book_append_sheet(workbook, tableSheet, 'Suministros');
      }

      setProgress(80);

      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      setProgress(95);
      XLSX.writeFile(workbook, fileName);
      setProgress(100);

      return { success: true, fileName };

    } catch (error) {
      console.error('Error al exportar Excel:', error);
      throw error;
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  // Función principal para manejo de exportación personalizada
  const handleCustomExport = async (format, suministrosData, filtros, proyectos, proveedores) => {
    try {
      console.log('Iniciando exportación personalizada:', { format, dataLength: suministrosData.length });
      
      // Preparar datos para el reporte con información adicional
      const dataToExport = suministrosData.map((suministro, index) => ({
        ...suministro,
        numero_fila: index + 1,
        proyecto: proyectos?.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores?.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || suministro.nombre_proveedor || ''
      }));

      // Calcular estadísticas
      const statistics = {
        total: suministrosData.length,
        totalValue: suministrosData.reduce((sum, s) => sum + (parseFloat(s.precio_unitario || 0) * parseFloat(s.cantidad || 0)), 0),
        byCategory: suministrosData.reduce((acc, s) => {
          const category = s.categoria || s.tipo_suministro || 'Sin Categoría';
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {}),
        lowStock: suministrosData.filter(s => s.stock_minimo && parseFloat(s.cantidad || 0) < parseFloat(s.stock_minimo)).length,
        highValue: suministrosData.filter(s => (parseFloat(s.precio_unitario || 0) * parseFloat(s.cantidad || 0)) > 1000000).length
      };

      if (format === 'pdf') {
        await exportToPDF(dataToExport, statistics, reportConfig, filtros);
      } else if (format === 'excel') {
        await exportToExcel(dataToExport, statistics, reportConfig, filtros);
      }

      setShowReportModal(false);
      showSuccess('Exportación exitosa', `El reporte personalizado en ${format.toUpperCase()} ha sido generado correctamente`);

    } catch (error) {
      console.error(`Error exportando reporte personalizado a ${format}:`, error);
      showError('Error', `No se pudo generar el reporte personalizado en ${format.toUpperCase()}: ${error.message}`);
    }
  };

  return {
    showReportModal,
    setShowReportModal,
    showPreviewModal,
    setShowPreviewModal,
    previewData,
    setPreviewData,
    reportConfig,
    setReportConfig,
    loading,
    progress,
    handleCustomExport,
    exportToPDF,
    exportToExcel
  };
};

export default useReportePersonalizado;
