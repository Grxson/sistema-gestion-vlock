import React from 'react';
import { FaChartBar, FaTimes, FaFilePdf, FaFileExcel } from 'react-icons/fa';

const ReportePersonalizadoModal = ({
  showModal,
  setShowModal,
  reportConfig,
  setReportConfig,
  handleCustomExport,
  availableCharts = []
}) => {
  if (!showModal) return null;

  // Agrupar gráficas por categoría
  const chartsByCategory = availableCharts.reduce((acc, chart) => {
    const category = chart.category || 'otros';
    if (!acc[category]) acc[category] = [];
    acc[category].push(chart);
    return acc;
  }, {});

  const categoryLabels = {
    financiero: 'Análisis Financiero',
    cantidad: 'Análisis de Cantidad',
    tecnico: 'Análisis Técnico',
    unidades: 'Análisis por Unidades',
    horas: 'Análisis de Horas',
    avanzado: 'Gráficas Profesionales Avanzadas',
    otros: 'Otros Análisis'
  };

  // Función para seleccionar todas las gráficas de una categoría
  const selectAllInCategory = (category) => {
    const categoryCharts = chartsByCategory[category] || [];
    const newCharts = { ...reportConfig.charts };
    
    categoryCharts.forEach(chart => {
      newCharts[chart.key] = true;
    });
    
    setReportConfig({
      ...reportConfig,
      charts: newCharts
    });
  };

  // Función para deseleccionar todas las gráficas de una categoría
  const selectNoneInCategory = (category) => {
    const categoryCharts = chartsByCategory[category] || [];
    const newCharts = { ...reportConfig.charts };
    
    categoryCharts.forEach(chart => {
      newCharts[chart.key] = false;
    });
    
    setReportConfig({
      ...reportConfig,
      charts: newCharts
    });
  };

  // Función para seleccionar todas las gráficas
  const selectAllCharts = () => {
    const newCharts = {};
    availableCharts.forEach(chart => {
      newCharts[chart.key] = true;
    });
    setReportConfig({
      ...reportConfig,
      charts: newCharts
    });
  };

  // Función para deseleccionar todas las gráficas
  const selectNoCharts = () => {
    const newCharts = {};
    availableCharts.forEach(chart => {
      newCharts[chart.key] = false;
    });
    setReportConfig({
      ...reportConfig,
      charts: newCharts
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-100 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            Configurar Reporte Personalizado
          </h2>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Reporte */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Información del Reporte
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Título del Reporte
                </label>
                <input
                  type="text"
                  value={reportConfig.title}
                  onChange={(e) => setReportConfig({...reportConfig, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-dark-200 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Reporte de Suministros"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subtítulo (Opcional)
                </label>
                <input
                  type="text"
                  value={reportConfig.subtitle}
                  onChange={(e) => setReportConfig({...reportConfig, subtitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-dark-200 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Sistema de Gestión VLock"
                />
              </div>
            </div>
          </div>

          {/* Contenido a Incluir */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Contenido a Incluir
            </h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeStatistics}
                  onChange={(e) => setReportConfig({...reportConfig, includeStatistics: e.target.checked})}
                  className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Estadísticas Generales</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeTable}
                  onChange={(e) => setReportConfig({...reportConfig, includeTable: e.target.checked})}
                  className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Tabla Completa de Suministros
                  <span className="block text-xs text-gray-500">
                    (Incluye todos los registros con detalles completos)
                  </span>
                </span>
              </label>

              {reportConfig.includeTable && (
                <div className="ml-7">
                  <label className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="tableFormat"
                      value="id"
                      checked={reportConfig.tableFormat === 'id'}
                      onChange={(e) => setReportConfig({...reportConfig, tableFormat: e.target.value})}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ID Original (conservar números reales de suministros)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tableFormat"
                      value="enumerated"
                      checked={reportConfig.tableFormat === 'enumerated'}
                      onChange={(e) => setReportConfig({...reportConfig, tableFormat: e.target.value})}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Enumerada (1, 2, 3... + ID original)
                    </span>
                  </label>
                </div>
              )}

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={reportConfig.includeCharts}
                  onChange={(e) => setReportConfig({...reportConfig, includeCharts: e.target.checked})}
                  className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Gráficos</span>
              </label>

              {reportConfig.includeCharts && availableCharts.length > 0 && (
                <div className="ml-7 space-y-4">
                  {/* Botones de control general */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={selectAllCharts}
                      className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-md transition-colors"
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={selectNoCharts}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                    >
                      Ninguna
                    </button>
                  </div>

                  {/* Gráficas agrupadas por categoría */}
                  {Object.entries(chartsByCategory).map(([category, charts]) => (
                    <div key={category} className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {categoryLabels[category]}
                        </h4>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => selectAllInCategory(category)}
                            className="px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 rounded transition-colors"
                          >
                            Todas
                          </button>
                          <button
                            type="button"
                            onClick={() => selectNoneInCategory(category)}
                            className="px-2 py-1 text-xs bg-gray-50 hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded transition-colors"
                          >
                            Ninguna
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {charts.map((chart) => (
                          <label key={chart.key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={reportConfig.charts[chart.key] || false}
                              onChange={(e) => setReportConfig({
                                ...reportConfig, 
                                charts: {...reportConfig.charts, [chart.key]: e.target.checked}
                              })}
                              className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">{chart.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-lg transition-colors duration-200"
            >
              Cancelar
            </button>
            
            <button
              onClick={() => handleCustomExport('pdf')}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaFilePdf className="w-4 h-4" />
              Exportar a PDF
            </button>
            
            <button
              onClick={() => handleCustomExport('excel')}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <FaFileExcel className="w-4 h-4" />
              Exportar a Excel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportePersonalizadoModal;
