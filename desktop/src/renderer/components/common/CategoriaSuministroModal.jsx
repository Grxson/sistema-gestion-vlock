import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTag, FaBuilding, FaLaptop } from 'react-icons/fa';

const CategoriaSuministroModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  title = "Crear Categoría"
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'Proyecto',
    color: '#3B82F6'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          nombre: initialData.nombre || '',
          descripcion: initialData.descripcion || '',
          tipo: initialData.tipo || 'Proyecto',
          color: initialData.color || '#3B82F6'
        });
      } else {
        setFormData({
          nombre: '',
          descripcion: '',
          tipo: 'Proyecto',
          color: '#3B82F6'
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.trim().length > 50) {
      newErrors.nombre = 'El nombre no puede exceder 50 caracteres';
    }

    if (formData.descripcion && formData.descripcion.length > 255) {
      newErrors.descripcion = 'La descripción no puede exceder 255 caracteres';
    }

    if (!['Proyecto', 'Administrativo'].includes(formData.tipo)) {
      newErrors.tipo = 'Selecciona un tipo válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar guardado
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      setErrors({ general: 'Error al guardar la categoría' });
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar tecla Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FaTag className="text-red-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            disabled={isLoading}
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
            </div>
          )}

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la categoría *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ej: Material de construcción"
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                errors.nombre 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isLoading}
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de categoría *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleChange('tipo', 'Proyecto')}
                className={`p-3 border rounded-md transition-all duration-200 ${
                  formData.tipo === 'Proyecto'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-1">
                  <FaBuilding className="h-5 w-5" />
                  <span className="text-sm font-medium">Proyecto</span>
                  <span className="text-xs opacity-75">Gastos de obra</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleChange('tipo', 'Administrativo')}
                className={`p-3 border rounded-md transition-all duration-200 ${
                  formData.tipo === 'Administrativo'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-1">
                  <FaLaptop className="h-5 w-5" />
                  <span className="text-sm font-medium">Administrativo</span>
                  <span className="text-xs opacity-75">Gastos de oficina</span>
                </div>
              </button>
            </div>
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
              placeholder="Descripción breve de la categoría..."
              rows={2}
              className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${
                errors.descripcion 
                  ? 'border-red-500 dark:border-red-400' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}
              disabled={isLoading}
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.descripcion}</p>
            )}
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Color de identificación
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleChange('color', e.target.value)}
                className="h-10 w-16 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formData.color}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500"
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <FaSave className="h-4 w-4" />
            <span>{isLoading ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoriaSuministroModal;