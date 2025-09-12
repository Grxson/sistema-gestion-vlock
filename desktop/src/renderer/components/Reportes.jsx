import React, { useState } from 'react';
import { ChartBarIcon, DocumentChartBarIcon, TruckIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import DashboardSuministrosModerno from './DashboardSuministrosModerno';

export default function Reportes() {
  const [activeTab, setActiveTab] = useState('suministros');

  const tabs = [
    {
      id: 'suministros',
      name: 'Suministros y Materiales',
      icon: TruckIcon,
      description: 'Análisis de materiales, servicios y logística por obra'
    },
    {
      id: 'nomina',
      name: 'Nómina y Personal',
      icon: DocumentChartBarIcon,
      description: 'Reportes de nómina, empleados y costos laborales'
    },
    {
      id: 'financiero',
      name: 'Análisis Financiero',
      icon: ChartBarIcon,
      description: 'Costos, presupuestos y análisis financiero'
    },
    {
      id: 'operacional',
      name: 'Operacional',
      icon: BuildingOffice2Icon,
      description: 'Rendimiento de obras, tiempos y eficiencia'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'suministros':
        return <DashboardSuministrosModerno />;
      case 'nomina':
        return renderNominaTab();
      case 'financiero':
        return renderFinancieroTab();
      case 'operacional':
        return renderOperacionalTab();
      default:
        return <DashboardSuministrosModerno />;
    }
  };

  const renderNominaTab = () => (
    <div className="text-center py-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 max-w-md mx-auto">
        <DocumentChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Reportes de Nómina
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Análisis detallado de costos laborales, estadísticas de empleados y evolución de nóminas.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          • Costo laboral por obra<br/>
          • Rendimiento por empleado<br/>
          • Evolución histórica de sueldos<br/>
          • Comparativas entre proyectos
        </div>
        <div className="mt-6 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
          En desarrollo - Próximamente
        </div>
      </div>
    </div>
  );

  const renderFinancieroTab = () => (
    <div className="text-center py-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 max-w-md mx-auto">
        <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Análisis Financiero
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Control de presupuestos, gastos, ingresos y rentabilidad por proyecto.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          • Presupuesto vs Real<br/>
          • Flujo de caja por proyecto<br/>
          • Rentabilidad por obra<br/>
          • Proyecciones financieras
        </div>
        <div className="mt-6 px-4 py-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg">
          Depende de integración con costos
        </div>
      </div>
    </div>
  );

  const renderOperacionalTab = () => (
    <div className="text-center py-20">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-10 max-w-md mx-auto">
        <BuildingOffice2Icon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Reportes Operacionales
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Eficiencia operativa, tiempos de entrega y rendimiento de equipos.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          • Tiempos de entrega promedio<br/>
          • Eficiencia de proveedores<br/>
          • Rendimiento de equipos<br/>
          • Análisis de demoras
        </div>
        <div className="mt-6 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg">
          Datos disponibles desde suministros
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Reportes y Análisis
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Dashboard interactivo con análisis detallado de todas las operaciones
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group inline-flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <tab.icon
                className={`mr-2 h-5 w-5 ${
                  activeTab === tab.id
                    ? 'text-primary-500 dark:text-primary-400'
                    : 'text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                }`}
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {renderContent()}
      </div>

      {/* Info Footer */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Dashboard Mejorado con Datos Reales
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              {activeTab === 'suministros' && 
                'Análisis completo con datos reales de suministros. Incluye filtros avanzados y exportación personalizada a PDF/Excel.'
              }
              {activeTab === 'nomina' && 
                'Próximamente: análisis detallado de costos laborales y rendimiento de empleados.'
              }
              {activeTab === 'financiero' && 
                'Próximamente: control de presupuestos, gastos y rentabilidad por proyecto.'
              }
              {activeTab === 'operacional' && 
                'Próximamente: eficiencia operativa y análisis de rendimiento.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
