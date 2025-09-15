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
      gastosPorMes: true,
      valorPorCategoria: true,
      suministrosPorMes: true,
      gastosPorProyecto: false,
      gastosPorProveedor: false,
      cantidadPorEstado: false,
      distribucionTipos: true,
      tendenciaEntregas: false,
      codigosProducto: false
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
          acc[s.tipo_suministro] = (acc[s.tipo_suministro] || 0) + 1;
          return acc;
        }, {}),
        lowStock: suministrosData.filter(s => s.stock_minimo && parseFloat(s.cantidad) < parseFloat(s.stock_minimo)).length,
        highValue: suministrosData.filter(s => (parseFloat(s.precio_unitario) * parseFloat(s.cantidad)) > 1000000).length
      };

      if (format === 'pdf') {
        await exportToPDF(dataToExport, statistics, reportConfig, filtros);
      } else if (format === 'excel') {
        await exportToExcel(dataToExport, statistics, reportConfig, filtros);
      }

      setShowReportModal(false);
      showSuccess('Exportación exitosa', `El reporte personalizado en ${format.toUpperCase()} ha sido generado`);

    } catch (error) {
      console.error(`Error exportando reporte personalizado a ${format}:`, error);
      showError('Error', `No se pudo generar el reporte personalizado en ${format.toUpperCase()}: ${error.message}`);
    }
  };

  // Función para exportar a PDF usando html2canvas + jsPDF con preview
  const exportToPDF = async (data, statistics, config, filtros, chartsData = {}) => {
    try {
      // Detectar tema oscuro
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;

      // Crear un elemento temporal para renderizar el reporte
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      tempDiv.style.width = '1200px'; // Ancho fijo para consistencia
      tempDiv.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
      
      // Agregar el contenido del reporte
      const reportContent = `
        <div style="background: ${isDarkMode ? '#1f2937' : '#ffffff'}; padding: 32px; min-height: 100vh; font-family: system-ui, -apple-system, sans-serif;">
          <!-- Encabezado -->
          <div style="text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'};">
            <h1 style="font-size: 28px; font-weight: bold; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 8px;">
              ${config.title || 'Reporte de Suministros'}
            </h1>
            ${config.subtitle ? `
              <h2 style="font-size: 18px; color: ${isDarkMode ? '#9ca3af' : '#6b7280'}; margin-bottom: 8px;">
                ${config.subtitle}
              </h2>
            ` : ''}
            <p style="font-size: 14px; color: ${isDarkMode ? '#6b7280' : '#9ca3af'};">
              Generado el: ${new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>

          ${config.includeStatistics ? `
          <!-- Estadísticas -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 24px; font-weight: 600; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 24px;">
              Estadísticas Generales
            </h3>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 24px;">
              <div style="background: ${isDarkMode ? '#1e3a8a20' : '#dbeafe'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#60a5fa' : '#2563eb'};">Total Suministros</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#bfdbfe' : '#1e40af'};">
                  ${statistics.total.toLocaleString()}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#14532d20' : '#dcfce7'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#4ade80' : '#16a34a'};">Valor Total</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#bbf7d0' : '#15803d'};">
                  $${statistics.totalValue.toLocaleString('es-CO')}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#92400e20' : '#fef3c7'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#fbbf24' : '#d97706'};">Stock Bajo</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#fde68a' : '#b45309'};">
                  ${statistics.lowStock}
                </p>
              </div>
              <div style="background: ${isDarkMode ? '#581c8720' : '#f3e8ff'}; padding: 16px; border-radius: 8px;">
                <h4 style="font-size: 14px; font-weight: 500; color: ${isDarkMode ? '#a855f7' : '#9333ea'};">Alto Valor</h4>
                <p style="font-size: 24px; font-weight: bold; color: ${isDarkMode ? '#d8b4fe' : '#7c3aed'};">
                  ${statistics.highValue}
                </p>
              </div>
            </div>
          </div>
          ` : ''}

          ${config.includeTable && data.length > 0 ? `
          <!-- Tabla -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 24px; font-weight: 600; color: ${isDarkMode ? '#ffffff' : '#111827'}; margin-bottom: 24px;">
              Detalle de Suministros (${Math.min(data.length, 50)} de ${data.length})
            </h3>
            <table style="width: 100%; border-collapse: collapse; background: ${isDarkMode ? '#374151' : '#ffffff'}; border: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};">
              <thead style="background: ${isDarkMode ? '#4b5563' : '#f9fafb'};">
                <tr>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    ${config.tableFormat === 'enumerated' ? '#' : 'ID'}
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Descripción
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Tipo
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Cantidad
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Precio
                  </th>
                  <th style="padding: 12px 8px; text-align: left; font-size: 12px; font-weight: 500; color: ${isDarkMode ? '#d1d5db' : '#6b7280'}; border-bottom: 1px solid ${isDarkMode ? '#6b7280' : '#d1d5db'};">
                    Proyecto
                  </th>
                </tr>
              </thead>
              <tbody>
                ${data.slice(0, 50).map((item, index) => `
                  <tr style="border-bottom: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'};">
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${config.tableFormat === 'enumerated' ? item.numero_fila : item.id_suministro}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(item.descripcion || '').substring(0, 40)}${(item.descripcion || '').length > 40 ? '...' : ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${item.tipo_suministro || ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(parseFloat(item.cantidad) || 0).toLocaleString()} ${item.unidad || ''}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      $${(parseFloat(item.precio_unitario) || 0).toLocaleString('es-CO')}
                    </td>
                    <td style="padding: 8px; font-size: 11px; color: ${isDarkMode ? '#ffffff' : '#111827'};">
                      ${(item.proyecto || '').substring(0, 20)}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}

          <!-- Pie de página -->
          <div style="border-top: 1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}; padding-top: 24px; margin-top: 32px;">
            <div style="text-align: center; font-size: 12px; color: ${isDarkMode ? '#6b7280' : '#9ca3af'};">
              <p>Sistema de Gestión VLock - Reporte Generado Automáticamente</p>
            </div>
          </div>
        </div>
      `;

      tempDiv.innerHTML = reportContent;
      document.body.appendChild(tempDiv);

      // Esperar un momento para que se renderice
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capturar con html2canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: 1200,
        height: tempDiv.scrollHeight
      });

      // Crear PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgData = canvas.toDataURL('image/png');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
      
      const imgX = (pageWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Limpiar
      document.body.removeChild(tempDiv);

      // Guardar
      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Error generando PDF:', error);
      throw error;
    }
  };

  // Función para exportar a Excel
  const exportToExcel = async (data, statistics, config, filtros) => {
    try {
      const workbook = XLSX.utils.book_new();

      // Hoja 1: Datos principales
      if (config.includeTable && data.length > 0) {
        const worksheetData = data.map(item => ({
          [config.tableFormat === 'enumerated' ? 'Número' : 'ID']: config.tableFormat === 'enumerated' ? item.numero_fila : item.id_suministro,
          'Descripción': item.descripcion || '',
          'Tipo': item.tipo_suministro || '',
          'Cantidad': item.cantidad || '',
          'Unidad': item.unidad || '',
          'Precio Unitario': parseFloat(item.precio_unitario) || 0,
          'Valor Total': (parseFloat(item.precio_unitario) || 0) * (parseFloat(item.cantidad) || 0),
          'Proyecto': item.proyecto || '',
          'Proveedor': item.proveedor || '',
          'Estado': item.estado || '',
          'Fecha Recibo': item.fecha_recibo || '',
          'Observaciones': item.observaciones || ''
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Suministros');
      }

      // Hoja 2: Estadísticas
      if (config.includeStatistics) {
        const statsData = [
          { Estadística: 'Total de Suministros', Valor: statistics.total },
          { Estadística: 'Valor Total', Valor: statistics.totalValue },
          { Estadística: 'Stock Bajo', Valor: statistics.lowStock },
          { Estadística: 'Alto Valor', Valor: statistics.highValue },
          { Estadística: '', Valor: '' },
          { Estadística: 'Por Categoría:', Valor: '' },
          ...Object.entries(statistics.byCategory).map(([cat, count]) => ({
            Estadística: cat,
            Valor: count
          }))
        ];

        const statsWorksheet = XLSX.utils.json_to_sheet(statsData);
        XLSX.utils.book_append_sheet(workbook, statsWorksheet, 'Estadísticas');
      }

      // Guardar archivo
      const fileName = `${config.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

    } catch (error) {
      console.error('Error generando Excel:', error);
      throw error;
    }
  };

  return {
    showReportModal,
    setShowReportModal,
    reportConfig,
    setReportConfig,
    handleCustomExport
  };
};

export default useReportePersonalizado;
