import { useState } from 'react';
import { useToast } from '../contexts/ToastContext';

const useReportePersonalizado = () => {
  const { showSuccess, showError } = useToast();
  
  const [showReportModal, setShowReportModal] = useState(false);
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
      setShowReportModal(false);
      
      // Preparar datos para el reporte personalizado
      const dataToExport = suministrosData.map((suministro, index) => ({
        ...suministro,
        numero_fila: index + 1, // Para tabla enumerada
        proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
      }));

      // Estadísticas para el reporte
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

      // Estructura de datos que espera el backend
      const payload = {
        title: reportConfig.title,
        subtitle: reportConfig.subtitle,
        includeStatistics: reportConfig.includeStatistics,
        includeTable: reportConfig.includeTable,
        includeCharts: reportConfig.includeCharts,
        tableFormat: reportConfig.tableFormat,
        orientation: 'landscape', // Formato horizontal
        charts: reportConfig.charts,
        data: dataToExport,
        statistics,
        filters: filtros,
        timestamp: new Date().toISOString()
      };

      console.log('Enviando payload:', payload); // Para debug

      if (format === 'pdf') {
        // Usar la API de exportación personalizada
        const api = (await import('../services/api')).default;
        
        // Crear un enlace temporal para descargar
        const response = await fetch(api.baseURL + '/reportes/dashboard-suministros/export/custom/pdf', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api.getToken()}`
          },
          body: JSON.stringify(payload)
        });

        console.log('Response status:', response.status); // Para debug

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // Crear blob y descargar el archivo
        const blob = await response.blob();
        console.log('Blob size:', blob.size); // Para debug
        
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reporte-suministros-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Exportación exitosa', 'El reporte personalizado en PDF ha sido descargado');
      } else if (format === 'excel') {
        // Similar para Excel
        const api = (await import('../services/api')).default;
        
        const response = await fetch(api.baseURL + '/reportes/dashboard-suministros/export/custom/excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${api.getToken()}`
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `reporte-suministros-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('Exportación exitosa', 'El reporte personalizado en Excel ha sido descargado');
      }

    } catch (error) {
      console.error(`Error exportando reporte personalizado a ${format}:`, error);
      showError('Error', `No se pudo generar el reporte personalizado en ${format.toUpperCase()}: ${error.message}`);
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
