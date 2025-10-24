import React from 'react';
import {
  LockClosedIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

const PresupuestosPlaceholder = () => {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="max-w-3xl w-full bg-white dark:bg-dark-100 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl shadow-lg p-10 text-center">
        <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 mb-6">
          <LockClosedIcon className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Módulo de Presupuestos en Desarrollo
        </h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
          Estamos trabajando en un módulo completo para crear, analizar y optimizar presupuestos con herramientas avanzadas. Muy pronto podrás gestionar costos, simulaciones y reportes inteligentes desde aquí.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 text-left">
          <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2 text-primary-600 dark:text-primary-400">
              <ChartBarIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Análisis Financiero</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Control de costos, KPI de rentabilidad y seguimiento de avance en tiempo real.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2 text-green-600 dark:text-green-400">
              <DocumentChartBarIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Plantillas Inteligentes</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Presupuestos reutilizables, catálogos de precios y comparativas por proveedor.
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-dark-200 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2 text-purple-600 dark:text-purple-400">
              <SparklesIcon className="w-5 h-5" />
              <span className="text-sm font-semibold">Automatizaciones</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Alertas, aprobaciones y generación de documentación en pocos clics.
            </p>
          </div>
        </div>

        <div className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          ¿Necesitas priorizar alguna funcionalidad? Comparte tu retroalimentación con el equipo.
        </div>
      </div>
    </div>
  );
};

export default PresupuestosPlaceholder;
