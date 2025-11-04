import React from 'react';
import { formatCurrency, formatNumber, formatPercentage } from './formatters';

/**
 * Obtener colores según el tema actual (light/dark)
 */
export const getChartColors = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  return {
    textColor: isDarkMode ? '#F9FAFB' : '#1F2937',
    gridColor: isDarkMode ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.25)',
    tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(0, 0, 0, 0.85)',
    tooltipText: '#F9FAFB'
  };
};

/**
 * Opciones mejoradas para gráficas de línea
 */
export const getLineChartOptions = (title, metrics = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: getChartColors().textColor,
        font: { size: 13, weight: '600' },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: getChartColors().tooltipBg,
      titleColor: getChartColors().tooltipText,
      bodyColor: getChartColors().tooltipText,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      titleAlign: 'center',
      bodyAlign: 'left',
      footerAlign: 'left',
      displayColors: true,
      callbacks: {
        title: function(context) {
          return `${title} - ${context[0].label}`;
        },
        label: function(context) {
          return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
        },
        afterBody: function(context) {
          if (metrics.total) {
            const percentage = formatPercentage((context[0].parsed.y / metrics.total) * 100);
            return [
              `Porcentaje del total: ${percentage}`,
              metrics.tendencia ? `Tendencia: ${metrics.tendencia}` : ''
            ].filter(Boolean);
          }
          return [];
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: getChartColors().textColor,
        font: { size: 12 }
      },
      grid: {
        color: getChartColors().gridColor,
        drawBorder: false
      }
    },
    y: {
      ticks: {
        color: getChartColors().textColor,
        font: { size: 12 },
        callback: function(value) {
          return formatCurrency(value);
        }
      },
      grid: { color: getChartColors().gridColor }
    }
  },
  interaction: {
    intersect: false,
    mode: 'index'
  }
});

/**
 * Opciones mejoradas para gráficas de dona
 */
export const getDoughnutChartOptions = (title, metrics = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: '60%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        color: getChartColors().textColor,
        font: { size: 12, weight: '500' },
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 15,
        generateLabels: function(chart) {
          const data = chart.data;
          if (data.labels.length && data.datasets.length) {
            return data.labels.map((label, index) => {
              const value = data.datasets[0].data[index];
              const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
              const percentage = formatPercentage((value / total) * 100);
              return {
                text: `${label}: ${percentage}`,
                fillStyle: data.datasets[0].backgroundColor[index],
                fontColor: getChartColors().textColor,
                index: index
              };
            });
          }
          return [];
        }
      }
    },
    tooltip: {
      backgroundColor: getChartColors().tooltipBg,
      titleColor: getChartColors().tooltipText,
      bodyColor: getChartColors().tooltipText,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        title: function(context) {
          return `${title}`;
        },
        label: function(context) {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          const formattedValue = value.toLocaleString('es-MX', { 
            style: 'currency', 
            currency: 'MXN',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
          });
          return `${label}: ${formattedValue} (${percentage}%)`;
        },
        afterLabel: function(context) {
          if (metrics.total) {
            const formattedTotal = metrics.total.toLocaleString('es-MX', { 
              style: 'currency', 
              currency: 'MXN',
              minimumFractionDigits: 0,
              maximumFractionDigits: 2
            });
            return `Total general: ${formattedTotal}`;
          }
          return '';
        }
      }
    }
  }
});

/**
 * Opciones mejoradas para gráficas de barras
 */
export const getBarChartOptions = (title, metrics = {}) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: getChartColors().textColor,
        font: { size: 13, weight: '600' },
        usePointStyle: true,
        pointStyle: 'rect',
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: getChartColors().tooltipBg,
      titleColor: getChartColors().tooltipText,
      bodyColor: getChartColors().tooltipText,
      borderColor: 'rgba(59, 130, 246, 0.5)',
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        title: function(context) {
          return `${title} - ${context[0].label}`;
        },
        afterBody: function(context) {
          if (metrics.total) {
            const percentage = ((context[0].parsed.y / metrics.total) * 100).toFixed(1);
            return [
              `Porcentaje: ${percentage}%`,
              metrics.promedio ? `Promedio: ${metrics.promedio}` : ''
            ].filter(Boolean);
          }
          return [];
        }
      }
    }
  },
  scales: {
    x: {
      ticks: {
        color: getChartColors().textColor,
        font: { size: 11 },
        maxRotation: 45,
        minRotation: 0
      },
      grid: {
        color: getChartColors().gridColor,
        drawBorder: false
      }
    },
    y: {
      ticks: {
        color: getChartColors().textColor,
        font: { size: 12 },
        callback: function(value) {
          return new Intl.NumberFormat('es-MX').format(value);
        }
      },
      grid: { color: getChartColors().gridColor }
    }
  }
});

