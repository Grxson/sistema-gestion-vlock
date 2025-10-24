import React from 'react';
import { 
  FaClipboardList, 
  FaUsers, 
  FaChartLine, 
  FaDatabase,
  FaUserCheck,
  FaClock
} from 'react-icons/fa';

/**
 * Componente de tarjetas de estadísticas para auditoría
 */
const AuditoriaStatsCards = ({ estadisticas, loading }) => {
  const stats = [
    {
      title: 'Total de Registros',
      value: estadisticas?.totalRegistros || 0,
      icon: FaClipboardList
    },
    {
      title: 'Usuarios Activos',
      value: estadisticas?.totalUsuarios || 0,
      icon: FaUsers
    },
    {
      title: 'Total de Acciones',
      value: estadisticas?.totalAcciones || 0,
      icon: FaChartLine
    },
    {
      title: 'Tablas Monitoreadas',
      value: estadisticas?.totalTablas || 0,
      icon: FaDatabase
    },
    {
      title: 'Acciones Hoy',
      value: estadisticas?.accionesHoy || 0,
      icon: FaClock
    },
    {
      title: 'Sesiones Activas',
      value: estadisticas?.sesionesActivas || 0,
      icon: FaUserCheck
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-8 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-3 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-8">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 p-6 shadow-sm transition-colors hover:border-gray-300 dark:hover:border-dark-100"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">{stat.title}</p>
                <p className="text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-md border border-gray-200 dark:border-dark-300 bg-gray-50 dark:bg-dark-100 text-gray-600 dark:text-gray-200">
                <Icon className="text-lg" />
              </div>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              Métrica actualizada con la última sincronización de registros.
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default AuditoriaStatsCards;
