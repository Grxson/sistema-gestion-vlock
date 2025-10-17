import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook personalizado para manejar errores de autenticación
 * Proporciona una función para manejar errores de token expirado de manera consistente
 */
export const useAuthErrorHandler = () => {
  // Verificar que los contextos estén disponibles
  let authContext, toastContext;
  
  try {
    authContext = useAuth();
    toastContext = useToast();
  } catch (error) {
    // Si los contextos no están disponibles (durante hot reload), devolver función vacía
    console.warn('[useAuthErrorHandler] Contextos no disponibles, devolviendo función vacía');
    return { handleAuthError: () => false };
  }
  
  const { logout } = authContext;
  const { showSessionExpired } = toastContext;

  const handleAuthError = useCallback((error) => {
    // Verificar si es un error de token expirado
    if (error.code === 'TOKEN_EXPIRED' || error.code === 'SESSION_EXPIRED') {
      console.log('[useAuthErrorHandler] Token expirado detectado, manejando...');
      
      // Mostrar notificación al usuario
      showSessionExpired();
      
      // Cerrar sesión
      logout();
      
      return true; // Indica que el error fue manejado
    }
    
    return false; // Indica que el error no fue manejado por este hook
  }, [logout, showSessionExpired]);

  return { handleAuthError };
};
