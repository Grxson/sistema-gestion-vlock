import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Durante hot reload, puede haber un momento donde el contexto no esté disponible
    if (process.env.NODE_ENV === 'development') {
      console.warn('[useAuth] Contexto no disponible, posible hot reload en progreso');
      // Devolver un objeto con valores por defecto para evitar crashes
      return {
        user: null,
        loading: true,
        isAuthenticated: false,
        lastVerified: null,
        authError: null,
        login: () => Promise.resolve(),
        logout: () => {},
        register: () => Promise.resolve(),
        checkAuth: () => Promise.resolve(),
        verifyToken: () => Promise.resolve(false),
        getDebugInfo: () => ({})
      };
    }
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [lastVerified, setLastVerified] = useState(null);
  const [authError, setAuthError] = useState(null);
  const { showSessionExpired } = useToast();

  // Efecto para verificar la autenticación al inicio
  useEffect(() => {
    console.log('[AuthContext] Iniciando verificación de autenticación');
    checkAuth();
  }, []);

  // Efecto para sincronizar el estado de autenticación con localStorage
  useEffect(() => {
    // Si cambia el estado de isAuthenticated, actualizar localStorage
    if (isAuthenticated && user) {
      localStorage.setItem('authState', JSON.stringify({
        isAuthenticated,
        userId: user.id_usuario,
        roleId: user.id_rol
      }));
    } else if (!isAuthenticated) {
      localStorage.removeItem('authState');
    }
  }, [isAuthenticated, user]);

  // Verificar autenticación con el servidor
  const checkAuth = async () => {
    setAuthError(null);
    try {
      console.log('[AuthContext] Verificando autenticación...');
      const token = apiService.getToken();
      
      if (!token) {
        console.log('[AuthContext] No hay token, cerrando sesión');
        setLoading(false);
        return;
      }
      
      console.log('[AuthContext] Token encontrado, verificando con el servidor');
      const response = await apiService.verifyAuth();
      
      if (!response || !response.usuario) {
        throw new Error('La respuesta del servidor no incluye datos de usuario');
      }
      
      console.log('[AuthContext] Autenticación verificada correctamente');
      setUser(response.usuario);
      setIsAuthenticated(true);
      setLastVerified(new Date());
      
      // Registrar información detallada para depuración
      console.log(`[AuthContext] Usuario autenticado: ${response.usuario.nombre_usuario} (${response.usuario.email})`);
      console.log(`[AuthContext] Rol: ${response.usuario.rol} (ID: ${response.usuario.id_rol})`);
    } catch (error) {
      console.error('[AuthContext] Error verificando autenticación:', error);
      
      // Si es un error de token expirado, mostrar notificación y cerrar sesión
      if (error.code === 'TOKEN_EXPIRED' || error.code === 'SESSION_EXPIRED') {
        console.log('[AuthContext] Token expirado, cerrando sesión y mostrando notificación');
        showSessionExpired();
        logout();
        return;
      }
      
      setAuthError({
        message: error.message || 'Error de autenticación',
        timestamp: new Date(),
        details: error.response?.data || {}
      });
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const login = async (credentials) => {
    setAuthError(null);
    try {
      console.log('[AuthContext] Intentando iniciar sesión...');
      const response = await apiService.login(credentials);
      
      if (!response || !response.usuario) {
        throw new Error('La respuesta del servidor no incluye datos de usuario');
      }
      
      setUser(response.usuario);
      setIsAuthenticated(true);
      setLastVerified(new Date());
      console.log('[AuthContext] Sesión iniciada exitosamente');
      
      return response;
    } catch (error) {
      console.error('[AuthContext] Error al iniciar sesión:', error);
      setAuthError({
        message: error.message || 'Error al iniciar sesión',
        timestamp: new Date(),
        details: error.response?.data || {}
      });
      throw error;
    }
  };

  // Cerrar sesión
  const logout = () => {
    console.log('[AuthContext] Cerrando sesión...');
    apiService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setLastVerified(null);
    
    // Limpiar cualquier otro dato de sesión
    localStorage.removeItem('authState');
    
    console.log('[AuthContext] Sesión cerrada');
  };

  // Registrar nuevo usuario
  const register = async (userData) => {
    setAuthError(null);
    try {
      console.log('[AuthContext] Registrando nuevo usuario...');
      const response = await apiService.register(userData);
      console.log('[AuthContext] Usuario registrado exitosamente');
      return response;
    } catch (error) {
      console.error('[AuthContext] Error al registrar usuario:', error);
      setAuthError({
        message: error.message || 'Error al registrar usuario',
        timestamp: new Date(),
        details: error.response?.data || {}
      });
      throw error;
    }
  };
  
  // Verificar token manualmente
  const verifyToken = async () => {
    console.log('[AuthContext] Verificando token manualmente...');
    await checkAuth();
    return isAuthenticated;
  };

  // Obtener información de depuración
  const getDebugInfo = () => {
    return {
      isAuthenticated,
      user: user ? {
        id: user.id_usuario,
        email: user.email,
        role: user.rol,
        roleId: user.id_rol
      } : null,
      lastVerified,
      authError,
      tokenExists: !!apiService.getToken(),
      tokenExpiry: apiService.getTokenExpiry()
    };
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    lastVerified,
    authError,
    login,
    logout,
    register,
    checkAuth,
    verifyToken,
    getDebugInfo
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
