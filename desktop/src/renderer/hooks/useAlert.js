import { useState, useCallback } from 'react';

export const useAlert = () => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((options) => {
    const id = Date.now() + Math.random();
    const alert = {
      id,
      type: 'info',
      autoClose: true,
      duration: 5000,
      ...options
    };

    setAlerts(prev => [...prev, alert]);

    // Auto-close si está habilitado
    if (alert.autoClose && alert.duration > 0) {
      setTimeout(() => {
        removeAlert(id);
      }, alert.duration);
    }

    return id;
  }, []);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  // Métodos de conveniencia
  const showSuccess = useCallback((message, options = {}) => {
    return showAlert({
      type: 'success',
      title: options.title || 'Éxito',
      message,
      ...options
    });
  }, [showAlert]);

  const showError = useCallback((message, options = {}) => {
    return showAlert({
      type: 'error',
      title: options.title || 'Error',
      message,
      autoClose: false, // Los errores no se cierran automáticamente por defecto
      ...options
    });
  }, [showAlert]);

  const showWarning = useCallback((message, options = {}) => {
    return showAlert({
      type: 'warning',
      title: options.title || 'Advertencia',
      message,
      ...options
    });
  }, [showAlert]);

  const showInfo = useCallback((message, options = {}) => {
    return showAlert({
      type: 'info',
      title: options.title || 'Información',
      message,
      ...options
    });
  }, [showAlert]);

  return {
    alerts,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeAlert,
    clearAllAlerts
  };
};

export default useAlert;
