import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { usePermissions } from '../contexts/PermissionsContext';
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
    empleadosActivos: 0,
    nominaDelMes: 0,
    contratosActivos: 0,
    reportesGenerados: 0,
    empleadosRecientes: [],
    nominasRecientes: [],
    estadisticasDetalladas: null
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { hasPermission, hasModuleAccess } = usePermissions();

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [hasModuleAccess, hasPermission]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      let empleadosData = [];
      let contratosData = [];
      let nominasData = [];
      let empleadosStats = null;
      let contratosStats = null;
      let nominaStats = null;
      
      // Fetch empleados y sus estadísticas
      if (hasModuleAccess('empleados')) {
        try {
          const [empleados, estadisticas] = await Promise.all([
            apiService.getEmpleados(),
            apiService.getEmpleadosStats()
          ]);
          
          empleadosData = Array.isArray(empleados) ? empleados : empleados.empleados || [];
          empleadosStats = estadisticas.estadisticas || estadisticas;
          console.log('Datos de empleados cargados:', empleadosData.length);
        } catch (error) {
          console.log('Error al obtener empleados:', error.message);
        }
      }
      
      // Fetch contratos y sus estadísticas
      if (hasModuleAccess('contratos')) {
        try {
          const [contratos, estadisticas] = await Promise.all([
            apiService.getContratos(),
            apiService.getContratosStats()
          ]);
          
          contratosData = Array.isArray(contratos) ? contratos : contratos.contratos || [];
          contratosStats = estadisticas.estadisticas || estadisticas;
          console.log('Datos de contratos cargados:', contratosData.length);
        } catch (error) {
          console.log('Error al obtener contratos:', error.message);
        }
      }

      // Fetch nómina y sus estadísticas
      if (hasModuleAccess('nomina')) {
        try {
          const [nominasResponse, estadisticas] = await Promise.all([
            apiService.getNominas(),
            apiService.getNominaStats()
          ]);
          
          // La API de nómina devuelve { nominas: [...] }
          nominasData = Array.isArray(nominasResponse) ? nominasResponse : 
                       Array.isArray(nominasResponse.nominas) ? nominasResponse.nominas : [];
          nominaStats = estadisticas.estadisticas || estadisticas;
          console.log('Datos de nóminas cargados:', nominasData.length);
        } catch (error) {
          console.log('Error al obtener nóminas:', error.message);
        }
      }

      // Calcular empleados activos (asegurar que sea array)
      const empleadosActivosList = Array.isArray(empleadosData) ? empleadosData : [];
      const empleadosActivos = empleadosActivosList.filter(emp => !emp.fecha_baja).length;
      
      // Calcular contratos activos (asegurar que sea array)
      const contratosActivosList = Array.isArray(contratosData) ? contratosData : [];
      const contratosActivos = contratosActivosList.filter(c => c.estado === 'activo').length;
      
      // Calcular nómina del mes actual (asegurar que sea array)
      const nominasActivasList = Array.isArray(nominasData) ? nominasData : [];
      const fechaActual = new Date();
      const mesActual = fechaActual.getMonth() + 1;
      const añoActual = fechaActual.getFullYear();
      
      const nominaMesActual = nominasActivasList
        .filter(n => {
          // Intentar con diferentes campos de fecha que podrían existir
          const fechaNomina = new Date(n.fecha_creacion || n.createdAt || n.fecha_pago || 0);
          return fechaNomina.getMonth() + 1 === mesActual && 
                 fechaNomina.getFullYear() === añoActual;
        })
        .reduce((sum, n) => sum + (parseFloat(n.total || n.monto_total || 0)), 0);

      // Ordenar empleados por fecha de alta (más recientes primero)
      const empleadosOrdenados = [...empleadosActivosList].sort((a, b) => {
        const fechaA = new Date(a.fecha_alta || 0);
        const fechaB = new Date(b.fecha_alta || 0);
        return fechaB - fechaA;
      });
      
      setDashboardData({
        totalEmpleados: empleadosActivosList.length || 0,
        empleadosActivos: empleadosActivos,
        nominaDelMes: nominaMesActual,
        contratosActivos: contratosActivos,
        reportesGenerados: nominasActivasList.length || 0, // Usar nóminas como proxy para reportes
        empleadosRecientes: empleadosOrdenados.slice(0, 5),
        nominasRecientes: nominasActivasList.slice(0, 5),
        estadisticasDetalladas: {
          empleados: empleadosStats,
          contratos: contratosStats,
          nomina: nominaStats
        }
      });

      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatedStats = stats.map(stat => {
    switch (stat.name) {
      case 'Total Empleados':
        return { 
          ...stat, 
          stat: hasModuleAccess('empleados') ? dashboardData.totalEmpleados.toString() : '---',
          change: hasModuleAccess('empleados') && dashboardData.estadisticasDetalladas?.empleados 
            ? `${dashboardData.empleadosActivos} activos` : '---',
          changeType: 'neutral'
        };
      case 'Nómina del Mes':
        return { 
          ...stat, 
          stat: hasModuleAccess('nomina') ? `$${dashboardData.nominaDelMes.toLocaleString('es-MX')}` : '---',
          change: hasModuleAccess('nomina') ? 'Mes actual' : '---',
          changeType: 'neutral'
        };
      case 'Contratos Activos':
        return { 
          ...stat, 
          stat: hasModuleAccess('contratos') ? dashboardData.contratosActivos.toString() : '---',
          change: hasModuleAccess('contratos') ? `de ${dashboardData.totalEmpleados}` : '---',
          changeType: 'neutral'
        };
      case 'Reportes Generados':
        return { 
          ...stat, 
          stat: hasModuleAccess('nomina') ? dashboardData.reportesGenerados.toString() : '---',
          change: hasModuleAccess('nomina') ? 'Total' : '---',
          changeType: 'neutral'
        };
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Resumen general del sistema de gestión VLock
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {lastUpdate.toLocaleString('es-MX')}
            </p>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
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

      {/* Estadísticas Detalladas */}
      {dashboardData.estadisticasDetalladas && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estadísticas de Empleados */}
          {hasModuleAccess('empleados') && dashboardData.estadisticasDetalladas.empleados && (
            <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <UserGroupIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Empleados por Oficios
                </h3>
              </div>
              <div className="p-6">
                {dashboardData.estadisticasDetalladas.empleados.empleados_por_oficio?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.nombre_oficio}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.total_empleados}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas de Contratos */}
          {hasModuleAccess('contratos') && dashboardData.estadisticasDetalladas.contratos && (
            <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Contratos por Tipo
                </h3>
              </div>
              <div className="p-6">
                {dashboardData.estadisticasDetalladas.contratos.contratos_por_tipo?.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.tipo_contrato}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.total}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas de Nómina */}
          {hasModuleAccess('nomina') && dashboardData.estadisticasDetalladas.nomina && (
            <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <CurrencyDollarIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Resumen de Nómina
                </h3>
              </div>
              <div className="p-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total Pagado</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${(dashboardData.estadisticasDetalladas.nomina.total_pagado || 0).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Promedio por Empleado</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${(dashboardData.estadisticasDetalladas.nomina.promedio_por_empleado || 0).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Nóminas Procesadas</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {dashboardData.estadisticasDetalladas.nomina.total_nominas || 0}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
            {!hasModuleAccess('empleados') ? (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm">No tienes permiso para ver empleados</p>
              </div>
            ) : dashboardData.empleadosRecientes.length > 0 ? (
              dashboardData.empleadosRecientes.map((empleado) => (
                <div key={empleado.id_empleado} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                        <span className="text-white font-semibold text-sm">
                          {`${empleado.nombre?.charAt(0) || ''}${empleado.apellido?.charAt(0) || ''}`}
                        </span>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{`${empleado.nombre || ''} ${empleado.apellido || ''}`}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {empleado.fecha_alta ? new Date(empleado.fecha_alta).toLocaleDateString() : 'Sin fecha'}
                        </p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      {empleado.fecha_baja ? 'Inactivo' : 'Activo'}
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
