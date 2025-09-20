import { useState, useRef } from 'react';
import { useToast } from '../contexts/ToastContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const useReportePersonalizado = () => {
  const { showSuccess, showError } = useToast();
  const previewRef = useRef(null);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  
  const [reportConfig, setReportConfig] = useState({
    title: 'Reporte de Suministros Detallado',
    subtitle: 'Sistema de Gestión VLock',
    includeStatistics: true,
    includeTable: true,
    includeCharts: true,
    tableFormat: 'enumerated',
    charts: {
      // Análisis Financiero Principal
      gastosPorMes: true,
      valorPorCategoria: true,
      gastosPorProyecto: false,
      gastosPorProveedor: false,
      // Análisis de Cantidad y Estado
      suministrosPorMes: true,
      cantidadPorEstado: false,
      // Análisis Técnico Especializado
      distribucionTipos: false,
      tendenciaEntregas: false,
      codigosProducto: false,
      analisisTecnicoConcreto: false,
      concretoDetallado: false,
      // Análisis de Horas de Trabajo
      horasPorMes: false,
      horasPorEquipo: false,
      comparativoHorasVsCosto: false,
      // Análisis por Unidades de Medida
      cantidadPorUnidad: false,
      valorPorUnidad: false,
      analisisUnidadesMedida: false,
      // Gráficas Profesionales Avanzadas
      gastosPorCategoriaDetallado: false
    }
  });

  const handleCustomExport = async (format, suministrosData, filtros, proyectos, proveedores) => {
    try {
      console.log('Iniciando exportación personalizada:', { format, dataLength: suministrosData.length });
      
      // Preparar datos para el reporte
      const dataToExport = suministrosData.map((suministro, index) => ({
        ...suministro,
        numero_fila: index + 1,
        proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
      }));

      // Calcular estadísticas
      const statistics = {
        total: suministrosData.length,
        totalValue: suministrosData.reduce((sum, s) => sum + (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)), 0),
        byCategory: suministrosData.reduce((acc, s) => {
          const cat = s.tipo_suministro || 'Sin categoría';
          acc[cat] = (acc[cat] || 0) + 1;
          return acc;
        }, {}),
        lowStock: suministrosData.filter(s => parseFloat(s.cantidad) < 10).length,
        highValue: suministrosData.filter(s => parseFloat(s.precio_unitario) > 100000).length
      };

      if (format === 'pdf') {
        await exportToPDFWithCharts(dataToExport, statistics, reportConfig, filtros, [], {});
        showSuccess('PDF generado exitosamente');
      } else if (format === 'excel') {
        await exportToExcel(dataToExport, statistics, reportConfig, filtros);
        showSuccess('Excel generado exitosamente');
      }

    } catch (error) {
      console.error('Error en exportación personalizada:', error);
      showError(`Error al generar el reporte: ${error.message}`);
    }
  };

  // Función para obtener títulos de gráficas
  const getChartTitle = (chartId) => {
    const titles = {
      // Análisis Financiero Principal
      gastosPorMes: 'Gastos por Mes',
      valorPorCategoria: 'Valor por Categoría',
      gastosPorProyecto: 'Gastos por Proyecto',
      gastosPorProveedor: 'Gastos por Proveedor',
      // Análisis de Cantidad y Estado
      suministrosPorMes: 'Suministros por Mes',
      cantidadPorEstado: 'Cantidad por Estado',
      // Análisis Técnico Especializado
      distribucionTipos: 'Distribución por Tipos',
      tendenciaEntregas: 'Tendencia de Entregas',
      codigosProducto: 'Códigos de Producto',
      analisisTecnicoConcreto: 'Análisis Técnico de Concreto',
      concretoDetallado: 'Concreto Detallado',
      // Análisis de Horas de Trabajo
      horasPorMes: 'Horas por Mes',
      horasPorEquipo: 'Horas por Equipo',
      comparativoHorasVsCosto: 'Comparativo Horas vs Costo',
      // Análisis por Unidades de Medida
      cantidadPorUnidad: 'Cantidad por Unidad',
      valorPorUnidad: 'Valor por Unidad',
      analisisUnidadesMedida: 'Análisis de Unidades',
      // Gráficas Profesionales Avanzadas
      gastosPorCategoriaDetallado: 'Gastos por Categoría (con %)'
    };
    return titles[chartId] || 'Gráfica';
  };

  const generateReportHTML = async (data, statistics, config, selectedCharts, chartData) => {
    // Calcular métricas adicionales precisas
    const totalGastado = data.reduce((sum, item) => sum + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad)), 0);
    const totalRegistros = data.length;
    
    // Calcular categorías
    const categorias = data.reduce((acc, item) => {
      const cat = item.tipo_suministro || 'Sin categoría';
      acc[cat] = (acc[cat] || 0) + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad));
      return acc;
    }, {});
    
    const categoriaMasGasto = Object.entries(categorias).reduce((max, [cat, gasto]) => 
      gasto > max.gasto ? { categoria: cat, gasto } : max, { categoria: '', gasto: 0 });

    // Calcular proveedores
    const proveedores = data.reduce((acc, item) => {
      const prov = item.nombre_proveedor || 'Sin proveedor';
      acc[prov] = (acc[prov] || 0) + (parseFloat(item.precio_unitario) * parseFloat(item.cantidad));
      return acc;
    }, {});

    const proveedorMasGasto = Object.entries(proveedores).reduce((max, [prov, gasto]) => 
      gasto > max.gasto ? { proveedor: prov, gasto } : max, { proveedor: '', gasto: 0 });

    // Estadísticas adicionales
    const totalProveedores = Object.keys(proveedores).length;
    const totalCategorias = Object.keys(categorias).length;

    return `
      <div style="width: 210mm; min-height: 297mm; font-family: Arial, sans-serif; color: #333; background: white; margin: 0; padding: 0;">
        <!-- PORTADA -->
        <div style="width: 100%; height: 297mm; text-align: center; padding: 80px 40px; box-sizing: border-box;">
          <div style="width: 60px; height: 60px; background: #3b82f6; border-radius: 50%; margin: 0 auto 40px; display: inline-flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px; font-weight: bold;">VL</span>
          </div>
          <h1 style="font-size: 32px; font-weight: bold; color: #1f2937; margin: 20px 0; line-height: 1.2;">
            Reporte de Gastos
          </h1>
          <p style="font-size: 16px; color: #6b7280; margin: 20px 0;">Sistema de Gestión de Suministros</p>
          <div style="width: 60%; height: 2px; background: #e5e7eb; margin: 40px auto;"></div>
          <p style="font-size: 14px; color: #6b7280; margin-top: 40px;">
            Reporte generado el ${new Date().toLocaleDateString('es-ES', {
              year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>

        <!-- PÁGINA DE CONTENIDO -->
        <div style="width: 100%; min-height: 297mm; padding: 40px; box-sizing: border-box; page-break-before: always;">
          <h2 style="font-size: 20px; font-weight: bold; color: #1f2937; margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            📊 Resumen Ejecutivo
          </h2>
          
          <!-- Estadísticas principales -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="width: 33%; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #64748b; margin: 0 0 10px 0; font-weight: bold;">💰 TOTAL GASTADO</h3>
                <p style="font-size: 20px; font-weight: bold; color: #1f2937; margin: 0;">$${totalGastado.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 33%; padding: 20px; background: #f0fdf4; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #16a34a; margin: 0 0 10px 0; font-weight: bold;">📈 CATEGORÍA TOP</h3>
                <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">${categoriaMasGasto.categoria}</p>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">$${categoriaMasGasto.gasto.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 33%; padding: 20px; background: #fef3c7; border: 1px solid #e2e8f0; text-align: center;">
                <h3 style="font-size: 12px; color: #d97706; margin: 0 0 10px 0; font-weight: bold;">🏢 PROVEEDOR TOP</h3>
                <p style="font-size: 14px; font-weight: bold; color: #1f2937; margin: 0;">${proveedorMasGasto.proveedor}</p>
                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0;">$${proveedorMasGasto.gasto.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
            </tr>
          </table>

          ${config.includeStatistics ? `
          <!-- Estadísticas Generales -->
          <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 40px 0 20px 0;">
            📊 Estadísticas Generales
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="width: 25%; padding: 15px; background: #dbeafe; border: 1px solid #bfdbfe; text-align: center;">
                <h4 style="font-size: 10px; color: #1e40af; margin: 0 0 8px 0; font-weight: bold;">REGISTROS</h4>
                <p style="font-size: 16px; font-weight: bold; color: #1e3a8a; margin: 0;">${totalRegistros.toLocaleString('es-CO')}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #dcfce7; border: 1px solid #bbf7d0; text-align: center;">
                <h4 style="font-size: 10px; color: #16a34a; margin: 0 0 8px 0; font-weight: bold;">TOTAL GASTADO</h4>
                <p style="font-size: 16px; font-weight: bold; color: #15803d; margin: 0;">$${totalGastado.toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #fef3c7; border: 1px solid #fde68a; text-align: center;">
                <h4 style="font-size: 10px; color: #d97706; margin: 0 0 8px 0; font-weight: bold;">PROVEEDORES</h4>
                <p style="font-size: 16px; font-weight: bold; color: #b45309; margin: 0;">${totalProveedores}</p>
              </td>
              <td style="width: 25%; padding: 15px; background: #f3e8ff; border: 1px solid #e9d5ff; text-align: center;">
                <h4 style="font-size: 10px; color: #9333ea; margin: 0 0 8px 0; font-weight: bold;">CATEGORÍAS</h4>
                <p style="font-size: 16px; font-weight: bold; color: #7c3aed; margin: 0;">${totalCategorias}</p>
              </td>
            </tr>
          </table>
          ` : ''}

          ${config.includeTable ? `
          <!-- Tabla de Suministros -->
          <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin: 40px 0 20px 0;">
            📋 Detalle de Suministros
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 9px;">
            <thead>
              <tr style="background: #f1f5f9;">
                ${config.tableFormat === 'enumerated' ? '<th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 4%;">#</th>' : ''}
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 35%;">Nombre</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 15%;">Categoría</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: left; font-weight: bold; width: 20%;">Proveedor</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Cant.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold; width: 6%;">Unidad</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; font-weight: bold; width: 7%;">Precio Unit.</th>
                <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: right; font-weight: bold; width: 7%;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${data.slice(0, 50).map((item, index) => `
                <tr style="background: ${index % 2 === 0 ? '#ffffff' : '#f8fafc'};">
                  ${config.tableFormat === 'enumerated' ? `<td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">${index + 1}</td>` : ''}
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">${item.nombre_suministro || item.descripcion || item.nombre || 'Sin nombre'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">${item.categoria || item.tipo_suministro || 'Sin categoría'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; font-size: 8px;">${item.nombre_proveedor || item.proveedor || 'Sin proveedor'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">${(parseFloat(item.cantidad) || 0).toLocaleString('es-CO', {maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: center; font-size: 8px;">${item.unidad_medida || item.unidad || 'N/A'}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: right; font-size: 8px;">$${(parseFloat(item.precio_unitario) || 0).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 5px; text-align: right; font-weight: bold; font-size: 8px;">$${((parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)).toLocaleString('es-CO', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          ${data.length > 50 ? `<p style="font-size: 9px; color: #6b7280; margin-top: 15px; text-align: center;">Mostrando primeros 50 registros de ${data.length} total.</p>` : ''}
          ` : ''}

          ${selectedCharts && selectedCharts.length > 0 ? `
          <div style="margin-top: 40px;">
            <h2 style="font-size: 18px; font-weight: bold; color: #1f2937; margin-bottom: 20px;">
              📊 Análisis Gráfico
            </h2>
            ${selectedCharts.map((chartId, index) => `
              <div style="margin-bottom: 30px; text-align: center;">
                <h3 style="font-size: 14px; font-weight: bold; color: #374151; margin-bottom: 15px;">
                  ${getChartTitle(chartId)}
                </h3>
                <div id="chart-${chartId}" style="width: 100%; height: 300px; background: #f9fafb; border: 1px solid #e5e7eb; display: flex; align-items: center; justify-content: center;">
                  <canvas id="canvas-${chartId}" width="600" height="300"></canvas>
                </div>
              </div>
            `).join('')}
          </div>
          ` : ''}
        </div>
      </div>
    `;
  };

  const exportToPDFWithCharts = async (data, statistics, config, filtros, selectedCharts, chartData) => {
    try {
      console.log('🚀 Iniciando exportación PDF mejorada...', {
        dataCount: data.length,
        chartsCount: selectedCharts?.length || 0,
        config
      });

      // Crear un contenedor temporal optimizado
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.top = '0';
      tempContainer.style.width = '210mm';
      tempContainer.style.background = 'white';
      tempContainer.style.fontFamily = 'Arial, sans-serif';
      tempContainer.style.fontSize = '12px';
      tempContainer.style.lineHeight = '1.4';
      tempContainer.style.color = '#333';
      document.body.appendChild(tempContainer);

      // Generar el HTML optimizado
      const reportHTML = await generateReportHTML(data, statistics, config, selectedCharts, chartData);
      tempContainer.innerHTML = reportHTML;

      // Esperar que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 500));

      // Si hay gráficas, generarlas una por una
      if (selectedCharts && selectedCharts.length > 0 && chartData) {
        console.log('📊 Generando gráficas...', selectedCharts);
        
        for (const chartId of selectedCharts) {
          try {
            const canvasElement = tempContainer.querySelector(`#canvas-${chartId}`);
            if (canvasElement && chartData[chartId]) {
              const Chart = (await import('chart.js/auto')).default;
              
              const ctx = canvasElement.getContext('2d');
              const chartInstance = new Chart(ctx, {
                type: chartData[chartId].type || 'bar',
                data: chartData[chartId].data || { labels: [], datasets: [] },
                options: {
                  responsive: false,
                  animation: false,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        fontSize: 10,
                        padding: 10
                      }
                    }
                  },
                  scales: {
                    x: {
                      ticks: {
                        fontSize: 9
                      }
                    },
                    y: {
                      ticks: {
                        fontSize: 9
                      }
                    }
                  }
                }
              });
              
              // Esperar que la gráfica se renderice
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (error) {
            console.warn(`⚠️ Error generando gráfica ${chartId}:`, error);
          }
        }
        
        // Esperar adicional para todas las gráficas
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      console.log('📸 Capturando contenido con html2canvas...');

      // Usar html2canvas con configuración optimizada
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(tempContainer, {
        backgroundColor: '#ffffff',
        scale: 1.2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: tempContainer.scrollWidth,
        height: tempContainer.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      console.log('📄 Generando PDF...');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png', 0.8);
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calcular proporción para ajustar al ancho de la página
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Si la imagen es más alta que una página, dividirla
      if (scaledHeight > pdfHeight) {
        let yPosition = 0;
        let pageCount = 0;
        
        while (yPosition < scaledHeight) {
          if (pageCount > 0) {
            pdf.addPage();
          }
          
          const sourceY = yPosition / ratio;
          const remainingHeight = scaledHeight - yPosition;
          const pageHeight = Math.min(pdfHeight, remainingHeight);
          const sourceHeight = pageHeight / ratio;
          
          // Crear canvas temporal para esta sección
          const sectionCanvas = document.createElement('canvas');
          sectionCanvas.width = imgWidth;
          sectionCanvas.height = sourceHeight;
          const sectionCtx = sectionCanvas.getContext('2d');
          
          sectionCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
          const sectionImgData = sectionCanvas.toDataURL('image/png', 0.8);
          
          pdf.addImage(sectionImgData, 'PNG', 0, 0, pdfWidth, pageHeight);
          
          yPosition += pdfHeight;
          pageCount++;
        }
      } else {
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, scaledHeight);
      }

      // Limpiar el contenedor temporal
      document.body.removeChild(tempContainer);

      // Guardar PDF con nombre descriptivo
      const fileName = `Reporte_de_Gastos_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.pdf`;
      pdf.save(fileName);

      console.log('✅ PDF generado exitosamente:', fileName);
      return { success: true, fileName };

    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      
      // Limpiar si hay error
      const tempContainer = document.querySelector('div[style*="position: absolute"][style*="left: -9999px"]');
      if (tempContainer) {
        document.body.removeChild(tempContainer);
      }
      
      throw new Error(`Error al generar el PDF: ${error.message}`);
    }
  };

  const exportToExcel = async (data, statistics, config, filtros) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Estadísticas
      const statsData = [
        ['REPORTE DE GASTOS - ESTADÍSTICAS'],
        [''],
        ['Total de registros', statistics.total],
        ['Valor total', `$${statistics.totalValue.toLocaleString('es-CO')}`],
        ['Stock bajo', statistics.lowStock],
        ['Alto valor', statistics.highValue],
        [''],
        ['Generado el', new Date().toLocaleDateString('es-ES')]
      ];

      const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
      XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');

      // Hoja 2: Datos detallados
      const detailData = data.map(item => ({
        'Nombre': item.nombre_suministro || '',
        'Categoría': item.categoria || item.tipo_suministro || '',
        'Proveedor': item.nombre_proveedor || '',
        'Cantidad': parseFloat(item.cantidad) || 0,
        'Unidad': item.unidad_medida || '',
        'Precio Unitario': parseFloat(item.precio_unitario) || 0,
        'Total': (parseFloat(item.cantidad) || 0) * (parseFloat(item.precio_unitario) || 0)
      }));

      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      XLSX.utils.book_append_sheet(workbook, detailSheet, 'Detalle');

      // Guardar archivo
      const fileName = `Reporte_de_Gastos_${new Date().toISOString().split('T')[0].replace(/-/g, '_')}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      return { success: true, fileName };

    } catch (error) {
      console.error('Error exportando a Excel:', error);
      throw new Error(`Error al generar el Excel: ${error.message}`);
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
    handleCustomExport,
    exportToPDFWithCharts,
    exportToExcel,
    previewRef
  };
};

export default useReportePersonalizado;