import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  TagIcon
} from '@heroicons/react/24/outline';

const HerramientaModal = ({ isOpen, onClose, mode, herramienta, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    marca: '',
    modelo: '',
    categoria: '',
    estado: 'disponible',
    ubicacion: '',
    numero_serie: '',
    fecha_compra: '',
    valor_compra: '',
    empleado_asignado: '',
    fecha_ultimo_mantenimiento: '',
    proximo_mantenimiento: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  // Opciones disponibles
  const categorias = [
    'Herramientas Manuales',
    'Herramientas Eléctricas',
    'Maquinaria Pesada',
    'Equipos de Medición',
    'Equipos de Seguridad',
    'Herramientas de Corte',
    'Herramientas de Soldadura',
    'Equipos Hidráulicos'
  ];

  const estados = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'prestado', label: 'Prestado' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'reparacion', label: 'Reparación' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio' }
  ];

  const ubicaciones = [
    'Almacén Principal',
    'Almacén Secundario',
    'Taller de Mantenimiento',
    'Taller de Reparación',
    'Obra Central Park',
    'Obra Plaza Norte',
    'Oficinas Administrativas'
  ];

  useEffect(() => {
    if (herramienta && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setFormData({
        codigo: mode === 'duplicate' ? '' : herramienta.codigo || '',
        nombre: herramienta.nombre || '',
        marca: herramienta.marca || '',
        modelo: herramienta.modelo || '',
        categoria: herramienta.categoria || '',
        estado: herramienta.estado || 'disponible',
        ubicacion: herramienta.ubicacion || '',
        numero_serie: herramienta.numero_serie || '',
        fecha_compra: herramienta.fecha_compra ? herramienta.fecha_compra.split('T')[0] : '',
        valor_compra: herramienta.valor_compra || '',
        empleado_asignado: herramienta.empleado_asignado || '',
        fecha_ultimo_mantenimiento: herramienta.fecha_ultimo_mantenimiento ? herramienta.fecha_ultimo_mantenimiento.split('T')[0] : '',
        proximo_mantenimiento: herramienta.proximo_mantenimiento ? herramienta.proximo_mantenimiento.split('T')[0] : '',
        observaciones: herramienta.observaciones || ''
      });
    } else {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codigo: '',
        nombre: '',
        marca: '',
        modelo: '',
        categoria: '',
        estado: 'disponible',
        ubicacion: '',
        numero_serie: '',
        fecha_compra: today,
        valor_compra: '',
        empleado_asignado: '',
        fecha_ultimo_mantenimiento: '',
        proximo_mantenimiento: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [herramienta, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.categoria) {
      newErrors.categoria = 'La categoría es requerida';
    }
    if (!formData.ubicacion) {
      newErrors.ubicacion = 'La ubicación es requerida';
    }
    if (formData.valor_compra && isNaN(parseFloat(formData.valor_compra))) {
      newErrors.valor_compra = 'El valor debe ser un número válido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }
    
    if (validateForm()) {
      const processedData = {
        ...formData,
        valor_compra: formData.valor_compra ? parseFloat(formData.valor_compra) : null
      };
      onSave(processedData);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-100 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' && 'Nueva Herramienta'}
                  {mode === 'edit' && 'Editar Herramienta'}
                  {mode === 'view' && 'Detalles de la Herramienta'}
                  {mode === 'duplicate' && 'Duplicar Herramienta'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isReadOnly ? 'Ver información de la herramienta' : 'Gestión de herramientas del inventario'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código de la Herramienta *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    errors.codigo 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } text-gray-900 dark:text-white`}
                  placeholder="HER-001"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre de la Herramienta *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    errors.nombre 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } text-gray-900 dark:text-white`}
                  placeholder="Taladro Percutor"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="Bosch, DeWalt, Makita..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="GSB 13 RE"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    errors.categoria 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } text-gray-900 dark:text-white`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación *
                </label>
                <select
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    errors.ubicacion 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } text-gray-900 dark:text-white`}
                >
                  <option value="">Seleccionar ubicación</option>
                  {ubicaciones.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
                {errors.ubicacion && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.ubicacion}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="BS001234567"
                />
              </div>
            </div>

            {/* Información de Compra */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3">
                Información de Compra
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de Compra
                  </label>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.fecha_compra}
                      onChange={(e) => handleInputChange('fecha_compra', e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                        isReadOnly 
                          ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                      } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Valor de Compra (MXN)
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={formData.valor_compra}
                      onChange={(e) => handleInputChange('valor_compra', e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                        errors.valor_compra 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        isReadOnly 
                          ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                      } text-gray-900 dark:text-white`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.valor_compra && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.valor_compra}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de Asignación y Mantenimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Empleado Asignado
                </label>
                <input
                  type="text"
                  value={formData.empleado_asignado}
                  onChange={(e) => handleInputChange('empleado_asignado', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="Juan Pérez"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Último Mantenimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_ultimo_mantenimiento}
                  onChange={(e) => handleInputChange('fecha_ultimo_mantenimiento', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Próximo Mantenimiento
              </label>
              <input
                type="date"
                value={formData.proximo_mantenimiento}
                onChange={(e) => handleInputChange('proximo_mantenimiento', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                placeholder="Notas adicionales sobre la herramienta..."
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors duration-200"
            >
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Crear Herramienta'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Herramienta'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HerramientaModal;