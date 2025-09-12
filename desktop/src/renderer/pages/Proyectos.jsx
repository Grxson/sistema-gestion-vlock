import React from 'react';
import { RectangleGroupIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

export default function Proyectos() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center">
            <RectangleGroupIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Proyectos
            </h1>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestión de proyectos y asignaciones
          </p>
        </div>

        {/* En desarrollo Card */}
        <div className="bg-white dark:bg-dark-100 shadow-lg rounded-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-100 dark:bg-orange-900/30 mb-6">
            <WrenchScrewdriverIcon className="h-10 w-10 text-orange-600 dark:text-orange-400" />
          </div>
          
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            En desarrollo
          </h2>
          
          <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Esta sección está actualmente en desarrollo. Pronto podrás gestionar 
            todos los proyectos, asignar empleados y hacer seguimiento del progreso.
          </p>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-lg mx-auto">
            <h3 className="text-sm font-medium text-orange-800 dark:text-orange-200 mb-2">
              Funcionalidades próximamente:
            </h3>
            <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1 text-left">
              <li>• Crear y gestionar proyectos</li>
              <li>• Asignar empleados a proyectos</li>
              <li>• Seguimiento de progreso</li>
              <li>• Reportes de avance</li>
              <li>• Gestión de presupuestos</li>
            </ul>
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 cursor-not-allowed opacity-60">
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
              Próximamente disponible
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
