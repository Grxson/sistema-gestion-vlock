import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

const AdeudosHeader = ({ onAdd }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Adeudos</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Gestión de préstamos recibidos y otorgados
        </p>
      </div>
      <button
        onClick={onAdd}
        className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Agregar Adeudo
      </button>
    </div>
  );
};

export default AdeudosHeader;
