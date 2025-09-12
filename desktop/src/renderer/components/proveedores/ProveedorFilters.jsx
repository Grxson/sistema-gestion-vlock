import React from 'react';
import { FaFilter, FaTimes } from 'react-icons/fa';

const ProveedorFilters = ({
  filters = {},
  onFiltersChange = () => {},
  onClear = () => {},
  tipos = {}
}) => {
  const handleFilterChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '' && value !== null);

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Filtro por tipo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Proveedor
          </label>
          <select
            value={filters.tipo_proveedor || ''}
            onChange={(e) => handleFilterChange('tipo_proveedor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(tipos).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Filtro por estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            value={filters.activo || ''}
            onChange={(e) => handleFilterChange('activo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>

        {/* Botón para limpiar filtros */}
        <div className="flex items-end">
          <button
            onClick={onClear}
            disabled={!hasActiveFilters}
            className={`w-full px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              hasActiveFilters
                ? 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-dark-300 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            <div className="flex items-center justify-center gap-2">
              <FaTimes className="w-3 h-3" />
              Limpiar filtros
            </div>
          </button>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.tipo_proveedor && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
              Tipo: {tipos[filters.tipo_proveedor] || filters.tipo_proveedor}
              <button
                onClick={() => handleFilterChange('tipo_proveedor', '')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.activo !== '' && filters.activo !== null && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-medium rounded-full">
              Estado: {filters.activo === 'true' ? 'Activos' : 'Inactivos'}
              <button
                onClick={() => handleFilterChange('activo', '')}
                className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <FaTimes className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProveedorFilters;
