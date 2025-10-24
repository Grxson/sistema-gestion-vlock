import React, { useState } from 'react';
import { ArrowDownTrayIcon, XMarkIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

const AdeudosExport = ({ adeudos, onClose, formatCurrency, formatDate, isOpen }) => {
  const [exportando, setExportando] = useState(false);

  if (!isOpen) return null;

  const handleExportarExcel = () => {
    setExportando(true);
    try {
      // Preparar datos para exportación
      const datosExportar = adeudos.map(adeudo => ({
        'Nombre/Empresa': adeudo.nombre_entidad,
        'Tipo': adeudo.tipo_adeudo === 'nos_deben' ? 'Nos deben' : 'Debemos',
        'Monto Original': parseFloat(adeudo.monto_original || adeudo.monto),
        'Monto Pagado': parseFloat(adeudo.monto_pagado || 0),
        'Monto Pendiente': parseFloat(adeudo.monto_pendiente || adeudo.monto),
        'Estado': adeudo.estado === 'pagado' ? 'Pagado' : adeudo.estado === 'parcial' ? 'Parcial' : 'Pendiente',
        'Fecha Registro': formatDate(adeudo.fecha_registro),
        'Fecha Pago': adeudo.fecha_pago ? formatDate(adeudo.fecha_pago) : '-',
        'Notas': adeudo.notas || '-'
      }));

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(datosExportar);

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Nombre/Empresa
        { wch: 12 }, // Tipo
        { wch: 15 }, // Monto Original
        { wch: 15 }, // Monto Pagado
        { wch: 15 }, // Monto Pendiente
        { wch: 12 }, // Estado
        { wch: 15 }, // Fecha Registro
        { wch: 15 }, // Fecha Pago
        { wch: 50 }  // Notas
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Adeudos');

      // Generar archivo y descargar
      const nombreArchivo = `adeudos_generales_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);

      // Cerrar modal después de exportar
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar a Excel. Por favor intenta nuevamente.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/30 mr-3">
              <ArrowDownTrayIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Exportar a Excel
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={exportando}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Información */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              Se exportarán <strong>{adeudos.length}</strong> {adeudos.length === 1 ? 'adeudo' : 'adeudos'} según los filtros aplicados.
            </p>
          </div>

          {/* Vista previa de columnas */}
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Columnas incluidas:
            </p>
            <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3">
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Nombre/Empresa</li>
                <li>• Tipo (Nos deben / Debemos)</li>
                <li>• Monto Original</li>
                <li>• Monto Pagado</li>
                <li>• Monto Pendiente</li>
                <li>• Estado</li>
                <li>• Fecha de Registro</li>
                <li>• Fecha de Pago</li>
                <li>• Notas</li>
              </ul>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={exportando}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleExportarExcel}
              disabled={exportando}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {exportando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Exportando...
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                  Exportar Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdeudosExport;
