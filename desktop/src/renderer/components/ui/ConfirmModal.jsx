import React from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar", 
  cancelText = "Cancelar",
  type = "warning" // warning, danger, info
}) => {
  if (!isOpen) return null;

  const getIconAndColors = () => {
    switch (type) {
      case 'danger':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-600 dark:text-red-400',
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
          border: 'border-red-200 dark:border-red-800'
        };
      case 'info':
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-blue-600 dark:text-blue-400',
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
          border: 'border-blue-200 dark:border-blue-800'
        };
      default: // warning
        return {
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-600 dark:text-yellow-400',
          iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
          border: 'border-yellow-200 dark:border-yellow-800'
        };
    }
  };

  const { icon: Icon, iconColor, iconBg, confirmButton, border } = getIconAndColors();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-dark-50 bg-opacity-70 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          {/* Header */}
          <div className={`px-6 py-4 border-b ${border} bg-gray-50 dark:bg-gray-900/50`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${iconBg} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${iconColor}`} />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {title}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
              {message}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 text-sm font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${confirmButton}`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
