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

  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
  const [formData, setFormData] = useState({
    diasLaborados: 6,
    horasExtra: 0,
    bonos: 0,
    deduccionesAdicionales: 0,
    montoISR: 0,
    montoIMSS: 0,
    montoInfonavit: 0,
    descuentos: 0,
    pagoParcial: false,
    montoAPagar: null,
    liquidarAdeudos: false
  });
  
  const [calculoNomina, setCalculoNomina] = useState(null);

  useEffect(() => {
    if (isOpen && empleado && formData.diasLaborados && formData.diasLaborados > 0) {
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
    isOpen,
    empleado
  ]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const diasRef = React.useRef(null);
  const toNum = (v) => (v === '' || v === null || v === undefined ? 0 : (typeof v === 'string' ? parseFloat(v) : Number(v))) || 0;

  const resumenCalculo = React.useMemo(() => {
    const base = toNum(calculoNomina?.salarioBase);
    const horasExtraMonto = toNum(calculoNomina?.montoHorasExtra);
    const bonosMonto = toNum(calculoNomina?.bonos);
    const autoDeducciones = toNum(calculoNomina?.deducciones?.total);
    const isr = toNum(formData.montoISR);
    const imss = toNum(formData.montoIMSS);
    const infonavit = toNum(formData.montoInfonavit);
    const descuentos = toNum(formData.descuentos);
    const otras = toNum(formData.deduccionesAdicionales);
    const subtotal = base + horasExtraMonto + bonosMonto;
    const deduccionesTotal = autoDeducciones + isr + imss + infonavit + descuentos + otras;
    const total = subtotal - deduccionesTotal;
    return {
      base,
      horasExtraMonto,
      bonosMonto,
      autoDeducciones,
      isr,
      imss,
      infonavit,
      descuentos,
      otras,
      subtotal,
      deduccionesTotal,
      total
    };
  }, [calculoNomina, formData.montoISR, formData.montoIMSS, formData.montoInfonavit, formData.descuentos, formData.deduccionesAdicionales]);

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (isOpen && nominaData) {
      const num = (v) => {
        if (v === '' || v === null || v === undefined) return 0;
        const n = typeof v === 'string' ? parseFloat(v) : Number(v);
        return isNaN(n) ? 0 : n;
      };
      
      const newFormData = {
        diasLaborados: num(nominaData.dias_laborados) > 0 ? num(nominaData.dias_laborados) : 6,
        horasExtra: num(nominaData.horas_extra),
        bonos: num(nominaData.bonos),
        deduccionesAdicionales: num(nominaData.deducciones_adicionales ?? nominaData.otras_deducciones),
        montoISR: num(
          nominaData.deducciones_isr ?? nominaData.isr ?? nominaData.monto_isr ?? nominaData?.deducciones?.isr ?? nominaData?.descuentos_fiscales?.isr
        ),
        montoIMSS: num(
          nominaData.deducciones_imss ?? nominaData.imss ?? nominaData.monto_imss ?? nominaData?.deducciones?.imss ?? nominaData?.descuentos_fiscales?.imss
        ),
        montoInfonavit: num(
          nominaData.deducciones_infonavit ?? nominaData.infonavit ?? nominaData.monto_infonavit ?? nominaData?.deducciones?.infonavit ?? nominaData?.descuentos_fiscales?.infonavit
        ),
        descuentos: num(
          nominaData.descuentos ?? nominaData.adelantos ?? nominaData.descuentos_adelantos ?? nominaData?.deducciones?.adelantos
        ),
        pagoParcial: !!(nominaData.pago_parcial),
        montoAPagar: nominaData.monto_a_pagar === undefined ? null : num(nominaData.monto_a_pagar),
        liquidarAdeudos: !!(nominaData.liquidar_adeudos)
      };
      
      setFormData(newFormData);
      setInitialSnapshot(newFormData);
    }
  }, [isOpen, nominaData]);

  useEffect(() => {
    if (isOpen && diasRef.current) {
      diasRef.current.focus();
    }
  }, [isOpen]);

  const isFormValid = () => {
    return validateForm();
  };

  const isDirty = () => {
    if (!initialSnapshot) return false;
    try {
      const a = initialSnapshot;
      const b = formData;
      return (
        a.diasLaborados !== b.diasLaborados ||
        a.horasExtra !== b.horasExtra ||
        a.bonos !== b.bonos ||
        a.deduccionesAdicionales !== b.deduccionesAdicionales ||
        a.montoISR !== b.montoISR ||
        a.montoIMSS !== b.montoIMSS ||
        a.montoInfonavit !== b.montoInfonavit ||
        a.descuentos !== b.descuentos ||
        a.pagoParcial !== b.pagoParcial ||
        (a.montoAPagar || 0) !== (b.montoAPagar || 0) ||
        a.liquidarAdeudos !== b.liquidarAdeudos
      );
    } catch { return false; }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!isOpen) return;
      const isSave = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's';
      if (isSave) {
        e.preventDefault();
        if (!saving && !loading && isFormValid()) handleSave();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, saving, loading, formData]);

  // Calcular nómina cuando cambian los datos
  useEffect(() => {
    
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
    

    
    if (isOpen && empleado && diasLaborados > 0) {
      calcularNomina();
    }
  }, [
    formData.diasLaborados, 
    formData.horasExtra, 
    formData.bonos, 
    formData.deduccionesAdicionales, 
    // Los siguientes no recalculan backend, pero actualizan la vista por useMemo
    formData.montoISR,
    formData.montoIMSS,
    formData.montoInfonavit,
    formData.descuentos,
    empleado, 
    isOpen
  ]);

  const calcularNomina = async () => {
    
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
    

    if (!empleado || !diasLaborados || diasLaborados <= 0) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Validación final estricta
      if (diasLaborados <= 0 || isNaN(diasLaborados) || !Number.isInteger(diasLaborados)) {
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
        esPagoSemanal: true
      };



      // Validación adicional antes de enviar al servicio
      if (diasLaborados <= 0 || isNaN(diasLaborados) || !Number.isInteger(diasLaborados)) {
        return;
      }

      const calculo = await nominasServices.calculadora.calcularNomina(datosNomina);
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
    if (formData.montoISR < 0) {
      newErrors.montoISR = 'El ISR no puede ser negativo';
    }
    if (formData.montoIMSS < 0) {
      newErrors.montoIMSS = 'El IMSS no puede ser negativo';
    }
    if (formData.montoInfonavit < 0) {
      newErrors.montoInfonavit = 'El Infonavit no puede ser negativo';
    }
    if (formData.descuentos < 0) {
      newErrors.descuentos = 'Los descuentos no pueden ser negativos';
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
      const deducciones =
        (formData.deduccionesAdicionales === '' ? 0 : parseFloat(formData.deduccionesAdicionales) || 0) +
        (formData.montoISR === '' ? 0 : parseFloat(formData.montoISR) || 0) +
        (formData.montoIMSS === '' ? 0 : parseFloat(formData.montoIMSS) || 0) +
        (formData.montoInfonavit === '' ? 0 : parseFloat(formData.montoInfonavit) || 0) +
        (formData.descuentos === '' ? 0 : parseFloat(formData.descuentos) || 0);
      
      const montoTotalCalculado = salarioBase + horasExtra + bonos - deducciones;
      

      const updateData = {
        dias_laborados: formData.diasLaborados,
        horas_extra: formData.horasExtra === '' ? 0 : parseFloat(formData.horasExtra) || 0,
        bonos: formData.bonos === '' ? 0 : parseFloat(formData.bonos) || 0,
        deducciones_adicionales: formData.deduccionesAdicionales === '' ? 0 : parseFloat(formData.deduccionesAdicionales) || 0,
        deducciones_isr: formData.montoISR === '' ? 0 : parseFloat(formData.montoISR) || 0,
        deducciones_imss: formData.montoIMSS === '' ? 0 : parseFloat(formData.montoIMSS) || 0,
        deducciones_infonavit: formData.montoInfonavit === '' ? 0 : parseFloat(formData.montoInfonavit) || 0,
        descuentos: formData.descuentos === '' ? 0 : parseFloat(formData.descuentos) || 0,
        pago_parcial: formData.pagoParcial,
        monto_a_pagar: formData.montoAPagar === '' ? null : (formData.montoAPagar || null),
        liquidar_adeudos: formData.liquidarAdeudos,
        monto_total: montoTotalCalculado // ✅ Actualizar el monto total calculado
      };
      
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
    if (isDirty() && !saving && !loading) {
      const ok = window.confirm('Tienes cambios sin guardar. ¿Deseas descartarlos?');
      if (!ok) return;
    }
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
                    ref={diasRef}
                    type="number"
                    min={1}
                    max={7}
                    step={1}
                    value={formData.diasLaborados || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      const num = v === '' ? '' : parseInt(v, 10);
                      if (v === '' || (!isNaN(num) && num >= 1 && num <= 7)) handleInputChange('diasLaborados', num);
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v === '') return;
                      let num = parseInt(v, 10);
                      num = Math.min(7, Math.max(1, isNaN(num) ? 1 : num));
                      handleInputChange('diasLaborados', num);
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

                {/* Deducciones Fiscales */}
                <div className="mt-6">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Deducciones Fiscales (ingresar monto solo si aplica)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* ISR */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">ISR</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.montoISR ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return handleInputChange('montoISR', '');
                          const num = parseFloat(v);
                          if (!isNaN(num) && num >= 0) handleInputChange('montoISR', num);
                        }}
                        onBlur={(e) => {
                          const v = e.target.value; if (v === '') return; const num = parseFloat(v); if (!isNaN(num)) handleInputChange('montoISR', Math.round(num * 100) / 100);
                        }}
                        placeholder="0.00 (dejar en 0 si no aplica)"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${errors.montoISR ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {errors.montoISR && (<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montoISR}</p>)}
                    </div>
                    {/* IMSS */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">IMSS</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.montoIMSS ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return handleInputChange('montoIMSS', '');
                          const num = parseFloat(v);
                          if (!isNaN(num) && num >= 0) handleInputChange('montoIMSS', num);
                        }}
                        onBlur={(e) => {
                          const v = e.target.value; if (v === '') return; const num = parseFloat(v); if (!isNaN(num)) handleInputChange('montoIMSS', Math.round(num * 100) / 100);
                        }}
                        placeholder="0.00 (dejar en 0 si no aplica)"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${errors.montoIMSS ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {errors.montoIMSS && (<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montoIMSS}</p>)}
                    </div>
                    {/* Infonavit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Infonavit</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.montoInfonavit ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return handleInputChange('montoInfonavit', '');
                          const num = parseFloat(v);
                          if (!isNaN(num) && num >= 0) handleInputChange('montoInfonavit', num);
                        }}
                        onBlur={(e) => {
                          const v = e.target.value; if (v === '') return; const num = parseFloat(v); if (!isNaN(num)) handleInputChange('montoInfonavit', Math.round(num * 100) / 100);
                        }}
                        placeholder="0.00 (dejar en 0 si no aplica)"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${errors.montoInfonavit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {errors.montoInfonavit && (<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.montoInfonavit}</p>)}
                    </div>
                    {/* Descuentos (Adelantos) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Descuentos (Adelantos)</label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={formData.descuentos ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === '') return handleInputChange('descuentos', '');
                          const num = parseFloat(v);
                          if (!isNaN(num) && num >= 0) handleInputChange('descuentos', num);
                        }}
                        onBlur={(e) => {
                          const v = e.target.value; if (v === '') return; const num = parseFloat(v); if (!isNaN(num)) handleInputChange('descuentos', Math.round(num * 100) / 100);
                        }}
                        placeholder="0.00"
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white ${errors.descuentos ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      />
                      {errors.descuentos && (<p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descuentos}</p>)}
                    </div>
                  </div>
                </div>

                {/* Horas Extra */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Horas Extra
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.horasExtra || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') return handleInputChange('horasExtra', '');
                      const num = parseFloat(v);
                      if (!isNaN(num) && num >= 0) handleInputChange('horasExtra', num);
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v === '') return;
                      const num = parseFloat(v);
                      if (!isNaN(num)) handleInputChange('horasExtra', Math.round(num * 100) / 100);
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
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.bonos || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') return handleInputChange('bonos', '');
                      const num = parseFloat(v);
                      if (!isNaN(num) && num >= 0) handleInputChange('bonos', num);
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v === '') return;
                      const num = parseFloat(v);
                      if (!isNaN(num)) handleInputChange('bonos', Math.round(num * 100) / 100);
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
                    type="number"
                    min={0}
                    step="0.01"
                    value={formData.deduccionesAdicionales || ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '') return handleInputChange('deduccionesAdicionales', '');
                      const num = parseFloat(v);
                      if (!isNaN(num) && num >= 0) handleInputChange('deduccionesAdicionales', num);
                    }}
                    onBlur={(e) => {
                      const v = e.target.value;
                      if (v === '') return;
                      const num = parseFloat(v);
                      if (!isNaN(num)) handleInputChange('deduccionesAdicionales', Math.round(num * 100) / 100);
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

            {/* Panel derecho: primero Información del Empleado, después Cálculos */}
            <div className="space-y-6">
              {/* Información del Empleado */}
              {empleado && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información del Empleado</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{empleado.nombre} {empleado.apellido}</span>
                    </div>
                    <div className="flex items-center">
                      <CurrencyDollarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">Pago Semanal: {formatCurrency(empleado.pago_semanal || 0)}</span>
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Período: {(() => {
                          if (nominaData?.periodo) return nominaData.periodo;
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

              {/* Cálculos Actualizados */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Cálculos Actualizados</h3>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                    <span className="ml-2 text-gray-600 dark:text-gray-400">Calculando...</span>
                  </div>
                ) : calculoNomina ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Salario Base:</span><span className="font-medium text-gray-900 dark:text-white">{formatCurrency(resumenCalculo.base)}</span></div>
                    {resumenCalculo.horasExtraMonto > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Horas Extra:</span><span className="font-medium text-gray-900 dark:text-white">{formatCurrency(resumenCalculo.horasExtraMonto)}</span></div>
                    )}
                    {resumenCalculo.bonosMonto > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Bonos:</span><span className="font-medium text-gray-900 dark:text-white">{formatCurrency(resumenCalculo.bonosMonto)}</span></div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3" />
                    {resumenCalculo.isr > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">ISR:</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.isr)}</span></div>
                    )}
                    {resumenCalculo.imss > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">IMSS:</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.imss)}</span></div>
                    )}
                    {resumenCalculo.infonavit > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Infonavit:</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.infonavit)}</span></div>
                    )}
                    {resumenCalculo.descuentos > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Descuentos (Adelantos):</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.descuentos)}</span></div>
                    )}
                    {resumenCalculo.otras > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Deducciones Adicionales:</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.otras)}</span></div>
                    )}
                    {resumenCalculo.autoDeducciones > 0 && (
                      <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Deducciones Automáticas:</span><span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.autoDeducciones)}</span></div>
                    )}
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                      <div className="flex justify-between"><span className="text-gray-700 dark:text-gray-300 font-medium">Total Deducciones:</span><span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(resumenCalculo.deduccionesTotal)}</span></div>
                    </div>
                    <div className="border-t border-gray-300 dark:border-gray-600 pt-3">
                      <div className="flex justify-between"><span className="text-lg font-medium text-gray-900 dark:text-white">{formData.pagoParcial ? 'Total a Pagar (Parcial):' : 'Total a Pagar:'}</span><span className="text-lg font-bold text-green-600 dark:text-green-400">{formatCurrency(formData.pagoParcial ? (formData.montoAPagar || 0) : resumenCalculo.total)}</span></div>
                    </div>
                    {formData.pagoParcial && formData.montoAPagar > 0 && (
                      <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <div className="flex justify-between mb-1"><span>Total original:</span><span className="font-medium">{formatCurrency(resumenCalculo.total)}</span></div>
                          <div className="flex justify-between mb-1"><span>Monto a pagar:</span><span className="font-medium text-green-600">{formatCurrency(formData.montoAPagar)}</span></div>
                          <div className="flex justify-between"><span>Quedará a deber:</span><span className="font-medium text-red-600">{formatCurrency(Math.round((resumenCalculo.total - formData.montoAPagar) * 100) / 100)}</span></div>
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
            </div>
          </div>
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
