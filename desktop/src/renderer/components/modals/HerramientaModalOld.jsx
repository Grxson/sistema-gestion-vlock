import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTools } from "react-icons/fa";
import DateInput from "../ui/DateInput";

const HerramientaModal = ({ isOpen, onClose, mode, herramienta, onSave, proyectos = [] }) => {
  const [formData, setFormData] = useState({
    // Campos que corresponden a la base de datos
    id_categoria_herr: '',
    nombre: '',
    marca: '',
    serial: '',
    costo: '',
    vida_util_meses: '',
    stock_total: 0,
    stock_disponible: 0,
    stock_minimo: 0,
    ubicacion: '',
    image_url: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Ubicaciones disponibles
  const ubicaciones = [
    'Almacén Principal',
    'Almacén Secundario',
    'Taller de Mantenimiento',
    'Taller de Reparación',
    'Obra Central Park',
    'Obra Plaza Norte',
    'Oficinas Administrativas'
  ];

  // Función para formatear números
  const formatNumber = (value) => {
    if (!value) return '';
    return parseFloat(value).toLocaleString('es-MX');
  };

  // Función para obtener categorías
  const fetchCategorias = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/herramientas/categorias', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setCategorias(result.data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Función para obtener movimientos de la herramienta
  const fetchMovimientos = async (herramientaId) => {
    if (!herramientaId) return;
    
    setLoadingMovimientos(true);
    try {
      const response = await fetch(`http://localhost:4000/api/herramientas/${herramientaId}/movimientos`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const result = await response.json();
      if (result.success) {
        setMovimientos(result.data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategorias();
      
      if (herramienta && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
        setFormData({
          id_categoria_herr: herramienta.id_categoria_herr || '',
          nombre: herramienta.nombre || '',
          marca: herramienta.marca || '',
          serial: herramienta.serial || '',
          costo: herramienta.costo || '',
          vida_util_meses: herramienta.vida_util_meses || '',
          stock_total: herramienta.stock_total || 0,
          stock_disponible: herramienta.stock_disponible || 0,
          stock_minimo: herramienta.stock_minimo || 0,
          ubicacion: herramienta.ubicacion || '',
          image_url: herramienta.image_url || ''
        });
        
        // Cargar movimientos si está en modo vista o edición
        if (herramienta.id_herramienta) {
          fetchMovimientos(herramienta.id_herramienta);
        }
      } else {
        // Reset form for create mode
        setFormData({
          id_categoria_herr: '',
          nombre: '',
          marca: '',
          serial: '',
          costo: '',
          vida_util_meses: '',
          stock_total: 0,
          stock_disponible: 0,
          stock_minimo: 0,
          ubicacion: '',
          image_url: ''
        });
        setMovimientos([]);
      }
    }
    
    setErrors({});
    
    // Reset image states when modal opens/closes
    if (!isOpen) {
      setSelectedImage(null);
      setImagePreview(null);
      setUploadingImage(false);
      setMovimientos([]);
    }
  }, [herramienta, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.id_categoria_herr) {
      newErrors.id_categoria_herr = 'La categoría es requerida';
    }
    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = 'El costo debe ser un número válido';
    }
    if (formData.vida_util_meses && (isNaN(parseInt(formData.vida_util_meses)) || parseInt(formData.vida_util_meses) < 0)) {
      newErrors.vida_util_meses = 'La vida útil debe ser un número positivo';
    }
    if (formData.stock_total && (isNaN(parseInt(formData.stock_total)) || parseInt(formData.stock_total) < 0)) {
      newErrors.stock_total = 'El stock total debe ser un número positivo';
    }
    if (formData.stock_disponible && (isNaN(parseInt(formData.stock_disponible)) || parseInt(formData.stock_disponible) < 0)) {
      newErrors.stock_disponible = 'El stock disponible debe ser un número positivo';
    }
    if (formData.stock_minimo && (isNaN(parseInt(formData.stock_minimo)) || parseInt(formData.stock_minimo) < 0)) {
      newErrors.stock_minimo = 'El stock mínimo debe ser un número positivo';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }
    
    if (validateForm()) {
      const processedData = {
        ...formData,
        id_categoria_herr: parseInt(formData.id_categoria_herr),
        costo: formData.costo ? parseFloat(formData.costo) : null,
        vida_util_meses: formData.vida_util_meses ? parseInt(formData.vida_util_meses) : null,
        stock_total: parseInt(formData.stock_total) || 0,
        stock_disponible: parseInt(formData.stock_disponible) || 0,
        stock_minimo: parseInt(formData.stock_minimo) || 0
      };
      
      // Función para manejar la subida de imagen después de guardar
      const handleImageUploadAfterSave = async (savedHerramienta) => {
        if (selectedImage && savedHerramienta?.id_herramienta) {
          const imageUrl = await handleImageUpload(savedHerramienta.id_herramienta);
          if (imageUrl) {
            return { ...savedHerramienta, image_url: imageUrl };
          }
        }
        return savedHerramienta;
      };
      
      onSave(processedData, handleImageUploadAfterSave);
    }
  };

  // Función para manejar selección de imagen
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El tamaño máximo es 5MB');
        return;
      }

      setSelectedImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Función para subir imagen
  const handleImageUpload = async (herramientaId) => {
    if (!selectedImage) return null;

    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      setUploadingImage(true);
      const response = await fetch(`http://localhost:4000/api/herramientas/${herramientaId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        return result.data.image_url;
      } else {
        throw new Error(result.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen: ' + error.message);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para eliminar imagen
  const handleImageDelete = async (herramientaId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/herramientas/${herramientaId}/delete-image`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      
      if (result.success) {
        setFormData(prev => ({ ...prev, image_url: '' }));
        setImagePreview(null);
        setSelectedImage(null);
        alert('Imagen eliminada exitosamente');
      } else {
        throw new Error(result.message || 'Error al eliminar imagen');
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen: ' + error.message);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaTools className="text-red-600" />
            {mode === 'create' && 'Nueva Herramienta'}
            {mode === 'edit' && 'Editar Herramienta'}
            {mode === 'view' && 'Detalles de la Herramienta'}
            {mode === 'duplicate' && 'Duplicar Herramienta'}
          </h2>

          {/* Texto explicativo */}
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                  Guía de registro de herramientas
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                  <p className="mb-2">
                    <strong>Campos obligatorios (*):</strong> Nombre y Categoría.
                  </p>
                  <p className="mb-2">
                    <strong>Control de Stock:</strong> Gestiona stock total, disponible y mínimo para alertas automáticas.
                  </p>
                  <p>
                    <strong>Costos:</strong> Registra el costo y vida útil de las herramientas para control financiero.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Código */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    isReadOnly 
                      ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white cursor-default'
                      : 'bg-white dark:bg-dark-100 border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  } ${
                    errors.codigo 
                      ? 'border-red-500 focus:ring-red-500' 
                      : ''
                  }`}
                  placeholder="HER-001"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
                )}
              </div>

              {/* Nombre */}
              <div className="lg:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Nombre *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.nombre 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Nombre de la herramienta"
                />
                {errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                )}
              </div>
            </div>

            {/* Marca y Modelo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Marca
                </label>
                <input
                  type="text"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Marca"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Modelo
                </label>
                <input
                  type="text"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Modelo"
                />
              </div>
            </div>

            {/* Categoría y Proyecto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Categoría *
                </label>
                <select
                  value={formData.categoria}
                  onChange={(e) => handleInputChange('categoria', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.categoria 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar categoría</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Proyecto
                </label>
                <select
                  value={formData.id_proyecto}
                  onChange={(e) => handleInputChange('id_proyecto', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar proyecto</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                      {proyecto.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sección de Imagen */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <label className={`block text-sm font-medium mb-3 ${
                isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Imagen de la Herramienta
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Preview de imagen actual o seleccionada */}
                <div>
                  <div className="w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    {imagePreview || formData.image_url ? (
                      <img 
                        src={imagePreview || `http://localhost:4000${formData.image_url}`}
                        alt="Preview"
                        className="max-w-full max-h-full object-contain rounded-lg"
                      />
                    ) : (
                      <div className="text-center text-gray-500 dark:text-gray-400">
                        <FaTools className="mx-auto h-12 w-12 mb-2" />
                        <p>Sin imagen</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controles de imagen */}
                <div className="space-y-3">
                  {!isReadOnly && (
                    <>
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="block w-full text-sm text-gray-500 dark:text-gray-400
                                   file:mr-4 file:py-2 file:px-4
                                   file:rounded-md file:border-0
                                   file:text-sm file:font-medium
                                   file:bg-red-50 file:text-red-700
                                   hover:file:bg-red-100
                                   dark:file:bg-red-900 dark:file:text-red-300
                                   dark:hover:file:bg-red-800"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF, WebP hasta 5MB
                        </p>
                      </div>

                      {(formData.image_url || selectedImage) && (
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.image_url && herramienta?.id_herramienta) {
                              handleImageDelete(herramienta.id_herramienta);
                            } else {
                              setSelectedImage(null);
                              setImagePreview(null);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 dark:bg-red-900 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-800"
                        >
                          Eliminar Imagen
                        </button>
                      )}

                      {uploadingImage && (
                        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                          Subiendo imagen...
                        </div>
                      )}
                    </>
                  )}

                  {isReadOnly && !formData.image_url && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">No hay imagen disponible</p>
                  )}
                </div>
              </div>
            </div>

            {/* Stock y Estado */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Stock Actual
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_actual}
                  onChange={(e) => handleInputChange('stock_actual', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.stock_actual 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="1"
                />
                {errors.stock_actual && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock_actual}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Stock Mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock_minimo}
                  onChange={(e) => handleInputChange('stock_minimo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                    errors.stock_minimo 
                      ? 'border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="1"
                />
                {errors.stock_minimo && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock_minimo}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Estado
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => handleInputChange('estado', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {estados.map(estado => (
                    <option key={estado.value} value={estado.value}>{estado.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Ubicación
                </label>
                <select
                  value={formData.ubicacion}
                  onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <option value="">Seleccionar ubicación</option>
                  {ubicaciones.map(ubicacion => (
                    <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Número de Serie y Empleado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={formData.numero_serie}
                  onChange={(e) => handleInputChange('numero_serie', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Número de serie"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Empleado Asignado
                </label>
                <input
                  type="text"
                  value={formData.empleado_asignado}
                  onChange={(e) => handleInputChange('empleado_asignado', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                  placeholder="Nombre del empleado"
                />
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Fecha de Compra
                </label>
                <DateInput
                  value={formData.fecha_compra}
                  onChange={(value) => handleInputChange('fecha_compra', value)}
                  disabled={isReadOnly}
                  className="w-full"
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Último Mantenimiento
                </label>
                <DateInput
                  value={formData.fecha_ultimo_mantenimiento}
                  onChange={(value) => handleInputChange('fecha_ultimo_mantenimiento', value)}
                  disabled={isReadOnly}
                  className="w-full"
                  placeholder="Seleccionar fecha"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  Próximo Mantenimiento
                </label>
                <DateInput
                  value={formData.proximo_mantenimiento}
                  onChange={(value) => handleInputChange('proximo_mantenimiento', value)}
                  disabled={isReadOnly}
                  className="w-full"
                  placeholder="Seleccionar fecha"
                />
              </div>
            </div>

            {/* Valor de Compra */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                Valor de Compra (MXN)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.valor_compra}
                onChange={(e) => handleInputChange('valor_compra', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 ${
                  errors.valor_compra 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-red-500'
                } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
              {errors.valor_compra && (
                <p className="mt-1 text-sm text-red-600">{errors.valor_compra}</p>
              )}
            </div>

            {/* Observaciones */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${
                  isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                }`}>
                Observaciones
              </label>
              <textarea
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors duration-200 flex items-center gap-2"
              >
                <FaTimes className="w-4 h-4" />
                {isReadOnly ? 'Cerrar' : 'Cancelar'}
              </button>
              
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 flex items-center gap-2 font-medium shadow-md"
                >
                  <FaSave className="w-4 h-4" />
                  {mode === 'create' && 'Crear Herramienta'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Herramienta'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default HerramientaModal;