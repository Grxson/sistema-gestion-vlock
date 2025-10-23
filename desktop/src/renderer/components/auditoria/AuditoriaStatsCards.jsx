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
      icon: FaClipboardList,
      iconColor: 'text-blue-600 dark:text-blue-300',
      accentBg: 'bg-blue-100/60 dark:bg-blue-500/15'
    },
    {
      title: 'Usuarios Activos',
      value: estadisticas?.totalUsuarios || 0,
      icon: FaUsers,
      iconColor: 'text-green-600 dark:text-green-300',
      accentBg: 'bg-green-100/60 dark:bg-green-500/15'
    },
    {
      title: 'Total de Acciones',
      value: estadisticas?.totalAcciones || 0,
      icon: FaChartLine,
      iconColor: 'text-purple-600 dark:text-purple-300',
      accentBg: 'bg-purple-100/60 dark:bg-purple-500/15'
    },
    {
      title: 'Tablas Monitoreadas',
      value: estadisticas?.totalTablas || 0,
      icon: FaDatabase,
      iconColor: 'text-orange-600 dark:text-orange-300',
      accentBg: 'bg-orange-100/60 dark:bg-orange-500/15'
    },
    {
      title: 'Acciones Hoy',
      value: estadisticas?.accionesHoy || 0,
      icon: FaClock,
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      accentBg: 'bg-cyan-100/60 dark:bg-cyan-500/15'
    },
    {
      title: 'Sesiones Activas',
      value: estadisticas?.sesionesActivas || 0,
      icon: FaUserCheck,
      iconColor: 'text-pink-600 dark:text-pink-300',
      accentBg: 'bg-pink-100/60 dark:bg-pink-500/15'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-6">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-100 rounded-lg shadow-sm p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="rounded-lg border border-gray-200 dark:border-dark-300 bg-white dark:bg-dark-200 shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between gap-3 p-4">
              <div>
                <h3 className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-md ${stat.accentBg}`}>
                <Icon className={`text-lg ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditoriaStatsCards;
