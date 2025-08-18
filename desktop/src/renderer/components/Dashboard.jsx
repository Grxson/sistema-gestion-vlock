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
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {updatedStats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover-scale"
          >
            <dt>
              <div className={`absolute ${item.color} rounded-md p-3`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600',
                  'ml-2 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.changeType === 'increase' ? (
                  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-3 w-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="sr-only"> {item.changeType === 'increase' ? 'Increased' : 'Decreased'} by </span>
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Employees */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Empleados Recientes</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {dashboardData.empleadosRecientes.length > 0 ? (
              dashboardData.empleadosRecientes.map((empleado) => (
                <div key={empleado.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-medium text-sm">
                        {empleado.nombre?.charAt(0)?.toUpperCase() || 'E'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">{empleado.nombre}</p>
                      <p className="text-sm text-gray-500">{empleado.puesto}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay empleados registrados
              </div>
            )}
          </div>
        </div>

        {/* System Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actividad del Sistema</h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                  <p className="ml-3 text-sm text-gray-900">Sistema funcionando correctamente</p>
                </div>
                <span className="text-xs text-gray-500">Ahora</span>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                  <p className="ml-3 text-sm text-gray-900">Base de datos sincronizada</p>
                </div>
                <span className="text-xs text-gray-500">5 min</span>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                  <p className="ml-3 text-sm text-gray-900">Respaldo programado</p>
                </div>
                <span className="text-xs text-gray-500">1 hora</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
