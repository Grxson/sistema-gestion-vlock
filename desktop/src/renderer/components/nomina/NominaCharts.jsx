import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { formatCurrency } from '../../utils/currency';
import {
  ChartBarIcon,
  ChartPieIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function NominaCharts({ chartsData, loading }) {
  const [selectedChart, setSelectedChart] = useState('proyectos');
  const [showFullscreen, setShowFullscreen] = useState(false);

  if (loading || !chartsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Generando gráficas...</p>
        </div>
      </div>
    );
  }

  const { proyectosDistribution, monthlyPayments, topEmpleados } = chartsData;

  // Configuración común para las gráficas
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#6B7280',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context) {
            if (context.dataset.label === 'Monto') {
              return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
            }
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#6B7280',
          callback: function(value) {
            if (selectedChart === 'monthly') {
              return formatCurrency(value);
            }
            return value;
          }
        }
      },
      x: {
        grid: {
          color: '#E5E7EB',
        },
        ticks: {
          color: '#6B7280',
        }
      }
    }
  };

  // Datos para gráfica de nómina por proyecto
  const proyectosChartData = {
    labels: proyectosDistribution.labels,
    datasets: [
      {
        label: 'Monto Total',
        data: proyectosDistribution.data,
        backgroundColor: proyectosDistribution.colors,
        borderColor: proyectosDistribution.colors.map(color => color),
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  // Datos para gráfica de pagos mensuales
  const monthlyChartData = {
    labels: monthlyPayments.labels,
    datasets: [
      {
        label: 'Monto',
        data: monthlyPayments.data,
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Datos para gráfica de top empleados
  const topEmpleadosChartData = {
    labels: topEmpleados.labels,
    datasets: [
      {
        label: 'Monto Total',
        data: topEmpleados.data,
        backgroundColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
          '#EC4899',
          '#6B7280'
        ],
        borderColor: [
          '#3B82F6',
          '#10B981',
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4',
          '#84CC16',
          '#F97316',
          '#EC4899',
          '#6B7280'
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const charts = [
    {
      id: 'proyectos',
      title: 'Nómina por Proyecto',
      description: 'Distribución de nóminas por proyecto',
      icon: ChartPieIcon,
      component: (
        <Doughnut 
          data={proyectosChartData} 
          options={{
            ...commonOptions,
            plugins: {
              ...commonOptions.plugins,
              legend: {
                ...commonOptions.plugins.legend,
                position: 'right',
              },
              tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = formatCurrency(context.parsed);
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = ((context.parsed / total) * 100).toFixed(1);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }} 
        />
      )
    },
    {
      id: 'monthly',
      title: `Último mes - (${new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })})`,
      description: 'Distribución de pagos en las 4 semanas del mes actual',
      icon: ArrowTrendingUpIcon,
      component: (
        <Line 
          data={monthlyChartData} 
          options={commonOptions} 
        />
      )
    },
    {
      id: 'topEmpleados',
      title: 'Todos los Empleados',
      description: 'Monto acumulado por empleado',
      icon: ChartBarIcon,
      component: (
        <Bar 
          data={topEmpleadosChartData} 
          options={{
            ...commonOptions,
            indexAxis: 'y',
            plugins: {
              ...commonOptions.plugins,
              tooltip: {
                ...commonOptions.plugins.tooltip,
                callbacks: {
                  label: function(context) {
                    return `Monto: ${formatCurrency(context.parsed.x)}`;
                  }
                }
              }
            }
          }} 
        />
      )
    }
  ];

  const selectedChartData = charts.find(chart => chart.id === selectedChart);

  const exportChart = () => {
    const canvas = document.querySelector(`#chart-${selectedChart} canvas`);
    if (canvas) {
      const link = document.createElement('a');
      link.download = `nomina-chart-${selectedChart}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de Gráficas */}
      <div className="flex flex-wrap gap-2">
        {charts.map((chart) => {
          const Icon = chart.icon;
          return (
            <button
              key={chart.id}
              onClick={() => setSelectedChart(chart.id)}
              className={`${
                selectedChart === chart.id
                  ? 'bg-primary-100 text-primary-700 border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600'
              } flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors duration-200`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{chart.title}</span>
            </button>
          );
        })}
      </div>

      {/* Gráfica Seleccionada */}
      {selectedChartData && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {selectedChartData.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedChartData.description}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFullscreen(!showFullscreen)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Ver en pantalla completa"
              >
                <EyeIcon className="h-4 w-4" />
              </button>
              <button
                onClick={exportChart}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                title="Exportar gráfica"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div 
            id={`chart-${selectedChart}`}
            className={`${showFullscreen ? 'h-96' : 'h-80'} transition-all duration-300`}
          >
            {selectedChartData.component}
          </div>
        </div>
      )}

      {/* Tabla Desglosada de Nómina por Proyecto */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white">
            Desglose Detallado por Proyecto
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Información completa de nóminas por proyecto
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proyecto
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Nóminas
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  %
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {proyectosDistribution.detalles.map((detalle, index) => {
                const total = proyectosDistribution.data.reduce((a, b) => a + b, 0);
                const percentage = ((detalle.monto / total) * 100).toFixed(1);
                return (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: proyectosDistribution.colors[index] }}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {detalle.proyecto}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(detalle.monto)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                      {detalle.cantidad}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-600 dark:text-gray-400">
                      {detalle.empleados}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300">
                        {percentage}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Fila de totales */}
              <tr className="bg-gray-50 dark:bg-gray-900 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  TOTAL
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  {formatCurrency(proyectosDistribution.data.reduce((a, b) => a + b, 0))}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  {proyectosDistribution.cantidad.reduce((a, b) => a + b, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  {proyectosDistribution.empleados.reduce((a, b) => a + b, 0)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-white">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top 5 Empleados */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Empleados
          </h4>
          <div className="space-y-3">
            {topEmpleados.labels.slice(0, 10).map((label, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {label}
                </span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(topEmpleados.data[index])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Estadísticas Mensuales */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Este Mes
          </h4>
          <div className="space-y-3">
            {monthlyPayments.labels.map((label, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {formatCurrency(monthlyPayments.data[index])}
                </span>
              </div>
            ))}
            
            {/* Total del Mes */}
            <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  Total del Mes
                </span>
                <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(monthlyPayments.data.reduce((sum, amount) => sum + amount, 0))}
                </span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Suma de las 4 semanas
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
