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
  FaCalculator
} from 'react-icons/fa';
import { formatCurrency } from '../utils/currency';
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
import { useToast } from '../contexts/ToastContext';

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

const Suministros = () => {
  const [suministros, setSuministros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuministro, setEditingSuministro] = useState(null);
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
    folio_proveedor: '',
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
                                  suministro.proveedor === chartFilters.proveedorNombre ||
                                  suministro.proveedorInfo?.nombre === chartFilters.proveedorNombre;
          
          // Filtro por tipo de suministro
          const matchesTipo = !chartFilters.tipoSuministro || 
                             (suministro.tipo_suministro || suministro.categoria) === chartFilters.tipoSuministro;
          
          // Filtro por estado
          const matchesEstado = !chartFilters.estado || suministro.estado === chartFilters.estado;
          
          return matchesFecha && matchesProyecto && matchesProveedor && matchesTipo && matchesEstado;
        });

        // Procesar datos para todas las gráficas
        const chartDataProcessed = {
          gastosPorMes: processGastosPorMes(filteredData),
          valorPorCategoria: processValorPorCategoria(filteredData),
          suministrosPorMes: processSuministrosPorMes(filteredData),
          gastosPorProyecto: processGastosPorProyecto(filteredData),
          gastosPorProveedor: processGastosPorProveedor(filteredData),
          cantidadPorEstado: processCantidadPorEstado(filteredData),
          distribucionTipos: processDistribucionTipos(filteredData),
          tendenciaEntregas: processTendenciaEntregas(filteredData),
          codigosProducto: processCodigosProducto(filteredData),
          analisisTecnicoConcreto: processAnalisisTecnicoInteligente(filteredData),
          concretoDetallado: processConcretoDetallado(filteredData),
          // Gráficas para horas
          horasPorMes: processHorasPorMes(filteredData),
          horasPorProyecto: processHorasPorProyecto(filteredData),
          horasPorEquipo: processHorasPorEquipo(filteredData),
          comparativoHorasVsCosto: processComparativoHorasVsCosto(filteredData),
          // Gráficas para unidades de medida
          distribucionUnidades: processDistribucionUnidades(filteredData),
          cantidadPorUnidad: processCantidadPorUnidad(filteredData),
          valorPorUnidad: processValorPorUnidad(filteredData),
          comparativoUnidades: processComparativoUnidades(filteredData),
          // Análisis por unidades específicas
          totalMetrosCubicos: processTotalMetrosCubicos(filteredData),
          analisisUnidadesMedida: processAnalisisUnidadesMedida(filteredData)
        };

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
    
    data.forEach(suministro => {
      const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const gasto = cantidad * precio;
      
      if (!gastosPorMes[mesAnio]) {
        gastosPorMes[mesAnio] = 0;
      }
      gastosPorMes[mesAnio] += gasto;
    });

    const meses = Object.keys(gastosPorMes).sort();
    const valores = meses.map(mes => Math.round(gastosPorMes[mes] * 100) / 100);

    return {
      labels: meses.map(mes => {
        const [año, mesNum] = mes.split('-');
        const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
        return nombreMes;
      }),
      datasets: [{
        label: 'Gasto Total ($)',
        data: valores,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
  };

  // Procesar valor por categoría
  const processValorPorCategoria = (data) => {
    const valorPorCategoria = {};
    
    data.forEach(suministro => {
      const categoria = suministro.tipo_suministro || suministro.categoria || 'Sin categoría';
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const valor = cantidad * precio;
      
      if (!valorPorCategoria[categoria]) {
        valorPorCategoria[categoria] = 0;
      }
      valorPorCategoria[categoria] += valor;
    });

    const categorias = Object.keys(valorPorCategoria);
    const valores = categorias.map(cat => Math.round(valorPorCategoria[cat] * 100) / 100);

    return {
      labels: categorias,
      datasets: [{
        label: 'Valor Total ($)',
        data: valores,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Rojo
          'rgba(245, 158, 11, 0.8)',  // Amarillo
          'rgba(16, 185, 129, 0.8)',  // Verde
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(139, 92, 246, 0.8)',  // Púrpura
          'rgba(249, 115, 22, 0.8)'   // Naranja
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(249, 115, 22)'
        ],
        borderWidth: 2
      }]
    };
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
    const gastosPorProveedor = {};
    
    data.forEach(suministro => {
      const proveedorNombre = suministro.proveedor || suministro.proveedorInfo?.nombre || 'Sin proveedor';
      
      const cantidad = parseFloat(suministro.cantidad) || 0;
      const precio = parseFloat(suministro.precio_unitario) || 0;
      const gasto = cantidad * precio;
      
      if (!gastosPorProveedor[proveedorNombre]) {
        gastosPorProveedor[proveedorNombre] = 0;
      }
      gastosPorProveedor[proveedorNombre] += gasto;
    });

    const proveedoresList = Object.keys(gastosPorProveedor);
    const valores = proveedoresList.map(proveedor => Math.round(gastosPorProveedor[proveedor] * 100) / 100);

    return {
      labels: proveedoresList,
      datasets: [{
        label: 'Gasto Total ($)',
        data: valores,
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Verde
          'rgba(168, 85, 247, 0.8)',  // Violeta
          'rgba(251, 146, 60, 0.8)',  // Naranja
          'rgba(59, 130, 246, 0.8)',  // Azul
          'rgba(239, 68, 68, 0.8)',   // Rojo
          'rgba(245, 158, 11, 0.8)',  // Amarillo
          'rgba(20, 184, 166, 0.8)',  // Teal
          'rgba(217, 70, 239, 0.8)'   // Magenta
        ],
        borderWidth: 2
      }]
    };
  };

  // Procesar cantidad por estado
  const processCantidadPorEstado = (data) => {
    const cantidadPorEstado = {};
    
    data.forEach(suministro => {
      const estado = suministro.estado || 'Sin estado';
      
      if (!cantidadPorEstado[estado]) {
        cantidadPorEstado[estado] = 0;
      }
      cantidadPorEstado[estado]++;
    });

    const estados = Object.keys(cantidadPorEstado);
    const cantidades = estados.map(estado => cantidadPorEstado[estado]);

    return {
      labels: estados,
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        backgroundColor: [
          'rgba(156, 163, 175, 0.8)',  // Gris - Solicitado
          'rgba(59, 130, 246, 0.8)',   // Azul - Aprobado
          'rgba(245, 158, 11, 0.8)',   // Amarillo - Pedido
          'rgba(139, 92, 246, 0.8)',   // Púrpura - En Tránsito
          'rgba(16, 185, 129, 0.8)',   // Verde - Entregado
          'rgba(239, 68, 68, 0.8)'     // Rojo - Cancelado
        ],
        borderWidth: 2
      }]
    };
  };

  // Procesar distribución de tipos
  const processDistribucionTipos = (data) => {
    const distribucionTipos = {};
    
    data.forEach(suministro => {
      const tipo = suministro.tipo_suministro || suministro.categoria || 'Sin tipo';
      
      if (!distribucionTipos[tipo]) {
        distribucionTipos[tipo] = 0;
      }
      distribucionTipos[tipo]++;
    });

    const tipos = Object.keys(distribucionTipos);
    const cantidades = tipos.map(tipo => distribucionTipos[tipo]);

    return {
      labels: tipos,
      datasets: [{
        label: 'Cantidad de Suministros',
        data: cantidades,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Rojo - Material
          'rgba(16, 185, 129, 0.8)',  // Verde - Servicio
          'rgba(59, 130, 246, 0.8)',  // Azul - Equipo
          'rgba(245, 158, 11, 0.8)',  // Amarillo - Herramienta
          'rgba(139, 92, 246, 0.8)'   // Púrpura - Maquinaria
        ],
        borderWidth: 2
      }]
    };
  };

  // Procesar tendencia de entregas (suministros entregados por mes)
  const processTendenciaEntregas = (data) => {
    const entregasPorMes = {};
    
    data.filter(suministro => suministro.estado === 'Entregado').forEach(suministro => {
      const fecha = new Date(suministro.fecha_necesaria || suministro.fecha || suministro.createdAt);
      const mesAnio = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (!entregasPorMes[mesAnio]) {
        entregasPorMes[mesAnio] = 0;
      }
      entregasPorMes[mesAnio]++;
    });

    const meses = Object.keys(entregasPorMes).sort();
    const entregas = meses.map(mes => entregasPorMes[mes]);

    return {
      labels: meses.map(mes => {
        const [año, mesNum] = mes.split('-');
        const nombreMes = new Date(año, mesNum - 1).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
        return nombreMes;
      }),
      datasets: [{
        label: 'Entregas Completadas',
        data: entregas,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        tension: 0.4,
        fill: true
      }]
    };
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
      const proveedor = suministro.proveedor || suministro.proveedorInfo?.nombre || 'Sin proveedor';
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

  // Cargar gráficas cuando se cambian los filtros
  useEffect(() => {
    if (showCharts) {
      loadChartData();
    }
  }, [chartFilters, showCharts]);

  // Función para verificar duplicados - SOLO POR FOLIO
  const checkForDuplicates = (newSuministro) => {
    // Solo verificar duplicados si hay folio_proveedor
    if (!newSuministro.folio_proveedor || newSuministro.folio_proveedor.trim() === '') {
      return []; // Sin folio, no hay duplicados que verificar
    }

    const duplicates = suministros.filter(suministro => {
      // Si estamos editando, excluir el suministro actual de la verificación
      if (editingSuministro && suministro.id_suministro === editingSuministro.id_suministro) {
        return false;
      }

      // ÚNICO CRITERIO: Folio del proveedor
      return suministro.folio_proveedor && 
             suministro.folio_proveedor.toLowerCase().trim() === newSuministro.folio_proveedor.toLowerCase().trim();
    });

    return duplicates;
  };

  // Función para buscar sugerencias de duplicados en tiempo real - SOLO POR FOLIO
  const searchDuplicateSuggestions = useCallback((nombre, codigo_producto, folio_proveedor) => {
    // Solo mostrar advertencias para folios duplicados EXACTOS
    if (!folio_proveedor || folio_proveedor.trim() === '') {
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
      return suministro.folio_proveedor && 
             suministro.folio_proveedor.toLowerCase().trim() === folio_proveedor.toLowerCase().trim();
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
      folio_proveedor: prev.folio_proveedor,
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
      searchDuplicateSuggestions(formData.nombre, formData.codigo_producto, formData.folio_proveedor);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [formData.nombre, formData.codigo_producto, formData.folio_proveedor, searchDuplicateSuggestions]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        // Campos básicos mapeados correctamente
        nombre: formData.nombre,
        descripcion_detallada: formData.descripcion,
        tipo_suministro: formData.tipo_suministro,
        codigo_producto: formData.codigo_producto,
        cantidad: parseFloat(formData.cantidad) || 0,
        unidad_medida: formData.unidad_medida,
        precio_unitario: parseFloat(formData.precio_unitario) || 0,
        fecha: formData.fecha_necesaria,
        estado: formData.estado,
        id_proyecto: formData.id_proyecto,
        observaciones: formData.observaciones,
        
        // Campos de proveedor
        id_proveedor: formData.proveedor_info?.id_proveedor || null,
        proveedor: formData.proveedor_info?.nombre || '', // Campo legacy
        folio_proveedor: formData.folio_proveedor,
        
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
            const proveedor = dup.proveedor || dup.proveedorInfo?.nombre || 'Sin proveedor';
            const folioInfo = dup.folio_proveedor ? ` - Folio: ${dup.folio_proveedor}` : '';
            return `• ${dup.nombre} (${proyecto} - ${proveedor}${folioInfo})`;
          }).join('\n');

          const warningTitle = "🚫 DUPLICADO DE FOLIO DETECTADO";
          const warningMessage = `¡ATENCIÓN! El folio "${submitData.folio_proveedor}" ya existe:\n\n${duplicateInfo}\n\n` +
                         `Los folios deben ser únicos. ¿Está seguro de que desea continuar?`;

          const confirmed = await showConfirmDialog(warningTitle, warningMessage);
          if (!confirmed) {
            return;
          }
        }
      }

      let response;
      if (editingSuministro) {
        response = await api.updateSuministro(editingSuministro.id_suministro, submitData);
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

  const handleEdit = (suministro) => {
    console.log('Editando suministro:', suministro); // Para debug
    console.log('proveedorInfo:', suministro.proveedorInfo); // Para debug específico del proveedor
    setEditingSuministro(suministro);
    
    // Formatear cantidad para evitar decimales innecesarios
    const formatQuantityForEdit = (qty) => {
      if (!qty) return '';
      const num = parseFloat(qty);
      return num % 1 === 0 ? num.toString() : num.toString();
    };

    // Función para limpiar horas - convertir 00:00:00 o null a cadena vacía
    const cleanTimeField = (timeValue) => {
      if (!timeValue || timeValue === '00:00:00' || timeValue === '00:00') {
        return '';
      }
      return timeValue;
    };
    
    // Procesar información del proveedor
    const proveedorInfo = suministro.proveedorInfo || suministro.proveedor_info || null;
    console.log('Proveedor procesado:', proveedorInfo); // Debug
    
    setFormData({
      nombre: suministro.nombre || suministro.descripcion || '',
      descripcion: suministro.descripcion_detallada || '',
      categoria: suministro.tipo_suministro || suministro.categoria || 'Material',
      cantidad: formatQuantityForEdit(suministro.cantidad),
      unidad_medida: suministro.unidad_medida || '',
      precio_unitario: suministro.precio_unitario ? 
        (Math.round(parseFloat(suministro.precio_unitario) * 100) / 100).toFixed(2) : '',
      fecha_necesaria: suministro.fecha || suministro.fecha_necesaria ? 
        new Date(suministro.fecha || suministro.fecha_necesaria).toISOString().split('T')[0] : '',
      estado: suministro.estado || 'Solicitado',
      id_proyecto: suministro.id_proyecto?.toString() || '',
      proveedor_info: proveedorInfo,
      observaciones: suministro.observaciones || '',
      codigo_producto: suministro.codigo_producto || '',
      // Campos de recibo - limpiar valores de hora
      folio_proveedor: suministro.folio_proveedor || '',
      operador_responsable: suministro.operador_responsable || '',
      vehiculo_transporte: suministro.vehiculo_transporte || '',
      hora_salida: cleanTimeField(suministro.hora_salida),
      hora_llegada: cleanTimeField(suministro.hora_llegada),
      hora_inicio_descarga: cleanTimeField(suministro.hora_inicio_descarga),
      hora_fin_descarga: cleanTimeField(suministro.hora_fin_descarga)
    });
    setShowModal(true);
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

  const handleCloseModal = () => {
    setShowModal(false);
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
      folio_proveedor: '',
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
                         suministro.folio_proveedor?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !filters.categoria || (suministro.tipo_suministro || suministro.categoria) === filters.categoria;
    const matchesEstado = !filters.estado || suministro.estado === filters.estado;
    const matchesProyecto = !filters.proyecto || suministro.id_proyecto?.toString() === filters.proyecto;
    const matchesProveedor = !filters.proveedor || 
                            suministro.proveedor === filters.proveedor ||
                            suministro.proveedorInfo?.nombre === filters.proveedor;

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
    
    const proveedoresUnicos = new Set(suministros.map(s => s.proveedor).filter(p => p)).size;

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
    return new Date(dateString).toLocaleDateString('es-MX');
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
        <p className="text-gray-600 dark:text-gray-400">Administra materiales, herramientas y equipos para proyectos</p>
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
              onClick={() => setShowModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
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
                          Evolución temporal de los gastos
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Line 
                        key={`gastos-${themeVersion}`}
                        data={chartData.gastosPorMes} 
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
                              borderColor: 'rgba(59, 130, 246, 0.5)',
                              borderWidth: 2,
                              cornerRadius: 12,
                              padding: 16,
                              titleFont: { size: 14, weight: '600' },
                              bodyFont: { size: 13, weight: '500' },
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: $${context.parsed.y.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}`;
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

                {/* Gráfica de Valor por Categoría */}
                {selectedCharts.valorPorCategoria && chartData.valorPorCategoria && (
                  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Valor Total por Categoría</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Distribución de inversión por categoría
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                        <FaChartBar className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <div className="h-80">
                      <Doughnut 
                        key={`categoria-${themeVersion}`}
                        data={chartData.valorPorCategoria} 
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
                              borderColor: 'rgba(239, 68, 68, 0.5)',
                              borderWidth: 1,
                              cornerRadius: 12,
                              padding: 16,
                              titleFont: { size: 14, weight: '600' },
                              bodyFont: { size: 13, weight: '500' },
                              callbacks: {
                                label: function(context) {
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((context.parsed * 100) / total).toFixed(1);
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos por Proveedor</h3>
                    <div className="h-64">
                      <Doughnut 
                        key={`proveedores-${themeVersion}`}
                        data={chartData.gastosPorProveedor} 
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
                                  return `${context.label}: $${context.parsed.toLocaleString('es-MX', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                  })}`;
                                }
                              }
                            }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Gráfica de Cantidad por Estado */}
                {selectedCharts.cantidadPorEstado && chartData.cantidadPorEstado && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg relative">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cantidad por Estado</h3>
                    {/* Badge de total */}
                    <div className="absolute top-4 right-4 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 text-xs font-bold px-3 py-1 rounded shadow">
                      Total: {chartData.cantidadPorEstado.datasets[0].data.reduce((a, b) => a + b, 0)} suministros
                    </div>
                    <div className="h-64">
                      <Bar 
                        key={`estados-${themeVersion}`}
                        data={chartData.cantidadPorEstado} 
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
                                  return `${context.label}: ${context.parsed.y} suministros`;
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
                  Fecha Necesaria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredSuministros.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                    <FaBox className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                    <p>No hay suministros registrados</p>
                  </td>
                </tr>
              ) : (
                paginatedSuministros.map((suministro) => (
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
                          <div className="text-xs text-gray-400 dark:text-gray-500">Código: {suministro.codigo_producto}</div>
                        )}
                        {suministro.folio_proveedor && (
                          <div className="text-xs text-blue-600 dark:text-blue-400">Folio: {suministro.folio_proveedor}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {suministro.tipo_suministro || suministro.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {suministro.proveedorInfo?.nombre || suministro.proveedor || 'Sin asignar'}
                          </div>
                          {suministro.proveedorInfo?.tipo_proveedor && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {suministro.proveedorInfo.tipo_proveedor}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {suministro.folio_proveedor || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatQuantity(suministro.cantidad)} {suministro.unidad_medida}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {formatCurrency(suministro.precio_unitario)} / {suministro.unidad_medida}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Total: {formatCurrency(calculateTotal(suministro))}
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
                ))
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
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {editingSuministro ? 'Editar Suministro' : 'Nuevo Suministro'}
              </h2>

              {/* Texto explicativo */}
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                      Guía de llenado
                    </h3>
                    <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                      <p className="mb-2">
                        <strong>Campos obligatorios (*):</strong> Nombre, Categoría, Proveedor, Cantidad, Unidad de Medida y Precio.
                      </p>
                      <p className="mb-2">
                        <strong>Información de Recibo:</strong> Completa según los datos del recibo físico. El folio del proveedor aparece usualmente en la parte superior del documento.
                      </p>
                      <p>
                        <strong>Horarios y Transporte:</strong> Información opcional para seguimiento detallado de entregas y logística.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Información Básica</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Nombre del Suministro *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => {
                              setFormData({...formData, nombre: e.target.value});
                              setSelectedSuggestion(null);
                            }}
                            onFocus={() => formData.nombre.length >= 2 && setShowNameSuggestions(nameSuggestions.length > 0)}
                            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
                            className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                              showDuplicatesWarning 
                                ? 'border-yellow-500 dark:border-yellow-400 focus:ring-yellow-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                            }`}
                            placeholder="Ej: Grava 1 1/2, Retroexcavadora 415F"
                            required
                          />
                          {showDuplicatesWarning && (
                            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                              <span className="text-yellow-500 text-sm">⚠️</span>
                            </div>
                          )}

                          {/* Dropdown de sugerencias de nombres */}
                          {showNameSuggestions && nameSuggestions.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b">
                                Sugerencias de nombres similares
                              </div>
                              {nameSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    setFormData(prev => ({...prev, nombre: suggestion}));
                                    setShowNameSuggestions(false);
                                  }}
                                  className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center justify-between"
                                >
                                  <span>{suggestion}</span>
                                  <FaSearch className="h-3 w-3 text-gray-400" />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Sugerencias de duplicados */}
                        {showDuplicatesWarning && duplicatesSuggestions.length > 0 && (
                          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
                            <div className="flex items-center mb-2">
                              <span className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">
                                ⚠️ Posibles duplicados encontrados:
                              </span>
                            </div>
                            <div className="space-y-1 max-h-32 overflow-y-auto">
                              {duplicatesSuggestions.map((suggestion, index) => {
                                const proyecto = proyectos.find(p => p.id_proyecto === suggestion.id_proyecto)?.nombre || 'Sin proyecto';
                                const proveedor = suggestion.proveedor || suggestion.proveedorInfo?.nombre || 'Sin proveedor';
                                return (
                                  <div key={index} className="text-xs text-yellow-700 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800/30 p-2 rounded">
                                    <div className="font-medium">{suggestion.nombre}</div>
                                    <div className="text-yellow-600 dark:text-yellow-400">
                                      {proyecto} • {proveedor} • {suggestion.estado}
                                      {suggestion.codigo_producto && ` • Código: ${suggestion.codigo_producto}`}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                              💡 Verifica si alguno de estos coincide con lo que intentas crear
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Folio del Proveedor
                        </label>
                        <input
                          type="text"
                          value={formData.folio_proveedor}
                          onChange={(e) => setFormData({...formData, folio_proveedor: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Ej: 37946, 62289"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Categoría *
                        </label>
                        <select
                          value={formData.tipo_suministro}
                          onChange={(e) => setFormData({...formData, tipo_suministro: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          {Object.entries(CATEGORIAS_SUMINISTRO).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Proyecto *
                        </label>
                        <select
                          value={formData.id_proyecto}
                          onChange={(e) => setFormData({...formData, id_proyecto: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          <option value="">Seleccionar proyecto</option>
                          {proyectos.map((proyecto) => (
                            <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                              {proyecto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Código de Producto
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.codigo_producto}
                          onChange={(e) => setFormData({...formData, codigo_producto: e.target.value})}
                          onFocus={() => formData.codigo_producto.length >= 2 && setShowCodeSuggestions(codeSuggestions.length > 0)}
                          onBlur={() => setTimeout(() => setShowCodeSuggestions(false), 200)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                          placeholder="SKU, código interno, etc."
                        />

                        {/* Dropdown de sugerencias de códigos */}
                        {showCodeSuggestions && codeSuggestions.length > 0 && (
                          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-40 overflow-y-auto">
                            <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-b">
                              Códigos similares
                            </div>
                            {codeSuggestions.map((suggestion, index) => (
                              <div
                                key={index}
                                onClick={() => {
                                  setFormData(prev => ({...prev, codigo_producto: suggestion}));
                                  setShowCodeSuggestions(false);
                                }}
                                className="px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                              >
                                {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información comercial */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Información Comercial</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Proveedor *
                      </label>
                      <ProveedorAutocomplete
                        value={formData.proveedor_info}
                        onChange={(proveedor) => setFormData({...formData, proveedor_info: proveedor})}
                        tipoSugerido={
                          formData.categoria === 'Material' ? 'Material' :
                          formData.categoria === 'Servicio' ? 'Servicio' :
                          formData.categoria === 'Equipo' ? 'Equipo' : 'Mixto'
                        }
                        required
                      />
                    </div>

                    {/* Plantillas de Proveedor */}
                    {formData.proveedor_info && proveedorSuministros.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Suministros comunes de {formData.proveedor_info.nombre}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {proveedorSuministros.slice(0, 6).map((suministro, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  // Información básica
                                  nombre: suministro.nombre,
                                  descripcion: suministro.descripcion_detallada || suministro.descripcion || '',
                                  tipo_suministro: suministro.tipo_suministro || suministro.categoria || 'Material',
                                  codigo_producto: suministro.codigo_producto || suministro.codigo || '',
                                  
                                  // Información comercial (mantener proveedor actual)
                                  cantidad: suministro.cantidad || '',
                                  unidad_medida: suministro.unidad_medida || 'pz',
                                  precio_unitario: suministro.precio_unitario || '',
                                  
                                  // Estado y proyecto (usar valores por defecto)
                                  estado: 'Solicitado', // Nuevo estado por defecto
                                  // NO copiamos el folio_proveedor para que sea único
                                  
                                  // Observaciones si existen
                                  observaciones: suministro.observaciones || ''
                                });
                                // Ocultar todas las sugerencias después de seleccionar
                                setShowNameSuggestions(false);
                                setShowCodeSuggestions(false);
                              }}
                              className="text-left p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors text-xs"
                            >
                              <div className="font-medium text-gray-900 dark:text-white truncate">
                                {suministro.nombre}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 truncate text-xs">
                                {suministro.codigo_producto || suministro.codigo} • {suministro.tipo_suministro || suministro.categoria}
                              </div>
                              <div className="text-gray-500 dark:text-gray-400 truncate text-xs">
                                {suministro.unidad_medida} • {suministro.precio_unitario ? `$${parseFloat(suministro.precio_unitario).toFixed(2)}` : 'Sin precio'}
                              </div>
                            </button>
                          ))}
                        </div>
                        {proveedorSuministros.length > 6 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            +{proveedorSuministros.length - 6} suministros más
                          </div>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.cantidad}
                          onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Unidad de Medida *
                        </label>
                        <select
                          value={formData.unidad_medida}
                          onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          required
                        >
                          {Object.entries(UNIDADES_MEDIDA).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Precio Unitario *
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.precio_unitario}
                          onChange={(e) => {
                            const formattedValue = handlePriceChange(e.target.value);
                            setFormData({...formData, precio_unitario: formattedValue});
                          }}
                          onBlur={(e) => {
                            // Al perder el foco, redondear a 2 decimales si es necesario
                            const value = e.target.value;
                            if (value && !isNaN(value)) {
                              const rounded = Math.round(parseFloat(value) * 100) / 100;
                              setFormData({...formData, precio_unitario: rounded.toFixed(2)});
                            }
                          }}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="Ej: 520.75"
                          required
                        />
                      </div>
                      {formData.cantidad && formData.precio_unitario && (
                        <div className="text-sm mt-1 space-y-1">
                          <p className="text-green-600 dark:text-green-400 font-medium">
                            Total: {formatCurrency(parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario))}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            Precio unitario: {formatCurrency(parseFloat(formData.precio_unitario || 0))}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estado
                        </label>
                        <select
                          value={formData.estado}
                          onChange={(e) => setFormData({...formData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <DateInput
                          label="Fecha"
                          value={formData.fecha_necesaria}
                          onChange={(date) => setFormData({...formData, fecha_necesaria: date})}
                          placeholder="Seleccionar fecha"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Notas adicionales, especificaciones técnicas, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Sección de Información de Recibo */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <FaTruck className="mr-2 text-red-600" />
                    Información de Recibo
                  </h3>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Complete esta sección con la información del recibo físico. Los horarios son opcionales y útiles para el seguimiento logístico.
                  </p>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Operador/Responsable
                          </label>
                          <input
                            type="text"
                            value={formData.operador_responsable}
                            onChange={(e) => setFormData({...formData, operador_responsable: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ej: Ramiro Leyva López"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Vehículo/Camión
                          </label>
                          <input
                            type="text"
                            value={formData.vehiculo_transporte}
                            onChange={(e) => setFormData({...formData, vehiculo_transporte: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="Ej: 19-AV-8P, 22-AM-6R"
                          />
                        </div>

                        <TimeInput
                          label="Hora de Salida"
                          value={formData.hora_salida}
                          onChange={(time) => setFormData({...formData, hora_salida: time})}
                          placeholder="Seleccionar hora de salida"
                        />

                        <TimeInput
                          label="Hora de Llegada"
                          value={formData.hora_llegada}
                          onChange={(time) => setFormData({...formData, hora_llegada: time})}
                          placeholder="Seleccionar hora de llegada"
                        />

                        <TimeInput
                          label="Inicio de Descarga"
                          value={formData.hora_inicio_descarga}
                          onChange={(time) => setFormData({...formData, hora_inicio_descarga: time})}
                          placeholder="Seleccionar hora de inicio"
                        />

                        <TimeInput
                          label="Fin de Descarga"
                          value={formData.hora_fin_descarga}
                          onChange={(time) => setFormData({...formData, hora_fin_descarga: time})}
                          placeholder="Seleccionar hora de fin"
                        />
                      </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {editingSuministro ? 'Actualizar' : 'Crear'} Suministro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suministros;
