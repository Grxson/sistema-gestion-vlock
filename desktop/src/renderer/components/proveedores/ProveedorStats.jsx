import React from 'react';
import { FaTimes, FaBuilding, FaUsers, FaToggleOn, FaToggleOff, FaChartBar } from 'react-icons/fa';

const ProveedorStats = ({ stats, loading, onClose }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas de Proveedores</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          <span className="ml-2 text-gray-500 dark:text-gray-400">Cargando estadísticas...</span>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Estadísticas de Proveedores</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No hay estadísticas disponibles</p>
        </div>
      </div>
    );
  }

  const statsData = [
    {
      title: 'Total Proveedores',
      value: stats.total || 0,
      icon: FaBuilding,
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      iconBg: 'bg-blue-500'
    },
    {
      title: 'Proveedores Activos',
      value: stats.activos || 0,
      icon: FaToggleOn,
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      iconBg: 'bg-green-500'
    },
    {
      title: 'Proveedores Inactivos',
      value: stats.inactivos || 0,
      icon: FaToggleOff,
      color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      iconBg: 'bg-red-500'
    },
    {
      title: 'Tipos Diferentes',
      value: stats.tipos || 0,
      icon: FaChartBar,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
      iconBg: 'bg-purple-500'
    }
  ];

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <FaChartBar className="text-red-500" />
          Estadísticas de Proveedores
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>
      </div>

      {/* Grid de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-50 dark:bg-dark-200 rounded-lg p-4 border border-gray-100 dark:border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.iconBg}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Distribución por tipo */}
      {stats.porTipo && Object.keys(stats.porTipo).length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
            Distribución por Tipo
          </h4>
          <div className="space-y-3">
            {Object.entries(stats.porTipo).map(([tipo, cantidad]) => {
              const porcentaje = stats.total > 0 ? ((cantidad / stats.total) * 100).toFixed(1) : 0;
              return (
                <div key={tipo} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[80px]">
                      {tipo}
                    </span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {cantidad}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({porcentaje}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
          <div>
            <strong>Última actualización:</strong> {new Date().toLocaleString('es-MX')}
          </div>
          {stats.ultimoCreado && (
            <div>
              <strong>Último creado:</strong> {new Date(stats.ultimoCreado).toLocaleDateString('es-MX')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProveedorStats;
