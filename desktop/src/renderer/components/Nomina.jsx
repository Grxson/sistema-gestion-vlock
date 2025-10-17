import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import nominasServices from '../services/nominas';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { useEmpleados } from '../contexts/EmpleadosContext';
import NominaWizardSimplificado from './NominaWizard';
import ChartsSection from './ui/ChartsSection';
import AdeudosHistorial from './ui/AdeudosHistorial';
import EmpleadoCard from './ui/EmpleadoCard';
import CustomSelect from './ui/CustomSelect';
import DateRangePicker from './ui/DateRangePicker';
import NominaReportsTab from './nomina/NominaReportsTab';
import {
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function Nomina() {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const { empleados, getEmpleadosActivos, refreshEmpleados } = useEmpleados();
  
  // Debug: verificar empleados del contexto (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [Nomina] Empleados del contexto:', empleados.length, empleados);
  }
  
  const [nominas, setNominas] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedNomina, setSelectedNomina] = useState(null);
  const [nominaToEdit, setNominaToEdit] = useState(null);
  const [showCharts, setShowCharts] = useState(false);
  const [showNominaDetails, setShowNominaDetails] = useState(false);
  const [viewMode, setViewMode] = useState('cards');
  const [showAdeudosHistorial, setShowAdeudosHistorial] = useState(false);
  const [selectedEmpleadoAdeudos, setSelectedEmpleadoAdeudos] = useState(null);
  const [showAllNominas, setShowAllNominas] = useState(false);
  const [activeTab, setActiveTab] = useState('empleados'); // 'empleados', 'historial', 'reportes'
  
  // Filtros para empleados
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  
  // Filtros para historial de nóminas
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
  const [filtroFechaFin, setFiltroFechaFin] = useState('');
  
  // Estados para proyectos
  const [proyectos, setProyectos] = useState([]);
  
  // Estados para preview de nómina
  const [showNominaPreview, setShowNominaPreview] = useState(false);
  const [selectedEmpleadoPreview, setSelectedEmpleadoPreview] = useState(null);
  const [nominaPreviewData, setNominaPreviewData] = useState(null);

  // Funciones de filtrado mejoradas
  const getEmpleadosFiltrados = () => {
    let empleadosActivos = getEmpleadosActivos();
    
    // Filtrar por proyecto (usando ID del proyecto seleccionado)
    if (filtroProyecto) {
      empleadosActivos = empleadosActivos.filter(emp => 
        emp.id_proyecto?.toString() === filtroProyecto ||
        emp.proyecto?.id_proyecto?.toString() === filtroProyecto
      );
    }
    
    // Filtrar por búsqueda (nombre, apellido, NSS, RFC)
    if (filtroBusqueda) {
      const busqueda = filtroBusqueda.toLowerCase();
      empleadosActivos = empleadosActivos.filter(emp => 
        emp.nombre?.toLowerCase().includes(busqueda) ||
        emp.apellido?.toLowerCase().includes(busqueda) ||
        emp.nss?.toLowerCase().includes(busqueda) ||
        emp.rfc?.toLowerCase().includes(busqueda)
      );
    }
    
    return empleadosActivos;
  };

  const getNominasFiltradas = () => {
    let nominasFiltradas = nominas;
    
    // Filtrar por rango de fechas
    if (filtroFechaInicio) {
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
        const fechaInicio = new Date(filtroFechaInicio);
        return fechaNomina >= fechaInicio;
      });
    }
    
    if (filtroFechaFin) {
      nominasFiltradas = nominasFiltradas.filter(nomina => {
        const fechaNomina = new Date(nomina.fecha_creacion || nomina.fecha || nomina.createdAt);
        const fechaFin = new Date(filtroFechaFin);
        // Agregar un día para incluir el día completo
        fechaFin.setDate(fechaFin.getDate() + 1);
        return fechaNomina < fechaFin;
      });
    }
    
    return nominasFiltradas;
  };

  // Función para calcular el subtotal de la semana actual
  const getSubtotalSemanaActual = () => {
    const nominasFiltradas = getNominasFiltradas();
    
    // Debug: verificar estructura de las nóminas
    console.log('🔍 [Subtotal] Nóminas filtradas:', nominasFiltradas);
    console.log('🔍 [Subtotal] Campos de monto disponibles:', nominasFiltradas.map(n => ({
      id: n.id_nomina || n.id,
      monto_total: n.monto_total,
      monto: n.monto,
      pago_semanal: n.pago_semanal,
      monto_a_pagar: n.monto_a_pagar
    })));
    
    const subtotal = nominasFiltradas.reduce((total, nomina) => {
      // Intentar diferentes campos de monto y convertir a número
      const monto = parseFloat(nomina.monto_total || nomina.monto || nomina.pago_semanal || 0);
      console.log(`💰 [Subtotal] Nómina ${nomina.id_nomina || nomina.id}:`, {
        monto_total: nomina.monto_total,
        monto: nomina.monto,
        pago_semanal: nomina.pago_semanal,
        monto_calculado: monto
      });
      return total + (isNaN(monto) ? 0 : monto);
    }, 0);
    
    console.log('💰 [Subtotal] Total calculado:', subtotal);
    console.log('📊 [Subtotal] Cantidad de nóminas:', nominasFiltradas.length);
    
    return {
      total: subtotal,
      cantidad: nominasFiltradas.length,
      pagadas: nominasFiltradas.filter(n => 
        n.estado === 'pagada' || n.estado === 'Pagado' || n.estado === 'pagado'
      ).length,
      pendientes: nominasFiltradas.filter(n => 
        n.estado === 'pendiente' || n.estado === 'Pendiente' || n.estado === 'borrador' || n.estado === 'Borrador'
      ).length
    };
  };

  // Función para verificar si un empleado tiene nómina generada
  const getNominaStatus = (empleado) => {
    const nominasEmpleado = nominas.filter(nomina => 
      nomina.empleado?.id_empleado === empleado.id_empleado ||
      nomina.id_empleado === empleado.id_empleado
    );
    
    if (nominasEmpleado.length === 0) {
      return { status: 'none', count: 0, latest: null };
    }
    
    const latest = nominasEmpleado.sort((a, b) => 
      new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
    )[0];
    
    return {
      status: latest.estado === 'pagada' || latest.estado === 'Pagado' ? 'completed' : 'draft',
      count: nominasEmpleado.length,
      latest: latest
    };
  };

  // Función para ver preview de nómina
  const verPreviewNomina = async (empleado) => {
    console.log('🔍 [PREVIEW] Función verPreviewNomina llamada para empleado:', empleado.id_empleado);
    try {
      setSelectedEmpleadoPreview(empleado);
      
      // Buscar la nómina más reciente del empleado
      const nominasEmpleado = nominas.filter(nomina => 
        nomina.empleado?.id_empleado === empleado.id_empleado ||
        nomina.id_empleado === empleado.id_empleado
      );
      
      if (nominasEmpleado.length === 0) {
        showInfo('Sin nóminas', 'Este empleado no tiene nóminas generadas');
        return;
      }
      
      const latestNomina = nominasEmpleado.sort((a, b) => 
        new Date(b.fecha_creacion || b.createdAt) - new Date(a.fecha_creacion || a.createdAt)
      )[0];
      
      // Obtener datos frescos de la nómina desde el backend
      try {
        const response = await ApiService.get(`/nomina/${latestNomina.id_nomina}`);
        if (response.success && response.data) {
          setNominaPreviewData(response.data);
        } else {
          setNominaPreviewData(latestNomina);
        }
      } catch (apiError) {
        console.warn('No se pudieron obtener datos frescos, usando datos locales:', apiError);
        setNominaPreviewData(latestNomina);
      }
      
      setShowNominaPreview(true);
      
    } catch (error) {
      console.error('Error al obtener preview de nómina:', error);
      showError('Error', 'No se pudo obtener la información de la nómina');
    }
  };

  // Función para generar PDF desde preview
  const generarPDFDesdePreview = async () => {
    if (!nominaPreviewData?.id_nomina) {
      showError('Error', 'No hay nómina para generar PDF');
      return;
    }

    try {
      showInfo('Generando PDF', 'Creando recibo de nómina...');
      
      const pdfBlob = await nominasServices.nominas.generarReciboPDF(nominaPreviewData.id_nomina);
      
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error('No se recibió un PDF válido');
      }
      
      // Crear nombre de archivo
      const nombreEmpleado = selectedEmpleadoPreview.nombre + '_' + selectedEmpleadoPreview.apellido;
      const nombreArchivo = `nomina_${nombreEmpleado.replace(/\s+/g, '_')}_${nominaPreviewData.periodo || 'sin_periodo'}.pdf`;
      
      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = nombreArchivo;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar recursos
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 2000);

      showSuccess('PDF Generado', `Recibo de nómina descargado: ${nombreArchivo}`);
      
      // Actualizar estado de la nómina a "Pagado" si estaba en "borrador" o "Pendiente"
      if (nominaPreviewData.estado === 'borrador' || nominaPreviewData.estado === 'Borrador' || nominaPreviewData.estado === 'Pendiente') {
        try {
          console.log('🔄 [PDF] Actualizando estado de nómina:', {
            id: nominaPreviewData.id_nomina,
            estadoActual: nominaPreviewData.estado,
            nuevoEstado: 'Pagado'
          });
          
          await nominasServices.nominas.marcarComoPagada(nominaPreviewData.id_nomina);
          showSuccess('Estado actualizado', 'La nómina ha sido marcada como pagada');
          
          // Refrescar datos
          await fetchData();
          console.log('✅ [PDF] Datos refrescados después de cambiar estado');
        } catch (error) {
          console.error('❌ [PDF] Error actualizando estado:', error);
          showError('Error', 'No se pudo actualizar el estado de la nómina');
        }
      }
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      showError('Error al generar PDF', error.message || 'No se pudo generar el PDF');
    }
  };


  const editarNominaDesdePreview = async () => {
    console.log('🔍 [EDITAR] Función editarNominaDesdePreview llamada');
    console.log('🔍 [EDITAR] nominaPreviewData:', nominaPreviewData);
    
    if (!nominaPreviewData?.id_nomina) {
      console.log('❌ [EDITAR] No hay nómina para editar');
      showError('Error', 'No hay nómina para editar');
      return;
    }

    try {
      console.log('🔍 [EDITAR] Obteniendo datos de nómina para edición:', nominaPreviewData.id_nomina);
      
      // Obtener datos frescos de la nómina
      const response = await nominasServices.nominas.getById(nominaPreviewData.id_nomina);
      
      if (response.success && response.data) {
        const nominaData = response.data;
        console.log('🔍 [EDITAR] Datos de nómina obtenidos:', nominaData);
        
        // Buscar el empleado correspondiente
        const empleado = empleados.find(emp => emp.id_empleado === nominaData.id_empleado);
        
        if (empleado) {
          // Almacenar datos de la nómina para editar
          setNominaToEdit(nominaData);
          
          // Cerrar preview y abrir wizard con datos cargados
          setShowNominaPreview(false);
          setSelectedEmpleadoPreview(empleado);
          setShowWizard(true);
          
          showInfo('Editando Nómina', 'Cargando datos de la nómina...');
        } else {
          showError('Error', 'No se encontró el empleado de la nómina');
        }
      } else {
        showError('Error', 'No se pudieron obtener los datos de la nómina');
      }
    } catch (error) {
      console.error('❌ [EDITAR] Error obteniendo datos de nómina:', error);
      showError('Error', 'No se pudieron cargar los datos para editar');
    }
  };


  // Estado para el modal de liquidar adeudo
  const [showLiquidarModal, setShowLiquidarModal] = useState(false);
  const [nominaSeleccionada, setNominaSeleccionada] = useState(null);
  const [montoLiquidacion, setMontoLiquidacion] = useState('');
  const [observacionesLiquidacion, setObservacionesLiquidacion] = useState('');

  // Función para abrir modal de liquidar adeudo
  const abrirModalLiquidar = (nomina) => {
    setNominaSeleccionada(nomina);
    setMontoLiquidacion('');
    setObservacionesLiquidacion('');
    setShowLiquidarModal(true);
  };

  // Función para liquidar adeudo
  const liquidarAdeudo = async () => {
    try {
      if (!nominaSeleccionada || !montoLiquidacion) {
        alert('Por favor ingresa el monto a liquidar');
        return;
      }

      const monto = parseFloat(montoLiquidacion);
      if (isNaN(monto) || monto <= 0) {
        alert('Por favor ingresa un monto válido');
        return;
      }

      const response = await ApiService.liquidarAdeudo(
        nominaSeleccionada.id_nomina,
        monto,
        observacionesLiquidacion
      );

      if (response.success) {
        showSuccess('Adeudo liquidado', response.message);
        setShowLiquidarModal(false);
        // Refrescar datos
        await refreshEmpleados();
      } else {
        showError('Error', response.message || 'No se pudo liquidar el adeudo');
      }
    } catch (error) {
      console.error('Error liquidando adeudo:', error);
      showError('Error', 'No se pudo liquidar el adeudo');
    }
  };

  // Funciones de utilidad
  const handleNominaSuccess = async () => {
    try {
    // Refrescar empleados desde el contexto global
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 [Nomina] Refrescando empleados en handleNominaSuccess...');
    }
    await refreshEmpleados();
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ [Nomina] Empleados refrescados en handleNominaSuccess');
    }
      
    // Recargar otros datos
      await fetchData();
      
      // Mostrar mensaje de éxito
      showSuccess('Éxito', 'Nómina generada correctamente');
      
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [Nomina] Todos los datos refrescados correctamente');
      }
    } catch (error) {
      console.error('❌ [Nomina] Error refrescando datos:', error);
      showError('Error', 'Nómina generada pero hubo un problema al refrescar los datos');
    }
  };

  // Función para refrescar datos cuando se liquida un adeudo
  const handleAdeudoLiquidado = async () => {
    console.log('🔄 [Nomina] Adeudo liquidado, refrescando estadísticas...');
    // Refrescar estadísticas y datos
    await fetchData();
  };


  useEffect(() => {
    fetchData();
    cargarDatosFiltros();
  }, []);

  // Función para cargar datos necesarios para los filtros
  const cargarDatosFiltros = async () => {
    try {
      // Cargar proyectos
      const proyectosResponse = await apiService.getProyectosActivos();
      setProyectos(proyectosResponse.data || []);
    } catch (error) {
      console.error('Error cargando datos de filtros:', error);
    }
  };

  // Función para limpiar todos los filtros
  const limpiarFiltros = () => {
    setFiltroProyecto('');
    setFiltroBusqueda('');
    setFiltroFechaInicio('');
    setFiltroFechaFin('');
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Inicializar servicios de nóminas
      await nominasServices.inicializar();
      
      // Refrescar empleados desde el contexto global
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 [Nomina] Refrescando empleados desde el contexto...');
      }
      const empleadosRefrescados = await refreshEmpleados();
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ [Nomina] Empleados refrescados:', empleadosRefrescados?.length || 0);
        console.log('✅ [Nomina] Empleados del contexto después del refresh:', empleados.length);
        console.log('✅ [Nomina] Empleados del contexto después del refresh (datos):', empleados);
        
        // Esperar un poco para que el estado se actualice
        await new Promise(resolve => setTimeout(resolve, 100));
        console.log('✅ [Nomina] Empleados del contexto después del delay:', empleados.length);
        
        // Verificar que los empleados se están pasando correctamente al wizard
        console.log('🔍 [Nomina] Verificando empleados para el wizard:', empleados.length, empleados);
        console.log('🔍 [Nomina] Verificando empleados para el wizard (después del delay):', empleados.length, empleados);
      }
      
      // Fetch nominas usando el nuevo servicio
      let nominasData = [];
      try {
        const nominasResponse = await nominasServices.nominas.getAll();
        nominasData = nominasResponse.data || [];
        console.log('📊 [Nomina] Nominas cargadas:', nominasData);
        setNominas(nominasData);
      } catch (error) {
        console.log('Nomina endpoint not available yet');
        setNominas([]);
      }

      // Cargar estadísticas
      try {
        const estadisticasData = await nominasServices.empleados.getEstadisticasEmpleados();
        setEstadisticas(estadisticasData);
      } catch (error) {
        console.log('Error loading statistics:', error);
        setEstadisticas(null);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      showError('Error', 'No se pudieron cargar los datos');
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-white dark:bg-dark-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando información de nómina...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-dark-50">
      {/* Header con Pestañas */}
      <div className="bg-white dark:bg-dark-50 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Nóminas
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {getEmpleadosActivos().length} empleados activos • Sistema de pago semanal
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setSelectedEmpleadoAdeudos(null);
                  setShowAdeudosHistorial(true);
                }}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                Ver Adeudos
              </button>
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nueva Nómina
              </button>
            </div>
          </div>
          
          {/* Pestañas */}
          <div className="mt-4">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('empleados')}
                className={`${
                  activeTab === 'empleados'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Empleados
              </button>
              <button
                onClick={() => setActiveTab('historial')}
                className={`${
                  activeTab === 'historial'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              >
                Historial
              </button>
              <button
                onClick={() => setActiveTab('reportes')}
                className={`${
                  activeTab === 'reportes'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2`}
              >
                <ChartBarIcon className="h-4 w-4" />
                <span>Reportes</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Contenido según pestaña activa */}
        {activeTab === 'reportes' ? (
          <NominaReportsTab 
            nominas={nominas}
            estadisticas={estadisticas}
            loading={loading}
          />
        ) : (
          <>
            {/* Métricas Simples */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UserGroupIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Empleados</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {getEmpleadosActivos().length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DocumentTextIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nóminas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {nominas.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <CurrencyDollarIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Mensual</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(estadisticas?.totalSalariosMensuales || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sección de Gráficas */}
            {showCharts && (
              <ChartsSection 
                empleados={empleados}
                nominas={nominas}
                estadisticas={estadisticas}
                loading={loading}
              />
            )}
          </>
        )}

        {/* Sección de Empleados con Tabla y Filtros - Solo en pestaña empleados */}
        {activeTab === 'empleados' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Empleados Activos ({getEmpleadosFiltrados().length})
                </h2>
              </div>
              
              {/* Filtros Mejorados */}
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Buscar Empleado
                    </label>
                    <input
                      type="text"
                      value={filtroBusqueda}
                      onChange={(e) => setFiltroBusqueda(e.target.value)}
                      placeholder="Nombre, apellido, NSS o RFC..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Filtrar por Proyecto
                    </label>
                    <CustomSelect
                      value={filtroProyecto}
                      onChange={setFiltroProyecto}
                      placeholder="Seleccionar proyecto..."
                      options={[
                        { value: '', label: 'Todos los proyectos' },
                        ...proyectos.map(proyecto => ({
                          value: proyecto.id_proyecto.toString(),
                          label: proyecto.nombre,
                          description: proyecto.ubicacion || 'Sin ubicación'
                        }))
                      ]}
                      searchable={true}
                    />
                  </div>
                </div>
                
                {/* Botón para limpiar filtros */}
                {(filtroBusqueda || filtroProyecto) && (
                  <div className="flex justify-end">
                    <button
                      onClick={limpiarFiltros}
                      className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              {Array.isArray(empleados) && getEmpleadosFiltrados().length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Empleado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Oficio
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pago Semanal
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Proyecto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado Nómina
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {getEmpleadosFiltrados().map((empleado, index) => (
                        <tr key={empleado.id_empleado || `empleado-${index}`} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                                    {empleado.nombre?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {empleado.nombre} {empleado.apellido}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {empleado.nss || 'Sin NSS'} • {empleado.rfc || 'Sin RFC'}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {empleado.oficio?.nombre || 'Sin oficio'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {empleado.pago_semanal ? formatCurrency(empleado.pago_semanal) : 
                               empleado.contrato?.salario_diario ? formatCurrency(empleado.contrato.salario_diario * 7) : 
                               formatCurrency(0)}
                            </div>
                            <div className={`text-xs ${
                              (empleado.pago_semanal || empleado.contrato?.salario_diario) 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {(empleado.pago_semanal || empleado.contrato?.salario_diario) 
                                ? 'Configurado' 
                                : 'Sin configurar'
                              }
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {empleado.proyecto?.nombre || 'Sin proyecto'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {(() => {
                              const nominaStatus = getNominaStatus(empleado);
                              if (nominaStatus.status === 'none') {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                    Sin nómina
                                  </span>
                                );
                              } else if (nominaStatus.status === 'draft') {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    Borrador ({nominaStatus.count})
                                  </span>
                                );
                              } else {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                    Completada ({nominaStatus.count})
                                  </span>
                                );
                              }
                            })()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => verPreviewNomina(empleado)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                title="Ver nómina"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="mx-auto h-16 w-16 text-yellow-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {getEmpleadosActivos().length === 0 ? 'No hay empleados activos' : 'No se encontraron empleados'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                    {getEmpleadosActivos().length === 0 
                      ? 'Necesitas tener empleados activos para poder procesar la nómina. Agrega o activa empleados en el módulo de empleados.'
                      : 'Intenta ajustar los filtros de búsqueda para encontrar empleados.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
        </div>

        {/* Historial de Nóminas con Filtros - Solo en pestaña historial */}
        {activeTab === 'historial' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Historial de Nóminas ({getNominasFiltradas().length})
              </h2>
            </div>
            
            {/* Filtro por Rango de Fechas */}
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rango de Fechas
                  </label>
                  <DateRangePicker
                    startDate={filtroFechaInicio}
                    endDate={filtroFechaFin}
                    onStartDateChange={setFiltroFechaInicio}
                    onEndDateChange={setFiltroFechaFin}
                  />
                </div>
              </div>
              
              {/* Botón para limpiar filtros */}
              {(filtroFechaInicio || filtroFechaFin) && (
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setFiltroFechaInicio('');
                      setFiltroFechaFin('');
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    Limpiar filtros
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className={`p-6 ${showAllNominas ? 'max-h-[600px] overflow-y-auto' : ''}`}>
            {getNominasFiltradas().length > 0 ? (
              <div className="space-y-3">
                {(showAllNominas ? getNominasFiltradas() : getNominasFiltradas().slice(0, 10)).map((nomina, index) => {
                  // Debug: verificar estructura de cada nómina
                  console.log(`📋 [Nomina] Nómina ${index}:`, nomina);
                  
                  // Obtener nombre del empleado
                  const nombreEmpleado = typeof nomina.empleado === 'object' && nomina.empleado
                    ? `${nomina.empleado.nombre || ''} ${nomina.empleado.apellido || ''}`.trim()
                    : nomina.nombre_empleado || nomina.empleado || 'Sin empleado';
                  
                  // Obtener inicial del empleado
                  const inicialEmpleado = typeof nomina.empleado === 'object' && nomina.empleado
                    ? nomina.empleado.nombre?.charAt(0)?.toUpperCase()
                    : nombreEmpleado.charAt(0)?.toUpperCase() || 'E';
                  
                  // Obtener período
                  let periodo = 'Sin período';
                  if (typeof nomina.periodo === 'string') {
                    periodo = nomina.periodo;
                  } else if (typeof nomina.periodo === 'object' && nomina.periodo) {
                    // Si es un objeto, extraer la etiqueta o formato
                    if (nomina.periodo.etiqueta) {
                      periodo = nomina.periodo.etiqueta;
                    } else if (nomina.periodo.semana_iso && nomina.periodo.anio) {
                      periodo = `Semana ${nomina.periodo.semana_iso} - ${nomina.periodo.anio}`;
                    } else if (nomina.periodo.fecha_inicio) {
                      try {
                        periodo = new Date(nomina.periodo.fecha_inicio).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' });
                      } catch (e) {
                        periodo = 'Sin período';
                      }
                    } else {
                      periodo = 'Sin período';
                    }
                  } else if (nomina.semana) {
                    periodo = nomina.semana;
                  } else if (nomina.fecha) {
                    try {
                      periodo = new Date(nomina.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short' });
                    } catch (e) {
                      periodo = 'Sin período';
                    }
                  }
                  
                  // Asegurar que periodo siempre sea un string
                  if (typeof periodo !== 'string') {
                    periodo = 'Sin período';
                  }
                  
                  return (
                  <div key={nomina.id_nomina || nomina.id || index} className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                          {inicialEmpleado}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {nombreEmpleado}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {periodo} • {formatCurrency(nomina.monto_total || nomina.monto || 0)}
                          {nomina.pago_parcial && (
                            <span className="ml-2 text-orange-600 dark:text-orange-400 font-medium">
                              (Parcial: {formatCurrency(nomina.monto_a_pagar || 0)})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Información desglosada al lado del nombre */}
                    <div className="flex items-center space-x-4 text-xs ml-6">
                      <div className="text-center">
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          {formatCurrency((nomina.pago_semanal || nomina.monto_total || 0) / 6)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">por día</div>
                      </div>
                      <div className="text-center">
                        <div className="text-green-600 dark:text-green-400 font-medium">
                          {nomina.dias_laborados && nomina.dias_laborados > 0 
                            ? nomina.dias_laborados 
                            : (nomina.es_pago_semanal ? 6 : 'N/A')}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">días</div>
                      </div>
                      <div className="text-center">
                        <div className="text-purple-600 dark:text-purple-400 font-medium">
                          {formatCurrency(nomina.monto_total || nomina.monto || 0)}
                        </div>
                        <div className="text-gray-500 dark:text-gray-400">total</div>
                      </div>
                    </div>
                    
                    {/* Espacio flexible para empujar los botones a la derecha */}
                    <div className="flex-1"></div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        nomina.pago_parcial ? 
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' :
                        nomina.estado === 'pagada' || nomina.estado === 'Pagado' || nomina.estado === 'pagado' ? 
                          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                        nomina.estado === 'pendiente' || nomina.estado === 'Pendiente' ? 
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        nomina.estado === 'Aprobada' || nomina.estado === 'aprobada' ? 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                        nomina.estado === 'cancelada' || nomina.estado === 'Cancelada' ? 
                          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                        nomina.estado === 'generada' || nomina.estado === 'Generada' ? 
                          'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                        nomina.estado === 'borrador' || nomina.estado === 'Borrador' ? 
                          'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {nomina.pago_parcial ? 'Pago Parcial' : nomina.estado}
                      </span>
                      <button
                        onClick={async () => {
                          try {
                            const blob = await nominasServices.nominas.generarReciboPDF(nomina.id_nomina || nomina.id);
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `recibo-nomina-${nomina.id_nomina || nomina.id}.pdf`;
                            document.body.appendChild(a);
                            a.click();
                            window.URL.revokeObjectURL(url);
                            document.body.removeChild(a);
                            showSuccess('Éxito', 'Recibo descargado correctamente');
                          } catch (error) {
                            console.error('Error downloading PDF:', error);
                            showError('Error', 'No se pudo descargar el recibo');
                          }
                        }}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                        title="Descargar recibo PDF"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </button>
                      {nomina.pago_parcial && (
                        <button
                          onClick={() => abrirModalLiquidar(nomina)}
                          className="p-1.5 text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                          title="Liquidar adeudo pendiente"
                        >
                          <BanknotesIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  );
                })}
                
                {/* Subtotal de la semana */}
                {getNominasFiltradas().length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 text-lg font-bold">
                              $
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              Subtotal de Nóminas
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {getSubtotalSemanaActual().cantidad} nóminas • {getSubtotalSemanaActual().pagadas} pagadas • {getSubtotalSemanaActual().pendientes} pendientes
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(getSubtotalSemanaActual().total)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            Total a pagar
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {getNominasFiltradas().length > 10 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => setShowAllNominas(!showAllNominas)}
                      className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors duration-200"
                    >
                      {showAllNominas ? (
                        <>
                          <span>Ocultar nóminas</span>
                          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span>Ver todas las nóminas ({getNominasFiltradas().length})</span>
                          <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nominas.length === 0 
                    ? 'Aún no hay nóminas procesadas'
                    : 'No se encontraron nóminas con los filtros aplicados'
                  }
                </p>
                {nominas.length > 0 && (filtroFechaInicio || filtroFechaFin) && (
                  <button
                    onClick={() => {
                      setFiltroFechaInicio('');
                      setFiltroFechaFin('');
                    }}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Nomina Wizard Simplificado */}
        {process.env.NODE_ENV === 'development' && console.log('🔍 [Nomina] Pasando empleados al wizard:', empleados.length, empleados)}
        <NominaWizardSimplificado 
          isOpen={showWizard}
          onClose={() => {
            setShowWizard(false);
            setNominaToEdit(null); // Limpiar datos de edición al cerrar
          }}
          onSuccess={handleNominaSuccess}
          empleados={empleados}
          selectedEmpleado={selectedEmpleadoPreview}
          nominaToEdit={nominaToEdit}
        />

        {/* Modal de Preview de Nómina */}
        {showNominaPreview && nominaPreviewData && selectedEmpleadoPreview && (
          console.log('🔍 [PREVIEW] Renderizando preview de nómina:', {
            showNominaPreview,
            nominaPreviewData: nominaPreviewData?.id_nomina,
            selectedEmpleadoPreview: selectedEmpleadoPreview?.id_empleado
          }),
          <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative mx-auto border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
              {/* Header del Preview */}
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Preview de Nómina
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedEmpleadoPreview.nombre} {selectedEmpleadoPreview.apellido}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowNominaPreview(false);
                      setNominaPreviewData(null);
                      setSelectedEmpleadoPreview(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Contenido del Preview */}
              <div className="p-6">
                {/* Estado de la nómina */}
                <div className={`p-4 rounded-lg border mb-6 ${
                  nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : nominaPreviewData.pago_parcial
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado' ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : nominaPreviewData.pago_parcial ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div className="ml-3">
                        <p className={`text-sm font-medium ${
                          nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'text-green-800 dark:text-green-200'
                            : nominaPreviewData.pago_parcial
                            ? 'text-orange-800 dark:text-orange-200'
                            : 'text-yellow-800 dark:text-yellow-200'
                        }`}>
                          <strong>Estado:</strong> {nominaPreviewData.estado} - ID: {nominaPreviewData.id_nomina}
                        </p>
                        <p className={`text-xs ${
                          nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'text-green-600 dark:text-green-400'
                            : nominaPreviewData.pago_parcial
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado'
                            ? 'Nómina completada y PDF generado'
                            : nominaPreviewData.pago_parcial
                            ? 'Pago parcial - Pendiente de liquidación'
                            : 'Nómina en borrador - Pendiente de confirmación'
                          }
                        </p>
                      </div>
                    </div>
                    {nominaPreviewData.pago_parcial && (
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">
                          Pago Parcial
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del Empleado */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información del Empleado</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedEmpleadoPreview.nombre} {selectedEmpleadoPreview.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">NSS</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedEmpleadoPreview.nss}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">RFC</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedEmpleadoPreview.rfc}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Proyecto</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedEmpleadoPreview.proyecto?.nombre || 'Sin proyecto'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Detalles de la Nómina */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Detalles de la Nómina</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Período</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(() => {
                          // Usar fecha actual si no hay fecha de creación
                          const fecha = nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt ? 
                            new Date(nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt) : 
                            new Date();
                          const año = fecha.getFullYear();
                          const mes = fecha.getMonth() + 1;
                          return `${año}-${String(mes).padStart(2, '0')}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Semana</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {(() => {
                          // Usar fecha actual si no hay fecha de creación
                          const fecha = nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt ? 
                            new Date(nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt) : 
                            new Date();
                          
                          // Usar el mismo algoritmo que el wizard
                          function calcularSemanaDelMes(fecha) {
                            const primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
                            const primerLunesDelMes = new Date(primerDiaDelMes);
                            
                            const diaDeLaSemana = primerDiaDelMes.getDay();
                            const diasHastaLunes = diaDeLaSemana === 0 ? 1 : 8 - diaDeLaSemana;
                            primerLunesDelMes.setDate(primerDiaDelMes.getDate() + diasHastaLunes);
                            
                            if (primerLunesDelMes.getMonth() !== fecha.getMonth()) {
                              primerLunesDelMes.setTime(primerDiaDelMes.getTime());
                            }
                            
                            const diasTranscurridos = Math.floor((fecha - primerLunesDelMes) / (1000 * 60 * 60 * 24));
                            const semanaDelMes = Math.floor(diasTranscurridos / 7) + 1;
                            
                            return Math.max(1, Math.min(4, semanaDelMes));
                          }
                          
                          const semanaFinal = calcularSemanaDelMes(fecha);
                          return `Semana ${semanaFinal}`;
                        })()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Días Laborados</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {nominaPreviewData.es_pago_semanal ? 6 : (nominaPreviewData.dias_laborados || 'N/A')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Pago Semanal</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(nominaPreviewData.pago_semanal || 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fecha de Creación</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(nominaPreviewData.fecha_creacion || nominaPreviewData.createdAt).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cálculos */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Cálculos</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Salario Base:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(nominaPreviewData.pago_semanal || 0)}
                      </span>
                    </div>
                    {nominaPreviewData.horas_extra > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Horas Extra:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(nominaPreviewData.horas_extra || 0)}                                                                                      
                        </span>
                      </div>
                    )}
                    {nominaPreviewData.bonos > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Bonos:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(nominaPreviewData.bonos || 0)}
                        </span>
                      </div>
                    )}
                    {nominaPreviewData.deducciones > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deducciones:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(nominaPreviewData.deducciones || 0)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                      {nominaPreviewData.pago_parcial ? (
                        <>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Monto Original:</span>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {formatCurrency(nominaPreviewData.monto_total || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Monto Pagado:</span>
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(nominaPreviewData.monto_pagado || 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-lg font-medium text-gray-900 dark:text-white">Pendiente:</span>
                            <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                              {formatCurrency((nominaPreviewData.monto_total || 0) - (nominaPreviewData.monto_pagado || 0))}
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex justify-between">
                          <span className="text-lg font-medium text-gray-900 dark:text-white">Total a Pagar:</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(nominaPreviewData.monto_total || 0)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer del Preview */}
              <div className="flex justify-between px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('🔍 [BOTON] Botón Editar Nómina clickeado');
                      editarNominaDesdePreview();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  >
                    <PencilIcon className="h-4 w-4 mr-2 inline-block" />
                    Editar Nómina
                  </button>
                </div>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNominaPreview(false);
                      setNominaPreviewData(null);
                      setSelectedEmpleadoPreview(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cerrar
                  </button>
                  {(nominaPreviewData.estado === 'borrador' || nominaPreviewData.estado === 'Borrador' || nominaPreviewData.estado === 'Pendiente') && (
                    <button
                      type="button"
                      onClick={generarPDFDesdePreview}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2 inline-block" />
                      Generar PDF y Marcar como Pagada
                    </button>
                  )}
                  {nominaPreviewData.estado === 'pagada' || nominaPreviewData.estado === 'Pagado' ? (
                    <button
                      type="button"
                      onClick={generarPDFDesdePreview}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-2 inline-block" />
                      Descargar PDF
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Detalles de Nómina - Placeholder para futuras implementaciones */}
      {showNominaDetails && selectedNomina && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="relative mx-auto p-0 border border-gray-200 dark:border-gray-700 w-full max-w-2xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                    <EyeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Detalles de la Nómina
                  </h3>
                </div>
                <button
                  onClick={() => setShowNominaDetails(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircleIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Información de la Nómina
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Empleado:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNomina.empleado?.nombre} {selectedNomina.empleado?.apellido}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Período:</span>
                        <p className="font-medium text-gray-900 dark:text-white">
                        {selectedNomina.periodo || 'N/A'}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Monto:</span>
                        <p className="font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(selectedNomina.monto_total || selectedNomina.monto || 0)}
                        </p>
                      </div>
                      <div>
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedNomina.estado === 'pagada' || selectedNomina.estado === 'Pagado' || selectedNomina.estado === 'pagado'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : selectedNomina.estado === 'pendiente' || selectedNomina.estado === 'Pendiente'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : selectedNomina.estado === 'Aprobada' || selectedNomina.estado === 'aprobada'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {selectedNomina.estado}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setShowNominaDetails(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial de Adeudos */}
      {showAdeudosHistorial && (
        <AdeudosHistorial
          empleado={selectedEmpleadoAdeudos}
          onClose={() => setShowAdeudosHistorial(false)}
          onAdeudoLiquidado={handleAdeudoLiquidado}
        />
      )}

      {/* Modal de Liquidar Adeudo */}
      {showLiquidarModal && nominaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Liquidar Adeudo
              </h3>
              <button
                onClick={() => setShowLiquidarModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {nominaSeleccionada.empleado?.nombre} {nominaSeleccionada.empleado?.apellido}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Total
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(nominaSeleccionada.monto_total || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Ya Pagado
                </label>
                <p className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(nominaSeleccionada.monto_pagado || 0)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto Pendiente
                </label>
                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                  {formatCurrency((nominaSeleccionada.monto_total || 0) - (nominaSeleccionada.monto_pagado || 0))}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto a Liquidar *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max={(nominaSeleccionada.monto_total || 0) - (nominaSeleccionada.monto_pagado || 0)}
                  value={montoLiquidacion}
                  onChange={(e) => setMontoLiquidacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Observaciones
                </label>
                <textarea
                  value={observacionesLiquidacion}
                  onChange={(e) => setObservacionesLiquidacion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Observaciones sobre el pago..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowLiquidarModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={liquidarAdeudo}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors duration-200"
              >
                Liquidar Adeudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
