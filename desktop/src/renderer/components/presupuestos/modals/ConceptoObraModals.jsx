import React, { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import BaseModal from '../common/BaseModal';
import { ConceptoObraService } from '../../services/presupuestos/conceptoObraService';

/**
 * Modal para ver detalles de un concepto de obra
 */
export const VerConceptoModal = ({ isOpen, onClose, concepto }) => {
  if (!concepto) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Concepto: ${concepto.codigo}`}
      type="view"
      size="lg"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
              {concepto.codigo}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unidad
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {concepto.unidad}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {concepto.nombre}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {concepto.descripcion || 'Sin descripción'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {concepto.categoria}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              concepto.tipo_concepto === 'material' ? 'bg-blue-100 text-blue-800' :
              concepto.tipo_concepto === 'mano_obra' ? 'bg-green-100 text-green-800' :
              concepto.tipo_concepto === 'equipo' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {concepto.tipo_concepto?.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              concepto.estado === 'activo' ? 'bg-green-100 text-green-800' :
              concepto.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {concepto.estado?.toUpperCase()}
            </span>
          </div>
        </div>

        {concepto.precio_referencial && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Precio Referencial
              </label>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
                ${parseFloat(concepto.precio_referencial).toLocaleString()} {concepto.moneda}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Rendimiento
              </label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">
                {concepto.rendimiento_referencial || 'N/A'}
              </p>
            </div>
          </div>
        )}

        {concepto.observaciones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {concepto.observaciones}
            </p>
          </div>
        )}

        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Creado:</span> {new Date(concepto.createdAt).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span> {new Date(concepto.updatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para crear/editar conceptos de obra
 */
export const FormConceptoModal = ({ 
  isOpen, 
  onClose, 
  concepto = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    unidad: '',
    categoria: '',
    subcategoria: '',
    tipo_concepto: 'material',
    precio_referencial: '',
    moneda: 'MXN',
    estado: 'activo',
    rendimiento_referencial: '',
    observaciones: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!concepto;

  useEffect(() => {
    if (concepto) {
      setFormData({
        codigo: concepto.codigo || '',
        nombre: concepto.nombre || '',
        descripcion: concepto.descripcion || '',
        unidad: concepto.unidad || '',
        categoria: concepto.categoria || '',
        subcategoria: concepto.subcategoria || '',
        tipo_concepto: concepto.tipo_concepto || 'material',
        precio_referencial: concepto.precio_referencial || '',
        moneda: concepto.moneda || 'MXN',
        estado: concepto.estado || 'activo',
        rendimiento_referencial: concepto.rendimiento_referencial || '',
        observaciones: concepto.observaciones || ''
      });
    } else {
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        unidad: '',
        categoria: '',
        subcategoria: '',
        tipo_concepto: 'material',
        precio_referencial: '',
        moneda: 'MXN',
        estado: 'activo',
        rendimiento_referencial: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [concepto, isOpen]);

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

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es obligatorio';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio';
    }
    if (!formData.unidad.trim()) {
      newErrors.unidad = 'La unidad es obligatoria';
    }
    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es obligatoria';
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
        vigente_desde: new Date().toISOString().split('T')[0],
        creado_por: 1, // TODO: obtener del contexto de usuario
        precio_referencial: formData.precio_referencial ? parseFloat(formData.precio_referencial) : null,
        rendimiento_referencial: formData.rendimiento_referencial ? parseFloat(formData.rendimiento_referencial) : null
      };

      if (isEditing) {
        await ConceptoObraService.update(concepto.id_concepto, dataToSend);
      } else {
        await ConceptoObraService.create(dataToSend);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al guardar concepto:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const tiposConcepto = [
    { value: 'material', label: 'Material' },
    { value: 'mano_obra', label: 'Mano de Obra' },
    { value: 'equipo', label: 'Equipo' },
    { value: 'subcontrato', label: 'Subcontrato' },
    { value: 'mixto', label: 'Mixto' }
  ];

  const estados = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' },
    { value: 'obsoleto', label: 'Obsoleto' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Concepto' : 'Nuevo Concepto'}
      type={isEditing ? 'edit' : 'create'}
      size="xl"
      onConfirm={handleSubmit}
      onCancel={onClose}
      loading={loading}
      confirmText={isEditing ? 'Actualizar' : 'Crear'}
    >
      <form className="space-y-6">
        {/* Información básica */}
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
              placeholder="Ej: MAT001"
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Unidad *
            </label>
            <input
              type="text"
              name="unidad"
              value={formData.unidad}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.unidad ? 'border-red-300' : ''
              }`}
              placeholder="Ej: m², kg, pza"
            />
            {errors.unidad && (
              <p className="mt-1 text-sm text-red-600">{errors.unidad}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre *
          </label>
          <input
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
              errors.nombre ? 'border-red-300' : ''
            }`}
            placeholder="Nombre del concepto"
          />
          {errors.nombre && (
            <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Descripción detallada del concepto"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoría *
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.categoria ? 'border-red-300' : ''
              }`}
              placeholder="Ej: Materiales, Construcción"
            />
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Subcategoría
            </label>
            <input
              type="text"
              name="subcategoria"
              value={formData.subcategoria}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Subcategoría específica"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo *
            </label>
            <select
              name="tipo_concepto"
              value={formData.tipo_concepto}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {tiposConcepto.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Precio Referencial
            </label>
            <input
              type="number"
              name="precio_referencial"
              value={formData.precio_referencial}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="0.00"
            />
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
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {estados.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Rendimiento Referencial
          </label>
          <input
            type="number"
            name="rendimiento_referencial"
            value={formData.rendimiento_referencial}
            onChange={handleInputChange}
            step="0.0001"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Rendimiento por unidad"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones
          </label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleInputChange}
            rows={2}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Notas adicionales o especificaciones técnicas"
          />
        </div>
      </form>
    </BaseModal>
  );
};

/**
 * Modal de confirmación para eliminar concepto
 */
export const EliminarConceptoModal = ({ 
  isOpen, 
  onClose, 
  concepto, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await ConceptoObraService.delete(concepto.id_concepto);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al eliminar concepto:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  if (!concepto) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Concepto"
      type="delete"
      onConfirm={handleEliminar}
      onCancel={onClose}
      loading={loading}
      confirmText="Eliminar"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar este concepto? Esta acción no se puede deshacer.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Concepto a eliminar:
              </h4>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p><span className="font-semibold">Código:</span> {concepto.codigo}</p>
                <p><span className="font-semibold">Nombre:</span> {concepto.nombre}</p>
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
                Si este concepto está siendo utilizado en presupuestos existentes, 
                su eliminación podría afectar los cálculos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};