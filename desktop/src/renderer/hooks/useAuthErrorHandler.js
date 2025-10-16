import { useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

/**
 * Hook personalizado para manejar errores de autenticación
 * Proporciona una función para manejar errores de token expirado de manera consistente
 */
export const useAuthErrorHandler = () => {
  const { logout } = useAuth();
  const { showSessionExpired } = useToast();

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
