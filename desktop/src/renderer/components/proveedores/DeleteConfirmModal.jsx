import React, { useState } from 'react';
import { FaExclamationTriangle, FaTimes, FaTrashAlt } from 'react-icons/fa';

const DeleteConfirmModal = ({ 
  proveedor, 
  onClose, 
  onConfirm, 
  loading = false,
  type = 'deactivate' // 'deactivate', 'activate', 'delete'
}) => {
  const [confirmText, setConfirmText] = useState('');
  
  if (!proveedor) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'delete':
        return {
          title: 'Eliminar Definitivamente',
          message: 'Esta acción eliminará PERMANENTEMENTE el proveedor de la base de datos.',
          warning: 'Esta acción es IRREVERSIBLE. Una vez eliminado, no podrás recuperar la información.',
          buttonText: 'Eliminar Definitivamente',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: <FaTrashAlt className="w-6 h-6 text-red-600" />,
          requiresConfirmation: true,
          confirmationText: proveedor.nombre?.toUpperCase() || `PROVEEDOR-${proveedor.id_proveedor}`
        };
      case 'activate':
        return {
          title: 'Reactivar Proveedor',
          message: `¿Estás seguro que deseas reactivar el proveedor "${proveedor.nombre}"?`,
          warning: 'El proveedor volverá a estar disponible en el sistema.',
          buttonText: 'Reactivar',
          buttonColor: 'bg-green-600 hover:bg-green-700 focus:ring-green-500',
          icon: <FaExclamationTriangle className="w-6 h-6 text-green-600" />,
          requiresConfirmation: false
        };
      default: // deactivate
        return {
          title: 'Desactivar Proveedor',
          message: `¿Estás seguro que deseas desactivar el proveedor "${proveedor.nombre}"?`,
          warning: 'El proveedor se ocultará de las listas principales pero conservará toda su información.',
          buttonText: 'Desactivar',
          buttonColor: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          icon: <FaExclamationTriangle className="w-6 h-6 text-red-600" />,
          requiresConfirmation: false
        };
    }
  };

  const config = getModalConfig();
  const canConfirm = !config.requiresConfirmation || confirmText === config.confirmationText;

  const handleConfirm = () => {
    if (canConfirm && onConfirm) {
      onConfirm(proveedor);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {config.icon}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {config.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
              {config.message}
            </p>
            <p className={`text-sm font-medium ${
              type === 'delete' ? 'text-red-600 dark:text-red-400' : 
              type === 'activate' ? 'text-green-600 dark:text-green-400' :
              'text-orange-600 dark:text-orange-400'
            }`}>
              {config.warning}
            </p>
          </div>

          {/* Proveedor Info */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3 mb-4">
            <div className="text-sm">
              <div className="font-medium text-gray-900 dark:text-white">
                {proveedor.nombre || `Proveedor #${proveedor.id_proveedor}`}
              </div>
              {proveedor.razon_social && proveedor.razon_social !== proveedor.nombre && (
                <div className="text-gray-600 dark:text-gray-400">
                  {proveedor.razon_social}
                </div>
              )}
              <div className="text-gray-500 dark:text-gray-500">
                ID: {proveedor.id_proveedor}
              </div>
            </div>
          </div>

          {/* Confirmation Input for Delete */}
          {config.requiresConfirmation && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Para confirmar la eliminación, escribe: <strong>{config.confirmationText}</strong>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Escribe "${config.confirmationText}"`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading || !canConfirm}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Procesando...
                </div>
              ) : (
                config.buttonText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
