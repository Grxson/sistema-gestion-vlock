import React from 'react';
import { PlusIcon, ArrowDownTrayIcon, ChartPieIcon } from '@heroicons/react/24/outline';

const AdeudosHeader = ({ onAdd, onExport, onShowChart }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Adeudos</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Gestión de préstamos recibidos y otorgados
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onShowChart}
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <ChartPieIcon className="h-5 w-5 mr-2" />
          Ver Gráfica
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Exportar Excel
        </button>
        <button
          onClick={onAdd}
          className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Agregar Adeudo
        </button>
      </div>
    </div>
  );
};

export default AdeudosHeader;
