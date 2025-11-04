import React from 'react';
import { FaFilter, FaCalendarAlt } from 'react-icons/fa';
import DateInput from '../ui/DateInput';

/**
 * Componente de filtros para las gráficas de suministros
 */
const SuministrosChartFilters = ({ 
  chartFilters, 
  setChartFilters, 
  proyectos,
  proveedores,
  categoriasDinamicas 
}) => {
  // Obtener tipos únicos de las categorías dinámicas
  const tiposUnicos = categoriasDinamicas && Array.isArray(categoriasDinamicas)
    ? [...new Set(categoriasDinamicas.map(cat => cat.tipo).filter(Boolean))]
    : [];

  return (
    <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <FaFilter className="mr-2" />
        Filtros Avanzados de Análisis
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filtro de Fecha Inicio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaCalendarAlt className="inline mr-1" />
            Fecha Inicio
          </label>
          <DateInput
            value={chartFilters.fechaInicio}
            onChange={(e) => setChartFilters({...chartFilters, fechaInicio: e.target.value})}
            className="w-full"
          />
        </div>

        {/* Filtro de Fecha Fin */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <FaCalendarAlt className="inline mr-1" />
            Fecha Fin
          </label>
          <DateInput
            value={chartFilters.fechaFin}
            onChange={(e) => setChartFilters({...chartFilters, fechaFin: e.target.value})}
            className="w-full"
          />
        </div>

        {/* Filtro por Proyecto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proyecto Específico
          </label>
          <select
            value={chartFilters.proyectoId}
            onChange={(e) => setChartFilters({...chartFilters, proyectoId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
          >
            <option value="">Todos los proyectos</option>
            {proyectos && proyectos.map(proyecto => (
              <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                {proyecto.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Proveedor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Proveedor Específico
          </label>
          <select
            value={chartFilters.proveedorNombre}
            onChange={(e) => setChartFilters({...chartFilters, proveedorNombre: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
          >
            <option value="">Todos los proveedores</option>
            {proveedores && proveedores.map(proveedor => (
              <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                {proveedor.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Tipo de Suministro */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tipo de Suministro
          </label>
          <select
            value={chartFilters.tipoSuministro}
            onChange={(e) => setChartFilters({...chartFilters, tipoSuministro: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
          >
            <option value="">Todos los tipos</option>
            {tiposUnicos.map(tipo => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Estado
          </label>
          <select
            value={chartFilters.estado}
            onChange={(e) => setChartFilters({...chartFilters, estado: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-100 text-gray-900 dark:text-white"
          >
            <option value="">Todos los estados</option>
            <option value="Solicitado">Solicitado</option>
            <option value="Aprobado">Aprobado</option>
            <option value="Pedido">Pedido</option>
            <option value="En Tránsito">En Tránsito</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Botón de Reset */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={() => setChartFilters({
            fechaInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
            fechaFin: new Date().toISOString().split('T')[0],
            proyectoId: '',
            proveedorNombre: '',
            tipoSuministro: '',
            estado: '',
            tipoAnalisis: 'gastos'
          })}
          className="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          Restablecer Filtros
        </button>
      </div>
    </div>
  );
};

export default SuministrosChartFilters;
