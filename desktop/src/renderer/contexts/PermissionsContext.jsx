import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshToken, setRefreshToken] = useState(Date.now());

  // Definición de los permisos por defecto para administradores
  const getDefaultAdminPermissions = () => ({
    // Empleados
    'empleados.ver': true,
    'empleados.crear': true,
    'empleados.editar': true,
    'empleados.eliminar': true,
    // Nómina
    'nomina.ver': true,
    'nomina.crear': true,
    'nomina.editar': true,
    'nomina.eliminar': true,
    // Contratos
    'contratos.ver': true,
    'contratos.crear': true,
    'contratos.editar': true,
    'contratos.eliminar': true,
    // Oficios
    'oficios.ver': true,
    'oficios.crear': true,
    'oficios.editar': true,
    'oficios.eliminar': true,
    // Auditoría
    'auditoria.ver': true,
    // Roles y usuarios
    'roles.ver': true,
    'roles.crear': true,
    'roles.editar': true,
    'roles.eliminar': true,
    'usuarios.ver': true,
    'usuarios.crear': true,
    'usuarios.editar': true,
    'usuarios.eliminar': true,
    // Configuración
    'configuracion.ver': true,
    'configuracion.editar': true,
    // Finanzas
    'finanzas.gastos.ver': true,
    'finanzas.gastos.crear': true,
    'finanzas.gastos.editar': true,
    'finanzas.gastos.eliminar': true,
    // Proyectos
    'proyectos.ver': true,
    'proyectos.crear': true,
    'proyectos.editar': true,
    'proyectos.eliminar': true
  });

  /**
   * Función para forzar una actualización de los permisos
   * Puede ser llamada desde cualquier componente que use el contexto
   */
  const refreshPermissions = useCallback(() => {
    console.log('[PermissionsContext] Forzando actualización de permisos...');
    
    // Limpiar cache completamente
    setPermissions({});
    setLoading(true);
    setError(null);
    setLastUpdated(null);
    
    // Forzar recarga con timestamp único
    setRefreshToken(Date.now());
  }, []);
  
  // Herramientas de depuración global
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window._vlock_debug = {
        ...(window._vlock_debug || {}),
        permissions: {
          // Mostrar todos los permisos actuales
          show: () => {
            console.group('🔍 VLock - Información de permisos');
            console.log('Usuario:', user);
            console.log('Permisos cargados:', permissions);
            console.log('Total permisos:', Object.keys(permissions).length);
            console.log('Última actualización:', lastUpdated);
            console.groupEnd();
            return permissions;
          },
          // Comprobar un permiso específico
          check: (permissionCode) => {
            const isAdmin = user?.rol === 'admin' || user?.id_rol === 1;
            const hasPermission = permissions[permissionCode] === true;
            console.log(`🔐 Permiso '${permissionCode}': ${hasPermission ? '✅ PERMITIDO' : '❌ DENEGADO'} (Admin: ${isAdmin ? 'Sí' : 'No'}) [Solo debug - no incluye lógica admin]`);
            return hasPermission; // Solo retornar el permiso real, no aplicar lógica de admin
          },
          // Actualizar permisos
          refresh: refreshPermissions,
          // Estado de error
          error
        }
      };
    }
  }, [permissions, user, lastUpdated, error, refreshPermissions]);

  // Carga de permisos
  useEffect(() => {
    const fetchPermissions = async () => {
      console.log('[PermissionsContext] Estado de usuario actual:', user);
      setError(null);
      
      // Si no hay usuario o rol, no intentar cargar permisos
      if (!user?.id_usuario || !user?.id_rol) {
        console.log('[PermissionsContext] No hay usuario o rol definido, no se cargarán permisos');
        setPermissions({});
        setLoading(false);
        return;
      }

      console.log(`[PermissionsContext] Cargando permisos para rol ID: ${user.id_rol} (${user.rol})`);
      try {
        setLoading(true);
        
        // Para todos los usuarios (incluidos admins), consultar la API
        console.log('[PermissionsContext] Consultando API para obtener permisos del usuario actual');
        const response = await apiService.getCurrentUserPermissions();
        console.log('[PermissionsContext] Respuesta API permisos:', JSON.stringify(response, null, 2));
        
        // Verificar que la respuesta tenga el formato esperado
        if (!response || !response.permisos || !Array.isArray(response.permisos)) {
          const errorMsg = 'Formato de respuesta de permisos inválido';
          console.error(`[PermissionsContext] ${errorMsg}`, response);
          setError(errorMsg);
          setLoading(false);
          return;
        }
        
        // Convertir el array de permisos en un objeto para facilitar el acceso
        const permisosMap = {};

        // 1) Cargar catálogo de acciones desde backend para construir un mapa dinámico nombre->codigo
        let accionesMap = {};
        try {
          const accionesResp = await apiService.getAccionesPermiso();
          const acciones = accionesResp?.acciones || accionesResp || [];
          acciones.forEach(a => {
            if (a?.nombre && a?.codigo) accionesMap[a.nombre] = a.codigo;
          });
          console.log('[PermissionsContext] Catálogo de acciones cargado:', Object.keys(accionesMap).length);
        } catch (e) {
          console.warn('[PermissionsContext] No se pudo cargar catálogo de acciones. Se intentará usar códigos directos del backend.', e?.message);
        }

        // 2) Mapear la lista que llega del backend:
        //    - Si el valor parece ya ser un código (contiene un punto), usarlo tal cual
        //    - Si es un nombre humano, traducirlo con accionesMap
        response.permisos.forEach(value => {
          let code = null;
          if (typeof value === 'string' && value.includes('.')) {
            code = value;
          } else if (accionesMap[value]) {
            code = accionesMap[value];
            console.log(`[PermissionsContext] Mapeo dinámico: "${value}" -> "${code}"`);
          } else {
            console.warn(`[PermissionsContext] Permiso no reconocido (sin mapeo): "${value}"`);
          }
          if (code) permisosMap[code] = true;
        });
        
        console.log(`[PermissionsContext] Permisos mapeados: ${Object.keys(permisosMap).length} códigos generados`);
        console.log('[PermissionsContext] Códigos de permisos finales:', Object.keys(permisosMap));
        
        // Detectar cambios en permisos para invalidar cache si es necesario
        const currentPermissionHash = JSON.stringify(Object.keys(permisosMap).sort());
        const lastPermissionHash = localStorage.getItem('vlock_permissions_hash');
        
        if (lastPermissionHash && lastPermissionHash !== currentPermissionHash) {
          console.log('[PermissionsContext] ¡Cambio en permisos detectado! Limpiando cache...');
          // Limpiar cualquier cache relacionado con permisos
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('vlock_cache_') || key.startsWith('vlock_perm_')) {
              localStorage.removeItem(key);
            }
          });
        }
        
        // Guardar hash actual para futuras comparaciones
        localStorage.setItem('vlock_permissions_hash', currentPermissionHash);
        
        setPermissions(permisosMap);
        setLastUpdated(new Date());
        console.log('[PermissionsContext] Permisos cargados correctamente', permisosMap);
      } catch (error) {
        console.error('[PermissionsContext] Error al cargar permisos:', error);
        setError(error.message || 'Error al cargar permisos');
      } finally {
        setLoading(false);
      }
    };

    console.log('[PermissionsContext] Inicializando, usuario actual:', user);
    fetchPermissions();
  }, [user, refreshToken]);

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permissionCode - Código del permiso a verificar
   * @returns {boolean} - true si tiene permiso, false si no
   */
  const hasPermission = useCallback((permissionCode) => {
    // Si no hay código de permiso o es inválido
    if (!permissionCode || typeof permissionCode !== 'string') {
      console.error(`[PermissionsContext] Código de permiso inválido: ${permissionCode}`);
      return false;
    }
    
    if (!user) {
      console.warn(`[PermissionsContext] No hay usuario autenticado, permiso denegado: ${permissionCode}`);
      return false;
    }
    
    // El rol Admin siempre tiene todos los permisos
    if (user.id_rol === 1 || user.rol === 'admin') {
      console.log(`[PermissionsContext] Usuario es admin (id_rol=${user.id_rol}, rol=${user.rol}), permitiendo acceso a: ${permissionCode}`);
      return true;
    }

    // Si los permisos aún están cargando, mostramos un mensaje informativo
    if (loading) {
      console.log(`[PermissionsContext] Permisos aún cargando, verificación pendiente para: ${permissionCode}`);
      // En caso de estar cargando, podríamos devolver false o null
      // Aquí devolvemos false para ser conservadores
      return false;
    }

    // Verificar si el objeto permissions existe y tiene datos
    if (!permissions || Object.keys(permissions).length === 0) {
      console.warn(`[PermissionsContext] No hay permisos cargados, permiso denegado: ${permissionCode}`);
      return false;
    }
    
    // Verificar específicamente si el permiso existe y está habilitado
    const isPermitted = permissions[permissionCode] === true;
    const logLevel = isPermitted ? 'log' : 'warn';
    console[logLevel](`[PermissionsContext] ${permissionCode}: ${isPermitted ? '✅ PERMITIDO' : '❌ DENEGADO'}`);
    
    return isPermitted;
  }, [user, permissions, loading]);

  /**
   * Verifica si el usuario tiene al menos un permiso de un módulo
   * @param {string} moduleName - Nombre del módulo (ej: 'usuarios', 'nomina')
   * @returns {boolean} - true si tiene al menos un permiso, false si no
   */
  const hasModuleAccess = useCallback((moduleName) => {
    // Si no hay nombre de módulo o es inválido
    if (!moduleName || typeof moduleName !== 'string') {
      console.error(`[PermissionsContext] Nombre de módulo inválido: ${moduleName}`);
      return false;
    }
    
    // Si no hay información de usuario, no permitir acceso
    if (!user) {
      console.warn(`[PermissionsContext] No hay usuario autenticado, acceso denegado al módulo: ${moduleName}`);
      return false;
    }

    // Si es el dashboard o perfil, permitir acceso siempre para usuarios autenticados
    if (moduleName === 'dashboard' || moduleName === 'perfil') {
      console.log(`[PermissionsContext] Permitiendo acceso a módulo básico: ${moduleName}`);
      return true;
    }
    
    // Si el usuario es admin, permitir acceso a todo
    if (user.rol === 'admin' || user.id_rol === 1) {
      console.log(`[PermissionsContext] Usuario es admin, permitiendo acceso al módulo: ${moduleName}`);
      return true;
    }

    // Si los permisos aún están cargando, mostramos un mensaje informativo
    if (loading) {
      console.log(`[PermissionsContext] Permisos aún cargando, verificación de acceso pendiente para módulo: ${moduleName}`);
      return false;
    }

    // Verificar que permissions sea un objeto y no esté vacío
    if (!permissions || typeof permissions !== 'object' || Object.keys(permissions).length === 0) {
      console.warn(`[PermissionsContext] No hay permisos cargados, acceso denegado al módulo: ${moduleName}`);
      return false;
    }
    
    // Mapa de conversión del nombre del módulo a su código de permiso
    const modulePermissionMap = {
      'empleados': 'empleados.ver',
      'nomina': 'nomina.ver', 
      'contratos': 'contratos.ver', 
      'oficios': 'oficios.ver',
      'auditoria': 'auditoria.ver',
      'reportes': 'reportes.ver',
      'usuarios': 'usuarios.ver',
      'roles': 'roles.ver',
      'configuracion': 'configuracion.ver',
      'finanzas': 'finanzas.gastos.ver',
      'proyectos': 'proyectos.ver',
      'herramientas': 'herramientas.ver',
      'adeudos': 'adeudos.ver',
      'ingresos': 'ingresos.ver'
    };

    // Obtener el código de permiso correcto para este módulo
    const permissionCode = modulePermissionMap[moduleName] || `${moduleName}.ver`;
    
    // Verificar específicamente el permiso de "ver" para este módulo
    const hasViewPermission = permissions[permissionCode] === true;
    
    const logLevel = hasViewPermission ? 'log' : 'warn';
    console[logLevel](`[PermissionsContext] Acceso a módulo ${moduleName}: ${hasViewPermission ? '✅ PERMITIDO' : '❌ DENEGADO'} (permiso: ${permissionCode})`);
    
    return hasViewPermission;
  }, [user, permissions, loading]);

  /**
   * Función para obtener la lista de módulos a los que el usuario tiene acceso
   * @returns {Array} - Array con los nombres de los módulos accesibles
   */
  const getAccessibleModules = useCallback(() => {
    // Si no hay permisos cargados, devolver array vacío
    if (!permissions || Object.keys(permissions).length === 0) {
      return [];
    }
    
    // Lista de todos los módulos posibles en la aplicación
    const allModules = [
      'dashboard',
      'empleados',
      'nomina',
      'contratos',
      'oficios',
      'auditoria',
      'reportes',
      'usuarios',
      'roles',
      'configuracion',
      'finanzas',
      'proyectos',
      'herramientas'
    ];
    
    // Filtrar solo los módulos a los que tiene acceso
    const accessibleModules = allModules.filter(moduleName => hasModuleAccess(moduleName));
    return accessibleModules;
  }, [permissions, hasModuleAccess]);
  
  /**
   * Función para verificar el estado actual de los permisos (debugging)
   * @returns {Object} - Objeto con información de estado de permisos
   */
  const getDebugInfo = useCallback(() => {
    return {
      userInfo: user ? {
        id: user.id_usuario,
        role: user.rol,
        roleId: user.id_rol
      } : null,
      permissionsLoaded: !loading && Object.keys(permissions).length > 0,
      permissionsCount: Object.keys(permissions).length,
      accessibleModules: getAccessibleModules(),
      lastUpdated,
      error
    };
  }, [user, loading, permissions, getAccessibleModules, lastUpdated, error]);

  // Valor del contexto
  const value = {
    permissions,
    loading,
    error,
    lastUpdated,
    hasPermission,
    hasModuleAccess,
    refreshPermissions,
    getAccessibleModules,
    getDebugInfo
  };

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  );
}
