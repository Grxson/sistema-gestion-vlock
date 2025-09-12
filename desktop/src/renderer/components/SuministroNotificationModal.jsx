import React, { useEffect } from 'react';
import { FaCheck, FaTrash, FaTimes, FaInfoCircle } from 'react-icons/fa';

const SuministroNotificationModal = ({ 
  isOpen, 
  onClose, 
  message, 
  type = 'success', // 'success', 'error', 'info'
  autoClose = true,
  duration = 3000
}) => {
  useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, duration, onClose]);

  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'error':
        return <FaTimes className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'info':
        return <FaInfoCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <FaCheck className="w-5 h-5 text-green-600 dark:text-green-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-300',
          button: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300',
          progressBg: 'bg-green-600 dark:bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-800',
          text: 'text-red-800 dark:text-red-300',
          button: 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300',
          progressBg: 'bg-red-600 dark:bg-red-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-200 dark:border-blue-800',
          text: 'text-blue-800 dark:text-blue-300',
          button: 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
          progressBg: 'bg-blue-600 dark:bg-blue-500'
        };
      default:
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-800',
          text: 'text-green-800 dark:text-green-300',
          button: 'text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300',
          progressBg: 'bg-green-600 dark:bg-green-500'
        };
    }
  };

  const colors = getColors();

  const getButtonColors = () => {
    switch (type) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-400';
      case 'error':
        return 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-400';
      case 'info':
        return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-400';
      default:
        return 'bg-green-600 hover:bg-green-700 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-400';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4 animate-fade-in-scale">
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${colors.border} ${colors.bg} rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <h3 className={`text-lg font-semibold ${colors.text}`}>
              {type === 'success' && 'Operación Exitosa'}
              {type === 'error' && 'Error'}
              {type === 'info' && 'Información'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`transition-colors ${colors.button}`}
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 text-center">
            {message}
          </p>

          {autoClose && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full ${colors.progressBg} animate-progress`}
                  style={{
                    animation: `progress ${duration}ms linear forwards`
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                Se cerrará automáticamente...
              </p>
            </div>
          )}

          {!autoClose && (
            <div className="flex justify-center mt-6">
              <button
                onClick={onClose}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors ${getButtonColors()}`}
              >
                Entendido
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        .animate-progress {
          animation: progress ${duration}ms linear forwards;
        }
        .animate-fade-in-scale {
          animation: fadeInScale 0.3s ease-out forwards;
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default SuministroNotificationModal;