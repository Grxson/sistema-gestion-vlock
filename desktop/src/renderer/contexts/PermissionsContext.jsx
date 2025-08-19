import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import apiService from '../services/api';

const PermissionsContext = createContext();

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function PermissionsProvider({ children }) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (user?.id_usuario && user?.id_rol) {
        try {
          setLoading(true);
          const response = await apiService.getPermisosRol(user.id_rol);
          
          // Convertir el array de permisos en un objeto para facilitar el acceso
          const permisosMap = {};
          response.permisos.forEach(permiso => {
            permisosMap[permiso.codigo] = permiso.permitido;
          });
          
          setPermissions(permisosMap);
          console.log('Permisos cargados:', permisosMap);
        } catch (error) {
          console.error('Error al cargar permisos:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permissionCode - Código del permiso a verificar
   * @returns {boolean} - true si tiene permiso, false si no
   */
  const hasPermission = (permissionCode) => {
    if (!user) return false;
    
    // El rol 1 (Admin) siempre tiene todos los permisos
    if (user.id_rol === 1) return true;
    
    return permissions[permissionCode] === true;
  };

  /**
   * Verifica si el usuario tiene al menos un permiso de un módulo
   * @param {string} modulePrefix - Prefijo del módulo (ej: 'usuarios', 'nomina')
   * @returns {boolean} - true si tiene al menos un permiso, false si no
   */
  const hasModuleAccess = (modulePrefix) => {
    if (!user) return false;
    
    // El rol 1 (Admin) siempre tiene acceso a todos los módulos
    if (user.id_rol === 1) return true;

    // Verificar si tiene al menos un permiso que comience con el prefijo del módulo
    return Object.keys(permissions).some(code => 
      code.startsWith(modulePrefix + '.') && permissions[code] === true
    );
  };

  const value = {
    permissions,
    loading,
    hasPermission,
    hasModuleAccess
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
