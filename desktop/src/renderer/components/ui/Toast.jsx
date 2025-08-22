import React, { useState, useEffect } from 'react';
import { CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const Toast = ({ 
  id,
  type = 'success', 
  title, 
  message, 
  duration = 4000, 
  onClose,
  isVisible = true 
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose(id);
    }, 300); // Duración de la animación de salida
  };

  const getToastConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircleIcon,
          bgColor: 'bg-green-50 dark:bg-green-900/30',
          borderColor: 'border-green-200 dark:border-green-700',
          iconColor: 'text-green-500 dark:text-green-400',
          titleColor: 'text-green-900 dark:text-green-100',
          messageColor: 'text-green-800 dark:text-green-200'
        };
      case 'error':
        return {
          icon: XCircleIcon,
          bgColor: 'bg-red-50 dark:bg-red-900/30',
          borderColor: 'border-red-200 dark:border-red-700',
          iconColor: 'text-red-500 dark:text-red-400',
          titleColor: 'text-red-900 dark:text-red-100',
          messageColor: 'text-red-800 dark:text-red-200'
        };
      case 'warning':
        return {
          icon: ExclamationCircleIcon,
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
          borderColor: 'border-yellow-200 dark:border-yellow-700',
          iconColor: 'text-yellow-500 dark:text-yellow-400',
          titleColor: 'text-yellow-900 dark:text-yellow-100',
          messageColor: 'text-yellow-800 dark:text-yellow-200'
        };
      case 'info':
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gray-50 dark:bg-gray-800/30',
          borderColor: 'border-gray-200 dark:border-gray-600',
          iconColor: 'text-gray-500 dark:text-gray-400',
          titleColor: 'text-gray-900 dark:text-gray-100',
          messageColor: 'text-gray-800 dark:text-gray-200'
        };
      default:
        return {
          icon: InformationCircleIcon,
          bgColor: 'bg-gray-50 dark:bg-gray-800',
          borderColor: 'border-gray-200 dark:border-gray-700',
          iconColor: 'text-gray-500 dark:text-gray-400',
          titleColor: 'text-gray-900 dark:text-gray-100',
          messageColor: 'text-gray-800 dark:text-gray-200'
        };
    }
  };

  const config = getToastConfig();
  const IconComponent = config.icon;

  return (
    <div className={`
      w-full
      transform transition-all duration-300 ease-in-out
      ${show 
        ? 'translate-x-0 opacity-100 scale-100' 
        : 'translate-x-full opacity-0 scale-95'
      }
    `}>
      <div className={`
        ${config.bgColor} ${config.borderColor}
        border rounded-xl shadow-xl overflow-hidden
        backdrop-blur-sm ring-1 ring-black ring-opacity-5
        w-full
      `}>
        <div className="p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 pt-0.5">
              <IconComponent className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0 pr-2">
              {title && (
                <p className={`text-sm font-semibold ${config.titleColor} leading-5 truncate`}>
                  {title}
                </p>
              )}
              {message && (
                <p className={`text-sm ${config.messageColor} ${title ? 'mt-1' : ''} leading-relaxed`}>
                  {message}
                </p>
              )}
            </div>
            <div className="flex-shrink-0">
              <button
                className={`
                  inline-flex rounded-md p-1.5
                  ${config.titleColor} hover:${config.messageColor}
                  focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
                  transition-colors duration-200 hover:bg-white hover:bg-opacity-20
                `}
                onClick={handleClose}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Barra de progreso */}
        <div className="h-1 bg-black bg-opacity-10">
          <div 
            className={`h-full transition-all ease-linear ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'warning' ? 'bg-yellow-500' :
              'bg-blue-500'
            }`}
            style={{
              width: '100%',
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;
