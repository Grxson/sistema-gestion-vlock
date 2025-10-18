import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { formatCurrency } from '../../utils/currency';
import nominasServices from '../../services/nominas';
import {
  XCircleIcon,
  PencilIcon,
  CalculatorIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const EditNominaModal = ({ isOpen, onClose, nominaData, empleado, onSuccess }) => {
  console.log('🔍 [EDIT_MODAL] Props recibidos:', {
    isOpen,
    nominaData: !!nominaData,
    empleado: !!empleado,
    empleadoId: empleado?.id_empleado,
    nominaId: nominaData?.id_nomina
  });
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    diasLaborados: 6,
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    aplicarISR: false,
    aplicarIMSS: false,
    aplicarInfonavit: false,
    pagoParcial: false,
    montoAPagar: null,
    liquidarAdeudos: false
  });
  
  const [calculoNomina, setCalculoNomina] = useState(null);

  // Log cuando cambia calculoNomina
  useEffect(() => {
    console.log('🔍 [CALCULO_NOMINA_STATE] Estado actualizado:', calculoNomina);
  }, [calculoNomina]);

  // Efecto adicional para recalcular cuando cambien los valores numéricos
  useEffect(() => {
    if (isOpen && empleado && formData.diasLaborados && formData.diasLaborados > 0) {
      console.log('🔍 [RECALCULO_AUTOMATICO] Detectado cambio en valores, recalculando...');
      // Pequeño delay para evitar múltiples cálculos simultáneos
      const timeoutId = setTimeout(() => {
        calcularNomina();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [
    formData.diasLaborados,
    formData.horasExtra,
    formData.bonos,
    formData.deduccionesAdicionales,
    formData.aplicarISR,
    formData.aplicarIMSS,
    formData.aplicarInfonavit,
    isOpen,
    empleado
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (isOpen && nominaData) {
      console.log('🔍 [EDIT_MODAL] Cargando datos de nómina:', nominaData);
      
      const newFormData = {
        diasLaborados: nominaData.dias_laborados && nominaData.dias_laborados > 0 ? nominaData.dias_laborados : 6, // Forzar valor válido
        horasExtra: nominaData.horas_extra || 0,
        bonos: nominaData.bonos || 0,
        deduccionesAdicionales: nominaData.deducciones_adicionales || 0,
        aplicarISR: nominaData.aplicar_isr || false,
        aplicarIMSS: nominaData.aplicar_imss || false,
        aplicarInfonavit: nominaData.aplicar_infonavit || false,
        pagoParcial: nominaData.pago_parcial || false,
        montoAPagar: nominaData.monto_a_pagar || null,
        liquidarAdeudos: nominaData.liquidar_adeudos || false
      };
      
      console.log('🔍 [EDIT_MODAL] Datos del formulario establecidos:', newFormData);
      console.log('🔍 [EDIT_MODAL] Tipo de diasLaborados:', typeof newFormData.diasLaborados);
      setFormData(newFormData);
    }
  }, [isOpen, nominaData]);

  // Calcular nómina cuando cambian los datos
  useEffect(() => {
    console.log('🔍 [USE_EFFECT] Ejecutándose con formData:', formData);
    
    // Validar días laborados de la misma manera que en calcularNomina
    let diasLaborados = 0;
    
    if (typeof formData.diasLaborados === 'string') {
      if (formData.diasLaborados === '') {
        diasLaborados = 0;
      } else {
        const parsed = parseInt(formData.diasLaborados, 10);
        diasLaborados = isNaN(parsed) ? 0 : parsed;
      }
    } else if (typeof formData.diasLaborados === 'number') {
      diasLaborados = formData.diasLaborados;
    } else {
      diasLaborados = 0;
    }
    
    console.log('🔍 [USE_EFFECT] Validación de días laborados:', {
      original: formData.diasLaborados,
      procesado: diasLaborados,
      esValido: diasLaborados > 0,
      empleado: !!empleado,
      isOpen
    });
    
    if (isOpen && empleado && diasLaborados > 0) {
      console.log('🔍 [EDIT_MODAL] Recalculando nómina automáticamente...');
      calcularNomina();
    } else {
      console.log('🔍 [USE_EFFECT] No se puede calcular:', {
        isOpen,
        empleado: !!empleado,
        diasLaborados: diasLaborados,
        formDataDiasLaborados: formData.diasLaborados,
        tipo: typeof formData.diasLaborados
      });
    }
  }, [
    formData.diasLaborados, 
    formData.horasExtra, 
    formData.bonos, 
    formData.deduccionesAdicionales, 
    formData.aplicarISR, 
    formData.aplicarIMSS, 
    formData.aplicarInfonavit,
    empleado, 
    isOpen
  ]);

  const calcularNomina = async () => {
    console.log('🔍 [CALCULO] Iniciando cálculo con formData:', formData);
    
    // Validar que los días laborados sean un número válido mayor a 0
    let diasLaborados = 0;
    
    if (typeof formData.diasLaborados === 'string') {
      if (formData.diasLaborados === '') {
        diasLaborados = 0;
      } else {
        const parsed = parseInt(formData.diasLaborados, 10);
        diasLaborados = isNaN(parsed) ? 0 : parsed;
      }
    } else if (typeof formData.diasLaborados === 'number') {
      diasLaborados = formData.diasLaborados;
    } else {
      diasLaborados = 0;
    }
    
    console.log('🔍 [CALCULO] Procesamiento de días laborados:', {
      original: formData.diasLaborados,
      tipoOriginal: typeof formData.diasLaborados,
      procesado: diasLaborados,
      tipoProcesado: typeof diasLaborados,
      esValido: diasLaborados > 0
    });
    
    if (!empleado || !diasLaborados || diasLaborados <= 0) {
      console.log('🔍 [CALCULO] No se puede calcular - datos insuficientes:', {
        empleado: !!empleado,
        diasLaborados: diasLaborados,
        formDataDiasLaborados: formData.diasLaborados,
        tipo: typeof formData.diasLaborados
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Validación final estricta
      if (diasLaborados <= 0 || isNaN(diasLaborados) || !Number.isInteger(diasLaborados)) {
        console.log('🔍 [CALCULO] ERROR CRÍTICO: días laborados inválidos antes de crear datosNomina:', {
          diasLaborados,
          esMayorA0: diasLaborados > 0,
          esNaN: isNaN(diasLaborados),
          esEntero: Number.isInteger(diasLaborados)
        });
        return;
      }

      // Calcular salario base proporcional a los días laborados
      const pagoSemanal = parseFloat(empleado.pago_semanal) || 0;
      const salarioBaseProporcional = (pagoSemanal / 6) * diasLaborados; // Pago diario * días trabajados
      
      const datosNomina = {
        id_empleado: empleado.id_empleado,
        diasLaborados: diasLaborados,
        pagoPorDia: pagoSemanal, // Pago semanal completo para cálculos de horas extra
        salarioBase: salarioBaseProporcional, // Salario proporcional a días trabajados
        horasExtra: formData.horasExtra === '' ? 0 : parseFloat(formData.horasExtra) || 0,
        bonos: formData.bonos === '' ? 0 : parseFloat(formData.bonos) || 0,
        deduccionesAdicionales: formData.deduccionesAdicionales === '' ? 0 : parseFloat(formData.deduccionesAdicionales) || 0,
        aplicarISR: formData.aplicarISR,
        aplicarIMSS: formData.aplicarIMSS,
        aplicarInfonavit: formData.aplicarInfonavit,
        esPagoSemanal: true
      };

      console.log('🔍 [CALCULO] Validación final:', {
        diasLaborados,
        tipo: typeof diasLaborados,
        esMayorA0: diasLaborados > 0,
        formDataOriginal: formData.diasLaborados,
        tipoOriginal: typeof formData.diasLaborados,
        pagoSemanal,
        pagoDiario: pagoSemanal / 6,
        salarioBaseProporcional,
        pagoPorDia: pagoSemanal, // Para horas extra
        calculo: `${diasLaborados} días × $${(pagoSemanal / 6).toFixed(2)} = $${salarioBaseProporcional.toFixed(2)}`
      });

      // Validación adicional antes de enviar al servicio
      if (diasLaborados <= 0 || isNaN(diasLaborados) || !Number.isInteger(diasLaborados)) {
        console.log('🔍 [CALCULO] ERROR: días laborados inválidos:', {
          diasLaborados,
          esMayorA0: diasLaborados > 0,
          esNaN: isNaN(diasLaborados),
          esEntero: Number.isInteger(diasLaborados)
        });
        return;
      }

      console.log('🔍 [CALCULO] Enviando datos al servicio:', datosNomina);
      console.log('🔍 [CALCULO] Verificación detallada:', {
        diasLaborados: datosNomina.diasLaborados,
        tipoDiasLaborados: typeof datosNomina.diasLaborados,
        esMayorA0: datosNomina.diasLaborados > 0,
        pagoPorDia: datosNomina.pagoPorDia,
        tipoPagoPorDia: typeof datosNomina.pagoPorDia,
        empleado: empleado,
        pagoSemanal: empleado?.pago_semanal
      });
      
      const calculo = await nominasServices.calculadora.calcularNomina(datosNomina);
      console.log('🔍 [CALCULO] Respuesta del servicio:', calculo);
      setCalculoNomina(calculo);
      
    } catch (error) {
      console.error('Error calculando nómina:', error);
      // No mostrar error al usuario si es por datos insuficientes
      if (!error.message.includes('días laborados deben ser mayor a 0')) {
        showError('Error', 'No se pudo calcular la nómina');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log('🔍 [INPUT_CHANGE] Campo cambiado:', field, 'Valor:', value);
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleNumericInputChange = (field, value) => {
    // Permitir valores vacíos y solo convertir a número cuando sea necesario
    if (value === '' || value === null || value === undefined) {
      handleInputChange(field, '');
    } else {
      // Remover ceros a la izquierda
      const cleanValue = value.replace(/^0+/, '') || '0';
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        handleInputChange(field, numValue);
      } else {
        handleInputChange(field, value);
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.diasLaborados || formData.diasLaborados <= 0) {
      newErrors.diasLaborados = 'Los días laborados deben ser mayor a 0';
    }
    
    if (formData.diasLaborados > 7) {
      newErrors.diasLaborados = 'Los días laborados no pueden ser mayor a 7';
    }
    
    if (formData.horasExtra < 0) {
      newErrors.horasExtra = 'Las horas extra no pueden ser negativas';
    }
    
    if (formData.bonos < 0) {
      newErrors.bonos = 'Los bonos no pueden ser negativos';
    }
    
    if (formData.deduccionesAdicionales < 0) {
      newErrors.deduccionesAdicionales = 'Las deducciones no pueden ser negativas';
    }
    
    if (formData.pagoParcial && (!formData.montoAPagar || formData.montoAPagar <= 0)) {
      newErrors.montoAPagar = 'El monto a pagar debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showError('Error', 'Por favor corrige los errores en el formulario');
      return;
    }
    
    try {
      setSaving(true);
      
      // Cálculo directo y simple
      const pagoSemanal = parseFloat(empleado.pago_semanal) || 0;
      const salarioBase = (pagoSemanal / 6) * formData.diasLaborados;
      const horasExtra = formData.horasExtra === '' ? 0 : parseFloat(formData.horasExtra) || 0;
      const bonos = formData.bonos === '' ? 0 : parseFloat(formData.bonos) || 0;
      const deducciones = formData.deduccionesAdicionales === '' ? 0 : parseFloat(formData.deduccionesAdicionales) || 0;
      
      const montoTotalCalculado = salarioBase + horasExtra + bonos - deducciones;
      
      console.log('🔍 [SAVE] Cálculo directo:', {
        pagoSemanal,
        diasLaborados: formData.diasLaborados,
        pagoDiario: pagoSemanal / 6,
        salarioBase,
        horasExtra,
        bonos,
        deducciones,
        montoTotalCalculado
      });
      
      const updateData = {
        dias_laborados: formData.diasLaborados,
        horas_extra: formData.horasExtra === '' ? 0 : parseFloat(formData.horasExtra) || 0,
        bonos: formData.bonos === '' ? 0 : parseFloat(formData.bonos) || 0,
        deducciones_adicionales: formData.deduccionesAdicionales === '' ? 0 : parseFloat(formData.deduccionesAdicionales) || 0,
        aplicar_isr: formData.aplicarISR,
        aplicar_imss: formData.aplicarIMSS,
        aplicar_infonavit: formData.aplicarInfonavit,
        pago_parcial: formData.pagoParcial,
        monto_a_pagar: formData.montoAPagar === '' ? null : (formData.montoAPagar || null),
        liquidar_adeudos: formData.liquidarAdeudos,
        monto_total: montoTotalCalculado // ✅ Actualizar el monto total calculado
      };
      
      console.log('🔄 [EDIT_MODAL] Actualizando nómina:', nominaData.id_nomina, updateData);
      console.log('🔄 [EDIT_MODAL] Monto total calculado:', montoTotalCalculado);
      console.log('🔄 [EDIT_MODAL] Verificación final monto_total:', {
        montoTotalCalculado,
        tipo: typeof montoTotalCalculado,
        updateDataMontoTotal: updateData.monto_total,
        esIgual: montoTotalCalculado === updateData.monto_total
      });
      
      const response = await nominasServices.nominas.update(nominaData.id_nomina, updateData);
      
      if (response.success) {
        showSuccess('Éxito', 'Nómina actualizada correctamente');
        onSuccess && onSuccess();
        onClose();
      } else {
        showError('Error', 'No se pudo actualizar la nómina');
      }
      
    } catch (error) {
      console.error('Error actualizando nómina:', error);
      showError('Error', 'No se pudo actualizar la nómina');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFormData({
      diasLaborados: 6,
      horasExtra: 0,
      bonos: 0,
      deduccionesAdicionales: 0,
      aplicarISR: false,
      aplicarIMSS: false,
      aplicarInfonavit: false,
      pagoParcial: false,
      montoAPagar: null,
      liquidarAdeudos: false
    });
    setCalculoNomina(null);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-70 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative mx-auto border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-2xl rounded-lg bg-white dark:bg-dark-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <PencilIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar Nómina
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {empleado?.nombre} {empleado?.apellido}
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
        </div>

        {/* Contenido */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de edición */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Datos de la Nómina
                </h3>
                
                {/* Días Laborados */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Días Laborados
                  </label>
                  <input
                    type="text"
                    value={formData.diasLaborados || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d+$/.test(value)) {
                        const numValue = value === '' ? '' : parseInt(value);
                        if (numValue === '' || (numValue >= 1 && numValue <= 7)) {
                          handleInputChange('diasLaborados', numValue);
                        }
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                      errors.diasLaborados ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="6"
                  />
                  {errors.diasLaborados && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.diasLaborados}</p>
                  )}
                </div>

                {/* Horas Extra */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horas Extra
                  </label>
                  <input
                    type="text"
                    value={formData.horasExtra || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleInputChange('horasExtra', value === '' ? '' : parseFloat(value) || '');
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                      errors.horasExtra ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0"
                  />
                  {errors.horasExtra && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.horasExtra}</p>
                  )}
                </div>

                {/* Bonos */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Bonos
                  </label>
                  <input
                    type="text"
                    value={formData.bonos || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleInputChange('bonos', value === '' ? '' : parseFloat(value) || '');
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                      errors.bonos ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.bonos && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.bonos}</p>
                  )}
                </div>

                {/* Deducciones Adicionales */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Deducciones Adicionales
                  </label>
                  <input
                    type="text"
                    value={formData.deduccionesAdicionales || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        handleInputChange('deduccionesAdicionales', value === '' ? '' : parseFloat(value) || '');
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                      errors.deduccionesAdicionales ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.deduccionesAdicionales && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.deduccionesAdicionales}</p>
                  )}
                </div>

                {/* Configuraciones de Impuestos */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Configuraciones de Impuestos
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.aplicarISR}
                        onChange={(e) => handleInputChange('aplicarISR', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aplicar ISR</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.aplicarIMSS}
                        onChange={(e) => handleInputChange('aplicarIMSS', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aplicar IMSS</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.aplicarInfonavit}
                        onChange={(e) => handleInputChange('aplicarInfonavit', e.target.checked)}
                        className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Aplicar Infonavit</span>
                    </label>
                  </div>
                </div>

                {/* Pago Parcial */}
                <div className="mb-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pagoParcial}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        handleInputChange('pagoParcial', isChecked);
                        if (isChecked && calculoNomina) {
                          // Establecer el monto a pagar como el total calculado
                          handleInputChange('montoAPagar', Math.round(calculoNomina.montoTotal * 100) / 100);
                        } else {
                          handleInputChange('montoAPagar', null);
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Pago Parcial</span>
                  </label>
                  
                  {formData.pagoParcial && calculoNomina && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto a Pagar (Máximo: {formatCurrency(calculoNomina.montoTotal)})
                      </label>
                      <input
                        type="text"
                        value={formData.montoAPagar || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d*\.?\d*$/.test(value)) {
                            const cleanValue = value.replace(',', '.');
                            const num = parseFloat(cleanValue);
                            if (value === '' || (!isNaN(num) && num >= 0 && num <= calculoNomina.montoTotal)) {
                              handleInputChange('montoAPagar', value === '' ? '' : num);
                            }
                          }
                        }}
                        onBlur={(e) => {
                          if (e.target.value === '') {
                            handleInputChange('montoAPagar', 0);
                          } else {
                            const cleanValue = e.target.value.replace(',', '.');
                            const num = parseFloat(cleanValue);
                            if (!isNaN(num)) {
                              const roundedNum = Math.round(num * 100) / 100;
                              handleInputChange('montoAPagar', roundedNum);
                            }
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${
                          errors.montoAPagar ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        }`}
                        placeholder="0.00"
                      />
                      {errors.montoAPagar && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montoAPagar}</p>
                      )}
                      
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
                </div>
              </div>
            </div>

            {/* Preview de Cálculos */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Cálculos Actualizados
                </h3>
                
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Calculando...</span>
                  </div>
                ) : calculoNomina ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Salario Base:</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(calculoNomina.salarioBase || 0)}
                      </span>
                    </div>
                    
                    {calculoNomina.montoHorasExtra > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Horas Extra:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(calculoNomina.montoHorasExtra || 0)}
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
                    
                    {calculoNomina.deducciones && Object.keys(calculoNomina.deducciones).length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Deducciones:</span>
                        <span className="font-medium text-red-600 dark:text-red-400">
                          -{formatCurrency(calculoNomina.deducciones.total || 0)}
                        </span>
                      </div>
                    )}
                    
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                      <div className="flex justify-between">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">
                          {formData.pagoParcial ? 'Total a Pagar (Parcial):' : 'Total a Pagar:'}
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(formData.pagoParcial ? (formData.montoAPagar || 0) : (calculoNomina.montoTotal || 0))}
                        </span>
                      </div>
                    </div>
                    
                    {/* Mostrar información adicional si es pago parcial */}
                    {formData.pagoParcial && formData.montoAPagar > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <div className="flex justify-between mb-1">
                            <span>Total original:</span>
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
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <CalculatorIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>Los cálculos aparecerán aquí</p>
                  </div>
                )}
              </div>

              {/* Información del Empleado */}
              {empleado && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Información del Empleado
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {empleado.nombre} {empleado.apellido}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Pago Semanal: {formatCurrency(empleado.pago_semanal || 0)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Período: {(() => {
                          if (nominaData?.periodo) {
                            return nominaData.periodo;
                          }
                          if (nominaData?.fecha_creacion || nominaData?.createdAt) {
                            const fecha = new Date(nominaData.fecha_creacion || nominaData.createdAt);
                            const año = fecha.getFullYear();
                            const mes = fecha.getMonth() + 1;
                            return `${año}-${String(mes).padStart(2, '0')}`;
                          }
                          return 'N/A';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botón de prueba */}
        <div className="px-6 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-800">
          <button
            type="button"
            onClick={() => {
              console.log('🔍 [TEST] Forzando cálculo manual...');
              console.log('🔍 [TEST] Estado actual:', { formData, empleado, calculoNomina });
              calcularNomina();
            }}
            className="px-3 py-1 text-xs font-medium text-yellow-800 dark:text-yellow-200 bg-yellow-100 dark:bg-yellow-800 hover:bg-yellow-200 dark:hover:bg-yellow-700 rounded transition-colors duration-200"
          >
            🔍 Probar Cálculo
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNominaModal;
