import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon, CalendarIcon, MapPinIcon } from '@heroicons/react/24/outline';
import BaseModal from '../common/BaseModal';
import { PreciosUnitariosService } from '../../services/presupuestos/preciosUnitariosService';

/**
 * Modal para ver detalles de un precio unitario
 */
export const VerPrecioModal = ({ isOpen, onClose, precio }) => {
  if (!precio) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Precio: ${precio.concepto_obra?.codigo || 'N/A'}`}
      type="view"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información del concepto */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Concepto de Obra
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                Código
              </label>
              <p className="text-sm text-gray-900 dark:text-white font-mono">
                {precio.concepto_obra?.codigo || 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
                Unidad
              </label>
              <p className="text-sm text-gray-900 dark:text-white">
                {precio.concepto_obra?.unidad || 'N/A'}
              </p>
            </div>
          </div>
          <div className="mt-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">
              Nombre
            </label>
            <p className="text-sm text-gray-900 dark:text-white">
              {precio.concepto_obra?.nombre || 'N/A'}
            </p>
          </div>
        </div>

        {/* Información del precio */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Precio Unitario
            </label>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
              ${parseFloat(precio.precio_unitario || 0).toLocaleString()} {precio.moneda}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Precio
            </label>
            <span className={`inline-flex mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
              precio.tipo_precio === 'base' ? 'bg-blue-100 text-blue-800' :
              precio.tipo_precio === 'actual' ? 'bg-green-100 text-green-800' :
              precio.tipo_precio === 'contrato' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {precio.tipo_precio?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Ubicación y fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <MapPinIcon className="h-4 w-4 mr-1" />
              Región
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {precio.region || 'Nacional'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Fecha Base
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {precio.fecha_base ? new Date(precio.fecha_base).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Vigencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Desde
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {precio.vigente_desde ? new Date(precio.vigente_desde).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Hasta
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {precio.vigente_hasta ? new Date(precio.vigente_hasta).toLocaleDateString() : 'Sin límite'}
            </p>
          </div>
        </div>

        {/* Detalles adicionales */}
        {precio.factor_sobrecosto && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Factor Sobrecosto
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {(parseFloat(precio.factor_sobrecosto) * 100).toFixed(2)}%
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio con Sobrecosto
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${(parseFloat(precio.precio_unitario) * (1 + parseFloat(precio.factor_sobrecosto))).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {precio.observaciones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {precio.observaciones}
            </p>
          </div>
        )}

        {/* Metadatos */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Creado:</span> {new Date(precio.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span> {new Date(precio.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para crear/editar precios unitarios
 */
export const FormPrecioModal = ({ 
  isOpen, 
  onClose, 
  precio = null, 
  concepto = null,
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    id_concepto_obra: '',
    precio_unitario: '',
    moneda: 'MXN',
    tipo_precio: 'actual',
    region: '',
    fecha_base: '',
    vigente_desde: '',
    vigente_hasta: '',
    factor_sobrecosto: '',
    proveedor: '',
    observaciones: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [conceptos, setConceptos] = useState([]);
  const [loadingConceptos, setLoadingConceptos] = useState(false);

  const isEditing = !!precio;

  useEffect(() => {
    if (precio) {
      setFormData({
        id_concepto_obra: precio.id_concepto_obra || '',
        precio_unitario: precio.precio_unitario || '',
        moneda: precio.moneda || 'MXN',
        tipo_precio: precio.tipo_precio || 'actual',
        region: precio.region || '',
        fecha_base: precio.fecha_base ? precio.fecha_base.split('T')[0] : '',
        vigente_desde: precio.vigente_desde ? precio.vigente_desde.split('T')[0] : '',
        vigente_hasta: precio.vigente_hasta ? precio.vigente_hasta.split('T')[0] : '',
        factor_sobrecosto: precio.factor_sobrecosto || '',
        proveedor: precio.proveedor || '',
        observaciones: precio.observaciones || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        id_concepto_obra: concepto?.id_concepto || '',
        precio_unitario: '',
        moneda: 'MXN',
        tipo_precio: 'actual',
        region: '',
        fecha_base: today,
        vigente_desde: today,
        vigente_hasta: '',
        factor_sobrecosto: '',
        proveedor: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [precio, concepto, isOpen]);

  // Cargar conceptos si no se proporciona uno específico
  useEffect(() => {
    if (isOpen && !concepto && !isEditing) {
      loadConceptos();
    }
  }, [isOpen, concepto, isEditing]);

  const loadConceptos = async () => {
    setLoadingConceptos(true);
    try {
      // TODO: Implementar servicio de conceptos
      // const response = await ConceptoObraService.getAll({ estado: 'activo' });
      // setConceptos(response.data || []);
      setConceptos([]);
    } catch (error) {
      console.error('Error al cargar conceptos:', error);
    } finally {
      setLoadingConceptos(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (!formData.id_concepto_obra) {
      newErrors.id_concepto_obra = 'Debe seleccionar un concepto';
    }
    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      newErrors.precio_unitario = 'El precio debe ser mayor a 0';
    }
    if (!formData.fecha_base) {
      newErrors.fecha_base = 'La fecha base es obligatoria';
    }
    if (!formData.vigente_desde) {
      newErrors.vigente_desde = 'La fecha de vigencia es obligatoria';
    }

    // Validar fechas
    if (formData.vigente_desde && formData.vigente_hasta) {
      if (new Date(formData.vigente_desde) > new Date(formData.vigente_hasta)) {
        newErrors.vigente_hasta = 'La fecha final debe ser posterior a la fecha inicial';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario),
        factor_sobrecosto: formData.factor_sobrecosto ? parseFloat(formData.factor_sobrecosto) : null,
        creado_por: 1, // TODO: obtener del contexto de usuario
      };

      if (isEditing) {
        await PreciosUnitariosService.update(precio.id_precio, dataToSend);
      } else {
        await PreciosUnitariosService.create(dataToSend);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al guardar precio:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const tiposPrecios = [
    { value: 'base', label: 'Precio Base' },
    { value: 'actual', label: 'Precio Actual' },
    { value: 'contrato', label: 'Precio de Contrato' },
    { value: 'referencial', label: 'Precio Referencial' }
  ];

  const regiones = [
    { value: '', label: 'Nacional' },
    { value: 'norte', label: 'Región Norte' },
    { value: 'centro', label: 'Región Centro' },
    { value: 'sur', label: 'Región Sur' },
    { value: 'golfo', label: 'Región Golfo' },
    { value: 'pacifico', label: 'Región Pacífico' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Precio Unitario' : 'Nuevo Precio Unitario'}
      type={isEditing ? 'edit' : 'create'}
      size="xl"
      onConfirm={handleSubmit}
      onCancel={onClose}
      loading={loading}
      confirmText={isEditing ? 'Actualizar' : 'Crear'}
    >
      <form className="space-y-6">
        {/* Selección de concepto */}
        {!concepto && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Concepto de Obra *
            </label>
            <select
              name="id_concepto_obra"
              value={formData.id_concepto_obra}
              onChange={handleInputChange}
              disabled={loadingConceptos}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.id_concepto_obra ? 'border-red-300' : ''
              }`}
            >
              <option value="">Seleccione un concepto...</option>
              {conceptos.map(concepto => (
                <option key={concepto.id_concepto} value={concepto.id_concepto}>
                  {concepto.codigo} - {concepto.nombre}
                </option>
              ))}
            </select>
            {errors.id_concepto_obra && (
              <p className="mt-1 text-sm text-red-600">{errors.id_concepto_obra}</p>
            )}
          </div>
        )}

        {concepto && (
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-2">
              Concepto Seleccionado
            </h4>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <span className="font-mono">{concepto.codigo}</span> - {concepto.nombre}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Unidad: {concepto.unidad}
            </p>
          </div>
        )}

        {/* Información del precio */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Precio Unitario *
            </label>
            <input
              type="number"
              name="precio_unitario"
              value={formData.precio_unitario}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.precio_unitario ? 'border-red-300' : ''
              }`}
              placeholder="0.00"
            />
            {errors.precio_unitario && (
              <p className="mt-1 text-sm text-red-600">{errors.precio_unitario}</p>
            )}
          </div>

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
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="USD">USD - Dólar Americano</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Precio
            </label>
            <select
              name="tipo_precio"
              value={formData.tipo_precio}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {tiposPrecios.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Ubicación y fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Base *
            </label>
            <input
              type="date"
              name="fecha_base"
              value={formData.fecha_base}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.fecha_base ? 'border-red-300' : ''
              }`}
            />
            {errors.fecha_base && (
              <p className="mt-1 text-sm text-red-600">{errors.fecha_base}</p>
            )}
          </div>
        </div>

        {/* Vigencia */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Desde *
            </label>
            <input
              type="date"
              name="vigente_desde"
              value={formData.vigente_desde}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.vigente_desde ? 'border-red-300' : ''
              }`}
            />
            {errors.vigente_desde && (
              <p className="mt-1 text-sm text-red-600">{errors.vigente_desde}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Hasta
            </label>
            <input
              type="date"
              name="vigente_hasta"
              value={formData.vigente_hasta}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.vigente_hasta ? 'border-red-300' : ''
              }`}
            />
            {errors.vigente_hasta && (
              <p className="mt-1 text-sm text-red-600">{errors.vigente_hasta}</p>
            )}
          </div>
        </div>

        {/* Factor de sobrecosto y proveedor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Factor Sobrecosto
            </label>
            <input
              type="number"
              name="factor_sobrecosto"
              value={formData.factor_sobrecosto}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              max="1"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="0.00 (ej: 0.15 para 15%)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Proveedor
            </label>
            <input
              type="text"
              name="proveedor"
              value={formData.proveedor}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Nombre del proveedor"
            />
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
            placeholder="Notas adicionales sobre el precio"
          />
        </div>
      </form>
    </BaseModal>
  );
};

/**
 * Modal de confirmación para eliminar precio
 */
export const EliminarPrecioModal = ({ 
  isOpen, 
  onClose, 
  precio, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await PreciosUnitariosService.delete(precio.id_precio);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al eliminar precio:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  if (!precio) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Precio Unitario"
      type="delete"
      onConfirm={handleEliminar}
      onCancel={onClose}
      loading={loading}
      confirmText="Eliminar"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar este precio unitario? Esta acción no se puede deshacer.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Precio a eliminar:
              </h4>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p><span className="font-semibold">Concepto:</span> {precio.concepto_obra?.codigo}</p>
                <p><span className="font-semibold">Precio:</span> ${parseFloat(precio.precio_unitario).toLocaleString()} {precio.moneda}</p>
                <p><span className="font-semibold">Fecha:</span> {precio.fecha_base ? new Date(precio.fecha_base).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Advertencia:</p>
              <p className="mt-1">
                Si este precio está siendo utilizado en presupuestos activos, 
                su eliminación podría afectar los cálculos existentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};