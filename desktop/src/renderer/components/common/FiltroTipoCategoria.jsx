import React from 'react';
import { FaBuilding, FaDesktop, FaFilter, FaTimes, FaChartPie } from 'react-icons/fa';

const FiltroTipoCategoria = ({ 
  filtroActivo, 
  onFiltroChange, 
  className = ""
}) => {

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


  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${className}`}>
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-500 h-4 w-4" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            Filtrar por Tipo de Gasto
          </h3>
        </div>
      </div>

      {/* Botones de filtro ultra-compactos */}
      <div className="flex gap-2 mb-2">
        {tiposFiltro.map((tipo) => {
          const isActive = (tipo.key === 'todos' && !filtroActivo) || tipo.key === filtroActivo;
          const Icon = tipo.icon;

          return (
            <button
              key={tipo.key}
              onClick={() => handleFiltroClick(tipo.key)}
              className={`flex-1 p-2 border-2 rounded-lg text-center ${getColorClasses(tipo.color, isActive)}`}
            >
              <div className="flex flex-col items-center space-y-1">
                <Icon className="h-4 w-4" />
                <div className="text-xs font-medium">{tipo.label}</div>
                {isActive && (
                  <div className="w-1.5 h-1.5 bg-current rounded-full"></div>
                )}
              </div>
            </button>
          );
        })}
      </div>


    </div>
  );
};

export default FiltroTipoCategoria;