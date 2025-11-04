/**
 * SuministrosChartsDisplay.jsx
 * Componente principal para mostrar todas las gráficas de análisis de suministros
 * Utiliza el hook useChartData y los componentes de filtros y selector
 */

import React, { useEffect, useMemo } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { FiTrendingUp, FiDollarSign, FiPackage, FiClock, FiActivity, FiBarChart2 } from 'react-icons/fi';
import SuministrosChartFilters from './SuministrosChartFilters';
import SuministrosChartSelector from './SuministrosChartSelector';
import { useChartData } from '../../hooks/useChartData';
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

  // Función para calcular total (helper)
  const calculateTotal = useMemo(() => (data) => {
    return data.reduce((sum, item) => {
      const cantidad = parseFloat(item.cantidad) || 0;
      const precio = parseFloat(item.precio_unitario) || 0;
      return sum + (cantidad * precio);
    }, 0);
  }, []);

  // Cargar datos cuando cambien los filtros o suministros
  useEffect(() => {
    if (suministros && suministros.length > 0) {
      loadChartData(suministros, chartFilters, categoriasDinamicas, proyectos, calculateTotal);
    }
  }, [suministros, chartFilters, categoriasDinamicas, proyectos, loadChartData, calculateTotal]);

  // Renderizar una gráfica individual con su card
  const renderChart = (chartKey, title, type, icon) => {
    if (!selectedCharts[chartKey]) return null;
    
    const data = chartData[chartKey];
    if (!data) return null;

    const IconComponent = icon;
    const ChartComponent = type === 'line' ? Line : 
                          type === 'bar' ? Bar : 
                          type === 'doughnut' ? Doughnut : 
                          Pie;

    const options = type === 'line' ? getLineChartOptions(title) :
                   type === 'doughnut' || type === 'pie' ? getDoughnutChartOptions(title) :
                   getBarChartOptions(title);

    return (
      <div key={chartKey} className="chart-card">
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
          <ChartComponent data={data} options={options} />
        </div>
      </div>
    );
  };

  return (
    <div className="charts-display-container">
      {/* Panel de filtros */}
      <div className="filters-section">
        <SuministrosChartFilters
          chartFilters={chartFilters}
          setChartFilters={setChartFilters}
          proyectos={proyectos}
          proveedores={proveedores}
          categoriasDinamicas={categoriasDinamicas}
          suministros={suministros}
        />
      </div>

      {/* Selector de gráficas */}
      <div className="selector-section">
        <SuministrosChartSelector
          selectedCharts={selectedCharts}
          setSelectedCharts={setSelectedCharts}
        />
      </div>

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
    </div>
  );
};

export default SuministrosChartsDisplay;
