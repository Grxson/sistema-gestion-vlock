import React from 'react';
import { FaChartBar, FaSyncAlt } from 'react-icons/fa';
import { useSuministrosData } from '../../hooks/reportes/useSuministrosData';
import {
  SuministrosStatsCards,
  SuministrosFilters,
  SuministrosCharts,
  SuministrosTable,
  SuministrosExport
} from './suministros';

/**
 * Componente principal de reportes de suministros
 * Integra todos los componentes modulares en una vista cohesiva
 */
export default function SuministrosReportsTab() {
  const {
    dashboardData,
    proyectos,
    proveedores,
    categorias,
    loading,
    error,
    filtros,
    handleFilterChange,
    limpiarFiltros,
    recargarDatos
  } = useSuministrosData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando reportes de suministros...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={recargarDatos}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con título y botones de acción */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Reportes de Suministros y Materiales
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis completo de materiales, costos, proveedores y consumos por proyecto
            </p>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={recargarDatos}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shadow-md hover:shadow-lg"
              title="Recargar datos"
            >
              <FaSyncAlt className="w-4 h-4" />
              Actualizar
            </button>
            
            <SuministrosExport 
              dashboardData={dashboardData} 
              filtros={filtros} 
            />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <SuministrosFilters
        filtros={filtros}
        onFilterChange={handleFilterChange}
        onLimpiarFiltros={limpiarFiltros}
        proyectos={proyectos}
        proveedores={proveedores}
        categorias={categorias}
      />

      {/* Tarjetas de estadísticas */}
      <SuministrosStatsCards 
        estadisticas={dashboardData?.estadisticas} 
      />

      {/* Gráficas */}
      <SuministrosCharts 
        dashboardData={dashboardData} 
      />

      {/* Tabla de materiales */}
      <SuministrosTable 
        materiales={dashboardData?.tiposMateriales || []} 
      />

      {/* Footer informativo */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaChartBar className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Reportes en Tiempo Real
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Los datos se actualizan automáticamente al aplicar filtros. 
              Utiliza los botones de exportación para generar reportes en PDF o Excel con la configuración que necesites.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
