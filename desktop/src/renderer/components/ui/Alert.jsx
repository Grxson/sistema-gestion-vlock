import React from 'react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Alert = ({ 
  type = 'info', 
  title, 
  message, 
  onClose, 
  actions = [], 
  autoClose = false,
  duration = 5000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      setTimeout(() => onClose(), 300); // Esperar a que termine la animación
    }
  };

  const getAlertStyles = () => {
    const baseStyles = "rounded-xl border transition-all duration-300 ease-in-out";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800`;
    }
  };

  const getIcon = () => {
    const iconProps = { className: "h-5 w-5 flex-shrink-0" };
    
    switch (type) {
      case 'success':
        return <CheckCircleIcon {...iconProps} className="h-5 w-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircleIcon {...iconProps} className="h-5 w-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <ExclamationCircleIcon {...iconProps} className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />;
      case 'info':
      default:
        return <InformationCircleIcon {...iconProps} className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getTextColors = () => {
    switch (type) {
      case 'success':
        return {
          title: 'text-green-800 dark:text-green-200',
          message: 'text-green-700 dark:text-green-300'
        };
      case 'error':
        return {
          title: 'text-red-800 dark:text-red-200',
          message: 'text-red-700 dark:text-red-300'
        };
      case 'warning':
        return {
          title: 'text-yellow-800 dark:text-yellow-200',
          message: 'text-yellow-700 dark:text-yellow-300'
        };
      case 'info':
      default:
        return {
          title: 'text-blue-800 dark:text-blue-200',
          message: 'text-blue-700 dark:text-blue-300'
        };
    }
  };

  const textColors = getTextColors();

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`
      ${getAlertStyles()} 
      ${isVisible ? 'animate-fade-in scale-100 opacity-100' : 'animate-fade-out scale-95 opacity-0'}
      ${className}
    `}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${textColors.title} mb-1`}>
                {title}
              </h3>
            )}
            
            {message && (
              <div className={`text-sm ${textColors.message}`}>
                {typeof message === 'string' ? (
                  <p>{message}</p>
                ) : (
                  message
                )}
              </div>
            )}
            
            {actions.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`
                      text-sm font-medium px-3 py-1.5 rounded-lg transition-colors duration-200
                      ${action.variant === 'primary' 
                        ? `bg-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-600 text-white hover:bg-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-700`
                        : `text-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-600 hover:text-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-500 dark:text-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-400 dark:hover:text-${type === 'error' ? 'red' : type === 'success' ? 'green' : type === 'warning' ? 'yellow' : 'blue'}-300`
                      }
                    `}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                onClick={handleClose}
                className={`
                  inline-flex rounded-md p-1.5 transition-colors duration-200
                  ${type === 'error' 
                    ? 'text-red-400 hover:bg-red-100 focus:ring-red-600 dark:text-red-300 dark:hover:bg-red-900/50' 
                    : type === 'success'
                    ? 'text-green-400 hover:bg-green-100 focus:ring-green-600 dark:text-green-300 dark:hover:bg-green-900/50'
                    : type === 'warning'
                    ? 'text-yellow-400 hover:bg-yellow-100 focus:ring-yellow-600 dark:text-yellow-300 dark:hover:bg-yellow-900/50'
                    : 'text-blue-400 hover:bg-blue-100 focus:ring-blue-600 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2
                `}
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alert;
