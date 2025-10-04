import React, { useState, useEffect } from 'react';
import { FaBuilding, FaDesktop, FaFilter, FaTimes, FaChartPie } from 'react-icons/fa';

const FiltroTipoCategoria = ({ 
  filtroActivo, 
  onFiltroChange, 
  estadisticas = null,
  className = ""
}) => {
  const [showStats, setShowStats] = useState(false);

  const tiposFiltro = [
    {
      key: 'todos',
      label: 'Todos los Gastos',
      icon: FaChartPie,
      color: 'gray',
      description: 'Ver todos los registros'
    },
    {
      key: 'Proyecto',
      label: 'Gastos de Proyecto',
      icon: FaBuilding,
      color: 'blue',
      description: 'Gastos relacionados con obras y proyectos'
    },
    {
      key: 'Administrativo',
      label: 'Gastos Administrativos',
      icon: FaDesktop,
      color: 'green',
      description: 'Gastos de oficina y administración'
    }
  ];

  const handleFiltroClick = (tipo) => {
    const nuevoFiltro = tipo === 'todos' ? null : tipo;
    onFiltroChange(nuevoFiltro);
  };

  const getColorClasses = (color, isActive) => {
    const baseClasses = "transition-all duration-200";
    
    if (isActive) {
      switch (color) {
        case 'blue':
          return `${baseClasses} bg-blue-500 text-white border-blue-500 shadow-lg`;
        case 'green':
          return `${baseClasses} bg-green-500 text-white border-green-500 shadow-lg`;
        case 'gray':
          return `${baseClasses} bg-gray-500 text-white border-gray-500 shadow-lg`;
        default:
          return `${baseClasses} bg-red-500 text-white border-red-500 shadow-lg`;
      }
    } else {
      switch (color) {
        case 'blue':
          return `${baseClasses} bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20`;
        case 'green':
          return `${baseClasses} bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 border-green-200 dark:border-green-600 hover:bg-green-50 dark:hover:bg-green-900/20`;
        case 'gray':
          return `${baseClasses} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`;
        default:
          return `${baseClasses} bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700`;
      }
    }
  };

  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(parseFloat(value));
  };

  const getEstadisticasPorTipo = (tipo) => {
    if (!estadisticas?.por_tipo || !Array.isArray(estadisticas.por_tipo)) return null;
    return estadisticas.por_tipo.find(stat => stat?.tipo_categoria === tipo) || null;
  };

  const formatSafeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || isNaN(value)) return defaultValue;
    return parseFloat(value) || defaultValue;
  };

  const totalGeneral = estadisticas?.por_tipo?.reduce((sum, stat) => {
    if (!stat || typeof stat.total_costo === 'undefined') return sum;
    return sum + formatSafeValue(stat.total_costo, 0);
  }, 0) || 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtrar por Tipo de Gasto
          </h3>
        </div>
        {estadisticas && (
          <button
            onClick={() => setShowStats(!showStats)}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {showStats ? 'Ocultar' : 'Ver'} estadísticas
          </button>
        )}
      </div>

      {/* Botones de filtro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {tiposFiltro.map((tipo) => {
          const isActive = (tipo.key === 'todos' && !filtroActivo) || tipo.key === filtroActivo;
          const Icon = tipo.icon;
          const stats = tipo.key === 'todos' ? null : getEstadisticasPorTipo(tipo.key);

          return (
            <button
              key={tipo.key}
              onClick={() => handleFiltroClick(tipo.key)}
              className={`p-4 border-2 rounded-lg text-left ${getColorClasses(tipo.color, isActive)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tipo.label}</span>
                  </div>
                  <p className="text-sm opacity-75">{tipo.description}</p>
                  
                  {stats && showStats && (
                    <div className="mt-2 text-sm">
                      <div className="flex justify-between">
                        <span>Registros:</span>
                        <span className="font-medium">{formatSafeValue(stats.total_registros, 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total:</span>
                        <span className="font-medium">{formatCurrency(formatSafeValue(stats.total_costo, 0))}</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {isActive && (
                  <div className="ml-2">
                    <div className="w-2 h-2 bg-current rounded-full"></div>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Estadísticas resumen */}
      {estadisticas && showStats && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatSafeValue(getEstadisticasPorTipo('Proyecto')?.total_registros, 0)}
              </div>
              <div className="text-sm text-gray-500">Proyectos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatSafeValue(getEstadisticasPorTipo('Administrativo')?.total_registros, 0)}
              </div>
              <div className="text-sm text-gray-500">Administrativos</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(formatSafeValue(getEstadisticasPorTipo('Proyecto')?.total_costo, 0))}
              </div>
              <div className="text-sm text-gray-500">Total Proyecto</div>
            </div>
            
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(formatSafeValue(getEstadisticasPorTipo('Administrativo')?.total_costo, 0))}
              </div>
              <div className="text-sm text-gray-500">Total Admin</div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              Total General: {formatCurrency(totalGeneral)}
            </div>
          </div>
        </div>
      )}

      {/* Filtro activo */}
      {filtroActivo && (
        <div className="mt-4 flex items-center justify-between bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Filtro activo:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {tiposFiltro.find(t => t.key === filtroActivo)?.label}
            </span>
          </div>
          <button
            onClick={() => onFiltroChange(null)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FaTimes className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FiltroTipoCategoria;