import React from 'react';
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
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

/**
 * Componente de gráficos para auditoría
 */
const AuditoriaCharts = ({ estadisticas, loading }) => {
  // Configuración común para todos los gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        }
      }
    }
  };

  // Datos para gráfico de acciones por tipo
  const accionesPorTipoData = {
    labels: estadisticas?.accionesPorTipo?.map(item => item.accion) || [],
    datasets: [
      {
        label: 'Cantidad de Acciones',
        data: estadisticas?.accionesPorTipo?.map(item => item.cantidad) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de actividad por usuario
  const actividadPorUsuarioData = {
    labels: estadisticas?.actividadPorUsuario?.slice(0, 10).map(item => item.usuario) || [],
    datasets: [
      {
        label: 'Acciones Realizadas',
        data: estadisticas?.actividadPorUsuario?.slice(0, 10).map(item => item.cantidad) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de actividad por tabla
  const actividadPorTablaData = {
    labels: estadisticas?.actividadPorTabla?.slice(0, 10).map(item => item.tabla) || [],
    datasets: [
      {
        label: 'Operaciones',
        data: estadisticas?.actividadPorTabla?.slice(0, 10).map(item => item.cantidad) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(6, 182, 212, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(244, 114, 182, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(6, 182, 212)',
          'rgb(251, 146, 60)',
          'rgb(168, 85, 247)',
          'rgb(244, 114, 182)',
        ],
        borderWidth: 2
      }
    ]
  };

  // Datos para gráfico de actividad por día
  const actividadPorDiaData = {
    labels: estadisticas?.actividadPorDia?.map(item => item.fecha) || [],
    datasets: [
      {
        label: 'Acciones por Día',
        data: estadisticas?.actividadPorDia?.map(item => item.cantidad) || [],
        fill: true,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Gráfico de Acciones por Tipo */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Acciones por Tipo
        </h3>
        <div className="h-64">
          <Doughnut data={accionesPorTipoData} options={commonOptions} />
        </div>
      </div>

      {/* Gráfico de Actividad por Usuario */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 10 Usuarios Más Activos
        </h3>
        <div className="h-64">
          <Bar 
            data={actividadPorUsuarioData} 
            options={{
              ...commonOptions,
              indexAxis: 'y',
              scales: {
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                  }
                },
                y: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                  }
                }
              }
            }} 
          />
        </div>
      </div>

      {/* Gráfico de Actividad por Tabla */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Top 10 Tablas Más Modificadas
        </h3>
        <div className="h-64">
          <Pie data={actividadPorTablaData} options={commonOptions} />
        </div>
      </div>

      {/* Gráfico de Actividad por Día */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Actividad de los Últimos 30 Días
        </h3>
        <div className="h-64">
          <Line 
            data={actividadPorDiaData} 
            options={{
              ...commonOptions,
              scales: {
                x: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                  }
                },
                y: {
                  ticks: {
                    color: document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  },
                  grid: {
                    color: document.documentElement.classList.contains('dark') ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)'
                  }
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default AuditoriaCharts;
