import React, { useState, useEffect, useRef } from 'react';
import { 
  DocumentTextIcon,
  UserIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  PlusIcon,
  TrashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CalculatorIcon,
  ChartBarIcon,
  CpuChipIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { PresupuestosService } from '../../services/presupuestos/presupuestosService';
import { ConceptoObraService } from '../../services/presupuestos/conceptoObraService';
import { PreciosUnitariosService } from '../../services/presupuestos/preciosUnitariosService';
import { CatalogosService } from '../../services/presupuestos/catalogosService';
import PartidaSelector from './components/PartidaSelector';
import CalculadoraCostos from './components/CalculadoraCostos';
import ExportacionProfesional from './components/ExportacionProfesional';

/**
 * Advanced Presupuesto Creator - Similar a Opus
 * Wizard completo para crear presupuestos profesionales con integración de catálogos
 */
const AdvancedPresupuestoCreator = () => {
  // Estados principales del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Datos del presupuesto
  const [presupuestoData, setPresupuestoData] = useState({
    // Información básica
    codigo: '',
    nombre: '',
    descripcion: '',
    cliente: {
      nombre: '',
      contacto: '',
      direccion: '',
      telefono: '',
      email: ''
    },
    proyecto: {
      nombre: '',
      ubicacion: '',
      tipo: '',
      descripcion: ''
    },
    
    // Configuración financiera
    moneda: 'MXN',
    region: 'nacional',
    catalogo_id: '',
    fecha_validez: '',
    fecha_limite: '',
    
    // Márgenes y configuración
    margen_utilidad: 0.1,
    incluir_iva: true,
    tasa_iva: 0.16,
    aplicar_descuentos: false,
    descuento_global: 0,
    tipo_descuento: 'porcentaje',
    
    // Partidas y cálculos
    partidas: [],
    subtotal: 0,
    total_utilidad: 0,
    total_impuestos: 0,
    descuentos: 0,
    total: 0,
    
    // Configuración adicional
    prioridad: 'media',
    confidencial: false,
    observaciones: '',
    
    // Datos para exportación
    logo_empresa: '',
    datos_empresa: {
      razon_social: 'V-LOCK CONSTRUCCIONES S.A. DE C.V.',
      rfc: 'VLC123456ABC',
      direccion: 'Av. Construcción 123, Col. Industrial',
      telefono: '+52 (55) 1234-5678',
      email: 'contacto@vlock.com.mx',
      sitio_web: 'www.vlock.com.mx'
    }
  });

  // Estados para el wizard
  const [catalogos, setCatalogos] = useState([]);
  const [conceptos, setConceptos] = useState([]);
  const [precios, setPrecios] = useState([]);
  const [busquedaConcepto, setBusquedaConcepto] = useState('');
  const [conceptosFiltrados, setConceptosFiltrados] = useState([]);
  const [mostrarCalculadora, setMostrarCalculadora] = useState(false);
  const [mostrarExportacion, setMostrarExportacion] = useState(false);

  const partidasSectionRef = useRef(null);

  // Definición de pasos del wizard
  const steps = [
    {
      id: 1,
      title: 'Información General',
      description: 'Datos básicos del presupuesto',
      icon: DocumentTextIcon,
      isComplete: () => {
        return presupuestoData.codigo && presupuestoData.nombre && 
               presupuestoData.cliente.nombre && presupuestoData.proyecto.nombre;
      }
    },
    {
      id: 2,
      title: 'Configuración Financiera',
      description: 'Moneda, márgenes y configuración',
      icon: CurrencyDollarIcon,
      isComplete: () => {
        return presupuestoData.moneda && presupuestoData.catalogo_id && 
               presupuestoData.margen_utilidad >= 0;
      }
    },
    {
      id: 3,
      title: 'Selección de Partidas',
      description: 'Conceptos y cantidades',
      icon: ClipboardDocumentCheckIcon,
      isComplete: () => {
        return presupuestoData.partidas.length > 0 && 
               presupuestoData.partidas.every(p => p.cantidad > 0);
      }
    },
    {
      id: 4,
      title: 'Revisión y Cálculo',
      description: 'Verificar totales y ajustes',
      icon: CalculatorIcon,
      isComplete: () => {
        return presupuestoData.total > 0;
      }
    },
    {
      id: 5,
      title: 'Exportación',
      description: 'Generar documentos profesionales',
      icon: DocumentArrowDownIcon,
      isComplete: () => false // Siempre disponible una vez que llegues aquí
    }
  ];

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Filtrar conceptos por búsqueda
  useEffect(() => {
    if (busquedaConcepto.trim()) {
      const filtrados = conceptos.filter(concepto =>
        concepto.descripcion.toLowerCase().includes(busquedaConcepto.toLowerCase()) ||
        concepto.codigo.toLowerCase().includes(busquedaConcepto.toLowerCase()) ||
        concepto.unidad.toLowerCase().includes(busquedaConcepto.toLowerCase())
      );
      setConceptosFiltrados(filtrados);
    } else {
      setConceptosFiltrados(conceptos.slice(0, 50)); // Mostrar solo los primeros 50
    }
  }, [busquedaConcepto, conceptos]);

  // Recalcular totales cuando cambien las partidas
  useEffect(() => {
    recalcularTotales();
  }, [presupuestoData.partidas, presupuestoData.margen_utilidad, presupuestoData.tasa_iva, presupuestoData.descuento_global]);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [catalogosData, conceptosData, preciosData] = await Promise.all([
        CatalogosService.getAll(),
        ConceptoObraService.getAll(),
        PreciosUnitariosService.getAll({ region: presupuestoData.region })
      ]);
      
      setCatalogos(catalogosData);
      setConceptos(conceptosData);
      setPrecios(preciosData);
      
      // Generar código automático
      const nuevoNumero = `PRES-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      setPresupuestoData(prev => ({
        ...prev,
        codigo: nuevoNumero
      }));
      
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const recalcularTotales = () => {
    const subtotal = presupuestoData.partidas.reduce((sum, partida) => {
      return sum + (partida.cantidad * partida.precio_unitario);
    }, 0);

    const utilidad = subtotal * presupuestoData.margen_utilidad;
    const subtotalConUtilidad = subtotal + utilidad;
    
    let descuentos = 0;
    if (presupuestoData.aplicar_descuentos) {
      if (presupuestoData.tipo_descuento === 'porcentaje') {
        descuentos = subtotalConUtilidad * (presupuestoData.descuento_global / 100);
      } else {
        descuentos = presupuestoData.descuento_global;
      }
    }

    const subtotalConDescuento = subtotalConUtilidad - descuentos;
    const impuestos = presupuestoData.incluir_iva ? subtotalConDescuento * presupuestoData.tasa_iva : 0;
    const total = subtotalConDescuento + impuestos;

    setPresupuestoData(prev => ({
      ...prev,
      subtotal,
      total_utilidad: utilidad,
      total_impuestos: impuestos,
      descuentos,
      total
    }));
  };

  const handleInputChange = (field, value, subfield = null) => {
    if (subfield) {
      setPresupuestoData(prev => ({
        ...prev,
        [field]: {
          ...prev[field],
          [subfield]: value
        }
      }));
    } else {
      setPresupuestoData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Limpiar errores del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const agregarPartida = (concepto) => {
    // Buscar precio actual para este concepto
    const precioActual = precios.find(p => 
      p.concepto_id === concepto.id_concepto_obra && 
      p.region === presupuestoData.region
    );

    const nuevaPartida = {
      id: Date.now(),
      concepto_id: concepto.id_concepto_obra,
      codigo: concepto.codigo,
      descripcion: concepto.descripcion,
      unidad: concepto.unidad,
      cantidad: 1,
      precio_unitario: precioActual?.precio || 0,
      importe: precioActual?.precio || 0,
      observaciones: ''
    };

    setPresupuestoData(prev => ({
      ...prev,
      partidas: [...prev.partidas, nuevaPartida]
    }));

    // Scroll to partidas section
    if (partidasSectionRef.current) {
      partidasSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const actualizarPartida = (partidaId, campo, valor) => {
    setPresupuestoData(prev => ({
      ...prev,
      partidas: prev.partidas.map(partida => {
        if (partida.id === partidaId) {
          const partidaActualizada = { ...partida, [campo]: valor };
          if (campo === 'cantidad' || campo === 'precio_unitario') {
            partidaActualizada.importe = partidaActualizada.cantidad * partidaActualizada.precio_unitario;
          }
          return partidaActualizada;
        }
        return partida;
      })
    }));
  };

  const eliminarPartida = (partidaId) => {
    setPresupuestoData(prev => ({
      ...prev,
      partidas: prev.partidas.filter(partida => partida.id !== partidaId)
    }));
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!presupuestoData.codigo.trim()) newErrors.codigo = 'El código es obligatorio';
        if (!presupuestoData.nombre.trim()) newErrors.nombre = 'El nombre es obligatorio';
        if (!presupuestoData.cliente.nombre.trim()) newErrors.cliente_nombre = 'El cliente es obligatorio';
        if (!presupuestoData.proyecto.nombre.trim()) newErrors.proyecto_nombre = 'El proyecto es obligatorio';
        break;
      case 2:
        if (!presupuestoData.catalogo_id) newErrors.catalogo_id = 'Selecciona un catálogo de precios';
        if (presupuestoData.margen_utilidad < 0) newErrors.margen_utilidad = 'El margen no puede ser negativo';
        break;
      case 3:
        if (presupuestoData.partidas.length === 0) newErrors.partidas = 'Agrega al menos una partida';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const guardarPresupuesto = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const presupuestoFinal = {
        ...presupuestoData,
        estado: 'borrador',
        fecha_creacion: new Date().toISOString()
      };

      await PresupuestosService.create(presupuestoFinal);
      
      // Mostrar éxito y redirigir
      alert('Presupuesto creado exitosamente');
      // TODO: Implementar navegación
      
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      alert('Error al guardar el presupuesto');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: presupuestoData.moneda
    }).format(amount || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header del wizard */}
      <div className="bg-white dark:bg-gray-800 shadow-lg border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <CalculatorIcon className="h-8 w-8 text-primary-600 mr-3" />
                Nuevo Presupuesto Profesional
              </h1>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Creador avanzado similar a Opus - Paso {currentStep} de {steps.length}
              </p>
            </div>
            
            {/* Indicador de progreso */}
            <div className="flex items-center space-x-2">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                    ${currentStep >= step.id 
                      ? 'bg-primary-600 border-primary-600 text-white' 
                      : step.isComplete()
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                    }
                  `}>
                    {step.isComplete() && currentStep > step.id ? (
                      <CheckCircleIcon className="h-5 w-5" />
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      w-12 h-0.5 transition-all duration-300
                      ${currentStep > step.id ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Título del paso actual */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {steps[currentStep - 1]?.title}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {steps[currentStep - 1]?.description}
            </p>
          </div>
        </div>
      </div>

      {/* Contenido del wizard */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Paso 1: Información General */}
        {currentStep === 1 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Información del Presupuesto */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-primary-600 mr-2" />
                    Información del Presupuesto
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Código del Presupuesto *
                    </label>
                    <input
                      type="text"
                      value={presupuestoData.codigo}
                      onChange={(e) => handleInputChange('codigo', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        errors.codigo ? 'border-red-300' : ''
                      }`}
                      placeholder="PRES-2025-001"
                    />
                    {errors.codigo && <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Nombre del Presupuesto *
                    </label>
                    <input
                      type="text"
                      value={presupuestoData.nombre}
                      onChange={(e) => handleInputChange('nombre', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        errors.nombre ? 'border-red-300' : ''
                      }`}
                      placeholder="Construcción de Casa Habitación"
                    />
                    {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción
                    </label>
                    <textarea
                      value={presupuestoData.descripcion}
                      onChange={(e) => handleInputChange('descripcion', e.target.value)}
                      rows={3}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      placeholder="Descripción detallada del presupuesto..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Prioridad
                      </label>
                      <select
                        value={presupuestoData.prioridad}
                        onChange={(e) => handleInputChange('prioridad', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="baja">Baja</option>
                        <option value="media">Media</option>
                        <option value="alta">Alta</option>
                        <option value="urgente">Urgente</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={presupuestoData.confidencial}
                        onChange={(e) => handleInputChange('confidencial', e.target.checked)}
                        className="mr-2 rounded"
                      />
                      <label className="text-sm text-gray-700 dark:text-gray-300">
                        Presupuesto confidencial
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información del Cliente y Proyecto */}
              <div className="space-y-6">
                {/* Cliente */}
                <div>
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <UserIcon className="h-5 w-5 text-primary-600 mr-2" />
                      Información del Cliente
                    </h3>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del Cliente *
                      </label>
                      <input
                        type="text"
                        value={presupuestoData.cliente.nombre}
                        onChange={(e) => handleInputChange('cliente', e.target.value, 'nombre')}
                        className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                          errors.cliente_nombre ? 'border-red-300' : ''
                        }`}
                        placeholder="Nombre completo o razón social"
                      />
                      {errors.cliente_nombre && <p className="mt-1 text-sm text-red-600">{errors.cliente_nombre}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Contacto
                        </label>
                        <input
                          type="text"
                          value={presupuestoData.cliente.contacto}
                          onChange={(e) => handleInputChange('cliente', e.target.value, 'contacto')}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          placeholder="Persona de contacto"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={presupuestoData.cliente.telefono}
                          onChange={(e) => handleInputChange('cliente', e.target.value, 'telefono')}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          placeholder="+52 (55) 1234-5678"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <input
                        type="email"
                        value={presupuestoData.cliente.email}
                        onChange={(e) => handleInputChange('cliente', e.target.value, 'email')}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="cliente@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Dirección
                      </label>
                      <textarea
                        value={presupuestoData.cliente.direccion}
                        onChange={(e) => handleInputChange('cliente', e.target.value, 'direccion')}
                        rows={2}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="Dirección completa del cliente"
                      />
                    </div>
                  </div>
                </div>

                {/* Proyecto */}
                <div>
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                      <BuildingOfficeIcon className="h-5 w-5 text-primary-600 mr-2" />
                      Información del Proyecto
                    </h3>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Nombre del Proyecto *
                      </label>
                      <input
                        type="text"
                        value={presupuestoData.proyecto.nombre}
                        onChange={(e) => handleInputChange('proyecto', e.target.value, 'nombre')}
                        className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                          errors.proyecto_nombre ? 'border-red-300' : ''
                        }`}
                        placeholder="Nombre del proyecto de construcción"
                      />
                      {errors.proyecto_nombre && <p className="mt-1 text-sm text-red-600">{errors.proyecto_nombre}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Tipo de Proyecto
                        </label>
                        <select
                          value={presupuestoData.proyecto.tipo}
                          onChange={(e) => handleInputChange('proyecto', e.target.value, 'tipo')}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        >
                          <option value="">Seleccionar tipo</option>
                          <option value="residencial">Residencial</option>
                          <option value="comercial">Comercial</option>
                          <option value="industrial">Industrial</option>
                          <option value="infraestructura">Infraestructura</option>
                          <option value="remodelacion">Remodelación</option>
                          <option value="ampliacion">Ampliación</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Ubicación
                        </label>
                        <input
                          type="text"
                          value={presupuestoData.proyecto.ubicacion}
                          onChange={(e) => handleInputChange('proyecto', e.target.value, 'ubicacion')}
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                          placeholder="Ciudad, Estado"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Descripción del Proyecto
                      </label>
                      <textarea
                        value={presupuestoData.proyecto.descripcion}
                        onChange={(e) => handleInputChange('proyecto', e.target.value, 'descripcion')}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                        placeholder="Descripción detallada del alcance del proyecto..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Configuración Financiera */}
        {currentStep === 2 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Configuración Básica */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 text-primary-600 mr-2" />
                    Configuración Financiera
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Moneda
                      </label>
                      <select
                        value={presupuestoData.moneda}
                        onChange={(e) => handleInputChange('moneda', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="MXN">Peso Mexicano (MXN)</option>
                        <option value="USD">Dólar Americano (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Región
                      </label>
                      <select
                        value={presupuestoData.region}
                        onChange={(e) => handleInputChange('region', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                      >
                        <option value="nacional">Nacional</option>
                        <option value="norte">Región Norte</option>
                        <option value="centro">Región Centro</option>
                        <option value="sur">Región Sur</option>
                        <option value="bajio">Región Bajío</option>
                        <option value="sureste">Región Sureste</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Catálogo de Precios *
                    </label>
                    <select
                      value={presupuestoData.catalogo_id}
                      onChange={(e) => handleInputChange('catalogo_id', e.target.value)}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        errors.catalogo_id ? 'border-red-300' : ''
                      }`}
                    >
                      <option value="">Seleccionar catálogo</option>
                      {catalogos.map(catalogo => (
                        <option key={catalogo.id} value={catalogo.id}>
                          {catalogo.nombre} - v{catalogo.version} ({catalogo.fecha_vigencia})
                        </option>
                      ))}
                    </select>
                    {errors.catalogo_id && <p className="mt-1 text-sm text-red-600">{errors.catalogo_id}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Margen de Utilidad (%)
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={presupuestoData.margen_utilidad * 100}
                        onChange={(e) => handleInputChange('margen_utilidad', parseFloat(e.target.value) / 100 || 0)}
                        className={`block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                          errors.margen_utilidad ? 'border-red-300' : ''
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <span className="text-gray-500 sm:text-sm">%</span>
                      </div>
                    </div>
                    {errors.margen_utilidad && <p className="mt-1 text-sm text-red-600">{errors.margen_utilidad}</p>}
                  </div>
                </div>
              </div>

              {/* Configuración de Impuestos y Descuentos */}
              <div className="space-y-6">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Impuestos y Descuentos
                  </h3>
                </div>

                <div className="space-y-4">
                  {/* IVA */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-green-800 dark:text-green-400">
                        Configuración de IVA
                      </label>
                      <input
                        type="checkbox"
                        checked={presupuestoData.incluir_iva}
                        onChange={(e) => handleInputChange('incluir_iva', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    {presupuestoData.incluir_iva && (
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Tasa de IVA (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={presupuestoData.tasa_iva * 100}
                          onChange={(e) => handleInputChange('tasa_iva', parseFloat(e.target.value) / 100 || 0)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    )}
                  </div>

                  {/* Descuentos */}
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-orange-800 dark:text-orange-400">
                        Descuento Global
                      </label>
                      <input
                        type="checkbox"
                        checked={presupuestoData.aplicar_descuentos}
                        onChange={(e) => handleInputChange('aplicar_descuentos', e.target.checked)}
                        className="rounded"
                      />
                    </div>
                    {presupuestoData.aplicar_descuentos && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Tipo
                          </label>
                          <select
                            value={presupuestoData.tipo_descuento}
                            onChange={(e) => handleInputChange('tipo_descuento', e.target.value)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
                          >
                            <option value="porcentaje">Porcentaje</option>
                            <option value="fijo">Cantidad Fija</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                            Descuento
                          </label>
                          <input
                            type="number"
                            min="0"
                            step={presupuestoData.tipo_descuento === 'porcentaje' ? '0.1' : '1'}
                            value={presupuestoData.descuento_global}
                            onChange={(e) => handleInputChange('descuento_global', parseFloat(e.target.value) || 0)}
                            className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-orange-500 focus:ring-orange-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Fechas */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-3">
                      Vigencia del Presupuesto
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Fecha de Validez
                        </label>
                        <input
                          type="date"
                          value={presupuestoData.fecha_validez}
                          onChange={(e) => handleInputChange('fecha_validez', e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Fecha Límite
                        </label>
                        <input
                          type="date"
                          value={presupuestoData.fecha_limite}
                          onChange={(e) => handleInputChange('fecha_limite', e.target.value)}
                          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 3: Selección de Partidas */}
        {currentStep === 3 && (
          <div className="space-y-6">
            {/* Buscador de conceptos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <MagnifyingGlassIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Catálogo de Conceptos
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar conceptos..."
                    value={busquedaConcepto}
                    onChange={(e) => setBusquedaConcepto(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {conceptosFiltrados.map(concepto => (
                  <div
                    key={concepto.id_concepto_obra}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => agregarPartida(concepto)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                        {concepto.codigo}
                      </h4>
                      <PlusIcon className="h-5 w-5 text-primary-600 hover:text-primary-700" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                      {concepto.descripcion}
                    </p>
                    <div className="flex justify-between items-center text-xs">
                      <span className="bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                        {concepto.unidad}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {concepto.categoria}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de Partidas Agregadas */}
            <div ref={partidasSectionRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
                  <ClipboardDocumentCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Partidas del Presupuesto ({presupuestoData.partidas.length})
                </h3>
                {presupuestoData.partidas.length > 0 && (
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(presupuestoData.subtotal)}
                    </p>
                  </div>
                )}
              </div>

              {presupuestoData.partidas.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay partidas agregadas</p>
                  <p className="text-sm">Busca y selecciona conceptos del catálogo</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Descripción
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Unidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cantidad
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Precio Unit.
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Importe
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                      {presupuestoData.partidas.map(partida => (
                        <tr key={partida.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {partida.codigo}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={partida.descripcion}>
                              {partida.descripcion}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                            {partida.unidad}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={partida.cantidad}
                              onChange={(e) => actualizarPartida(partida.id, 'cantidad', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={partida.precio_unitario}
                              onChange={(e) => actualizarPartida(partida.id, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(partida.importe)}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <button
                              onClick={() => eliminarPartida(partida.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {errors.partidas && (
                <p className="mt-2 text-sm text-red-600">{errors.partidas}</p>
              )}
            </div>
          </div>
        )}

        {/* Paso 4: Revisión y Cálculo */}
        {currentStep === 4 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="space-y-8">
              {/* Resumen del Presupuesto */}
              <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                  <ChartBarIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Resumen del Presupuesto
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">Información General</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Código:</span> {presupuestoData.codigo}</p>
                      <p><span className="font-medium">Cliente:</span> {presupuestoData.cliente.nombre}</p>
                      <p><span className="font-medium">Proyecto:</span> {presupuestoData.proyecto.nombre}</p>
                      <p><span className="font-medium">Partidas:</span> {presupuestoData.partidas.length}</p>
                    </div>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-400">Configuración</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Moneda:</span> {presupuestoData.moneda}</p>
                      <p><span className="font-medium">Región:</span> {presupuestoData.region}</p>
                      <p><span className="font-medium">Utilidad:</span> {(presupuestoData.margen_utilidad * 100).toFixed(1)}%</p>
                      <p><span className="font-medium">IVA:</span> {presupuestoData.incluir_iva ? `${(presupuestoData.tasa_iva * 100).toFixed(1)}%` : 'No'}</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-purple-800 dark:text-purple-400">Vigencia</h4>
                    <div className="mt-2 space-y-1 text-sm">
                      <p><span className="font-medium">Validez:</span> {presupuestoData.fecha_validez || 'No definida'}</p>
                      <p><span className="font-medium">Límite:</span> {presupuestoData.fecha_limite || 'No definida'}</p>
                      <p><span className="font-medium">Prioridad:</span> {presupuestoData.prioridad}</p>
                      <p><span className="font-medium">Confidencial:</span> {presupuestoData.confidencial ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cálculos Detallados */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center mb-4">
                  <CalculatorIcon className="h-5 w-5 text-primary-600 mr-2" />
                  Cálculos Detallados
                </h3>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-700 dark:text-gray-300">Subtotal (Materiales y Mano de Obra):</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(presupuestoData.subtotal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-t border-gray-200 dark:border-gray-600">
                      <span className="text-gray-700 dark:text-gray-300">
                        Utilidad ({(presupuestoData.margen_utilidad * 100).toFixed(1)}%):
                      </span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        + {formatCurrency(presupuestoData.total_utilidad)}
                      </span>
                    </div>

                    {presupuestoData.aplicar_descuentos && presupuestoData.descuentos > 0 && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 dark:text-gray-300">
                          Descuento ({presupuestoData.tipo_descuento === 'porcentaje' ? `${presupuestoData.descuento_global}%` : 'Fijo'}):
                        </span>
                        <span className="font-semibold text-orange-600 dark:text-orange-400">
                          - {formatCurrency(presupuestoData.descuentos)}
                        </span>
                      </div>
                    )}

                    {presupuestoData.incluir_iva && (
                      <div className="flex justify-between items-center py-2">
                        <span className="text-gray-700 dark:text-gray-300">
                          IVA ({(presupuestoData.tasa_iva * 100).toFixed(1)}%):
                        </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          + {formatCurrency(presupuestoData.total_impuestos)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 dark:border-gray-600">
                      <span className="text-lg font-bold text-gray-900 dark:text-white">TOTAL:</span>
                      <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatCurrency(presupuestoData.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción para recálculo */}
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={recalcularTotales}
                    className="flex items-center px-4 py-2 text-sm font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-900/50 rounded-md transition-colors"
                  >
                    <CalculatorIcon className="h-4 w-4 mr-2" />
                    Recalcular
                  </button>
                  <button
                    onClick={() => setMostrarCalculadora(true)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                  >
                    <CpuChipIcon className="h-4 w-4 mr-2" />
                    Análisis Avanzado
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 5: Exportación */}
        {currentStep === 5 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                ¡Presupuesto Completado!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Tu presupuesto está listo. Ahora puedes exportarlo en diferentes formatos profesionales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <button
                onClick={() => setMostrarExportacion('pdf')}
                className="flex flex-col items-center p-6 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 transition-colors"
              >
                <DocumentArrowDownIcon className="h-8 w-8 text-red-600 mb-2" />
                <span className="font-medium text-red-800 dark:text-red-400">Exportar PDF</span>
                <span className="text-xs text-red-600 dark:text-red-500">Formato profesional</span>
              </button>

              <button
                onClick={() => setMostrarExportacion('excel')}
                className="flex flex-col items-center p-6 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800 transition-colors"
              >
                <DocumentTextIcon className="h-8 w-8 text-green-600 mb-2" />
                <span className="font-medium text-green-800 dark:text-green-400">Exportar Excel</span>
                <span className="text-xs text-green-600 dark:text-green-500">Análisis detallado</span>
              </button>

              <button
                onClick={() => setMostrarExportacion('word')}
                className="flex flex-col items-center p-6 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
              >
                <DocumentTextIcon className="h-8 w-8 text-blue-600 mb-2" />
                <span className="font-medium text-blue-800 dark:text-blue-400">Exportar Word</span>
                <span className="text-xs text-blue-600 dark:text-blue-500">Propuesta comercial</span>
              </button>

              <button
                onClick={() => setMostrarExportacion('print')}
                className="flex flex-col items-center p-6 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800 transition-colors"
              >
                <PrinterIcon className="h-8 w-8 text-purple-600 mb-2" />
                <span className="font-medium text-purple-800 dark:text-purple-400">Imprimir</span>
                <span className="text-xs text-purple-600 dark:text-purple-500">Vista de impresión</span>
              </button>
            </div>

            {/* Resumen final */}
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-4">Resumen Final del Presupuesto</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    {presupuestoData.partidas.length}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Partidas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(presupuestoData.subtotal)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Subtotal</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {(presupuestoData.margen_utilidad * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Utilidad</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(presupuestoData.total)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Total</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navegación del wizard */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`
              flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${currentStep === 1 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
              }
            `}
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Anterior
          </button>

          <div className="flex space-x-3">
            {currentStep < steps.length && (
              <button
                onClick={nextStep}
                disabled={!steps[currentStep - 1]?.isComplete()}
                className={`
                  flex items-center px-6 py-2 text-sm font-medium rounded-md transition-colors
                  ${steps[currentStep - 1]?.isComplete()
                    ? 'text-white bg-primary-600 hover:bg-primary-700' 
                    : 'text-gray-400 bg-gray-200 dark:bg-gray-700 cursor-not-allowed'
                  }
                `}
              >
                Siguiente
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              </button>
            )}
            
            {currentStep === steps.length && (
              <button
                onClick={guardarPresupuesto}
                disabled={isLoading}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors"
              >
                {isLoading ? 'Guardando...' : 'Finalizar Presupuesto'}
                <CheckCircleIcon className="h-4 w-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modales adicionales */}
      {mostrarCalculadora && (
        <CalculadoraCostos
          presupuestoData={presupuestoData}
          onActualizar={handleInputChange}
          onClose={() => setMostrarCalculadora(false)}
        />
      )}

      {mostrarExportacion && (
        <ExportacionProfesional
          isOpen={!!mostrarExportacion}
          onClose={() => setMostrarExportacion(false)}
          presupuestoData={presupuestoData}
          formato={mostrarExportacion}
        />
      )}
    </div>
  );
};

export default AdvancedPresupuestoCreator;
