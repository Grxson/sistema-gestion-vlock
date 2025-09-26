import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

/**
 * Modal base reutilizable para todos los CRUDs
 * Soporta diferentes tipos: crear, editar, ver, eliminar, confirmar
 */
const BaseModal = ({ 
  isOpen, 
  onClose, 
  title, 
  type = 'info', // info, create, edit, view, delete, confirm
  children,
  onConfirm,
  onCancel,
  loading = false,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  size = 'md' // sm, md, lg, xl, 2xl
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      setIsVisible(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (loading) return;
    setIsVisible(false);
    setTimeout(onClose, 150);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const getModalIcon = () => {
    switch (type) {
      case 'delete':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      case 'confirm':
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />;
      case 'create':
      case 'edit':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-600" />;
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'max-w-md';
      case 'lg': return 'max-w-2xl';
      case 'xl': return 'max-w-4xl';
      case '2xl': return 'max-w-6xl';
      default: return 'max-w-lg';
    }
  };

  const getTypeColors = () => {
    switch (type) {
      case 'delete':
        return {
          confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
          border: 'border-red-200'
        };
      case 'create':
        return {
          confirmBtn: 'bg-green-600 hover:bg-green-700 text-white',
          border: 'border-green-200'
        };
      case 'edit':
        return {
          confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white',
          border: 'border-blue-200'
        };
      default:
        return {
          confirmBtn: 'bg-primary-600 hover:bg-primary-700 text-white',
          border: 'border-gray-200'
        };
    }
  };

  if (!isOpen) return null;

  const colors = getTypeColors();

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto transition-opacity duration-150 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-labelledby="modal-title" 
      role="dialog" 
      aria-modal="true"
    >
      <div 
        className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
        onClick={handleOverlayClick}
      >
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-150 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`} 
          aria-hidden="true"
        />

        {/* Modal */}
        <div 
          className={`inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-150 sm:my-8 sm:align-middle sm:w-full sm:p-6 ${getSizeClass()} ${
            isVisible ? 'opacity-100 translate-y-0 sm:scale-100' : 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95'
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getModalIcon()}
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              type="button"
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              onClick={handleClose}
              disabled={loading}
            >
              <span className="sr-only">Cerrar</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            {children}
          </div>

          {/* Footer */}
          {(onConfirm || onCancel) && (
            <div className="flex justify-end space-x-3">
              {onCancel && (
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onCancel}
                  disabled={loading}
                >
                  {cancelText}
                </button>
              )}
              {onConfirm && (
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed ${colors.confirmBtn}`}
                  onClick={onConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </div>
                  ) : (
                    confirmText
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;