import React, { useState } from 'react';
import { 
  TrashIcon, 
  UserMinusIcon, 
  UserPlusIcon, 
  ExclamationTriangleIcon, 
  XMarkIcon 
} from '@heroicons/react/24/outline';

const EmpleadoConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  empleado,
  type = 'delete' // 'delete', 'delete-permanent', 'activate', 'deactivate'
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'delete':
        return {
          title: 'Dar de Baja Empleado',
          message: '¿Estás seguro de que deseas dar de baja este empleado?',
          submessage: 'El empleado será marcado como inactivo pero mantendrá su información en el sistema.',
          confirmText: 'DAR DE BAJA',
          icon: UserMinusIcon,
          iconColor: 'text-orange-500',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          buttonText: 'Dar de Baja'
        };
      case 'delete-permanent':
        return {
          title: 'Eliminar Empleado Permanentemente',
          message: '¿Estás seguro de que deseas eliminar permanentemente este empleado?',
          submessage: 'Esta acción NO se puede deshacer. El empleado será eliminado completamente del sistema.',
          confirmText: 'ELIMINAR PERMANENTEMENTE',
          icon: TrashIcon,
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-600 hover:bg-red-700',
          buttonText: 'Eliminar Permanentemente'
        };
      case 'deactivate':
        return {
          title: 'Desactivar Empleado',
          message: '¿Estás seguro de que deseas desactivar este empleado?',
          submessage: 'El empleado será marcado como inactivo pero mantendrá su información en el sistema.',
          confirmText: 'DESACTIVAR',
          icon: UserMinusIcon,
          iconColor: 'text-orange-500',
          buttonColor: 'bg-orange-600 hover:bg-orange-700',
          buttonText: 'Desactivar'
        };
      case 'activate':
        return {
          title: 'Activar Empleado',
          message: '¿Estás seguro de que deseas activar este empleado?',
          submessage: 'El empleado volverá a estar activo en el sistema.',
          confirmText: 'ACTIVAR',
          icon: UserPlusIcon,
          iconColor: 'text-green-500',
          buttonColor: 'bg-green-600 hover:bg-green-700',
          buttonText: 'Activar'
        };
      default:
        return {};
    }
  };

  const config = getModalConfig();
  const IconComponent = config.icon;
  const empleadoName = empleado ? `${empleado.nombre || ''} ${empleado.apellido || ''}`.trim() : 'Empleado';
  const isConfirmValid = confirmText === config.confirmText;

  const handleConfirm = async () => {
    if (!isConfirmValid) return;
    
    setIsLoading(true);
    try {
      await onConfirm(empleado.id_empleado);
      onClose();
    } catch (error) {
      console.error('Error en operación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 mr-3`}>
              <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {config.title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>

          {/* Message */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {config.message}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {config.submessage}
            </p>
            
            {/* Employee Info */}
            <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-3 mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Empleado: <span className="text-gray-900 dark:text-white">{empleadoName}</span>
              </p>
              {empleado?.nss && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  NSS: {empleado.nss}
                </p>
              )}
              {empleado?.oficio?.nombre && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Oficio: {empleado.oficio.nombre}
                </p>
              )}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Para confirmar, escribe: <span className="font-mono text-red-600 dark:text-red-400">{config.confirmText}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
              placeholder={`Escribe "${config.confirmText}"`}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isConfirmValid || isLoading}
              className={`flex-1 px-4 py-2 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${config.buttonColor}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

export default EmpleadoConfirmModal;
