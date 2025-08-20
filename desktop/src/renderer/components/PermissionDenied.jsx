import React from 'react';
import { ShieldExclamationIcon } from '@heroicons/react/24/outline';

export default function PermissionDenied({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-full mb-4">
        <ShieldExclamationIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Acceso denegado</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message || 'No tienes los permisos necesarios para acceder a esta función. Por favor, contacta al administrador si necesitas acceso.'}
      </p>
    </div>
  );
}
