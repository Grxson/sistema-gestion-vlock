import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/ui/Toast';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Durante hot reload, puede haber un momento donde el contexto no esté disponible
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useToast] Contexto no disponible, posible hot reload en progreso');
      // Devolver un objeto con funciones vacías para evitar crashes
      return {
        showSuccess: () => {},
        showError: () => {},
        showWarning: () => {},
        showInfo: () => {},
        showSessionExpired: () => {},
        removeToast: () => {}
      };
    }
    throw new Error('useToast debe ser usado dentro de un ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      ...toast,
      isVisible: true
    };
    
    setToasts(prevToasts => [...prevToasts, newToast]);
    
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'success',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addToast]);

  const showError = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'error',
      title,
      message,
      duration: 5000,
      ...options
    });
  }, [addToast]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'warning',
      title,
      message,
      duration: 4500,
      ...options
    });
  }, [addToast]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addToast({
      type: 'info',
      title,
      message,
      duration: 4000,
      ...options
    });
  }, [addToast]);

  const showSessionExpired = useCallback((options = {}) => {
    return addToast({
      type: 'warning',
      title: 'Sesión Expirada',
      message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
      duration: 6000,
      persistent: true, // No se cierra automáticamente
      ...options
    });
  }, [addToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showSessionExpired,
    clearAll,
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      
      {/* Container de Toasts */}
      <div className="fixed top-4 right-4 z-[9999] space-y-3 pointer-events-none w-96 max-w-[calc(100vw-2rem)]">
        {toasts.map((toast, index) => (
          <div 
            key={toast.id}
            className="pointer-events-auto w-full"
            style={{
              zIndex: 9999 - index
            }}
          >
            <Toast
              {...toast}
              onClose={removeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export default ToastProvider;
