import React from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';

const SimplePresupuestoCreator = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Advanced Presupuesto Creator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Sistema profesional para crear presupuestos de construcción
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8">
            <div className="text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
                  <DocumentTextIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Sistema Listo!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
                  El Advanced Presupuesto Creator está funcionando correctamente. 
                  Todas las funciones del sidebar han sido desbloqueadas.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Wizard Profesional
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    Sistema de 5 pasos similar a Opus para crear presupuestos detallados
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                    Exportación Profesional
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    PDF y Excel con branding V-Lock y formato profesional
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
                  <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
                    Catálogos Integrados
                  </h3>
                  <p className="text-sm text-purple-700 dark:text-purple-400">
                    Acceso completo a conceptos de obra y precios regionales
                  </p>
                </div>
              </div>

              {/* Navigation Options */}
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Explora las siguientes opciones del módulo de presupuestos:
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <button 
                    onClick={() => onNavigate?.('/presupuestos/conceptos')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Conceptos de Obra
                  </button>
                  <button 
                    onClick={() => onNavigate?.('/presupuestos/precios')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Precios Unitarios
                  </button>
                  <button 
                    onClick={() => onNavigate?.('/presupuestos/listado')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Ver Presupuestos
                  </button>
                  <button 
                    onClick={() => onNavigate?.('/presupuestos/catalogos')}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                  >
                    Catálogos
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimplePresupuestoCreator;