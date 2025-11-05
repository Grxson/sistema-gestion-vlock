import React from 'react';
import { FaChartBar, FaChartLine, FaChartPie } from 'react-icons/fa';

/**
 * Componente selector de gráficas visibles
 */
const SuministrosChartSelector = ({ selectedCharts, setSelectedCharts }) => {
  const chartCategories = [
    {
      title: 'Análisis General',
      icon: FaChartLine,
      charts: [
        { key: 'gastosPorMes', label: 'Gastos por Mes', description: 'Evolución temporal de gastos' },
        { key: 'valorPorCategoria', label: 'Valor por Categoría', description: 'Distribución de gastos por categoría' },
        { key: 'suministrosPorMes', label: 'Cantidad por Mes', description: 'Volumen de suministros mensuales' },
        { key: 'distribucionTipos', label: 'Distribución por Tipos', description: 'Tipos de suministros' },
        { key: 'analisisPorTipoGasto', label: 'Análisis Proyecto vs Administrativo', description: 'Clasificación de gastos' },
    { key: 'gastosPorTipoDoughnut', label: 'Gastos por Tipo (Pastel)', description: 'Administrativo, Proyecto y Nómina' },
      ]
    },
    {
      title: 'Análisis por Proyecto/Proveedor',
      icon: FaChartBar,
      charts: [
        { key: 'gastosPorProyecto', label: 'Gastos por Proyecto', description: 'Inversión por proyecto' },
        { key: 'gastosPorProveedor', label: 'Gastos por Proveedor', description: 'Gastos distribuidos por proveedor' },
        { key: 'cantidadPorEstado', label: 'Cantidad por Estado', description: 'Suministros según estado' },
      ]
    },
    {
      title: 'Análisis de Entregas',
      icon: FaChartLine,
      charts: [
        { key: 'tendenciaEntregas', label: 'Tendencia de Entregas', description: 'Suministros entregados por mes' },
        { key: 'codigosProducto', label: 'Análisis por Código', description: 'Productos más utilizados' },
      ]
    },
    {
      title: 'Análisis Técnico',
      icon: FaChartPie,
      charts: [
        { key: 'analisisTecnicoConcreto', label: 'Análisis Técnico Inteligente', description: 'Análisis según categoría' },
        { key: 'concretoDetallado', label: 'Concreto Detallado', description: 'Proveedores y especificaciones' },
      ]
    },
    {
      title: 'Análisis de Horas',
      icon: FaChartBar,
      charts: [
        { key: 'horasPorMes', label: 'Horas por Mes', description: 'Horas trabajadas mensualmente' },
        { key: 'horasPorEquipo', label: 'Horas por Equipo', description: 'Uso de equipos en horas' },
        { key: 'comparativoHorasVsCosto', label: 'Horas vs Costo', description: 'Comparativo horas-costo' },
      ]
    },
    {
      title: 'Análisis de Unidades',
      icon: FaChartPie,
      charts: [
        { key: 'distribucionUnidades', label: 'Distribución de Unidades', description: 'Unidades de medida utilizadas' },
        { key: 'cantidadPorUnidad', label: 'Cantidad por Unidad', description: 'Cantidades según unidad' },
        { key: 'valorPorUnidad', label: 'Valor por Unidad', description: 'Valor económico por unidad' },
        { key: 'comparativoUnidades', label: 'Comparativo Unidades', description: 'Cantidad vs Valor' },
        { key: 'analisisUnidadesMedida', label: 'Análisis de Unidades', description: 'Análisis general de unidades' },
      ]
    },
    {
      title: 'Análisis Profesional',
      icon: FaChartLine,
      charts: [
        { key: 'gastosPorCategoriaDetallado', label: 'Gastos Detallados por Categoría', description: 'Desglose completo de gastos' },
        { key: 'analisisFrecuenciaSuministros', label: 'Frecuencia de Suministros', description: 'Análisis de recurrencia' },
      ]
    }
  ];

  const handleToggleAll = (categoryCharts, enable) => {
    const updates = {};
    categoryCharts.forEach(chart => {
      updates[chart.key] = enable;
    });
    setSelectedCharts({ ...selectedCharts, ...updates });
  };

  return (
    <div className="chart-selector-compact">
      <div className="selector-header">
        <h3 className="selector-title">
          📊 Gráficas Activas
        </h3>
        <p className="selector-subtitle">
          Selecciona las visualizaciones que deseas mostrar
        </p>
      </div>

      <div className="selector-categories">
        {chartCategories.map((category) => {
          const CategoryIcon = category.icon;
          const allSelected = category.charts.every(chart => selectedCharts[chart.key]);
          const someSelected = category.charts.some(chart => selectedCharts[chart.key]);
          const selectedCount = category.charts.filter(chart => selectedCharts[chart.key]).length;

          return (
            <div key={category.title} className="category-section">
              <div className="category-header">
                <div className="category-title-wrapper">
                  <CategoryIcon className="category-icon" />
                  <h4 className="category-title">{category.title}</h4>
                  {selectedCount > 0 && (
                    <span className="selected-badge">{selectedCount}</span>
                  )}
                </div>
                <div className="category-actions">
                  <button
                    onClick={() => handleToggleAll(category.charts, true)}
                    className="action-btn action-btn-all"
                    disabled={allSelected}
                    title="Seleccionar todas"
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handleToggleAll(category.charts, false)}
                    className="action-btn action-btn-none"
                    disabled={!someSelected}
                    title="Deseleccionar todas"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="charts-list">
                {category.charts.map((chart) => (
                  <label
                    key={chart.key}
                    className={`chart-option ${selectedCharts[chart.key] ? 'active' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedCharts[chart.key]}
                      onChange={(e) => setSelectedCharts({
                        ...selectedCharts,
                        [chart.key]: e.target.checked
                      })}
                      className="chart-checkbox"
                    />
                    <div className="chart-info">
                      <span className="chart-label">{chart.label}</span>
                      <span className="chart-description">{chart.description}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Estilos inline para el componente compacto */}
      <style>{`
        .chart-selector-compact {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .selector-header {
          padding-bottom: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .dark .selector-header {
          border-bottom-color: #4a5568;
        }

        .selector-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .dark .selector-title {
          color: #f9fafb;
        }

        .selector-subtitle {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
        }

        .dark .selector-subtitle {
          color: #9ca3af;
        }

        .selector-categories {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .category-section {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 0.75rem;
          background: #f9fafb;
          transition: all 0.2s;
        }

        .dark .category-section {
          background: #374151;
          border-color: #4a5568;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }

        .category-title-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
        }

        .category-icon {
          color: #3b82f6;
          font-size: 1rem;
        }

        .category-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #374151;
          margin: 0;
        }

        .dark .category-title {
          color: #e5e7eb;
        }

        .selected-badge {
          background: #3b82f6;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.125rem 0.5rem;
          border-radius: 9999px;
          min-width: 1.5rem;
          text-align: center;
        }

        .category-actions {
          display: flex;
          gap: 0.25rem;
        }

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .action-btn-all {
          background: #10b981;
          color: white;
        }

        .action-btn-all:hover:not(:disabled) {
          background: #059669;
          transform: scale(1.05);
        }

        .action-btn-none {
          background: #ef4444;
          color: white;
        }

        .action-btn-none:hover:not(:disabled) {
          background: #dc2626;
          transform: scale(1.05);
        }

        .charts-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .chart-option {
          display: flex;
          align-items: start;
          padding: 0.625rem;
          border-radius: 6px;
          border: 1px solid #e5e7eb;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .dark .chart-option {
          background: #2d3748;
          border-color: #4a5568;
        }

        .chart-option:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .dark .chart-option:hover {
          background: #374151;
          border-color: #5a6678;
        }

        .chart-option.active {
          background: #dbeafe;
          border-color: #3b82f6;
        }

        .dark .chart-option.active {
          background: #1e3a8a;
          border-color: #3b82f6;
        }

        .chart-checkbox {
          margin-top: 0.125rem;
          min-width: 16px;
          width: 16px;
          height: 16px;
          cursor: pointer;
        }

        .chart-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
          margin-left: 0.625rem;
          flex: 1;
        }

        .chart-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #111827;
          line-height: 1.25;
        }

        .dark .chart-label {
          color: #f9fafb;
        }

        .chart-option.active .chart-label {
          color: #1e40af;
        }

        .dark .chart-option.active .chart-label {
          color: #93c5fd;
        }

        .chart-description {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.25;
        }

        .dark .chart-description {
          color: #9ca3af;
        }

        .chart-option.active .chart-description {
          color: #3b82f6;
        }

        .dark .chart-option.active .chart-description {
          color: #60a5fa;
        }

        /* Responsive para tablets */
        @media (max-width: 1024px) {
          .selector-title {
            font-size: 1rem;
          }

          .category-title {
            font-size: 0.85rem;
          }

          .chart-label {
            font-size: 0.8125rem;
          }

          .chart-description {
            font-size: 0.7rem;
          }
        }

        /* Responsive para móviles */
        @media (max-width: 768px) {
          .chart-selector-compact {
            gap: 0.75rem;
          }

          .category-section {
            padding: 0.625rem;
          }

          .chart-option {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SuministrosChartSelector;
