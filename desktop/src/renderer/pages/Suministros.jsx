import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaBox,
  FaTruck,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding,
  FaDownload,
  FaEye,
  FaChartBar,
  FaChevronDown,
  FaChevronUp,
  FaChartLine,
  FaChartPie,
  FaClock,
  FaBoxes,
  FaCog,
  FaTimes,
  FaRuler,
  FaCalculator,
  FaReceipt,
  FaFileExcel,
  FaFilePdf,
  FaUpload,
  FaFileDownload
} from 'react-icons/fa';
import { formatCurrency } from '../utils/currency';
import { 
  generateImportTemplate, 
  validateImportData, 
  exportToExcel, 
  exportToPDF, 
  processImportFile 
} from '../utils/exportUtils';
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
import api from '../services/api';
import ProveedorAutocomplete from '../components/common/ProveedorAutocomplete';
import DateInput from '../components/ui/DateInput';
import TimeInput from '../components/ui/TimeInput';
import FormularioSuministros from '../components/FormularioSuministros';
import { useToast } from '../contexts/ToastContext';

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

const CATEGORIAS_SUMINISTRO = {
  'Material': 'Material',
  'Herramienta': 'Herramienta',
  'Equipo Ligero': 'Equipo Ligero',
  'Acero': 'Acero',
  'Cimbra': 'Cimbra',
  'Ferretería': 'Ferretería',
  'Servicio': 'Servicio',
  'Consumible': 'Consumible',
  'Maquinaria': 'Maquinaria',
  'Concreto': 'Concreto'
};

const UNIDADES_MEDIDA = {
  'pz': 'Pieza (pz)',
  'm³': 'Metro cúbico (m³)',
  'm²': 'Metro cuadrado (m²)',
  'm': 'Metro lineal (m)',
  'kg': 'Kilogramo (kg)',
  'ton': 'Tonelada (ton)',
  'lt': 'Litro (lt)',
  'hr': 'Hora (hr)',
  'día': 'Día (día)',
  'caja': 'Caja (caja)',
  'saco': 'Saco (saco)',
  'bote': 'Bote (bote)',
  'rollo': 'Rollo (rollo)',
  'ml': 'Metro lineal (ml)',
  'gl': 'Galón (gl)',
  'jgo': 'Juego (jgo)'
};

