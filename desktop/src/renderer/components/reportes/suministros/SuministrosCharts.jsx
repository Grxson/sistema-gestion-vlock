import React from 'react';
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
} from 'chart.js';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import { 
  FaBuilding, 
  FaTruck, 
  FaBox,
  FaCalendarAlt,
  FaChartBar
} from 'react-icons/fa';

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
  Legend
);

/**
 * Componente de gráficas para el dashboard de suministros
 * Muestra múltiples visualizaciones: barras, líneas, donas
 */
export default function SuministrosCharts({ dashboardData }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  // Colores consistentes para las gráficas
  const chartColors = {
    backgrounds: [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Emerald  
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Violet
      'rgba(249, 115, 22, 0.8)',   // Orange
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
    ],
    borders: [
      'rgb(59, 130, 246)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(239, 68, 68)',
      'rgb(139, 92, 246)',
      'rgb(249, 115, 22)',
      'rgb(236, 72, 153)',
      'rgb(14, 165, 233)',
    ]
  };

  // Configuración para gráfica de barras - Consumo por proyecto
  const chartConsumoProyecto = dashboardData?.consumoPorObra?.length > 0 ? {
    labels: dashboardData.consumoPorObra.map(item => item.obra),
    datasets: [{
      label: 'Total Costo (MXN)',
      data: dashboardData.consumoPorObra.map(item => item.total_costo),
      backgroundColor: chartColors.backgrounds,
      borderColor: chartColors.borders,
      borderWidth: 2
    }]
  } : null;

  // Configuración para gráfica de dona - Proveedores
  const chartProveedores = dashboardData?.distribicionProveedores?.length > 0 ? {
    labels: dashboardData.distribicionProveedores.slice(0, 8).map(item => item.proveedor),
    datasets: [{
      label: 'Total Costo',
      data: dashboardData.distribicionProveedores.slice(0, 8).map(item => item.total_costo),
      backgroundColor: chartColors.backgrounds,
      borderColor: chartColors.borders,
      borderWidth: 2
    }]
  } : null;

  // Configuración para gráfica de línea - Consumo mensual
  const chartConsumoMensual = dashboardData?.consumoPorMes?.length > 0 ? {
    labels: dashboardData.consumoPorMes.map(item => item.mes),
    datasets: [{
      label: 'Gasto Mensual (MXN)',
      data: dashboardData.consumoPorMes.map(item => item.total_costo),
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      tension: 0.4,
      fill: true,
      borderWidth: 3,
      pointRadius: 5,
      pointHoverRadius: 7,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  } : null;

  // Configuración para gráfica de pie - Categorías
  const chartCategorias = dashboardData?.tiposMateriales?.length > 0 ? {
    labels: [...new Set(dashboardData.tiposMateriales.map(item => item.categoria || 'Sin categoría'))].slice(0, 6),
    datasets: [{
      label: 'Distribución por Categoría',
      data: [...new Set(dashboardData.tiposMateriales.map(item => item.categoria || 'Sin categoría'))]
        .slice(0, 6)
        .map(cat => 
          dashboardData.tiposMateriales
            .filter(item => (item.categoria || 'Sin categoría') === cat)
            .reduce((sum, item) => sum + (item.total_costo || 0), 0)
        ),
      backgroundColor: chartColors.backgrounds,
      borderColor: chartColors.borders,
      borderWidth: 2
    }]
  } : null;

  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const commonDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: { size: 11 }
        }
      },
      tooltip: {
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
  };

  const commonLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return formatCurrency(context.parsed.y);
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const EmptyState = ({ icon: Icon, message }) => (
    <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
      <div className="text-center">
        <Icon className="text-4xl mx-auto mb-2 opacity-50" />
        <p>{message}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Primera fila: Consumo por proyecto y Proveedores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de barras - Consumo por proyecto */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaBuilding className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Costo por Proyecto
            </h3>
          </div>
          
          {chartConsumoProyecto ? (
            <div className="h-80">
              <Bar data={chartConsumoProyecto} options={commonBarOptions} />
            </div>
          ) : (
            <EmptyState icon={FaBuilding} message="No hay datos de proyectos disponibles" />
          )}
        </div>

        {/* Gráfica de dona - Distribución por proveedores */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaTruck className="text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución por Proveedores
            </h3>
          </div>
          
          {chartProveedores ? (
            <div className="h-80">
              <Doughnut data={chartProveedores} options={commonDoughnutOptions} />
            </div>
          ) : (
            <EmptyState icon={FaTruck} message="No hay datos de proveedores disponibles" />
          )}
        </div>
      </div>

      {/* Segunda fila: Consumo mensual y Categorías */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de línea - Consumo mensual */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaCalendarAlt className="text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Evolución de Gastos Mensuales
            </h3>
          </div>
          
          {chartConsumoMensual ? (
            <div className="h-80">
              <Line data={chartConsumoMensual} options={commonLineOptions} />
            </div>
          ) : (
            <EmptyState icon={FaCalendarAlt} message="No hay datos mensuales disponibles" />
          )}
        </div>

        {/* Gráfica de pie - Categorías */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaChartBar className="text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Distribución por Categorías
            </h3>
          </div>
          
          {chartCategorias ? (
            <div className="h-80">
              <Pie data={chartCategorias} options={commonDoughnutOptions} />
            </div>
          ) : (
            <EmptyState icon={FaBox} message="No hay datos de categorías disponibles" />
          )}
        </div>
      </div>
    </div>
  );
}
