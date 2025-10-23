import React, { useState } from 'react';
import { FaFileExcel, FaFilePdf, FaDownload, FaTimes } from 'react-icons/fa';
import auditoriaService from '../../services/auditoria/auditoriaService';
import { useToast } from '../../contexts/ToastContext';

/**
 * Componente de exportación de registros de auditoría
 */
const AuditoriaExport = ({ filtros, onClose }) => {
  const [exportando, setExportando] = useState(false);
  const [tipoExportacion, setTipoExportacion] = useState('excel');
  const { showToast } = useToast();

  /**
   * Exportar registros
   */
  const handleExportar = async () => {
    setExportando(true);
    try {
      let blob;
      let nombreArchivo;

      if (tipoExportacion === 'excel') {
        blob = await auditoriaService.exportarExcel(filtros);
        nombreArchivo = `auditoria_${new Date().toISOString().split('T')[0]}.xlsx`;
      } else {
        blob = await auditoriaService.exportarPDF(filtros);
        nombreArchivo = `auditoria_${new Date().toISOString().split('T')[0]}.pdf`;
      }

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Exportación completada exitosamente', 'success');
      if (onClose) onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
      showToast('Error al exportar registros', 'error');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-300">
          <div className="flex items-center gap-3">
            <FaDownload className="text-2xl text-blue-600 dark:text-blue-400" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Exportar Registros
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Información de filtros */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Se exportarán los registros según los filtros aplicados actualmente.
            </p>
          </div>

          {/* Selector de tipo de exportación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Formato de Exportación
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Opción Excel */}
              <button
                onClick={() => setTipoExportacion('excel')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoExportacion === 'excel'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-300 dark:border-dark-300 hover:border-green-300 dark:hover:border-green-700'
                }`}
              >
                <FaFileExcel className={`text-4xl mx-auto mb-2 ${
                  tipoExportacion === 'excel'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  tipoExportacion === 'excel'
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  Excel
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .xlsx
                </p>
              </button>

              {/* Opción PDF */}
              <button
                onClick={() => setTipoExportacion('pdf')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tipoExportacion === 'pdf'
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-dark-300 hover:border-red-300 dark:hover:border-red-700'
                }`}
              >
                <FaFilePdf className={`text-4xl mx-auto mb-2 ${
                  tipoExportacion === 'pdf'
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  tipoExportacion === 'pdf'
                    ? 'text-red-700 dark:text-red-300'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  PDF
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  .pdf
                </p>
              </button>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Información incluida:
            </h4>
            <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Fecha y hora de cada acción</li>
              <li>• Usuario que realizó la acción</li>
              <li>• Tipo de acción realizada</li>
              <li>• Tabla afectada</li>
              <li>• Descripción detallada</li>
              <li>• Dirección IP</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-dark-300">
          <button
            onClick={onClose}
            disabled={exportando}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-200 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleExportar}
            disabled={exportando}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {exportando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exportando...
              </>
            ) : (
              <>
                <FaDownload />
                Exportar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditoriaExport;
