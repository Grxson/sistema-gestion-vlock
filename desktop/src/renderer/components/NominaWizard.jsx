import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
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
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const NominaWizard = ({ isOpen, onClose, onSuccess, empleados = [] }) => {
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
    diasLaborados: 30,
    semanaNum: 1,
    selectedEmpleado: null,
    searchTerm: '',
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    aplicarISR: true
  });

  // Cálculos de nómina
  const [calculoNomina, setCalculoNomina] = useState(null);

  // Filtrar empleados por búsqueda
  const empleadosFiltrados = Array.isArray(empleados) 
    ? empleados.filter(emp => 
        emp.nombre?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        emp.apellido?.toLowerCase().includes(formData.searchTerm.toLowerCase()) ||
        emp.nss?.includes(formData.searchTerm)
      )
    : [];

  // Calcular nómina cuando cambian los datos relevantes
  useEffect(() => {
    if (formData.selectedEmpleado && formData.diasLaborados) {
      calcularNomina();
    }
  }, [formData.selectedEmpleado, formData.diasLaborados, formData.horasExtra, formData.bonos, formData.deduccionesAdicionales, formData.aplicarISR]);

  const calcularNomina = () => {
    if (!formData.selectedEmpleado) return;

    const pagoDiario = formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario || 0;
    const diasLaborados = parseFloat(formData.diasLaborados) || 0;
    const horasExtra = parseFloat(formData.horasExtra) || 0;
    const bonos = parseFloat(formData.bonos) || 0;
    const deduccionesAdicionales = parseFloat(formData.deduccionesAdicionales) || 0;

    // Cálculo básico
    const salarioBase = diasLaborados * pagoDiario;
    const montoHorasExtra = horasExtra * (pagoDiario / 8); // Asumiendo 8 horas por día
    const subtotal = salarioBase + montoHorasExtra + bonos;
    
    // ISR básico (simplificado)
    const isr = formData.aplicarISR ? subtotal * 0.15 : 0; // 15% simplificado
    const totalDeducciones = isr + deduccionesAdicionales;
    const montoTotal = subtotal - totalDeducciones;

    setCalculoNomina({
      salarioBase,
      montoHorasExtra,
      bonos,
      subtotal,
      deducciones: {
        isr,
        adicionales: deduccionesAdicionales,
        total: totalDeducciones
      },
      montoTotal
    });
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData({
      selectedPeriodo: '',
      diasLaborados: 30,
      semanaNum: 1,
      selectedEmpleado: null,
      searchTerm: '',
      horasExtra: 0,
      bonos: 0,
      deduccionesAdicionales: 0,
      aplicarISR: true
    });
    setCalculoNomina(null);
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
    await procesarNominaConPago(pagoValue);
  };

  const handlePagoModalCancel = () => {
    setShowPagoModal(false);
    setProcessingNomina(false);
  };

  const nextStep = () => {
    if (currentStep < 4) {
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
        return formData.selectedPeriodo;
      case 2:
        return formData.selectedEmpleado && formData.diasLaborados > 0;
      case 3:
        // El paso 3 es opcional, siempre es válido si se llegó aquí
        return true;
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
        aplicar_isr: formData.aplicarISR
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

      // Debug: Mostrar datos que se van a enviar
      console.log('Datos de nómina a enviar:', nominaData);
      console.log('Empleado seleccionado:', formData.selectedEmpleado);
      
      // Validar que todos los campos obligatorios estén presentes
      if (!nominaData.id_empleado || nominaData.id_empleado <= 0) {
        throw new Error('ID de empleado no válido');
      }
      if (!nominaData.id_semana || nominaData.id_semana <= 0) {
        throw new Error('ID de semana no válido');
      }
      if (!nominaData.id_proyecto || nominaData.id_proyecto <= 0) {
        throw new Error('ID de proyecto no válido');
      }
      if (!nominaData.dias_laborados || nominaData.dias_laborados <= 0) {
        throw new Error('Días laborados no válidos');
      }
      if (!nominaData.pago_por_dia || nominaData.pago_por_dia <= 0) {
        throw new Error('Pago por día no válido');
      }

      const response = await apiService.procesarNomina(nominaData);
      
      showSuccess('¡Éxito!', `Nómina generada exitosamente para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}`);
      
      // Generar PDF si es posible
      if (response?.data?.id_nomina) {
        try {
          showInfo('Generando PDF', 'Creando recibo de nómina...');
          
          const pdfResponse = await fetch(`/api/nomina/${response.data.id_nomina}/recibo`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/pdf'
            }
          });

          if (pdfResponse.ok) {
            const blob = await pdfResponse.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `nomina_${formData.selectedEmpleado.nombre}_${formData.selectedEmpleado.apellido}_${formData.selectedPeriodo}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            showSuccess('PDF Generado', `Recibo de nómina descargado para ${formData.selectedEmpleado.nombre} ${formData.selectedEmpleado.apellido}`);
          }
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

  const getCurrentPeriod = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const steps = [
    { id: 1, name: 'Período', icon: CalendarIcon },
    { id: 2, name: 'Empleado', icon: UserGroupIcon },
    { id: 3, name: 'Cálculo', icon: CurrencyDollarIcon },
    { id: 4, name: 'Confirmar', icon: CheckCircleIcon }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
        {/* Header del Wizard */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-3">
                <CurrencyDollarIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Procesar Nómina - Paso {currentStep} de 4
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
            <div className="flex items-center justify-between">
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
          {/* Paso 1: Selección de Período */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <CalendarIcon className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona el Período
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Elige el período para el cual se procesará la nómina
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Período (Año-Mes)
                  </label>
                  <input
                    type="month"
                    value={formData.selectedPeriodo}
                    onChange={(e) => updateFormData({ selectedPeriodo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Selecciona el período"
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
                    placeholder="Número de semana (1-4)"
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CalendarIcon className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        <strong>Período actual:</strong> {getCurrentPeriod()}
                      </p>
                      <p className="text-sm text-blue-600 dark:text-blue-300">
                        Selecciona el mes y año correspondiente al período de pago
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Paso 2: Selección de Empleado */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <UserGroupIcon className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Selecciona el Empleado
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Busca y selecciona el empleado para procesar su nómina
                </p>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buscar Empleado
                  </label>
                  <input
                    type="text"
                    value={formData.searchTerm}
                    onChange={(e) => updateFormData({ searchTerm: e.target.value })}
                    placeholder="Buscar por nombre, apellido o NSS..."
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
                              searchTerm: ''
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
                              NSS: {empleado.nss} • {empleado.oficio?.nombre || 'Sin oficio'}
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

                {/* Empleado seleccionado */}
                {formData.selectedEmpleado && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h5 className="text-sm font-semibold text-green-900 dark:text-green-200 mb-2 flex items-center">
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Empleado Seleccionado:
                    </h5>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700 dark:text-green-300">Nombre:</span>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {formData.selectedEmpleado.nombre} {formData.selectedEmpleado.apellido}
                        </p>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300">NSS:</span>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {formData.selectedEmpleado.nss}
                        </p>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300">Oficio:</span>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          {formData.selectedEmpleado.oficio?.nombre || 'Sin oficio'}
                        </p>
                      </div>
                      <div>
                        <span className="text-green-700 dark:text-green-300">Pago Diario:</span>
                        <p className={`font-medium ${
                          (formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario) 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {(formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario) 
                            ? formatCurrency(formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario)
                            : '⚠️ No configurado'
                          }
                        </p>
                        {!(formData.selectedEmpleado.pago_diario || formData.selectedEmpleado.contrato?.salario_diario) && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            Se solicitará al procesar la nómina
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Días laborados */}
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
                    placeholder="Días trabajados en el período"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 3: Cálculo de Nómina */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <CurrencyDollarIcon className="mx-auto h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Configuración Adicional (Opcional)
                </h4>
                <p className="text-gray-500 dark:text-gray-400">
                  Configura montos adicionales y deducciones si aplican
                </p>
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Todos los campos son opcionales
                </div>
              </div>

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Horas Extra</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.horasExtra}
                      onChange={(e) => updateFormData({ horasExtra: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0 (sin horas extra)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Solo si el empleado trabajó horas adicionales
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Bonos</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.bonos}
                      onChange={(e) => updateFormData({ bonos: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 (sin bonos)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Bonos por desempeño, productividad, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <span>Deducciones Adicionales</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">(opcional)</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.deduccionesAdicionales}
                      onChange={(e) => updateFormData({ deduccionesAdicionales: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00 (sin deducciones)"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Deducciones especiales o adelantos
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="aplicarISR"
                          checked={formData.aplicarISR}
                          onChange={(e) => updateFormData({ aplicarISR: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
                        />
                        <div className="ml-3">
                          <label htmlFor="aplicarISR" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Aplicar ISR (Impuesto Sobre la Renta)
                          </label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Se aplicará un 15% sobre el subtotal de la nómina. 
                            <span className="text-primary-600 dark:text-primary-400 font-medium">
                              Por defecto está activado.
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vista previa del cálculo */}
                {calculoNomina && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 mr-2 text-primary-600" />
                      Vista Previa del Cálculo:
                    </h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Salario Base:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculoNomina.salarioBase)}
                        </span>
                      </div>
                      
                      {/* Horas Extra - siempre mostrar */}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Horas Extra:
                          {calculoNomina.montoHorasExtra === 0 && (
                            <span className="text-xs text-gray-400 ml-1">(sin horas extra)</span>
                          )}
                        </span>
                        <span className={`font-medium ${
                          calculoNomina.montoHorasExtra > 0 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatCurrency(calculoNomina.montoHorasExtra)}
                        </span>
                      </div>
                      
                      {/* Bonos - siempre mostrar */}
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">
                          Bonos:
                          {calculoNomina.bonos === 0 && (
                            <span className="text-xs text-gray-400 ml-1">(sin bonos)</span>
                          )}
                        </span>
                        <span className={`font-medium ${
                          calculoNomina.bonos > 0 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {formatCurrency(calculoNomina.bonos)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2">
                        <span className="font-medium text-gray-900 dark:text-white">Subtotal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculoNomina.subtotal)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-red-600 dark:text-red-400">
                          Deducciones:
                          <span className="text-xs text-gray-400 ml-1">
                            ({formatCurrency(calculoNomina.deducciones.isr)} ISR + {formatCurrency(calculoNomina.deducciones.adicionales)} adicionales)
                          </span>
                        </span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(calculoNomina.deducciones.total)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between border-t-2 border-gray-300 dark:border-gray-600 pt-2">
                        <span className="font-bold text-lg text-gray-900 dark:text-white">Total a Pagar:</span>
                        <span className="font-bold text-lg text-green-600 dark:text-green-400">
                          {formatCurrency(calculoNomina.montoTotal)}
                        </span>
                      </div>
                      
                      {/* Nota informativa */}
                      <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
                        💡 <strong>Nota:</strong> Los campos opcionales (horas extra, bonos, deducciones) se muestran en gris cuando no aplican.
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Botón para saltar configuración */}
                <div className="text-center pt-4">
                  <button
                    onClick={nextStep}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200"
                  >
                    <span className="mr-2">💡</span>
                    Saltar configuración (usar solo salario base)
                  </button>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Puedes omitir los campos opcionales y procesar la nómina con solo el salario base
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Confirmación */}
          {currentStep === 4 && (
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

              <div className="max-w-2xl mx-auto space-y-4">
                {/* Resumen de datos */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
                    Resumen de la Nómina:
                  </h5>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Empleado:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {formData.selectedEmpleado?.nombre} {formData.selectedEmpleado?.apellido}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Período:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {formData.selectedPeriodo} - Semana {formData.semanaNum}
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Días Laborados:</span>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        {formData.diasLaborados} días
                      </p>
                    </div>
                    <div>
                      <span className="text-blue-700 dark:text-blue-300">Total a Pagar:</span>
                      <p className="font-bold text-green-600 dark:text-green-400">
                        {calculoNomina ? formatCurrency(calculoNomina.montoTotal) : '$0.00'}
                      </p>
                    </div>
                  </div>
                </div>

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
            
            {currentStep < 4 ? (
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
                disabled={processingNomina}
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

export default NominaWizard;
