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
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Seleccionar Gráficas a Mostrar
      </h3>

      <div className="space-y-6">
        {chartCategories.map((category) => {
          const CategoryIcon = category.icon;
          const allSelected = category.charts.every(chart => selectedCharts[chart.key]);
          const someSelected = category.charts.some(chart => selectedCharts[chart.key]);

          return (
            <div key={category.title} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <CategoryIcon className="mr-2 text-blue-500" />
                  {category.title}
                </h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleAll(category.charts, true)}
                    className="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition-colors duration-200"
                    disabled={allSelected}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => handleToggleAll(category.charts, false)}
                    className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition-colors duration-200"
                    disabled={!someSelected}
                  >
                    Ninguna
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {category.charts.map((chart) => (
                  <label
                    key={chart.key}
                    className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedCharts[chart.key]
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-gray-50 dark:bg-dark-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-dark-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!selectedCharts[chart.key]}
                      onChange={(e) => setSelectedCharts({
                        ...selectedCharts,
                        [chart.key]: e.target.checked
                      })}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-3 flex-1">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">
                        {chart.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {chart.description}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuministrosChartSelector;
