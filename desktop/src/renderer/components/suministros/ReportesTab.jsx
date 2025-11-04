import React from 'react';
import SuministrosChartsDisplay from './SuministrosChartsDisplay';

/**
 * ReportesTab - Componente contenedor para la pestaña de Reportes
 * 
 * Ahora utiliza el nuevo componente SuministrosChartsDisplay que centraliza
 * toda la lógica de gráficas, filtros y selección de visualizaciones.
 * 
 * @param {Object} props - Props para el componente de gráficas
 * @param {Array} props.suministros - Lista de suministros
 * @param {Array} props.proyectos - Lista de proyectos
 * @param {Array} props.proveedores - Lista de proveedores
 * @param {Array} props.categoriasDinamicas - Categorías de suministros
 * @param {Object} props.chartFilters - Filtros activos de gráficas
 * @param {Function} props.setChartFilters - Función para actualizar filtros
 * @param {Object} props.selectedCharts - Gráficas seleccionadas
 * @param {Function} props.setSelectedCharts - Función para actualizar selección
 * @param {Function} props.showError - Función para mostrar errores
 */
const ReportesTab = ({
  suministros,
  proyectos,
  proveedores,
  categoriasDinamicas,
  chartFilters,
  setChartFilters,
  selectedCharts,
  setSelectedCharts,
  showError
}) => {
  return (
    <div className="reportes-tab-container">
      <SuministrosChartsDisplay
        suministros={suministros}
        proyectos={proyectos}
        proveedores={proveedores}
        categoriasDinamicas={categoriasDinamicas}
        chartFilters={chartFilters}
        setChartFilters={setChartFilters}
        selectedCharts={selectedCharts}
        setSelectedCharts={setSelectedCharts}
        showError={showError}
      />
    </div>
  );
};

export default ReportesTab;
