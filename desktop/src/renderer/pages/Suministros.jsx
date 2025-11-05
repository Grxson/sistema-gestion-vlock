import React, { useState, useEffect, useCallback, useRef } from 'react';
import { STANDARD_ICONS } from '../constants/icons';
import { 
  FaSearch, 
  FaFilter,
  FaBox,
  FaTruck,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding,
  FaDownload,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,  
  FaChartLine,
  FaChartPie,
  FaClock,
  FaBoxes,
  FaCog,
  FaCogs,
  FaTimes,
  FaRuler,
  FaRulerCombined,
  FaCalculator,
  FaReceipt,
  FaFileExcel,
  FaFilePdf,
  FaUpload,
  FaFileDownload,
  FaEye,
  FaListUl,
  FaExpand,
  FaDesktop,
  FaImage
} from 'react-icons/fa';
import { formatCurrency } from '../utils/currency';
import { formatNumber, formatNumberForChart, formatPercentage, formatUnidadMedida } from '../utils/formatters';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { validateFolioDuplicado } from '../utils/validationUtils';
import ValidationModal from '../components/ui/ValidationModal';
import { 
  generateImportTemplate, 
  validateImportData, 
  exportToExcel, 
  exportToPDF, 
  processImportFile 
} from '../utils/exportUtils';
import { exportReporteTipoPDF, exportReporteTipoExcel } from '../utils/reporteTipoExport';
import ReportePersonalizadoModal from '../components/ReportePersonalizado/ReportePersonalizadoModal';
import useReportePersonalizadoCompleto from '../hooks/useReportePersonalizadoCompleto';
import ChartModal from '../components/ui/ChartModal';
import ProgressModal from '../components/ui/ProgressModal';
import { ArrowsPointingOutIcon } from '@heroicons/react/24/outline';
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
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import api from '../services/api';
import ProveedorAutocomplete from '../components/common/ProveedorAutocomplete';
import DateInput from '../components/ui/DateInput';
import TimeInput from '../components/ui/TimeInput';
import FormularioSuministros from '../components/FormularioSuministros';
import SuministroDeleteConfirmModal from '../components/SuministroDeleteConfirmModal';
import SuministroNotificationModal from '../components/SuministroNotificationModal';
import FiltroTipoCategoria from '../components/common/FiltroTipoCategoria';
import UnidadesMedidaManager from '../components/UnidadesMedidaManager';
import { useToast } from '../contexts/ToastContext';
import { NominaService } from '../services/nominas/nominaService';
import useCombinedTableData from '../hooks/useCombinedTableData';

// Componentes de Pestañas
import GastosTab from '../components/suministros/GastosTab';
import TablaGastosTab from '../components/suministros/TablaGastosTab';
import ReportesTab from '../components/suministros/ReportesTab';

// Importar componentes de suministros refactorizados
import SuministrosHeader from '../components/suministros/SuministrosHeader';
import SuministrosCards from '../components/suministros/SuministrosCards';

// Importar testing suite para desarrollo
if (process.env.NODE_ENV === 'development') {
  import('../utils/testingSuite').then(module => {
    // El script se carga automáticamente
  });
}

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

// CATEGORIAS_SUMINISTRO eliminada - ahora se cargan dinámicamente desde la API

