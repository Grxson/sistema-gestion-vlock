import React, { useState, useEffect } from 'react';
import {
  WrenchScrewdriverIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const DashboardHerramientas = () => {
  const [dashboardData, setDashboardData] = useState({
    resumen: {
      total_herramientas: 0,
      disponibles: 0,
      prestadas: 0,
      mantenimiento: 0,
      fuera_servicio: 0
    },
    proximosMantenimientos: [],
    herramientasPrestadas: [],
    valorInventario: 0,
    estadisticasUso: {}
  });
  
  const [loading, setLoading] = useState(true);

  // Datos de ejemplo para el dashboard
  const ejemploData = {
    resumen: {
      total_herramientas: 45,
      disponibles: 32,
      prestadas: 8,
      mantenimiento: 3,
      fuera_servicio: 2
    },
    proximosMantenimientos: [
      {
        id: 1,
        herramienta: 'Soldadora Inverter',
        codigo: 'HER-002',
        fecha_mantenimiento: '2024-10-15',
        dias_restantes: 19,
        tipo: 'preventivo'
      },
      {
        id: 2,
        herramienta: 'Compresor de Aire',
        codigo: 'HER-003',
        fecha_mantenimiento: '2024-11-01',
        dias_restantes: 36,
        tipo: 'preventivo'
      },
      {
        id: 3,
        herramienta: 'Martillo Demoledor',
        codigo: 'HER-005',
        fecha_mantenimiento: '2024-10-08',
        dias_restantes: 12,
        tipo: 'correctivo'
      }
    ],
    herramientasPrestadas: [
      {
        id: 1,
        herramienta: 'Taladro Percutor',
        codigo: 'HER-001',
        empleado: 'Juan Pérez',
        fecha_prestamo: '2024-09-20',
        dias_prestado: 6,
        proyecto: 'Obra Central Park'
      },
      {
        id: 2,
        herramienta: 'Nivel Láser',
        codigo: 'HER-004',
        empleado: 'María González',
        fecha_prestamo: '2024-09-18',
        dias_prestado: 8,
        proyecto: 'Plaza Comercial Norte'
      }
    ],
    valorInventario: 125780.50,
    estadisticasUso: {
      utilizacion_promedio: 78,
      herramientas_mas_usadas: [
        { nombre: 'Taladro Percutor', usos: 24 },
        { nombre: 'Soldadora Inverter', usos: 18 },
        { nombre: 'Compresor', usos: 15 }
      ]
    }
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Simular llamada a API
        setTimeout(() => {
          setDashboardData(ejemploData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const { resumen } = dashboardData;
  const porcentajeDisponible = resumen.total_herramientas > 0 ? 
    Math.round((resumen.disponibles / resumen.total_herramientas) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm rounded-lg">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
              <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Dashboard de Herramientas
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resumen del inventario y estado de herramientas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Herramientas */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                  <WrenchScrewdriverIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {resumen.total_herramientas}
              </p>
              <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Total Herramientas</p>
            </div>
          </div>
        </div>

        {/* Disponibles */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {resumen.disponibles}
              </p>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">
                Disponibles ({porcentajeDisponible}%)
              </p>
            </div>
          </div>
        </div>

        {/* Prestadas */}
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center shadow-lg">
                  <UserGroupIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {resumen.prestadas}
              </p>
              <p className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Prestadas</p>
            </div>
          </div>
        </div>

        {/* Mantenimiento */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {resumen.mantenimiento}
              </p>
              <p className="text-sm font-medium text-blue-700 dark:text-blue-300">En Mantenimiento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sección principal con dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Mantenimientos */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Próximos Mantenimientos
              </h3>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.proximosMantenimientos.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.proximosMantenimientos.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        item.dias_restantes <= 7 ? 'bg-red-500' :
                        item.dias_restantes <= 15 ? 'bg-yellow-500' : 'bg-green-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.herramienta}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.codigo} • {item.tipo}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(item.fecha_mantenimiento)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.dias_restantes} días
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay mantenimientos programados
              </p>
            )}
          </div>
        </div>

        {/* Herramientas Prestadas */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <UserGroupIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Herramientas Prestadas
              </h3>
            </div>
          </div>
          <div className="p-6">
            {dashboardData.herramientasPrestadas.length > 0 ? (
              <div className="space-y-4">
                {dashboardData.herramientasPrestadas.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.herramienta}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.codigo} • {item.empleado}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.proyecto}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.dias_prestado} días
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(item.fecha_prestamo)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No hay herramientas prestadas
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Valor del Inventario y Estadísticas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valor del Inventario */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <CurrencyDollarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Valor del Inventario
            </h3>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {formatCurrency(dashboardData.valorInventario)}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Valor total de {resumen.total_herramientas} herramientas
            </p>
          </div>
        </div>

        {/* Herramientas Más Usadas */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <ChartBarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Herramientas Más Usadas
            </h3>
          </div>
          <div className="space-y-3">
            {dashboardData.estadisticasUso.herramientas_mas_usadas?.map((herramienta, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-900 dark:text-white">
                  {herramienta.nombre}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(herramienta.usos / 30) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 w-8">
                    {herramienta.usos}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHerramientas;