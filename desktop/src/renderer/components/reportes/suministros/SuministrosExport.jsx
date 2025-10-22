import React, { useState } from 'react';
import { 
  FaFilePdf, 
  FaFileExcel, 
  FaDownload,
  FaTimes
} from 'react-icons/fa';
import apiService from '../../../services/api';

/**
 * Componente de exportación para reportes de suministros
 * Permite exportar a PDF y Excel con configuración personalizada
 */
export default function SuministrosExport({ dashboardData, filtros }) {
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    title: 'Reporte de Suministros y Materiales',
    subtitle: '',
    includeFilters: true,
    includeStats: true,
    includeCharts: {
      consumoPorObra: true,
      distribucionProveedores: true,
      analisisCategorias: true,
      consumoMensual: true,
      materialesMasUsados: true
    },
    includeTable: true
  });

  const exportQuickPDF = async () => {
    try {
      setExportingPDF(true);
      const blob = await apiService.exportDashboardSuministrosToPDF(filtros);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-suministros-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar PDF. Por favor, intente nuevamente.');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportQuickExcel = async () => {
    try {
      setExportingExcel(true);
      const blob = await apiService.exportDashboardSuministrosToExcel(filtros);
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte-suministros-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar Excel. Por favor, intente nuevamente.');
    } finally {
      setExportingExcel(false);
    }
  };

  const exportCustomPDF = async () => {
    try {
      setExportingPDF(true);
      setShowModal(false);
      
      const activeCharts = {};
      Object.keys(exportConfig.includeCharts).forEach(key => {
        activeCharts[key] = { enabled: exportConfig.includeCharts[key] };
      });
      
      const blob = await apiService.exportDashboardCustomToPDF(
        exportConfig, 
        activeCharts, 
        dashboardData, 
        filtros
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportConfig.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando PDF personalizado:', error);
      alert('Error al exportar PDF personalizado. Por favor, intente nuevamente.');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportCustomExcel = async () => {
    try {
      setExportingExcel(true);
      setShowModal(false);
      
      const activeCharts = {};
      Object.keys(exportConfig.includeCharts).forEach(key => {
        activeCharts[key] = { enabled: exportConfig.includeCharts[key] };
      });
      
      const blob = await apiService.exportDashboardCustomToExcel(
        exportConfig, 
        activeCharts, 
        dashboardData, 
        filtros
      );
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportConfig.title.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando Excel personalizado:', error);
      alert('Error al exportar Excel personalizado. Por favor, intente nuevamente.');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleChartToggle = (chartKey) => {
    setExportConfig(prev => ({
      ...prev,
      includeCharts: {
        ...prev.includeCharts,
        [chartKey]: !prev.includeCharts[chartKey]
      }
    }));
  };

  return (
    <>
      {/* Botones de exportación */}
      <div className="flex items-center gap-2">
        <button
          onClick={exportQuickPDF}
          disabled={exportingPDF}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FaFilePdf className="w-4 h-4" />
          {exportingPDF ? 'Exportando...' : 'PDF'}
        </button>
        
        <button
          onClick={exportQuickExcel}
          disabled={exportingExcel}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FaFileExcel className="w-4 h-4" />
          {exportingExcel ? 'Exportando...' : 'Excel'}
        </button>
        
        <button
          onClick={() => setShowModal(true)}
          disabled={exportingPDF || exportingExcel}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
        >
          <FaDownload className="w-4 h-4" />
          Personalizado
        </button>
      </div>

      {/* Modal de configuración personalizada */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Configuración de Exportación Personalizada
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                >
                  <FaTimes className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Configuración General */}
              <div className="space-y-4">
                <h4 className="text-md font-medium text-gray-900 dark:text-white">
                  Información del Reporte
                </h4>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Título del Reporte
                  </label>
                  <input
                    type="text"
                    value={exportConfig.title}
                    onChange={(e) => setExportConfig(prev => ({...prev, title: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Título del reporte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subtítulo (opcional)
                  </label>
                  <input
                    type="text"
                    value={exportConfig.subtitle}
                    onChange={(e) => setExportConfig(prev => ({...prev, subtitle: e.target.value}))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Subtítulo del reporte"
                  />
                </div>
              </div>

              {/* Opciones de Contenido */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Contenido a Incluir
                </h4>
                
                <div className="space-y-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeFilters}
                      onChange={(e) => setExportConfig(prev => ({...prev, includeFilters: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Filtros aplicados
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeStats}
                      onChange={(e) => setExportConfig(prev => ({...prev, includeStats: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Estadísticas generales
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportConfig.includeTable}
                      onChange={(e) => setExportConfig(prev => ({...prev, includeTable: e.target.checked}))}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                      Tabla de datos detallados
                    </span>
                  </label>
                </div>
              </div>

              {/* Selección de Gráficos */}
              <div>
                <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                  Gráficos a Incluir
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { key: 'consumoPorObra', label: '📊 Consumo por Obra' },
                    { key: 'distribucionProveedores', label: '🏢 Distribución por Proveedores' },
                    { key: 'analisisCategorias', label: '📈 Análisis por Categorías' },
                    { key: 'consumoMensual', label: '📅 Consumo Mensual' },
                    { key: 'materialesMasUsados', label: '📦 Materiales Más Usados' }
                  ].map(chart => (
                    <label key={chart.key} className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={exportConfig.includeCharts[chart.key]}
                        onChange={() => handleChartToggle(chart.key)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm text-gray-700 dark:text-gray-300">
                        {chart.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-500 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={exportCustomPDF}
                disabled={exportingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFilePdf className="w-4 h-4" />
                {exportingPDF ? 'Generando...' : 'Exportar PDF'}
              </button>
              
              <button
                onClick={exportCustomExcel}
                disabled={exportingExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFileExcel className="w-4 h-4" />
                {exportingExcel ? 'Generando...' : 'Exportar Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
