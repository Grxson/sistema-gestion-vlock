import React from 'react';
import { FaFilter, FaSyncAlt } from 'react-icons/fa';
import DateInput from '../../ui/DateInput';

/**
 * Componente de filtros para el dashboard de suministros
 * Permite filtrar por fecha, proyecto, proveedor y categoría
 */
export default function SuministrosFilters({ 
  filtros, 
  onFilterChange, 
  onLimpiarFiltros,
  proyectos = [],
  proveedores = [],
  categorias = []
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaFilter className="text-gray-600 dark:text-gray-400" />
          <h3 className="font-medium text-gray-900 dark:text-white">
            Filtros de Búsqueda
          </h3>
        </div>
        
        <button
          onClick={onLimpiarFiltros}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <FaSyncAlt className="w-3 h-3" />
          Limpiar
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Fecha inicio */}
        <div>
          <DateInput
            label="Fecha Inicio"
            value={filtros.fecha_inicio}
            onChange={(value) => onFilterChange('fecha_inicio', value)}
            placeholder="Seleccionar fecha inicio"
          />
        </div>

        {/* Fecha fin */}
        <div>
          <DateInput
            label="Fecha Fin"
            value={filtros.fecha_fin}
            onChange={(value) => onFilterChange('fecha_fin', value)}
            placeholder="Seleccionar fecha fin"
          />
        </div>

        {/* Proyecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proyecto
          </label>
          <select
            value={filtros.id_proyecto}
            onChange={(e) => onFilterChange('id_proyecto', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los proyectos</option>
            {proyectos.map(proyecto => (
              <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Proveedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Proveedor
          </label>
          <select
            value={filtros.id_proveedor}
            onChange={(e) => onFilterChange('id_proveedor', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todos los proveedores</option>
            {proveedores.map(proveedor => (
              <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoría
          </label>
          <select
            value={filtros.categoria}
            onChange={(e) => onFilterChange('categoria', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Todas las categorías</option>
            {categorias.map(categoria => (
              <option key={categoria} value={categoria}>
                {categoria}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {Object.values(filtros).some(v => v) && (
        <div className="mt-4 flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <FaFilter className="w-3 h-3" />
          <span>
            Filtros activos: {Object.values(filtros).filter(v => v).length}
          </span>
        </div>
      )}
    </div>
  );
}
