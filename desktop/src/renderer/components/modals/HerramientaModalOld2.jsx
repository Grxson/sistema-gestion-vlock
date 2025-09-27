import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTools, FaHistory, FaExchangeAlt } from "react-icons/fa";

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
      <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-6xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
        <div className="mt-3">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <FaTools className="text-red-600" />
            {mode === 'create' && 'Nueva Herramienta'}
            {mode === 'edit' && 'Editar Herramienta'}
            {mode === 'view' && 'Detalles de la Herramienta'}
            {mode === 'duplicate' && 'Duplicar Herramienta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Columna principal - Información */}
              <div className="xl:col-span-2 space-y-6">
                {/* Información básica */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Básica</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Nombre */}
                    <div>
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
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          errors.nombre ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="Nombre de la herramienta"
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                      )}
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Categoría *
                      </label>
                      <select
                        value={formData.id_categoria_herr}
                        onChange={(e) => handleInputChange('id_categoria_herr', e.target.value)}
                        disabled={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          errors.id_categoria_herr ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categorias.map(cat => (
                          <option key={cat.id_categoria_herr} value={cat.id_categoria_herr}>{cat.nombre}</option>
                        ))}
                      </select>
                      {errors.id_categoria_herr && (
                        <p className="mt-1 text-sm text-red-600">{errors.id_categoria_herr}</p>
                      )}
                    </div>

                    {/* Marca */}
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
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Marca de la herramienta"
                      />
                    </div>

                    {/* Serial */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Número de Serie
                      </label>
                      <input
                        type="text"
                        value={formData.serial}
                        onChange={(e) => handleInputChange('serial', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                          isReadOnly 
                            ? 'bg-gray-50 dark:bg-gray-700 cursor-default'
                            : 'bg-white dark:bg-dark-100'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500`}
                        placeholder="Número de serie"
                      />
                    </div>

                    {/* Ubicación */}
                    <div className="lg:col-span-2">
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Ubicación
                      </label>
                      <select
                        value={formData.ubicacion}
                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                        disabled={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <option value="">Seleccionar ubicación</option>
                        {ubicaciones.map(ubicacion => (
                          <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información Financiera */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Financiera</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Costo */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Costo <span className="text-sm text-gray-500">{isReadOnly && formData.costo && `($${formatNumber(formData.costo)})`}</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costo}
                        onChange={(e) => handleInputChange('costo', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          errors.costo ? 'border-red-500 focus:ring-red-500' : ''
                        }`}
                        placeholder="0.00"
                      />
                      {errors.costo && (
                        <p className="mt-1 text-sm text-red-600">{errors.costo}</p>
                      )}
                    </div>

                    {/* Vida Útil */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Vida Útil (meses) <span className="text-sm text-gray-500">{isReadOnly && formData.vida_util_meses && `(${formatNumber(formData.vida_util_meses)} meses)`}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.vida_util_meses}
                        onChange={(e) => handleInputChange('vida_util_meses', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                          isReadOnly 
                            ? 'bg-gray-50 dark:bg-gray-700 cursor-default'
                            : 'bg-white dark:bg-dark-100'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.vida_util_meses ? 'border-red-500' : ''
                        }`}
                        placeholder="24"
                      />
                      {errors.vida_util_meses && (
                        <p className="mt-1 text-sm text-red-600">{errors.vida_util_meses}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Control de Stock */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Control de Stock</h3>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Stock Total */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Stock Total <span className="text-sm text-gray-500">{isReadOnly && `(${formatNumber(formData.stock_total)} unidades)`}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_total}
                        onChange={(e) => handleInputChange('stock_total', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                          isReadOnly 
                            ? 'bg-gray-50 dark:bg-gray-700 cursor-default'
                            : 'bg-white dark:bg-dark-100'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.stock_total ? 'border-red-500' : ''
                        }`}
                        placeholder="0"
                      />
                      {errors.stock_total && (
                        <p className="mt-1 text-sm text-red-600">{errors.stock_total}</p>
                      )}
                    </div>

                    {/* Stock Disponible */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Stock Disponible <span className="text-sm text-gray-500">{isReadOnly && `(${formatNumber(formData.stock_disponible)} unidades)`}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_disponible}
                        onChange={(e) => handleInputChange('stock_disponible', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                          isReadOnly 
                            ? 'bg-gray-50 dark:bg-gray-700 cursor-default'
                            : 'bg-white dark:bg-dark-100'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.stock_disponible ? 'border-red-500' : ''
                        }`}
                        placeholder="0"
                      />
                      {errors.stock_disponible && (
                        <p className="mt-1 text-sm text-red-600">{errors.stock_disponible}</p>
                      )}
                    </div>

                    {/* Stock Mínimo */}
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${
                        isReadOnly ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        Stock Mínimo <span className="text-sm text-gray-500">{isReadOnly && `(${formatNumber(formData.stock_minimo)} unidades)`}</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock_minimo}
                        onChange={(e) => handleInputChange('stock_minimo', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md ${
                          isReadOnly 
                            ? 'bg-gray-50 dark:bg-gray-700 cursor-default'
                            : 'bg-white dark:bg-dark-100'
                        } text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
                          errors.stock_minimo ? 'border-red-500' : ''
                        }`}
                        placeholder="1"
                      />
                      {errors.stock_minimo && (
                        <p className="mt-1 text-sm text-red-600">{errors.stock_minimo}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Historial de Movimientos */}
                {mode === 'view' && herramienta && (
                  <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <FaHistory className="text-blue-600" />
                      Historial de Movimientos
                    </h3>
                    
                    {loadingMovimientos ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : movimientos.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FaExchangeAlt className="mx-auto h-12 w-12 mb-2 opacity-50" />
                        <p>No hay movimientos registrados para esta herramienta</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {movimientos.map((movimiento, index) => (
                          <div 
                            key={movimiento.id_movimiento || index}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    movimiento.tipo_movimiento === 'entrada' 
                                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                                      : movimiento.tipo_movimiento === 'salida'
                                      ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
                                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                                  }`}>
                                    {movimiento.tipo_movimiento?.toUpperCase()}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {formatNumber(movimiento.cantidad)} unidades
                                  </span>
                                </div>
                                
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                  <p><strong>Fecha:</strong> {formatDate(movimiento.fecha_movimiento)}</p>
                                  {movimiento.proyecto && (
                                    <p><strong>Proyecto:</strong> {movimiento.proyecto.nombre}</p>
                                  )}
                                  {movimiento.usuario && (
                                    <p><strong>Usuario:</strong> {movimiento.usuario.nombre_usuario}</p>
                                  )}
                                  {movimiento.notas && (
                                    <p><strong>Notas:</strong> {movimiento.notas}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Columna lateral - Imagen */}
              <div className="xl:col-span-1">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 sticky top-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Imagen</h3>
                  
                  {/* Preview de imagen */}
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-700 mb-4">
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

                  {/* Controles de imagen */}
                  {!isReadOnly && (
                    <div className="space-y-3">
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
                    </div>
                  )}

                  {isReadOnly && !formData.image_url && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">No hay imagen disponible</p>
                  )}
                </div>
              </div>
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