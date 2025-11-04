import React, { useState } from 'react';
import { FaTrash, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const SuministroDeleteConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  suministro,
  type = 'suministro' // 'suministro' o 'recibo'
}) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isRecibo = type === 'recibo';
  const itemName = isRecibo ? 'recibo' : 'suministro';
  const itemTitle = isRecibo ? 
    `${suministro?.numero_recibo || 'Recibo sin número'}` : 
    `${suministro?.nombre || 'Suministro sin descripción'}`;

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(suministro);
      onClose();
    } catch (error) {
      console.error('Error al eliminar:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-dark backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Eliminar {itemName.charAt(0).toUpperCase() + itemName.slice(1)}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            disabled={isLoading}
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Warning Message */}
          <div className="mb-4">
            <p className="text-gray-700 dark:text-gray-300 mb-2">
              Esta acción eliminará {isRecibo ? 'PERMANENTEMENTE' : 'definitivamente'} el {itemName}:
            </p>
            
            {/* Item Info */}
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {itemTitle}
              </p>
              {suministro?.id_suministro && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  ID: {suministro.id_suministro}
                </p>
              )}
              {isRecibo && suministro?.suministros && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Contiene {suministro.suministros.length} suministro(s)
                </p>
              )}
            </div>
          </div>

          {/* Danger Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FaExclamationTriangle className="w-5 h-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">
                  ⚠️ Esta acción es IRREVERSIBLE
                </p>
                <p className="text-sm text-red-700 dark:text-red-400">
                  {isRecibo 
                    ? 'Se eliminarán todos los suministros asociados a este recibo. Una vez eliminado, no podrás recuperar esta información.'
                    : 'Una vez eliminado, no podrás recuperar este suministro.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-offset-gray-800 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-gray-800 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Eliminando...</span>
                </div>
              ) : (
                <>
                  <FaTrash className="inline mr-2" />
                  Confirmar Eliminación
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuministroDeleteConfirmModal;