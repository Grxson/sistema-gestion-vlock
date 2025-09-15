import React from 'react';
import { formatProveedorName } from '../../utils/formatters';

/**
 * Componente para mostrar nombres de proveedores con truncado y tooltip
 */
const ProveedorName = ({ 
  proveedor, 
  maxLength = 30, 
  showRazonSocial = true,
  className = "",
  nameClassName = "text-gray-900 dark:text-white",
  razonSocialClassName = "text-gray-500 dark:text-gray-400",
  size = "normal" // "small", "normal", "large"
}) => {
  if (!proveedor) {
    return (
      <span className={`${nameClassName} ${className}`}>
        Sin proveedor
      </span>
    );
  }

  const { nombre, razonSocial } = formatProveedorName(proveedor, maxLength);

  // Clases de tamaño
  const sizeClasses = {
    small: {
      name: "text-sm font-medium",
      razonSocial: "text-xs"
    },
    normal: {
      name: "text-base font-semibold",
      razonSocial: "text-sm"
    },
    large: {
      name: "text-lg font-bold",
      razonSocial: "text-base"
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.normal;

  return (
    <div className={`min-w-0 ${className}`}>
      {/* Nombre principal */}
      <div className="relative group">
        <h3 
          className={`
            ${currentSize.name} 
            ${nameClassName} 
            truncate cursor-help
          `}
          title={nombre.isTruncated ? nombre.full : undefined}
        >
          {nombre.truncated}
        </h3>
        
        {/* Tooltip para nombre si está truncado */}
        {nombre.isTruncated && (
          <div className="
            absolute z-50 invisible group-hover:visible 
            bg-gray-900 text-white text-sm rounded py-1 px-2 
            bottom-full left-0 mb-1 whitespace-nowrap
            shadow-lg border border-gray-700
            transform transition-all duration-200 opacity-0 group-hover:opacity-100
          ">
            {nombre.full}
            <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>

      {/* Razón social */}
      {showRazonSocial && razonSocial.truncated && (
        <div className="relative group">
          <p 
            className={`
              ${currentSize.razonSocial} 
              ${razonSocialClassName} 
              truncate cursor-help mt-1
            `}
            title={razonSocial.isTruncated ? razonSocial.full : undefined}
          >
            {razonSocial.truncated}
          </p>
          
          {/* Tooltip para razón social si está truncada */}
          {razonSocial.isTruncated && (
            <div className="
              absolute z-50 invisible group-hover:visible 
              bg-gray-900 text-white text-sm rounded py-1 px-2 
              bottom-full left-0 mb-1 whitespace-nowrap
              shadow-lg border border-gray-700
              transform transition-all duration-200 opacity-0 group-hover:opacity-100
            ">
              {razonSocial.full}
              <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProveedorName;