const ESTADOS_SUMINISTRO = {
  'Solicitado': { label: 'Solicitado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Aprobado': { label: 'Aprobado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Pedido': { label: 'Pedido', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  'En_Transito': { label: 'En Tránsito', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  'Entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
};

const getDisplayCategoria = (id, categoriasDinamicas) => {
  if (!id) {
    return 'Sin categoría';
  }

  if (!Array.isArray(categoriasDinamicas)) {
    return 'Sin categoría';
  }

  // Si el id es un objeto categoría, extraer el nombre
  if (typeof id === 'object' && id && id.nombre) {
    return id.nombre;
  }

  // Si el id es un string (nombre de la categoría), buscar por nombre
  if (typeof id === 'string') {
    const categoriaPorNombre = categoriasDinamicas.find(cat => cat.nombre === id);
    return categoriaPorNombre ? categoriaPorNombre.nombre : 'Sin categoría';
  }

  // Si el id es un número, buscar por id_categoria
  const categoria = categoriasDinamicas.find(cat => cat.id_categoria == id);
  return categoria ? categoria.nombre : 'Sin categoría';
};

const Suministros = () => {
  const [suministros, setSuministros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]); // Now using dynamic categories
  const [categoriasDinamicas, setCategoriasDinamicas] = useState([]); // Categorías desde API
  const [categoriasCargadas, setCategoriasCargadas] = useState(false); // Flag para saber si ya se cargaron
  const [unidadesMedida, setUnidadesMedida] = useState({}); // Formato {simbolo: "nombre (simbolo)"}
  const [unidadesDinamicas, setUnidadesDinamicas] = useState([]); // Unidades desde API
  const [unidadesCargadas, setUnidadesCargadas] = useState(false); // Flag para saber si ya se cargaron
  const [loading, setLoading] = useState(true);
  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [showUnidadesModal, setShowUnidadesModal] = useState(false);
  const [editingSuministro, setEditingSuministro] = useState(null);
  const [editingRecibo, setEditingRecibo] = useState(null);
  const [expandedRecibos, setExpandedRecibos] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    proyecto: '',
    proveedor: '',
    tipo_categoria: '', // Nuevo filtro para tipo de categoría
    fechaInicio: '',
    fechaFin: ''
  });

  // Hook para combinar suministros con nóminas
  const { combinedData, nominaRows, loading: loadingNominas } = useCombinedTableData(suministros, filters);

  // Estados para estadísticas por tipo
  const [estadisticasTipo, setEstadisticasTipo] = useState(null);
  const [loadingEstadisticas, setLoadingEstadisticas] = useState(false);

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalPages, setTotalPages] = useState(1);

  // Estados para detección de duplicados
  const [duplicatesSuggestions, setDuplicatesSuggestions] = useState([]);
  const [showDuplicatesWarning, setShowDuplicatesWarning] = useState(false);

  // Estados para autocompletado avanzado
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [codeSuggestions, setCodeSuggestions] = useState([]);
  const [showCodeSuggestions, setShowCodeSuggestions] = useState(false);
  const [proveedorSuministros, setProveedorSuministros] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);

  // Estados para exportar/importar
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importErrors, setImportErrors] = useState([]);
  const [validImportData, setValidImportData] = useState([]);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [isProcessingImport, setIsProcessingImport] = useState(false);

  // Hook para reporte personalizado eliminado

  // Hook para notificaciones
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Estados para modales de confirmación mejorados
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState('suministro'); // 'suministro' o 'recibo'
  
  // Estado para modal de gráficas expandidas
  const [chartModal, setChartModal] = useState({
    isOpen: false,
    chartData: null,
    chartOptions: null,
    chartType: 'line',
    title: '',
    subtitle: '',
    color: 'indigo',
    metrics: null,
    customContent: null
  });
  
  // Estado para el modal de análisis personalizado
  const [analysisModal, setAnalysisModal] = useState(false);
  const analysisExportRef = useRef(null);
  
  const [notificationModal, setNotificationModal] = useState({
    open: false,
    message: '',
    type: 'success'
  });
  const [validationModal, setValidationModal] = useState({
    open: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });
  const [viewModal, setViewModal] = useState({
    open: false,
    suministro: null,
    recibo: null
  });

  // Estados para gráficas
  const [showFilters, setShowFilters] = useState(false);

  const [chartFilters, setChartFilters] = useState({
    fechaInicio: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Enero del año actual
    fechaFin: new Date().toISOString().split('T')[0], // Hoy
    proyectoId: '', // Filtro por proyecto específico
    proveedorNombre: '', // Filtro por proveedor específico
    tipoSuministro: '', // Filtro por tipo (Material, Servicio, etc.)
    estado: '', // Filtro por estado
    tipoAnalisis: 'gastos' // Tipo de análisis: 'gastos', 'cantidad', 'frecuencia'
  });
  const [selectedCharts, setSelectedCharts] = useState({
    gastosPorMes: false,
    valorPorCategoria: false,
    suministrosPorMes: false,
    gastosPorProyecto: false,
    gastosPorProveedor: false,
    cantidadPorEstado: false,
    distribucionTipos: false, // Habilitado por defecto
    analisisPorTipoGasto: false, // Nueva gráfica para Proyecto vs Administrativo
    tendenciaEntregas: false,
    codigosProducto: false,
    analisisTecnicoConcreto: false,
    concretoDetallado: false,
    // Gráficas para horas
    horasPorMes: false,
    horasPorProyecto: false,
    horasPorEquipo: false,
    comparativoHorasVsCosto: false,
    // Gráficas para unidades de medida
    distribucionUnidades: false,
    cantidadPorUnidad: false,
    valorPorUnidad: false,
    comparativoUnidades: false,
    // Análisis por unidades específicas
    totalMetrosCubicos: false,
    analisisUnidadesMedida: false,
    // Nuevas gráficas profesionales
    gastosPorCategoriaDetallado: false,
    analisisFrecuenciaSuministros: false
  });
  const [themeVersion, setThemeVersion] = useState(0); // Para forzar re-render cuando cambie el tema

  // Estado para pestañas de navegación
  const [activeTab, setActiveTab] = useState(() => {
    // Recuperar pestaña activa guardada en localStorage
    return localStorage.getItem('suministros-active-tab') || 'gastos';
  });

  // Guardar pestaña activa en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('suministros-active-tab', activeTab);
  }, [activeTab]);

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '', // Campo de descripción detallada del formulario
    id_categoria_suministro: null, // Usar categorías dinámicas
    cantidad: '',
    id_unidad_medida: 1, // Valor por defecto (Pieza)
    precio_unitario: '',
    fecha_necesaria: '',
    estado: 'Solicitado',
    id_proyecto: '',
    proveedor_info: null, // Objeto completo del proveedor
    observaciones: '',
    codigo_producto: '',
    // Nuevos campos para recibos
    folio: '',
    operador_responsable: '',
    vehiculo_transporte: '',
    hora_salida: '',
    hora_llegada: '',
    hora_inicio_descarga: '',
    hora_fin_descarga: ''
  });

  useEffect(() => {
    loadData();
    loadCategorias();
    loadUnidades();
  }, []);

  // Efecto para cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportDropdown && !event.target.closest('.export-dropdown')) {
        setShowExportDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportDropdown]);

  // Efecto para detectar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const target = mutation.target;
          if (target === document.documentElement) {
            // El tema cambió, forzamos un re-render de las gráficas
            setThemeVersion(prev => prev + 1);
          }
        }
      });
    });

    // Observar cambios en la clase del elemento html (donde se aplica dark/light)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Efecto para resetear la página cuando cambien los filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Preparar parámetros de filtro para la API
      const params = {};
      if (filters.tipo_categoria) {
        params.tipo_categoria = filters.tipo_categoria;
      }

      const [suministrosResponse, proyectosResponse, proveedoresResponse] = await Promise.all([
        api.getSuministros(params),
        api.getProyectos(),
        api.getProveedores()
      ]);
      
      if (suministrosResponse.success) {
        setSuministros(suministrosResponse.data || []);
      }
      
      if (proyectosResponse.success) {
        setProyectos(proyectosResponse.data || []);
      }

      if (proveedoresResponse.success) {
        setProveedores(proveedoresResponse.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      showError(
        'Error de conexión',
        'No se pudieron cargar los datos. Verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setLoading(false);
    }
  }, [filters.tipo_categoria]);

  // Función para cargar categorías dinámicas desde la API
  const loadCategorias = useCallback(async () => {
    try {
      const response = await api.get('/config/categorias');
      if (response.success) {
        const categoriasAPI = response.data || [];
        setCategoriasDinamicas(categoriasAPI);
        setCategorias(categoriasAPI); // También actualizar el estado categorias
        setCategoriasCargadas(true); // Marcar que las categorías se cargaron
        console.log('✅ Categorías cargadas dinámicamente:', categoriasAPI.length);
      }
    } catch (error) {
      console.error('❌ Error cargando categorías:', error);
      setCategoriasDinamicas([]);
      setCategorias([]);
      setCategoriasCargadas(false);
    }
  }, []);

  // Función para cargar unidades de medida dinámicas desde la API
  const loadUnidades = useCallback(async () => {
    try {
      const response = await api.get('/config/unidades');
      if (response.success) {
        const unidadesAPI = response.data || [];
        setUnidadesDinamicas(unidadesAPI);
        
        // Convertir a formato compatible con el estado actual
        const unidadesFormato = {};
        unidadesAPI.forEach(unidad => {
          unidadesFormato[unidad.simbolo] = `${unidad.nombre} (${unidad.simbolo})`;
        });
        setUnidadesMedida(unidadesFormato);
        setUnidadesCargadas(true);
        console.log('✅ Unidades cargadas dinámicamente:', unidadesAPI.length);
      }
    } catch (error) {
      console.error('❌ Error cargando unidades:', error);
      setUnidadesDinamicas([]);
      setUnidadesCargadas(false);
    }
  }, []);

  // Función para manejar actualización de unidades
  const handleUnidadesUpdated = useCallback(() => {
    loadUnidades(); // Recargar unidades cuando se actualicen
  }, [loadUnidades]);

  // Función para manejar actualización de categorías
  const handleCategoriasUpdated = useCallback(() => {
    loadCategorias(); // Recargar categorías cuando se actualicen
    // Si las gráficas están abiertas, recargarlas también
    if (activeTab === 'reportes') {
      console.log('🔄 Categorías actualizadas desde modal, recargando gráficas...');
      setTimeout(() => {
        loadChartData();
      }, 500); // Pequeño delay para asegurar que las categorías se cargaron
    }
  }, [loadCategorias, activeTab]);

  // Función para cargar estadísticas por tipo
  const loadEstadisticasTipo = useCallback(async () => {
    setLoadingEstadisticas(true);
    try {
      const response = await api.getEstadisticasSuministrosPorTipo();
      if (response.success) {
        setEstadisticasTipo(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setLoadingEstadisticas(false);
    }
  }, []);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    loadEstadisticasTipo();
  }, [loadEstadisticasTipo]);


  // Función para obtener colores según el tema - Mejorada
  const getChartColors = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
      textColor: isDarkMode ? '#F9FAFB' : '#1F2937',
      gridColor: isDarkMode ? 'rgba(75, 85, 99, 0.25)' : 'rgba(156, 163, 175, 0.25)',
      tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(0, 0, 0, 0.85)',
      tooltipText: '#F9FAFB'
    };
  };

  // Opciones mejoradas para gráficas de línea
  const getLineChartOptions = (title, metrics = {}) => ({
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

  // Opciones mejoradas para gráficas de dona
  const getDoughnutChartOptions = (title, metrics = {}) => ({
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

  // Opciones mejoradas para gráficas de barras
  const getBarChartOptions = (title, metrics = {}) => ({
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

  // Componente de métricas para mostrar datos clave
  const MetricsDisplay = ({ title, metrics, icon: Icon, color = "indigo" }) => {
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
            
            let displayValue = value;
            let label = key;

            // Formatear etiquetas y valores
            switch (key) {
              case 'total':
                label = 'TotalGasto';
                displayValue = formatCurrency(value);
                break;
              case 'promedio':
              case 'gastoPromedio':
              case 'promedioMensual':
                label = 'Promedio/Mes';
                displayValue = formatCurrency(value);
                break;
              case 'cambioMensual':
                label = 'CambioMensual';
                displayValue = formatPercentage(value);
                break;
              case 'ultimoMes':
                label = 'UltimoMes';
                displayValue = formatCurrency(value);
                break;
              case 'totalItems':
                label = 'TotalItems';
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

  // Función para abrir modal de gráfica expandida
  const openChartModal = (chartConfig) => {
    // Validar que los datos existan y tengan la estructura correcta
    if (!chartConfig || !chartConfig.data) {
      console.warn('ChartModal: No se proporcionaron datos válidos para la gráfica');
      return;
    }

    // Validar que los datasets existan
    if (!chartConfig.data.datasets || !Array.isArray(chartConfig.data.datasets)) {
      console.warn('ChartModal: Los datasets no están definidos o no son un array');
      return;
    }

    setChartModal({
      isOpen: true,
      chartData: chartConfig.data,
      chartOptions: chartConfig.options,
      chartType: chartConfig.type || 'line',
      title: chartConfig.title || 'Gráfica',
      subtitle: chartConfig.subtitle || '',
      color: chartConfig.color || 'indigo',
      metrics: chartConfig.metrics || null,
      customContent: chartConfig.customContent || null
    });
  };

  // Función para cerrar modal de gráfica
  const closeChartModal = () => {
    setChartModal({
      isOpen: false,
      chartData: null,
      chartOptions: null,
      chartType: 'line',
      title: '',
      subtitle: '',
      color: 'indigo',
      metrics: null,
      customContent: null
    });
  };

  // Función mejorada para verificar duplicados por folio y proveedor
  const checkForDuplicates = (newSuministro) => {
    try {
      // Obtener ID del proveedor desde diferentes posibles ubicaciones
      const proveedorId = newSuministro.proveedor_info?.id_proveedor || 
                         newSuministro.id_proveedor || 
                         newSuministro.proveedor_id;
      
      if (!proveedorId) {
        return []; // Si no hay proveedor, no se puede validar
      }

      const validation = validateFolioDuplicado(
        newSuministro.folio,
        proveedorId,
        suministros,
        editingSuministro?.id_suministro
      );

      return validation.duplicateItems;
    } catch (error) {
      console.error('Error en verificación de duplicados:', error);
      // En caso de error, devolver array vacío para evitar crashes
      return [];
    }
  };

  // Función mejorada para buscar sugerencias de duplicados por folio y proveedor
  const searchDuplicateSuggestions = useCallback((nombre, codigo_producto, folio) => {
    try {
      if (!folio || folio.trim() === '') {
        setDuplicatesSuggestions([]);
        setShowDuplicatesWarning(false);
        return;
      }

      const proveedorId = formData.proveedor_info?.id_proveedor;
      
      if (!proveedorId) {
        setDuplicatesSuggestions([]);
        setShowDuplicatesWarning(false);
        return;
      }

      const validation = validateFolioDuplicado(
        folio,
        proveedorId,
        suministros,
        editingSuministro?.id_suministro
      );

      if (validation.isDuplicate) {
        setDuplicatesSuggestions(validation.duplicateItems);
        setShowDuplicatesWarning(true);
      } else {
        setDuplicatesSuggestions([]);
        setShowDuplicatesWarning(false);
      }
    } catch (error) {
      console.error('Error en búsqueda de duplicados:', error);
      setDuplicatesSuggestions([]);
      setShowDuplicatesWarning(false);
    }
  }, [suministros, editingSuministro, formData.proveedor_info]);

  // =================== FUNCIONES DE AUTOCOMPLETADO AVANZADO ===================

  // Función para autocompletar nombres de suministros
  const searchNameSuggestions = useCallback((nombre) => {
    if (!nombre || nombre.length < 2) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    // Buscar nombres similares en registros existentes
    const uniqueNames = [...new Set(suministros.map(s => s.nombre))].filter(name => 
      name && name.toLowerCase().includes(nombre.toLowerCase()) && name.toLowerCase() !== nombre.toLowerCase()
    );

    // Ordenar por relevancia (coincidencias exactas primero)
    const sortedNames = uniqueNames.sort((a, b) => {
      const aExact = a.toLowerCase().startsWith(nombre.toLowerCase()) ? 0 : 1;
      const bExact = b.toLowerCase().startsWith(nombre.toLowerCase()) ? 0 : 1;
      return aExact - bExact || a.length - b.length;
    }).slice(0, 8);

    setNameSuggestions(sortedNames);
    setShowNameSuggestions(sortedNames.length > 0);
  }, [suministros]);

  // Función para autocompletar códigos de producto
  const searchCodeSuggestions = useCallback((codigo) => {
    if (!codigo || codigo.length < 2) {
      setCodeSuggestions([]);
      setShowCodeSuggestions(false);
      return;
    }

    // Buscar códigos similares
    const uniqueCodes = [...new Set(suministros.map(s => s.codigo_producto))].filter(code => 
      code && code.toLowerCase().includes(codigo.toLowerCase()) && code.toLowerCase() !== codigo.toLowerCase()
    );

    const sortedCodes = uniqueCodes.sort((a, b) => {
      const aExact = a.toLowerCase().startsWith(codigo.toLowerCase()) ? 0 : 1;
      const bExact = b.toLowerCase().startsWith(codigo.toLowerCase()) ? 0 : 1;
      return aExact - bExact || a.length - b.length;
    }).slice(0, 5);

    setCodeSuggestions(sortedCodes);
    setShowCodeSuggestions(sortedCodes.length > 0);
  }, [suministros]);

  // Función para cargar suministros del proveedor seleccionado
  const loadProveedorSuministros = useCallback((proveedorId) => {
    if (!proveedorId) {
      setProveedorSuministros([]);
      return;
    }

    // Obtener los últimos 10 suministros únicos del proveedor
    const suministrosProveedor = suministros
      .filter(s => s.id_proveedor === parseInt(proveedorId))
      .reduce((unique, suministro) => {
        // Evitar duplicados por nombre
        if (!unique.find(u => u.nombre === suministro.nombre)) {
          unique.push(suministro);
        }
        return unique;
      }, [])
      .slice(-10) // Últimos 10
      .reverse(); // Más recientes primero

    setProveedorSuministros(suministrosProveedor);
  }, [suministros]);

  // Función para aplicar una plantilla de suministro existente
  const applyTemplate = (templateSuministro) => {
    setFormData(prev => ({
      ...prev,
      nombre: templateSuministro.nombre,
      descripcion: templateSuministro.descripcion_detallada || '',
      id_categoria_suministro: templateSuministro.id_categoria_suministro || null,
      id_unidad_medida: templateSuministro.id_unidad_medida || 1,
      codigo_producto: templateSuministro.codigo_producto || '',
      precio_unitario: templateSuministro.precio_unitario || '',
      // Mantener los campos específicos del nuevo registro
      folio: prev.folio,
      fecha_necesaria: prev.fecha_necesaria,
      cantidad: prev.cantidad,
      observaciones: prev.observaciones
    }));

    // Ocultar sugerencias
    setShowNameSuggestions(false);
    setShowCodeSuggestions(false);
    setSelectedSuggestion(templateSuministro);

    showInfo('Plantilla aplicada', `Se aplicaron los datos de: ${templateSuministro.nombre}`);
  };

  // Efecto para buscar duplicados cuando cambia el nombre, código o folio
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchDuplicateSuggestions(formData.nombre, formData.codigo_producto, formData.folio);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [formData.nombre, formData.codigo_producto, formData.folio, searchDuplicateSuggestions]);

  // Efecto para autocompletar nombres
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchNameSuggestions(formData.nombre);
    }, 200);

    return () => clearTimeout(delayedSearch);
  }, [formData.nombre, searchNameSuggestions]);

  // Efecto para autocompletar códigos
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchCodeSuggestions(formData.codigo_producto);
    }, 200);

    return () => clearTimeout(delayedSearch);
  }, [formData.codigo_producto, searchCodeSuggestions]);

  // Efecto para cargar suministros del proveedor cuando se selecciona uno
  useEffect(() => {
    if (formData.proveedor_info?.id_proveedor) {
      loadProveedorSuministros(formData.proveedor_info.id_proveedor);
    } else {
      setProveedorSuministros([]);
    }
  }, [formData.proveedor_info, loadProveedorSuministros]);

  // Función para limpiar todas las sugerencias
  const clearAllSuggestions = useCallback(() => {
    setShowNameSuggestions(false);
    setShowCodeSuggestions(false);
    setShowDuplicatesWarning(false);
  }, []);

  // Función para agrupar suministros por recibo (jerarquía)
  const agruparSuministrosPorRecibo = useCallback((suministrosList) => {
    const grupos = {};

    const normalizeDate = (value) => {
      if (!value) return null;
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0, 0);
      }
      if (typeof value === 'string' && value.includes('T')) {
        const [datePart] = value.split('T');
        const [y, m, d] = datePart.split('-');
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 0, 0, 0, 0);
      }
      const d = new Date(value);
      return isNaN(d.getTime()) ? null : new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
    };

    const getFechaOrden = (s) => {
      const keys = ['fecha_entrega','fecha_necesaria','fecha','fecha_registro','fecha_inicio','createdAt','updatedAt'];
      for (const k of keys) {
        const val = normalizeDate(s[k]);
        if (val) return val;
      }
      return new Date(0);
    };
    
    suministrosList.forEach(suministro => {
      // Datos base con fallbacks amplios
      const proveedor = suministro.proveedor?.nombre || suministro.proveedor || 'Sin proveedor';
      const fechaOrden = getFechaOrden(suministro);
      const fecha = fechaOrden.toISOString().slice(0,10); // clave estable YYYY-MM-DD
      const folio = suministro.folio || '';
      const proyecto = suministro.proyecto?.nombre || suministro.proyecto_info?.nombre_proyecto || suministro.proyecto_nombre || suministro.nombre_proyecto || 'Sin proyecto';
      
      const claveRecibo = `${proveedor}_${fecha}_${folio}_${proyecto}`;
      
      if (!grupos[claveRecibo]) {
        grupos[claveRecibo] = {
          id: claveRecibo,
          proveedor,
          fecha, // para mostrar
          fechaOrden, // para ordenar
          folio: folio,
          proyecto,
          suministros: [],
          total: 0,
          cantidad_items: 0,
          isHierarchical: false
        };
      }
      
      grupos[claveRecibo].suministros.push(suministro);
      grupos[claveRecibo].total += calculateTotal(suministro);
      grupos[claveRecibo].cantidad_items += 1;

      // Mantener la fecha del grupo como la más reciente de sus items
      if (fechaOrden > (grupos[claveRecibo].fechaOrden || new Date(0))) {
        grupos[claveRecibo].fechaOrden = fechaOrden;
        grupos[claveRecibo].fecha = fechaOrden.toISOString().slice(0,10);
      }
    });
    
    // Marcar grupos con más de 1 suministro como jerárquicos
    Object.values(grupos).forEach(grupo => {
      if (grupo.suministros.length > 1) {
        grupo.isHierarchical = true;
      }
    });
    
    return Object.values(grupos).sort((a, b) => (b.fechaOrden || new Date(0)) - (a.fechaOrden || new Date(0)));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Calcular costo total
      const cantidad = parseFloat(formData.cantidad) || 0;
      const precioUnitario = parseFloat(formData.precio_unitario) || 0;
      const costoTotal = cantidad * precioUnitario;

      const submitData = {
        // Campos básicos mapeados correctamente
        nombre: formData.nombre,
        descripcion_detallada: formData.descripcion,
        tipo_suministro: formData.tipo_suministro,
        codigo_producto: formData.codigo_producto,
        cantidad: cantidad,
        id_unidad_medida: formData.id_unidad_medida,
        precio_unitario: precioUnitario,
        costo_total: costoTotal, // Añadir el costo total calculado
        fecha: formData.fecha_necesaria,
        estado: formData.estado,
        id_proyecto: formData.id_proyecto,
        observaciones: formData.observaciones,
        
        // Campos de proveedor
        id_proveedor: formData.proveedor_info?.id_proveedor || null,
        proveedor: formData.proveedor_info?.nombre || '', // Campo legacy
        folio: formData.folio,
        
        // Campos de logística
        operador_responsable: formData.operador_responsable,
        vehiculo_transporte: formData.vehiculo_transporte,
        hora_salida: formData.hora_salida,
        hora_llegada: formData.hora_llegada,
        hora_inicio_descarga: formData.hora_inicio_descarga,
        hora_fin_descarga: formData.hora_fin_descarga
      };

      // Verificar duplicados solo al crear (no al editar)
      if (!editingSuministro) {
        const duplicates = checkForDuplicates(submitData);
        
        if (duplicates.length > 0) {
          const duplicateInfo = duplicates.map(dup => {
            const proyecto = proyectos.find(p => p.id_proyecto === dup.id_proyecto)?.nombre || 'Sin proyecto';
            const proveedor = dup.proveedor?.nombre || 'Sin proveedor';
            const folioInfo = dup.folio ? ` - Folio: ${dup.folio}` : '';
            return `• ${dup.nombre} (${proyecto} - ${proveedor}${folioInfo})`;
          }).join('\n');

          const warningTitle = "🚫 DUPLICADO DE FOLIO DETECTADO";
          const warningMessage = `¡ATENCIÓN! El folio "${submitData.folio}" ya existe:\n\n${duplicateInfo}\n\n` +
                         `Los folios deben ser únicos. ¿Está seguro de que desea continuar?`;

          const confirmed = await showConfirmDialog(warningTitle, warningMessage);
          if (!confirmed) {
            return;
          }
        }
      }

      let response;
      if (editingSuministro) {
        // Agregar estado del IVA por defecto para actualizaciones individuales
        const updatePayload = {
          ...submitData,
          include_iva: true // Por defecto incluir IVA en actualizaciones individuales
        };
        response = await api.updateSuministro(editingSuministro.id_suministro, updatePayload);
        if (response.success) {
          // Actualizar el estado local directamente sin recargar todo
          setSuministros(prevSuministros => 
            prevSuministros.map(suministro => 
              suministro.id_suministro === editingSuministro.id_suministro 
                ? { ...suministro, ...submitData } 
                : suministro
            )
          );
          
          showSuccess(
            'Suministro actualizado',
            `${submitData.nombre} ha sido actualizado correctamente`
          );
        }
      } else {
        response = await api.createSuministro(submitData);
        if (response.success) {
          // Para nuevos suministros, sí necesitamos recargar para obtener los datos completos
          await loadData();
          
          showSuccess(
            'Suministro creado',
            `${submitData.nombre} ha sido registrado exitosamente`
          );
        }
      }

      if (response.success) {
        // Solo cargar datos completos si fue una creación nueva
        if (!editingSuministro) {
          await loadData();
        }
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error guardando suministro:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showError(
        'Error al guardar',
        `No se pudo ${editingSuministro ? 'actualizar' : 'crear'} el suministro: ${errorMessage}`
      );
    }
  };

  // Función para manejar el envío de múltiples suministros
  const handleMultipleSubmit = async (suministrosData) => {
    try {
      if (editingRecibo) {
        // Modo edición: actualizar suministros existentes
        const infoRecibo = suministrosData.info_recibo || {};
        const updates = [];
        const creations = [];

        // Primero eliminar suministros marcados para eliminar
        if (suministrosData.suministros_eliminados && suministrosData.suministros_eliminados.length > 0) {
          const deletePromises = suministrosData.suministros_eliminados.map(id => 
            api.deleteSuministro(id)
          );
          await Promise.all(deletePromises);
        }

        for (const suministroData of suministrosData.suministros) {
          if (suministroData.id_suministro) {
            // Incluir información del IVA y metodo_pago en cada actualización
            const updatePayload = {
              ...suministroData,
              include_iva: suministrosData.include_iva,
              metodo_pago: infoRecibo.metodo_pago || suministroData.metodo_pago || 'Efectivo'
            };
            updates.push(api.updateSuministro(suministroData.id_suministro, updatePayload));
          } else {
            // construir objeto de suministro para creación (sin duplicar campos de recibo)
            const newItem = {
              tipo_suministro: suministroData.tipo_suministro,
              nombre: suministroData.nombre,
              codigo_producto: suministroData.codigo_producto,
              descripcion_detallada: suministroData.descripcion_detallada,
              estado: suministroData.estado,
              observaciones: suministroData.observaciones
            };

            // Función helper para normalizar números
            const normalizeNumber = (value) => {
              if (value === '' || value === null || value === undefined) return undefined;
              return parseFloat(String(value).replace(/,/g, '')) || undefined;
            };

            if (suministroData.cantidad !== '' && suministroData.cantidad !== null && suministroData.cantidad !== undefined) {
              newItem.cantidad = normalizeNumber(suministroData.cantidad);
            }
            if (suministroData.precio_unitario !== '' && suministroData.precio_unitario !== null && suministroData.precio_unitario !== undefined) {
              newItem.precio_unitario = normalizeNumber(suministroData.precio_unitario);
            }
            if (suministroData.id_unidad_medida) {
              newItem.id_unidad_medida = suministroData.id_unidad_medida;
            }
            if (suministroData.m3_perdidos !== '' && suministroData.m3_perdidos !== null && suministroData.m3_perdidos !== undefined) {
              newItem.m3_perdidos = normalizeNumber(suministroData.m3_perdidos);
            }
            if (suministroData.m3_entregados !== '' && suministroData.m3_entregados !== null && suministroData.m3_entregados !== undefined) {
              newItem.m3_entregados = normalizeNumber(suministroData.m3_entregados);
            }
            if (suministroData.m3_por_entregar !== '' && suministroData.m3_por_entregar !== null && suministroData.m3_por_entregar !== undefined) {
              newItem.m3_por_entregar = normalizeNumber(suministroData.m3_por_entregar);
            }

            creations.push(newItem);
          }
        }

        // Ejecutar actualizaciones primero
        await Promise.all(updates);

        // Si hay nuevas filas, crear en lote usando el endpoint de múltiple con info_recibo
        if (creations.length > 0) {
          const createPayload = {
            info_recibo: {
              proveedor: infoRecibo.proveedor || infoRecibo.proveedor_info?.nombre || '',
              id_proveedor: infoRecibo.id_proveedor || infoRecibo.proveedor_info?.id_proveedor || null,
              folio: infoRecibo.folio || null,
              fecha: infoRecibo.fecha || null,
              id_proyecto: infoRecibo.id_proyecto ? parseInt(infoRecibo.id_proyecto) : null,
              vehiculo_transporte: infoRecibo.vehiculo_transporte || null,
              operador_responsable: infoRecibo.operador_responsable || null,
              hora_salida: infoRecibo.hora_salida || null,
              hora_llegada: infoRecibo.hora_llegada || null,
              hora_inicio_descarga: infoRecibo.hora_inicio_descarga || null,
              hora_fin_descarga: infoRecibo.hora_fin_descarga || null,
              observaciones_generales: infoRecibo.observaciones_generales || infoRecibo.observaciones || '',
              metodo_pago: infoRecibo.metodo_pago || 'Efectivo'
            },
            suministros: creations
          };

          await api.createMultipleSuministros(createPayload);
        }
        
        showSuccess(
          'Suministros actualizados',
          `Se han actualizado/creado ${suministrosData.suministros.length} suministros correctamente`,
          { duration: 4000 }
        );
        
      } else {
        // Modo creación: crear nuevos suministros
        const response = await api.createMultipleSuministros(suministrosData);
        showSuccess(
          'Suministros creados',
          `Se han creado ${suministrosData.suministros.length} suministros correctamente`,
          { duration: 4000 }
        );
      }
        
      await loadData();
      setShowMultipleModal(false);
      setEditingRecibo(null);
    } catch (error) {
      console.error('Error guardando múltiples suministros:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      const action = editingRecibo ? 'actualizar' : 'crear';
      showError(
        `Error al ${action}`,
        `No se pudieron ${action} los suministros: ${errorMessage}`
      );
    }
  };

  // Función para eliminar un grupo completo de suministros
  const handleDeleteRecibo = async (recibo) => {
    setItemToDelete(recibo);
    setDeleteType('recibo');
    setDeleteModalOpen(true);
  };

  // Función para confirmar eliminación de recibo
  const confirmDeleteRecibo = async (recibo) => {
    try {
      // Eliminar todos los suministros del grupo
      for (const suministro of recibo.suministros) {
        await api.deleteSuministro(suministro.id_suministro);
      }

      // Mostrar notificación personalizada
      setNotificationModal({
        open: true,
        message: `✅ Recibo eliminado exitosamente. Se eliminaron ${recibo.suministros.length} suministros del sistema.`,
        type: 'success'
      });
      
      await loadData();
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setNotificationModal({
        open: true,
        message: `❌ Error al eliminar el recibo: ${errorMessage}`,
        type: 'error'
      });
    }
  };

  const handleEdit = (suministro) => {
    
    // Función para limpiar horas - convertir 00:00:00 o null a cadena vacía
    const cleanTimeField = (timeValue) => {
      if (!timeValue || timeValue === '00:00:00' || timeValue === '00:00') {
        return '';
      }
      return timeValue;
    };
    
    // Procesar información del proveedor
    const proveedorInfo = suministro.proveedor || null;
    
    // Limpiar campos de hora antes de pasar al formulario
    const suministroLimpio = {
      ...suministro,
      proveedor_info: proveedorInfo,
      hora_salida: cleanTimeField(suministro.hora_salida),
      hora_llegada: cleanTimeField(suministro.hora_llegada),
      hora_inicio_descarga: cleanTimeField(suministro.hora_inicio_descarga),
      hora_fin_descarga: cleanTimeField(suministro.hora_fin_descarga)
    };
    
    // Pasar el suministro individual directamente - FormularioSuministros ahora puede manejarlo
    setEditingRecibo(suministroLimpio);
    setShowMultipleModal(true);
  };

  // Funciones helper para formatear precios y cantidades (mostrar 0 en lugar de NaN)
  const formatPriceDisplay = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '$0.00';
    return formatCurrency(num);
  };

  const formatQuantityDisplay = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0';
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  };

  // Funciones para manejar la expansión/contracción de recibos jerárquicos
  const toggleReciboExpansion = (reciboId) => {
    setExpandedRecibos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reciboId)) {
        newSet.delete(reciboId);
      } else {
        newSet.add(reciboId);
      }
      return newSet;
    });
  };

  // Función para editar recibo (abrir modal múltiple con datos pre-cargados)
  const handleEditRecibo = (recibo) => {
    setEditingRecibo(recibo);
    setShowMultipleModal(true);
  };

  const handleView = (suministro) => {
    setViewModal({
      open: true,
      suministro: suministro
    });
  };

  const handleViewRecibo = (recibo) => {
    setViewModal({
      open: true,
      suministro: null,
      recibo: recibo
    });
  };

  const handleDelete = async (id) => {
    // Encontrar el suministro para el modal
    const suministro = suministros.find(s => s.id_suministro === id);
    if (!suministro) {
      setNotificationModal({
        open: true,
        message: '❌ Error: No se encontró el suministro a eliminar.',
        type: 'error'
      });
      return;
    }

    setItemToDelete(suministro);
    setDeleteType('suministro');
    setDeleteModalOpen(true);
  };

  // Función para manejar el click en el botón de importar
  const handleImportClick = () => {
    // TODO: Implementar funcionalidad de importación desde Excel
    setNotificationModal({
      open: true,
      message: '⚠️ La funcionalidad de importación estará disponible próximamente.',
      type: 'warning'
    });
  };

  // Función para confirmar eliminación de suministro individual
  const confirmDeleteSuministro = async (suministro) => {
    try {
      const response = await api.deleteSuministro(suministro.id_suministro);
      if (response.success) {
        setNotificationModal({
          open: true,
          message: `✅ "${suministro.descripcion || suministro.nombre || 'Suministro'}" ha sido eliminado exitosamente del sistema.`,
          type: 'success'
        });
        await loadData();
      }
    } catch (error) {
      console.error('Error eliminando suministro:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      setNotificationModal({
        open: true,
        message: `❌ Error al eliminar "${suministro.descripcion || suministro.nombre || 'el suministro'}": ${errorMessage}`,
        type: 'error'
      });
    }
  };

  // Función unificada para manejar confirmaciones de eliminación
  const handleConfirmDelete = async (item) => {
    if (deleteType === 'recibo') {
      await confirmDeleteRecibo(item);
    } else {
      await confirmDeleteSuministro(item);
    }
  };

  // Funciones para exportar/importar
  const handleDownloadTemplate = async () => {
    try {
      await generateImportTemplate(proyectos, proveedores);
      showSuccess('Plantilla descargada', 'La plantilla Excel ha sido descargada correctamente');
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      showError('Error', 'No se pudo descargar la plantilla');
    }
  };

  // Funciones para exportar el análisis personalizado
  const exportAnalysisAsPNG = async () => {
    if (!analysisExportRef.current) return;
    
    try {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Temporalmente remover restricciones de altura para capturar todo el contenido
      const originalStyle = analysisExportRef.current.style.cssText;
      const originalMaxHeight = analysisExportRef.current.style.maxHeight;
      const originalOverflow = analysisExportRef.current.style.overflow;
      
      analysisExportRef.current.style.maxHeight = 'none';
      analysisExportRef.current.style.overflow = 'visible';
      analysisExportRef.current.style.height = 'auto';
      
      // Esperar un momento para que se apliquen los cambios
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(analysisExportRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: analysisExportRef.current.scrollHeight,
        width: analysisExportRef.current.scrollWidth,
        scrollX: 0,
        scrollY: 0,
        ignoreElements: (element) => {
          return element.dataset.exclude === 'true';
        }
      });
      
      // Restaurar estilos originales
      analysisExportRef.current.style.cssText = originalStyle;
      if (originalMaxHeight) analysisExportRef.current.style.maxHeight = originalMaxHeight;
      if (originalOverflow) analysisExportRef.current.style.overflow = originalOverflow;
      
      const link = document.createElement('a');
      link.download = `Analisis_Tipo_Gasto_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      
      showSuccess('Exportación exitosa', 'El análisis se ha exportado como PNG correctamente');
    } catch (error) {
      console.error('Error al exportar PNG:', error);
      showError('Error', 'No se pudo exportar la imagen PNG');
    }
  };

  const exportAnalysisAsPDF = async () => {
    if (!analysisExportRef.current) return;
    
    try {
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Crear PDF con formato profesional
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Obtener datos del análisis
      const metrics = chartData.analisisPorTipoGasto?.metrics;
      if (!metrics) {
        showError('Error', 'No hay datos disponibles para exportar');
        return;
      }
      
      // ===== HEADER PROFESIONAL =====
      // Fondo del header
      pdf.setFillColor(79, 70, 229); // Indigo
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Logo/Icono (simulado con texto)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('📊', margin, 25);
      
      // Título principal
      pdf.setFontSize(18);
      pdf.text('ANÁLISIS POR TIPO DE GASTO', margin + 15, 20);
      
      // Subtítulo
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Clasificación entre gastos de Proyecto y Administrativos', margin + 15, 28);
      
      // Fecha y hora
      const now = new Date();
      const fechaHora = `${now.toLocaleDateString('es-MX')} - ${now.toLocaleTimeString('es-MX')}`;
      pdf.setFontSize(10);
      pdf.text(`Generado: ${fechaHora}`, pageWidth - margin - 60, 35);
      
      let currentY = 55;
      
      // ===== RESUMEN EJECUTIVO =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('RESUMEN EJECUTIVO', margin, currentY);
      
      currentY += 15;
      
      // Caja de total general
      pdf.setFillColor(240, 240, 255);
      pdf.setDrawColor(79, 70, 229);
      pdf.rect(margin, currentY - 5, contentWidth, 25, 'FD');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('TOTAL GENERAL:', margin + 10, currentY + 5);
      
      pdf.setFontSize(18);
      pdf.setTextColor(79, 70, 229);
      const totalFormateado = `$${parseFloat(metrics.valorTotal).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      pdf.text(totalFormateado, margin + 10, currentY + 15);
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${metrics.cantidadTotal} suministros totales`, pageWidth - margin - 50, currentY + 15);
      
      currentY += 40;
      
      // ===== DISTRIBUCIÓN POR TIPO =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DISTRIBUCIÓN POR TIPO', margin, currentY);
      
      currentY += 15;
      
      // Gastos de Proyecto
      pdf.setFillColor(59, 130, 246, 0.1);
      pdf.setDrawColor(59, 130, 246);
      pdf.rect(margin, currentY, contentWidth/2 - 5, 45, 'FD');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('🏗️ GASTOS DE PROYECTO', margin + 5, currentY + 10);
      
      pdf.setFontSize(24);
      pdf.text(`${metrics.porcentajeProyecto}%`, margin + 5, currentY + 22);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const totalProyecto = `$${parseFloat(metrics.totalProyecto).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      pdf.text(totalProyecto, margin + 5, currentY + 32);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${metrics.cantidadProyecto} items`, margin + 5, currentY + 40);
      
      // Gastos Administrativos
      pdf.setFillColor(16, 185, 129, 0.1);
      pdf.setDrawColor(16, 185, 129);
      pdf.rect(margin + contentWidth/2 + 5, currentY, contentWidth/2 - 5, 45, 'FD');
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(16, 185, 129);
      pdf.text('💼 GASTOS ADMINISTRATIVOS', margin + contentWidth/2 + 10, currentY + 10);
      
      pdf.setFontSize(24);
      pdf.text(`${metrics.porcentajeAdministrativo}%`, margin + contentWidth/2 + 10, currentY + 22);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const totalAdmin = `$${parseFloat(metrics.totalAdministrativo).toLocaleString('es-MX', {minimumFractionDigits: 2})}`;
      pdf.text(totalAdmin, margin + contentWidth/2 + 10, currentY + 32);
      
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`${metrics.cantidadAdministrativo} items`, margin + contentWidth/2 + 10, currentY + 40);
      
      currentY += 60;
      
      // ===== ANÁLISIS Y RECOMENDACIONES =====
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('ANÁLISIS Y RECOMENDACIONES', margin, currentY);
      
      currentY += 15;
      
      // Caja de interpretación
      pdf.setFillColor(255, 251, 235);
      pdf.setDrawColor(245, 158, 11);
      pdf.rect(margin, currentY, contentWidth, 35, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(245, 158, 11);
      pdf.text('📊 INTERPRETACIÓN:', margin + 5, currentY + 10);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const interpretacion = metrics.interpretacion || `El ${metrics.porcentajeProyecto}% del presupuesto se destina a proyectos, indicando una fuerte inversión en desarrollo y construcción.`;
      
      // Dividir texto en líneas
      const lines = pdf.splitTextToSize(interpretacion, contentWidth - 10);
      pdf.text(lines, margin + 5, currentY + 20);
      
      currentY += 50;
      
      // Caja de recomendación
      pdf.setFillColor(239, 246, 255);
      pdf.setDrawColor(59, 130, 246);
      pdf.rect(margin, currentY, contentWidth, 25, 'FD');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(59, 130, 246);
      pdf.text('💡 RECOMENDACIÓN:', margin + 5, currentY + 10);
      
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(0, 0, 0);
      const recomendacion = metrics.recomendacion || 'Considere aumentar los gastos administrativos para mantener operaciones eficientes.';
      const recLines = pdf.splitTextToSize(recomendacion, contentWidth - 10);
      pdf.text(recLines, margin + 5, currentY + 18);
      
      currentY += 40;
      
      // ===== CAPTURA DE LA GRÁFICA =====
      if (currentY + 80 > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
      }
      
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('GRÁFICA DETALLADA', margin, currentY);
      
      currentY += 10;
      
      // Capturar solo la gráfica
      const originalStyle = analysisExportRef.current.style.cssText;
      analysisExportRef.current.style.maxHeight = 'none';
      analysisExportRef.current.style.overflow = 'visible';
      analysisExportRef.current.style.height = 'auto';
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(analysisExportRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
        scale: 1.5,
        logging: false,
        useCORS: true,
        allowTaint: true,
        height: analysisExportRef.current.scrollHeight,
        width: analysisExportRef.current.scrollWidth,
        scrollX: 0,
        scrollY: 0
      });
      
      analysisExportRef.current.style.cssText = originalStyle;
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = contentWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (currentY + imgHeight > pageHeight - margin) {
        const availableHeight = pageHeight - currentY - margin;
        const scaledHeight = availableHeight;
        const scaledWidth = (canvas.width * scaledHeight) / canvas.height;
        
        pdf.addImage(imgData, 'PNG', margin + (contentWidth - scaledWidth) / 2, currentY, scaledWidth, scaledHeight);
      } else {
        pdf.addImage(imgData, 'PNG', margin, currentY, imgWidth, imgHeight);
      }
      
      // ===== FOOTER =====
      const totalPages = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        
        // Línea separadora
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        
        // Información del footer
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text('Sistema de Gestión Vlock - Análisis por Tipo de Gasto', margin, pageHeight - 8);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 8);
      }
      
      // Metadatos del PDF
      pdf.setProperties({
        title: 'Análisis por Tipo de Gasto',
        subject: 'Reporte de distribución de gastos por tipo',
        author: 'Sistema de Gestión Vlock',
        creator: 'Sistema de Gestión Vlock',
        keywords: 'análisis, gastos, proyecto, administrativo'
      });
      
      pdf.save(`Analisis_Tipo_Gasto_${new Date().toISOString().split('T')[0]}.pdf`);
      
      showSuccess('Exportación exitosa', 'El análisis se ha exportado como PDF profesional correctamente');
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      showError('Error', 'No se pudo exportar el archivo PDF');
    }
  };

  const handleExportToExcel = async () => {
    try {
      // Agrupar suministros por folio para mantener consistencia
      const folioGroups = {};
      
      filteredSuministros.forEach(suministro => {
        const folio = suministro.folio || suministro.id_suministro;
        if (!folioGroups[folio]) {
          folioGroups[folio] = [];
        }
        folioGroups[folio].push(suministro);
      });

      // Asignar el mismo folio a todos los suministros del grupo
      const dataToExport = filteredSuministros.map(suministro => {
        const folio = suministro.folio || suministro.id_suministro;
        return {
          ...suministro,
          folio: folio, // Asegurar que el folio esté presente
          proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
          proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
        };
      });
      
      await exportToExcel(dataToExport);
      showSuccess('Exportación exitosa', 'Los suministros han sido exportados a Excel');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      showError('Error', 'No se pudo exportar a Excel');
    }
  };

  const handleExportToPDF = async () => {
    try {
      // Agrupar suministros por folio para mantener consistencia
      const folioGroups = {};
      
      filteredSuministros.forEach(suministro => {
        const folio = suministro.folio || suministro.id_suministro;
        if (!folioGroups[folio]) {
          folioGroups[folio] = [];
        }
        folioGroups[folio].push(suministro);
      });

      // Asignar el mismo folio a todos los suministros del grupo
      const dataToExport = filteredSuministros.map(suministro => {
        const folio = suministro.folio || suministro.id_suministro;
        return {
          ...suministro,
          folio: folio, // Asegurar que el folio esté presente
          proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
          proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
        };
      });
      
      // Información de filtros aplicados
      const filtrosInfo = {
        totalRegistros: suministros.length,
        registrosFiltrados: filteredSuministros.length,
        filtros: {
          busqueda: searchTerm,
          proyecto: filters.proyecto,
          proveedor: filters.proveedor,
          estado: filters.estado,
          fechaInicio: filters.fechaInicio,
          fechaFin: filters.fechaFin
        }
      };
      
      await exportToPDF(dataToExport, filtrosInfo);
      showSuccess('Exportación exitosa', 'Los suministros han sido exportados a PDF');
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      showError('Error', 'No se pudo exportar a PDF');
    }
  };

  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImportFile(file);
    setIsProcessingImport(true);
    
    try {
      const { validData, errors } = await processImportFile(file);
      
      setValidImportData(validData);
      setImportErrors(errors);
      
      if (errors.length > 0) {
        showWarning(
          'Errores de validación',
          `Se encontraron ${errors.length} errores en el archivo. Revisa la lista de errores.`
        );
      } else {
        showInfo(
          'Archivo validado',
          `${validData.length} registros válidos listos para importar`
        );
      }
    } catch (error) {
      console.error('Error procesando archivo:', error);
      showError('Error', 'No se pudo procesar el archivo');
      setImportErrors([{ row: 0, message: 'Error al leer el archivo' }]);
    } finally {
      setIsProcessingImport(false);
    }
  };

  const handleConfirmImport = async () => {
    if (validImportData.length === 0) return;

    setIsProcessingImport(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      // Agrupar suministros por recibo (folio y fecha)
      const groupedByRecibo = {};
      
      validImportData.forEach(item => {
        const key = `${item.folio}-${item.fecha}`;
        if (!groupedByRecibo[key]) {
          groupedByRecibo[key] = {
            recibo: {
              folio: item.folio,
              fecha: item.fecha,
              metodo_pago: item.metodo_pago,
              proveedor: item.proveedor_nombre,
              observaciones_generales: item.observaciones_generales
            },
            suministros: []
          };
        }
        
        groupedByRecibo[key].suministros.push({
          // === CAMPOS DEL FORMULARIO REAL ===
          nombre: item.nombre,
          tipo_suministro: item.tipo_suministro,
          codigo_producto: item.codigo_producto,
          cantidad: item.cantidad,
          id_unidad_medida: item.id_unidad_medida,
          precio_unitario: item.precio_unitario,
          estado: item.estado,
          descripcion_detallada: item.descripcion_detallada,
          include_iva: item.include_iva
        });
      });

      // Procesar cada grupo de recibo
      for (const key in groupedByRecibo) {
        const group = groupedByRecibo[key];
        
        try {
          // Buscar proveedor por nombre
          const proveedor = proveedores.find(p => 
            p.nombre.toLowerCase().trim() === group.recibo.proveedor.toLowerCase().trim()
          );
          
          if (!proveedor) {
            console.error(`Proveedor "${group.recibo.proveedor}" no encontrado`);
            errorCount += group.suministros.length;
            continue;
          }

          // Buscar proyecto por nombre (usar el primer proyecto si no se especifica)
          let proyecto = proyectos[0]; // Por defecto usar el primer proyecto
          
          // Formatear datos para el endpoint múltiple correcto
          const payload = {
            info_recibo: {
              folio: group.recibo.folio,
              fecha: group.recibo.fecha,
              id_proyecto: proyecto.id_proyecto,
              id_proveedor: proveedor.id_proveedor,
              metodo_pago: group.recibo.metodo_pago,
              observaciones_generales: group.recibo.observaciones_generales || ''
            },
            suministros: group.suministros,
            include_iva: group.suministros[0]?.include_iva !== undefined ? group.suministros[0].include_iva : true
          };

          const response = await api.request('/suministros/multiple', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
          
          // Si llegamos aquí, la petición fue exitosa
          successCount += group.suministros.length;
        } catch (error) {
          console.error('Error creando suministros del recibo:', error);
          errorCount += group.suministros.length;
        }
      }

      if (successCount > 0) {
        showSuccess(
          'Importación completada',
          `${successCount} suministros importados correctamente${errorCount > 0 ? `. ${errorCount} errores.` : ''}`
        );
        await loadData();
      }

      if (errorCount > 0 && successCount === 0) {
        showError('Error en importación', `No se pudieron importar los suministros`);
      }

    } catch (error) {
      console.error('Error en importación:', error);
      showError('Error', 'Error durante la importación');
    } finally {
      setIsProcessingImport(false);
      setShowImportModal(false);
      setImportFile(null);
      setValidImportData([]);
      setImportErrors([]);
    }
  };

  const handleCloseModal = () => {
    setShowMultipleModal(false);
    setEditingSuministro(null);
    
    // Limpiar todas las sugerencias
    clearAllSuggestions();
    
    // Limpiar estado de duplicados
    setDuplicatesSuggestions([]);
    setShowDuplicatesWarning(false);
    
    setFormData({
      nombre: '',
      descripcion: '',
      id_categoria_suministro: null,
      cantidad: '',
      id_unidad_medida: 1,
      precio_unitario: '',
      fecha_necesaria: '',
      estado: 'Solicitado',
      id_proyecto: '',
      proveedor_info: null,
      observaciones: '',
      codigo_producto: '',
      // Resetear nuevos campos
      folio: '',
      operador_responsable: '',
      vehiculo_transporte: '',
      hora_salida: '',
      hora_llegada: '',
      hora_inicio_descarga: '',
      hora_fin_descarga: ''
    });
    
    // Limpiar estado de duplicados
    setDuplicatesSuggestions([]);
    setShowDuplicatesWarning(false);
  };

  // Función auxiliar para normalizar fechas y evitar problemas de zona horaria
  const normalizarFecha = (fechaStr) => {
    if (!fechaStr) return null;
    
    // Si es un string en formato YYYY-MM-DD, crear fecha local
    if (typeof fechaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
      const [year, month, day] = fechaStr.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    }
    
    // Si tiene formato ISO con tiempo, extraer solo la fecha
    if (typeof fechaStr === 'string' && fechaStr.includes('T')) {
      const [datePart] = fechaStr.split('T');
      const [year, month, day] = datePart.split('-');
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
    }
    
    // Para cualquier otro formato, intentar parsear y normalizar
    const fecha = new Date(fechaStr);
    if (isNaN(fecha.getTime())) return null;
    
    // Normalizar a medianoche hora local
    return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
  };

  const filteredSuministros = combinedData.filter(suministro => {
    const matchesSearch = suministro.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.descripcion_detallada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.folio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Manejar categoría como objeto o string
    const categoriaId = typeof suministro.categoria === 'object' && suministro.categoria 
      ? suministro.categoria.id_categoria 
      : suministro.id_categoria_suministro;
    const categoriaNombre = typeof suministro.categoria === 'object' && suministro.categoria 
      ? suministro.categoria.nombre 
      : suministro.categoria;
      
    const matchesCategoria = !filters.categoria || 
                            categoriaId?.toString() === filters.categoria ||
                            categoriaNombre === filters.categoria ||
                            suministro.tipo_suministro === filters.categoria;
                            
    const matchesEstado = !filters.estado || suministro.estado === filters.estado;
    const matchesProyecto = !filters.proyecto || suministro.id_proyecto?.toString() === filters.proyecto;
    const matchesProveedor = !filters.proveedor || 
                            suministro.proveedor === filters.proveedor ||
                            suministro.proveedor?.nombre === filters.proveedor;
    
    // Filtro por tipo de categoría
    const categoriaTipo = typeof suministro.categoria === 'object' && suministro.categoria 
      ? suministro.categoria.tipo 
      : suministro.tipo_categoria; // Para filas de nómina
    const matchesTipoCategoria = !filters.tipo_categoria || categoriaTipo === filters.tipo_categoria;

    // Filtro por rango de fechas
    let matchesFecha = true;
    if (filters.fechaInicio || filters.fechaFin) {
      // Obtener la fecha del suministro
      const fechaStr = suministro.fecha_necesaria || suministro.fecha || suministro.createdAt || suministro.fecha_registro;
      const fechaSuministro = normalizarFecha(fechaStr);
      
      if (!fechaSuministro) {
        // Si no tiene fecha válida, no pasa el filtro
        matchesFecha = false;
      } else {
        if (filters.fechaInicio) {
          const fechaInicio = normalizarFecha(filters.fechaInicio);
          if (fechaInicio) {
            matchesFecha = matchesFecha && fechaSuministro >= fechaInicio;
          }
        }
        
        if (filters.fechaFin) {
          const fechaFin = normalizarFecha(filters.fechaFin);
          if (fechaFin) {
            // Ajustar al final del día para incluir todo el día
            fechaFin.setHours(23, 59, 59, 999);
            matchesFecha = matchesFecha && fechaSuministro <= fechaFin;
          }
        }
      }
    }

    return matchesSearch && matchesCategoria && matchesEstado && matchesProyecto && 
           matchesProveedor && matchesTipoCategoria && matchesFecha;
  });

  // Calcular paginación
  const totalFilteredItems = filteredSuministros.length;
  const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  
  // Actualizar totalPages si es diferente
  if (calculatedTotalPages !== totalPages) {
    setTotalPages(calculatedTotalPages);
  }
  
  // Asegurar que currentPage esté dentro del rango válido
  const validCurrentPage = Math.max(1, Math.min(currentPage, calculatedTotalPages || 1));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  // Aplicar paginación a los suministros filtrados
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSuministros = filteredSuministros.slice(startIndex, endIndex);

  const calculateTotal = (suministro) => {
    // Primero intentar usar el costo_total si está disponible
    const costoTotal = parseFloat(suministro.costo_total);
    if (!isNaN(costoTotal) && costoTotal > 0) {
      return Math.round(costoTotal * 100) / 100;
    }
    
    // Si no hay costo_total, calcular con cantidad * precio_unitario
    const cantidad = parseFloat(suministro.cantidad) || 0;
    const precio = parseFloat(suministro.precio_unitario) || 0;
    const total = cantidad * precio;
    
    // Redondear a 2 decimales exactos para evitar problemas de precisión
    return Math.round(total * 100) / 100;
  };

  // Calcular estadísticas generales (todos los suministros, sin filtros)
  const calculateGeneralStats = () => {
    let totalGastado = 0;
    let gastosAdministrativos = 0;
    let gastosProyectos = 0;
    let totalNominas = 0; // Nueva métrica para nóminas
    
    suministros.forEach((suministro) => {
      const costo = calculateTotal(suministro);
      totalGastado += costo;
      
      // Clasificar por tipo de categoría
      let tipoCategoria = null;
      
      // Intentar obtener el tipo desde la categoría relacionada
      if (suministro.categoria && suministro.categoria.tipo) {
        tipoCategoria = suministro.categoria.tipo;
      } 
      // Si no viene en la relación, buscar en categorías dinámicas
      else if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
        const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
        if (categoriaObj && categoriaObj.tipo) {
          tipoCategoria = categoriaObj.tipo;
        }
      }
      
      // Sumar al tipo correspondiente
      if (tipoCategoria === 'Administrativo') {
        gastosAdministrativos += costo;
      } else if (tipoCategoria === 'Proyecto') {
        gastosProyectos += costo;
      }
    });

    // Calcular total de nóminas pagadas (sin filtros)
    // El hook useCombinedTableData ya filtra solo nóminas en estado "Pagado"
    if (combinedData && combinedData.length > 0) {
      combinedData.forEach(item => {
        // Verificar que sea una fila de nómina usando el flag isNominaRow
        if (item.isNominaRow === true) {
          const monto = parseFloat(item.costo_total || item.precio_unitario || 0);
          if (!isNaN(monto) && monto > 0) {
            totalNominas += monto;
          }
        }
      });
    }

    console.log('📊 Stats generales calculadas:', {
      totalGastado,
      gastosAdministrativos,
      gastosProyectos,
      totalNominas,
      nominasEnCombinedData: combinedData?.filter(i => i.isNominaRow).length || 0
    });

    const totalSuministros = suministros.length;
    
    const proyectosUnicos = new Set(suministros.map(s => s.id_proyecto).filter(id => id)).size;

    return {
      totalGastado: Math.round(totalGastado * 100) / 100,
      gastosAdministrativos: Math.round(gastosAdministrativos * 100) / 100,
      gastosProyectos: Math.round(gastosProyectos * 100) / 100,
      totalNominas: Math.round(totalNominas * 100) / 100,
      totalSuministros,
      proyectosUnicos
    };
  };

  // Calcular estadísticas de la vista actual (solo registros filtrados)
  const calculateFilteredStats = () => {
    let totalGastadoFiltrado = 0;
    let gastosAdministrativosFiltrado = 0;
    let gastosProyectosFiltrado = 0;
    let totalNominasFiltrado = 0; // Nueva métrica para nóminas filtradas
    
    filteredSuministros.forEach((suministro) => {
      const costo = calculateTotal(suministro);
      totalGastadoFiltrado += costo;
      
      // Clasificar por tipo de categoría
      let tipoCategoria = null;
      
      // Intentar obtener el tipo desde la categoría relacionada
      if (suministro.categoria && suministro.categoria.tipo) {
        tipoCategoria = suministro.categoria.tipo;
      } 
      // Si no viene en la relación, buscar en categorías dinámicas
      else if (suministro.id_categoria_suministro && categoriasDinamicas && categoriasDinamicas.length > 0) {
        const categoriaObj = categoriasDinamicas.find(cat => cat.id_categoria == suministro.id_categoria_suministro);
        if (categoriaObj && categoriaObj.tipo) {
          tipoCategoria = categoriaObj.tipo;
        }
      }
      
      // Sumar al tipo correspondiente
      if (tipoCategoria === 'Administrativo') {
        gastosAdministrativosFiltrado += costo;
      } else if (tipoCategoria === 'Proyecto') {
        gastosProyectosFiltrado += costo;
      }
    });

    // Calcular total de nóminas filtradas
    // El hook useCombinedTableData ya filtra solo nóminas en estado "Pagado"
    // Aquí aplicamos los mismos filtros que a los suministros
    if (combinedData && combinedData.length > 0) {
      const filteredNominas = combinedData.filter(item => {
        // Verificar que sea una fila de nómina
        if (item.isNominaRow !== true) return false;
        
        // Aplicar filtros de búsqueda de texto
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            item.nombre?.toLowerCase().includes(searchLower) ||
            item.codigo?.toLowerCase().includes(searchLower) ||
            item.descripcion?.toLowerCase().includes(searchLower) ||
            item.nombre_proyecto?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        
        // Aplicar filtros de proyecto
        if (filters.proyecto && item.id_proyecto?.toString() !== filters.proyecto.toString()) {
          return false;
        }
        
        // Aplicar filtros de fecha
        if (filters.fechaInicio || filters.fechaFin) {
          const itemFecha = new Date(item.fecha || item.fecha_registro || item.fecha_inicio || item.createdAt);
          if (filters.fechaInicio) {
            const fechaInicio = new Date(filters.fechaInicio);
            if (itemFecha < fechaInicio) {
              return false;
            }
          }
          if (filters.fechaFin) {
            const fechaFin = new Date(filters.fechaFin);
            fechaFin.setHours(23, 59, 59, 999);
            if (itemFecha > fechaFin) {
              return false;
            }
          }
        }
        
        return true;
      });
      
      filteredNominas.forEach(nomina => {
        const monto = parseFloat(nomina.costo_total || nomina.precio_unitario || 0);
        if (!isNaN(monto) && monto > 0) {
          totalNominasFiltrado += monto;
        }
      });
      
      console.log('📊 Stats filtradas calculadas:', {
        totalGastadoFiltrado,
        gastosAdministrativosFiltrado,
        gastosProyectosFiltrado,
        totalNominasFiltrado,
        nominasFiltradasCount: filteredNominas.length,
        nominasEnCombinedData: combinedData.filter(i => i.isNominaRow).length
      });
    }

    return {
      totalGastadoFiltrado: Math.round(totalGastadoFiltrado * 100) / 100,
      gastosAdministrativosFiltrado: Math.round(gastosAdministrativosFiltrado * 100) / 100,
      gastosProyectosFiltrado: Math.round(gastosProyectosFiltrado * 100) / 100,
      totalNominasFiltrado: Math.round(totalNominasFiltrado * 100) / 100,
      totalSuministrosFiltrados: filteredSuministros.length
    };
  };

  // Funciones para manejar paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
  };

  const getPaginationInfo = () => {
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems);
    const end = Math.min(currentPage * itemsPerPage, totalFilteredItems);
    return {
      start,
      end,
      total: totalFilteredItems
    };
  };

  // Calcular estadísticas generales y filtradas
  const stats = calculateGeneralStats();
  const filteredStats = calculateFilteredStats();

  // Función para validar y formatear precios en tiempo real
  const handlePriceChange = (value) => {
    if (!value) return '';
    
    // Permitir solo números y un punto decimal
    const sanitized = value.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + '.' + parts[1].substring(0, 2);
    }
    
    return sanitized;
  };

  // Función para manejar el filtro de tipo de categoría
  const handleFiltroTipoChange = (nuevoTipo) => {
    setFilters(prev => ({
      ...prev,
      tipo_categoria: nuevoTipo
    }));
    setCurrentPage(1); // Resetear página al cambiar filtro
  };

  // Función para exportar reportes por tipo
  const handleExportReport = async (tipoReporte) => {
    try {
      showInfo('Exportando reporte', 'Generando reporte por tipo de gasto...');
      
      if (tipoReporte === 'tipo') {
        // Mostrar opciones de exportación
        const opcion = window.confirm('¿Desea exportar en formato PDF? \n\nAceptar = PDF\nCancelar = Excel');
        
        let fileName;
        if (opcion) {
          // Exportar a PDF
          fileName = await exportReporteTipoPDF(estadisticasTipo, suministros, filters);
        } else {
          // Exportar a Excel
          fileName = exportReporteTipoExcel(estadisticasTipo, suministros, filters);
        }
        
        showSuccess('Reporte exportado', `El reporte por tipo ha sido generado: ${fileName}`);
      } else {
        // Fallback a exportación existente
        await handleExportToPDF();
        showSuccess('Reporte exportado', 'El reporte ha sido generado correctamente');
      }
    } catch (error) {
      console.error('Error exportando reporte:', error);
      showError('Error', 'No se pudo exportar el reporte: ' + error.message);
    }
  };

  const formatQuantity = (quantity) => {
    if (!quantity && quantity !== 0) return '0';
    
    // Convertir a número si es string (especialmente importante para DECIMAL de MySQL)
    const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
    
    // Verificar si es un número válido
    if (isNaN(num)) return '0';
    
    // Si es un número entero o muy cercano a uno (para evitar problemas de precisión flotante)
    if (Math.abs(num - Math.round(num)) < 0.001) {
      return Math.round(num).toString();
    }
    
    // Si tiene decimales, mostrar hasta 3 decimales y quitar ceros innecesarios
    return parseFloat(num.toFixed(3)).toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    // Si ya está en formato YYYY-MM-DD, formatearlo directamente sin crear Date object
    if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    }
    
    // Fallback para otros formatos, crear fecha local
    try {
      const fecha = new Date(dateString + 'T00:00:00'); // Agregar tiempo para evitar zona horaria
      const day = String(fecha.getDate()).padStart(2, '0');
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const year = fecha.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const getEstadoStyle = (estado) => {
    return ESTADOS_SUMINISTRO[estado]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getEstadoBadge = (estado) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(estado)}`}>
        {ESTADOS_SUMINISTRO[estado]?.label || estado}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header con pestañas */}
      <SuministrosHeader activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tarjetas de estadísticas compactas - Visible en todas las pestañas */}
      {/* Usar estadísticas filtradas si hay filtros activos, de lo contrario usar stats generales */}
      <SuministrosCards 
        stats={{
          totalGastado: (searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria || filters.fechaInicio || filters.fechaFin) 
            ? filteredStats.totalGastadoFiltrado 
            : stats.totalGastado,
          gastosAdministrativos: (searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria || filters.fechaInicio || filters.fechaFin) 
            ? filteredStats.gastosAdministrativosFiltrado 
            : stats.gastosAdministrativos,
          gastosProyectos: (searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria || filters.fechaInicio || filters.fechaFin) 
            ? filteredStats.gastosProyectosFiltrado 
            : stats.gastosProyectos,
          totalNominas: (searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor || filters.tipo_categoria || filters.fechaInicio || filters.fechaFin) 
            ? filteredStats.totalNominasFiltrado 
            : stats.totalNominas
        }} 
      />

      {/* Contenido según pestaña activa */}
      {activeTab === 'gastos' && (
        <GastosTab
          filters={filters}
          searchTerm={searchTerm}
          filteredStats={filteredStats}
          estadisticasTipo={estadisticasTipo}
          onFiltroTipoChange={handleFiltroTipoChange}
          onClearFilters={() => {
            setSearchTerm('');
            setFilters({ categoria: '', estado: '', proyecto: '', proveedor: '', tipo_categoria: '' });
          }}
        />
      )}

      {/* Pestaña "Tabla de Gastos" - Controles, filtros y tabla */}
      {activeTab === 'tabla' && (
        <TablaGastosTab
          searchTerm={searchTerm}
          filters={filters}
          filteredStats={filteredStats}
          showFilters={showFilters}
          proyectos={proyectos}
          categoriasDinamicas={categoriasDinamicas}
          proveedores={proveedores}
          ESTADOS_SUMINISTRO={ESTADOS_SUMINISTRO}
          paginatedSuministros={paginatedSuministros}
          currentPage={currentPage}
          totalPages={totalPages}
          suministrosFiltrados={filteredSuministros}
          estadisticasTipo={estadisticasTipo}
          setSearchTerm={setSearchTerm}
          setFilters={setFilters}
          setShowFilters={setShowFilters}
          setShowMultipleModal={setShowMultipleModal}
          setShowUnidadesModal={setShowUnidadesModal}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          handleDeleteRecibo={handleDeleteRecibo}
          handleViewDetails={handleView}
          setCurrentPage={setCurrentPage}
          handleExportToExcel={handleExportToExcel}
          handleExportToPDF={handleExportToPDF}
          handleImportClick={handleImportClick}
          onFiltroTipoChange={handleFiltroTipoChange}
          showExportDropdown={showExportDropdown}
          setShowExportDropdown={setShowExportDropdown}
          formatDate={formatDate}
          formatUnidadMedida={formatUnidadMedida}
          getEstadoBadge={getEstadoBadge}
          agruparSuministrosPorRecibo={agruparSuministrosPorRecibo}
          expandedRecibos={expandedRecibos}
          toggleReciboExpansion={toggleReciboExpansion}
          calculateTotal={calculateTotal}
          handleEditRecibo={handleEditRecibo}
          handleViewRecibo={handleViewRecibo}
          formatPriceDisplay={formatPriceDisplay}
        />
      )}

      {/* Sección de Gráficas - Solo visible en pestaña 'reportes' */}
{activeTab === 'reportes' && (
  <ReportesTab
    suministros={suministros}
    proyectos={proyectos}
    proveedores={proveedores}
    categoriasDinamicas={categoriasDinamicas}
    chartFilters={chartFilters}
    setChartFilters={setChartFilters}
    selectedCharts={selectedCharts}
    setSelectedCharts={setSelectedCharts}
    showError={showError}
  />
)}


      {/* Modal Formulario Unificado */}
      {showMultipleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="flex items-center justify-center w-full h-full">
            <FormularioSuministros
              key={editingRecibo ? `edit-${editingRecibo.id}` : 'new'}
              onSubmit={handleMultipleSubmit}
              onCancel={() => {
                setShowMultipleModal(false);
                setEditingRecibo(null);
              }}
              proyectos={proyectos}
              proveedores={proveedores}
              categorias={categorias}
              unidades={unidadesMedida}
              unidadesDinamicas={unidadesDinamicas || []}
              onCategoriesUpdated={handleCategoriasUpdated}
              initialData={editingRecibo}
            />
          </div>
        </div>
      )}

      {/* Modal de Importación */}
      {(showImportModal || importFile) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Importar Suministros
                </h2>
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setValidImportData([]);
                    setImportErrors([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
              {!importFile ? (
                <div className="text-center py-8">
                  <FaUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Selecciona un archivo Excel para importar suministros
                  </p>
                  <label className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 cursor-pointer transition-colors duration-200">
                    <FaFileExcel className="w-5 h-5" />
                    Seleccionar Archivo
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleFileImport}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaFileExcel className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-900 dark:text-blue-100">
                        {importFile.name}
                      </span>
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300">
                      {validImportData.length} registros válidos, {importErrors.length} errores
                    </div>
                  </div>

                  {/* Errores de validación */}
                  {importErrors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h3 className="font-medium text-red-900 dark:text-red-100 mb-3 flex items-center gap-2">
                        <FaTimes className="w-4 h-4" />
                        Errores de Validación ({importErrors.length})
                      </h3>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {importErrors.slice(0, 20).map((error, index) => (
                          <div key={index} className="text-sm text-red-700 dark:text-red-300">
                            <span className="font-medium">Fila {error.row}:</span> {error.message}
                          </div>
                        ))}
                        {importErrors.length > 20 && (
                          <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                            ... y {importErrors.length - 20} errores más
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vista previa de datos válidos */}
                  {validImportData.length > 0 && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <h3 className="font-medium text-green-900 dark:text-green-100 mb-3 flex items-center gap-2">
                        <FaFileExcel className="w-4 h-4" />
                        Datos Válidos ({validImportData.length})
                      </h3>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr className="border-b border-green-200 dark:border-green-800">
                              <th className="text-left py-2 text-green-800 dark:text-green-200">Nombre</th>
                              <th className="text-left py-2 text-green-800 dark:text-green-200">Código</th>
                              <th className="text-left py-2 text-green-800 dark:text-green-200">Cantidad</th>
                              <th className="text-left py-2 text-green-800 dark:text-green-200">Precio</th>
                              <th className="text-left py-2 text-green-800 dark:text-green-200">Proveedor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {validImportData.slice(0, 10).map((item, index) => (
                              <tr key={index} className="border-b border-green-100 dark:border-green-900">
                                <td className="py-1 text-green-700 dark:text-green-300">{item.nombre}</td>
                                <td className="py-1 text-green-700 dark:text-green-300">{item.codigo}</td>
                                <td className="py-1 text-green-700 dark:text-green-300">{item.cantidad}</td>
                                <td className="py-1 text-green-700 dark:text-green-300">${item.precio_unitario}</td>
                                <td className="py-1 text-green-700 dark:text-green-300">{item.proveedor_nombre}</td>
                              </tr>
                            ))}
                            {validImportData.length > 10 && (
                              <tr>
                                <td colSpan="5" className="py-2 text-center text-green-600 dark:text-green-400 font-medium">
                                  ... y {validImportData.length - 10} registros más
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botones del modal */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setValidImportData([]);
                  setImportErrors([]);
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors duration-200"
              >
                Cancelar
              </button>
              
              {importFile && (
                <button
                  onClick={() => {
                    setImportFile(null);
                    setValidImportData([]);
                    setImportErrors([]);
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  Seleccionar Otro Archivo
                </button>
              )}

              {validImportData.length > 0 && importErrors.length === 0 && (
                <button
                  onClick={handleConfirmImport}
                  disabled={isProcessingImport}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  {isProcessingImport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Importando...
                    </>
                  ) : (
                    <>
                      <FaUpload className="w-4 h-4" />
                      Importar {validImportData.length} Suministros
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}



      {/* Modales de confirmación mejorados */}
      <SuministroDeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
          setDeleteType('suministro');
        }}
        onConfirm={handleConfirmDelete}
        suministro={itemToDelete}
        type={deleteType}
      />

      <SuministroNotificationModal
        isOpen={notificationModal.open}
        onClose={() => setNotificationModal({ open: false, message: '', type: 'success' })}
        message={notificationModal.message}
        type={notificationModal.type}
        autoClose
        duration={4000}
      />

      {/* Modal de Gestión de Unidades de Medida */}
      <UnidadesMedidaManager
        isOpen={showUnidadesModal}
        onClose={() => setShowUnidadesModal(false)}
        onUnidadesUpdated={handleUnidadesUpdated}
      />

      {/* Modal de Vista de Suministro/Recibo - Diseño Minimalista */}
      {viewModal.open && (viewModal.suministro || viewModal.recibo) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                {viewModal.recibo ? (
                  <div className="flex items-center gap-2">
                    <FaBoxes className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Recibo ({viewModal.recibo.cantidad_items} artículos)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FaBox className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Suministro Individual
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setViewModal({ open: false, suministro: null, recibo: null })}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Cerrar"
              >
                <FaTimes className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              
              {/* Vista de Recibo Agrupado */}
              {viewModal.recibo && (
                <div className="space-y-6">
                  {/* Información Principal */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Proveedor</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {viewModal.recibo.proveedor}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Proyecto</div>
                        <div className="text-lg font-semibold text-gray-900 dark:text-white">
                          {viewModal.recibo.proyecto}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Fecha</div>
                        <div className="text-base text-gray-900 dark:text-white">
                          {formatDate(viewModal.recibo.fecha)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Folio</div>
                        <div className="text-base text-gray-900 dark:text-white">
                          {viewModal.recibo.folio || 'Sin folio'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total de Artículos</div>
                          <div className="text-2xl font-bold text-gray-900 dark:text-white">
                            {viewModal.recibo.cantidad_items}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-500 dark:text-gray-400">Total del Recibo</div>
                          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(viewModal.recibo.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Suministros */}
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <FaListUl className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Artículos ({viewModal.recibo.suministros.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {viewModal.recibo.suministros.map((suministro, index) => (
                        <div key={suministro.id_suministro} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full">
                                <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {index + 1}
                                </span>
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  {suministro.nombre || suministro.descripcion}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {suministro.codigo_producto || 'Sin código'}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900 dark:text-white">
                                {formatCurrency((suministro.cantidad || 0) * (suministro.precio_unitario || 0))}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {formatNumber(suministro.cantidad || 0)} {formatUnidadMedida(suministro.unidadMedida)}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {getDisplayCategoria(suministro.tipo_suministro || 
                                  (typeof suministro.categoria === 'object' && suministro.categoria 
                                    ? suministro.categoria.nombre 
                                    : suministro.categoria), categoriasDinamicas)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Precio unitario:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {formatCurrency(suministro.precio_unitario || 0)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Estado:</span>
                              <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                suministro.estado === 'Entregado' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : suministro.estado === 'En Proceso'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {suministro.estado || 'No especificado'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">Fecha:</span>
                              <span className="ml-2 text-gray-900 dark:text-white">
                                {formatDate(suministro.fecha || suministro.fecha_necesaria)}
                              </span>
                            </div>
                          </div>
                          
                          {(suministro.descripcion_detallada || suministro.observaciones) && (
                            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                              {suministro.descripcion_detallada && (
                                <div className="mb-2">
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Descripción:</span>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {suministro.descripcion_detallada}
                                  </p>
                                </div>
                              )}
                              {suministro.observaciones && (
                                <div>
                                  <span className="text-sm text-gray-500 dark:text-gray-400">Observaciones:</span>
                                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                                    {suministro.observaciones}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vista de Suministro Individual */}
              {viewModal.suministro && !viewModal.recibo && (
                <div className="space-y-6">
                  {/* Información Principal */}
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {viewModal.suministro.nombre || 'Sin nombre'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {viewModal.suministro.codigo_producto || 'Sin código'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Categoría</div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {getDisplayCategoria(viewModal.suministro.tipo_suministro || 
                           (typeof viewModal.suministro.categoria === 'object' && viewModal.suministro.categoria 
                             ? viewModal.suministro.categoria.nombre 
                             : viewModal.suministro.categoria), categoriasDinamicas)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Proyecto</div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {viewModal.suministro.proyecto?.nombre || viewModal.suministro.proyecto || 'Sin proyecto'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Proveedor</div>
                        <div className="text-base font-medium text-gray-900 dark:text-white">
                          {viewModal.suministro.proveedor?.nombre || viewModal.suministro.proveedor || 'Sin proveedor'}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estado</div>
                        <div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            viewModal.suministro.estado === 'Entregado' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : viewModal.suministro.estado === 'En Proceso'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {viewModal.suministro.estado || 'Sin estado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información de Cantidades y Precios */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Cantidades y Precios
                    </h4>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          {formatNumber(viewModal.suministro.cantidad || 0)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatUnidadMedida(viewModal.suministro.unidadMedida)}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          {formatCurrency(viewModal.suministro.precio_unitario || 0)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Precio unitario</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {formatCurrency((viewModal.suministro.cantidad || 0) * (viewModal.suministro.precio_unitario || 0))}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información Adicional */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                        Información Adicional
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Fecha</div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {formatDate(viewModal.suministro.fecha || viewModal.suministro.fecha_necesaria)}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Método de Pago</div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {viewModal.suministro.metodo_pago || 'No especificado'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Folio Proveedor</div>
                          <div className="text-sm text-gray-900 dark:text-white">
                            {viewModal.suministro.folio_proveedor || 'Sin folio'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {(viewModal.suministro.descripcion_detallada || viewModal.suministro.observaciones) && (
                      <div>
                        <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">
                          Notas
                        </h4>
                        <div className="space-y-3">
                          {viewModal.suministro.descripcion_detallada && (
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Descripción</div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                {viewModal.suministro.descripcion_detallada}
                              </div>
                            </div>
                          )}
                          {viewModal.suministro.observaciones && (
                            <div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Observaciones</div>
                              <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
                                {viewModal.suministro.observaciones}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Modal de Gráficas Expandidas */}
      <ChartModal
        isOpen={chartModal.isOpen}
        onClose={closeChartModal}
        chartData={chartModal.chartData}
        chartOptions={chartModal.chartOptions}
        chartType={chartModal.chartType}
        title={chartModal.title}
        subtitle={chartModal.subtitle}
        color={chartModal.color}
        metrics={chartModal.metrics}
        customContent={chartModal.customContent}
      />

      {/* Modal de Análisis Personalizado */}
      {analysisModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                    <FaChartPie className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">Análisis por Tipo de Gasto - Vista Completa</h2>
                    <p className="text-indigo-100">Análisis detallado de la distribución de gastos</p>
                  </div>
                </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={exportAnalysisAsPNG}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
                        title="Exportar como PNG"
                      >
                        <FaImage className="w-4 h-4" />
                        <span className="text-sm font-medium">PNG</span>
                      </button>
                      <button
                        onClick={exportAnalysisAsPDF}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl transition-all duration-200 flex items-center gap-2"
                        title="Exportar como PDF"
                      >
                        <FaFilePdf className="w-4 h-4" />
                        <span className="text-sm font-medium">PDF</span>
                      </button>
                      <button 
                        onClick={() => setAnalysisModal(false)}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-xl transition-all duration-200"
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
              </div>
            </div>

            {/* Contenido */}
            <div ref={analysisExportRef} className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Gráfica */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Distribución Visual</h3>
                  <div className="h-96">
                    <Doughnut
                      data={chartData.analisisPorTipoGasto}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '50%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: {
                              color: getChartColors().textColor,
                              padding: 20,
                              font: { size: 16, weight: '600' },
                              usePointStyle: true,
                              pointStyle: 'circle'
                            }
                          },
                          tooltip: {
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            titleColor: '#F9FAFB',
                            bodyColor: '#F9FAFB',
                            borderColor: 'rgba(99, 102, 241, 0.5)',
                            borderWidth: 1,
                            cornerRadius: 12,
                            padding: 16,
                            displayColors: true,
                            callbacks: {
                              label: function(context) {
                                const valor = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((valor * 100) / total).toFixed(1);
                                return `${context.label}: $${valor.toLocaleString('es-MX')} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Desglose Detallado */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
                      <FaListUl className="w-5 h-5 text-indigo-600" />
                      Desglose Detallado
                    </h3>
                    
                    {/* Total General */}
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-indigo-200 dark:border-indigo-700 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">Total General:</span>
                        <span className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                          ${parseFloat(chartData.analisisPorTipoGasto.metrics?.valorTotal || '0').toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Total de suministros:</span>
                        <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                          {chartData.analisisPorTipoGasto.metrics?.cantidadTotal || '0'}
                        </span>
                      </div>
                    </div>

                    {/* Gastos de Proyecto */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-700 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-500 p-2 rounded-lg">
                          <FaBuilding className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-blue-800 dark:text-blue-200">Gastos de Proyecto</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {chartData.analisisPorTipoGasto.metrics?.porcentajeProyecto || '0'}%
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">Porcentaje</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-blue-800 dark:text-blue-200">
                            ${parseFloat(chartData.analisisPorTipoGasto.metrics?.totalProyecto || '0').toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">Total invertido</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-blue-800 dark:text-blue-200">
                            {chartData.analisisPorTipoGasto.metrics?.cantidadProyecto || '0'}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">Items</div>
                        </div>
                        
                      </div>
                    </div>

                    {/* Gastos Administrativos */}
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl border border-emerald-200 dark:border-emerald-700 mb-4">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-emerald-500 p-2 rounded-lg">
                          <FaDesktop className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="text-lg font-bold text-emerald-800 dark:text-emerald-200">Gastos Administrativos</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {chartData.analisisPorTipoGasto.metrics?.porcentajeAdministrativo || '0'}%
                          </div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400">Porcentaje</div>
                        </div>
                        <div>
                          <div className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                            ${parseFloat(chartData.analisisPorTipoGasto.metrics?.totalAdministrativo || '0').toLocaleString('es-MX', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400">Total invertido</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-emerald-800 dark:text-emerald-200">
                            {chartData.analisisPorTipoGasto.metrics?.cantidadAdministrativo || '0'}
                          </div>
                          <div className="text-sm text-emerald-600 dark:text-emerald-400">Items</div>
                        </div>
                        
                      </div>
                    </div>

                    {/* Análisis y Recomendaciones */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-xl border border-amber-200 dark:border-amber-700">
                      <h4 className="text-lg font-bold text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                        <FaChartLine className="w-5 h-5" />
                        Análisis y Recomendaciones
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div>
                          <span className="font-semibold text-amber-700 dark:text-amber-300">Interpretación:</span>
                          <p className="text-amber-600 dark:text-amber-400 mt-1">
                            {chartData.analisisPorTipoGasto.metrics?.interpretacion || 'La distribución de gastos muestra el balance entre inversión en proyectos y costos administrativos.'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-700 dark:text-amber-300">Recomendación:</span>
                          <p className="text-amber-600 dark:text-amber-400 mt-1">
                            {chartData.analisisPorTipoGasto.metrics?.recomendacion || 'Mantener un equilibrio saludable entre gastos operativos y de proyecto para optimizar la rentabilidad.'}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-700 dark:text-amber-300">Balance:</span>
                          <p className="text-amber-600 dark:text-amber-400 mt-1">
                            {chartData.analisisPorTipoGasto.metrics?.balanceString || 'Equilibrado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Suministros;
