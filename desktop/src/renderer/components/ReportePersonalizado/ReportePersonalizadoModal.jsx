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
                <span className="text-sm text-gray-700 dark:text-gray-300">Tabla de Suministros</span>
              </label>

              {reportConfig.includeTable && (
                <div className="ml-7">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="tableFormat"
                      value="id"
                      checked={reportConfig.tableFormat === 'id'}
                      onChange={(e) => setReportConfig({...reportConfig, tableFormat: e.target.value})}
                      className="mr-2 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Mostrar con ID</span>
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
                    <span className="text-sm text-gray-600 dark:text-gray-400">Tabla Enumerada (1, 2, 3...)</span>
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
                <div className="ml-7 space-y-2">
                  {availableCharts.map((chart, index) => (
                    <label key={index} className="flex items-center">
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
