import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaListUl, FaEye, FaEyeSlash } from 'react-icons/fa';

const ProveedorDeactivateModal = ({ 
  proveedor, 
  suministrosData,
  onClose, 
  onConfirm, 
  loading = false 
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [forceDeactivate, setForceDeactivate] = useState(false);
  
  if (!proveedor || !suministrosData) return null;

  const { suministrosCount, suministrosAfectados, options } = suministrosData;

  const handleConfirm = () => {
    onConfirm(proveedor, forceDeactivate);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <FaExclamationTriangle className="w-6 h-6 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Proveedor con Suministros Asociados
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={loading}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          
          {/* Warning Message */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <FaExclamationTriangle className="w-5 h-5 text-amber-500 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-1">
                  No se puede desactivar automáticamente
                </h4>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  El proveedor <strong>"{proveedor.nombre}"</strong> tiene <strong>{suministrosCount}</strong> suministros registrados en el sistema.
                </p>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-6">
            <h4 className="text-md font-medium text-gray-900 dark:text-white">
              ¿Qué deseas hacer?
            </h4>
            
            {/* Show/Hide Details Button */}
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
            >
              {showDetails ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
              <span>
                {showDetails ? 'Ocultar' : 'Ver'} detalles de los suministros afectados
              </span>
            </button>

            {/* Suministros Details */}
            {showDetails && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <FaListUl className="w-4 h-4 text-gray-500" />
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Suministros afectados ({Math.min(suministrosAfectados.length, 10)} de {suministrosCount})
                  </h5>
                </div>
                
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {suministrosAfectados.map((suministro) => (
                    <div
                      key={suministro.id}
                      className="bg-white dark:bg-gray-600 rounded p-3 text-sm"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {suministro.nombre}
                          </p>
                          {suministro.descripcion && (
                            <p className="text-gray-600 dark:text-gray-300 text-xs">
                              {suministro.descripcion}
                            </p>
                          )}
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Proyecto: {suministro.proyecto} • Estado: {suministro.estado}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Cantidad: {suministro.cantidad}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {suministrosCount > 10 && (
                    <div className="text-center py-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        ... y {suministrosCount - 10} suministros más
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Force Deactivate Option */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <label className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={forceDeactivate}
                  onChange={(e) => setForceDeactivate(e.target.checked)}
                  className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                    Desactivar de todas formas
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                    Los suministros mantendrán la referencia a este proveedor, pero no aparecerá 
                    en las listas desplegables para nuevos suministros. Los datos existentes 
                    no se perderán.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Recommendation */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              💡 Recomendación:
            </h5>
            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <li>• Revisa los suministros listados antes de proceder</li>
              <li>• Considera transferir los suministros a otro proveedor activo</li>
              <li>• O elimina los suministros que ya no sean necesarios</li>
              <li>• La desactivación no eliminará los datos existentes</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-600">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={loading || !forceDeactivate}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 ${
              forceDeactivate 
                ? 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Procesando...</span>
              </div>
            ) : (
              'Desactivar Proveedor'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProveedorDeactivateModal;
