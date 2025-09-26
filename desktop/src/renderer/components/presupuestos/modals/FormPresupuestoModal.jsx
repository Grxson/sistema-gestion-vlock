import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import BaseModal from '../common/BaseModal';
import { PresupuestosService } from '../../services/presupuestos/presupuestosService';

/**
 * Modal para editar información básica del presupuesto
 */
export const FormPresupuestoModal = ({ 
  isOpen, 
  onClose, 
  presupuesto, 
  onSuccess,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    estado: 'borrador',
    cliente_id: '',
    nombre_cliente: '',
    proyecto_id: '',
    nombre_proyecto: '',
    fecha_validez: '',
    fecha_limite: '',
    moneda: 'MXN',
    margen_utilidad: 0.1,
    incluir_iva: true,
    tasa_iva: 0.16,
    aplicar_descuentos: false,
    descuento_global: 0,
    tipo_descuento: 'porcentaje', // 'porcentaje' o 'fijo'
    observaciones: '',
    catalogo_id: '',
    region: 'nacional',
    prioridad: 'media', // 'baja', 'media', 'alta', 'urgente'
    confidencial: false
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (presupuesto && isOpen) {
      setFormData({
        codigo: presupuesto.codigo || '',
        nombre: presupuesto.nombre || '',
        descripcion: presupuesto.descripcion || '',
        estado: presupuesto.estado || 'borrador',
        cliente_id: presupuesto.cliente_id || '',
        nombre_cliente: presupuesto.nombre_cliente || presupuesto.cliente?.nombre || '',
        proyecto_id: presupuesto.proyecto_id || '',
        nombre_proyecto: presupuesto.nombre_proyecto || presupuesto.proyecto?.nombre || '',
        fecha_validez: presupuesto.fecha_validez || '',
        fecha_limite: presupuesto.fecha_limite || '',
        moneda: presupuesto.moneda || 'MXN',
        margen_utilidad: presupuesto.margen_utilidad || 0.1,
        incluir_iva: presupuesto.incluir_iva !== false,
        tasa_iva: presupuesto.tasa_iva || 0.16,
        aplicar_descuentos: presupuesto.aplicar_descuentos || false,
        descuento_global: presupuesto.descuento_global || 0,
        tipo_descuento: presupuesto.tipo_descuento || 'porcentaje',
        observaciones: presupuesto.observaciones || '',
        catalogo_id: presupuesto.catalogo_id || '',
        region: presupuesto.region || 'nacional',
        prioridad: presupuesto.prioridad || 'media',
        confidencial: presupuesto.confidencial || false
      });
    } else if (!isEditing && isOpen) {
      // Valores por defecto para nuevo presupuesto
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        estado: 'borrador',
        cliente_id: '',
        nombre_cliente: '',
        proyecto_id: '',
        nombre_proyecto: '',
        fecha_validez: '',
        fecha_limite: '',
        moneda: 'MXN',
        margen_utilidad: 0.1,
        incluir_iva: true,
        tasa_iva: 0.16,
        aplicar_descuentos: false,
        descuento_global: 0,
        tipo_descuento: 'porcentaje',
        observaciones: '',
        catalogo_id: '',
        region: 'nacional',
        prioridad: 'media',
        confidencial: false
      });
    }
    setErrors({});
  }, [presupuesto, isOpen, isEditing]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Limpiar error del campo si existe
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validaciones básicas
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.nombre_cliente.trim()) {
      newErrors.nombre_cliente = 'El cliente es obligatorio';
    }

    // Validar fechas
    if (formData.fecha_validez && formData.fecha_limite) {
      if (new Date(formData.fecha_validez) > new Date(formData.fecha_limite)) {
        newErrors.fecha_limite = 'La fecha límite debe ser posterior a la fecha de validez';
      }
    }

    // Validar márgenes y tasas
    if (formData.margen_utilidad < 0 || formData.margen_utilidad > 1) {
      newErrors.margen_utilidad = 'El margen debe estar entre 0% y 100%';
    }
    if (formData.tasa_iva < 0 || formData.tasa_iva > 1) {
      newErrors.tasa_iva = 'La tasa de IVA debe estar entre 0% y 100%';
    }
    if (formData.descuento_global < 0) {
      newErrors.descuento_global = 'El descuento no puede ser negativo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEditing) {
        await PresupuestosService.update(presupuesto.id_presupuesto, formData);
      } else {
        await PresupuestosService.create(formData);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al guardar presupuesto:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const monedas = [
    { value: 'MXN', label: 'Peso Mexicano (MXN)' },
    { value: 'USD', label: 'Dólar Americano (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' }
  ];

  const prioridades = [
    { value: 'baja', label: 'Baja', color: 'text-gray-600' },
    { value: 'media', label: 'Media', color: 'text-blue-600' },
    { value: 'alta', label: 'Alta', color: 'text-orange-600' },
    { value: 'urgente', label: 'Urgente', color: 'text-red-600' }
  ];

  const regiones = [
    { value: 'nacional', label: 'Nacional' },
    { value: 'norte', label: 'Región Norte' },
    { value: 'centro', label: 'Región Centro' },
    { value: 'sur', label: 'Región Sur' },
    { value: 'bajio', label: 'Región Bajío' },
    { value: 'sureste', label: 'Región Sureste' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
      type={isEditing ? 'edit' : 'create'}
      size="2xl"
      onConfirm={handleSubmit}
      onCancel={onClose}
      loading={loading}
      confirmText={isEditing ? 'Actualizar' : 'Crear'}
    >
      <div className="space-y-6">
        <form className="space-y-4">
          {/* Información básica */}
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
              <DocumentTextIcon className="h-4 w-4 mr-1" />
              Información Básica
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Código *
                </label>
                <input
                  type="text"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                    errors.codigo ? 'border-red-300' : ''
                  }`}
                  placeholder="Ej: PRES-2024-001"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Prioridad
                </label>
                <select
                  name="prioridad"
                  value={formData.prioridad}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {prioridades.map(prioridad => (
                    <option key={prioridad.value} value={prioridad.value}>
                      {prioridad.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre del Presupuesto *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                  errors.nombre ? 'border-red-300' : ''
                }`}
                placeholder="Nombre descriptivo del presupuesto"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Descripción
              </label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Descripción detallada del presupuesto"
              />
            </div>
          </div>

          {/* Cliente y proyecto */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              Cliente y Proyecto
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Cliente *
                </label>
                <input
                  type="text"
                  name="nombre_cliente"
                  value={formData.nombre_cliente}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                    errors.nombre_cliente ? 'border-red-300' : ''
                  }`}
                  placeholder="Nombre del cliente"
                />
                {errors.nombre_cliente && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre_cliente}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  Proyecto
                </label>
                <input
                  type="text"
                  name="nombre_proyecto"
                  value={formData.nombre_proyecto}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                  placeholder="Nombre del proyecto"
                />
              </div>
            </div>
          </div>

          {/* Configuración financiera */}
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <h4 className="text-sm font-medium text-green-700 dark:text-green-300 mb-3 flex items-center">
              <CurrencyDollarIcon className="h-4 w-4 mr-1" />
              Configuración Financiera
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Moneda
                </label>
                <select
                  name="moneda"
                  value={formData.moneda}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {monedas.map(moneda => (
                    <option key={moneda.value} value={moneda.value}>
                      {moneda.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Margen de Utilidad (%)
                </label>
                <input
                  type="number"
                  name="margen_utilidad"
                  value={formData.margen_utilidad * 100}
                  onChange={(e) => handleInputChange({
                    target: {
                      name: 'margen_utilidad',
                      value: parseFloat(e.target.value) / 100
                    }
                  })}
                  min="0"
                  max="100"
                  step="0.1"
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                    errors.margen_utilidad ? 'border-red-300' : ''
                  }`}
                />
                {errors.margen_utilidad && (
                  <p className="mt-1 text-sm text-red-600">{errors.margen_utilidad}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Región
                </label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  {regiones.map(region => (
                    <option key={region.value} value={region.value}>
                      {region.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Configuración de IVA */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="incluir_iva"
                  checked={formData.incluir_iva}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Incluir IVA en el presupuesto
                </label>
              </div>

              {formData.incluir_iva && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Tasa de IVA (%)
                  </label>
                  <input
                    type="number"
                    name="tasa_iva"
                    value={formData.tasa_iva * 100}
                    onChange={(e) => handleInputChange({
                      target: {
                        name: 'tasa_iva',
                        value: parseFloat(e.target.value) / 100
                      }
                    })}
                    min="0"
                    max="100"
                    step="0.1"
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                      errors.tasa_iva ? 'border-red-300' : ''
                    }`}
                  />
                  {errors.tasa_iva && (
                    <p className="mt-1 text-sm text-red-600">{errors.tasa_iva}</p>
                  )}
                </div>
              )}
            </div>

            {/* Configuración de descuentos */}
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  name="aplicar_descuentos"
                  checked={formData.aplicar_descuentos}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">
                  Aplicar descuento global
                </label>
              </div>

              {formData.aplicar_descuentos && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Descuento
                    </label>
                    <select
                      name="tipo_descuento"
                      value={formData.tipo_descuento}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                    >
                      <option value="porcentaje">Porcentaje (%)</option>
                      <option value="fijo">Cantidad Fija ({formData.moneda})</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descuento {formData.tipo_descuento === 'porcentaje' ? '(%)' : `(${formData.moneda})`}
                    </label>
                    <input
                      type="number"
                      name="descuento_global"
                      value={formData.descuento_global}
                      onChange={handleInputChange}
                      min="0"
                      step={formData.tipo_descuento === 'porcentaje' ? '0.1' : '1'}
                      className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                        errors.descuento_global ? 'border-red-300' : ''
                      }`}
                    />
                    {errors.descuento_global && (
                      <p className="mt-1 text-sm text-red-600">{errors.descuento_global}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fechas y vigencia */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Fechas y Vigencia
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha de Validez
                </label>
                <input
                  type="date"
                  name="fecha_validez"
                  value={formData.fecha_validez}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Fecha Límite
                </label>
                <input
                  type="date"
                  name="fecha_limite"
                  value={formData.fecha_limite}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                    errors.fecha_limite ? 'border-red-300' : ''
                  }`}
                />
                {errors.fecha_limite && (
                  <p className="mt-1 text-sm text-red-600">{errors.fecha_limite}</p>
                )}
              </div>
            </div>
          </div>

          {/* Catálogo y configuraciones adicionales */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <h4 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-3 flex items-center">
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
              Configuraciones Adicionales
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Catálogo de Precios
                </label>
                <select
                  name="catalogo_id"
                  value={formData.catalogo_id}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                >
                  <option value="">Seleccionar catálogo</option>
                  <option value="cat_oficial_2024">Catálogo Oficial 2024</option>
                  <option value="cat_regional_norte">Catálogo Regional Norte</option>
                  <option value="cat_materiales_esp">Catálogo Materiales Especiales</option>
                </select>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="confidencial"
                    checked={formData.confidencial}
                    onChange={handleInputChange}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Presupuesto confidencial
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <textarea
              name="observaciones"
              value={formData.observaciones}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Notas adicionales, términos especiales, condiciones, etc."
            />
          </div>
        </form>
      </div>
    </BaseModal>
  );
};