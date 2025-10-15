import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const AdvancedFilters = ({ 
  filters = {}, 
  onFiltersChange, 
  empleados = [], 
  proyectos = [],
  showQuickFilters = true,
  placeholder = "Buscar..."
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {};
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(localFilters).some(value => 
    value !== '' && value !== null && value !== undefined
  );

  const quickFilters = [
    { key: 'activo', label: 'Solo Activos', value: 'true' },
    { key: 'sin_pago', label: 'Sin Pago Configurado', value: 'sin_pago' },
    { key: 'periodo_actual', label: 'Período Actual', value: getCurrentPeriod() }
  ];

  function getCurrentPeriod() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <FunnelIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filtros
          </h3>
          {hasActiveFilters && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
              {Object.values(localFilters).filter(v => v !== '' && v !== null && v !== undefined).length} activos
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center space-x-1"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Limpiar</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 flex items-center space-x-1"
          >
            <span>{isExpanded ? 'Menos' : 'Más'} filtros</span>
          </button>
        </div>
      </div>

      {/* Búsqueda principal */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={localFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
          placeholder={placeholder}
        />
      </div>

      {/* Filtros rápidos */}
      {showQuickFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {quickFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => handleFilterChange(filter.key, 
                localFilters[filter.key] === filter.value ? '' : filter.value
              )}
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                localFilters[filter.key] === filter.value
                  ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      )}

      {/* Filtros expandidos */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Filtro por empleado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <UserIcon className="h-4 w-4 inline mr-1" />
              Empleado
            </label>
            <select
              value={localFilters.empleado_id || ''}
              onChange={(e) => handleFilterChange('empleado_id', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los empleados</option>
              {empleados.map((empleado) => (
                <option key={empleado.id_empleado} value={empleado.id_empleado}>
                  {empleado.nombre} {empleado.apellido}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por proyecto */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <BuildingOfficeIcon className="h-4 w-4 inline mr-1" />
              Proyecto
            </label>
            <select
              value={localFilters.proyecto_id || ''}
              onChange={(e) => handleFilterChange('proyecto_id', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map((proyecto) => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por período */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <CalendarIcon className="h-4 w-4 inline mr-1" />
              Período
            </label>
            <input
              type="month"
              value={localFilters.periodo || ''}
              onChange={(e) => handleFilterChange('periodo', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={localFilters.estado || ''}
              onChange={(e) => handleFilterChange('estado', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Pagado">Pagado</option>
              <option value="Cancelada">Cancelada</option>
            </select>
          </div>

          {/* Filtro por rango de fechas */}
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de fechas
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  value={localFilters.fecha_desde || ''}
                  onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Desde"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={localFilters.fecha_hasta || ''}
                  onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Hasta"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;
