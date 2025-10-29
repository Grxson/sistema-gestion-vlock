import React from 'react';
import { PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export default function IngresosHeader({ onNew, onRefresh }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Ingresos</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Registro de cobros y entradas por proyecto</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onRefresh}
          className="inline-flex items-center px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200"
        >
          <ArrowPathIcon className="h-4 w-4 mr-2" />
          Actualizar
        </button>
        <button
          onClick={onNew}
          className="inline-flex items-center px-5 py-2.5 text-sm rounded-lg shadow-sm hover:shadow-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Ingreso
        </button>
      </div>
    </div>
  );
}
