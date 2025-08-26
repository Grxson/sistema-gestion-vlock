import React, { useState, useEffect } from 'react';
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
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { CalendarIcon, ChartBarIcon, BuildingOffice2Icon, CurrencyDollarIcon } from '@heroicons/react/24/outline';
import apiService from '../services/api';
import DateRangePicker from './ui/DateRangePicker';
import CustomSelect from './ui/CustomSelect';

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

export default function DashboardSuministros() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_proyecto: ''
  });
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    cargarProyectos();
    cargarDashboard();
  }, []);

  const cargarProyectos = async () => {
    try {
      const response = await apiService.getProyectosActivos();
      console.log('Proyectos cargados:', response);
      setProyectos(response.data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      // Datos de fallback en caso de error
      setProyectos([
        { id_proyecto: 1, nombre: 'Obra A', ubicacion: 'Construcción residencial' },
        { id_proyecto: 2, nombre: 'Obra B', ubicacion: 'Proyecto comercial' },
        { id_proyecto: 3, nombre: 'Obra C', ubicacion: 'Infraestructura' }
      ]);
    }
  };

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardSuministros(filtros);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error al cargar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    cargarDashboard();
  };

  // Configuración para gráfica de barras - Consumo por obra con colores profesionales
  const chartConsumoPorObra = dashboardData?.consumoPorObra ? {
    labels: dashboardData.consumoPorObra.map(item => item.obra),
    datasets: [{
      label: 'Total Cantidad (m³)',
      data: dashboardData.consumoPorObra.map(item => parseFloat(item.total_cantidad || 0)),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Emerald
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(139, 92, 246, 0.8)',   // Violet
        'rgba(249, 115, 22, 0.8)',   // Orange
        'rgba(6, 182, 212, 0.8)',    // Cyan
        'rgba(132, 204, 22, 0.8)',   // Lime
        'rgba(244, 114, 182, 0.8)',  // Pink
        'rgba(167, 139, 250, 0.8)'   // Purple
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(249, 115, 22)',
        'rgb(6, 182, 212)',
        'rgb(132, 204, 22)',
        'rgb(244, 114, 182)',
        'rgb(167, 139, 250)'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
      hoverBackgroundColor: [
        'rgba(59, 130, 246, 0.9)',
        'rgba(16, 185, 129, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(239, 68, 68, 0.9)',
        'rgba(139, 92, 246, 0.9)',
        'rgba(249, 115, 22, 0.9)',
        'rgba(6, 182, 212, 0.9)',
        'rgba(132, 204, 22, 0.9)',
        'rgba(244, 114, 182, 0.9)',
        'rgba(167, 139, 250, 0.9)'
      ]
    }]
  } : null;

  // Configuración para gráfica de dona - Distribución por proveedores con gradientes
  const chartProveedores = dashboardData?.distribicionProveedores ? {
    labels: dashboardData.distribicionProveedores.map(item => item.proveedor),
    datasets: [{
      data: dashboardData.distribicionProveedores.map(item => parseInt(item.total_entregas)),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Emerald
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(139, 92, 246, 0.8)',   // Violet
        'rgba(249, 115, 22, 0.8)',   // Orange
        'rgba(6, 182, 212, 0.8)',    // Cyan
        'rgba(132, 204, 22, 0.8)',   // Lime
        'rgba(244, 114, 182, 0.8)',  // Pink
        'rgba(167, 139, 250, 0.8)'   // Purple
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(249, 115, 22)',
        'rgb(6, 182, 212)',
        'rgb(132, 204, 22)',
        'rgb(244, 114, 182)',
        'rgb(167, 139, 250)'
      ],
      borderWidth: 3,
      hoverBorderWidth: 4,
      hoverBackgroundColor: [
        'rgba(59, 130, 246, 0.9)',
        'rgba(16, 185, 129, 0.9)',
        'rgba(245, 158, 11, 0.9)',
        'rgba(239, 68, 68, 0.9)',
        'rgba(139, 92, 246, 0.9)',
        'rgba(249, 115, 22, 0.9)',
        'rgba(6, 182, 212, 0.9)',
        'rgba(132, 204, 22, 0.9)',
        'rgba(244, 114, 182, 0.9)',
        'rgba(167, 139, 250, 0.9)'
      ],
      spacing: 2,
      cutout: '45%'
    }]
  } : null;

  // Opciones comunes para las gráficas - Diseño profesional mejorado
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'start',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          font: {
            size: 13,
            weight: '600',
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          },
          color: document.documentElement.classList.contains('dark') ? '#F9FAFB' : '#1F2937',
          generateLabels: function(chart) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels;
            const labels = original.call(this, chart);
            labels.forEach(label => {
              label.borderRadius = 6;
            });
            return labels;
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        borderColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        cornerRadius: 12,
        padding: 16,
        titleFont: {
          size: 14,
          weight: '600',
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        },
        bodyFont: {
          size: 13,
          weight: '500',
          family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        },
        titleSpacing: 8,
        bodySpacing: 6,
        usePointStyle: true,
        boxPadding: 8,
        titleAlign: 'center',
        bodyAlign: 'left'
      }
    },
    elements: {
      point: {
        radius: 6,
        hoverRadius: 8,
        borderWidth: 3
      },
      line: {
        borderWidth: 3,
        tension: 0.4
      },
      bar: {
        borderRadius: 8,
        borderSkipped: false
      }
    }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: document.documentElement.classList.contains('dark') 
            ? 'rgba(75, 85, 99, 0.2)' 
            : 'rgba(156, 163, 175, 0.2)',
          lineWidth: 1,
          drawBorder: false
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563',
          font: {
            size: 12,
            weight: '500',
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          },
          padding: 12,
          callback: function(value) {
            return value.toLocaleString('es-MX');
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: document.documentElement.classList.contains('dark') ? '#D1D5DB' : '#4B5563',
          font: {
            size: 12,
            weight: '500',
            family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          },
          padding: 8,
          maxRotation: 45
        }
      }
    },
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart'
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con Total Gastado */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard de Suministros
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis y reportes de materiales y servicios por obra
          </p>
        </div>
        
        {/* Marcador de Total Gastado */}
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 rounded-xl p-6 shadow-lg min-w-[200px]">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg">
                  <CurrencyDollarIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">Total Gastado</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {dashboardData?.totalGastado ? 
                  `$${parseFloat(dashboardData.totalGastado).toLocaleString('es-MX', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}` : 
                  '$0.00'
                }
              </p>
            </div>
            <div className="text-emerald-500 dark:text-emerald-400 opacity-20">
              <CurrencyDollarIcon className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
            {/* Filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2" />
          Filtros de Análisis
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Rango de fechas */}
          <div className="lg:col-span-2">
            <DateRangePicker
              startDate={filtros.fecha_inicio}
              endDate={filtros.fecha_fin}
              onStartDateChange={(date) => setFiltros({...filtros, fecha_inicio: date})}
              onEndDateChange={(date) => setFiltros({...filtros, fecha_fin: date})}
            />
          </div>
          
          {/* Filtros adicionales */}
          <div className="space-y-4">
            <CustomSelect
              label="Obra"
              value={filtros.obra}
              onChange={(value) => setFiltros({...filtros, obra: value})}
              placeholder="Todas las obras"
              options={[
                { value: "", label: "Todas las obras" },
                ...proyectos.map(proyecto => ({
                  value: proyecto.id_proyecto.toString(),
                  label: proyecto.nombre,
                  description: proyecto.ubicacion || 'Sin ubicación'
                }))
              ]}
              searchable={true}
            />
            
            <CustomSelect
              label="Proveedor"
              value={filtros.proveedor}
              onChange={(value) => setFiltros({...filtros, proveedor: value})}
              placeholder="Todos los proveedores"
              options={[
                { value: "", label: "Todos los proveedores" },
                { value: "PADILLAS", label: "PADILLAS", description: "Materiales y maquinaria" },
                { value: "Proveedor B", label: "Proveedor B", description: "Servicios especializados" },
                { value: "Proveedor C", label: "Proveedor C", description: "Suministros generales" }
              ]}
              searchable={true}
            />
          </div>
        </div>
      </div>

      {/* Estadísticas Generales - Diseño mejorado */}
      {dashboardData?.estadisticasGenerales && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <ChartBarIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {dashboardData.estadisticasGenerales.total_registros}
                </p>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Registros</p>
              </div>
              <div className="text-blue-500 dark:text-blue-400 opacity-20">
                <ChartBarIcon className="h-16 w-16" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border border-green-200 dark:border-green-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                    <BuildingOffice2Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {parseFloat(dashboardData.estadisticasGenerales.total_cantidad || 0).toFixed(1)} m³
                </p>
                <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Materiales</p>
              </div>
              <div className="text-green-500 dark:text-green-400 opacity-20">
                <BuildingOffice2Icon className="h-16 w-16" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                    <BuildingOffice2Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {dashboardData.estadisticasGenerales.total_proveedores}
                </p>
                <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Proveedores</p>
              </div>
              <div className="text-purple-500 dark:text-purple-400 opacity-20">
                <BuildingOffice2Icon className="h-16 w-16" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <BuildingOffice2Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {dashboardData.estadisticasGenerales.total_obras}
                </p>
                <p className="text-sm font-medium text-orange-700 dark:text-orange-300">Obras Activas</p>
              </div>
              <div className="text-orange-500 dark:text-orange-400 opacity-20">
                <BuildingOffice2Icon className="h-16 w-16" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                </div>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {dashboardData.estadisticasGenerales.total_metros_cubicos ? 
                    `${parseFloat(dashboardData.estadisticasGenerales.total_metros_cubicos).toLocaleString('es-MX', {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1
                    })}` : 
                    '0.0'
                  }
                </p>
                <p className="text-sm font-medium text-indigo-700 dark:text-indigo-300">m³ de Concreto</p>
              </div>
              <div className="text-indigo-500 dark:text-indigo-400 opacity-20">
                <svg className="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficas - Diseño mejorado con mayor tamaño */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Gráfica de barras - Consumo por obra */}
        {chartConsumoPorObra && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Consumo de Materiales por Obra
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Análisis comparativo del consumo total
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="h-96 relative">
              <Bar data={chartConsumoPorObra} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* Gráfica de dona - Distribución por proveedores */}
        {chartProveedores && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Distribución por Proveedores
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Participación de cada proveedor
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <BuildingOffice2Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="h-96 flex items-center justify-center">
              <Doughnut data={chartProveedores} options={chartOptions} />
            </div>
          </div>
        )}
      </div>

      {/* Tabla de materiales más utilizados */}
      {dashboardData?.tiposMateriales && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Materiales Más Utilizados
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frecuencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.tiposMateriales.map((material, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {material.descripcion}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {material.frecuencia} entregas
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {parseFloat(material.total_cantidad || 0).toFixed(1)} m³
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
