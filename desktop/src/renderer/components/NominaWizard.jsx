import React, { useState, useEffect } from 'react';
import nominasServices from '../services/nominas';
import apiService from '../services/api';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { 
  detectarSemanaActual, 
  generarPeriodoActual, 
  obtenerInfoSemanaCompleta,
  calcularSemanaDelMes,
  validarSemana,
  listarSemanasISODePeriodo,
  generarInfoSemana,
  semanaDelMesDesdeISO
} from '../utils/weekCalculator';

// Eliminado: cálculo por filas de calendario. Se usa ISO real para el conteo en UI.
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
  
  // Helper: detectar semana para un período dado (mapear semana ISO actual al período elegido)
  const detectarSemanaParaPeriodo = (periodo) => {
    try {
      if (!periodo) return 1;
      const info = generarInfoSemana(new Date());
      const idx = semanaDelMesDesdeISO(periodo, info.año, info.semanaISO);
      return Number.isNaN(idx) ? 1 : idx;
    } catch {
      return 1;
    }
  };

  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [processingNomina, setProcessingNomina] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoInput, setPagoInput] = useState('500.00');
  // Flags para respetar selección manual del usuario
  const [touchedPeriodo, setTouchedPeriodo] = useState(false);
  const [touchedSemana, setTouchedSemana] = useState(false);
  
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
    semanaNum: detectarSemanaParaPeriodo(generarPeriodoActual()), // Auto-detectar semana según período seleccionado
    selectedEmpleado: null,
    proyectoTemporal: null, // Proyecto override solo para esta nómina
    searchTerm: '',
    diasLaborados: 6,
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    montoISR: '',
    montoIMSS: '',
    montoInfonavit: '',
    descuentos: '', // Para adelantos
    // Nuevos campos para pagos parciales
    pagoParcial: false,
    montoAPagar: 0,
    liquidarAdeudos: false
  });

  // Cálculos de nómina
  const [calculoNomina, setCalculoNomina] = useState(null);
  const [validacion, setValidacion] = useState(null);
  const [adeudosEmpleado, setAdeudosEmpleado] = useState(0);
  const [verificacionDuplicados, setVerificacionDuplicados] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [nominaGenerada, setNominaGenerada] = useState(null);
  // Proyectos activos para selector de proyecto temporal
  const [proyectosActivos, setProyectosActivos] = useState([]);
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      try {
        const res = await apiService.getProyectosActivos();
        const arr = res?.data || res || [];
        setProyectosActivos(Array.isArray(arr) ? arr : []);
      } catch (e) {
        setProyectosActivos([]);
      }
    })();
  }, [isOpen]);

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

  // Calcular nómina cuando cambian los datos relevantes
  useEffect(() => {
    if (formData.selectedEmpleado && formData.selectedEmpleado.pago_semanal) {
      calcularNomina();
    }
  }, [
    formData.selectedEmpleado, 
    formData.proyectoTemporal,
    formData.diasLaborados, 
    formData.horasExtra, 
    formData.bonos, 
    formData.deduccionesAdicionales,
    formData.montoISR,
    formData.montoIMSS,
    formData.montoInfonavit,
    formData.descuentos
  ]);

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

  // Auto-actualizar período y semana cuando cambie el mes/año (escalable)
  useEffect(() => {
    // Verificar cada minuto si cambió el mes/año
    const interval = setInterval(() => {
      const periodoActual = generarPeriodoActual();
      const semanaActual = detectarSemanaParaPeriodo(periodoActual);
      
      // Si el período cambió (nuevo mes o año), actualizar automáticamente
      if (formData.selectedPeriodo !== periodoActual && !touchedPeriodo && !touchedSemana) {
        console.log('🔄 [AUTO-UPDATE] Detectado cambio de período:', {
          anterior: formData.selectedPeriodo,
          nuevo: periodoActual
        });
        updateFormData({ 
          selectedPeriodo: periodoActual,
          semanaNum: semanaActual 
        });
      } 
      // Si estamos en el período actual pero la semana cambió (y usuario no tocó)
      else if (formData.selectedPeriodo === periodoActual && formData.semanaNum !== semanaActual && !touchedSemana) {
        console.log('🔄 [AUTO-UPDATE] Detectado cambio de semana:', {
          anterior: formData.semanaNum,
          nuevo: semanaActual
        });
        updateFormData({ semanaNum: semanaActual });
      }
    }, 60000); // Verificar cada minuto
    
    return () => clearInterval(interval);
  }, [formData.selectedPeriodo, formData.semanaNum, touchedPeriodo, touchedSemana]);

  // Auto-actualizar semana cuando el usuario cambie manualmente el período
  useEffect(() => {
    const periodoActual = generarPeriodoActual();
    // Al cambiar el período (sea actual o no), re-calcular semana para ese período
    if (!touchedSemana) {
      const semanaParaPeriodo = detectarSemanaParaPeriodo(formData.selectedPeriodo);
      if (formData.semanaNum !== semanaParaPeriodo) {
        updateFormData({ semanaNum: semanaParaPeriodo });
      }
    }
  }, [formData.selectedPeriodo, touchedSemana]);

  // Pre-llenar formulario cuando hay datos de nómina a editar
  useEffect(() => {
    if (nominaToEdit && isOpen) {
      
      // Calcular período y semana desde la fecha de creación
      const fechaCreacion = new Date(nominaToEdit.createdAt || nominaToEdit.fecha_creacion);
      const año = fechaCreacion.getFullYear();
      const mes = fechaCreacion.getMonth() + 1;
      const periodo = `${año}-${String(mes).padStart(2, '0')}`;
      
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
      
      // Forzar recálculo después de pre-llenar
      setTimeout(() => {
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

  // Verificar si ya existe una nómina para este empleado en esta semana del mes
  const verificarDuplicados = async () => {
    if (!formData.selectedEmpleado || !formData.selectedPeriodo || !formData.semanaNum) {
      setVerificacionDuplicados(null);
      return;
    }

    try {
      const response = await nominasServices.nominas.verificarDuplicados({
        id_empleado: formData.selectedEmpleado.id_empleado,
        periodo: formData.selectedPeriodo,
        semana: formData.semanaNum
      });

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
    
    
    if (!formData.selectedEmpleado) {
      return;
    }

    // No calcular si hay campos vacíos temporalmente
    if (formData.horasExtra === '' || formData.bonos === '' || formData.deduccionesAdicionales === '') {
      return;
    }

    try {
      // Para pago semanal: usar directamente el pago semanal
      const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;
      
      // Verificar que el empleado tenga pago_semanal definido
      if (!pagoSemanal || pagoSemanal <= 0) {
        showError('Error', 'El empleado seleccionado no tiene un pago semanal válido definido');
        return;
      }
      
      const diasLaborados = formData.diasLaborados || 6;
      const pagoPorDia = pagoSemanal / 6; // Equivalente diario fijo (semana de 6 días)
      const salarioBase = pagoPorDia * diasLaborados; // Salario proporcional a los días laborados
      
      const datosNomina = {
        diasLaborados: diasLaborados, // Usar el valor ingresado por el usuario
        pagoPorDia: pagoPorDia, // Pago por día fijo (semana de 6 días)
        salarioBase: salarioBase, // Salario base calculado según días trabajados
        horasExtra: formData.horasExtra || 0,
        bonos: formData.bonos || 0,
        deduccionesAdicionales: formData.deduccionesAdicionales || 0,
        monto_isr: parseFloat(formData.montoISR) || 0,
        monto_imss: parseFloat(formData.montoIMSS) || 0,
        monto_infonavit: parseFloat(formData.montoInfonavit) || 0,
        descuentos: parseFloat(formData.descuentos) || 0,
        esPagoSemanal: true // Siempre es pago semanal
      };

      console.log('🔍 [WIZARD] Datos enviados al cálculo:', datosNomina);

      const calculo = await nominasServices.calculadora.calcularNomina(datosNomina);
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
    setFormData({
      selectedPeriodo: generarPeriodoActual(), // Auto-llenar con período actual
      semanaNum: detectarSemanaActual(), // Auto-detectar semana del mes actual
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
      
      // Crear nombre de archivo (formato unificado)
      const nombreEmpleado = `${formData.selectedEmpleado.nombre || ''}_${formData.selectedEmpleado.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
      const semanaMes = formData.semanaNum || 'X';
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      const nombreArchivo = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
      
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
        
        return camposCompletos && sinDuplicados;
      case 2:
        // Permitir procesar si hay cálculo, no hay errores críticos y no hay duplicados
        const isValid = calculoNomina && 
                       validacion && 
                       validacion.esValido && 
                       validacion.errores.length === 0 &&
                       verificacionDuplicados &&
                       !verificacionDuplicados.existe;
        return isValid;
      default:
        return true;
    }
  };

  const procesarNominaConPago = async (pagoIngresado, generarPDF = false) => {
    try {      
      setProcessingNomina(true);
      showInfo('Procesando', `Generando nómina para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}...`);
      
      // Validar y preparar datos para la nómina
  // Proyecto temporal override: si el usuario seleccionó uno diferente usarlo, sin modificar empleado
  const idProyecto = formData.proyectoTemporal?.id_proyecto ||
        formData.selectedEmpleado.id_proyecto || 
        formData.selectedEmpleado.proyecto?.id_proyecto || 1;

      // Usar el período y semana seleccionados por el usuario
      // NO usar la fecha actual, sino los datos del formulario
      const [anio, mes] = formData.selectedPeriodo.split('-').map(Number);

      const nominaData = {
        id_empleado: formData.selectedEmpleado.id_empleado,
        // id_proyecto temporal para la nómina (no muta empleado)
        id_proyecto: idProyecto,
        // Enviar período y semana seleccionados por el usuario
        periodo_anio: anio,
        periodo_mes: mes,
        semana_del_mes: Number(formData.semanaNum),
        dias_laborados: formData.diasLaborados || 6, // Usar el valor ingresado por el usuario
        pago_semanal: pagoIngresado, // Contiene el pago semanal
        es_pago_semanal: true, // Siempre es pago semanal
        horas_extra: formData.horasExtra || 0,
        bonos: formData.bonos || 0,
        deducciones_adicionales: formData.deduccionesAdicionales || 0,
        monto_isr: parseFloat(formData.montoISR) || 0,
        monto_imss: parseFloat(formData.montoIMSS) || 0,
        monto_infonavit: parseFloat(formData.montoInfonavit) || 0,
        descuentos: parseFloat(formData.descuentos) || 0,
        // Datos de pago parcial
        pago_parcial: formData.pagoParcial,
        monto_a_pagar: formData.pagoParcial ? formData.montoAPagar : null,
        liquidar_adeudos: formData.liquidarAdeudos
      };

      await procesarNominaFinal(nominaData, generarPDF); // Usar el parámetro generarPDF
    } catch (error) {
      console.error('❌ [WIZARD] Error processing nomina:', error);
      showError('Error de procesamiento', error.message || 'Error al procesar la nómina');
      setProcessingNomina(false);
    }
  };

  const procesarNomina = async () => {
    
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
    
    // Para pago semanal: usar directamente el pago semanal
    const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;

    // Si el pago semanal es 0 o null, mostrar modal para solicitar el valor
    if (!pagoSemanal || pagoSemanal <= 0) {
      setShowPagoModal(true);
      return;
    }
    // Si tiene pago semanal, procesar directamente
    await procesarNominaConPago(pagoSemanal);
  };

  const procesarNominaConPDF = async () => {
    
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
    
    // Para pago semanal: usar directamente el pago semanal
    const pagoSemanal = formData.selectedEmpleado.pago_semanal || 0;

    // Si el pago semanal es 0 o null, mostrar modal para solicitar el valor
    if (!pagoSemanal || pagoSemanal <= 0) {
      setShowPagoModal(true);
      return;
    }
    // Si tiene pago semanal, procesar directamente con PDF
    await procesarNominaConPago(pagoSemanal, true);
  };

  const procesarNominaFinal = async (nominaData, generarPDF = false) => {
    try {
      
      
      // Validar datos antes de procesar
      const validacionDatos = await nominasServices.validaciones.validarDatosNomina(nominaData);
      
      if (!validacionDatos.esValida) {
        console.error('❌ [WIZARD] Validación falló:', validacionDatos.errores);
        showError('Datos inválidos', validacionDatos.errores.join(', '));
        setProcessingNomina(false);
        return;
      }

      
      let response;
      
      if (nominaToEdit && nominaToEdit.id_nomina) {
        // Modo edición: actualizar nómina existente        
        // Preparar datos para actualización (sin campos que no se pueden modificar)
        const updateData = {
          dias_laborados: nominaData.dias_laborados,
          pago_semanal: nominaData.pago_semanal,
          horas_extra: nominaData.horas_extra,
          bonos: nominaData.bonos,
          deducciones_adicionales: nominaData.deducciones_adicionales,
          monto_isr: nominaData.monto_isr,
          monto_imss: nominaData.monto_imss,
          monto_infonavit: nominaData.monto_infonavit,
          descuentos: nominaData.descuentos,
          pago_parcial: nominaData.pago_parcial,
          monto_a_pagar: nominaData.monto_a_pagar,
          liquidar_adeudos: nominaData.liquidar_adeudos
        };
        
        response = await nominasServices.nominas.update(nominaToEdit.id_nomina, updateData);
      } else {
        // Modo creación: crear nueva nómina
        
        // Si no se va a generar PDF inmediatamente, marcar como borrador
        const nominaDataConEstado = generarPDF 
          ? nominaData 
          : { ...nominaData, estado: 'borrador' };
        
        response = await nominasServices.nominas.procesarNomina(nominaDataConEstado);
      }
      
      // Obtener el ID de la nómina de la estructura correcta
      let idNomina;
      if (nominaToEdit && nominaToEdit.id_nomina) {
        // En modo edición, usar el ID existente
        idNomina = nominaToEdit.id_nomina;
      } else {
        // En modo creación, extraer el ID de la respuesta
        idNomina = response?.data?.nomina?.id_nomina || 
                   response?.data?.id_nomina || 
                   response?.data?.data?.nomina?.id_nomina;
      }
      
      if (idNomina) {
        if (generarPDF) {
          // Modo: Generar PDF inmediatamente
          try {
            showInfo('Generando PDF', 'Creando recibo de nómina...');
            
            const pdfBlob = await nominasServices.nominas.generarReciboPDF(idNomina);
            
            if (!pdfBlob || !(pdfBlob instanceof Blob)) {
              throw new Error('No se recibió un PDF válido');
            }
            
            // Crear nombre de archivo (formato unificado)
            const nombreEmpleado = `${formData.selectedEmpleado.nombre || ''}_${formData.selectedEmpleado.apellido || ''}`.trim().replace(/\s+/g, '_') || 'empleado';
            const semanaMes = formData.semanaNum || 'X';
            const now = new Date();
            const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
            const nombreArchivo = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
            
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
            
            // Guardar la nómina generada (sin mostrar preview automático)
            setNominaGenerada(nominaCompleta.data);
            
            const mensaje = nominaToEdit && nominaToEdit.id_nomina 
              ? 'Nómina actualizada exitosamente.'
              : 'Nómina creada exitosamente.';
            showSuccess('¡Nómina Generada!', mensaje);
            
            // Cerrar wizard y llamar callback de éxito
            handleClose();
            if (onSuccess) onSuccess();
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
                  {nominaToEdit ? 'Preview de Nómina Editada' : 'Preview de Nómina'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nominaToEdit ? 'Revisa los cambios antes de actualizar la nómina' : 'Revisa los datos antes de generar el PDF'}
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">Semana del Mes</p>
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
                  {nominaToEdit ? 'Editar Nómina' : 'Procesar Nómina'} - Paso {currentStep} de 2
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {nominaToEdit ? 'Modificando nómina existente' : steps[currentStep - 1]?.name}
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
                          onChange={(e) => {
                            setTouchedPeriodo(true);
                            const nuevoPeriodo = e.target.value;
                            updateFormData({ selectedPeriodo: nuevoPeriodo });
                            // Si el usuario no ha tocado la semana, sincronizarla con el período
                            if (!touchedSemana) {
                              updateFormData({ semanaNum: detectarSemanaParaPeriodo(nuevoPeriodo) });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Semana del Mes
                          </label>
                          <button
                            type="button"
                            onClick={() => updateFormData({ semanaNum: detectarSemanaParaPeriodo(formData.selectedPeriodo) })}
                            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                            title="Detectar automáticamente la semana del mes actual"
                          >
                            🔄 Auto-detectar
                          </button>
                        </div>
                        <input
                          type="number"
                          min="1"
                          max="6"
                          value={formData.semanaNum}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === '') {
                              // Permitir campo vacío temporalmente
                              updateFormData({ semanaNum: '' });
                            } else {
                              const num = parseInt(value);
                              if (!isNaN(num) && num >= 1) {
                                // Validar contra el período actual
                                if (validarSemana(num, formData.selectedPeriodo)) {
                                  setTouchedSemana(true);
                                  updateFormData({ semanaNum: num });
                                }
                              }
                            }
                          }}
                          onBlur={(e) => {
                            // Solo restaurar valor por defecto cuando pierde el foco y está vacío
                            if (e.target.value === '' || e.target.value === '0') {
                              setTouchedSemana(true);
                              updateFormData({ semanaNum: detectarSemanaParaPeriodo(formData.selectedPeriodo) });
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Semana del mes para el período detectada: {detectarSemanaParaPeriodo(formData.selectedPeriodo)} 
                          {(() => {
                            try {
                              const [año, mes] = formData.selectedPeriodo.split('-').map(Number);
                              const periodo = `${año}-${String(mes).padStart(2,'0')}`;
                              const semanasEnElMes = listarSemanasISODePeriodo(periodo).length;
                              return ` (${semanasEnElMes} semanas en ${new Date(año, mes - 1).toLocaleDateString('es-MX', { month: 'long' })})`;
                            } catch {
                              return ' (con mapeo ISO automático)';
                            }
                          })()}
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
                              updateFormData({ diasLaborados: 6 });
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
                      {/* Proyecto temporal para esta nómina */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Proyecto Temporal (opcional)
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          value={formData.proyectoTemporal?.id_proyecto || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (!val) {
                              updateFormData({ proyectoTemporal: null });
                            } else {
                              const proj = proyectosActivos.find(p => p.id_proyecto === Number(val));
                              updateFormData({ proyectoTemporal: proj || null });
                            }
                          }}
                        >
                          <option value="">Usar proyecto del empleado ({formData.selectedEmpleado?.proyecto?.nombre || 'Sin proyecto'})</option>
                          {proyectosActivos.map(p => (
                            <option key={p.id_proyecto} value={p.id_proyecto}>{p.nombre}</option>
                          ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Este proyecto afectará solamente a esta nómina. No modifica el proyecto del empleado.
                        </p>
                      </div>
                      <div className="border-t border-dashed border-gray-300 dark:border-gray-600" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                updateFormData({ horasExtra: '' });
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  updateFormData({ horasExtra: num });
                                }
                              }
                            }}
                            onBlur={(e) => {
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
                                updateFormData({ bonos: '' });
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  updateFormData({ bonos: num });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                updateFormData({ bonos: 0 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>

                        <div className="md:col-span-2">
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
                                updateFormData({ deduccionesAdicionales: '' });
                              } else {
                                const num = parseFloat(value);
                                if (!isNaN(num) && num >= 0) {
                                  updateFormData({ deduccionesAdicionales: num });
                                }
                              }
                            }}
                            onBlur={(e) => {
                              if (e.target.value === '') {
                                updateFormData({ deduccionesAdicionales: 0 });
                              }
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      </div>

                      {/* Deducciones Fiscales - Grid de 2 columnas */}
                      <div>
                        <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                          Deducciones Fiscales (ingresar monto solo si aplica)
                        </h5>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* ISR */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              ISR
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.montoISR}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFormData({ montoISR: value === '' ? '' : value });
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateFormData({ montoISR: 0 });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              placeholder="0.00 (dejar en 0 si no aplica)"
                            />
                          </div>

                          {/* IMSS */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              IMSS
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.montoIMSS}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFormData({ montoIMSS: value === '' ? '' : value });
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateFormData({ montoIMSS: 0 });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              placeholder="0.00 (dejar en 0 si no aplica)"
                            />
                          </div>

                          {/* Infonavit */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Infonavit
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.montoInfonavit}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFormData({ montoInfonavit: value === '' ? '' : value });
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateFormData({ montoInfonavit: 0 });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              placeholder="0.00 (dejar en 0 si no aplica)"
                            />
                          </div>

                          {/* Descuentos (Adelantos) */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Descuentos (Adelantos)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={formData.descuentos}
                              onChange={(e) => {
                                const value = e.target.value;
                                updateFormData({ descuentos: value === '' ? '' : value });
                              }}
                              onBlur={(e) => {
                                if (e.target.value === '') {
                                  updateFormData({ descuentos: 0 });
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                              placeholder="0.00"
                            />
                          </div>
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
                          {calculoNomina.deducciones.descuentos > 0 && (
                            <div className="flex justify-between">
                              <span>Descuentos (Adelantos):</span>
                              <span>-{formatCurrency(calculoNomina.deducciones.descuentos)}</span>
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
                          {formData.selectedEmpleado?.pago_semanal ? `Salario proporcional (${formData.diasLaborados} días):` : `Salario Base (${formData.diasLaborados} días):`}
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
                      
                      {(calculoNomina.deducciones.isr > 0 || calculoNomina.deducciones.imss > 0 || 
                        calculoNomina.deducciones.infonavit > 0 || calculoNomina.deducciones.adicionales > 0 ||
                        calculoNomina.deducciones.descuentos > 0) && (
                        <div className="flex justify-between">
                          <span className="text-red-600 dark:text-red-400">
                            Deducciones:
                            <span className="text-xs text-gray-400 ml-1">
                              ({calculoNomina.deducciones.isr > 0 && `ISR: ${formatCurrency(calculoNomina.deducciones.isr)}`}
                              {calculoNomina.deducciones.isr > 0 && (calculoNomina.deducciones.imss > 0 || calculoNomina.deducciones.infonavit > 0 || calculoNomina.deducciones.adicionales > 0 || calculoNomina.deducciones.descuentos > 0) && ', '}
                              {calculoNomina.deducciones.imss > 0 && `IMSS: ${formatCurrency(calculoNomina.deducciones.imss)}`}
                              {calculoNomina.deducciones.imss > 0 && (calculoNomina.deducciones.infonavit > 0 || calculoNomina.deducciones.adicionales > 0 || calculoNomina.deducciones.descuentos > 0) && ', '}
                              {calculoNomina.deducciones.infonavit > 0 && `Infonavit: ${formatCurrency(calculoNomina.deducciones.infonavit)}`}
                              {calculoNomina.deducciones.infonavit > 0 && (calculoNomina.deducciones.adicionales > 0 || calculoNomina.deducciones.descuentos > 0) && ', '}
                              {calculoNomina.deducciones.adicionales > 0 && `Adicionales: ${formatCurrency(calculoNomina.deducciones.adicionales)}`}
                              {calculoNomina.deducciones.adicionales > 0 && calculoNomina.deducciones.descuentos > 0 && ', '}
                              {calculoNomina.deducciones.descuentos > 0 && `Descuentos: ${formatCurrency(calculoNomina.deducciones.descuentos)}`})
                            </span>
                          </span>
                          <span className="font-medium text-red-600 dark:text-red-400">
                            -{formatCurrency(calculoNomina.deducciones.total)}
                          </span>
                        </div>
                      )}
                      
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
