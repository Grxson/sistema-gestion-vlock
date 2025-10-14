import React, { useState, useEffect } from 'react';
import nominasServices from '../services/nominas';
import { formatCurrency } from '../utils/currency';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
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

const NominaWizardSimplificado = ({ isOpen, onClose, onSuccess, empleados = [] }) => {
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  // Estados del wizard
  const [currentStep, setCurrentStep] = useState(1);
  const [processingNomina, setProcessingNomina] = useState(false);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoInput, setPagoInput] = useState('500.00');
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    selectedPeriodo: '',
    semanaNum: 1,
    selectedEmpleado: null,
    searchTerm: '',
    diasLaborados: 30,
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    aplicarISR: true,
    aplicarIMSS: true,
    aplicarInfonavit: true
  });

  // Cálculos de nómina
  const [calculoNomina, setCalculoNomina] = useState(null);
  const [validacion, setValidacion] = useState(null);

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = Array.isArray(empleados) 
    ? empleados.filter(emp => 
        emp.nombre?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        emp.apellido?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        emp.nss?.includes(formData.searchTerm) ||
        emp.rfc?.toLowerCase().includes(formData.searchTerm.toLowerCase())
      )
    : [];

  // Calcular nómina cuando cambian los datos relevantes
  useEffect(() => {
    if (formData.selectedEmpleado && formData.diasLaborados && formData.pago_por_dia) {
      calcularNomina();
    }
  }, [formData.selectedEmpleado, formData.diasLaborados, formData.horasExtra, formData.bonos, formData.deduccionesAdicionales, formData.aplicarISR, formData.aplicarIMSS, formData.aplicarInfonavit]);

  // Validar datos cuando cambian
  useEffect(() => {
    if (formData.selectedEmpleado) {
      validarDatos();
    }
  }, [formData]);

  const calcularNomina = async () => {
    if (!formData.selectedEmpleado) return;

    try {
      const datosNomina = {
        diasLaborados: formData.diasLaborados,
        pagoPorDia: formData.pago_por_dia || formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario || 0,
        horasExtra: formData.horasExtra,
        bonos: formData.bonos,
        deduccionesAdicionales: formData.deduccionesAdicionales,
        aplicarISR: formData.aplicarISR,
        aplicarIMSS: formData.aplicarIMSS,
        aplicarInfonavit: formData.aplicarInfonavit
      };

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
      selectedPeriodo: '',
      semanaNum: 1,
      selectedEmpleado: null,
      searchTerm: '',
      diasLaborados: 30,
      horasExtra: 0,
      bonos: 0,
      deduccionesAdicionales: 0,
      aplicarISR: true,
      aplicarIMSS: true,
      aplicarInfonavit: true
    });
    setCalculoNomina(null);
    setValidacion(null);
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
    updateFormData({ pago_por_dia: pagoValue });
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
        return formData.selectedPeriodo && formData.selectedEmpleado && formData.diasLaborados > 0;
      case 2:
        return calculoNomina && validacion?.esValido;
      default:
        return true;
    }
  };

  const procesarNominaConPago = async (pagoIngresado) => {
    try {
      setProcessingNomina(true);
      showInfo('Procesando', `Generando nómina para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}...`);
      
      // Validar y preparar datos para la nómina
      const idProyecto = formData.selectedEmpleado.id_proyecto || 
                        formData.selectedEmpleado.proyecto?.id_proyecto || 1;

      const nominaData = {
        id_empleado: formData.selectedEmpleado.id_empleado,
        id_semana: formData.semanaNum,
        id_proyecto: idProyecto,
        dias_laborados: formData.diasLaborados,
        pago_por_dia: pagoIngresado,
        horas_extra: formData.horasExtra || 0,
        bonos: formData.bonos || 0,
        deducciones_adicionales: formData.deduccionesAdicionales || 0,
        aplicar_isr: formData.aplicarISR,
        aplicar_imss: formData.aplicarIMSS,
        aplicar_infonavit: formData.aplicarInfonavit
      };

      await procesarNominaFinal(nominaData);
    } catch (error) {
      console.error('Error processing nomina:', error);
      showError('Error de procesamiento', error.message || 'Error al procesar la nómina');
      setProcessingNomina(false);
    }
  };

  const procesarNomina = async () => {
    // Validar que tenemos los datos básicos necesarios
    if (!formData.selectedEmpleado || !formData.diasLaborados || !formData.selectedPeriodo) {
      showError('Datos incompletos', 'Por favor completa todos los campos requeridos');
      return;
    }

    // Validar y preparar datos para la nómina
    const pagoDiario = formData.selectedEmpleado.pago_diario || 
                      formData.selectedEmpleado.contrato?.salario_diario || 
                      formData.selectedEmpleado.salario_diario || 
                      formData.selectedEmpleado.salario_base_personal || 0;

    // Si el pago diario es 0 o null, mostrar modal para solicitar el valor
    if (!pagoDiario || pagoDiario <= 0) {
      setShowPagoModal(true);
      return;
    }

    // Si tiene pago diario, procesar directamente
    await procesarNominaConPago(pagoDiario);
  };

  const procesarNominaFinal = async (nominaData) => {
    try {
      // Validar datos antes de procesar
      const validacionDatos = await nominasServices.validaciones.validarDatosNomina(nominaData);
      if (!validacionDatos.esValida) {
        showError('Datos inválidos', validacionDatos.errores.join(', '));
        setProcessingNomina(false);
        return;
      }

      // Procesar nómina usando el servicio
      const response = await nominasServices.nominas.procesarNomina(nominaData);
      
      showSuccess('¡Éxito!', `Nómina generada exitosamente para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}`);
      
      // Generar PDF si es posible
      if (response?.data?.id_nomina) {
        try {
          showInfo('Generando PDF', 'Creando recibo de nómina...');
          
          const pdfBlob = await nominasServices.nominas.generarReciboPDF(response.data.id_nomina);
          const url = window.URL.createObjectURL(pdfBlob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `nomina_${formData.selectedEmpleado.nombre}_${formData.selectedEmpleado.apellido}_${formData.selectedPeriodo}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);

          showSuccess('PDF Generado', `Recibo de nómina descargado para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}`);
        } catch (pdfError) {
          console.warn('Error al generar PDF:', pdfError);
          showInfo('PDF no disponible', 'La nómina se procesó pero no se pudo generar el PDF automáticamente');
        }
      }
      
      handleClose();
      if (onSuccess) onSuccess();
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
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Semana del Período (1-4)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="4"
                          value={formData.semanaNum}
                          onChange={(e) => updateFormData({ semanaNum: parseInt(e.target.value) || 1 })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
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
                          onChange={(e) => updateFormData({ diasLaborados: parseInt(e.target.value) || 1 })}
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
                                    pago_por_dia: empleado.pago_diario || empleado.contrato?.salario_diario || 0
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
                                    (empleado.pago_diario || empleado.contrato?.salario_diario)
                                      ? 'text-green-600 dark:text-green-400'
                                      : 'text-red-600 dark:text-red-400'
                                  }`}>
                                    {(empleado.pago_diario || empleado.contrato?.salario_diario)
                                      ? `${formatCurrency(empleado.pago_diario || empleado.contrato?.salario_diario)} por día`
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
                            onChange={(e) => updateFormData({ horasExtra: parseFloat(e.target.value) || 0 })}
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
                            onChange={(e) => updateFormData({ bonos: parseFloat(e.target.value) || 0 })}
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
                          onChange={(e) => updateFormData({ deduccionesAdicionales: parseFloat(e.target.value) || 0 })}
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

                  {/* Vista previa del cálculo */}
                  {calculoNomina && (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <h5 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-3 flex items-center">
                        <CalculatorIcon className="h-4 w-4 mr-2" />
                        Vista Previa del Cálculo:
                      </h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">Salario Base:</span>
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
                        
                        <div className="flex justify-between border-t-2 border-green-300 dark:border-green-600 pt-2">
                          <span className="font-bold text-lg text-green-900 dark:text-green-200">Total a Pagar:</span>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(calculoNomina.montoTotal)}
                          </span>
                        </div>
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
                        <span className="text-gray-600 dark:text-gray-400">Salario Base ({formData.diasLaborados} días):</span>
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
                        <span className="font-bold text-xl text-gray-900 dark:text-white">Total a Pagar:</span>
                        <span className="font-bold text-xl text-green-600 dark:text-green-400">
                          {formatCurrency(calculoNomina.montoTotal)}
                        </span>
                      </div>
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
              <button
                onClick={nextStep}
                disabled={!isStepValid(currentStep) || processingNomina}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Siguiente
                <ArrowRightIcon className="w-4 h-4 ml-2" />
              </button>
            ) : (
              <button
                onClick={procesarNomina}
                disabled={processingNomina || !validacion?.esValida}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {processingNomina && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {processingNomina ? 'Procesando...' : 'Procesar Nómina'}
              </button>
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
                El empleado <strong>{formData.selectedEmpleado?.nombre} {formData.selectedEmpleado?.apellido}</strong> no tiene pago diario configurado.
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
                Por favor ingresa el pago diario para este empleado:
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pago Diario (MXN)
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
