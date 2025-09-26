import React from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'danger' // 'danger', 'warning', 'info'
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/50',
          iconColor: 'text-red-600 dark:text-red-400',
          confirmBtn: 'bg-red-600 hover:bg-red-700',
          icon: TrashIcon
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/50',
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          confirmBtn: 'bg-yellow-600 hover:bg-yellow-700',
          icon: ExclamationTriangleIcon
        };
      case 'info':
      default:
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/50',
          iconColor: 'text-blue-600 dark:text-blue-400',
          confirmBtn: 'bg-blue-600 hover:bg-blue-700',
          icon: CheckIcon
        };
    }
  };

  const typeStyles = getTypeStyles();
  const IconComponent = typeStyles.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-100 rounded-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 ${typeStyles.iconBg} rounded-lg`}>
                <IconComponent className={`h-6 w-6 ${typeStyles.iconColor}`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors duration-200"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 text-white rounded-lg transition-colors duration-200 ${typeStyles.confirmBtn}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;