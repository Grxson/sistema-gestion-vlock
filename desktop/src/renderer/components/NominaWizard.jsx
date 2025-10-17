import React, { useState, useEffect } from 'react';
import nominasServices from '../services/nominas';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { 
  detectarSemanaActual, 
  generarPeriodoActual, 
  generarInfoSemana,
  validarSemana 
} from '../utils/weekCalculator';
import {
  PlusIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ClockIcon,
  UserGroupIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

const NominaWizardSimplificado = ({ isOpen, onClose, onSuccess, empleados = [], selectedEmpleado, nominaToEdit }) => {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  // Debug: verificar empleados recibidos (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [NominaWizard] Empleados recibidos:', empleados.length, empleados);
  }
  
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [processingNomina, setProcessingNomina] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoInput, setPagoInput] = useState('500.00');
  
  // Generar período actual automáticamente
  const generarPeriodoActual = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = ahora.getMonth() + 1; // getMonth() devuelve 0-11, necesitamos 1-12
    return `${año}-${mes.toString().padStart(2, '0')}`;
  };

  // Las funciones de detección de semana ahora se importan desde weekCalculator.js

  // Datos del formulario
  const [formData, setFormData] = useState({
    selectedPeriodo: generarPeriodoActual(), // Auto-llenar con período actual
    semanaNum: detectarSemanaActual(), // Auto-detectar semana del mes
    selectedEmpleado: null,
    searchTerm: '',
    diasLaborados: 6,
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    aplicarISR: false, // Siempre false por defecto
    aplicarIMSS: false, // Siempre false por defecto
    aplicarInfonavit: false, // Siempre false por defecto
    // Nuevos campos para pagos parciales
    pagoParcial: false,
    montoAPagar: 0,
    liquidarAdeudos: false
  });

  // Debug: Log cuando se inicializa el formulario
  useEffect(() => {
    console.log('🔍 [NominaWizard] Formulario inicializado con valores:', {
      aplicarISR: formData.aplicarISR,
      aplicarIMSS: formData.aplicarIMSS,
      aplicarInfonavit: formData.aplicarInfonavit
    });
  }, []);

  // Cálculos de nómina
  const [calculoNomina, setCalculoNomina] = useState(null);
  const [validacion, setValidacion] = useState(null);
  const [adeudosEmpleado, setAdeudosEmpleado] = useState(0);
  const [verificacionDuplicados, setVerificacionDuplicados] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [nominaGenerada, setNominaGenerada] = useState(null);

  // Filtrar empleados por búsqueda y solo mostrar activos
  const empleadosFiltrados = Array.isArray(empleados) 
    ? empleados.filter(emp => 
        // Solo empleados activos
        (emp.activo === true || emp.activo === 1) &&
        // Y que coincidan con la búsqueda
        (emp.nombre?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
         emp.apellido?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
         emp.nss?.includes(formData.searchTerm) ||
         emp.rfc?.toLowerCase().includes(formData.searchTerm.toLowerCase()))
      )
    : [];
  
  // Debug: verificar empleados filtrados (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 [NominaWizard] Empleados filtrados:', empleadosFiltrados.length, 'para término:', formData.searchTerm);
  }

  // Calcular nómina cuando cambian los datos relevantes
  useEffect(() => {
    if (formData.selectedEmpleado && formData.selectedEmpleado.pago_semanal) {
      // Para pago semanal: calcular automáticamente cuando se selecciona empleado
      console.log('🔄 [WIZARD] Ejecutando cálculo automático por cambio en formData');
      calcularNomina();
    }
  }, [formData.selectedEmpleado, formData.horasExtra, formData.bonos, formData.deduccionesAdicionales, formData.aplicarISR, formData.aplicarIMSS, formData.aplicarInfonavit]);

  // Validar datos cuando cambian
  useEffect(() => {
    if (formData.selectedEmpleado) {
      validarDatos();
      cargarAdeudosEmpleado();
    }
  }, [formData.selectedEmpleado]);

  // Verificar duplicados cuando cambien empleado, período o semana
  useEffect(() => {
    if (formData.selectedEmpleado && formData.selectedPeriodo && formData.semanaNum) {
      verificarDuplicados();
    } else {
      setVerificacionDuplicados(null);
    }
  }, [formData.selectedEmpleado, formData.selectedPeriodo, formData.semanaNum]);

  // Auto-actualizar semana cuando cambie el período al período actual
  useEffect(() => {
    const periodoActual = generarPeriodoActual();
    if (formData.selectedPeriodo === periodoActual) {
      // Si se selecciona el período actual, actualizar la semana automáticamente
      const semanaActual = detectarSemanaActual();
      if (formData.semanaNum !== semanaActual) {
        updateFormData({ semanaNum: semanaActual });
      }
    }
  }, [formData.selectedPeriodo]);

  // Pre-llenar formulario cuando hay datos de nómina a editar
  useEffect(() => {
    if (nominaToEdit && isOpen) {
      console.log('🔍 [WIZARD] Pre-llenando formulario con datos de nómina:', nominaToEdit);
      
      // Calcular período y semana desde la fecha de creación
      const fechaCreacion = new Date(nominaToEdit.createdAt || nominaToEdit.fecha_creacion);
      const año = fechaCreacion.getFullYear();
      const mes = fechaCreacion.getMonth() + 1;
      const periodo = `${año}-${String(mes).padStart(2, '0')}`;
      
      // Calcular semana del mes
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
      
      const semanaDelMes = calcularSemanaDelMes(fechaCreacion);
      
      // Pre-llenar formulario con datos de la nómina
      setFormData({
        selectedPeriodo: periodo,
        semanaNum: semanaDelMes,
        selectedEmpleado: empleados.find(emp => emp.id_empleado === nominaToEdit.id_empleado) || null,
        searchTerm: '',
        diasLaborados: nominaToEdit.dias_laborados || 6,
        horasExtra: nominaToEdit.horas_extra || 0,
        bonos: nominaToEdit.bonos || 0,
        deduccionesAdicionales: nominaToEdit.deducciones_adicionales || 0,
        aplicarISR: nominaToEdit.aplicar_isr || false,
        aplicarIMSS: nominaToEdit.aplicar_imss || false,
        aplicarInfonavit: nominaToEdit.aplicar_infonavit || false,
        // Campos de pago parcial
        pagoParcial: nominaToEdit.pago_parcial || false,
        montoAPagar: nominaToEdit.monto_a_pagar || null,
        liquidarAdeudos: nominaToEdit.liquidar_adeudos || false
      });
      
      console.log('✅ [WIZARD] Formulario pre-llenado con datos de nómina');
      
      // Forzar recálculo después de pre-llenar
      setTimeout(() => {
        console.log('🔄 [WIZARD] Forzando recálculo después de pre-llenar...');
        calcularNomina();
      }, 100);
    }
  }, [nominaToEdit, isOpen, empleados]);

  // Cargar adeudos del empleado seleccionado
  const cargarAdeudosEmpleado = async () => {
    if (!formData.selectedEmpleado) return;
    
    try {
      const { adeudos } = nominasServices;
      const totalAdeudos = await adeudos.getTotalAdeudosPendientes(formData.selectedEmpleado.id_empleado);
      setAdeudosEmpleado(totalAdeudos);
    } catch (error) {
      console.error('Error loading employee debts:', error);
      setAdeudosEmpleado(0);
    }
  };

  // Verificar si ya existe una nómina para este empleado en esta semana del período
  const verificarDuplicados = async () => {
    if (!formData.selectedEmpleado || !formData.selectedPeriodo || !formData.semanaNum) {
      setVerificacionDuplicados(null);
      return;
    }

    try {
      console.log('🔍 [WIZARD] Verificando duplicados para:', {
        empleado: formData.selectedEmpleado.id_empleado,
        periodo: formData.selectedPeriodo,
        semana: formData.semanaNum
      });

      const response = await nominasServices.nominas.verificarDuplicados({
        id_empleado: formData.selectedEmpleado.id_empleado,
        periodo: formData.selectedPeriodo,
        semana: formData.semanaNum
      });

      console.log('🔍 [WIZARD] Resultado verificación duplicados:', response);
      setVerificacionDuplicados(response);
    } catch (error) {
      console.error('Error verificando duplicados:', error);
      setVerificacionDuplicados({
        existe: false,
        error: 'Error al verificar duplicados'
      });
    }
  };

  const calcularNomina = async () => {
    if (!formData.selectedEmpleado) return;

    // No calcular si hay campos vacíos temporalmente
    if (formData.horasExtra === '' || formData.bonos === '' || formData.deduccionesAdicionales === '') {
      return;
    }

    try {
      // Para pago semanal: usar directamente el pago semanal
      const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;
      
      console.log('🔍 [CALCULO] Calculando nómina con datos:', {
        empleado: formData.selectedEmpleado.nombre,
        pagoSemanal,
        horasExtra: formData.horasExtra,
        bonos: formData.bonos,
        deduccionesAdicionales: formData.deduccionesAdicionales
      });
      
      // Verificar que el empleado tenga pago_semanal definido
      if (!pagoSemanal || pagoSemanal <= 0) {
        showError('Error', 'El empleado seleccionado no tiene un pago semanal válido definido');
        return;
      }
      
      const datosNomina = {
        diasLaborados: 1, // Fijo para pago semanal (no se usa para cálculo)
        pagoPorDia: pagoSemanal, // El pago semanal completo
        horasExtra: formData.horasExtra || 0,
        bonos: formData.bonos || 0,
        deduccionesAdicionales: formData.deduccionesAdicionales || 0,
        aplicarISR: formData.aplicarISR,
        aplicarIMSS: formData.aplicarIMSS,
        aplicarInfonavit: formData.aplicarInfonavit,
        esPagoSemanal: true // Siempre es pago semanal
      };

      const calculo = await nominasServices.calculadora.calcularNomina(datosNomina);
      console.log('🔍 [CALCULO] Resultado del cálculo:', calculo);
      setCalculoNomina(calculo);
    } catch (error) {
      console.error('Error calculating nomina:', error);
      setCalculoNomina(null);
    }
  };

  const validarDatos = async () => {
    if (!formData.selectedEmpleado) return;

    try {
      const validacionResult = await nominasServices.validaciones.validarEmpleado(formData.selectedEmpleado);
      setValidacion(validacionResult);
    } catch (error) {
      console.error('Error validating data:', error);
      setValidacion(null);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    console.log('🔄 [NominaWizard] Reseteando formulario con valores por defecto:', {
      aplicarISR: false,
      aplicarIMSS: false,
      aplicarInfonavit: false
    });
    
    setFormData({
      selectedPeriodo: generarPeriodoActual(), // Auto-llenar con período actual
      semanaNum: detectarSemanaActual(), // Auto-detectar semana del mes
      selectedEmpleado: null,
      searchTerm: '',
      diasLaborados: 6,
      horasExtra: 0,
      bonos: 0,
      deduccionesAdicionales: 0,
      aplicarISR: false, // Siempre false por defecto
      aplicarIMSS: false, // Siempre false por defecto
      aplicarInfonavit: false, // Siempre false por defecto
      // Nuevos campos para pagos parciales
      pagoParcial: false,
      montoAPagar: 0,
      liquidarAdeudos: false
    });
    setCalculoNomina(null);
    setValidacion(null);
    setAdeudosEmpleado(0);
    setVerificacionDuplicados(null);
    setShowPreview(false);
    setNominaGenerada(null);
    setCurrentStep(1);
  };


  // Función para generar PDF desde preview
  const generarPDFDesdePreview = async () => {
    if (!nominaGenerada?.id_nomina) {
      showError('Error', 'No hay nómina generada para crear PDF');
      return;
    }

    try {
      setProcessingNomina(true);
      showInfo('Generando PDF', 'Creando recibo de nómina...');
      
      const pdfBlob = await nominasServices.nominas.generarReciboPDF(nominaGenerada.id_nomina);
      
      if (!pdfBlob || !(pdfBlob instanceof Blob)) {
        throw new Error('No se recibió un PDF válido');
      }
      
      // Crear nombre de archivo
      const nombreArchivo = `nomina_${formData.selectedEmpleado.nombre.replace(/\s+/g, '_')}_${formData.selectedEmpleado.apellido.replace(/\s+/g, '_')}_${formData.selectedPeriodo}.pdf`;
      
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
      
      // Cerrar wizard y llamar callback de éxito
      handleClose();
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      showError('Error al generar PDF', error.message || 'No se pudo generar el PDF');
    } finally {
      setProcessingNomina(false);
    }
  };

  // Función para editar nómina desde preview
  const editarNominaDesdePreview = () => {
    setShowPreview(false);
    setNominaGenerada(null);
    // Volver al paso 1 para editar
    setCurrentStep(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handlePagoModalConfirm = async () => {
    const pagoValue = parseFloat(pagoInput);
    
    if (!pagoInput || isNaN(pagoValue) || pagoValue <= 0) {
      showError('Pago inválido', 'Por favor ingresa un pago diario válido mayor a 0');
      return;
    }

    setShowPagoModal(false);
    updateFormData({ pago_semanal: pagoValue });
    await procesarNominaConPago(pagoValue);
  };

  const handlePagoModalCancel = () => {
    setShowPagoModal(false);
    setProcessingNomina(false);
  };

  const nextStep = () => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step) => {
    switch (step) {
      case 1:
        // Validar que todos los campos estén completos Y que no haya duplicados
        const camposCompletos = formData.selectedPeriodo && formData.selectedEmpleado && formData.diasLaborados > 0;
        const sinDuplicados = !verificacionDuplicados || !verificacionDuplicados.existe;
        
        console.log('🔍 Validando paso 1:', {
          camposCompletos,
          sinDuplicados,
          verificacionDuplicados: !!verificacionDuplicados,
          existeDuplicado: verificacionDuplicados?.existe,
          isValid: camposCompletos && sinDuplicados
        });
        
        return camposCompletos && sinDuplicados;
      case 2:
        // Permitir procesar si hay cálculo, no hay errores críticos y no hay duplicados
        const isValid = calculoNomina && 
                       validacion && 
                       validacion.esValido && 
                       validacion.errores.length === 0 &&
                       verificacionDuplicados &&
                       !verificacionDuplicados.existe;
        console.log('🔍 Validando paso 2:', {
          calculoNomina: !!calculoNomina,
          validacion: !!validacion,
          esValido: validacion?.esValido,
          errores: validacion?.errores?.length || 0,
          verificacionDuplicados: !!verificacionDuplicados,
          existeDuplicado: verificacionDuplicados?.existe,
          isValid
        });
        return isValid;
      default:
        return true;
    }
  };

  const procesarNominaConPago = async (pagoIngresado, generarPDF = false) => {
    try {
      console.log('🚀 [WIZARD] Iniciando procesamiento con pago');
      console.log('🚀 [WIZARD] Pago ingresado:', pagoIngresado);
      console.log('🚀 [WIZARD] Empleado:', formData.selectedEmpleado);
      
      setProcessingNomina(true);
      showInfo('Procesando', `Generando nómina para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}...`);
      
      // Validar y preparar datos para la nómina
      const idProyecto = formData.selectedEmpleado.id_proyecto || 
                        formData.selectedEmpleado.proyecto?.id_proyecto || 1;

      // Generar información de semana dinámicamente
      const infoSemana = generarInfoSemana(formData.selectedPeriodo, formData.semanaNum);
      
      console.log('🔍 [WIZARD] Información de semana generada:', {
        semanaNum: formData.semanaNum,
        periodo: formData.selectedPeriodo,
        semanaISO: infoSemana.semanaISO,
        etiqueta: infoSemana.etiqueta,
        fechaInicio: infoSemana.fechaInicio.toLocaleDateString('es-MX'),
        fechaFin: infoSemana.fechaFin.toLocaleDateString('es-MX')
      });

      const nominaData = {
        id_empleado: formData.selectedEmpleado.id_empleado,
        id_semana: infoSemana.semanaISO, // Usar semana ISO como identificador único
        id_proyecto: idProyecto,
        dias_laborados: 1, // Fijo para pago semanal (no se usa para cálculo)
        pago_semanal: pagoIngresado, // Contiene el pago semanal
        es_pago_semanal: true, // Siempre es pago semanal
        horas_extra: formData.horasExtra || 0,
        bonos: formData.bonos || 0,
        deducciones_adicionales: formData.deduccionesAdicionales || 0,
        aplicar_isr: formData.aplicarISR,
        aplicar_imss: formData.aplicarIMSS,
        aplicar_infonavit: formData.aplicarInfonavit,
        // Datos de pago parcial
        pago_parcial: formData.pagoParcial,
        monto_a_pagar: formData.pagoParcial ? formData.montoAPagar : null,
        liquidar_adeudos: formData.liquidarAdeudos
      };

      console.log('🚀 [WIZARD] Datos preparados para nómina:', nominaData);
      await procesarNominaFinal(nominaData, generarPDF); // Usar el parámetro generarPDF
    } catch (error) {
      console.error('❌ [WIZARD] Error processing nomina:', error);
      showError('Error de procesamiento', error.message || 'Error al procesar la nómina');
      setProcessingNomina(false);
    }
  };

  const procesarNomina = async () => {
    console.log('🚀 [WIZARD] Función procesarNomina llamada');
    console.log('🚀 [WIZARD] formData:', formData);
    
    // Validar que tenemos los datos básicos necesarios
    if (!formData.selectedEmpleado || !formData.diasLaborados || !formData.selectedPeriodo) {
      console.error('❌ [WIZARD] Datos incompletos:', {
        selectedEmpleado: !!formData.selectedEmpleado,
        diasLaborados: formData.diasLaborados,
        selectedPeriodo: formData.selectedPeriodo
      });
      showError('Datos incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    console.log('✅ [WIZARD] Validación básica exitosa');
    
    // Para pago semanal: usar directamente el pago semanal
    const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;

    console.log('💰 [WIZARD] Pago semanal encontrado:', pagoSemanal);

    // Si el pago semanal es 0 o null, mostrar modal para solicitar el valor
    if (!pagoSemanal || pagoSemanal <= 0) {
      console.log('💰 [WIZARD] Pago semanal no configurado, mostrando modal');
      setShowPagoModal(true);
      return;
    }

    console.log('✅ [WIZARD] Pago semanal configurado, procesando directamente');
    // Si tiene pago semanal, procesar directamente
    await procesarNominaConPago(pagoSemanal);
  };

  const procesarNominaConPDF = async () => {
    console.log('🚀 [WIZARD] Función procesarNominaConPDF llamada');
    console.log('🚀 [WIZARD] formData:', formData);
    
    // Validar que tenemos los datos básicos necesarios
    if (!formData.selectedEmpleado || !formData.diasLaborados || !formData.selectedPeriodo) {
      console.error('❌ [WIZARD] Datos incompletos:', {
        selectedEmpleado: !!formData.selectedEmpleado,
        diasLaborados: formData.diasLaborados,
        selectedPeriodo: formData.selectedPeriodo
      });
      showError('Datos incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    console.log('✅ [WIZARD] Validación básica exitosa para PDF');
    
    // Para pago semanal: usar directamente el pago semanal
    const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;

    console.log('💰 [WIZARD] Pago semanal encontrado para PDF:', pagoSemanal);

    // Si el pago semanal es 0 o null, mostrar modal para solicitar el valor
    if (!pagoSemanal || pagoSemanal <= 0) {
      console.log('💰 [WIZARD] Pago semanal no configurado, mostrando modal');
      setShowPagoModal(true);
      return;
    }

    console.log('✅ [WIZARD] Pago semanal configurado, procesando con PDF directamente');
    // Si tiene pago semanal, procesar directamente con PDF
    await procesarNominaConPago(pagoSemanal, true);
  };

  const procesarNominaFinal = async (nominaData, generarPDF = false) => {
    try {
      console.log('🚀 [WIZARD] Iniciando procesamiento de nómina final');
      console.log('🚀 [WIZARD] Datos de nómina:', nominaData);
      
      // Validar datos antes de procesar
      console.log('🔍 [WIZARD] Validando datos de nómina...');
      const validacionDatos = await nominasServices.validaciones.validarDatosNomina(nominaData);
      console.log('🔍 [WIZARD] Resultado validación:', validacionDatos);
      
      if (!validacionDatos.esValida) {
        console.error('❌ [WIZARD] Validación falló:', validacionDatos.errores);
        showError('Datos inválidos', validacionDatos.errores.join(', '));
        setProcessingNomina(false);
        return;
      }

      console.log('✅ [WIZARD] Validación exitosa, procesando nómina...');
      
      // Si no se va a generar PDF inmediatamente, marcar como borrador
      const nominaDataConEstado = generarPDF 
        ? nominaData 
        : { ...nominaData, estado: 'borrador' };
      
      // Procesar nómina usando el servicio
      const response = await nominasServices.nominas.procesarNomina(nominaDataConEstado);
      console.log('✅ [WIZARD] Respuesta del procesamiento:', response);
      
      // Obtener el ID de la nómina de la estructura correcta
      const idNomina = response?.data?.nomina?.id_nomina || 
                      response?.data?.id_nomina || 
                      response?.data?.data?.nomina?.id_nomina;
      console.log('📋 [WIZARD] ID de nómina extraído:', idNomina);
      
      if (idNomina) {
        if (generarPDF) {
          // Modo: Generar PDF inmediatamente
          try {
            showInfo('Generando PDF', 'Creando recibo de nómina...');
            
            const pdfBlob = await nominasServices.nominas.generarReciboPDF(idNomina);
            
            if (!pdfBlob || !(pdfBlob instanceof Blob)) {
              throw new Error('No se recibió un PDF válido');
            }
            
            // Crear nombre de archivo
            const nombreArchivo = `nomina_${formData.selectedEmpleado.nombre.replace(/\s+/g, '_')}_${formData.selectedEmpleado.apellido.replace(/\s+/g, '_')}_${formData.selectedPeriodo}.pdf`;
            
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
            
            // Cerrar wizard y llamar callback de éxito
            handleClose();
            if (onSuccess) onSuccess();
            
          } catch (pdfError) {
            console.error('❌ Error generando PDF:', pdfError);
            showError('Error al generar PDF', `No se pudo generar el PDF: ${pdfError.message}`);
          }
        } else {
          // Modo: Solo generar nómina y mostrar preview
          try {
            // Obtener los datos completos de la nómina generada
            const nominaCompleta = await nominasServices.nominas.getById(idNomina, true);
            console.log('📋 [WIZARD] Nómina completa obtenida:', nominaCompleta);
            
            // Guardar la nómina generada y mostrar preview
            setNominaGenerada(nominaCompleta.data);
            setShowPreview(true);
            
            showSuccess('¡Nómina Generada!', `Nómina creada exitosamente. Revisa los datos antes de generar el PDF.`);
          } catch (previewError) {
            console.error('❌ Error al obtener datos de la nómina:', previewError);
            showError('Error al obtener nómina', 'No se pudieron obtener los datos de la nómina generada');
          }
        }
      } else {
        throw new Error('No se pudo obtener el ID de la nómina generada');
      }
    } catch (error) {
      console.error('Error processing nomina:', error);
      showError('Error de procesamiento', 'Error al procesar la nómina');
    } finally {
      setProcessingNomina(false);
    }
  };

  const steps = [
    { id: 1, name: 'Configuración', icon: CalendarIcon },
    { id: 2, name: 'Confirmar', icon: CheckCircleIcon }
  ];

  if (!isOpen) return null;

  // Si estamos en modo preview, mostrar la vista de preview
  if (showPreview && nominaGenerada) {
    return (
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
                  Revisa los datos antes de generar el PDF
                </p>
              </div>
              <button
                onClick={handleClose}
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
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Nómina generada exitosamente</strong> - ID: {nominaGenerada.id_nomina} - Estado: {nominaGenerada.estado}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del Empleado */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Información del Empleado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.selectedEmpleado.nombre} {formData.selectedEmpleado.apellido}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">NSS</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.selectedEmpleado.nss}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">RFC</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.selectedEmpleado.rfc}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Proyecto</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formData.selectedEmpleado.proyecto?.nombre || 'Sin proyecto'}
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
                  <p className="font-medium text-gray-900 dark:text-white">{formData.selectedPeriodo}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Semana</p>
                  <p className="font-medium text-gray-900 dark:text-white">Semana {formData.semanaNum}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Días Laborados</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formData.diasLaborados}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pago por Día</p>
                  <p className="font-medium text-gray-900 dark:text-white">{formatCurrency(formData.pago_semanal || 0)}</p>
                </div>
              </div>
            </div>

            {/* Cálculos */}
            {calculoNomina && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">Cálculos</h3>
                {console.log('🔍 [RENDER] calculoNomina existe:', calculoNomina)}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Salario Base:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(calculoNomina.salarioBase || 0)}
                    </span>
                  </div>
                  {calculoNomina.horasExtra > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Horas Extra:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculoNomina.horasExtra || 0)}
                      </span>
                    </div>
                  )}
                  {calculoNomina.bonos > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Bonos:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculoNomina.bonos || 0)}
                      </span>
                    </div>
                  )}
                  {calculoNomina.deducciones > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Deducciones:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">
                        -{formatCurrency(calculoNomina.deducciones || 0)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 dark:border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-gray-900 dark:text-white">Total a Pagar:</span>
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">
                        {(() => {
                          console.log('🔍 [RENDER] calculoNomina en Total a Pagar:', calculoNomina);
                          return formatCurrency(calculoNomina?.montoTotal || 0);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer del Preview */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
            <button
              type="button"
              onClick={editarNominaDesdePreview}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Editar Datos
            </button>
            <button
              type="button"
              onClick={generarPDFDesdePreview}
              disabled={processingNomina}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {processingNomina ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block"></div>
                  Generando PDF...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="h-4 w-4 mr-2 inline-block" />
                  Generar PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto border border-gray-200 dark:border-gray-700 w-full max-w-5xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
        {/* Header del Wizard */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Procesar Nómina - Paso {currentStep} de 2
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {steps[currentStep - 1]?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Indicador de pasos */}
          <div className="mt-4">
            <div className="flex items-center justify-center">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isActive 
                        ? 'border-primary-500 bg-primary-500 text-white' 
                        : isCompleted 
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive 
                        ? 'text-primary-600 dark:text-primary-400' 
                        : isCompleted 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.name}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Contenido del Wizard */}
        <div className="p-6">
          {/* Paso 1: Configuración */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Configurar Nómina
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Selecciona el período, empleado y configura los parámetros de la nómina
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Columna izquierda: Configuración básica */}
                <div className="space-y-6">
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Período y Semana
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Período (Año-Mes)
                        </label>
                        <input
                          type="month"
                          value={formData.selectedPeriodo}
                          onChange={(e) => updateFormData({ selectedPeriodo: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Semana del Período (1-4)
                          </label>
                          <button
                            type="button"
                            onClick={() => updateFormData({ semanaNum: detectarSemanaActual() })}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                            title="Detectar automáticamente la semana actual"
                          >
                            🔄 Auto-detectar
                          </button>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={formData.semanaNum}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Permitir campo vacío temporalmente
                              updateFormData({ semanaNum: '' });
                            } else {
                              const num = parseInt(value);
                              if (!isNaN(num) && num >= 1 && num <= 4) {
                                updateFormData({ semanaNum: num });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                            if (e.target.value === '' || e.target.value === '0') {
                              updateFormData({ semanaNum: detectarSemanaActual() });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Semana actual detectada: {detectarSemanaActual()} (día {new Date().getDate()} del mes)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Días Laborados
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={formData.diasLaborados}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Permitir campo vacío temporalmente
                              updateFormData({ diasLaborados: '' });
                            } else {
                              const num = parseInt(value);
                              if (!isNaN(num) && num >= 1 && num <= 31) {
                                updateFormData({ diasLaborados: num });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                            if (e.target.value === '' || e.target.value === '0') {
                              updateFormData({ diasLaborados: 1 });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <UserGroupIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Seleccionar Empleado
                    </h5>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Buscar Empleado
                        </label>
                        <input
                          type="text"
                          value={formData.searchTerm}
                          onChange={(e) => updateFormData({ searchTerm: e.target.value })}
                          placeholder="Buscar por nombre, apellido, NSS o RFC..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Lista de empleados filtrados */}
                      {formData.searchTerm && (
                        <div className="max-h-60 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                          {process.env.NODE_ENV === 'development' && console.log('🔍 [NominaWizard] Renderizando lista de empleados:', empleadosFiltrados.length, 'empleados totales:', empleados.length, 'término de búsqueda:', formData.searchTerm, 'empleados:', empleados)}
                          {empleadosFiltrados.length > 0 ? (
                            empleadosFiltrados.map((empleado, index) => (
                              <div
                                key={empleado.id_empleado || `filtered-empleado-${index}`}
                                onClick={() => {
                                  updateFormData({ 
                                    selectedEmpleado: empleado,
                                    searchTerm: '',
                                    pago_semanal: empleado.pago_semanal || empleado.contrato?.salario_diario * 7 || 0
                                  });
                                }}
                                className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b border-gray-200 dark:border-gray-600 last:border-b-0 ${
                                  formData.selectedEmpleado?.id_empleado === empleado.id_empleado 
                                    ? 'bg-primary-50 dark:bg-primary-900/20' 
                                    : ''
                                }`}
                              >
                                <div className="h-10 w-10 bg-primary-500 rounded-full flex items-center justify-center">
                                  <span className="text-white font-medium text-sm">
                                    {empleado.nombre?.charAt(0)?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="ml-3 flex-1">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {empleado.nombre} {empleado.apellido}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    NSS: {empleado.nss} • RFC: {empleado.rfc}
                                  </p>
                                  <p className={`text-xs font-medium ${
                                    (empleado.pago_semanal || empleado.contrato?.salario_diario)
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {(empleado.pago_semanal || empleado.contrato?.salario_diario)
                                      ? `${formatCurrency(empleado.pago_semanal || empleado.contrato?.salario_diario * 7)} por semana`
                                      : '⚠️ Sin pago configurado'
                                    }
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                              {process.env.NODE_ENV === 'development' && console.log('🔍 [NominaWizard] No se encontraron empleados para:', formData.searchTerm)}
                              No se encontraron empleados
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Verificación de duplicados - Ahora aparece justo debajo de "Seleccionar Empleado" */}
                  {verificacionDuplicados && (
                    <div className={`p-4 rounded-lg border ${
                      verificacionDuplicados.existe 
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    }`}>
                      <div className="flex items-center mb-2">
                        {verificacionDuplicados.existe ? (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                        ) : (
                          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                        )}
                        <h5 className={`text-sm font-semibold ${
                          verificacionDuplicados.existe 
                            ? 'text-red-900 dark:text-red-200'
                            : 'text-green-900 dark:text-green-200'
                        }`}>
                          {verificacionDuplicados.existe ? '⚠️ Nómina Duplicada Detectada' : '✅ Nómina Disponible'}
                        </h5>
                      </div>
                      
                      {verificacionDuplicados.existe ? (
                        <div className="text-sm text-red-800 dark:text-red-300">
                          <p className="mb-2">
                            <strong>Ya existe una nómina</strong> para este empleado en la semana {formData.semanaNum} del período {formData.selectedPeriodo}.
                          </p>
                          {verificacionDuplicados.nominaExistente && (
                            <div className="bg-red-100 dark:bg-red-900/30 p-3 rounded-lg border border-red-200 dark:border-red-700">
                              <p className="font-medium mb-1">Nómina existente:</p>
                              <p>• ID: {verificacionDuplicados.nominaExistente.id_nomina}</p>
                              <p>• Estado: {verificacionDuplicados.nominaExistente.estado}</p>
                              <p>• Fecha: {new Date(verificacionDuplicados.nominaExistente.fecha_creacion).toLocaleDateString('es-MX')}</p>
                              <p>• Monto: {formatCurrency(verificacionDuplicados.nominaExistente.monto_total)}</p>
                            </div>
                          )}
                          <p className="mt-2 text-xs">
                            💡 <strong>Sugerencia:</strong> Cambia la semana o selecciona un período diferente para crear una nueva nómina.
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm text-green-800 dark:text-green-300">
                          <p>
                            ✅ <strong>Perfecto!</strong> No existe ninguna nómina para este empleado en la semana {formData.semanaNum} del período {formData.selectedPeriodo}.
                          </p>
                          <p className="text-xs mt-1">
                            Puedes proceder con la creación de la nómina.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Columna derecha: Configuración adicional y vista previa */}
                <div className="space-y-6">
                  {/* Configuración adicional */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CalculatorIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Configuración Adicional (Opcional)
                    </h5>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Horas Extra
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={formData.horasExtra}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                // Permitir campo vacío temporalmente
                                updateFormData({ horasExtra: '' });
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  updateFormData({ horasExtra: num });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                              if (e.target.value === '') {
                                updateFormData({ horasExtra: 0 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Bonos
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={formData.bonos}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '') {
                                // Permitir campo vacío temporalmente
                                updateFormData({ bonos: '' });
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  updateFormData({ bonos: num });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                              if (e.target.value === '') {
                                updateFormData({ bonos: 0 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Deducciones Adicionales
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.deduccionesAdicionales}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Permitir campo vacío temporalmente
                              updateFormData({ deduccionesAdicionales: '' });
                            } else {
                              const num = parseFloat(value);
                              if (!isNaN(num) && num >= 0) {
                                updateFormData({ deduccionesAdicionales: num });
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                            if (e.target.value === '') {
                              updateFormData({ deduccionesAdicionales: 0 });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      {/* Opciones fiscales */}
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="aplicarISR"
                            checked={formData.aplicarISR}
                            onChange={(e) => updateFormData({ aplicarISR: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="aplicarISR" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Aplicar ISR
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="aplicarIMSS"
                            checked={formData.aplicarIMSS}
                            onChange={(e) => updateFormData({ aplicarIMSS: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="aplicarIMSS" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Aplicar IMSS
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="aplicarInfonavit"
                            checked={formData.aplicarInfonavit}
                            onChange={(e) => updateFormData({ aplicarInfonavit: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <label htmlFor="aplicarInfonavit" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Aplicar Infonavit
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sección de Pagos Parciales */}
                  {formData.selectedEmpleado && calculoNomina && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <h5 className="text-sm font-semibold text-yellow-900 dark:text-yellow-200 mb-3 flex items-center">
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        Opciones de Pago
                      </h5>
                      
                      <div className="space-y-4">
                        {/* Mostrar adeudos pendientes */}
                        {adeudosEmpleado > 0 && (
                          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                                Adeudos Pendientes:
                              </span>
                              <span className="text-sm font-bold text-red-900 dark:text-red-100">
                                {formatCurrency(adeudosEmpleado)}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Opción de pago parcial */}
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="pagoParcial"
                            checked={formData.pagoParcial}
                            onChange={(e) => {
                              updateFormData({ 
                                pagoParcial: e.target.checked,
                                montoAPagar: e.target.checked ? Math.round(calculoNomina.montoTotal * 100) / 100 : 0
                              });
                            }}
                            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                          />
                          <label htmlFor="pagoParcial" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            Realizar pago parcial
                          </label>
                        </div>

                        {/* Campo de monto a pagar */}
                        {formData.pagoParcial && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Monto a Pagar (Máximo: {formatCurrency(calculoNomina.montoTotal)})
                            </label>
                            <input
                              type="number"
                              min="0"
                              max={calculoNomina.montoTotal}
                              step="0.01"
                              value={formData.montoAPagar}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  updateFormData({ montoAPagar: '' });
                                } else {
                                  // Limpiar el valor de cualquier formato local
                                  const cleanValue = value.replace(',', '.');
                                  const num = parseFloat(cleanValue);
                                  if (!isNaN(num) && num >= 0 && num <= calculoNomina.montoTotal) {
                                    // Redondear a 2 decimales
                                    const roundedNum = Math.round(num * 100) / 100;
                                    updateFormData({ montoAPagar: roundedNum });
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateFormData({ montoAPagar: 0 });
                                } else {
                                  // Limpiar y asegurar que siempre tenga máximo 2 decimales
                                  const cleanValue = e.target.value.replace(',', '.');
                                  const num = parseFloat(cleanValue);
                                  if (!isNaN(num)) {
                                    const roundedNum = Math.round(num * 100) / 100;
                                    updateFormData({ montoAPagar: roundedNum });
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-yellow-500 focus:border-yellow-500 dark:bg-gray-700 dark:text-white"
                              placeholder="0.00"
                            />
                            {formData.montoAPagar > 0 && (
                              <div className="mt-2 text-xs text-yellow-700 dark:text-yellow-300">
                                <div className="flex justify-between">
                                  <span>Monto a pagar:</span>
                                  <span className="font-medium">{formatCurrency(formData.montoAPagar)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Quedará a deber:</span>
                                  <span className="font-medium text-red-600 dark:text-red-400">
                                    {formatCurrency(Math.round((calculoNomina.montoTotal - formData.montoAPagar) * 100) / 100)}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Opción de liquidar adeudos */}
                        {adeudosEmpleado > 0 && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="liquidarAdeudos"
                              checked={formData.liquidarAdeudos}
                              onChange={(e) => updateFormData({ liquidarAdeudos: e.target.checked })}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                            <label htmlFor="liquidarAdeudos" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                              Liquidar adeudos pendientes (${formatCurrency(adeudosEmpleado)})
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Vista previa del cálculo */}
                  {calculoNomina && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3 flex items-center">
                        <CalculatorIcon className="h-4 w-4 mr-2" />
                        Vista Previa del Cálculo:
                      </h5>
                      {console.log('🔍 [VISTA_PREVIA] calculoNomina:', calculoNomina)}
                      
                      {/* Información del pago semanal del empleado */}
                      <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-blue-700 dark:text-blue-300 font-medium">Pago Semanal del Empleado:</span>
                          <span className="font-bold text-blue-900 dark:text-blue-100">
                            {formatCurrency(formData.selectedEmpleado?.pago_semanal || (formData.selectedEmpleado?.contrato?.salario_diario ? formData.selectedEmpleado.contrato.salario_diario * 7 : 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span className="text-blue-600 dark:text-blue-400">Equivalente diario:</span>
                          <span className="text-blue-800 dark:text-blue-200">
                            {formatCurrency(formData.selectedEmpleado?.pago_semanal ? formData.selectedEmpleado.pago_semanal / 6 : formData.pago_semanal / 6 || 0)} por día
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">
                            {formData.selectedEmpleado?.pago_semanal ? 'Salario Semanal:' : 'Salario Base:'}
                          </span>
                          <span className="font-medium text-green-900 dark:text-green-100">
                            {formatCurrency(calculoNomina.salarioBase)}
                          </span>
                        </div>
                        
                        {calculoNomina.montoHorasExtra > 0 && (
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Horas Extra:</span>
                            <span className="font-medium text-green-900 dark:text-green-100">
                              {formatCurrency(calculoNomina.montoHorasExtra)}
                            </span>
                          </div>
                        )}
                        
                        {calculoNomina.bonos > 0 && (
                          <div className="flex justify-between">
                            <span className="text-green-700 dark:text-green-300">Bonos:</span>
                            <span className="font-medium text-green-900 dark:text-green-100">
                              {formatCurrency(calculoNomina.bonos)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex justify-between border-t border-green-200 dark:border-green-700 pt-2">
                          <span className="font-medium text-green-900 dark:text-green-200">Subtotal:</span>
                          <span className="font-medium text-green-900 dark:text-green-200">
                            {formatCurrency(calculoNomina.subtotal)}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-red-600 dark:text-red-400">Deducciones:</span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(calculoNomina.deducciones.total)}
                          </span>
                        </div>
                        
                        {/* Desglose de deducciones */}
                        <div className="ml-4 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {calculoNomina.deducciones.isr > 0 && (
                            <div className="flex justify-between">
                              <span>ISR ({((calculoNomina.deducciones.isr / calculoNomina.subtotal) * 100).toFixed(2)}%):</span>
                              <span>-{formatCurrency(calculoNomina.deducciones.isr)}</span>
                            </div>
                          )}
                          {calculoNomina.deducciones.imss > 0 && (
                            <div className="flex justify-between">
                              <span>IMSS ({((calculoNomina.deducciones.imss / calculoNomina.subtotal) * 100).toFixed(2)}%):</span>
                              <span>-{formatCurrency(calculoNomina.deducciones.imss)}</span>
                            </div>
                          )}
                          {calculoNomina.deducciones.infonavit > 0 && (
                            <div className="flex justify-between">
                              <span>Infonavit ({((calculoNomina.deducciones.infonavit / calculoNomina.subtotal) * 100).toFixed(2)}%):</span>
                              <span>-{formatCurrency(calculoNomina.deducciones.infonavit)}</span>
                            </div>
                          )}
                          {calculoNomina.deducciones.adicionales > 0 && (
                            <div className="flex justify-between">
                              <span>Adicionales:</span>
                              <span>-{formatCurrency(calculoNomina.deducciones.adicionales)}</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex justify-between border-t-2 border-green-300 dark:border-green-600 pt-2">
                          <span className="font-bold text-lg text-green-900 dark:text-green-200">
                            {formData.pagoParcial ? 'Total a Pagar (Parcial):' : 'Total a Pagar:'}
                          </span>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            {(() => {
                              const total = formData.pagoParcial ? formData.montoAPagar : calculoNomina.montoTotal;
                              console.log('🔍 [TOTAL] Calculando Total a Pagar:', {
                                pagoParcial: formData.pagoParcial,
                                montoAPagar: formData.montoAPagar,
                                calculoNominaMontoTotal: calculoNomina.montoTotal,
                                totalFinal: total
                              });
                              return formatCurrency(total);
                            })()}
                          </span>
                        </div>
                        
                        {/* Mostrar información adicional si es pago parcial */}
                        {formData.pagoParcial && (
                          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <div className="flex justify-between mb-1">
                                <span>Total de la nómina:</span>
                                <span className="font-medium">{formatCurrency(calculoNomina.montoTotal)}</span>
                              </div>
                              <div className="flex justify-between mb-1">
                                <span>Monto a pagar:</span>
                                <span className="font-medium text-green-600">{formatCurrency(formData.montoAPagar)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quedará a deber:</span>
                                <span className="font-medium text-red-600">
                                  {formatCurrency(Math.round((calculoNomina.montoTotal - formData.montoAPagar) * 100) / 100)}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Empleado seleccionado */}
                  {formData.selectedEmpleado && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2 flex items-center">
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        Empleado Seleccionado:
                      </h5>
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {formData.selectedEmpleado.nombre} {formData.selectedEmpleado.apellido}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          NSS: {formData.selectedEmpleado.nss} • RFC: {formData.selectedEmpleado.rfc}
                        </p>
                        <p className="text-blue-700 dark:text-blue-300">
                          {formData.selectedEmpleado.oficio?.nombre || 'Sin oficio'}
                        </p>
                        {adeudosEmpleado > 0 && (
                          <p className="text-red-600 dark:text-red-400 font-medium mt-1">
                            ⚠️ Adeudos pendientes: {formatCurrency(adeudosEmpleado)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Confirmación */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-600 dark:text-green-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Confirmar Procesamiento
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Revisa los datos antes de procesar la nómina
                </p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* Resumen de datos */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-4">
                    Resumen de la Nómina:
                  </h5>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h6 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Empleado</h6>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {formData.selectedEmpleado?.nombre} {formData.selectedEmpleado?.apellido}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        NSS: {formData.selectedEmpleado?.nss} • RFC: {formData.selectedEmpleado?.rfc}
                      </p>
                    </div>
                    <div>
                      <h6 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">Período</h6>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {formData.selectedPeriodo} - Semana {formData.semanaNum}
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        {formData.diasLaborados} días laborados
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cálculo detallado */}
                {calculoNomina && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <CalculatorIcon className="h-5 w-5 mr-2 text-primary-600" />
                      Desglose del Cálculo:
                    </h5>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          {formData.selectedEmpleado?.pago_semanal ? 'Salario Semanal:' : `Salario Base (${formData.diasLaborados} días):`}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculoNomina.salarioBase)}
                        </span>
                      </div>
                      
                      {calculoNomina.montoHorasExtra > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Horas Extra:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(calculoNomina.montoHorasExtra)}
                          </span>
                        </div>
                      )}
                      
                      {calculoNomina.bonos > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Bonos:</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(calculoNomina.bonos)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-3">
                        <span className="font-medium text-gray-900 dark:text-white">Subtotal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculoNomina.subtotal)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-red-600 dark:text-red-400">
                          Deducciones:
                          <span className="text-xs text-gray-400 ml-1">
                            (ISR: {formatCurrency(calculoNomina.deducciones.isr)}, 
                            IMSS: {formatCurrency(calculoNomina.deducciones.imss)}, 
                            Infonavit: {formatCurrency(calculoNomina.deducciones.infonavit)}, 
                            Adicionales: {formatCurrency(calculoNomina.deducciones.adicionales)})
                          </span>
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(calculoNomina.deducciones.total)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-t-2 border-gray-300 dark:border-gray-600 pt-3">
                        <span className="font-bold text-xl text-gray-900 dark:text-white">
                          {formData.pagoParcial ? 'Total a Pagar (Parcial):' : 'Total a Pagar:'}
                        </span>
                        <span className="font-bold text-xl text-green-600 dark:text-green-400">
                          {formatCurrency(formData.pagoParcial ? formData.montoAPagar : calculoNomina.montoTotal)}
                        </span>
                      </div>
                      
                      {/* Mostrar información adicional si es pago parcial en el resumen */}
                      {formData.pagoParcial && (
                        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <div className="flex justify-between mb-1">
                              <span>Total de la nómina:</span>
                              <span className="font-medium">{formatCurrency(calculoNomina.montoTotal)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                              <span>Monto a pagar:</span>
                              <span className="font-medium text-green-600">{formatCurrency(formData.montoAPagar)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Quedará a deber:</span>
                              <span className="font-medium text-red-600">
                                {formatCurrency(Math.round((calculoNomina.montoTotal - formData.montoAPagar) * 100) / 100)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Validaciones */}
                {validacion && (
                  <div className={`p-4 rounded-lg border ${
                    validacion.esValida 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}>
                    <div className="flex items-center mb-2">
                      {validacion.esValida ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
                      )}
                      <h6 className={`font-medium ${
                        validacion.esValida 
                          ? 'text-green-900 dark:text-green-200'
                          : 'text-red-900 dark:text-red-200'
                      }`}>
                        {validacion.esValida ? 'Validación Exitosa' : 'Problemas de Validación'}
                      </h6>
                    </div>
                    
                    {validacion.errores.length > 0 && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Errores:</p>
                        <ul className="text-sm text-red-700 dark:text-red-400 list-disc list-inside">
                          {validacion.errores.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {validacion.advertencias.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Advertencias:</p>
                        <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside">
                          {validacion.advertencias.map((advertencia, index) => (
                            <li key={index}>{advertencia}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Advertencia */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <strong>Importante:</strong> Una vez procesada, esta nómina se registrará en el sistema y se generará un recibo PDF automáticamente.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer del Wizard */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || processingNomina}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Anterior
          </button>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={processingNomina}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 transition-colors duration-200"
            >
              Cancelar
            </button>
            
            {currentStep < 2 ? (
              <div className="flex flex-col items-end">
                <button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep) || processingNomina}
                  className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  title={
                    !isStepValid(currentStep) && verificacionDuplicados?.existe
                      ? 'No se puede continuar: Ya existe una nómina para este empleado en esta semana del período'
                      : !isStepValid(currentStep)
                      ? 'Complete todos los campos requeridos para continuar'
                      : ''
                  }
                >
                  Siguiente
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-end space-y-2">
                <div className="flex space-x-3">
                  <button
                    onClick={procesarNomina}
                    disabled={processingNomina || !isStepValid(currentStep)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title={
                      !isStepValid(currentStep) && verificacionDuplicados?.existe
                        ? 'No se puede procesar: Ya existe una nómina para este empleado en esta semana del período'
                        : !isStepValid(currentStep)
                        ? 'Complete todos los campos y cálculos requeridos para procesar'
                        : 'Generar nómina y mostrar preview'
                    }
                  >
                    {processingNomina && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    )}
                    {processingNomina ? 'Procesando...' : 'Generar Nómina'}
                  </button>
                  <button
                    onClick={() => procesarNominaConPDF()}
                    disabled={processingNomina || !isStepValid(currentStep)}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    title={
                      !isStepValid(currentStep) && verificacionDuplicados?.existe
                        ? 'No se puede procesar: Ya existe una nómina para este empleado en esta semana del período'
                        : !isStepValid(currentStep)
                        ? 'Complete todos los campos y cálculos requeridos para procesar'
                        : 'Generar nómina y PDF directamente'
                    }
                  >
                    {processingNomina && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    )}
                    {processingNomina ? 'Procesando...' : 'Generar Nómina y PDF'}
                  </button>
                </div>
                {!isStepValid(currentStep) && verificacionDuplicados?.existe && (
                  <p className="text-xs text-red-600 dark:text-red-400 text-right">
                    ⚠️ Nómina duplicada detectada
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para ingresar pago diario */}
      {showPagoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                  <CurrencyDollarIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Configurar Pago Diario
                  </h3>
                </div>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                El empleado <strong>{formData.selectedEmpleado?.nombre} {formData.selectedEmpleado?.apellido}</strong> no tiene pago semanal configurado.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Por favor ingresa el pago semanal para calcular la nómina:
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pago Semanal (MXN)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    value={pagoInput}
                    onChange={(e) => setPagoInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="500.00"
                    min="0"
                    step="0.01"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Ingresa el monto que se pagará por día trabajado
                </p>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Nota:</strong> Este valor se utilizará solo para esta nómina. Para configurar el pago permanente, actualiza los datos del empleado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
              <button
                type="button"
                onClick={handlePagoModalCancel}
                disabled={processingNomina}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handlePagoModalConfirm}
                disabled={processingNomina}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {processingNomina ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  <>
                    <CurrencyDollarIcon className="w-4 h-4 mr-2" />
                    Confirmar y Procesar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default NominaWizardSimplificado;