const ESTADOS_SUMINISTRO = {
  'Solicitado': { label: 'Solicitado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
  'Aprobado': { label: 'Aprobado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  'Pedido': { label: 'Pedido', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  'En_Transito': { label: 'En Tránsito', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
  'Entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
};

// Helper functions for display
const getDisplayUnidadMedida = (key) => {
  return UNIDADES_MEDIDA[key] || key;
};

const getDisplayCategoria = (key) => {
  return CATEGORIAS_SUMINISTRO[key] || key;
};

const Suministros = () => {
  const [suministros, setSuministros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState(CATEGORIAS_SUMINISTRO);
  const [unidadesMedida, setUnidadesMedida] = useState(UNIDADES_MEDIDA);
  const [loading, setLoading] = useState(true);
  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [editingSuministro, setEditingSuministro] = useState(null);
  const [editingRecibo, setEditingRecibo] = useState(null);
  const [expandedRecibos, setExpandedRecibos] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    proyecto: '',
    proveedor: ''
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
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

  // Hook para notificaciones
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Estados para gráficas
  const [showCharts, setShowCharts] = useState(false);
  const [chartData, setChartData] = useState({
    gastosPorMes: null,
    valorPorCategoria: null,
    suministrosPorMes: null,
    gastosPorProyecto: null,
    gastosPorProveedor: null,
    cantidadPorEstado: null,
    distribucionTipos: null,
    tendenciaEntregas: null,
    codigosProducto: null,
    analisisTecnicoConcreto: null,
    concretoDetallado: null,
    // Nuevas gráficas para horas
    horasPorMes: null,
    horasPorProyecto: null,
    horasPorEquipo: null,
    comparativoHorasVsCosto: null
  });
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
    gastosPorMes: true,
    valorPorCategoria: true,
    suministrosPorMes: true,
    gastosPorProyecto: false,
    gastosPorProveedor: false,
    cantidadPorEstado: false,
    distribucionTipos: false,
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
    analisisUnidadesMedida: false
  });
  const [loadingCharts, setLoadingCharts] = useState(false);
  const [themeVersion, setThemeVersion] = useState(0); // Para forzar re-render cuando cambie el tema

  // Formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '', // Campo de descripción detallada del formulario
    tipo_suministro: 'Material',
    cantidad: '',
    unidad_medida: 'pz', // Valor por defecto
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
      const [suministrosResponse, proyectosResponse, proveedoresResponse] = await Promise.all([
        api.getSuministros(),
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
  }, []);

  // Función para cargar datos de gráficas
  const loadChartData = async () => {
    setLoadingCharts(true);
    try {
      const response = await api.getSuministros();
      if (response.success) {
        const suministrosData = response.data || [];
        
        // Aplicar todos los filtros
        const filteredData = suministrosData.filter(suministro => {
          // Filtro por fechas
          const fechaSuministro = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
          const fechaInicio = new Date(chartFilters.fechaInicio);
          const fechaFin = new Date(chartFilters.fechaFin);
          const matchesFecha = fechaSuministro >= fechaInicio && fechaSuministro <= fechaFin;
          
          // Filtro por proyecto
          const matchesProyecto = !chartFilters.proyectoId || 
                                 suministro.id_proyecto?.toString() === chartFilters.proyectoId;
          
          // Filtro por proveedor
          const matchesProveedor = !chartFilters.proveedorNombre || 
                                  suministro.proveedor?.nombre === chartFilters.proveedorNombre;
          
          // Filtro por tipo de suministro
          const matchesTipo = !chartFilters.tipoSuministro || 
                             (suministro.tipo_suministro || suministro.categoria) === chartFilters.tipoSuministro;
          
          // Filtro por estado
          const matchesEstado = !chartFilters.estado || suministro.estado === chartFilters.estado;
          
          return matchesFecha && matchesProyecto && matchesProveedor && matchesTipo && matchesEstado;
        });


        // Procesar datos para todas las gráficas con manejo de errores individual
        const chartDataProcessed = {};
        
        try {
          chartDataProcessed.gastosPorMes = processGastosPorMes(filteredData);
        } catch (error) {
          console.error('❌ Error en gastosPorMes:', error);
          chartDataProcessed.gastosPorMes = null;
        }

        try {
          chartDataProcessed.valorPorCategoria = processValorPorCategoria(filteredData);
        } catch (error) {
          console.error('❌ Error en valorPorCategoria:', error);
          chartDataProcessed.valorPorCategoria = null;
        }

        try {
          chartDataProcessed.suministrosPorMes = processSuministrosPorMes(filteredData);
        } catch (error) {
          console.error('❌ Error en suministrosPorMes:', error);
          chartDataProcessed.suministrosPorMes = null;
        }

        try {
          chartDataProcessed.gastosPorProyecto = processGastosPorProyecto(filteredData);
        } catch (error) {
          console.error('❌ Error en gastosPorProyecto:', error);
          chartDataProcessed.gastosPorProyecto = null;
        }

        try {
          chartDataProcessed.gastosPorProveedor = processGastosPorProveedor(filteredData);
        } catch (error) {
          console.error('❌ Error en gastosPorProveedor:', error);
          chartDataProcessed.gastosPorProveedor = null;
        }

        try {
          chartDataProcessed.cantidadPorEstado = processCantidadPorEstado(filteredData);
        } catch (error) {
          console.error('❌ Error en cantidadPorEstado:', error);
          chartDataProcessed.cantidadPorEstado = null;
        }

        try {
          chartDataProcessed.distribucionTipos = processDistribucionTipos(filteredData);
        } catch (error) {
          console.error('❌ Error en distribucionTipos:', error);
          chartDataProcessed.distribucionTipos = null;
        }

        try {
          chartDataProcessed.tendenciaEntregas = processTendenciaEntregas(filteredData);
        } catch (error) {
          console.error('❌ Error en tendenciaEntregas:', error);
          chartDataProcessed.tendenciaEntregas = null;
        }

        try {
          chartDataProcessed.codigosProducto = processCodigosProducto(filteredData);
        } catch (error) {
          console.error('❌ Error en codigosProducto:', error);
          chartDataProcessed.codigosProducto = null;
        }

        try {
          chartDataProcessed.analisisTecnicoConcreto = processAnalisisTecnicoInteligente(filteredData);
        } catch (error) {
          console.error('❌ Error en analisisTecnicoConcreto:', error);
          chartDataProcessed.analisisTecnicoConcreto = null;
        }

        try {
          chartDataProcessed.concretoDetallado = processConcretoDetallado(filteredData);
        } catch (error) {
          console.error('❌ Error en concretoDetallado:', error);
          chartDataProcessed.concretoDetallado = null;
        }

        try {
          chartDataProcessed.horasPorMes = processHorasPorMes(filteredData);
        } catch (error) {
          console.error('❌ Error en horasPorMes:', error);
          chartDataProcessed.horasPorMes = null;
        }

        try {
          chartDataProcessed.horasPorProyecto = processHorasPorProyecto(filteredData);
        } catch (error) {
          console.error('❌ Error en horasPorProyecto:', error);
          chartDataProcessed.horasPorProyecto = null;
        }

        try {
          chartDataProcessed.horasPorEquipo = processHorasPorEquipo(filteredData);
        } catch (error) {
          console.error('❌ Error en horasPorEquipo:', error);
          chartDataProcessed.horasPorEquipo = null;
        }

        try {
          chartDataProcessed.comparativoHorasVsCosto = processComparativoHorasVsCosto(filteredData);
        } catch (error) {
          console.error('❌ Error en comparativoHorasVsCosto:', error);
          chartDataProcessed.comparativoHorasVsCosto = null;
        }

        try {
          chartDataProcessed.distribucionUnidades = processDistribucionUnidades(filteredData);
        } catch (error) {
          console.error('❌ Error en distribucionUnidades:', error);
          chartDataProcessed.distribucionUnidades = null;
        }

        try {
          chartDataProcessed.cantidadPorUnidad = processCantidadPorUnidad(filteredData);
        } catch (error) {
          console.error('❌ Error en cantidadPorUnidad:', error);
          chartDataProcessed.cantidadPorUnidad = null;
        }

        try {
          chartDataProcessed.valorPorUnidad = processValorPorUnidad(filteredData);
        } catch (error) {
          console.error('❌ Error en valorPorUnidad:', error);
          chartDataProcessed.valorPorUnidad = null;
        }

        try {
          chartDataProcessed.comparativoUnidades = processComparativoUnidades(filteredData);
        } catch (error) {
          console.error('❌ Error en comparativoUnidades:', error);
          chartDataProcessed.comparativoUnidades = null;
        }

        try {
          chartDataProcessed.totalMetrosCubicos = processTotalMetrosCubicos(filteredData);
        } catch (error) {
          console.error('❌ Error en totalMetrosCubicos:', error);
          chartDataProcessed.totalMetrosCubicos = null;
        }

        try {
          chartDataProcessed.analisisUnidadesMedida = processAnalisisUnidadesMedida(filteredData);
        } catch (error) {
          console.error('❌ Error en analisisUnidadesMedida:', error);
          chartDataProcessed.analisisUnidadesMedida = null;
        }

        setChartData(chartDataProcessed);
      }
    } catch (error) {
      console.error('Error cargando datos de gráficas:', error);
      showError('Error', 'No se pudieron cargar los datos de las gráficas');
    } finally {
      setLoadingCharts(false);
    }
  };

  // Procesar gastos por mes
  const processGastosPorMes = (data) => {
    const gastosPorMes = {};
    const cantidadPorMes = {};
    
    data.forEach(suministro => {
      const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const gasto = cantidad * precio;
      
      if (!gastosPorMes[mesAnio]) {
        gastosPorMes[mesAnio] = 0;
        cantidadPorMes[mesAnio] = 0;
      }
      gastosPorMes[mesAnio] += gasto;
      cantidadPorMes[mesAnio] += cantidad;
    });

    const meses = Object.keys(gastosPorMes).sort();
    const valores = meses.map(mes => Math.round(gastosPorMes[mes] * 100) / 100);
    const cantidades = meses.map(mes => cantidadPorMes[mes]);
    
    // Calcular métricas para insights
    const totalGasto = valores.reduce((sum, val) => sum + val, 0);
    const promedioMensual = totalGasto / meses.length;
    const ultimoMes = valores[valores.length - 1] || 0;
    const mesAnterior = valores[valores.length - 2] || 0;
    const cambioMensual = mesAnterior ? ((ultimoMes - mesAnterior) / mesAnterior * 100) : 0;

    return {
      labels: meses.map(mes => {
        const [año, mesNum] = mes.split('-');
        const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
        return nombreMes;
      }),
      datasets: [{
        label: 'Gasto Total ($)',
        data: valores,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8
      }],
      // Agregar métricas para mostrar en el dashboard
      metrics: {
        totalGasto,
        promedioMensual,
        cambioMensual,
        ultimoMes,
        totalItems: cantidades.reduce((sum, cant) => sum + cant, 0)
      }
    };
  };

  // Procesar valor por categoría
  const processValorPorCategoria = (data) => {
    try {
      const valorPorCategoria = {};
      const cantidadPorCategoria = {};
      
      data.forEach(suministro => {
        try {
          const categoria = suministro.tipo_suministro || suministro.categoria || 'Sin categoría';
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const valor = cantidad * precio;
          
          if (!valorPorCategoria[categoria]) {
            valorPorCategoria[categoria] = 0;
            cantidadPorCategoria[categoria] = 0;
          }
          valorPorCategoria[categoria] += valor;
          cantidadPorCategoria[categoria] += cantidad;
        } catch (itemError) {
          console.error('Error procesando suministro en valorPorCategoria:', itemError, suministro);
        }
      });

      const categorias = Object.keys(valorPorCategoria);
      const valores = categorias.map(cat => Math.round(valorPorCategoria[cat] * 100) / 100);

      if (categorias.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [{
            label: 'Valor Total ($)',
            data: [0],
            backgroundColor: ['rgba(156, 163, 175, 0.8)']
          }]
        };
      }

      // Paleta de colores más profesional y diferenciada
      const coloresProfesionales = [
        'rgba(59, 130, 246, 0.8)',   // Azul principal
        'rgba(16, 185, 129, 0.8)',   // Verde esmeralda
        'rgba(245, 158, 11, 0.8)',   // Ámbar
        'rgba(239, 68, 68, 0.8)',    // Rojo
        'rgba(139, 92, 246, 0.8)',   // Púrpura
        'rgba(236, 72, 153, 0.8)',   // Rosa
        'rgba(14, 165, 233, 0.8)',   // Azul cielo
        'rgba(34, 197, 94, 0.8)',    // Verde
        'rgba(251, 146, 60, 0.8)',   // Naranja
        'rgba(168, 85, 247, 0.8)'    // Violeta
      ];

      const total = valores.reduce((sum, val) => sum + val, 0);
      const categoriaTop = categorias[valores.indexOf(Math.max(...valores))];
      const porcentajeTop = ((Math.max(...valores) / total) * 100).toFixed(1);

      return {
        labels: categorias,
        datasets: [{
          label: 'Valor Total ($)',
          data: valores,
          backgroundColor: coloresProfesionales.slice(0, categorias.length),
          borderColor: coloresProfesionales.slice(0, categorias.length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 15
        }],
        // Métricas adicionales
        metrics: {
          total,
          categoriaTop,
          porcentajeTop,
          totalCategorias: categorias.length,
          cantidadItems: Object.values(cantidadPorCategoria).reduce((sum, cant) => sum + cant, 0)
        }
      };
    } catch (error) {
      console.error('Error procesando valorPorCategoria:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Valor Total ($)',
          data: [0],
          backgroundColor: ['rgba(239, 68, 68, 0.8)']
        }]
      };
    }
  };

  // Procesar cantidad de suministros por mes
  const processSuministrosPorMes = (data) => {
    const suministrosPorMes = {};
    
    data.forEach(suministro => {
      const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!suministrosPorMes[mesAnio]) {
        suministrosPorMes[mesAnio] = 0;
      }
      suministrosPorMes[mesAnio]++;
    });

    const meses = Object.keys(suministrosPorMes).sort();
    const cantidades = meses.map(mes => suministrosPorMes[mes]);

    return {
      labels: meses.map(mes => {
        const [año, mesNum] = mes.split('-');
        const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
        return nombreMes;
      }),
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2
      }]
    };
  };

  // Procesar gastos por proyecto
  const processGastosPorProyecto = (data) => {
    const gastosPorProyecto = {};
    
    data.forEach(suministro => {
      const proyectoId = suministro.id_proyecto;
      const proyectoNombre = proyectos.find(p => p.id_proyecto === proyectoId)?.nombre || `Proyecto ${proyectoId}`;
      
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const gasto = cantidad * precio;
      
      if (!gastosPorProyecto[proyectoNombre]) {
        gastosPorProyecto[proyectoNombre] = 0;
      }
      gastosPorProyecto[proyectoNombre] += gasto;
    });

    const proyectosList = Object.keys(gastosPorProyecto);
    const valores = proyectosList.map(proyecto => Math.round(gastosPorProyecto[proyecto] * 100) / 100);

    return {
      labels: proyectosList,
      datasets: [{
        label: 'Gasto Total ($)',
        data: valores,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Rojo
          'rgba(245, 158, 11, 0.8)',  // Amarillo
          'rgba(16, 185, 129, 0.8)',  // Verde
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(139, 92, 246, 0.8)',  // Púrpura
          'rgba(249, 115, 22, 0.8)',  // Naranja
          'rgba(236, 72, 153, 0.8)',  // Rosa
          'rgba(14, 165, 233, 0.8)'   // Cyan
        ],
        borderWidth: 2
      }]
    };
  };

  // Procesar gastos por proveedor
  const processGastosPorProveedor = (data) => {
    try {
      const gastosPorProveedor = {};
      const cantidadPorProveedor = {};
      
      data.forEach(suministro => {
        try {
          const proveedorNombre = suministro.proveedor?.nombre || 'Sin proveedor';
          
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const gasto = cantidad * precio;
          
          if (!gastosPorProveedor[proveedorNombre]) {
            gastosPorProveedor[proveedorNombre] = 0;
            cantidadPorProveedor[proveedorNombre] = 0;
          }
          gastosPorProveedor[proveedorNombre] += gasto;
          cantidadPorProveedor[proveedorNombre] += cantidad;
        } catch (itemError) {
          console.error('Error procesando suministro en gastosPorProveedor:', itemError, suministro);
        }
      });

      const proveedoresList = Object.keys(gastosPorProveedor);
      const valores = proveedoresList.map(proveedor => Math.round(gastosPorProveedor[proveedor] * 100) / 100);

      if (proveedoresList.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [{
            label: 'Gasto Total ($)',
            data: [0],
            backgroundColor: ['rgba(156, 163, 175, 0.8)']
          }]
        };
      }

      // Colores distintivos para proveedores
      const coloresProveedores = [
        'rgba(34, 197, 94, 0.8)',   // Verde
        'rgba(168, 85, 247, 0.8)',  // Violeta
        'rgba(251, 146, 60, 0.8)',  // Naranja
        'rgba(59, 130, 246, 0.8)',  // Azul
        'rgba(239, 68, 68, 0.8)',   // Rojo
        'rgba(245, 158, 11, 0.8)',  // Amarillo
        'rgba(20, 184, 166, 0.8)',  // Teal
        'rgba(217, 70, 239, 0.8)',  // Magenta
        'rgba(16, 185, 129, 0.8)',  // Esmeralda
        'rgba(139, 92, 246, 0.8)'   // Púrpura
      ];

      const total = valores.reduce((sum, val) => sum + val, 0);
      const proveedorTop = proveedoresList[valores.indexOf(Math.max(...valores))];
      const porcentajeTop = ((Math.max(...valores) / total) * 100).toFixed(1);

      return {
        labels: proveedoresList,
        datasets: [{
          label: 'Gasto Total ($)',
          data: valores,
          backgroundColor: coloresProveedores.slice(0, proveedoresList.length),
          borderColor: coloresProveedores.slice(0, proveedoresList.length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
          hoverBorderWidth: 3
        }],
        // Métricas adicionales
        metrics: {
          total,
          proveedorTop,
          porcentajeTop,
          totalProveedores: proveedoresList.length,
          gastoPromedio: (total / proveedoresList.length).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Error procesando gastosPorProveedor:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Gasto Total ($)',
          data: [0],
          backgroundColor: ['rgba(239, 68, 68, 0.8)']
        }]
      };
    }
  };

  // Procesar cantidad por estado
  const processCantidadPorEstado = (data) => {
    try {
      const cantidadPorEstado = {};
      const suministrosPorEstado = {};
      
      data.forEach(suministro => {
        try {
          const estado = suministro.estado || 'Sin estado';
          
          if (!cantidadPorEstado[estado]) {
            cantidadPorEstado[estado] = 0;
            suministrosPorEstado[estado] = [];
          }
          cantidadPorEstado[estado]++;
          suministrosPorEstado[estado].push(suministro);
        } catch (itemError) {
          console.error('Error procesando suministro en cantidadPorEstado:', itemError, suministro);
        }
      });

      const estados = Object.keys(cantidadPorEstado);
      const cantidades = estados.map(estado => cantidadPorEstado[estado]);

      if (estados.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [{
            label: 'Cantidad de Suministros',
            data: [0],
            backgroundColor: ['rgba(156, 163, 175, 0.8)']
          }]
        };
      }

      // Colores semánticos para estados
      const coloresEstados = {
        'Sin estado': 'rgba(156, 163, 175, 0.8)',    // Gris
        'Solicitado': 'rgba(156, 163, 175, 0.8)',    // Gris
        'Aprobado': 'rgba(59, 130, 246, 0.8)',       // Azul
        'Pedido': 'rgba(245, 158, 11, 0.8)',         // Amarillo
        'En Tránsito': 'rgba(139, 92, 246, 0.8)',    // Púrpura
        'Entregado': 'rgba(16, 185, 129, 0.8)',      // Verde
        'Cancelado': 'rgba(239, 68, 68, 0.8)',       // Rojo
        'Recibido': 'rgba(34, 197, 94, 0.8)',        // Verde claro
        'Pendiente': 'rgba(251, 146, 60, 0.8)'       // Naranja
      };

      const backgroundColors = estados.map(estado => 
        coloresEstados[estado] || 'rgba(107, 114, 128, 0.8)'
      );

      const total = cantidades.reduce((sum, cant) => sum + cant, 0);
      const estadoTop = estados[cantidades.indexOf(Math.max(...cantidades))];
      const porcentajeTop = ((Math.max(...cantidades) / total) * 100).toFixed(1);

      return {
        labels: estados,
        datasets: [{
          label: 'Cantidad de Suministros',
          data: cantidades,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
          borderWidth: 2,
          hoverBorderWidth: 3
        }],
        // Métricas adicionales
        metrics: {
          total,
          estadoTop,
          porcentajeTop,
          totalEstados: estados.length,
          promedioXEstado: (total / estados.length).toFixed(0)
        }
      };
    } catch (error) {
      console.error('Error procesando cantidadPorEstado:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Cantidad de Suministros',
          data: [0],
          backgroundColor: ['rgba(239, 68, 68, 0.8)']
        }]
      };
    }
  };

  // Procesar distribución de tipos
  const processDistribucionTipos = (data) => {
    try {
      const distribucionTipos = {};
      const valorPorTipo = {};
      
      data.forEach(suministro => {
        try {
          const tipo = suministro.tipo_suministro || suministro.categoria || 'Sin tipo';
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const valor = cantidad * precio;
          
          if (!distribucionTipos[tipo]) {
            distribucionTipos[tipo] = 0;
            valorPorTipo[tipo] = 0;
          }
          distribucionTipos[tipo]++;
          valorPorTipo[tipo] += valor;
        } catch (itemError) {
          console.error('Error procesando suministro en distribucionTipos:', itemError, suministro);
        }
      });

      const tipos = Object.keys(distribucionTipos);
      const cantidades = tipos.map(tipo => distribucionTipos[tipo]);

      if (tipos.length === 0) {
        return {
          labels: ['Sin datos'],
          datasets: [{
            label: 'Cantidad de Suministros',
            data: [0],
            backgroundColor: ['rgba(156, 163, 175, 0.8)']
          }]
        };
      }

      // Colores diferenciados para tipos de suministros
      const coloresTipos = [
        'rgba(239, 68, 68, 0.8)',   // Rojo - Material
        'rgba(16, 185, 129, 0.8)',  // Verde - Servicio
        'rgba(59, 130, 246, 0.8)',  // Azul - Equipo
        'rgba(245, 158, 11, 0.8)',  // Amarillo - Herramienta
        'rgba(139, 92, 246, 0.8)',  // Púrpura - Maquinaria
        'rgba(236, 72, 153, 0.8)',  // Rosa - Insumo
        'rgba(20, 184, 166, 0.8)',  // Teal - Repuesto
        'rgba(251, 146, 60, 0.8)',  // Naranja - Consumible
        'rgba(168, 85, 247, 0.8)',  // Violeta - Otro
        'rgba(34, 197, 94, 0.8)'    // Verde esmeralda
      ];

      const total = cantidades.reduce((sum, cant) => sum + cant, 0);
      const tipoTop = tipos[cantidades.indexOf(Math.max(...cantidades))];
      const porcentajeTop = ((Math.max(...cantidades) / total) * 100).toFixed(1);

      return {
        labels: tipos,
        datasets: [{
          label: 'Cantidad de Suministros',
          data: cantidades,
          backgroundColor: coloresTipos.slice(0, tipos.length),
          borderColor: coloresTipos.slice(0, tipos.length).map(color => 
            color.replace('0.8', '1')
          ),
          borderWidth: 2,
          hoverBorderWidth: 3
        }],
        // Métricas adicionales
        metrics: {
          total,
          tipoTop,
          porcentajeTop,
          totalTipos: tipos.length,
          valorTotal: Object.values(valorPorTipo).reduce((sum, val) => sum + val, 0).toFixed(2)
        }
      };
    } catch (error) {
      console.error('Error procesando distribucionTipos:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Cantidad de Suministros',
          data: [0],
          backgroundColor: ['rgba(239, 68, 68, 0.8)']
        }]
      };
    }
  };

  // Procesar tendencia de entregas (suministros entregados por mes)
  const processTendenciaEntregas = (data) => {
    try {
      const entregasPorMes = {};
      const valorEntregadoPorMes = {};
      
      data.filter(suministro => suministro.estado === 'Entregado').forEach(suministro => {
        try {
          const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
          
          if (isNaN(fecha.getTime())) {
            console.warn('Fecha inválida en suministro:', suministro);
            return;
          }
          
          const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
          const cantidad = parseFloat(suministro.cantidad) || 0;
          const precio = parseFloat(suministro.precio_unitario) || 0;
          const valor = cantidad * precio;
          
          if (!entregasPorMes[mesAnio]) {
            entregasPorMes[mesAnio] = 0;
            valorEntregadoPorMes[mesAnio] = 0;
          }
          entregasPorMes[mesAnio]++;
          valorEntregadoPorMes[mesAnio] += valor;
        } catch (itemError) {
          console.error('Error procesando entrega:', itemError, suministro);
        }
      });

      const meses = Object.keys(entregasPorMes).sort();
      const entregas = meses.map(mes => entregasPorMes[mes]);

      if (meses.length === 0) {
        return {
          labels: ['Sin entregas'],
          datasets: [{
            label: 'Entregas Completadas',
            data: [0],
            borderColor: 'rgba(156, 163, 175, 1)',
            backgroundColor: 'rgba(156, 163, 175, 0.2)'
          }]
        };
      }

      const totalEntregas = entregas.reduce((sum, ent) => sum + ent, 0);
      const promedioMensual = (totalEntregas / meses.length).toFixed(1);
      const mesTop = meses[entregas.indexOf(Math.max(...entregas))];
      const maxEntregas = Math.max(...entregas);

      return {
        labels: meses.map(mes => {
          const [año, mesNum] = mes.split('-');
          const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { 
            month: 'short', 
            year: 'numeric' 
          });
          return nombreMes;
        }),
        datasets: [{
          label: 'Entregas Completadas',
          data: entregas,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.2)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgb(16, 185, 129)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }],
        // Métricas adicionales
        metrics: {
          totalEntregas,
          promedioMensual,
          mesTop: mesTop ? new Date(mesTop + '-01').toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : 'N/A',
          maxEntregas,
          mesesActivos: meses.length
        }
      };
    } catch (error) {
      console.error('Error procesando tendenciaEntregas:', error);
      return {
        labels: ['Error'],
        datasets: [{
          label: 'Entregas Completadas',
          data: [0],
          borderColor: 'rgba(239, 68, 68, 1)',
          backgroundColor: 'rgba(239, 68, 68, 0.2)'
        }]
      };
    }
  };

  // Procesar códigos de producto (análisis general)
  const processCodigosProducto = (data) => {
    const codigosPorProducto = {};
    data.forEach(suministro => {
      const codigo = suministro.codigo_producto || 'Sin código';
      if (!codigosPorProducto[codigo]) {
        codigosPorProducto[codigo] = {
          cantidad: 0,
          valor: 0,
          nombre: suministro.nombre || 'Sin nombre'
        };
      }
      codigosPorProducto[codigo].cantidad += parseFloat(suministro.cantidad || 0);
      codigosPorProducto[codigo].valor += parseFloat(suministro.cantidad || 0) * parseFloat(suministro.precio_unitario || 0);
    });

    const codigos = Object.keys(codigosPorProducto).filter(codigo => codigo !== 'Sin código');
    const valores = codigos.map(codigo => Math.round(codigosPorProducto[codigo].valor * 100) / 100);

    // Generar colores automáticamente (HSL)
    const generateColors = (n, alpha = 0.8) => {
      return Array.from({ length: n }, (_, i) => `hsl(${Math.round(360 * i / n)}, 70%, 60%, ${alpha})`);
    };
    const generateBorderColors = (n) => {
      return Array.from({ length: n }, (_, i) => `hsl(${Math.round(360 * i / n)}, 70%, 40%)`);
    };

    const backgroundColor = generateColors(codigos.length);
    const borderColor = generateBorderColors(codigos.length);

    return {
      labels: codigos.map(codigo => `${codigo} (${codigosPorProducto[codigo].nombre})`),
      datasets: [{
        label: 'Valor por Código ($MXN)',
        data: valores,
        backgroundColor,
        borderColor,
        borderWidth: 1
      }]
    };
  };

  // Procesar análisis técnico inteligente según categoría
  const processAnalisisTecnicoInteligente = (data) => {
    // Determinar qué categoría analizar (basado en filtros o la más común)
    const categoriaFiltrada = chartFilters.tipoSuministro;
    let categoriaAnalizar = categoriaFiltrada;
    
    // Si no hay filtro, determinar la categoría principal en los datos
    if (!categoriaAnalizar || categoriaAnalizar === 'Todos') {
      const categorias = {};
      data.forEach(suministro => {
        const cat = suministro.tipo_suministro || suministro.categoria || 'Material';
        categorias[cat] = (categorias[cat] || 0) + 1;
      });
      categoriaAnalizar = Object.keys(categorias).reduce((a, b) => categorias[a] > categorias[b] ? a : b);
    }

    // Filtrar datos por categoría
    const datosCategoria = data.filter(suministro => 
      (suministro.tipo_suministro === categoriaAnalizar || 
       suministro.categoria === categoriaAnalizar)
    );

    if (datosCategoria.length === 0) return null;

    // Determinar unidad de medida principal de la categoría
    const unidadPrincipal = getUnidadPrincipalCategoria(categoriaAnalizar, datosCategoria);
    
    // Procesar análisis específico por categoría
    const analisisPorCodigo = {};
    
    datosCategoria.forEach(suministro => {
      const codigo = suministro.codigo_producto || 'Sin especificación';
      if (!analisisPorCodigo[codigo]) {
        analisisPorCodigo[codigo] = {
          cantidad: 0,
          costo: 0,
          entregas: 0,
          proyectos: new Set(),
          unidad: suministro.unidad_medida || unidadPrincipal,
          nombreCompleto: suministro.nombre || codigo
        };
      }
      analisisPorCodigo[codigo].cantidad += parseFloat(suministro.cantidad || 0);
      analisisPorCodigo[codigo].costo += parseFloat(suministro.cantidad || 0) * parseFloat(suministro.precio_unitario || 0);
      analisisPorCodigo[codigo].entregas += 1;
      if (suministro.id_proyecto) {
        analisisPorCodigo[codigo].proyectos.add(suministro.id_proyecto);
      }
    });

    // Convertir a arrays y ordenar por cantidad
    const especificaciones = Object.keys(analisisPorCodigo)
      .map(codigo => ({
        codigo,
        ...analisisPorCodigo[codigo],
        proyectos: analisisPorCodigo[codigo].proyectos.size
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10); // Top 10

    if (especificaciones.length === 0) return null;

    const etiquetaTitulo = getTituloAnalisisTecnico(categoriaAnalizar, unidadPrincipal);

    return {
      labels: especificaciones.map(item => {
        const codigo = item.codigo.length > 15 ? item.codigo.substring(0, 15) + '...' : item.codigo;
        return codigo;
      }),
      datasets: [
        {
          label: `${etiquetaTitulo.cantidad}`,
          data: especificaciones.map(item => Math.round(item.cantidad * 100) / 100),
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
        }
      ],
      metadata: {
        categoria: categoriaAnalizar,
        unidad: unidadPrincipal,
        titulo: etiquetaTitulo.titulo,
        total: especificaciones.reduce((sum, item) => sum + item.cantidad, 0),
        especificaciones
      }
    };
  };

  // Función auxiliar para determinar la unidad principal de una categoría
  const getUnidadPrincipalCategoria = (categoria, datos) => {
    const unidades = {};
    datos.forEach(suministro => {
      const unidad = suministro.unidad_medida;
      if (unidad) {
        unidades[unidad] = (unidades[unidad] || 0) + 1;
      }
    });
    
    // Unidades por defecto según categoría
    const defaultUnidades = {
      'Concreto': 'm³',
      'Material': 'ton',
      'Herramienta': 'hr',
      'Servicio': 'hr',
      'Equipo': 'hr',
      'Maquinaria': 'hr',
      'Consumible': 'pz'
    };

    return Object.keys(unidades).length > 0 
      ? Object.keys(unidades).reduce((a, b) => unidades[a] > unidades[b] ? a : b)
      : defaultUnidades[categoria] || 'pz';
  };

  // Función auxiliar para obtener títulos apropiados
  const getTituloAnalisisTecnico = (categoria, unidad) => {
    const configuraciones = {
      'Concreto': {
        titulo: 'Análisis Técnico - Volumen de Concreto por Especificación',
        cantidad: `Volumen (${unidad})`
      },
      'Material': {
        titulo: 'Análisis Técnico - Cantidad de Material por Tipo',
        cantidad: `Cantidad (${unidad})`
      },
      'Herramienta': {
        titulo: 'Análisis Técnico - Uso de Herramientas',
        cantidad: `Tiempo de Uso (${unidad})`
      },
      'Servicio': {
        titulo: 'Análisis Técnico - Servicios Contratados',
        cantidad: `Horas de Servicio (${unidad})`
      },
      'Equipo': {
        titulo: 'Análisis Técnico - Uso de Equipos',
        cantidad: `Horas de Operación (${unidad})`
      },
      'Maquinaria': {
        titulo: 'Análisis Técnico - Operación de Maquinaria',
        cantidad: `Horas de Trabajo (${unidad})`
      }
    };

    return configuraciones[categoria] || {
      titulo: `Análisis Técnico - ${categoria}`,
      cantidad: `Cantidad (${unidad})`
    };
  };

  // Procesar concreto detallado (por proveedor y especificación)
  const processConcretoDetallado = (data) => {
    const concretoData = data.filter(suministro => 
      (suministro.tipo_suministro === 'Concreto' || 
       suministro.categoria === 'Concreto' ||
       suministro.nombre?.toLowerCase().includes('concreto'))
    );

    const proveedores = {};
    
    concretoData.forEach(suministro => {
      const proveedor = suministro.proveedor?.nombre || 'Sin proveedor';
      const codigo = suministro.codigo_producto || 'Sin código';
      
      if (!proveedores[proveedor]) {
        proveedores[proveedor] = {};
      }
      if (!proveedores[proveedor][codigo]) {
        proveedores[proveedor][codigo] = 0;
      }
      proveedores[proveedor][codigo] += parseFloat(suministro.cantidad || 0);
    });

    // Crear datasets por proveedor
    const datasets = Object.keys(proveedores).map((proveedor, index) => {
      const colores = [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)', 
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(168, 85, 247, 0.8)'
      ];
      
      const todosLosCodigos = new Set();
      Object.values(proveedores).forEach(prov => {
        Object.keys(prov).forEach(codigo => todosLosCodigos.add(codigo));
      });
      
      return {
        label: proveedor,
        data: Array.from(todosLosCodigos).map(codigo => proveedores[proveedor][codigo] || 0),
        backgroundColor: colores[index % colores.length],
        borderColor: colores[index % colores.length].replace('0.8', '1'),
        borderWidth: 1
      };
    });

    const todosLosCodigos = new Set();
    Object.values(proveedores).forEach(prov => {
      Object.keys(prov).forEach(codigo => todosLosCodigos.add(codigo));
    });

    return {
      labels: Array.from(todosLosCodigos),
      datasets: datasets
    };
  };

  // ======================= FUNCIONES PARA PROCESAR DATOS DE HORAS =======================

  // Procesar horas por mes
  const processHorasPorMes = (data) => {
    const horasPorMes = {};
    
    // Filtrar solo suministros con unidad de medida en horas
    const datosHoras = data.filter(suministro => 
      suministro.unidad_medida === 'hr' || 
      suministro.unidad_medida === 'hora' ||
      suministro.unidad_medida === 'Hora (hr)'
    );
    
    datosHoras.forEach(suministro => {
      const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      const horas = parseFloat(suministro.cantidad) || 0;
      
      if (!horasPorMes[mesAnio]) {
        horasPorMes[mesAnio] = 0;
      }
      horasPorMes[mesAnio] += horas;
    });

    const labels = Object.keys(horasPorMes).sort();
    const chartData = labels.map(mes => horasPorMes[mes]);

    return {
      labels: labels.map(mes => {
        const [año, mesNum] = mes.split('-');
        const fecha = new Date(año, mesNum - 1);
        return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Horas Trabajadas',
        data: chartData,
        backgroundColor: 'rgba(147, 51, 234, 0.8)', // Purple
        borderColor: 'rgba(147, 51, 234, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4
      }]
    };
  };

  // Procesar horas por proyecto
  const processHorasPorProyecto = (data) => {
    const horasPorProyecto = {};
    
    // Filtrar solo suministros con unidad de medida en horas
    const datosHoras = data.filter(suministro => 
      suministro.unidad_medida === 'hr' || 
      suministro.unidad_medida === 'hora' ||
      suministro.unidad_medida === 'Hora (hr)'
    );
    
    datosHoras.forEach(suministro => {
      const proyecto = suministro.proyecto_nombre || suministro.proyectoInfo?.nombre || 'Sin proyecto';
      const horas = parseFloat(suministro.cantidad) || 0;
      
      if (!horasPorProyecto[proyecto]) {
        horasPorProyecto[proyecto] = 0;
      }
      horasPorProyecto[proyecto] += horas;
    });

    const colores = [
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(16, 185, 129, 0.8)',   // Emerald
      'rgba(245, 158, 11, 0.8)',   // Amber
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(139, 92, 246, 0.8)',   // Violet
      'rgba(249, 115, 22, 0.8)'    // Orange
    ];

    return {
      labels: Object.keys(horasPorProyecto),
      datasets: [{
        data: Object.values(horasPorProyecto),
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // Procesar horas por equipo/nombre de suministro
  const processHorasPorEquipo = (data) => {
    const horasPorEquipo = {};
    
    // Filtrar solo suministros con unidad de medida en horas
    const datosHoras = data.filter(suministro => 
      suministro.unidad_medida === 'hr' || 
      suministro.unidad_medida === 'hora' ||
      suministro.unidad_medida === 'Hora (hr)'
    );
    
    datosHoras.forEach(suministro => {
      const equipo = suministro.nombre || 'Sin nombre';
      const horas = parseFloat(suministro.cantidad) || 0;
      
      if (!horasPorEquipo[equipo]) {
        horasPorEquipo[equipo] = 0;
      }
      horasPorEquipo[equipo] += horas;
    });

    // Ordenar por horas descendente y tomar los top 10
    const equiposOrdenados = Object.entries(horasPorEquipo)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: equiposOrdenados.map(([equipo]) => equipo),
      datasets: [{
        label: 'Horas de Uso',
        data: equiposOrdenados.map(([,horas]) => horas),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  };

  // Procesar comparativo horas vs costo
  const processComparativoHorasVsCosto = (data) => {
    const equiposData = {};
    
    // Filtrar solo suministros con unidad de medida en horas
    const datosHoras = data.filter(suministro => 
      suministro.unidad_medida === 'hr' || 
      suministro.unidad_medida === 'hora' ||
      suministro.unidad_medida === 'Hora (hr)'
    );
    
    datosHoras.forEach(suministro => {
      const equipo = suministro.nombre || 'Sin nombre';
      const horas = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const costo = horas * precio;
      
      if (!equiposData[equipo]) {
        equiposData[equipo] = { horas: 0, costo: 0 };
      }
      equiposData[equipo].horas += horas;
      equiposData[equipo].costo += costo;
    });

    // Ordenar por costo descendente y tomar los top 8
    const equiposOrdenados = Object.entries(equiposData)
      .sort(([,a], [,b]) => b.costo - a.costo)
      .slice(0, 8);

    return {
      labels: equiposOrdenados.map(([equipo]) => equipo),
      datasets: [
        {
          label: 'Horas Trabajadas',
          data: equiposOrdenados.map(([,equipoData]) => equipoData.horas),
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Costo Total ($)',
          data: equiposOrdenados.map(([,equipoData]) => equipoData.costo),
          backgroundColor: 'rgba(236, 72, 153, 0.8)', // Pink
          borderColor: 'rgba(236, 72, 153, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // ======================= FUNCIONES PARA PROCESAR DATOS DE UNIDADES DE MEDIDA =======================

  // Procesar distribución por unidades de medida
  const processDistribucionUnidades = (data) => {
    const unidadesPorTipo = {};
    
    data.forEach(suministro => {
      const unidad = suministro.unidad_medida || 'Sin especificar';
      
      if (!unidadesPorTipo[unidad]) {
        unidadesPorTipo[unidad] = 0;
      }
      unidadesPorTipo[unidad] += 1;
    });

    // Ordenar por cantidad descendente
    const unidadesOrdenadas = Object.entries(unidadesPorTipo)
      .sort(([,a], [,b]) => b - a);

    const colores = [
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
    ];

    return {
      labels: unidadesOrdenadas.map(([unidad]) => unidad.toUpperCase()),
      datasets: [{
        data: unidadesOrdenadas.map(([,cantidad]) => cantidad),
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // Procesar cantidad total por unidad de medida
  const processCantidadPorUnidad = (data) => {
    const cantidadesPorUnidad = {};
    
    data.forEach(suministro => {
      const unidad = suministro.unidad_medida || 'Sin especificar';
      const cantidad = parseFloat(suministro.cantidad) || 0;
      
      if (!cantidadesPorUnidad[unidad]) {
        cantidadesPorUnidad[unidad] = 0;
      }
      cantidadesPorUnidad[unidad] += cantidad;
    });

    // Ordenar por cantidad descendente y tomar los top 10
    const unidadesOrdenadas = Object.entries(cantidadesPorUnidad)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);

    return {
      labels: unidadesOrdenadas.map(([unidad]) => unidad.toUpperCase()),
      datasets: [{
        label: 'Cantidad Total',
        data: unidadesOrdenadas.map(([,cantidad]) => cantidad),
        backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false
      }]
    };
  };

  // Procesar valor económico por unidad de medida
  const processValorPorUnidad = (data) => {
    const valoresPorUnidad = {};
    
    data.forEach(suministro => {
      const unidad = suministro.unidad_medida || 'Sin especificar';
      const valor = calculateTotal(suministro);
      
      if (!valoresPorUnidad[unidad]) {
        valoresPorUnidad[unidad] = 0;
      }
      valoresPorUnidad[unidad] += valor;
    });

    // Ordenar por valor descendente
    const unidadesOrdenadas = Object.entries(valoresPorUnidad)
      .sort(([,a], [,b]) => b - a);

    const colores = [
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(168, 85, 247, 0.8)',   // Purple
      'rgba(34, 197, 94, 0.8)',    // Green
      'rgba(251, 146, 60, 0.8)',   // Orange
      'rgba(239, 68, 68, 0.8)',    // Red
      'rgba(6, 182, 212, 0.8)',    // Cyan
      'rgba(132, 204, 22, 0.8)',   // Lime
      'rgba(245, 158, 11, 0.8)'    // Amber
    ];

    return {
      labels: unidadesOrdenadas.map(([unidad]) => unidad.toUpperCase()),
      datasets: [{
        data: unidadesOrdenadas.map(([,valor]) => valor),
        backgroundColor: colores,
        borderColor: colores.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    };
  };

  // Procesar análisis comparativo de unidades (cantidad vs valor)
  const processComparativoUnidades = (data) => {
    const analisisUnidades = {};
    
    data.forEach(suministro => {
      const unidad = suministro.unidad_medida || 'Sin especificar';
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const valor = calculateTotal(suministro);
      
      if (!analisisUnidades[unidad]) {
        analisisUnidades[unidad] = { cantidad: 0, valor: 0, registros: 0 };
      }
      analisisUnidades[unidad].cantidad += cantidad;
      analisisUnidades[unidad].valor += valor;
      analisisUnidades[unidad].registros += 1;
    });

    // Ordenar por valor descendente y tomar los top 8
    const unidadesOrdenadas = Object.entries(analisisUnidades)
      .sort(([,a], [,b]) => b.valor - a.valor)
      .slice(0, 8);

    return {
      labels: unidadesOrdenadas.map(([unidad]) => unidad.toUpperCase()),
      datasets: [
        {
          label: 'Cantidad Total',
          data: unidadesOrdenadas.map(([,data]) => data.cantidad),
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Valor Total ($)',
          data: unidadesOrdenadas.map(([,data]) => data.valor),
          backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  // Procesar total de metros cúbicos de concreto
  const processTotalMetrosCubicos = (data) => {
    const concretoData = data.filter(suministro => 
      (suministro.tipo_suministro === 'Concreto' || 
       suministro.categoria === 'Concreto' ||
       suministro.nombre?.toLowerCase().includes('concreto')) &&
      (suministro.unidad_medida === 'm³')
    );

    // Agrupar por mes
    const metrosPorMes = {};
    
    concretoData.forEach(suministro => {
      const fecha = new Date(suministro.fecha);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      const metros = parseFloat(suministro.cantidad) || 0;
      
      if (!metrosPorMes[mesAnio]) {
        metrosPorMes[mesAnio] = 0;
      }
      metrosPorMes[mesAnio] += metros;
    });

    const labels = Object.keys(metrosPorMes).sort();
    const chartData = labels.map(mes => Math.round(metrosPorMes[mes] * 100) / 100);

    return {
      labels: labels.map(mes => {
        const [año, mesNum] = mes.split('-');
        const fecha = new Date(año, mesNum - 1);
        return fecha.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
      }),
      datasets: [{
        label: 'Metros Cúbicos de Concreto',
        data: chartData,
        backgroundColor: 'rgba(99, 102, 241, 0.8)', // Indigo
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
        borderRadius: 4
      }],
      metadata: {
        total: chartData.reduce((sum, val) => sum + val, 0),
        promedio: chartData.length > 0 ? Math.round((chartData.reduce((sum, val) => sum + val, 0) / chartData.length) * 100) / 100 : 0
      }
    };
  };

  // Procesar análisis general de unidades de medida
  const processAnalisisUnidadesMedida = (data) => {
    // Obtener la categoría filtrada actual
    const categoriaFiltrada = chartFilters.tipoSuministro;
    
    // Filtrar datos por categoría si hay filtro específico
    let datosAnalizar = data;
    if (categoriaFiltrada && categoriaFiltrada !== 'Todos') {
      datosAnalizar = data.filter(suministro => 
        suministro.tipo_suministro === categoriaFiltrada || 
        suministro.categoria === categoriaFiltrada
      );
    }

    const analisisUnidades = {};
    
    datosAnalizar.forEach(suministro => {
      const unidad = suministro.unidad_medida || 'Sin especificar';
      const cantidad = parseFloat(suministro.cantidad) || 0;
      
      if (!analisisUnidades[unidad]) {
        analisisUnidades[unidad] = {
          cantidad: 0,
          registros: 0,
          categorias: new Set()
        };
      }
      analisisUnidades[unidad].cantidad += cantidad;
      analisisUnidades[unidad].registros += 1;
      analisisUnidades[unidad].categorias.add(suministro.tipo_suministro || suministro.categoria || 'Sin categoría');
    });

    // Convertir a array y ordenar por cantidad
    const unidadesOrdenadas = Object.entries(analisisUnidades)
      .map(([unidad, data]) => ({
        unidad,
        cantidad: Math.round(data.cantidad * 100) / 100,
        registros: data.registros,
        categorias: Array.from(data.categorias).join(', ')
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10);

    if (unidadesOrdenadas.length === 0) return null;

    const colores = [
      'rgba(99, 102, 241, 0.8)',   // Indigo
      'rgba(34, 197, 94, 0.8)',    // Green
      'rgba(59, 130, 246, 0.8)',   // Blue
      'rgba(245, 101, 101, 0.8)',  // Red
      'rgba(251, 191, 36, 0.8)',   // Yellow
      'rgba(139, 92, 246, 0.8)',   // Purple
      'rgba(236, 72, 153, 0.8)',   // Pink
      'rgba(14, 165, 233, 0.8)',   // Sky
      'rgba(34, 197, 94, 0.8)',    // Emerald
      'rgba(168, 85, 247, 0.8)'    // Violet
    ];

    return {
      labels: unidadesOrdenadas.map(item => `${item.unidad}\n(${item.registros} registros)`),
      datasets: [{
        label: 'Cantidad por Unidad',
        data: unidadesOrdenadas.map(item => item.cantidad),
        backgroundColor: colores.slice(0, unidadesOrdenadas.length),
        borderColor: colores.slice(0, unidadesOrdenadas.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 4
      }],
      metadata: {
        categoria: categoriaFiltrada || 'Todas las categorías',
        totalUnidades: unidadesOrdenadas.length,
        detalles: unidadesOrdenadas
      }
    };
  };

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
          afterBody: function(context) {
            if (metrics.total) {
              const percentage = ((context[0].parsed.y / metrics.total) * 100).toFixed(1);
              return [
                `Porcentaje del total: ${percentage}%`,
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
            return new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: 'MXN',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(value);
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
                const percentage = ((value / total) * 100).toFixed(1);
                return {
                  text: `${label}: ${percentage}%`,
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
            return `${label}: ${value} (${percentage}%)`;
          },
          afterLabel: function(context) {
            if (metrics.total) {
              return `Total general: ${metrics.total}`;
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
  const MetricsDisplay = ({ title, metrics, icon: Icon, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
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
                label = 'Total';
                displayValue = typeof value === 'number' ? 
                  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : 
                  value;
                break;
              case 'promedio':
              case 'gastoPromedio':
                label = 'Promedio';
                displayValue = typeof value === 'number' ? 
                  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : 
                  value;
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
                displayValue = `${value}%`;
                break;
              case 'totalCategorias':
                label = 'Categorías';
                break;
              case 'totalProveedores':
                label = 'Proveedores';
                break;
              case 'totalTipos':
                label = 'Tipos';
                break;
              case 'totalEstados':
                label = 'Estados';
                break;
              case 'mesesActivos':
                label = 'Meses';
                break;
              case 'totalEntregas':
                label = 'Entregas';
                break;
              case 'promedioMensual':
                label = 'Promedio/Mes';
                break;
              case 'maxEntregas':
                label = 'Máx/Mes';
                break;
              case 'valorTotal':
                label = 'Valor Total';
                displayValue = typeof value === 'number' ? 
                  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value) : 
                  `$${value}`;
                break;
              case 'cantidadItems':
                label = 'Items';
                break;
              case 'promedioXEstado':
                label = 'Prom/Estado';
                break;
              default:
                label = key.charAt(0).toUpperCase() + key.slice(1);
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

  // Cargar gráficas cuando se cambian los filtros
  useEffect(() => {
    if (showCharts) {
      loadChartData();
    }
  }, [chartFilters, showCharts]);

  // Función para verificar duplicados - SOLO POR FOLIO
  const checkForDuplicates = (newSuministro) => {
    // Solo verificar duplicados si hay folio
    if (!newSuministro.folio || newSuministro.folio.trim() === '') {
      return []; // Sin folio, no hay duplicados que verificar
    }

    const duplicates = suministros.filter(suministro => {
      // Si estamos editando, excluir el suministro actual de la verificación
      if (editingSuministro && suministro.id_suministro === editingSuministro.id_suministro) {
        return false;
      }

      // ÚNICO CRITERIO: Folio del proveedor
      return suministro.folio && 
             suministro.folio.toLowerCase().trim() === newSuministro.folio.toLowerCase().trim();
    });

    return duplicates;
  };

  // Función para buscar sugerencias de duplicados en tiempo real - SOLO POR FOLIO
  const searchDuplicateSuggestions = useCallback((nombre, codigo_producto, folio) => {
    // Solo mostrar advertencias para folios duplicados EXACTOS
    if (!folio || folio.trim() === '') {
      setDuplicatesSuggestions([]);
      setShowDuplicatesWarning(false);
      return;
    }

    const suggestions = suministros.filter(suministro => {
      // Excluir el suministro actual si estamos editando
      if (editingSuministro && suministro.id_suministro === editingSuministro.id_suministro) {
        return false;
      }

      // CRITERIO MÁS ESTRICTO: Solo folios que coincidan exactamente o sean muy similares
      return suministro.folio && 
             suministro.folio.toLowerCase().trim() === folio.toLowerCase().trim();
    }).slice(0, 5); // Limitar a 5 sugerencias

    setDuplicatesSuggestions(suggestions);
    setShowDuplicatesWarning(suggestions.length > 0);
  }, [suministros, editingSuministro]);

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
      tipo_suministro: templateSuministro.tipo_suministro || 'Material',
      unidad_medida: templateSuministro.unidad_medida || 'pz',
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
    
    suministrosList.forEach(suministro => {
      // Crear clave única para el recibo basada en proveedor, fecha y folio
      const proveedor = suministro.proveedor?.nombre || 'Sin proveedor';
      const fecha = suministro.fecha || 'Sin fecha';
      const folio = suministro.folio || '';
      const proyecto = suministro.proyecto?.nombre || 'Sin proyecto';
      
      const claveRecibo = `${proveedor}_${fecha}_${folio}_${proyecto}`;
      
      if (!grupos[claveRecibo]) {
        grupos[claveRecibo] = {
          id: claveRecibo,
          proveedor,
          fecha,
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
    });
    
    // Marcar grupos con más de 1 suministro como jerárquicos
    Object.values(grupos).forEach(grupo => {
      if (grupo.suministros.length > 1) {
        grupo.isHierarchical = true;
      }
    });
    
    return Object.values(grupos).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
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
        unidad_medida: formData.unidad_medida,
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
          showSuccess(
            'Suministro actualizado',
            `${submitData.nombre} ha sido actualizado correctamente`
          );
        }
      } else {
        response = await api.createSuministro(submitData);
        if (response.success) {
          showSuccess(
            'Suministro creado',
            `${submitData.nombre} ha sido registrado exitosamente`
          );
        }
      }

      if (response.success) {
        await loadData();
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
            if (suministroData.unidad_medida) {
              newItem.unidad_medida = suministroData.unidad_medida;
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
    if (!confirm(`¿Está seguro de que desea eliminar el grupo de ${recibo.suministros.length} suministros? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      // Eliminar todos los suministros del grupo
      for (const suministro of recibo.suministros) {
        await api.deleteSuministro(suministro.id_suministro);
      }

      showSuccess(
        'Grupo eliminado',
        `Se han eliminado ${recibo.suministros.length} suministros correctamente`,
        { duration: 4000 }
      );
      
      await loadData();
    } catch (error) {
      console.error('Error eliminando grupo:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
      showError(
        'Error al eliminar',
        `No se pudo eliminar el grupo: ${errorMessage}`
      );
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

  const handleDelete = async (id) => {
    // Encontrar el suministro para mostrar su nombre en la notificación
    const suministro = suministros.find(s => s.id_suministro === id);
    const nombreSuministro = suministro?.nombre || 'el suministro';

    if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombreSuministro}"?`)) {
      try {
        const response = await api.deleteSuministro(id);
        if (response.success) {
          showSuccess(
            'Suministro eliminado',
            `${nombreSuministro} ha sido eliminado correctamente`
          );
          await loadData();
        }
      } catch (error) {
        console.error('Error eliminando suministro:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error desconocido';
        showError(
          'Error al eliminar',
          `No se pudo eliminar ${nombreSuministro}: ${errorMessage}`
        );
      }
    }
  };

  // Funciones para exportar/importar
  const handleDownloadTemplate = async () => {
    try {
      await generateImportTemplate();
      showSuccess('Plantilla descargada', 'La plantilla Excel ha sido descargada correctamente');
    } catch (error) {
      console.error('Error descargando plantilla:', error);
      showError('Error', 'No se pudo descargar la plantilla');
    }
  };

  const handleExportToExcel = async () => {
    try {
      const dataToExport = filteredSuministros.map(suministro => ({
        ...suministro,
        proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
      }));
      
      await exportToExcel(dataToExport);
      showSuccess('Exportación exitosa', 'Los suministros han sido exportados a Excel');
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      showError('Error', 'No se pudo exportar a Excel');
    }
  };

  const handleExportToPDF = async () => {
    try {
      const dataToExport = filteredSuministros.map(suministro => ({
        ...suministro,
        proyecto: proyectos.find(p => p.id_proyecto === suministro.id_proyecto)?.nombre || '',
        proveedor: proveedores.find(p => p.id_proveedor === suministro.id_proveedor)?.nombre || ''
      }));
      
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
              proveedor: item.proveedor_nombre
            },
            suministros: []
          };
        }
        
        groupedByRecibo[key].suministros.push({
          nombre: item.nombre,
          codigo_producto: item.codigo_producto,
          descripcion_detallada: item.descripcion_detallada,
          tipo_suministro: item.tipo_suministro,
          cantidad: item.cantidad,
          unidad_medida: item.unidad_medida,
          precio_unitario: item.precio_unitario,
          estado: item.estado
        });
      });

      // Procesar cada grupo de recibo
      for (const key in groupedByRecibo) {
        const group = groupedByRecibo[key];
        
        try {
          const response = await fetch('http://localhost:5000/api/suministros', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              suministros: group.suministros,
              recibo: group.recibo
            }),
          });

          if (response.ok) {
            successCount += group.suministros.length;
          } else {
            console.error('Error en respuesta:', await response.text());
            errorCount += group.suministros.length;
          }
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
      tipo_suministro: 'Material',
      cantidad: '',
      unidad_medida: 'pz',
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

  const filteredSuministros = suministros.filter(suministro => {
    const matchesSearch = suministro.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.descripcion_detallada?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.folio?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !filters.categoria || (suministro.tipo_suministro || suministro.categoria) === filters.categoria;
    const matchesEstado = !filters.estado || suministro.estado === filters.estado;
    const matchesProyecto = !filters.proyecto || suministro.id_proyecto?.toString() === filters.proyecto;
    const matchesProveedor = !filters.proveedor || 
                            suministro.proveedor === filters.proveedor ||
                            suministro.proveedor?.nombre === filters.proveedor;

    return matchesSearch && matchesCategoria && matchesEstado && matchesProyecto && matchesProveedor;
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
    
    suministros.forEach((suministro) => {
      totalGastado += calculateTotal(suministro);
    });

    const totalSuministros = suministros.length;
    
    const proyectosUnicos = new Set(suministros.map(s => s.id_proyecto).filter(id => id)).size;
    
    const proveedoresUnicos = new Set(suministros.map(s => s.id_proveedor).filter(id => id)).size;

    return {
      totalGastado: Math.round(totalGastado * 100) / 100,
      totalSuministros,
      proyectosUnicos,
      proveedoresUnicos
    };
  };

  // Calcular estadísticas de la vista actual (solo registros filtrados)
  const calculateFilteredStats = () => {
    let totalGastadoFiltrado = 0;
    
    filteredSuministros.forEach((suministro) => {
      totalGastadoFiltrado += calculateTotal(suministro);
    });

    return {
      totalGastadoFiltrado: Math.round(totalGastadoFiltrado * 100) / 100,
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Suministros</h1>
        <p className="text-gray-600 dark:text-gray-400">{import.meta.env.VITE_APP_DESCRIPTION || 'Administra materiales, herramientas y equipos para proyectos'}</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Gastado */}
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm font-medium mb-1">Total Gastado</p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalGastado)}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FaDollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Total Suministros */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium mb-1">Total Suministros</p>
              <p className="text-2xl font-bold">
                {stats.totalSuministros.toLocaleString()}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FaBox className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Proyectos Activos */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium mb-1">Proyectos</p>
              <p className="text-2xl font-bold">
                {stats.proyectosUnicos}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FaBuilding className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Proveedores */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Proveedores</p>
              <p className="text-2xl font-bold">
                {stats.proveedoresUnicos}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <FaTruck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Información de filtros activos */}
      {(searchTerm || filters.categoria || filters.estado || filters.proyecto || filters.proveedor) && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <span className="text-blue-700 dark:text-blue-300 font-medium">Vista filtrada:</span>
              <span className="text-blue-600 dark:text-blue-400">
                {filteredStats.totalSuministrosFiltrados} suministros
              </span>
              <span className="text-blue-600 dark:text-blue-400">
                Total: {formatCurrency(filteredStats.totalGastadoFiltrado)}
              </span>
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilters({ categoria: '', estado: '', proyecto: '', proveedor: '' });
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              <FaTimes className="h-3 w-3" />
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Controles superiores */}
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="flex flex-col xl:flex-row gap-2 items-center justify-between">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 max-w-sm">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, código, folio o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap gap-2 items-left">
            <select
              value={filters.categoria}
              onChange={(e) => setFilters({...filters, categoria: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Todas las categorías</option>
              {Object.entries(CATEGORIAS_SUMINISTRO).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.proveedor}
              onChange={(e) => setFilters({...filters, proveedor: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
            >
              <option value="">Todos los proveedores</option>
              {proveedores.map((proveedor) => (
                <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                  {proveedor.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FaChartBar className="w-4 h-4" />
              {showCharts ? 'Ocultar Gráficas' : 'Ver Gráficas'}
              {showCharts ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => setShowMultipleModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FaPlus className="w-4 h-4" />
              Nuevo Suministro
            </button>
          </div>
        </div>
      </div>

      {/* Sección de Gráficas */}
      {showCharts && (
        <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Análisis Personalizado de Suministros</h2>
            
            {/* Panel de Filtros Avanzados */}
            <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FaFilter className="w-5 h-5 mr-2" />
                Filtros de Análisis
              </h3>
              
              {/* Fila 1: Fechas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Inicio</label>
                  <DateInput
                    value={chartFilters.fechaInicio}
                    onChange={(value) => setChartFilters({...chartFilters, fechaInicio: value})}
                    placeholder="Fecha inicial"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fecha Fin</label>
                  <DateInput
                    value={chartFilters.fechaFin}
                    onChange={(value) => setChartFilters({...chartFilters, fechaFin: value})}
                    placeholder="Fecha final"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proyecto</label>
                  <select
                    value={chartFilters.proyectoId}
                    onChange={(e) => setChartFilters({...chartFilters, proyectoId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Todos los proyectos</option>
                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id_proyecto} value={proyecto.id_proyecto.toString()}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Proveedor</label>
                  <select
                    value={chartFilters.proveedorNombre}
                    onChange={(e) => setChartFilters({...chartFilters, proveedorNombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Todos los proveedores</option>
                    {proveedores.map((proveedor) => (
                      <option key={proveedor.id_proveedor} value={proveedor.nombre}>
                        {proveedor.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fila 2: Tipo, Estado y más filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Suministro</label>
                  <select
                    value={chartFilters.tipoSuministro}
                    onChange={(e) => setChartFilters({...chartFilters, tipoSuministro: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Todos los tipos</option>
                    {Object.entries(CATEGORIAS_SUMINISTRO).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estado</label>
                  <select
                    value={chartFilters.estado}
                    onChange={(e) => setChartFilters({...chartFilters, estado: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="">Todos los estados</option>
                    {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <button
                    onClick={loadChartData}
                    className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200"
                  >
                    {loadingCharts ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSearch className="w-4 h-4" />
                    )}
                    Generar Análisis
                  </button>
                </div>
              </div>

              {/* Selector de Gráficas a Mostrar - Diseño Compacto */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white flex items-center">
                    <FaChartBar className="mr-2 h-4 w-4" />
                    Gráficas a Mostrar
                  </h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCharts({
                        gastosPorMes: true,
                        valorPorCategoria: true,
                        suministrosPorMes: true,
                        gastosPorProyecto: true,
                        gastosPorProveedor: true,
                        cantidadPorEstado: true,
                        distribucionTipos: true,
                        tendenciaEntregas: true,
                        codigosProducto: true,
                        analisisTecnicoConcreto: true,
                        concretoDetallado: true,
                        horasPorMes: true,
                        horasPorProyecto: true,
                        horasPorEquipo: true,
                        comparativoHorasVsCosto: true,
                        distribucionUnidades: true,
                        cantidadPorUnidad: true,
                        valorPorUnidad: true,
                        comparativoUnidades: true,
                        totalMetrosCubicos: true,
                        analisisUnidadesMedida: true
                      })}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
                    >
                      Todas
                    </button>
                    <button
                      onClick={() => setSelectedCharts({
                        gastosPorMes: false,
                        valorPorCategoria: false,
                        suministrosPorMes: false,
                        gastosPorProyecto: false,
                        gastosPorProveedor: false,
                        cantidadPorEstado: false,
                        distribucionTipos: false,
                        tendenciaEntregas: false,
                        codigosProducto: false,
                        analisisTecnicoConcreto: false,
                        concretoDetallado: false,
                        horasPorMes: false,
                        horasPorProyecto: false,
                        horasPorEquipo: false,
                        comparativoHorasVsCosto: false,
                        distribucionUnidades: false,
                        cantidadPorUnidad: false,
                        valorPorUnidad: false,
                        comparativoUnidades: false,
                        totalMetrosCubicos: false,
                        analisisUnidadesMedida: false
                      })}
                      className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-md transition-colors font-medium"
                    >
                      Ninguna
                    </button>
                  </div>
                </div>
                
                {/* Gráficas Principales - Grid Compacto */}
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <FaDollarSign className="mr-1.5 h-3.5 w-3.5" />
                      Análisis Financiero
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.gastosPorMes}
                          onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorMes: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Gastos por Mes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.valorPorCategoria}
                          onChange={(e) => setSelectedCharts({...selectedCharts, valorPorCategoria: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Valor por Categoría</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.gastosPorProyecto}
                          onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorProyecto: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Gastos por Proyecto</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.gastosPorProveedor}
                          onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorProveedor: e.target.checked})}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Gastos por Proveedor</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <FaBoxes className="mr-1.5 h-3.5 w-3.5" />
                      Análisis de Cantidad y Estado
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.suministrosPorMes}
                          onChange={(e) => setSelectedCharts({...selectedCharts, suministrosPorMes: e.target.checked})}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cantidad por Mes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.cantidadPorEstado}
                          onChange={(e) => setSelectedCharts({...selectedCharts, cantidadPorEstado: e.target.checked})}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cantidad por Estado</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.distribucionTipos}
                          onChange={(e) => setSelectedCharts({...selectedCharts, distribucionTipos: e.target.checked})}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Distribución de Tipos</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.tendenciaEntregas}
                          onChange={(e) => setSelectedCharts({...selectedCharts, tendenciaEntregas: e.target.checked})}
                          className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Tendencia de Entregas</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <FaCog className="mr-1.5 h-3.5 w-3.5" />
                      Análisis Técnico
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.codigosProducto}
                          onChange={(e) => setSelectedCharts({...selectedCharts, codigosProducto: e.target.checked})}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Códigos de Producto</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.analisisTecnicoConcreto}
                          onChange={(e) => setSelectedCharts({...selectedCharts, analisisTecnicoConcreto: e.target.checked})}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Análisis Técnico</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.concretoDetallado}
                          onChange={(e) => setSelectedCharts({...selectedCharts, concretoDetallado: e.target.checked})}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Concreto Detallado</span>
                      </label>
                    </div>
                  </div>

                  {/* Sección de Análisis por Unidades */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800">
                    <h5 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2 flex items-center">
                      <FaRuler className="mr-1.5 h-3.5 w-3.5" />
                      Análisis por Unidades de Medida
                    </h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.totalMetrosCubicos}
                          onChange={(e) => setSelectedCharts({...selectedCharts, totalMetrosCubicos: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Total m³ (Concreto)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.analisisUnidadesMedida}
                          onChange={(e) => setSelectedCharts({...selectedCharts, analisisUnidadesMedida: e.target.checked})}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Distribución por Unidades</span>
                      </label>
                    </div>
                  </div>

                  {/* Sección de Gráficas de Horas */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h5 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-2 flex items-center">
                      <FaClock className="mr-1.5 h-3.5 w-3.5" />
                      Análisis de Horas (Maquinaria y Equipos)
                    </h5>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.horasPorMes}
                          onChange={(e) => setSelectedCharts({...selectedCharts, horasPorMes: e.target.checked})}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Horas por Mes</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.horasPorProyecto}
                          onChange={(e) => setSelectedCharts({...selectedCharts, horasPorProyecto: e.target.checked})}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Horas por Proyecto</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.horasPorEquipo}
                          onChange={(e) => setSelectedCharts({...selectedCharts, horasPorEquipo: e.target.checked})}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Top Equipos por Horas</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.comparativoHorasVsCosto}
                          onChange={(e) => setSelectedCharts({...selectedCharts, comparativoHorasVsCosto: e.target.checked})}
                          className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Horas vs Costo</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Análisis de Unidades de Medida */}
              <div className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 border border-teal-200 dark:border-teal-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FaCog className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  <h4 className="font-medium text-teal-800 dark:text-teal-200">Análisis de Unidades de Medida</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.distribucionUnidades}
                          onChange={(e) => setSelectedCharts({...selectedCharts, distribucionUnidades: e.target.checked})}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Distribución por Unidades</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.cantidadPorUnidad}
                          onChange={(e) => setSelectedCharts({...selectedCharts, cantidadPorUnidad: e.target.checked})}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cantidad por Unidad</span>
                      </label>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.valorPorUnidad}
                          onChange={(e) => setSelectedCharts({...selectedCharts, valorPorUnidad: e.target.checked})}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Valor por Unidad</span>
                      </label>
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCharts.comparativoUnidades}
                          onChange={(e) => setSelectedCharts({...selectedCharts, comparativoUnidades: e.target.checked})}
                          className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">Cantidad vs Valor</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Gráficas Dinámicas */}
            {loadingCharts ? (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Placeholders de carga para mantener el layout */}
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse"></div>
                    <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                
                {/* Gráfica de Gastos por Mes */}
                {selectedCharts.gastosPorMes && chartData.gastosPorMes && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gastos por Mes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Evolución temporal de los gastos en suministros
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <MetricsDisplay 
                      title="Gastos Mensuales"
                      metrics={chartData.gastosPorMes.metrics}
                      icon={FaChartBar}
                      color="blue"
                    />
                    
                    <div className="h-80">
                      <Line 
                        key={`gastos-${themeVersion}`}
                        data={chartData.gastosPorMes} 
                        options={getLineChartOptions("Gastos por Mes", chartData.gastosPorMes.metrics)}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Valor por Categoría */}
                {selectedCharts.valorPorCategoria && chartData.valorPorCategoria && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Valor Total por Categoría</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Distribución de inversión por categoría de suministros
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <MetricsDisplay 
                      title="Inversión por Categoría"
                      metrics={chartData.valorPorCategoria.metrics}
                      icon={FaChartBar}
                      color="green"
                    />
                    
                    <div className="h-80">
                      <Doughnut 
                        key={`categoria-${themeVersion}`}
                        data={chartData.valorPorCategoria} 
                        options={getDoughnutChartOptions("Valor por Categoría", chartData.valorPorCategoria.metrics)}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Suministros por Mes */}
                {selectedCharts.suministrosPorMes && chartData.suministrosPorMes && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suministros Solicitados por Mes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Número de suministros por período
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar 
                        key={`suministros-${themeVersion}`}
                        data={chartData.suministrosPorMes} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              borderColor: 'rgba(139, 92, 246, 0.5)',
                              borderWidth: 2,
                              cornerRadius: 12,
                              padding: 16,
                              titleFont: { size: 14, weight: '600' },
                              bodyFont: { size: 13, weight: '500' },
                              callbacks: {
                                label: function(context) {
                                  return `Cantidad: ${context.parsed.y} suministros`;
                                }
                              }
                            }
                          },
                          elements: {
                            bar: { borderRadius: 8, borderSkipped: false }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' },
                                stepSize: 1
                              },
                              grid: { 
                                color: getChartColors().gridColor,
                                lineWidth: 1,
                                drawBorder: false
                              }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor, 
                                font: { size: 12, weight: '500' } 
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Gastos por Proyecto */}
                {selectedCharts.gastosPorProyecto && chartData.gastosPorProyecto && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gastos por Proyecto</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Inversión por proyecto
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar 
                        key={`proyectos-${themeVersion}`}
                        data={chartData.gastosPorProyecto} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              borderColor: 'rgba(249, 115, 22, 0.5)',
                              borderWidth: 2,
                              cornerRadius: 12,
                              padding: 16,
                              titleFont: { size: 14, weight: '600' },
                              bodyFont: { size: 13, weight: '500' },
                              callbacks: {
                                label: function(context) {
                                  return `Gasto: $${context.parsed.y.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}`;
                                }
                              }
                            }
                          },
                          elements: {
                            bar: { borderRadius: 8, borderSkipped: false }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' },
                                callback: function(value) {
                                  return '$' + value.toLocaleString('es-MX');
                                }
                              },
                              grid: { 
                                color: getChartColors().gridColor,
                                lineWidth: 1,
                                drawBorder: false
                              }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor, 
                                font: { size: 12, weight: '500' } 
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Gastos por Proveedor */}
                {selectedCharts.gastosPorProveedor && chartData.gastosPorProveedor && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Gastos por Proveedor</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Distribución de gastos por empresa proveedora
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <MetricsDisplay 
                      title="Proveedores"
                      metrics={chartData.gastosPorProveedor.metrics}
                      icon={FaChartBar}
                      color="purple"
                    />
                    
                    <div className="h-80">
                      <Doughnut 
                        key={`proveedores-${themeVersion}`}
                        data={chartData.gastosPorProveedor} 
                        options={getDoughnutChartOptions("Gastos por Proveedor", chartData.gastosPorProveedor.metrics)}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Cantidad por Estado */}
                {selectedCharts.cantidadPorEstado && chartData.cantidadPorEstado && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cantidad por Estado</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Distribución de suministros según su estado actual
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <MetricsDisplay 
                      title="Estados"
                      metrics={chartData.cantidadPorEstado.metrics}
                      icon={FaChartBar}
                      color="amber"
                    />
                    
                    <div className="h-80">
                      <Bar 
                        key={`estados-${themeVersion}`}
                        data={chartData.cantidadPorEstado} 
                        options={getBarChartOptions("Cantidad por Estado", chartData.cantidadPorEstado.metrics)}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Distribución de Tipos */}
                {selectedCharts.distribucionTipos && chartData.distribucionTipos && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg relative">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Tipo de Suministro</h3>
                    {/* Badge de total */}
                    <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold px-3 py-1 rounded shadow">
                      Total: {chartData.distribucionTipos.datasets[0].data.reduce((a, b) => a + b, 0)} suministros
                    </div>
                    <div className="h-64">
                      <Doughnut 
                        key={`tipos-${themeVersion}`}
                        data={chartData.distribucionTipos} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: getChartColors().textColor,
                                padding: 15,
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                                  return `${context.label}: ${context.parsed} suministros (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Tendencia de Entregas */}
                {selectedCharts.tendenciaEntregas && chartData.tendenciaEntregas && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg relative">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencia de Entregas Completadas</h3>
                    {/* Badge de total */}
                    <div className="absolute top-4 right-4 bg-green-100 dark:bg-green-900/60 text-green-800 dark:text-green-200 text-xs font-bold px-3 py-1 rounded shadow">
                      Total: {chartData.tendenciaEntregas.datasets.reduce((sum, dataset) => sum + dataset.data.reduce((a, b) => a + b, 0), 0)} entregas
                    </div>
                    <div className="h-64">
                      <Line 
                        key={`entregas-${themeVersion}`}
                        data={chartData.tendenciaEntregas} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y} entregas`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                stepSize: 1
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            x: {
                              ticks: { color: getChartColors().textColor },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Códigos de Producto */}
                {selectedCharts.codigosProducto && chartData.codigosProducto && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análisis por Códigos de Producto</h3>
                    <div className="h-64">
                      <Doughnut 
                        key={`codigos-${themeVersion}`}
                        data={chartData.codigosProducto} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                color: getChartColors().textColor,
                                font: { size: 10, weight: '500' },
                                usePointStyle: true,
                                pointStyle: 'circle'
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  const value = new Intl.NumberFormat('es-MX', { 
                                    style: 'currency', 
                                    currency: 'MXN' 
                                  }).format(context.parsed);
                                  return `${context.label}: ${value}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Análisis Técnico */}
                {selectedCharts.analisisTecnicoConcreto && chartData.analisisTecnicoConcreto && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {chartData.analisisTecnicoConcreto.metadata?.titulo || 'Análisis Técnico'}
                      </h3>
                      {chartData.analisisTecnicoConcreto.metadata && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                            {chartData.analisisTecnicoConcreto.metadata.categoria}
                          </span>
                          <span className="ml-2">
                            Total: {Math.round(chartData.analisisTecnicoConcreto.metadata.total * 100) / 100} {chartData.analisisTecnicoConcreto.metadata.unidad}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="h-64">
                      <Bar 
                        key={`analisis-concreto-${themeVersion}`}
                        data={chartData.analisisTecnicoConcreto} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                title: function(context) {
                                  const especificaciones = chartData.analisisTecnicoConcreto.metadata?.especificaciones;
                                  const item = especificaciones?.[context[0].dataIndex];
                                  return item?.nombreCompleto || context[0].label;
                                },
                                label: function(context) {
                                  const unidad = chartData.analisisTecnicoConcreto.metadata?.unidad || 'unidad';
                                  const especificaciones = chartData.analisisTecnicoConcreto.metadata?.especificaciones;
                                  const item = especificaciones?.[context.dataIndex];
                                  
                                  return [
                                    `${context.dataset.label}: ${context.parsed.y.toLocaleString()} ${unidad}`,
                                    item ? `Registros: ${item.entregas}` : '',
                                    item ? `Proyectos: ${item.proyectos}` : ''
                                  ].filter(Boolean);
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  const unidad = chartData.analisisTecnicoConcreto.metadata?.unidad || 'unidad';
                                  return value + ' ' + unidad;
                                }
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor,
                                maxRotation: 45
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Concreto Detallado */}
                {selectedCharts.concretoDetallado && chartData.concretoDetallado && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Concreto Detallado - Por Proveedor y Especificación</h3>
                    <div className="h-64">
                      <Bar 
                        key={`concreto-detallado-${themeVersion}`}
                        data={chartData.concretoDetallado} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y} m³`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              stacked: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return value + ' m³';
                                }
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            x: {
                              stacked: true,
                              ticks: { 
                                color: getChartColors().textColor,
                                maxRotation: 45
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ======================= GRÁFICAS DE HORAS ======================= */}

                {/* Gráfica de Horas por Mes */}
                {selectedCharts.horasPorMes && chartData.horasPorMes && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Horas Trabajadas por Mes</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Evolución del uso de maquinaria y equipos
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                        <FaClock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Line 
                        key={`horas-mes-${themeVersion}`}
                        data={chartData.horasPorMes} 
                        options={{
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
                              borderColor: 'rgba(147, 51, 234, 0.5)',
                              borderWidth: 2,
                              cornerRadius: 12,
                              padding: 16,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} horas`;
                                }
                              }
                            }
                          },
                          elements: {
                            point: { radius: 6, hoverRadius: 8, borderWidth: 3 },
                            line: { borderWidth: 3, tension: 0.4 }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' },
                                callback: function(value) {
                                  return value + ' hrs';
                                }
                              },
                              grid: { 
                                color: getChartColors().gridColor,
                                lineWidth: 1,
                                drawBorder: false
                              }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor, 
                                font: { size: 12, weight: '500' } 
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Horas por Proyecto */}
                {selectedCharts.horasPorProyecto && chartData.horasPorProyecto && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Horas por Proyecto</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Distribución de horas de trabajo por proyecto
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <FaBuilding className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Doughnut 
                        key={`horas-proyecto-${themeVersion}`}
                        data={chartData.horasPorProyecto} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: getChartColors().textColor,
                                padding: 20,
                                font: { size: 13, weight: '600' },
                                usePointStyle: true,
                                pointStyle: 'circle'
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed * 100) / total).toFixed(1);
                                  return `${context.label}: ${context.parsed.toFixed(1)} horas (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Top Equipos por Horas */}
                {selectedCharts.horasPorEquipo && chartData.horasPorEquipo && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Top Equipos por Horas de Uso</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Equipos con mayor tiempo de utilización
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FaTruck className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar 
                        key={`horas-equipo-${themeVersion}`}
                        data={chartData.horasPorEquipo} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y.toFixed(1)} horas`;
                                }
                              }
                            }
                          },
                          elements: {
                            bar: { borderRadius: 8, borderSkipped: false }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 12, weight: '500' },
                                callback: function(value) {
                                  return value + ' hrs';
                                }
                              },
                              grid: { 
                                color: getChartColors().gridColor,
                                lineWidth: 1,
                                drawBorder: false
                              }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor, 
                                font: { size: 11, weight: '500' },
                                maxRotation: 45
                              },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica Comparativa Horas vs Costo */}
                {selectedCharts.comparativoHorasVsCosto && chartData.comparativoHorasVsCosto && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 col-span-full">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Análisis Comparativo: Horas vs Costo</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Relación entre horas trabajadas y costo total por equipo
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                        <FaChartLine className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar 
                        key={`comparativo-${themeVersion}`}
                        data={chartData.comparativoHorasVsCosto} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: getChartColors().textColor,
                                font: { size: 13, weight: '600' },
                                usePointStyle: true,
                                padding: 20
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  if (context.datasetIndex === 0) {
                                    return `Horas: ${context.parsed.y.toFixed(1)} hrs`;
                                  } else {
                                    return `Costo: $${context.parsed.y.toLocaleString('es-MX', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}`;
                                  }
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return value + ' hrs';
                                }
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return '$' + value.toLocaleString('es-MX');
                                }
                              },
                              grid: { drawOnChartArea: false }
                            },
                            x: {
                              ticks: { 
                                color: getChartColors().textColor,
                                maxRotation: 45
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* ===== GRÁFICAS DE UNIDADES DE MEDIDA ===== */}

                {/* Distribución por Unidades de Medida - Espacio ampliado */}
                {selectedCharts.distribucionUnidades && chartData.distribucionUnidades && (
                  <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Distribución por Unidades de Medida</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Cantidad de suministros por tipo de unidad
                        </p>
                      </div>
                      <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                        <FaRuler className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Gráfica de Distribución por Unidades */}
                      <div className="bg-gray-50 dark:bg-dark-200 p-6 rounded-lg">
                        <div className="h-80">
                          <Doughnut 
                            key={`unidades-${themeVersion}`}
                            data={chartData.distribucionUnidades} 
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'right',
                                  labels: {
                                    color: getChartColors().textColor,
                                    padding: 15,
                                    font: { size: 12, weight: '500' }
                                  }
                                },
                                tooltip: {
                                  backgroundColor: getChartColors().tooltipBg,
                                  titleColor: getChartColors().tooltipText,
                                  bodyColor: getChartColors().tooltipText,
                                  callbacks: {
                                    label: function(context) {
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = ((context.parsed * 100) / total).toFixed(1);
                                      return `${context.label}: ${context.parsed} suministros (${percentage}%)`;
                                    }
                                  }
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Gráfica de Análisis por Códigos */}
                      {selectedCharts.codigosProducto && chartData.codigosProducto && (
                        <div className="bg-gray-50 dark:bg-dark-200 p-6 rounded-lg relative">
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análisis por Códigos de Producto</h4>
                          {/* Badge de total */}
                          <div className="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-xs font-bold px-3 py-1 rounded shadow">
                            Total: ${chartData.codigosProducto.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                          </div>
                          <div className="h-80">
                            <Doughnut 
                              key={`codigos-${themeVersion}`}
                              data={chartData.codigosProducto} 
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: {
                                    position: 'right',
                                    labels: {
                                      color: getChartColors().textColor,
                                      padding: 15,
                                      font: { size: 12, weight: '500' }
                                    }
                                  },
                                  tooltip: {
                                    backgroundColor: getChartColors().tooltipBg,
                                    titleColor: getChartColors().tooltipText,
                                    bodyColor: getChartColors().tooltipText,
                                    callbacks: {
                                      label: function(context) {
                                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                        const percentage = ((context.parsed * 100) / total).toFixed(1);
                                        return `${context.label}: $${context.parsed} (${percentage}%)`;
                                      }
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cantidad Total por Unidad */}
                {selectedCharts.cantidadPorUnidad && chartData.cantidadPorUnidad && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cantidad Total por Unidad</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Suma de cantidades agrupadas por unidad de medida
                        </p>
                      </div>
                      <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-lg">
                        <FaCalculator className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar
                        data={chartData.cantidadPorUnidad}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y}`;
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              ticks: { color: getChartColors().textColor },
                              grid: { color: getChartColors().gridColor }
                            },
                            y: {
                              beginAtZero: true,
                              ticks: { color: getChartColors().textColor },
                              grid: { color: getChartColors().gridColor }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Valor Económico por Unidad */}
                {selectedCharts.valorPorUnidad && chartData.valorPorUnidad && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 relative">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Valor Económico por Unidad</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Gasto total agrupado por unidad de medida
                        </p>
                      </div>
                      
                    </div>
                    {/* Badge de total */}
                    <div className="absolute top-4 right-10 bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-xs font-bold px-3 py-1 rounded shadow">
                      Total: ${chartData.valorPorUnidad.datasets[0].data.reduce((a, b) => a + b, 0).toLocaleString('es-MX', {minimumFractionDigits: 2})}
                    </div>
                    <div className="h-80">
                      <Doughnut
                        data={chartData.valorPorUnidad}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: {
                                  size: 12,
                                  weight: '500'
                                },
                                color: getChartColors().textColor
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed / total) * 100).toFixed(1);
                                  return `${context.label}: $${context.parsed.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Comparativo Cantidad vs Valor por Unidad */}
                {selectedCharts.comparativoUnidades && chartData.comparativoUnidades && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cantidad vs Valor por Unidad</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Análisis comparativo de cantidad total y valor económico
                        </p>
                      </div>
                      <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                        <FaChartBar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar
                        data={chartData.comparativoUnidades}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: {
                                  size: 13,
                                  weight: '500'
                                },
                                color: getChartColors().textColor
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  if (context.datasetIndex === 0) {
                                    return `Cantidad: ${context.parsed.y.toLocaleString()}`;
                                  } else {
                                    return `Valor: $${context.parsed.y.toLocaleString('es-MX', {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}`;
                                  }
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              type: 'linear',
                              display: true,
                              position: 'left',
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor
                              },
                              grid: {
                                color: getChartColors().gridColor
                              }
                            },
                            y1: {
                              type: 'linear',
                              display: true,
                              position: 'right',
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return '$' + value.toLocaleString();
                                }
                              },
                              grid: {
                                drawOnChartArea: false,
                                color: getChartColors().gridColor
                              }
                            },
                            x: {
                              ticks: {
                                color: getChartColors().textColor,
                                maxRotation: 45
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Total de Metros Cúbicos de Concreto */}
                {selectedCharts.totalMetrosCubicos && chartData.totalMetrosCubicos && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Total de Metros Cúbicos de Concreto</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Volumen de concreto por mes - Total: {chartData.totalMetrosCubicos.metadata?.total.toLocaleString()} m³
                        </p>
                      </div>
                      <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
                        <FaRuler className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar
                        data={chartData.totalMetrosCubicos}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                usePointStyle: true,
                                pointStyle: 'circle',
                                padding: 20,
                                font: { size: 13, weight: '500' },
                                color: getChartColors().textColor
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                label: function(context) {
                                  return `${context.parsed.y.toLocaleString()} m³`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              grid: { color: getChartColors().gridColor },
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return value.toLocaleString() + ' m³';
                                }
                              }
                            },
                            x: {
                              grid: { color: getChartColors().gridColor },
                              ticks: {
                                color: getChartColors().textColor,
                                maxRotation: 45
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Análisis de Unidades de Medida */}
                {selectedCharts.analisisUnidadesMedida && chartData.analisisUnidadesMedida && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Análisis por Unidades de Medida</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {chartData.analisisUnidadesMedida.metadata?.categoria} - {chartData.analisisUnidadesMedida.metadata?.totalUnidades} unidades diferentes
                        </p>
                      </div>
                      <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-lg">
                        <FaChartPie className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Bar
                        data={chartData.analisisUnidadesMedida}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          indexAxis: 'y', // Gráfica horizontal
                          plugins: {
                            legend: {
                              display: false
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              callbacks: {
                                title: function(context) {
                                  return context[0].label.split('\n')[0];
                                },
                                label: function(context) {
                                  const detalles = chartData.analisisUnidadesMedida.metadata?.detalles;
                                  const item = detalles?.[context.dataIndex];
                                  return [
                                    `Cantidad: ${context.parsed.x.toLocaleString()}`,
                                    `Registros: ${item?.registros || 0}`,
                                    `Categorías: ${item?.categorias || 'N/A'}`
                                  ];
                                }
                              }
                            }
                          },
                          scales: {
                            x: {
                              beginAtZero: true,
                              grid: { color: getChartColors().gridColor },
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return value.toLocaleString();
                                }
                              }
                            },
                            y: {
                              grid: { display: false },
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 11 }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Mensaje cuando no hay gráficas seleccionadas */}
                {!Object.values(selectedCharts).some(selected => selected) && (
                  <div className="col-span-full bg-gray-50 dark:bg-dark-200 p-8 rounded-lg text-center">
                    <FaChartBar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hay gráficas seleccionadas</h3>
                    <p className="text-gray-600 dark:text-gray-400">Selecciona al menos una gráfica para visualizar los datos de suministros.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabla de suministros */}
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-dark-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Suministro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Folio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedSuministros.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FaBox className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>No hay suministros registrados</p>
                  </td>
                </tr>
              ) : (
                // Renderizado inteligente: muestra suministros agrupados jerárquicamente cuando es posible
                (() => {
                  const recibosAgrupados = agruparSuministrosPorRecibo(paginatedSuministros);
                  const rows = [];
                  
                  recibosAgrupados.forEach((recibo) => {
                    if (recibo.isHierarchical && filters.proveedor === '') {
                      // Grupo jerárquico - mostrar encabezado con opción de expandir
                      rows.push(
                        <tr key={`grupo-${recibo.id}`} className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => toggleReciboExpansion(recibo.id)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                              >
                                {expandedRecibos.has(recibo.id) ? 
                                  <FaChevronDown className="w-4 h-4" /> : 
                                  <FaChevronUp className="w-4 h-4" />
                                }
                              </button>
                              <FaReceipt className="text-blue-600 dark:text-blue-400 w-4 h-4" />
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">
                                  Recibo - {recibo.cantidad_items} artículos
                                </div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  {recibo.proyecto} • {new Date(recibo.fecha).toLocaleDateString()}
                                  {recibo.folio && ` • Folio: ${recibo.folio}`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              Múltiple
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FaBuilding className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                              <div className="font-medium text-gray-900 dark:text-white">
                                {recibo.proveedor}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {recibo.folio || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {recibo.cantidad_items} artículos
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                              Total: {formatPriceDisplay(recibo.total)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              Agrupado
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {formatDate(recibo.fecha)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditRecibo(recibo)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                                title="Editar grupo"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRecibo(recibo)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors duration-200"
                                title="Eliminar grupo"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                      
                      // Si está expandido, mostrar todos los suministros del grupo
                      if (expandedRecibos.has(recibo.id)) {
                        recibo.suministros.forEach((suministro) => {
                          rows.push(
                            <tr key={`sub-${suministro.id_suministro}`} className="bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 pl-12">
                                <div>
                                  <div className="font-medium text-gray-900 dark:text-white">
                                    {suministro.nombre || suministro.descripcion}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {suministro.descripcion_detallada || suministro.observaciones}
                                  </div>
                                  {suministro.codigo_producto && (
                                    <div className="text-xs text-gray-400 dark:text-gray-500">
                                      Código: {suministro.codigo_producto}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                  {getDisplayCategoria(suministro.tipo_suministro || suministro.categoria)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-500 dark:text-gray-400 pl-6">
                                  (Grupo)
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  -
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {formatQuantityDisplay(suministro.cantidad)} {getDisplayUnidadMedida(suministro.unidad_medida)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div>
                                  <div className="text-sm text-gray-900 dark:text-white">
                                    {formatPriceDisplay(suministro.precio_unitario)} / {getDisplayUnidadMedida(suministro.unidad_medida)}
                                  </div>
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Total: {formatPriceDisplay(calculateTotal(suministro))}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(suministro.estado)}`}>
                                  {ESTADOS_SUMINISTRO[suministro.estado]?.label || suministro.estado}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                {formatDate(suministro.fecha || suministro.fecha_necesaria)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEdit(suministro)}
                                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                                    title="Editar individual"
                                  >
                                    <FaEdit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(suministro.id_suministro)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors duration-200"
                                    title="Eliminar"
                                  >
                                    <FaTrash className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        });
                      }
                    } else {
                      // Suministro individual o filtrado por proveedor - renderizar normalmente
                      const suministro = recibo.suministros[0];
                      rows.push(
                        <tr key={suministro.id_suministro} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">
                                {suministro.nombre || suministro.descripcion}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {suministro.descripcion_detallada || suministro.observaciones}
                              </div>
                              {suministro.codigo_producto && (
                                <div className="text-xs text-gray-400 dark:text-gray-500">
                                  Código: {suministro.codigo_producto}
                                </div>
                              )}
                              {suministro.folio && (
                                <div className="text-xs text-blue-600 dark:text-blue-400">
                                  Folio: {suministro.folio}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                              {getDisplayCategoria(suministro.tipo_suministro || suministro.categoria)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <FaBuilding className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                              <div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {suministro.proveedor?.nombre || 'Sin asignar'}
                                </div>
                                {suministro.proveedor?.tipo_proveedor && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {suministro.proveedor.tipo_proveedor}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {suministro.folio || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {formatQuantityDisplay(suministro.cantidad)} {getDisplayUnidadMedida(suministro.unidad_medida)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {formatPriceDisplay(suministro.precio_unitario)} / {getDisplayUnidadMedida(suministro.unidad_medida)}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Total: {formatPriceDisplay(calculateTotal(suministro))}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(suministro.estado)}`}>
                              {ESTADOS_SUMINISTRO[suministro.estado]?.label || suministro.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            {formatDate(suministro.fecha || suministro.fecha_necesaria)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(suministro)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1 transition-colors duration-200"
                                title="Editar"
                              >
                                <FaEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(suministro.id_suministro)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors duration-200"
                                title="Eliminar"
                              >
                                <FaTrash className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  });
                  
                  return rows;
                })()
              )}
            </tbody>
          </table>
        </div>
        
        {/* Componente de Paginación */}
        {totalFilteredItems > 0 && (
          <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Información de registros */}
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Mostrando {getPaginationInfo().start} a {getPaginationInfo().end} de {getPaginationInfo().total} registros
            </div>
            
            {/* Controles de paginación */}
            <div className="flex items-center gap-4">
              {/* Selector de items por página */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Registros por página:
                </label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
              
              {/* Navegación de páginas */}
              <div className="flex items-center gap-2">
                {/* Botón Primera página */}
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Primera
                </button>
                
                {/* Botón Anterior */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                    
                    // Ajustar si estamos cerca del final
                    if (endPage - startPage < maxVisible - 1) {
                      startPage = Math.max(1, endPage - maxVisible + 1);
                    }
                    
                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => handlePageChange(i)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            i === currentPage
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          {i}
                        </button>
                      );
                    }
                    return pages;
                  })()}
                </div>
                
                {/* Botón Siguiente */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
                
                {/* Botón Última página */}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Última
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Botones de Exportar e Importar */}
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-3 justify-center">
          {/* Botón Descargar Plantilla */}
          <button
            onClick={handleDownloadTemplate}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            title="Descargar plantilla Excel para importar"
          >
            <FaFileDownload className="w-4 h-4" />
            Descargar Plantilla
          </button>

          {/* Botón Importar */}
          <button
            onClick={() => setShowImportModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            title="Importar suministros desde Excel"
          >
            <FaUpload className="w-4 h-4" />
            Importar Excel
          </button>

          {/* Botón Exportar con dropdown */}
          <div className="relative export-dropdown">
            <button
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
            >
              <FaDownload className="w-4 h-4" />
              Exportar
              <FaChevronDown className="w-3 h-3" />
            </button>
            
            {showExportDropdown && (
              <div className="absolute bottom-full mb-2 right-0 w-48 bg-white dark:bg-dark-100 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <button
                  onClick={() => {
                    handleExportToExcel();
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-dark-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 rounded-t-lg"
                >
                  <FaFileExcel className="w-4 h-4 text-green-600" />
                  Exportar a Excel
                </button>
                <button
                  onClick={() => {
                    handleExportToPDF();
                    setShowExportDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-dark-200 flex items-center gap-2 text-gray-700 dark:text-gray-300 rounded-b-lg"
                >
                  <FaFilePdf className="w-4 h-4 text-red-600" />
                  Exportar a PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>


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
    </div>
  );
};

export default Suministros;
