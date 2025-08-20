import React, { useState } from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../../contexts/PermissionsContext';

/**
 * Componente para botones de acción condicionados por permisos
 * Si el usuario tiene el permiso, el botón funciona normalmente
 * Si no tiene el permiso, el botón aparece deshabilitado con un tooltip
 * 
 * @param {string} permissionCode - Código del permiso requerido (ej: 'empleados.crear')
 * @param {function} onClick - Función a ejecutar cuando se haga click
 * @param {React.ReactNode} children - Contenido del botón
 * @param {string} className - Clases adicionales para el botón
 * @param {string} disabledMessage - Mensaje a mostrar cuando está deshabilitado (opcional)
 */
export default function PermissionButton({ 
  permissionCode, 
  onClick, 
  children, 
  className = '',
  disabledMessage = 'No tienes permiso para realizar esta acción', 
  ...props 
}) {
  const { hasPermission } = usePermissions();
  const [showTooltip, setShowTooltip] = useState(false);
  
  const hasAccess = hasPermission(permissionCode);
  
  // Clases base para todos los botones
  const baseClasses = "flex items-center justify-center space-x-1 px-3 py-2 rounded-md transition-all";
  
  // Clases para botones habilitados
  const enabledClasses = "bg-primary-600 hover:bg-primary-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500";
  
  // Clases para botones deshabilitados
  const disabledClasses = "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed";
  
  // Combinar todas las clases
  const buttonClasses = `${baseClasses} ${hasAccess ? enabledClasses : disabledClasses} ${className}`;

  const handleMouseEnter = () => {
    if (!hasAccess) {
      setShowTooltip(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  const handleClick = (e) => {
    if (hasAccess && onClick) {
      onClick(e);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={buttonClasses}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        disabled={!hasAccess}
        {...props}
      >
        {!hasAccess && <ShieldExclamationIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />}
        {children}
      </button>
      
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-10">
          <div className="bg-gray-900 text-white text-sm px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {disabledMessage}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 rotate-45 bg-gray-900"></div>
          </div>
        </div>
      )}
    </div>
  );
}
