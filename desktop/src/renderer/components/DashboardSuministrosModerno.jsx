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
import { 
  FaCalendarAlt, 
  FaChartBar, 
  FaBuilding, 
  FaDollarSign, 
  FaDownload,
  FaFilePdf,
  FaFileExcel,
  FaFilter,
  FaSyncAlt,
  FaTruck,
  FaBox,
  FaProjectDiagram
} from 'react-icons/fa';
import apiService from '../services/api';
import DateInput from './ui/DateInput';

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

export default function DashboardSuministrosModerno() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({
    title: 'Reporte de Suministros y Materiales',
    subtitle: '',
    includeFilters: true,
    includeStats: true,
    includeCharts: {
      consumoPorObra: true,
      distribucionProveedores: true,
      analisisCategorias: true,
      consumoMensual: true,
      materialesMasUsados: true
    },
    includeTable: true
  });
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_proyecto: '',
    id_proveedor: '',
    categoria: ''
  });
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Cargar datos iniciales
  useEffect(() => {
    cargarDatosIniciales();
    cargarDashboard();
  }, []);

  // Recargar dashboard cuando cambian los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDashboard();
    }, 500); // Debounce de 500ms para evitar muchas llamadas

    return () => clearTimeout(timeoutId);
  }, [filtros]);

  const cargarDatosIniciales = async () => {
    try {
      const [proyectosRes, proveedoresRes] = await Promise.all([
        apiService.getProyectos(),
        apiService.getActiveProveedores()
      ]);

      setProyectos(proyectosRes.data || []);
      setProveedores(proveedoresRes.data || []);
      
      // Categorías reales de la base de datos
      setCategorias([
        'Material',
        'Cimbra', 
        'Maquinaria',
        'Concreto'
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    }
  };

  const cargarDashboard = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDashboardSuministros(filtros);
      console.log('📊 Dashboard data:', response.data);
      setDashboardData(response.data);
    } catch (error) {
      console.error('❌ Error al cargar dashboard:', error);
      // Datos de fallback en caso de error
      setDashboardData({
        consumoPorObra: [],
        distribicionProveedores: [],
        tiposMateriales: [],
        estadisticas: {
          totalGastado: 0,
          totalRegistros: 0,
          totalProveedores: 0,
          totalProyectos: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      id_proyecto: '',
      id_proveedor: '',
      categoria: ''
    });
  };

  const exportToPDF = async () => {
    try {
      setExportingPDF(true);
      const blob = await apiService.exportDashboardSuministrosToPDF(filtros);
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-suministros-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando PDF:', error);
      alert('Error al exportar PDF');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExportingExcel(true);
      const blob = await apiService.exportDashboardSuministrosToExcel(filtros);
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dashboard-suministros-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando Excel:', error);
      alert('Error al exportar Excel');
    } finally {
      setExportingExcel(false);
    }
  };

  // Funciones de exportación personalizada
  const exportCustomToPDF = async () => {
    try {
      setExportingPDF(true);
      setShowExportModal(false);
      
      const activeCharts = {};
      Object.keys(exportConfig.includeCharts).forEach(key => {
        activeCharts[key] = { enabled: exportConfig.includeCharts[key] };
      });
      
      const blob = await apiService.exportDashboardCustomToPDF(
        exportConfig, 
        activeCharts, 
        dashboardData, 
        filtros
      );
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportConfig.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando PDF personalizado:', error);
      alert('Error al exportar PDF personalizado');
    } finally {
      setExportingPDF(false);
    }
  };

  const exportCustomToExcel = async () => {
    try {
      setExportingExcel(true);
      setShowExportModal(false);
      
      const activeCharts = {};
      Object.keys(exportConfig.includeCharts).forEach(key => {
        activeCharts[key] = { enabled: exportConfig.includeCharts[key] };
      });
      
      const blob = await apiService.exportDashboardCustomToExcel(
        exportConfig, 
        activeCharts, 
        dashboardData, 
        filtros
      );
      
      // Crear URL temporal y descargar
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportConfig.title.replace(/\s+/g, '_')}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exportando Excel personalizado:', error);
      alert('Error al exportar Excel personalizado');
    } finally {
      setExportingExcel(false);
    }
  };

  const handleChartToggle = (chartKey) => {
    setExportConfig(prev => ({
      ...prev,
      includeCharts: {
        ...prev.includeCharts,
        [chartKey]: !prev.includeCharts[chartKey]
      }
    }));
  };

  // Configuración para gráfica de barras - Consumo por proyecto
  const chartConsumoProyecto = dashboardData?.consumoPorObra ? {
    labels: dashboardData.consumoPorObra.map(item => item.obra),
    datasets: [{
      label: 'Total Costo (MXN)',
      data: dashboardData.consumoPorObra.map(item => item.total_costo),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',   // Blue
        'rgba(16, 185, 129, 0.8)',   // Emerald  
        'rgba(245, 158, 11, 0.8)',   // Amber
        'rgba(239, 68, 68, 0.8)',    // Red
        'rgba(139, 92, 246, 0.8)',   // Violet
        'rgba(249, 115, 22, 0.8)',   // Orange
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(249, 115, 22)',
      ],
      borderWidth: 2
    }]
  } : { labels: [], datasets: [] };

  // Configuración para gráfica de dona - Proveedores
  const chartProveedores = dashboardData?.distribicionProveedores ? {
    labels: dashboardData.distribicionProveedores.slice(0, 6).map(item => item.proveedor),
    datasets: [{
      label: 'Total Costo',
      data: dashboardData.distribicionProveedores.slice(0, 6).map(item => item.total_costo),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(139, 92, 246)',
        'rgb(249, 115, 22)',
      ],
      borderWidth: 2
    }]
  } : { labels: [], datasets: [] };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
              Dashboard de Suministros y Materiales
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Análisis en tiempo real de materiales, costos y proveedores
            </p>
          </div>
          
          {/* Botones de exportación */}
          <div className="flex items-center gap-2">
            <button
              onClick={limpiarFiltros}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <FaSyncAlt className="w-4 h-4" />
              Limpiar Filtros
            </button>
            
            <button
              onClick={exportToPDF}
              disabled={exportingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFilePdf className="w-4 h-4" />
              {exportingPDF ? 'Exportando...' : 'PDF'}
            </button>
            
            <button
              onClick={exportToExcel}
              disabled={exportingExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaFileExcel className="w-4 h-4" />
              {exportingExcel ? 'Exportando...' : 'Excel'}
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              disabled={exportingPDF || exportingExcel}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaDownload className="w-4 h-4" />
              Exportar Personalizado
            </button>
          </div>
        </div>

        {/* Panel de filtros */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FaFilter className="text-gray-600 dark:text-gray-400" />
            <h3 className="font-medium text-gray-900 dark:text-white">Filtros</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Fecha inicio */}
            <div>
              <DateInput
                label="Fecha Inicio"
                value={filtros.fecha_inicio}
                onChange={(value) => handleFilterChange('fecha_inicio', value)}
                placeholder="Seleccionar fecha inicio"
              />
            </div>

            {/* Fecha fin */}
            <div>
              <DateInput
                label="Fecha Fin"
                value={filtros.fecha_fin}
                onChange={(value) => handleFilterChange('fecha_fin', value)}
                placeholder="Seleccionar fecha fin"
              />
            </div>

            {/* Proyecto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proyecto
              </label>
              <select
                value={filtros.id_proyecto}
                onChange={(e) => handleFilterChange('id_proyecto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los proyectos</option>
                {proyectos.map(proyecto => (
                  <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Proveedor
              </label>
              <select
                value={filtros.id_proveedor}
                onChange={(e) => handleFilterChange('id_proveedor', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todos los proveedores</option>
                {proveedores.map(proveedor => (
                  <option key={proveedor.id_proveedor} value={proveedor.id_proveedor}>
                    {proveedor.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFilterChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>
                    {categoria}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Gastado</p>
              <p className="text-2xl font-bold">
                {formatCurrency(dashboardData?.estadisticas?.totalGastado)}
              </p>
            </div>
            <FaDollarSign className="text-4xl text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Registros</p>
              <p className="text-2xl font-bold">
                {dashboardData?.estadisticas?.totalRegistros?.toLocaleString() || '0'}
              </p>
            </div>
            <FaBox className="text-4xl text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Proveedores</p>
              <p className="text-2xl font-bold">
                {dashboardData?.estadisticas?.totalProveedores || '0'}
              </p>
            </div>
            <FaTruck className="text-4xl text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Proyectos</p>
              <p className="text-2xl font-bold">
                {dashboardData?.estadisticas?.totalProyectos || '0'}
              </p>
            </div>
            <FaProjectDiagram className="text-4xl text-orange-200" />
          </div>
        </div>
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de barras - Consumo por proyecto */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <FaBuilding className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Costo por Proyecto
            </h3>
          </div>
          
          {dashboardData?.consumoPorObra?.length > 0 ? (
            <div className="h-80">
              <Bar
                data={chartConsumoProyecto}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    title: {
                      display: false
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
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FaBuilding className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No hay datos de proyectos disponibles</p>
              </div>
            </div>
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
          
          {dashboardData?.distribicionProveedores?.length > 0 ? (
            <div className="h-80">
              <Doughnut
                data={chartProveedores}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    },
                    tooltip: {
                      callbacks: {
                        label: function(context) {
                          const label = context.label || '';
                          const value = formatCurrency(context.parsed);
                          return `${label}: ${value}`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <FaTruck className="text-4xl mx-auto mb-2 opacity-50" />
                <p>No hay datos de proveedores disponibles</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de materiales más utilizados */}
      {dashboardData?.tiposMateriales?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <FaBox className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Materiales Más Utilizados
              </h3>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Frecuencia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Costo Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {dashboardData.tiposMateriales.slice(0, 10).map((material, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {material.descripcion}
                      </div>
                      {material.unidad_medida && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          Unidad: {material.unidad_medida}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        {material.categoria || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {material.frecuencia} veces
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {material.total_cantidad?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(material.total_costo)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Exportación Personalizada */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Configuración de Exportación Personalizada
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Configuración General */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del Reporte
                </label>
                <input
                  type="text"
                  value={exportConfig.title}
                  onChange={(e) => setExportConfig(prev => ({...prev, title: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Título del reporte"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subtítulo (opcional)
                </label>
                <input
                  type="text"
                  value={exportConfig.subtitle}
                  onChange={(e) => setExportConfig(prev => ({...prev, subtitle: e.target.value}))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Subtítulo del reporte"
                />
              </div>
            </div>

            {/* Opciones de Contenido */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Contenido a Incluir
              </h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeFilters}
                    onChange={(e) => setExportConfig(prev => ({...prev, includeFilters: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Filtros aplicados
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeStats}
                    onChange={(e) => setExportConfig(prev => ({...prev, includeStats: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Estadísticas generales (total gastado, cantidad de suministros, etc.)
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeTable}
                    onChange={(e) => setExportConfig(prev => ({...prev, includeTable: e.target.checked}))}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Tablas de datos detallados
                  </span>
                </label>
              </div>
            </div>

            {/* Selección de Gráficos */}
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                Gráficos a Incluir
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts.consumoPorObra}
                    onChange={() => handleChartToggle('consumoPorObra')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📊 Consumo por Obra
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts.distribucionProveedores}
                    onChange={() => handleChartToggle('distribucionProveedores')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    🏢 Distribución por Proveedores
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts.analisisCategorias}
                    onChange={() => handleChartToggle('analisisCategorias')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📈 Análisis por Categorías
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts.consumoMensual}
                    onChange={() => handleChartToggle('consumoMensual')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📅 Consumo Mensual
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportConfig.includeCharts.materialesMasUsados}
                    onChange={() => handleChartToggle('materialesMasUsados')}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    📦 Materiales Más Usados
                  </span>
                </label>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              
              <button
                onClick={exportCustomToPDF}
                disabled={exportingPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFilePdf className="w-4 h-4" />
                {exportingPDF ? 'Generando...' : 'Exportar PDF'}
              </button>
              
              <button
                onClick={exportCustomToExcel}
                disabled={exportingExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFileExcel className="w-4 h-4" />
                {exportingExcel ? 'Generando...' : 'Exportar Excel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
