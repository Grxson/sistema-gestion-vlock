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
import { CalendarIcon, ChartBarIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
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

  // Configuración para gráfica de barras - Consumo por obra
  const chartConsumoPorObra = dashboardData?.consumoPorObra ? {
    labels: dashboardData.consumoPorObra.map(item => item.obra),
    datasets: [{
      label: 'Total Cantidad (m³)',
      data: dashboardData.consumoPorObra.map(item => parseFloat(item.total_cantidad || 0)),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'
      ],
      borderColor: [
        '#2563EB', '#059669', '#D97706', '#DC2626', '#7C3AED', '#EA580C'
      ],
      borderWidth: 1
    }]
  } : null;

  // Configuración para gráfica de dona - Distribución por proveedores
  const chartProveedores = dashboardData?.distribicionProveedores ? {
    labels: dashboardData.distribicionProveedores.map(item => item.proveedor),
    datasets: [{
      data: dashboardData.distribicionProveedores.map(item => parseInt(item.total_entregas)),
      backgroundColor: [
        '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316',
        '#06B6D4', '#84CC16', '#F472B6', '#A78BFA'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null;

  // Opciones comunes para las gráficas
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#374151',
        borderWidth: 1
      }
    },
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(156, 163, 175, 0.1)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Dashboard de Suministros
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Análisis y reportes de materiales y servicios por obra
          </p>
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

      {/* Estadísticas Generales */}
      {dashboardData?.estadisticasGenerales && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {dashboardData.estadisticasGenerales.total_registros}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Registros</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOffice2Icon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {parseFloat(dashboardData.estadisticasGenerales.total_cantidad || 0).toFixed(1)} m³
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Materiales</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOffice2Icon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {dashboardData.estadisticasGenerales.total_proveedores}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Proveedores</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOffice2Icon className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {dashboardData.estadisticasGenerales.total_obras}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Obras Activas</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de barras - Consumo por obra */}
        {chartConsumoPorObra && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Consumo de Materiales por Obra
            </h3>
            <div className="h-80">
              <Bar data={chartConsumoPorObra} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* Gráfica de dona - Distribución por proveedores */}
        {chartProveedores && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Distribución por Proveedores
            </h3>
            <div className="h-80 flex items-center justify-center">
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
