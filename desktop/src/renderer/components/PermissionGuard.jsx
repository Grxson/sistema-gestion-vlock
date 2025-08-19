import React from 'react';
import { usePermissions } from '../contexts/PermissionsContext';

/**
 * Componente de alto orden (HOC) que controla el acceso a acciones según permisos
 * @param {string} permissionCode - Código del permiso requerido
 * @param {React.ReactNode} children - Elementos hijo a renderizar si tiene permiso
 * @param {boolean} hideCompletely - Si es true, no renderiza nada en caso de no tener permiso
 * @param {React.ReactNode} fallback - Elemento a mostrar si no tiene permiso (solo si hideCompletely=false)
 */
const PermissionGuard = ({ permissionCode, children, hideCompletely = false, fallback = null }) => {
  const { hasPermission } = usePermissions();
  
  // Verificar si el usuario tiene el permiso requerido
  const hasAccess = hasPermission(permissionCode);
  
  // Si no tiene permiso y se debe ocultar completamente
  if (!hasAccess && hideCompletely) {
    return null;
  }
  
  // Si no tiene permiso y hay un fallback definido
  if (!hasAccess && fallback) {
    return fallback;
  }
  
  // Si no tiene permiso y no hay fallback, mostrar mensaje de acceso denegado
  if (!hasAccess) {
    return (
      <button 
        className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md cursor-not-allowed opacity-75"
        disabled
      >
        Acceso denegado
      </button>
    );
  }
  
  // Si tiene permiso, mostrar los elementos hijo
  return children;
};

export default PermissionGuard;