/**
 * Componente de métricas para mostrar datos clave
 */
export const MetricsDisplay = ({ title, metrics, icon: Icon, color = "indigo" }) => {
  const colorClasses = {
    blue: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200",
    green: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    amber: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200",
    red: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    purple: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200"
  };

  if (!metrics || Object.keys(metrics).length === 0) return null;

  return (
    <div className={`border rounded-lg p-3 mb-4 ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && <Icon className="h-4 w-4" />}
        <h5 className="font-medium text-sm">{title} - Métricas Clave</h5>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {Object.entries(metrics).map(([key, value]) => {
          if (value === undefined || value === null) return null;
          
          // Ignorar valores que sean objetos o arrays (no son métricas renderizables)
          if (typeof value === 'object' && value !== null) {
            console.warn(`MetricsDisplay: Ignorando métrica '${key}' porque es un objeto:`, value);
            return null;
          }
          
          let displayValue = value;
          let label = key;

          // Formatear etiquetas y valores
          switch (key) {
            case 'total':
              label = 'Total Gasto';
              displayValue = formatCurrency(value);
              break;
            case 'promedio':
            case 'gastoPromedio':
            case 'promedioMensual':
              label = 'Promedio/Mes';
              displayValue = formatCurrency(value);
              break;
            case 'cambioMensual':
              label = 'Cambio Mensual';
              displayValue = formatPercentage(value);
              break;
            case 'ultimoMes':
              label = 'Último Mes';
              displayValue = formatCurrency(value);
              break;
            case 'totalItems':
              label = 'Total Items';
              displayValue = formatNumber(value);
              break;
            case 'maximo':
              label = 'Máximo';
              displayValue = formatCurrency(value);
              break;
            case 'minimo':
              label = 'Mínimo';
              displayValue = formatCurrency(value);
              break;
            case 'mesTop':
              label = 'Mes Principal';
              break;
            case 'categoriaTop':
              label = 'Categoría Principal';
              break;
            case 'proveedorTop':
              label = 'Proveedor Principal';
              break;
            case 'tipoTop':
              label = 'Tipo Principal';
              break;
            case 'estadoTop':
              label = 'Estado Principal';
              break;
            case 'porcentajeTop':
              label = 'Porcentaje';
              displayValue = formatPercentage(value);
              break;
            case 'totalCategorias':
              label = 'Categorías';
              displayValue = formatNumber(value);
              break;
            case 'totalProveedores':
              label = 'Proveedores';
              displayValue = formatNumber(value);
              break;
            case 'totalTipos':
              label = 'Tipos';
              displayValue = formatNumber(value);
              break;
            case 'totalEstados':
              label = 'Estados';
              displayValue = formatNumber(value);
              break;
            case 'mesesActivos':
              label = 'Meses';
              displayValue = formatNumber(value);
              break;
            case 'totalEntregas':
              label = 'Entregas';
              displayValue = formatNumber(value);
              break;
            case 'maxEntregas':
              label = 'Máx/Mes';
              displayValue = formatNumber(value);
              break;
            case 'valorTotal':
              label = 'Valor Total';
              displayValue = formatCurrency(value);
              break;
            case 'cantidadItems':
              label = 'Items';
              displayValue = formatNumber(value);
              break;
            case 'promedioXEstado':
              label = 'Prom/Estado';
              displayValue = formatNumber(value);
              break;
            default:
              label = key.charAt(0).toUpperCase() + key.slice(1);
              // Si es un número, intentar formatear según el contexto
              if (typeof value === 'number') {
                if (key.includes('gasto') || key.includes('valor') || key.includes('total') || key.includes('promedio')) {
                  displayValue = formatCurrency(value);
                } else {
                  displayValue = formatNumber(value);
                }
              }
          }

          return (
            <div key={key} className="flex flex-col">
              <span className="font-medium">{label}</span>
              <span className="text-xs opacity-80 truncate" title={displayValue}>
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
