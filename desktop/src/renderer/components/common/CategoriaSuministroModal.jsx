import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTag, FaBuilding, FaLaptop, FaInfoCircle, FaCheck } from 'react-icons/fa';
import { SparklesIcon, TagIcon } from '@heroicons/react/24/outline';

const CategoriaSuministroModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  title = "Crear Categoría",
  existingCategories = [] // Lista de categorías existentes para validar duplicados
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'Proyecto',
    color: '#3B82F6'
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  // Función para validar duplicados
  const checkForDuplicates = (nombre, tipo, currentId = null) => {
    if (!nombre.trim() || !tipo) {
      setDuplicateWarning(null);
      return false;
    }

    const nombreNormalized = nombre.trim().toLowerCase();
    
    // Buscar categorías existentes con el mismo nombre y tipo
    const duplicate = existingCategories.find(cat => {
      const isSameName = cat.nombre?.toLowerCase() === nombreNormalized;
      const isSameType = cat.tipo === tipo;
      const isNotCurrent = currentId ? cat.id !== currentId : true;
      
      return isSameName && isSameType && isNotCurrent;
    });

    if (duplicate) {
      setDuplicateWarning({
        type: 'error',
        message: `Ya existe una categoría "${nombre}" de tipo "${tipo}". No se pueden tener categorías duplicadas con el mismo nombre y tipo.`,
        suggestion: `Considera usar un nombre diferente o selecciona el tipo "${tipo === 'Proyecto' ? 'Administrativo' : 'Proyecto'}"`
      });
      return true;
    }

    // Buscar categorías con el mismo nombre pero diferente tipo (advertencia informativa)
    const sameNameDifferentType = existingCategories.find(cat => {
      const isSameName = cat.nombre?.toLowerCase() === nombreNormalized;
      const isDifferentType = cat.tipo !== tipo;
      const isNotCurrent = currentId ? cat.id !== currentId : true;
      
      return isSameName && isDifferentType && isNotCurrent;
    });

    if (sameNameDifferentType) {
      setDuplicateWarning({
        type: 'info',
        message: `Ya existe una categoría "${nombre}" de tipo "${sameNameDifferentType.tipo}".`,
        suggestion: `Esto está permitido ya que son de tipos diferentes.`
      });
      return false; // No es un error, solo información
    }

    setDuplicateWarning(null);
    return false;
  };

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
      setDuplicateWarning(null);
    }
  }, [isOpen, initialData]);

  // Manejar cambios en los campos
  const handleChange = (field, value) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Limpiar error del campo modificado
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Validar duplicados en tiempo real cuando cambia nombre o tipo
    if (field === 'nombre' || field === 'tipo') {
      checkForDuplicates(
        field === 'nombre' ? value : newFormData.nombre,
        field === 'tipo' ? value : newFormData.tipo,
        initialData?.id
      );
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

    // Validar duplicados como error crítico
    const hasDuplicate = checkForDuplicates(formData.nombre, formData.tipo, initialData?.id);
    if (hasDuplicate) {
      newErrors.duplicate = 'Ya existe una categoría con este nombre y tipo';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl w-full max-w-lg mx-4 my-8 transform transition-all duration-300 ease-out max-h-[90vh] flex flex-col">
        {/* Header mejorado */}
        <div className="relative bg-gradient-to-r from-primary-600 to-primary-700 rounded-t-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TagIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  {title}
                </h3>
                <p className="text-primary-100 text-sm">
                  {initialData ? 'Modifica los datos de la categoría' : 'Crea una nueva categoría de suministros'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all duration-200"
              disabled={isLoading}
            >
              <FaTimes className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body mejorado - Scrolleable */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          {/* Error general */}
          {errors.general && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <FaInfoCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                <p className="text-sm text-red-600 dark:text-red-400">{errors.general}</p>
              </div>
            </div>
          )}

          {/* Advertencia de duplicados */}
          {duplicateWarning && (
            <div className={`rounded-lg p-4 border ${
              duplicateWarning.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
                : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex">
                <FaInfoCircle className={`h-5 w-5 mt-0.5 mr-3 flex-shrink-0 ${
                  duplicateWarning.type === 'error' 
                    ? 'text-red-400' 
                    : 'text-blue-400'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${
                    duplicateWarning.type === 'error' 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {duplicateWarning.message}
                  </p>
                  {duplicateWarning.suggestion && (
                    <p className={`text-xs mt-1 ${
                      duplicateWarning.type === 'error' 
                        ? 'text-red-500 dark:text-red-300' 
                        : 'text-blue-500 dark:text-blue-300'
                    }`}>
                      💡 {duplicateWarning.suggestion}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Nombre de la categoría <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ej: Material de construcción, Herramientas, Equipos..."
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-600/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.nombre 
                    ? 'border-red-500 dark:border-red-400' 
                    : duplicateWarning && duplicateWarning.type === 'error'
                    ? 'border-red-500 dark:border-red-400'
                    : formData.nombre && !duplicateWarning
                    ? 'border-green-500 dark:border-green-400'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                disabled={isLoading}
              />
              {formData.nombre && !errors.nombre && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {duplicateWarning && duplicateWarning.type === 'error' ? (
                    <FaTimes className="h-4 w-4 text-red-500" />
                  ) : (
                    <FaCheck className="h-4 w-4 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {errors.nombre && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <FaInfoCircle className="h-4 w-4 mr-1" />
                {errors.nombre}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              El nombre será visible en los filtros y listados de suministros
            </p>
          </div>

          {/* Tipo */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Tipo de categoría <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleChange('tipo', 'Proyecto')}
                className={`group relative p-3 border-2 rounded-xl transition-all duration-300 ${
                  formData.tipo === 'Proyecto'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-lg shadow-primary-500/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-md'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full transition-colors duration-200 ${
                    formData.tipo === 'Proyecto'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30'
                  }`}>
                    <FaBuilding className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-semibold ${
                      formData.tipo === 'Proyecto'
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Proyecto
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Gastos directos de obra
                    </p>
                  </div>
                </div>
                {formData.tipo === 'Proyecto' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <FaCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleChange('tipo', 'Administrativo')}
                className={`group relative p-3 border-2 rounded-xl transition-all duration-300 ${
                  formData.tipo === 'Administrativo'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 shadow-lg shadow-green-500/20'
                    : 'border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 hover:shadow-md'
                }`}
                disabled={isLoading}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className={`p-3 rounded-full transition-colors duration-200 ${
                    formData.tipo === 'Administrativo'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-green-100 dark:group-hover:bg-green-900/30'
                  }`}>
                    <FaLaptop className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <span className={`text-sm font-semibold ${
                      formData.tipo === 'Administrativo'
                        ? 'text-green-700 dark:text-green-300'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      Administrativo
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Gastos de oficina
                    </p>
                  </div>
                </div>
                {formData.tipo === 'Administrativo' && (
                  <div className="absolute top-2 right-2">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <FaCheck className="h-3 w-3 text-white" />
                    </div>
                  </div>
                )}
              </button>
            </div>
            {errors.tipo && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <FaInfoCircle className="h-4 w-4 mr-1" />
                {errors.tipo}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-gray-400">
              El tipo determina cómo se clasifican los gastos en los reportes
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Descripción <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleChange('descripcion', e.target.value)}
                placeholder="Describe brevemente qué tipo de suministros incluye esta categoría..."
                rows={2}
                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-600/30 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all duration-200 ${
                  errors.descripcion 
                    ? 'border-red-500 dark:border-red-400' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                disabled={isLoading}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {formData.descripcion.length}/255
              </div>
            </div>
            {errors.descripcion && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                <FaInfoCircle className="h-4 w-4 mr-1" />
                {errors.descripcion}
              </p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-900 dark:text-white">
              Color de identificación
            </label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange('color', e.target.value)}
                  className="h-10 w-14 border-2 border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  disabled={isLoading}
                />
                <div className="absolute inset-0 rounded-lg ring-2 ring-offset-2 ring-primary-500 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Código:
                  </span>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono text-gray-900 dark:text-white">
                    {formData.color.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Este color se mostrará en las etiquetas y filtros
                </p>
              </div>
            </div>
            
          </div>
        </div>

        {/* Footer mejorado - Siempre visible */}
        <div className="bg-gray-50 dark:bg-gray-900/50 px-6 py-4 rounded-b-xl flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <SparklesIcon className="h-4 w-4" />
              <span>Los cambios se aplicarán inmediatamente</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading || !formData.nombre.trim() || (duplicateWarning && duplicateWarning.type === 'error')}
                className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-all duration-200 shadow-lg shadow-primary-500/25"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="h-4 w-4" />
                    <span>Guardar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriaSuministroModal;