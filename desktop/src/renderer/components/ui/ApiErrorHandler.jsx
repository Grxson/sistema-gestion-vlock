import React, { useState, useEffect } from 'react';
import PermissionDenied from '../PermissionDenied';

/**
 * Componente para manejar errores de API con gestión específica para errores de permisos (403)
 * @param {Function} apiCall - Función que realiza la llamada a la API
 * @param {Function} onSuccess - Callback para manejar respuesta exitosa
 * @param {Function} onError - Callback opcional para manejar otros errores
 * @param {Object} dependencies - Array de dependencias para useEffect
 * @param {Boolean} executeOnMount - Si la llamada se debe ejecutar al montar el componente
 */
export default function ApiErrorHandler({
  apiCall,
  onSuccess,
  onError,
  dependencies = [],
  executeOnMount = true,
  children,
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const executeCall = async () => {
    try {
      setIsLoading(true);
      setPermissionDenied(false);
      const result = await apiCall();
      onSuccess(result);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permisos para realizar esta acción');
      } else if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (executeOnMount) {
      executeCall();
    }
  }, dependencies);

  if (permissionDenied) {
    return <PermissionDenied message={errorMessage} />;
  }

  return children({
    isLoading,
    executeCall,
    setPermissionDenied,
    setErrorMessage
  });
}
