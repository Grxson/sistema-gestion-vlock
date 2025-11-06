/**
 * SuministrosChartsDisplay.jsx
 * Componente principal para mostrar todas las gráficas de análisis de suministros
 * Utiliza el hook useChartData y los componentes de filtros y selector
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { FiTrendingUp, FiDollarSign, FiPackage, FiClock, FiActivity, FiBarChart2 } from 'react-icons/fi';
import SuministrosChartFilters from './SuministrosChartFilters';
import SuministrosChartSelector from './SuministrosChartSelector';
import { useChartData } from '../../hooks/useChartData';
import { computeGastoFromItem } from '../../utils/calc';
import { 
  getLineChartOptions, 
  getDoughnutChartOptions, 
  getBarChartOptions, 
  MetricsDisplay 
} from '../../utils/chartHelpers.jsx';
import GastosPorTipoDoughnutDisplay from './GastosPorTipoDoughnutDisplay';
import './SuministrosChartsDisplay.css';

/**
 * Componente principal de visualización de gráficas
 */
const SuministrosChartsDisplay = ({
  suministros = [],
  proyectos = [],
  proveedores = [],
  categoriasDinamicas = [],
  chartFilters,
  setChartFilters,
  selectedCharts,
  setSelectedCharts,
  showError
}) => {
  // Hook personalizado para manejar datos de gráficas
  const { chartData, loadingCharts, loadChartData } = useChartData(showError);

  // Estado para forzar re-render cuando cambie el tema
  const [themeVersion, setThemeVersion] = useState(0);

  // Función para calcular total (helper)
  const calculateTotal = useMemo(() => (data) => {
    return data.reduce((sum, item) => sum + computeGastoFromItem(item), 0);
  }, []);

  // Detectar cambios de tema y forzar re-render de gráficas
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target === document.documentElement) {
            // El tema cambió, forzamos un re-render de las gráficas
            console.log('🎨 Tema cambiado, actualizando gráficas...');
            setThemeVersion(prev => prev + 1);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Cargar datos cuando cambien los filtros, suministros o tema
  useEffect(() => {
    if (suministros && suministros.length > 0) {
      console.log('🔄 Recargando datos de gráficas...', {
        suministros: suministros.length,
        filtros: chartFilters,
        themeVersion
      });
      loadChartData(suministros, chartFilters, categoriasDinamicas, proyectos, calculateTotal);
    }
  }, [suministros, chartFilters, categoriasDinamicas, proyectos, loadChartData, calculateTotal, themeVersion]);

  // Renderizar una gráfica individual con su card
  const renderChart = useCallback((chartKey, title, type, icon) => {
    if (!selectedCharts[chartKey]) return null;
    
    const data = chartData[chartKey];
    if (!data) return null;

    const IconComponent = icon;
    const ChartComponent = type === 'line' ? Line : 
                          type === 'bar' ? Bar : 
                          type === 'doughnut' ? Doughnut : 
                          Pie;

    // Regenerar opciones en cada render para reflejar cambios de tema
    const options = type === 'line' ? getLineChartOptions(title, data.metrics) :
                   type === 'doughnut' || type === 'pie' ? getDoughnutChartOptions(title, data.metrics) :
                   getBarChartOptions(title, data.metrics);

    return (
      <div key={`${chartKey}-${themeVersion}`} className="chart-card">
        <div className="chart-header">
          <IconComponent className="chart-icon" />
          <h3>{title}</h3>
        </div>
        
        {/* Métricas si existen */}
        {data.metrics && (
          <MetricsDisplay metrics={data.metrics} />
        )}

        {/* Gráfica */}
        <div className="chart-container">
          <ChartComponent 
            key={`chart-${chartKey}-${themeVersion}`}
            data={data} 
            options={options} 
            redraw={true}
          />
        </div>
      </div>
    );
  }, [selectedCharts, chartData, themeVersion]);

  return (
    <div className="charts-display-container">
      {/* Layout con sidebar y contenido principal */}
      <div className="charts-layout">
        {/* Sidebar fijo con filtros y selector de gráficas */}
        <aside className="charts-sidebar">
          <div className="sidebar-sticky">
            {/* Filtros integrados en el sidebar */}
            <div className="sidebar-section">
              <SuministrosChartFilters
                chartFilters={chartFilters}
                setChartFilters={setChartFilters}
                proyectos={proyectos}
                proveedores={proveedores}
                categoriasDinamicas={categoriasDinamicas}
                suministros={suministros}
              />
            </div>

            {/* Divisor visual */}
            <div className="sidebar-divider"></div>

            {/* Selector de gráficas */}
            <div className="sidebar-section">
              <SuministrosChartSelector
                selectedCharts={selectedCharts}
                setSelectedCharts={setSelectedCharts}
              />
            </div>
          </div>
        </aside>

        {/* Contenido principal - Gráficas */}
        <main className="charts-main-content">
          {/* Estado de carga */}
          {loadingCharts && (
            <div className="loading-charts">
              <div className="spinner"></div>
              <p>Cargando gráficas...</p>
            </div>
          )}

          {/* Grid de gráficas */}
          {!loadingCharts && (
            <div className="charts-grid">
              {/* GRÁFICAS GENERALES */}
              {renderChart('gastosPorMes', 'Gastos Mensuales', 'line', FiTrendingUp)}
              {renderChart('valorPorCategoria', 'Valor por Categoría', 'doughnut', FiDollarSign)}
              {renderChart('suministrosPorMes', 'Suministros por Mes', 'line', FiPackage)}

              {/* GRÁFICAS POR PROYECTO Y PROVEEDOR */}
              {renderChart('gastosPorProyecto', 'Gastos por Proyecto', 'bar', FiBarChart2)}
              {renderChart('gastosPorProveedor', 'Gastos por Proveedor', 'doughnut', FiDollarSign)}

              {/* GRÁFICAS DE ENTREGAS */}
              {renderChart('cantidadPorEstado', 'Cantidad por Estado', 'pie', FiActivity)}
              {renderChart('distribucionTipos', 'Distribución de Tipos', 'doughnut', FiPackage)}
              {renderChart('tendenciaEntregas', 'Tendencia de Entregas', 'line', FiTrendingUp)}

              {/* GRÁFICAS TÉCNICAS */}
              {renderChart('analisisPorTipoGasto', 'Análisis por Tipo de Gasto', 'bar', FiDollarSign)}
              {renderChart('codigosProducto', 'Top 10 Códigos de Producto', 'bar', FiPackage)}
              {renderChart('analisisTecnicoConcreto', 'Análisis Técnico Inteligente', 'bar', FiActivity)}
              {renderChart('concretoDetallado', 'Análisis de Concreto Detallado', 'doughnut', FiActivity)}

              {/* GRÁFICA DE PASTEL POR TIPO DE GASTO - PROFESIONAL */}
              {selectedCharts.gastosPorTipoDoughnut && (
                <GastosPorTipoDoughnutDisplay chartData={chartData.gastosPorTipoDoughnut} />
              )}

              {/* GRÁFICAS DE HORAS */}
              {renderChart('horasPorMes', 'Horas Trabajadas por Mes', 'line', FiClock)}
              {renderChart('horasPorEquipo', 'Horas por Equipo', 'bar', FiClock)}
              {renderChart('comparativoHorasVsCosto', 'Comparativo Horas vs Costo', 'bar', FiDollarSign)}

              {/* GRÁFICAS DE UNIDADES */}
              {renderChart('distribucionUnidades', 'Distribución de Unidades', 'doughnut', FiPackage)}
              {renderChart('cantidadPorUnidad', 'Cantidad por Unidad', 'bar', FiPackage)}
              {renderChart('valorPorUnidad', 'Valor por Unidad', 'bar', FiDollarSign)}
              {renderChart('comparativoUnidades', 'Comparativo de Unidades', 'bar', FiBarChart2)}
              {renderChart('totalMetrosCubicos', 'Total Metros Cúbicos', 'doughnut', FiActivity)}
              {renderChart('analisisUnidadesMedida', 'Análisis de Unidades de Medida', 'bar', FiBarChart2)}

              {/* GRÁFICAS PROFESIONALES */}
              {renderChart('gastosPorCategoriaDetallado', 'Gastos por Categoría Detallado', 'doughnut', FiDollarSign)}
              {renderChart('analisisFrecuenciaSuministros', 'Análisis de Frecuencia', 'bar', FiActivity)}
              {renderChart('eficienciaProveedores', 'Eficiencia de Proveedores', 'bar', FiTrendingUp)}
              {renderChart('analisisCostosPorProyecto', 'Análisis de Costos por Proyecto', 'bar', FiDollarSign)}
            </div>
          )}

          {/* Mensaje cuando no hay gráficas seleccionadas */}
          {!loadingCharts && Object.values(selectedCharts).every(val => !val) && (
            <div className="no-charts-selected">
              <FiBarChart2 size={64} />
              <h3>No hay gráficas seleccionadas</h3>
              <p>Utiliza el selector de gráficas para elegir qué visualizaciones mostrar</p>
            </div>
          )}

          {/* Mensaje cuando no hay datos */}
          {!loadingCharts && suministros.length === 0 && (
            <div className="no-data-available">
              <FiPackage size={64} />
              <h3>No hay datos disponibles</h3>
              <p>No se encontraron suministros para mostrar gráficas</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SuministrosChartsDisplay;
