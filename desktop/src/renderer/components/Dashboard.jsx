import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const stats = [
  { 
    name: 'Total Empleados', 
    stat: '0', 
    icon: UserGroupIcon, 
    change: '+4.75%', 
    changeType: 'increase',
    color: 'bg-blue-500'
  },
  { 
    name: 'Nómina del Mes', 
    stat: '$0', 
    icon: CurrencyDollarIcon, 
    change: '+5.4%', 
    changeType: 'increase',
    color: 'bg-green-500'
  },
  { 
    name: 'Contratos Activos', 
    stat: '0', 
    icon: DocumentTextIcon, 
    change: '-1.39%', 
    changeType: 'decrease',
    color: 'bg-yellow-500'
  },
  { 
    name: 'Reportes Generados', 
    stat: '0', 
    icon: ChartBarIcon, 
    change: '+10.18%', 
    changeType: 'increase',
    color: 'bg-purple-500'
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalEmpleados: 0,
    nominaDelMes: 0,
    contratosActivos: 0,
    reportesGenerados: 0,
    empleadosRecientes: [],
    nominasRecientes: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch empleados
      const empleados = await apiService.getEmpleados();
      
      // Fetch contratos (si existe el endpoint)
      let contratos = [];
      try {
        contratos = await apiService.getContratos();
      } catch (error) {
        console.log('Contratos endpoint not available yet');
      }

      // Fetch nómina (si existe el endpoint)
      let nominas = [];
      try {
        nominas = await apiService.getNominas();
      } catch (error) {
        console.log('Nomina endpoint not available yet');
      }

      setDashboardData({
        totalEmpleados: empleados.length || 0,
        nominaDelMes: nominas.reduce((sum, n) => sum + (n.total || 0), 0),
        contratosActivos: contratos.filter(c => c.estado === 'activo').length || 0,
        reportesGenerados: 0, // Placeholder
        empleadosRecientes: empleados.slice(0, 5),
        nominasRecientes: nominas.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatedStats = stats.map(stat => {
    switch (stat.name) {
      case 'Total Empleados':
        return { ...stat, stat: dashboardData.totalEmpleados.toString() };
      case 'Nómina del Mes':
        return { ...stat, stat: `$${dashboardData.nominaDelMes.toLocaleString()}` };
      case 'Contratos Activos':
        return { ...stat, stat: dashboardData.contratosActivos.toString() };
      case 'Reportes Generados':
        return { ...stat, stat: dashboardData.reportesGenerados.toString() };
      default:
        return stat;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Resumen general del sistema de gestión VLock
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {updatedStats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white dark:bg-dark-100 pt-6 px-6 pb-6 shadow-lg dark:shadow-2xl rounded-xl overflow-hidden hover-scale card-shadow border border-gray-100 dark:border-gray-700 transition-all duration-300"
          >
            <dt>
              <div className={`absolute top-4 right-4 ${item.color} rounded-xl p-3 shadow-lg`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate pr-16">{item.name}</p>
            </dt>
            <dd className="mt-4 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                  'ml-3 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.changeType === 'increase' ? (
                  <svg className="h-4 w-4 flex-shrink-0 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 flex-shrink-0 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  </svg>
                )}
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Employees */}
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Empleados Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dashboardData.empleadosRecientes.length > 0 ? (
              dashboardData.empleadosRecientes.map((empleado) => (
                <div key={empleado.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {empleado.nombre?.charAt(0)?.toUpperCase() || 'E'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{empleado.nombre}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{empleado.puesto}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      Activo
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm">No hay empleados registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Actividad del Sistema
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-400 dark:bg-green-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Sistema funcionando correctamente</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">Ahora</span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-400 dark:bg-blue-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Base de datos sincronizada</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">5 min</span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Respaldo programado</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">1 hora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
