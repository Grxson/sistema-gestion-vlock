import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  ChartBarIcon,
  TruckIcon,
  ArchiveBoxIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const stats = [
  { 
    name: 'Proyectos Activos', 
    stat: '0', 
    icon: BuildingOffice2Icon, 
    change: '---', 
    changeType: 'neutral',
    color: 'bg-purple-500'
  },
  { 
    name: 'Suministros Registrados', 
    stat: '0', 
    icon: ArchiveBoxIcon, 
    change: '---', 
    changeType: 'neutral',
    color: 'bg-indigo-500'
  },
  { 
    name: 'Total Proveedores', 
    stat: '0', 
    icon: TruckIcon, 
    change: '---', 
    changeType: 'neutral',
    color: 'bg-red-500'
  },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalProveedores: 0,
    proveedoresActivos: 0,
    totalSuministros: 0,
    suministrosRecientes: [],
    proyectosActivos: 0,
    proveedoresTop: [],
    gastosSupplies: 0,
    estadisticasDetalladas: null,
    chartData: {
      gastosPorMes: [],
      gastosPorProyecto: []
    }
  });

  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { hasPermission, hasModuleAccess } = usePermissions();

  useEffect(() => {
    fetchDashboardData();
    
    // Actualizar datos cada 5 minutos
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [hasModuleAccess, hasPermission]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Solo datos de suministros, proveedores y proyectos
      let suministrosData = [];
      let proveedoresData = [];
      let proyectosData = [];
      let suministrosStats = null;
      let proveedoresStats = null;
      let chartData = {
        gastosPorMes: [],
        gastosPorProyecto: []
      };

      // Datos de suministros
      try {
        const [suministros, dashboardSuministros, reporteDashboard] = await Promise.all([
          apiService.getSuministros(),
          apiService.getDashboardSuministros(),
          apiService.get('/reportes/dashboard-suministros')
        ]);
        
        // Manejo flexible de la estructura de respuesta
        suministrosData = suministros.data ? 
          (Array.isArray(suministros.data) ? suministros.data : suministros.data.suministros || []) :
          (Array.isArray(suministros) ? suministros : []);
        suministrosStats = dashboardSuministros.data || {};
        
        // Datos para gráficas
        if (reporteDashboard.data) {
          chartData.gastosPorMes = reporteDashboard.data.consumoMensual || [];
          chartData.gastosPorProyecto = reporteDashboard.data.consumoPorObra || [];
        }
        
        console.log('Datos de suministros cargados:', suministrosData.length);
        console.log('Datos para gráficas:', chartData);
      } catch (error) {
        console.log('Error al obtener suministros:', error.message);
      }

      // Datos de proveedores
      try {
        const [proveedores, estadisticas] = await Promise.all([
          apiService.getActiveProveedores(),
          apiService.getProveedoresStats()
        ]);
        
        // Manejo flexible de la estructura de respuesta
        proveedoresData = proveedores.data ? 
          (Array.isArray(proveedores.data) ? proveedores.data : []) :
          (Array.isArray(proveedores) ? proveedores : []);
        proveedoresStats = estadisticas.data || {};
        console.log('Datos de proveedores cargados:', proveedoresData.length);
      } catch (error) {
        console.log('Error al obtener proveedores:', error.message);
      }

      // Datos de proyectos
      try {
        const proyectos = await apiService.getProyectos();
        // Manejo flexible de la estructura de respuesta
        proyectosData = proyectos.data ? 
          (Array.isArray(proyectos.data) ? proyectos.data : []) :
          (Array.isArray(proyectos) ? proyectos : []);
        console.log('Datos de proyectos cargados:', proyectosData.length);
      } catch (error) {
        console.log('Error al obtener proyectos:', error.message);
      }

      // Calcular proveedores activos
      const proveedoresActivos = Array.isArray(proveedoresData) ? 
        proveedoresData.filter(p => p.estado === 'activo' || p.activo === true).length : 0;

      // Ordenar suministros por fecha (más recientes primero)
      const suministrosOrdenados = [...suministrosData].sort((a, b) => {
        const fechaA = new Date(a.fecha_creacion || a.createdAt || 0);
        const fechaB = new Date(b.fecha_creacion || b.createdAt || 0);
        return fechaB - fechaA;
      });

      // Top proveedores por número de suministros
      const proveedoresPorSuministros = {};
      suministrosData.forEach(suministro => {
        const proveedorId = suministro.id_proveedor;
        if (proveedorId) {
          if (!proveedoresPorSuministros[proveedorId]) {
            const proveedor = proveedoresData.find(p => p.id_proveedor === proveedorId);
            proveedoresPorSuministros[proveedorId] = {
              ...proveedor,
              cantidadSuministros: 0,
              totalGastado: 0
            };
          }
          proveedoresPorSuministros[proveedorId].cantidadSuministros += 1;
          proveedoresPorSuministros[proveedorId].totalGastado += parseFloat(suministro.costo_total || 0);
        }
      });

      const proveedoresTop = Object.values(proveedoresPorSuministros)
        .sort((a, b) => b.cantidadSuministros - a.cantidadSuministros)
        .slice(0, 5);

      // Calcular gasto total en suministros
      const gastosTotalSuministros = suministrosData.reduce((sum, s) => sum + (parseFloat(s.costo_total || 0)), 0);

      // Proyectos activos
      const proyectosActivos = Array.isArray(proyectosData) ? 
        proyectosData.filter(p => p.estado === 'activo' || p.activo === true).length : 0;
      
      setDashboardData({
        totalProveedores: proveedoresData.length || 0,
        proveedoresActivos: proveedoresActivos,
        totalSuministros: suministrosData.length || 0,
        suministrosRecientes: suministrosOrdenados.slice(0, 5),
        proyectosActivos: proyectosActivos,
        proveedoresTop: proveedoresTop,
        gastosSupplies: gastosTotalSuministros,
        estadisticasDetalladas: {
          suministros: suministrosStats,
          proveedores: proveedoresStats
        },
        chartData: chartData
      });

      setLastUpdate(new Date());

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para preparar datos de gráfica de gastos por mes
  const prepareGastosPorMesData = () => {
    const gastosPorMes = dashboardData.chartData?.gastosPorMes || [];
    const darkMode = isDarkMode();
    
    const labels = gastosPorMes.map(item => {
      const [year, month] = item.mes.split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    });
    
    const data = gastosPorMes.map(item => item.total_costo);
    
    return {
      labels,
      datasets: [
        {
          label: 'Gastos en Suministros',
          data,
          borderColor: '#3b82f6',
          backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: darkMode ? '#111827' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#1d4ed8',
          pointHoverBorderColor: darkMode ? '#111827' : '#ffffff',
          pointHoverBorderWidth: 3,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowBlur: 10,
          shadowColor: darkMode ? 'rgba(59, 130, 246, 0.3)' : 'rgba(0, 0, 0, 0.1)',
        },
      ],
    };
  };

  // Función para preparar datos de gráfica de gastos por proyecto
  const prepareGastosPorProyectoData = () => {
    const gastosPorProyecto = dashboardData.chartData?.gastosPorProyecto || [];
    
    const labels = gastosPorProyecto.map(item => item.obra || 'Sin nombre');
    const data = gastosPorProyecto.map(item => item.total_costo);
    
    // Colores profesionales para los proyectos
    const colors = [
      { bg: 'rgba(59, 130, 246, 0.8)', border: '#3b82f6' },
      { bg: 'rgba(16, 185, 129, 0.8)', border: '#10b981' },
      { bg: 'rgba(245, 158, 11, 0.8)', border: '#f59e0b' },
      { bg: 'rgba(239, 68, 68, 0.8)', border: '#ef4444' },
      { bg: 'rgba(139, 92, 246, 0.8)', border: '#8b5cf6' },
      { bg: 'rgba(236, 72, 153, 0.8)', border: '#ec4899' },
      { bg: 'rgba(14, 165, 233, 0.8)', border: '#0ea5e9' },
      { bg: 'rgba(34, 197, 94, 0.8)', border: '#22c55e' },
    ];
    
    return {
      labels,
      datasets: [
        {
          label: 'Gastos por Proyecto',
          data,
          backgroundColor: data.map((_, index) => colors[index % colors.length].bg),
          borderColor: data.map((_, index) => colors[index % colors.length].border),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          hoverBackgroundColor: data.map((_, index) => colors[index % colors.length].border),
          hoverBorderColor: '#ffffff',
          hoverBorderWidth: 3,
        },
      ],
    };
  };

  // Función para detectar si estamos en modo oscuro
  const isDarkMode = () => {
    return document.documentElement.classList.contains('dark');
  };

  // Opciones profesionales para las gráficas con soporte para modo oscuro/claro
  const getChartOptions = () => {
    const darkMode = isDarkMode();
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index',
      },
      animation: {
        duration: 1000,
        easing: 'easeInOutQuart',
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'start',
          labels: {
            color: darkMode ? '#e5e7eb' : '#374151',
            font: {
              size: 14,
              weight: '600',
              family: "'Inter', 'system-ui', sans-serif",
            },
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
          }
        },
        tooltip: {
          backgroundColor: darkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: darkMode ? '#f9fafb' : '#111827',
          bodyColor: darkMode ? '#e5e7eb' : '#374151',
          borderColor: darkMode ? '#374151' : '#e5e7eb',
          borderWidth: 1,
          cornerRadius: 12,
          padding: 16,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          titleFont: {
            size: 14,
            weight: '600',
            family: "'Inter', 'system-ui', sans-serif",
          },
          bodyFont: {
            size: 13,
            weight: '500',
            family: "'Inter', 'system-ui', sans-serif",
          },
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: $${context.parsed.y.toLocaleString('es-MX')}`;
            },
            title: function(context) {
              return context[0].label;
            }
          }
        },
      },
      scales: {
        x: {
          grid: {
            display: true,
            color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
            drawBorder: false,
          },
          ticks: {
            color: darkMode ? '#9ca3af' : '#6b7280',
            font: {
              size: 12,
              weight: '500',
              family: "'Inter', 'system-ui', sans-serif",
            },
            padding: 10,
          },
          border: {
            display: false,
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            display: true,
            color: darkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
            drawBorder: false,
          },
          ticks: {
            color: darkMode ? '#9ca3af' : '#6b7280',
            font: {
              size: 12,
              weight: '500',
              family: "'Inter', 'system-ui', sans-serif",
            },
            padding: 10,
            callback: function(value) {
              return '$' + value.toLocaleString('es-MX');
            }
          },
          border: {
            display: false,
          }
        }
      },
      elements: {
        point: {
          hoverRadius: 8,
        },
        bar: {
          borderRadius: 8,
        }
      }
    };
  };

  // Opciones específicas para gráfica de línea
  const getLineChartOptions = () => {
    const baseOptions = getChartOptions();
    return {
      ...baseOptions,
      elements: {
        ...baseOptions.elements,
        line: {
          tension: 0.4,
        }
      }
    };
  };

  // Opciones específicas para gráfica de barras
  const getBarChartOptions = () => {
    const baseOptions = getChartOptions();
    return {
      ...baseOptions,
      scales: {
        ...baseOptions.scales,
        x: {
          ...baseOptions.scales.x,
          ticks: {
            ...baseOptions.scales.x.ticks,
            maxRotation: 45,
            minRotation: 0,
          }
        }
      }
    };
  };

  const updatedStats = stats.map(stat => {
    switch (stat.name) {
      case 'Total Proveedores':
        return { 
          ...stat, 
          stat: dashboardData.totalProveedores.toString(),
          change: `${dashboardData.proveedoresActivos} activos`,
          changeType: 'neutral'
        };
      case 'Suministros Registrados':
        return { 
          ...stat, 
          stat: dashboardData.totalSuministros.toString(),
          change: `$${dashboardData.gastosSupplies.toLocaleString('es-MX')} gastados`,
          changeType: 'neutral'
        };
      case 'Proyectos Activos':
        return { 
          ...stat, 
          stat: dashboardData.proyectosActivos.toString(),
          change: 'En curso',
          changeType: 'neutral'
        };
      default:
        return stat;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="fade-in">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Resumen general del sistema de gestión VLock
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización:
            </p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {lastUpdate.toLocaleString('es-MX')}
            </p>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 disabled:opacity-50"
            >
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {updatedStats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white dark:bg-dark-100 pt-6 px-6 pb-6 shadow-lg dark:shadow-2xl rounded-xl overflow-hidden hover-scale card-shadow border border-gray-100 dark:border-gray-700 transition-all duration-300"
          >
            <dt>
              <div className={`absolute top-4 right-4 ${item.color} rounded-xl p-3 shadow-lg`}>
                <item.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate pr-16">{item.name}</p>
            </dt>
            <dd className="mt-4 flex items-baseline">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{item.stat}</p>
              <p
                className={classNames(
                  item.changeType === 'increase' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
                  'ml-3 flex items-baseline text-sm font-semibold'
                )}
              >
                {item.changeType === 'increase' ? (
                  <svg className="h-4 w-4 flex-shrink-0 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 17a.75.75 0 01-.75-.75V5.612L5.29 9.77a.75.75 0 01-1.08-1.04l5.25-5.5a.75.75 0 011.08 0l5.25 5.5a.75.75 0 11-1.08 1.04L10.75 5.612V16.25A.75.75 0 0110 17z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 flex-shrink-0 mr-1" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 3a.75.75 0 01.75.75v10.638l3.96-4.158a.75.75 0 111.08 1.04l-5.25 5.5a.75.75 0 01-1.08 0l-5.25-5.5a.75.75 0 111.08-1.04L9.25 14.388V3.75A.75.75 0 0110 3z" clipRule="evenodd" />
                  </svg>
                )}
                {item.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      {/* Gráficas de Análisis */}
      {dashboardData.chartData && (dashboardData.chartData.gastosPorMes.length > 0 || dashboardData.chartData.gastosPorProyecto.length > 0) && (
        <div className="space-y-6">
          <div className="fade-in">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Análisis de Gastos</h2>
          </div>
          
          {/* Grid simétrico para las gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de Gastos por Mes */}
            <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-3xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Evolución de Gastos Mensuales
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Tendencia de gastos en los últimos meses
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-dark-100 dark:to-dark-50">
                <div className="h-80 relative">
                  {dashboardData.chartData.gastosPorMes.length > 0 ? (
                    <Line data={prepareGastosPorMesData()} options={getLineChartOptions()} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <ChartBarIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-sm">No hay datos de gastos mensuales</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Datos adicionales para gráfica mensual */}
                {dashboardData.chartData.gastosPorMes.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Período</div>
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          ${dashboardData.chartData.gastosPorMes.reduce((sum, item) => sum + (item.total_costo || 0), 0).toLocaleString('es-MX')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promedio Mensual</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${dashboardData.chartData.gastosPorMes.length > 0 ? 
                            Math.round(dashboardData.chartData.gastosPorMes.reduce((sum, item) => sum + (item.total_costo || 0), 0) / dashboardData.chartData.gastosPorMes.length).toLocaleString('es-MX') : 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Meses Activos</div>
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {dashboardData.chartData.gastosPorMes.filter(item => (item.total_costo || 0) > 0).length}
                        </div>
                      </div>
                    </div>
                    {/* Indicadores de tendencia */}
                    <div className="mt-4 flex items-center justify-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Mes mayor: ${Math.max(...dashboardData.chartData.gastosPorMes.map(m => m.total_costo || 0)).toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Mes menor: ${Math.min(...dashboardData.chartData.gastosPorMes.map(m => m.total_costo || 0)).toLocaleString('es-MX')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Gráfica de Gastos por Proyecto */}
            <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl dark:hover:shadow-3xl transition-all duration-300">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <BuildingOffice2Icon className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
                  Gastos por Proyecto
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Distribución de costos por obra
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white dark:from-dark-100 dark:to-dark-50">
                <div className="h-80 relative">
                  {dashboardData.chartData.gastosPorProyecto.length > 0 ? (
                    <Bar data={prepareGastosPorProyectoData()} options={getBarChartOptions()} />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                      <div className="text-center">
                        <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-sm">No hay datos de gastos por proyecto</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Datos adicionales para gráfica de proyectos */}
                {dashboardData.chartData.gastosPorProyecto.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyecto Mayor</div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          ${Math.max(...dashboardData.chartData.gastosPorProyecto.map(p => p.total_costo || 0)).toLocaleString('es-MX')}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Promedio/Proyecto</div>
                        <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                          ${dashboardData.chartData.gastosPorProyecto.length > 0 ? 
                            Math.round(dashboardData.chartData.gastosPorProyecto.reduce((sum, item) => sum + (item.total_costo || 0), 0) / dashboardData.chartData.gastosPorProyecto.length).toLocaleString('es-MX') : 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Proyectos Activos</div>
                        <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                          {dashboardData.chartData.gastosPorProyecto.filter(p => (p.total_costo || 0) > 0).length}
                        </div>
                      </div>
                    </div>
                    {/* Ranking de proyectos */}
                    <div className="mt-4">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Top 3 Proyectos</div>
                      <div className="space-y-2">
                        {dashboardData.chartData.gastosPorProyecto
                          .sort((a, b) => (b.total_costo || 0) - (a.total_costo || 0))
                          .slice(0, 3)
                          .map((proyecto, index) => (
                            <div key={index} className="flex items-center justify-between text-xs">
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                  index === 0 ? 'bg-yellow-500' : 
                                  index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                                }`}></div>
                                <span className="text-gray-700 dark:text-gray-300 truncate max-w-24">
                                  {proyecto.obra || proyecto.nombre_proyecto || `Proyecto ${proyecto.id_proyecto || 'Sin nombre'}`}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                ${(proyecto.total_costo || 0).toLocaleString('es-MX')}
                              </span>
                            </div>
                          ))
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas adicionales de suministros */}
      {hasModuleAccess('suministros') && dashboardData.estadisticasDetalladas && (
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ArchiveBoxIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Análisis Detallado de Suministros
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Métricas avanzadas y tendencias del sistema
            </p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total gastado */}
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-700">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  ${(dashboardData.estadisticasDetalladas.total_gastado || 0).toLocaleString('es-MX')}
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total Gastado</div>
              </div>
              
              {/* Total suministros */}
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-700">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {(dashboardData.estadisticasDetalladas.total_registros || 0).toLocaleString('es-MX')}
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Total Registros</div>
              </div>
              
              {/* Proveedores únicos */}
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl border border-orange-200 dark:border-orange-700">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {dashboardData.estadisticasDetalladas.total_proveedores || 0}
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Proveedores Únicos</div>
              </div>
              
              {/* Obras activas */}
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-700">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {dashboardData.estadisticasDetalladas.total_obras || 0}
                </div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400 mt-1">Obras Activas</div>
              </div>
            </div>
            
            {/* Indicadores de eficiencia */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Gasto promedio por suministro</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ${dashboardData.estadisticasDetalladas.total_registros > 0 ? 
                      Math.round((dashboardData.estadisticasDetalladas.total_gastado || 0) / dashboardData.estadisticasDetalladas.total_registros).toLocaleString('es-MX') : 0}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Suministros por proveedor</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    {dashboardData.estadisticasDetalladas.total_proveedores > 0 ? 
                      Math.round(dashboardData.estadisticasDetalladas.total_registros / dashboardData.estadisticasDetalladas.total_proveedores) : 0}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-200 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Gasto promedio por obra</div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white">
                    ${dashboardData.estadisticasDetalladas.total_obras > 0 ? 
                      Math.round((dashboardData.estadisticasDetalladas.total_gastado || 0) / dashboardData.estadisticasDetalladas.total_obras).toLocaleString('es-MX') : 0}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Comparativa de rendimiento */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Indicadores de Rendimiento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Eficiencia de Proveedores</div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">Registros por proveedor activo</div>
                    </div>
                    <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                      {dashboardData.proveedoresActivos > 0 ? 
                        Math.round(dashboardData.totalSuministros / dashboardData.proveedoresActivos) : 0}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-amber-800 dark:text-amber-300">Actividad de Proyectos</div>
                      <div className="text-xs text-amber-600 dark:text-amber-400">Suministros por proyecto</div>
                    </div>
                    <div className="text-xl font-bold text-amber-700 dark:text-amber-300">
                      {dashboardData.proyectosActivos > 0 ? 
                        Math.round(dashboardData.totalSuministros / dashboardData.proyectosActivos) : 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sección de Actividad Reciente y Datos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Supplies - Ocupa 2 columnas en pantallas grandes */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ArchiveBoxIcon className="h-5 w-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Suministros Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dashboardData.suministrosRecientes.length > 0 ? (
              dashboardData.suministrosRecientes.map((suministro) => (
                <div key={suministro.id_suministro} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                        <ArchiveBoxIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{suministro.descripcion || 'Suministro'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {suministro.categoria || 'Material'} - {suministro.cantidad || 0} {suministro.unidad || 'unidades'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(suministro.costo_total || 0).toLocaleString('es-MX')}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {suministro.fecha_creacion ? new Date(suministro.fecha_creacion).toLocaleDateString() : 'Sin fecha'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <ArchiveBoxIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm">No hay suministros registrados</p>
              </div>
            )}
          </div>
        </div>

        {/* System Activity - Ocupa 1 columna */}
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
              Resumen del Sistema
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-400 dark:bg-green-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Proyectos activos</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.proyectosActivos}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-400 dark:bg-blue-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Total suministros</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.totalSuministros}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Gasto total</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  ${dashboardData.gastosSupplies.toLocaleString('es-MX')}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-purple-400 dark:bg-purple-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Proveedores activos</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.proveedoresActivos}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-indigo-400 dark:bg-indigo-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Promedio/Proyecto</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  ${dashboardData.proyectosActivos > 0 ? 
                    Math.round(dashboardData.gastosSupplies / dashboardData.proyectosActivos).toLocaleString('es-MX') : 0}
                </span>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-orange-400 dark:bg-orange-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Actividad mensual</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.chartData.gastosPorMes.length > 0 ? 
                    Math.round(dashboardData.totalSuministros / dashboardData.chartData.gastosPorMes.length) : 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Providers Section - Grid simétrico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Providers */}
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <TruckIcon className="h-5 w-5 mr-2 text-red-600 dark:text-red-400" />
              Top Proveedores
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Proveedores con mayor volumen de ventas
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {dashboardData.proveedoresTop.length > 0 ? (
              dashboardData.proveedoresTop.map((proveedor, index) => (
                <div key={proveedor.id_proveedor} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-md relative">
                        <TruckIcon className="h-6 w-6 text-white" />
                        {/* Badge de ranking */}
                        <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-600' : 'bg-gray-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{proveedor.nombre || 'Proveedor'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {proveedor.cantidadSuministros || 0} suministros
                        </p>
                        <div className="flex items-center mt-1">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div 
                              className="bg-red-500 h-1.5 rounded-full" 
                              style={{
                                width: `${Math.min(100, ((proveedor.totalGastado || 0) / Math.max(...dashboardData.proveedoresTop.map(p => p.totalGastado || 0))) * 100)}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                            {Math.round(((proveedor.totalGastado || 0) / dashboardData.gastosSupplies) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        ${(proveedor.totalGastado || 0).toLocaleString('es-MX')}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total gastado</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        ${proveedor.cantidadSuministros > 0 ? 
                          Math.round((proveedor.totalGastado || 0) / proveedor.cantidadSuministros).toLocaleString('es-MX') : 0}/suministro
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                <TruckIcon className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-sm">No hay proveedores registrados</p>
              </div>
            )}
          </div>
          {/* Resumen de proveedores */}
          {dashboardData.proveedoresTop.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Proveedor Líder</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {Math.round(((dashboardData.proveedoresTop[0]?.totalGastado || 0) / dashboardData.gastosSupplies) * 100)}% del total
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Promedio Top 3</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    ${dashboardData.proveedoresTop.length >= 3 ? 
                      Math.round(dashboardData.proveedoresTop.slice(0, 3).reduce((sum, p) => sum + (p.totalGastado || 0), 0) / 3).toLocaleString('es-MX') : 0}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Estadísticas Adicionales */}
        <div className="bg-white dark:bg-dark-100 shadow-lg dark:shadow-2xl rounded-xl card-shadow border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-dark-200">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
              <ChartBarIcon className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400" />
              Métricas de Rendimiento
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Indicadores clave del sistema
            </p>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-purple-400 dark:bg-purple-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Proveedores Activos</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.proveedoresActivos}
                </span>
              </div>
              <div className="mt-2 ml-6">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full" 
                    style={{
                      width: `${Math.min(100, (dashboardData.proveedoresActivos / Math.max(dashboardData.totalProveedores, 1)) * 100)}%`
                    }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {Math.round((dashboardData.proveedoresActivos / Math.max(dashboardData.totalProveedores, 1)) * 100)}% del total
                </div>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-indigo-400 dark:bg-indigo-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Diversificación</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.totalProveedores > 0 ? 
                    Math.round(dashboardData.totalSuministros / dashboardData.totalProveedores) : 0} avg
                </span>
              </div>
              <div className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
                Suministros promedio por proveedor
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-green-400 dark:bg-green-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Concentración</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.proveedoresTop.length > 0 && dashboardData.gastosSupplies > 0 ? 
                    Math.round(((dashboardData.proveedoresTop[0]?.totalGastado || 0) / dashboardData.gastosSupplies) * 100) : 0}%
                </span>
              </div>
              <div className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
                Participación del proveedor principal
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-yellow-400 dark:bg-yellow-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Ticket Promedio</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  ${dashboardData.totalSuministros > 0 ? 
                    Math.round(dashboardData.gastosSupplies / dashboardData.totalSuministros).toLocaleString('es-MX') : 0}
                </span>
              </div>
              <div className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
                Gasto promedio por suministro
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-orange-400 dark:bg-orange-500 rounded-full shadow-sm"></div>
                  <p className="ml-3 text-sm text-gray-900 dark:text-white">Productividad</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-200 px-2 py-1 rounded-full">
                  {dashboardData.proyectosActivos > 0 ? 
                    Math.round(dashboardData.totalSuministros / dashboardData.proyectosActivos) : 0} items
                </span>
              </div>
              <div className="mt-1 ml-6 text-xs text-gray-500 dark:text-gray-400">
                Suministros promedio por proyecto
              </div>
            </div>
          </div>
          {/* Footer con estadística destacada */}
          <div className="px-6 py-4 bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-sm font-medium text-purple-800 dark:text-purple-300">Índice de Eficiencia Global</div>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-200">
                {dashboardData.totalSuministros > 0 && dashboardData.proyectosActivos > 0 ? 
                  Math.round(((dashboardData.totalSuministros / dashboardData.proyectosActivos) / 
                    Math.max((dashboardData.totalSuministros / dashboardData.totalProveedores), 1)) * 100) : 0}%
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">
                Balance entre diversificación y productividad
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
