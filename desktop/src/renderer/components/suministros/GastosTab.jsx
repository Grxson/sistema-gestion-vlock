import React from 'react';
import { FaTimes } from 'react-icons/fa';
import FiltroTipoCategoria from '../common/FiltroTipoCategoria';
import { formatCurrency } from '../../utils/formatters';

const GastosTab = ({ 
  filters, 
  searchTerm,
  filteredStats,
  estadisticasTipo,
  onFiltroTipoChange,
  onClearFilters 
}) => {
  return (
    <>
      {/* Filtro por Tipo de Categoría */}
      <FiltroTipoCategoria
        filtroActivo={filters.tipo_categoria}
        onFiltroChange={onFiltroTipoChange}
        estadisticas={estadisticasTipo}
        className="mb-4"
      />

      {/* Información de filtros activos */}
      {(searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium">Vista filtrada:</span>
              <span className="text-blue-600 dark:text-blue-400">
                {filteredStats.totalSuministrosFiltrados} suministros
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                Total: {formatCurrency(filteredStats.totalGastadoFiltrado)}
              </span>
            </div>
            <button
              onClick={onClearFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              <FaTimes className="h-3 w-3" />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default GastosTab;
