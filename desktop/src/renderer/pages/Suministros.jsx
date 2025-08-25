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
  FaChevronUp
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
  'Equipo': 'Equipo',
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

  // Estados para detección de duplicados
  const [duplicatesSuggestions, setDuplicatesSuggestions] = useState([]);
  const [showDuplicatesWarning, setShowDuplicatesWarning] = useState(false);

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
    concretoDetallado: null
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
    concretoDetallado: false
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
          analisisTecnicoConcreto: processAnalisisTecnicoConcreto(filteredData),
          concretoDetallado: processConcretoDetallado(filteredData)
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

    return {
      labels: codigos.map(codigo => `${codigo} (${codigosPorProducto[codigo].nombre})`),
      datasets: [{
        label: 'Valor por Código ($MXN)',
        data: valores,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 101, 101, 0.8)',
          'rgba(248, 113, 113, 0.8)',
          'rgba(252, 165, 165, 0.8)',
          'rgba(254, 202, 202, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(96, 165, 250, 0.8)',
          'rgba(147, 197, 253, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 101, 101, 1)',
          'rgba(248, 113, 113, 1)',
          'rgba(252, 165, 165, 1)',
          'rgba(254, 202, 202, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(147, 197, 253, 1)'
        ],
        borderWidth: 1
      }]
    };
  };

  // Procesar análisis técnico específico de concreto
  const processAnalisisTecnicoConcreto = (data) => {
    const concretoData = data.filter(suministro => 
      (suministro.tipo_suministro === 'Concreto' || 
       suministro.categoria === 'Concreto' ||
       suministro.nombre?.toLowerCase().includes('concreto'))
    );

    const analisisPorCodigo = {};
    
    concretoData.forEach(suministro => {
      const codigo = suministro.codigo_producto || 'Sin especificación';
      if (!analisisPorCodigo[codigo]) {
        analisisPorCodigo[codigo] = {
          volumen: 0,
          costo: 0,
          entregas: 0,
          proyectos: new Set()
        };
      }
      analisisPorCodigo[codigo].volumen += parseFloat(suministro.cantidad || 0);
      analisisPorCodigo[codigo].costo += parseFloat(suministro.cantidad || 0) * parseFloat(suministro.precio_unitario || 0);
      analisisPorCodigo[codigo].entregas += 1;
      if (suministro.id_proyecto) {
        analisisPorCodigo[codigo].proyectos.add(suministro.id_proyecto);
      }
    });

    const especificaciones = Object.keys(analisisPorCodigo);
    const volumenes = especificaciones.map(spec => Math.round(analisisPorCodigo[spec].volumen * 100) / 100);

    return {
      labels: especificaciones,
      datasets: [{
        label: 'Volumen (m³)',
        data: volumenes,
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }]
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

  // Función para obtener colores según el tema
  const getChartColors = () => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    return {
      textColor: isDarkMode ? 'white' : 'black', // Blanco en oscuro, negro en claro
      gridColor: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(156, 163, 175, 0.3)',
      tooltipBg: isDarkMode ? 'rgba(17, 24, 39, 0.9)' : 'rgba(0, 0, 0, 0.8)',
      tooltipText: 'white'
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

  // Efecto para buscar duplicados cuando cambia el nombre, código o folio
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      searchDuplicateSuggestions(formData.nombre, formData.codigo_producto, formData.folio_proveedor);
    }, 300); // Debounce de 300ms

    return () => clearTimeout(delayedSearch);
  }, [formData.nombre, formData.codigo_producto, formData.folio_proveedor, searchDuplicateSuggestions]);

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

  const calculateTotal = (suministro) => {
    const cantidad = parseFloat(suministro.cantidad) || 0;
    const precio = parseFloat(suministro.precio_unitario) || 0;
    const total = cantidad * precio;
    
    // Redondear a 2 decimales exactos para evitar problemas de precisión
    return Math.round(total * 100) / 100;
  };

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

              {/* Selector de Gráficas a Mostrar */}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-md font-medium text-gray-900 dark:text-white">Gráficas a Mostrar</h4>
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
                        concretoDetallado: true
                      })}
                      className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
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
                        concretoDetallado: false
                      })}
                      className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors"
                    >
                      Ninguna
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.gastosPorMes}
                      onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorMes: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Gastos por Mes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.valorPorCategoria}
                      onChange={(e) => setSelectedCharts({...selectedCharts, valorPorCategoria: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Valor por Categoría</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.suministrosPorMes}
                      onChange={(e) => setSelectedCharts({...selectedCharts, suministrosPorMes: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cantidad por Mes</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.gastosPorProyecto}
                      onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorProyecto: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Gastos por Proyecto</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.gastosPorProveedor}
                      onChange={(e) => setSelectedCharts({...selectedCharts, gastosPorProveedor: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Gastos por Proveedor</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.cantidadPorEstado}
                      onChange={(e) => setSelectedCharts({...selectedCharts, cantidadPorEstado: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Cantidad por Estado</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.distribucionTipos}
                      onChange={(e) => setSelectedCharts({...selectedCharts, distribucionTipos: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Distribución de Tipos</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.tendenciaEntregas}
                      onChange={(e) => setSelectedCharts({...selectedCharts, tendenciaEntregas: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Tendencia de Entregas</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.codigosProducto}
                      onChange={(e) => setSelectedCharts({...selectedCharts, codigosProducto: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Códigos de Producto</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.analisisTecnicoConcreto}
                      onChange={(e) => setSelectedCharts({...selectedCharts, analisisTecnicoConcreto: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Análisis Técnico Concreto</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCharts.concretoDetallado}
                      onChange={(e) => setSelectedCharts({...selectedCharts, concretoDetallado: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Concreto Detallado</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección de Gráficas Dinámicas */}
            {loadingCharts ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Placeholders de carga para mantener el layout */}
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 dark:border-red-400"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Gráfica de Gastos por Mes */}
                {selectedCharts.gastosPorMes && chartData.gastosPorMes && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos por Mes</h3>
                    <div className="h-64">
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
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              borderColor: 'rgba(239, 68, 68, 0.5)',
                              borderWidth: 1,
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
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 11, weight: '500' },
                                callback: function(value) {
                                  return '$' + value.toLocaleString('es-MX');
                                }
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            x: {
                              ticks: { color: getChartColors().textColor, font: { size: 11, weight: '500' } },
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Valor Total por Categoría</h3>
                    <div className="h-64">
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
                                padding: 15,
                                font: { size: 12, weight: '500' }
                              }
                            },
                            tooltip: {
                              backgroundColor: getChartColors().tooltipBg,
                              titleColor: getChartColors().tooltipText,
                              bodyColor: getChartColors().tooltipText,
                              borderColor: 'rgba(239, 68, 68, 0.5)',
                              borderWidth: 1,
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Suministros Solicitados por Mes</h3>
                    <div className="h-64">
                      <Bar 
                        key={`suministros-${themeVersion}`}
                        data={chartData.suministrosPorMes} 
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
                              borderColor: 'rgba(59, 130, 246, 0.5)',
                              borderWidth: 1,
                              callbacks: {
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y} suministros`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                font: { size: 11, weight: '500' },
                                stepSize: 1
                              },
                              grid: { color: getChartColors().gridColor }
                            },
                            x: {
                              ticks: { color: getChartColors().textColor, font: { size: 11, weight: '500' } },
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Gastos por Proyecto</h3>
                    <div className="h-64">
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
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                color: getChartColors().textColor,
                                callback: function(value) {
                                  return '$' + value.toLocaleString('es-MX');
                                }
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cantidad por Estado</h3>
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Distribución por Tipo de Suministro</h3>
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
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tendencia de Entregas Completadas</h3>
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

                {/* Gráfica de Análisis Técnico de Concreto */}
                {selectedCharts.analisisTecnicoConcreto && chartData.analisisTecnicoConcreto && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Análisis Técnico - Volumen por Especificación</h3>
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
                                label: function(context) {
                                  return `${context.dataset.label}: ${context.parsed.y} m³`;
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
                                  return value + ' m³';
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
                filteredSuministros.map((suministro) => (
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
                            onChange={(e) => setFormData({...formData, nombre: e.target.value})}
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
                      <input
                        type="text"
                        value={formData.codigo_producto}
                        onChange={(e) => setFormData({...formData, codigo_producto: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                        placeholder="SKU, código interno, etc."
                      />
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
