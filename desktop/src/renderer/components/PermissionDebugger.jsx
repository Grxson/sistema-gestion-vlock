import React, { useState } from 'react';
import { usePermissions } from '../contexts/PermissionsContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente para depuración de permisos del sistema
 * Muestra información detallada sobre los permisos y permite
 * verificar permisos específicos
 */
const PermissionDebugger = () => {
  const { 
    permissions,
    loading,
    error,
    lastUpdated,
    refreshPermissions,
    hasPermission,
    getDebugInfo 
  } = usePermissions();
  
  const { user } = useAuth();
  const [permissionToCheck, setPermissionToCheck] = useState('');
  const [showAllPermissions, setShowAllPermissions] = useState(false);

  // Obtener información de depuración
  const debugInfo = getDebugInfo();
  
  // Filtrar los permisos para mostrar solo los que están habilitados
  const enabledPermissions = Object.entries(permissions)
    .filter(([_, enabled]) => enabled === true)
    .map(([code]) => code)
    .sort();
    
  // Todos los permisos para selección
  const allPermissionCodes = Object.keys(permissions).sort();

  return (
    <div className="p-4 bg-gray-100 rounded-lg border border-gray-200 my-4">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <span role="img" aria-label="Debug" className="mr-2">🔍</span>
        Depurador de Permisos
      </h2>
      
      {/* Información del usuario */}
      <div className="mb-4 p-3 bg-white rounded shadow">
        <h3 className="font-semibold text-gray-700">Usuario</h3>
        {user ? (
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-sm"><strong>ID:</strong> {user.id_usuario}</div>
            <div className="text-sm"><strong>Rol:</strong> {user.rol} (ID: {user.id_rol})</div>
            <div className="text-sm"><strong>Nombre:</strong> {user.nombre}</div>
            <div className="text-sm"><strong>Email:</strong> {user.email}</div>
          </div>
        ) : (
          <p className="text-red-500">No hay usuario autenticado</p>
        )}
      </div>
      
      {/* Estado de permisos */}
      <div className="mb-4 p-3 bg-white rounded shadow">
        <h3 className="font-semibold text-gray-700">Estado</h3>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-sm">
            <strong>Cargando:</strong> {loading ? '✓' : '✗'}
          </div>
          <div className="text-sm">
            <strong>Permisos cargados:</strong> {Object.keys(permissions).length}
          </div>
          <div className="text-sm">
            <strong>Última actualización:</strong> {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Nunca'}
          </div>
          <div className="text-sm">
            <strong>Error:</strong> {error || 'Ninguno'}
          </div>
        </div>
        
        <button
          onClick={refreshPermissions}
          className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          disabled={loading}
        >
          {loading ? 'Actualizando...' : 'Actualizar Permisos'}
        </button>
      </div>
      
      {/* Verificador de permisos */}
      <div className="mb-4 p-3 bg-white rounded shadow">
        <h3 className="font-semibold text-gray-700">Verificar Permiso</h3>
        <div className="flex mt-2">
          <select
            value={permissionToCheck}
            onChange={(e) => setPermissionToCheck(e.target.value)}
            className="border p-2 rounded mr-2 flex-grow text-sm"
          >
            <option value="">Selecciona un permiso...</option>
            {allPermissionCodes.map(code => (
              <option key={code} value={code}>{code}</option>
            ))}
          </select>
          <button
            onClick={() => permissionToCheck && hasPermission(permissionToCheck)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
            disabled={!permissionToCheck}
          >
            Verificar
          </button>
        </div>
        
        {permissionToCheck && (
          <div className="mt-2 p-2 rounded text-sm">
            El permiso <strong>{permissionToCheck}</strong> está 
            <strong className={hasPermission(permissionToCheck) ? ' text-green-600' : ' text-red-600'}>
              {hasPermission(permissionToCheck) ? ' HABILITADO' : ' DESHABILITADO'}
            </strong>
          </div>
        )}
      </div>
      
      {/* Módulos accesibles */}
      <div className="mb-4 p-3 bg-white rounded shadow">
        <h3 className="font-semibold text-gray-700">Módulos Accesibles</h3>
        {debugInfo.accessibleModules.length > 0 ? (
          <ul className="mt-2 text-sm">
            {debugInfo.accessibleModules.map(module => (
              <li key={module} className="mb-1">
                <span className="text-green-600">✓</span> {module}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-yellow-600 text-sm mt-2">No hay módulos accesibles</p>
        )}
      </div>
      
      {/* Lista de permisos habilitados */}
      <div className="p-3 bg-white rounded shadow">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Permisos</h3>
          <button
            onClick={() => setShowAllPermissions(!showAllPermissions)}
            className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
          >
            {showAllPermissions ? 'Ver Habilitados' : 'Ver Todos'}
          </button>
        </div>
        
        {showAllPermissions ? (
          allPermissionCodes.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {allPermissionCodes.map(code => (
                <div key={code} className="text-sm flex items-center">
                  <span className={permissions[code] ? 'text-green-600 mr-1' : 'text-red-600 mr-1'}>
                    {permissions[code] ? '✓' : '✗'}
                  </span>
                  {code}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600 text-sm mt-2">No hay permisos definidos</p>
          )
        ) : (
          enabledPermissions.length > 0 ? (
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
              {enabledPermissions.map(code => (
                <div key={code} className="text-sm flex items-center">
                  <span className="text-green-600 mr-1">✓</span> {code}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-yellow-600 text-sm mt-2">No hay permisos habilitados</p>
          )
        )}
      </div>
      
      {/* Notas de ayuda */}
      <div className="mt-4 text-xs text-gray-500">
        <p>
          <strong>Nota:</strong> Puedes usar el objeto <code>window._vlock_debug.permissions</code> en la consola
          para depurar los permisos.
        </p>
        <ul className="list-disc ml-5 mt-1">
          <li><code>window._vlock_debug.permissions.show()</code> - Muestra todos los permisos</li>
          <li><code>window._vlock_debug.permissions.check('permiso.codigo')</code> - Verifica un permiso específico</li>
          <li><code>window._vlock_debug.permissions.refresh()</code> - Actualiza los permisos</li>
        </ul>
      </div>
    </div>
  );
};

export default PermissionDebugger;
