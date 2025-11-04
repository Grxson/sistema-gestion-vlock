import React from 'react';
import { ChartBarIcon, TableCellsIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

const SuministrosHeader = ({ activeTab, onTabChange }) => {
  return (
    <div className="mb-4">
      {/* Encabezado */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Gestión de Gastos
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {import.meta.env.VITE_APP_DESCRIPTION || 'Administra materiales, herramientas y equipos para proyectos'}
        </p>
      </div>

      {/* Pestañas */}
      <div className="mt-4">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => onTabChange('gastos')}
            className={`${
              activeTab === 'gastos'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
          >
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>Gastos</span>
          </button>
          <button
            onClick={() => onTabChange('tabla')}
            className={`${
              activeTab === 'tabla'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
          >
            <TableCellsIcon className="h-4 w-4" />
            <span>Tabla de Gastos</span>
          </button>
          <button
            onClick={() => onTabChange('reportes')}
            className={`${
              activeTab === 'reportes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
          >
            <ChartBarIcon className="h-4 w-4" />
            <span>Reportes</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

export default SuministrosHeader;
