import React from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

const AccessDenied = ({ moduleName }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full py-20">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 mb-6">
          <ShieldExclamationIcon className="h-10 w-10 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Acceso Denegado
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {moduleName 
            ? `No tienes permisos para acceder al módulo de ${moduleName}.` 
            : 'No tienes permisos para acceder a esta sección.'}
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Si crees que deberías tener acceso, contacta al administrador del sistema.
        </p>
      </div>
    </div>
  );
};

export default AccessDenied;
