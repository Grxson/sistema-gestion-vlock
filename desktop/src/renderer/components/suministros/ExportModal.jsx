import React, { useState } from 'react';
import { FaTimes, FaFileExcel, FaFilePdf, FaCheckCircle, FaFilter } from 'react-icons/fa';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  onExport,
  totalRegistros,
  registrosFiltrados,
  filtrosActivos
}) => {
  const [exportConfig, setExportConfig] = useState({
    formato: 'excel', // 'excel' o 'pdf'
    orientacion: 'landscape', // 'portrait' o 'landscape' (solo PDF)
  });

  if (!isOpen) return null;

  const handleExport = () => {
    onExport(exportConfig);
    onClose();
  };

  const registrosAExportar = exportConfig.incluirTodos ? totalRegistros : registrosFiltrados;
  const hasFiltros = Array.isArray(filtrosActivos) && filtrosActivos.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FaFileExcel className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Exportar
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información de registros */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                  Registros disponibles
                </h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Total en sistema:</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{totalRegistros}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">{hasFiltros ? 'Con filtros aplicados:' : 'En vista actual:'}</span>
                    <span className="font-semibold text-blue-900 dark:text-blue-100">{hasFiltros ? registrosFiltrados : totalRegistros}</span>
                  </div>
                </div>
                {hasFiltros && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300 mb-2">
                      <FaFilter className="w-3 h-3" />
                      <span className="font-medium">Filtros activos:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {filtrosActivos.map((filtro, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 text-xs rounded-md"
                        >
                          {filtro}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Formato de exportación */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Formato de exportación
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportConfig({ ...exportConfig, formato: 'excel' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.formato === 'excel'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                <FaFileExcel className={`w-8 h-8 mx-auto mb-2 ${
                  exportConfig.formato === 'excel'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">Excel (.xlsx)</div>
              </button>

              <button
                onClick={() => setExportConfig({ ...exportConfig, formato: 'pdf' })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.formato === 'pdf'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
                }`}
              >
                <FaFilePdf className={`w-8 h-8 mx-auto mb-2 ${
                  exportConfig.formato === 'pdf'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <div className="text-sm font-semibold text-gray-900 dark:text-white">PDF</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {exportConfig.formato === 'excel' ? <FaFileExcel className="w-4 h-4" /> : <FaFilePdf className="w-4 h-4" />}
            Exportar ahora
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
