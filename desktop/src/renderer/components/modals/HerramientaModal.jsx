import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaTools, FaHistory, FaExchangeAlt, FaExclamationTriangle, FaBoxOpen, FaShare, FaUndo, FaTrash } from "react-icons/fa";
import ConfirmationModal from './ConfirmationModal';
import api from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { getMovimientoConfig as getMovConfig, calcularPorcentajeStock as calcPctStock, getEstadoStock as getStockState } from '../../utils/herramientasUtils';
import { formatNumberES, formatDateTimeES } from '../../utils/formatters';

const HerramientaModal = ({ isOpen, onClose, mode, herramienta, onSave, onRefresh, proyectos = [] }) => {
  const [formData, setFormData] = useState({
    // Campos que corresponden a la base de datos
    id_categoria_herr: '',
    id_proyecto: '',
    nombre: '',
    marca: '',
    serial: '',
    costo: '',
    vida_util_meses: '',
    stock: '', // Stock actual disponible
    stock_inicial: '', // Stock inicial registrado
    estado: 1, // 1 = Disponible por defecto
    ubicacion: '',
    observaciones: '',
    image_url: ''
  });

  const [errors, setErrors] = useState({});
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [movimientos, setMovimientos] = useState([]);
  const [loadingMovimientos, setLoadingMovimientos] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [showConfirmDeleteHistory, setShowConfirmDeleteHistory] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  // Hook para notificaciones toast
  const { showSuccess } = useToast();

  // Estados disponibles
  const estados = [
    { value: 1, label: 'Disponible' },
    { value: 2, label: 'Prestado' },
    { value: 3, label: 'Mantenimiento' },
    { value: 4, label: 'Reparación' },
    { value: 5, label: 'Fuera de Servicio' }
  ];

  // Utilidad de número reemplazada por formatNumberES desde utils/formatters

  // Cálculo de stock y estado movidos a utils

  // Función para obtener categorías
  const fetchCategorias = async () => {
    try {
      const result = await api.getCategoriasHerramientas();
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
      const result = await api.getMovimientosHerramienta(herramientaId);
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
          id_proyecto: herramienta.id_proyecto || '',
          nombre: herramienta.nombre || '',
          marca: herramienta.marca || '',
          serial: herramienta.serial || '',
          costo: herramienta.costo || '',
          vida_util_meses: herramienta.vida_util_meses || '',
          stock: herramienta.stock ? herramienta.stock.toString() : '',
          stock_inicial: herramienta.stock_inicial ? herramienta.stock_inicial.toString() : '',
          estado: herramienta.estado || 1,
          ubicacion: herramienta.ubicacion || '',
          observaciones: herramienta.observaciones || '',
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
          id_proyecto: '',
          nombre: '',
          marca: '',
          serial: '',
          costo: '',
          vida_util_meses: '',
          stock: '',
          stock_inicial: '',
          estado: 1,
          ubicacion: '',
          observaciones: '',
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
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Solo sincronizar automáticamente en modo creación y si ambos campos están vacíos
      if (mode === 'create' && field === 'stock_inicial' && value !== '' && (!newData.stock || newData.stock === '')) {
        const stockInicial = parseInt(value) || 0;
        newData.stock = stockInicial.toString();
      }
      
      // En modo edición, no sincronizar automáticamente para evitar perder datos
      
      // Validar que el stock actual no sea mayor que el stock inicial
      if (field === 'stock' && newData.stock_inicial && value !== '') {
        const stockInicial = parseInt(newData.stock_inicial);
        const stockActual = parseInt(value);
        if (!isNaN(stockInicial) && !isNaN(stockActual) && stockActual > stockInicial) {
          // Mostrar advertencia pero permitir el valor
          console.warn(`Stock actual (${stockActual}) es mayor que stock inicial (${stockInicial})`);
        }
      }
      
      // Si se cambia el stock inicial y el stock actual es mayor, ajustar automáticamente
      if (field === 'stock_inicial' && newData.stock && value !== '') {
        const stockInicial = parseInt(value) || 0;
        const stockActual = parseInt(newData.stock);
        if (!isNaN(stockInicial) && !isNaN(stockActual) && stockActual > stockInicial) {
          // Ajustar el stock actual al stock inicial
          newData.stock = stockInicial.toString();
        }
      }
      
      // Autocompletar ubicación cuando se selecciona un proyecto
      if (field === 'id_proyecto' && value !== '') {
        const proyectoSeleccionado = proyectos.find(p => p.id_proyecto.toString() === value);
        if (proyectoSeleccionado && proyectoSeleccionado.ubicacion) {
          // Solo autocompletar si el campo de ubicación está vacío
          if (!newData.ubicacion || newData.ubicacion === '') {
            newData.ubicacion = proyectoSeleccionado.ubicacion;
          }
        }
      }
      
      return newData;
    });
    
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
    if (!formData.stock_inicial || formData.stock_inicial.trim() === '') {
      newErrors.stock_inicial = 'El stock inicial es requerido';
    }
    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.costo = 'El costo debe ser un número válido';
    }
    if (formData.vida_util_meses && (isNaN(parseInt(formData.vida_util_meses)) || parseInt(formData.vida_util_meses) < 0)) {
      newErrors.vida_util_meses = 'La vida útil debe ser un número positivo';
    }
    if (formData.stock && (isNaN(parseInt(formData.stock)) || parseInt(formData.stock) < 0)) {
      newErrors.stock = 'El stock debe ser un número positivo';
    }
    if (formData.stock_inicial && (isNaN(parseInt(formData.stock_inicial)) || parseInt(formData.stock_inicial) < 0)) {
      newErrors.stock_inicial = 'El stock inicial debe ser un número positivo';
    }
    
    // Validar que el stock actual no sea mayor que el stock inicial
    if (formData.stock && formData.stock_inicial) {
      const stockActual = parseInt(formData.stock);
      const stockInicial = parseInt(formData.stock_inicial);
      
      if (!isNaN(stockActual) && !isNaN(stockInicial) && stockActual > stockInicial) {
        newErrors.stock = 'El stock actual no puede ser mayor que el stock inicial';
      }
    }
    if (formData.estado && (isNaN(parseInt(formData.estado)) || parseInt(formData.estado) < 1 || parseInt(formData.estado) > 5)) {
      newErrors.estado = 'El estado debe ser un valor entre 1 y 5';
    }
    if (formData.id_proyecto && formData.id_proyecto !== '' && isNaN(parseInt(formData.id_proyecto))) {
      newErrors.id_proyecto = 'El proyecto seleccionado no es válido';
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
        id_proyecto: formData.id_proyecto ? parseInt(formData.id_proyecto) : null,
        costo: formData.costo ? parseFloat(formData.costo) : null,
        vida_util_meses: formData.vida_util_meses ? parseInt(formData.vida_util_meses) : null,
        stock: parseInt(formData.stock) || 0,
        stock_inicial: parseInt(formData.stock_inicial) || 0,
        estado: parseInt(formData.estado) || 1
      };
      
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

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. El tamaño máximo es 10MB');
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

    try {
      setUploadingImage(true);
      // Convertir a WebP antes de subir (ahorra espacio sin perder calidad)
      const convertFileToWebP = (file, quality = 0.85) => {
        return new Promise((resolve) => {
          if (!file) return resolve(null);
          if (file.type === 'image/webp') return resolve(file);
          const img = new Image();
          const url = URL.createObjectURL(file);
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext('2d');
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((blob) => {
                if (blob) {
                  const webpFile = new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' });
                  resolve(webpFile);
                } else {
                  resolve(file);
                }
                URL.revokeObjectURL(url);
              }, 'image/webp', quality);
            } catch (err) {
              console.warn('Fallo conversión a WebP, usando archivo original:', err);
              URL.revokeObjectURL(url);
              resolve(file);
            }
          };
          img.onerror = () => {
            console.warn('No se pudo cargar imagen para convertir a WebP');
            URL.revokeObjectURL(url);
            resolve(file);
          };
          img.src = url;
        });
      };

      const webpFile = await convertFileToWebP(selectedImage);
      const result = await api.uploadHerramientaImage(herramientaId, webpFile || selectedImage);
      
      if (result.success) {
        return result.data.image_url;
      } else {
        throw new Error(result.message || 'Error al subir imagen');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Manejar errores específicos
      let errorMessage = 'Error al subir la imagen';
      if (error.message.includes('413') || error.message.includes('Payload Too Large')) {
        errorMessage = 'El archivo es demasiado grande. El tamaño máximo permitido es 10MB';
      } else if (error.message.includes('400')) {
        errorMessage = 'Formato de archivo no válido. Solo se permiten imágenes (JPEG, PNG, GIF, WebP)';
      } else if (error.message.includes('500')) {
        errorMessage = 'Error interno del servidor. Intenta nuevamente';
      } else {
        errorMessage = `Error al subir la imagen: ${error.message}`;
      }
      
      alert(errorMessage);
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  // Función para eliminar imagen
  const handleImageDelete = async (herramientaId) => {
    try {
      const result = await api.deleteHerramientaImage(herramientaId);
      
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

  // Fecha con hora ahora se usa formatDateTimeES util

  // Configuración de movimiento proviene de utils (getMovConfig)

  // Función para generar descripción contextual del movimiento con información detallada
  const getDescripcionMovimiento = (movimiento) => {
    const tipo = movimiento.tipo_movimiento;
    const proyecto = movimiento.proyectos?.nombre;
    const cantidad = movimiento.cantidad;
    const razon = movimiento.razon_movimiento;
    const receptor = movimiento.usuario_receptor;

    // Mapeo de razones a descripciones legibles
    const razonLabels = {
      // Entrada
      'compra': 'Compra nueva',
      'devolucion': 'Devolución de préstamo',
      'reparacion': 'Vuelta de reparación',
      'donacion': 'Donación',
      'transferencia': 'Transferencia desde otro proyecto',
      
      // Salida
      'prestamo': 'Préstamo a usuario',
      'asignacion': 'Asignación a proyecto',
      'mantenimiento': 'Envío a mantenimiento',
      'reparacion_salida': 'Envío a reparación',
      
      // Devolución
      'finalizacion': 'Finalización de préstamo',
      'cambio_proyecto': 'Cambio de proyecto',
      'mantenimiento_programado': 'Mantenimiento programado',
      
      // Baja
      'perdida': 'Pérdida de herramienta',
      'robo': 'Robo',
      'dano_irreparable': 'Daño irreparable',
      'obsolescencia': 'Obsolescencia',
      'fin_vida_util': 'Fin de vida útil'
    };

    let descripcion = '';
    const razonTexto = razonLabels[razon] || (razon ? razon.replace('_', ' ') : '');

    switch (tipo) {
      case 'Entrada':
        if (razon === 'compra') {
          descripcion = `Compra de ${cantidad} unidades nuevas para inventario`;
        } else if (razon === 'devolucion') {
          descripcion = `Devolución de ${cantidad} unidades ${receptor ? `por ${receptor}` : ''} al inventario`;
        } else if (razon === 'reparacion') {
          descripcion = `Regreso de ${cantidad} unidades reparadas al inventario`;
        } else if (razon === 'donacion') {
          descripcion = `Donación de ${cantidad} unidades agregadas al inventario`;
        } else if (razon === 'transferencia') {
          descripcion = `Transferencia de ${cantidad} unidades ${proyecto ? `desde proyecto "${proyecto}"` : 'desde otro origen'}`;
        } else {
          descripcion = `Ingreso de ${cantidad} unidades al inventario ${razonTexto ? `- ${razonTexto}` : ''}`;
        }
        break;
      
      case 'Salida':
        if (razon === 'prestamo') {
          descripcion = `Préstamo para uso de ${cantidad} unidades${proyecto ? ` en proyecto "${proyecto}"` : ''}`;
        } else if (razon === 'asignacion') {
          descripcion = `Asignación de ${cantidad} unidades${receptor ? ` a ${receptor}` : ''}${proyecto ? ` en proyecto "${proyecto}"` : ''}`;
        } else if (razon === 'mantenimiento') {
          descripcion = `Envío de ${cantidad} unidades a mantenimiento`;
        } else if (razon === 'reparacion') {
          descripcion = `Envío de ${cantidad} unidades a reparación`;
        } else if (razon === 'transferencia') {
          descripcion = `Transferencia de ${cantidad} unidades${proyecto ? ` al proyecto "${proyecto}"` : ' a otro destino'}`;
        } else {
          descripcion = `Salida de ${cantidad} unidades${proyecto ? ` para proyecto "${proyecto}"` : ''} ${razonTexto ? `- ${razonTexto}` : ''}`;
        }
        break;
      
      case 'Devolucion':
        if (razon === 'finalizacion') {
          descripcion = `Finalización de préstamo - Devolución de ${cantidad} unidades${receptor ? ` por ${receptor}` : ''}`;
        } else if (razon === 'cambio_proyecto') {
          descripcion = `Cambio de proyecto - Devolución de ${cantidad} unidades${proyecto ? ` del proyecto "${proyecto}"` : ''}`;
        } else if (razon === 'mantenimiento_programado') {
          descripcion = `Devolución de ${cantidad} unidades por mantenimiento programado`;
        } else {
          descripcion = `Devolución de ${cantidad} unidades${proyecto ? ` del proyecto "${proyecto}"` : ''} ${razonTexto ? `- ${razonTexto}` : ''}`;
        }
        break;
      
      case 'Baja':
        if (razon === 'perdida') {
          descripcion = `Pérdida de ${cantidad} unidades${proyecto ? ` en proyecto "${proyecto}"` : ''}`;
        } else if (razon === 'robo') {
          descripcion = `Robo de ${cantidad} unidades${proyecto ? ` del proyecto "${proyecto}"` : ''}`;
        } else if (razon === 'dano_irreparable') {
          descripcion = `Daño irreparable - Baja de ${cantidad} unidades`;
        } else if (razon === 'obsolescencia') {
          descripcion = `Obsolescencia - Baja de ${cantidad} unidades`;
        } else if (razon === 'fin_vida_util') {
          descripcion = `Fin de vida útil - Baja de ${cantidad} unidades`;
        } else {
          descripcion = `Baja de ${cantidad} unidades ${razonTexto ? `- ${razonTexto}` : ''}`;
        }
        break;
      
      default:
        descripcion = `Movimiento de ${cantidad} unidades ${razonTexto ? `- ${razonTexto}` : ''}`;
    }

    return descripcion;
  };

  // Función para eliminar el historial de movimientos
  const handleClickEliminarHistorial = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    if (!herramienta?.id_herramienta) {
      alert('Error: No se pudo identificar la herramienta');
      return;
    }

    if (movimientos.length === 0) {
      alert('No hay movimientos para eliminar');
      return;
    }

    setShowConfirmDeleteHistory(true);
  };

  const eliminarHistorialMovimientos = async () => {
    try {
      setLoadingMovimientos(true);
      
      const result = await api.deleteMovimientosHerramienta(herramienta.id_herramienta);
      
      if (result.success) {        
        
        setMovimientos([]);
        
        // Mostrar notificación de éxito
        showSuccess(
          'Historial eliminado exitosamente',
          result.message || 'Operación completada'
        );
        
        // Intentar refrescar los datos del componente padre (opcional)
        if (onRefresh) {
          try {
            await onRefresh();
          } catch (refreshError) {
            console.warn('⚠️ Error al refrescar datos del componente padre (no crítico):', refreshError);
          }
        }
        
      } else {
        throw new Error(result.message || 'Error desconocido al eliminar historial');
      }
    } catch (error) {
      alert(`Error al eliminar historial:\n\n${error.message || 'Error de conexión'}`);
    } finally {
      setLoadingMovimientos(false);
    }
  };

  // Función para calcular el stock después de un movimiento específico
  const calcularStockDespues = (movimientos, indiceMovimiento, stockActual) => {
    // Los movimientos están ordenados del más reciente al más antiguo
    // Calculamos hacia atrás desde el stock actual
    let stock = stockActual;
    
    for (let i = 0; i < indiceMovimiento; i++) {
      const mov = movimientos[i];
      const cantidad = parseInt(mov.cantidad) || 0;
      
      switch (mov.tipo_movimiento) {
        case 'Entrada':
        case 'Devolucion':
          stock -= cantidad; // Restamos porque vamos hacia atrás
          break;
        case 'Salida':
        case 'Baja':
          stock += cantidad; // Sumamos porque vamos hacia atrás
          break;
      }
    }
    
    return stock;
  };

  // Función mejorada para formatear fecha con hora
  // Reemplazado por formatDateTimeES util

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
      <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-6xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
        <div className="mt-3">
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
            {mode === 'create' && 'Nueva Herramienta'}
            {mode === 'edit' && 'Editar Herramienta'}
            {mode === 'view' && 'Detalles de la Herramienta'}
            {mode === 'duplicate' && 'Duplicar Herramienta'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Columna principal - Información */}
              <div className="xl:col-span-2 space-y-6">
                {/* Información básica */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Básica</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Nombre */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nombre de la Herramienta *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nombre}
                        onChange={(e) => handleInputChange('nombre', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Ej: Taladro Percutor"
                      />
                      {errors.nombre && (
                        <p className="mt-1 text-sm text-red-600">{errors.nombre}</p>
                      )}
                    </div>

                    {/* Categoría */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Categoría *
                      </label>
                      <select
                        required
                        value={formData.id_categoria_herr}
                        onChange={(e) => handleInputChange('id_categoria_herr', e.target.value)}
                        disabled={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Marca
                      </label>
                      <input
                        type="text"
                        value={formData.marca}
                        onChange={(e) => handleInputChange('marca', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Ej: DeWalt"
                      />
                    </div>

                    {/* Serial */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Número de Serie
                      </label>
                      <input
                        type="text"
                        value={formData.serial}
                        onChange={(e) => handleInputChange('serial', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="Ej: DW001-2024"
                      />
                    </div>


                  </div>
                </div>

                {/* Información Financiera */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Información Financiera</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Costo */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Costo de Adquisición
                        {isReadOnly && formData.costo && (
                          <span className="ml-2 text-green-600 font-semibold">${formatNumberES(formData.costo)}</span>
                        )}
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.costo}
                        onChange={(e) => handleInputChange('costo', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        placeholder="0.00"
                      />
                      {errors.costo && (
                        <p className="mt-1 text-sm text-red-600">{errors.costo}</p>
                      )}
                    </div>

                    {/* Vida Útil */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Vida Útil (meses)
                        {isReadOnly && formData.vida_util_meses && (
                          <span className="ml-2 text-gray-600 dark:text-gray-400 font-semibold">{formatNumberES(formData.vida_util_meses)} meses</span>
                        )}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.vida_util_meses}
                        onChange={(e) => handleInputChange('vida_util_meses', e.target.value)}
                        readOnly={isReadOnly}
                        className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                          isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
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
                <div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Control de Inventario</h4>
                  
                  <div className="space-y-6">
                    {/* Primera fila: Proyecto y Estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Proyecto
                        </label>
                        <select
                          value={formData.id_proyecto || ''}
                          onChange={(e) => handleInputChange('id_proyecto', e.target.value)}
                          disabled={isReadOnly}
                          className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Seleccionar proyecto...</option>
                          {proyectos?.map((proyecto) => (
                            <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                              {proyecto.nombre}
                            </option>
                          ))}
                        </select>
                        {errors.id_proyecto && (
                          <p className="mt-1 text-sm text-red-600">{errors.id_proyecto}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Estado
                        </label>
                        <select
                          value={formData.estado || 1}
                          onChange={(e) => handleInputChange('estado', parseInt(e.target.value))}
                          disabled={isReadOnly}
                          className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value={1}>Disponible</option>
                          <option value={2}>En uso</option>
                          <option value={3}>En mantenimiento</option>
                          <option value={4}>Averiado</option>
                          <option value={5}>Fuera de servicio</option>
                        </select>
                        {errors.estado && (
                          <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
                        )}
                      </div>
                    </div>

                    {/* Segunda fila: Stock Inicial y Stock Actual con indicadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Stock Inicial *
                          {isReadOnly && (
                            <span className="ml-2 text-gray-600 font-semibold">{formatNumberES(formData.stock_inicial)} unidades</span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={formData.stock_inicial || ''}
                          onChange={(e) => handleInputChange('stock_inicial', e.target.value)}
                          readOnly={isReadOnly}
                          className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          placeholder="0"
                        />
                        {errors.stock_inicial && (
                          <p className="mt-1 text-sm text-red-600">{errors.stock_inicial}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                          Stock Actual
                          {formData.stock && parseInt(formData.stock) <= 5 && (
                            <div className="relative group">
                              <FaExclamationTriangle className="text-orange-500 cursor-help" />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                                Stock bajo (≤ 5 unidades)
                              </div>
                            </div>
                          )}
                          {isReadOnly && (
                            <span className="ml-2 text-gray-600 font-semibold">{formatNumberES(formData.stock)} unidades</span>
                          )}
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock || ''}
                          onChange={(e) => handleInputChange('stock', e.target.value)}
                          readOnly={isReadOnly}
                          className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 ${
                            isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                          } ${formData.stock && parseInt(formData.stock) <= 5 ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20' : ''}`}
                          placeholder="0"
                        />
                        {errors.stock && (
                          <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Cantidad actual disponible en inventario
                        </p>
                      </div>
                    </div>

                    {/* Tercera fila: Controles de sincronización e indicadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div></div> {/* Espacio vacío para alineación */}
                      
                      <div className="space-y-3">
                        {/* Botón de sincronización manual */}
                        {formData.stock_inicial && formData.stock && mode !== 'view' && (
                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm('¿Sincronizar el stock actual con el stock inicial? Esto reemplazará el stock actual.')) {
                                  handleInputChange('stock', formData.stock_inicial);
                                }
                              }}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md border border-gray-600 hover:border-gray-500 transition-all duration-200 shadow-sm"
                              title="Sincronizar stock actual con stock inicial"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Sincronizar
                            </button>
                          </div>
                        )}
                        
                        {/* Indicador de estado del stock */}
                        {formData.stock_inicial && formData.stock && (
                          <div>
                            {(() => {
                              const porcentaje = calcPctStock(formData.stock_inicial, formData.stock);
                              const estado = getStockState(porcentaje);
                              const stockActual = parseInt(formData.stock);
                              const stockInicial = parseInt(formData.stock_inicial);
                              const stockNegativo = !isNaN(stockActual) && stockActual < 0;
                              
                              // Si el stock actual es negativo, mostrar error
                              if (stockNegativo) {
                                return (
                                  <div className="p-3 rounded-lg bg-red-900/20 border border-red-500/30 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                        <span className="text-sm font-medium text-red-400">
                                          Stock negativo - revisar movimientos
                                        </span>
                                      </div>
                                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-800/50 text-red-300 border border-red-600/50">
                                        Error
                                      </span>
                                    </div>
                                    <div className="mt-2 text-xs text-red-300/80">
                                      Stock actual: {stockActual} | Stock inicial: {stockInicial}
                                    </div>
                                  </div>
                                );
                              }
                              
                              if (!porcentaje || !estado) return null;
                              
                              return (
                                <div className={`p-3 rounded-lg backdrop-blur-sm border ${
                                  estado.nivel === 'crítico' ? 'bg-red-900/20 border-red-500/30' :
                                  estado.nivel === 'bajo' ? 'bg-orange-900/20 border-orange-500/30' :
                                  estado.nivel === 'medio' ? 'bg-yellow-900/20 border-yellow-500/30' :
                                  'bg-green-900/20 border-green-500/30'
                                }`}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        estado.nivel === 'crítico' ? 'bg-red-500' :
                                        estado.nivel === 'bajo' ? 'bg-orange-500' :
                                        estado.nivel === 'medio' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}></div>
                                      <span className={`text-sm font-medium ${
                                        estado.nivel === 'crítico' ? 'text-red-400' :
                                        estado.nivel === 'bajo' ? 'text-orange-400' :
                                        estado.nivel === 'medio' ? 'text-yellow-400' :
                                        'text-green-400'
                                      }`}>
                                        {porcentaje}% disponible
                                      </span>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                                      estado.nivel === 'crítico' ? 'bg-red-800/50 text-red-300 border-red-600/50' :
                                      estado.nivel === 'bajo' ? 'bg-orange-800/50 text-orange-300 border-orange-600/50' :
                                      estado.nivel === 'medio' ? 'bg-yellow-800/50 text-yellow-300 border-yellow-600/50' :
                                      'bg-green-800/50 text-green-300 border-green-600/50'
                                    }`}>
                                      {estado.nivel.charAt(0).toUpperCase() + estado.nivel.slice(1)}
                                    </span>
                                  </div>
                                  <div className="mt-2 w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        estado.nivel === 'crítico' ? 'bg-red-500' :
                                        estado.nivel === 'bajo' ? 'bg-orange-500' :
                                        estado.nivel === 'medio' ? 'bg-yellow-500' :
                                        'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(porcentaje, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cuarta fila: Ubicación */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        value={formData.ubicacion || ''}
                        onChange={(e) => handleInputChange('ubicacion', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500"
                        placeholder="Ej: Almacén A - Rack 1 (se autocompleta al seleccionar proyecto)"
                      />
                      {errors.ubicacion && (
                        <p className="mt-1 text-sm text-red-600">{errors.ubicacion}</p>
                      )}
                    </div>
                  </div>

                  {/* Observaciones - Campo completo */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      value={formData.observaciones || ''}
                      onChange={(e) => handleInputChange('observaciones', e.target.value)}
                      readOnly={isReadOnly}
                      rows="4"
                      className={`mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-gray-500 focus:border-gray-500 resize-vertical ${
                        isReadOnly ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      placeholder="Notas adicionales sobre la herramienta, mantenimientos realizados, condiciones especiales, etc."
                    />
                    {errors.observaciones && (
                      <p className="mt-1 text-sm text-red-600">{errors.observaciones}</p>
                    )}
                  </div>
                </div>

                {/* Historial de Movimientos */}
                {mode === 'view' && herramienta && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <FaHistory className="text-gray-600 dark:text-gray-400" />
                        Historial de Movimientos
                      </h4>
                      <div className="flex items-center gap-3">
                        {movimientos.length > 0 && (
                          <>
                            <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full">
                              {movimientos.length} movimiento{movimientos.length !== 1 ? 's' : ''}
                            </span>
                            <button
                              onClick={handleClickEliminarHistorial}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm font-medium rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                              title="Eliminar historial de movimientos"
                              disabled={loadingMovimientos}
                            >
                              <FaTrash className="h-3 w-3" />
                              {loadingMovimientos ? 'Eliminando...' : 'Limpiar Historial'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Resumen estadístico */}
                    {movimientos.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {['Entrada', 'Salida', 'Devolucion', 'Baja'].map(tipo => {
                          const count = movimientos.filter(m => m.tipo_movimiento === tipo).length;
                          const total = movimientos.filter(m => m.tipo_movimiento === tipo)
                            .reduce((sum, m) => sum + (parseInt(m.cantidad) || 0), 0);
                          const config = getMovConfig(tipo);
                          
                          if (count === 0) return null;
                          
                          return (
                            <div key={tipo} className={`p-3 rounded-lg ${config.bgClass} border border-gray-200/40 dark:border-gray-600/40 backdrop-blur-sm`}>
                              <div className="flex items-center gap-2 mb-1">
                                <config.icon className={`h-4 w-4 ${config.textClass}`} />
                                <span className={`text-sm font-medium ${config.textClass}`}>
                                  {tipo}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {count} movimiento{count !== 1 ? 's' : ''} • {total} unidades
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {loadingMovimientos ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                      </div>
                    ) : (
                      <>
                        {/* Información de actividad reciente */}
                        {movimientos.length > 0 && (
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4 p-3 bg-gradient-to-r from-gray-50/70 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/30 rounded-lg border border-gray-200/60 dark:border-gray-600/60">
                            <span className="font-medium">Último movimiento: {formatDateTimeES(movimientos[0].fecha_movimiento)}</span>
                            <span className="text-xs px-2 py-1 bg-white/70 dark:bg-gray-700/70 text-gray-700 dark:text-gray-300 rounded-full border border-gray-300/50 dark:border-gray-600/50 backdrop-blur-sm">
                              {(() => {
                                const ultimaFecha = new Date(movimientos[0].fecha_movimiento);
                                const ahora = new Date();
                                const diffMs = ahora - ultimaFecha;
                                const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                                
                                if (diffDias === 0) return 'Hoy';
                                if (diffDias === 1) return 'Ayer';
                                if (diffDias < 7) return `Hace ${diffDias} días`;
                                if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semana${Math.floor(diffDias / 7) !== 1 ? 's' : ''}`;
                                return `Hace ${Math.floor(diffDias / 30)} mes${Math.floor(diffDias / 30) !== 1 ? 'es' : ''}`;
                              })()}
                            </span>
                          </div>
                        )}

                        {/* Lista de movimientos */}
                        {movimientos.length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <FaExchangeAlt className="mx-auto h-12 w-12 mb-2 opacity-50" />
                            <p>No hay movimientos registrados para esta herramienta</p>
                            <p className="text-xs mt-2 opacity-75">Los movimientos aparecerán aquí cuando registres entradas, salidas o devoluciones</p>
                          </div>
                        ) : (
                      <div className="space-y-3 max-h-80 overflow-y-auto bg-gray-50/50 dark:bg-gray-800/30 rounded-lg p-4 border border-gray-200/50 dark:border-gray-700/50">
                        {movimientos.map((movimiento, index) => {
                          const tipoConfig = getMovConfig(movimiento.tipo_movimiento);
                          const descripcionContextual = getDescripcionMovimiento(movimiento);
                          
                          return (
                            <div 
                              key={movimiento.id_movimiento || index}
                              className="bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm p-4 rounded-lg border border-gray-200/60 dark:border-gray-600/60 shadow-sm hover:shadow-md transition-all duration-200 border-l-3"
                              style={{ borderLeftColor: tipoConfig.color }}
                            >
                              {/* Header con tipo y cantidad */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className={`p-2 rounded-full ${tipoConfig.bgClass}`}>
                                    <tipoConfig.icon className={`h-4 w-4 ${tipoConfig.textClass}`} />
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-900 dark:text-white">
                                      {tipoConfig.titulo}
                                    </h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                      {descripcionContextual}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${tipoConfig.badgeClass}`}>
                                    {movimiento.cantidad > 0 ? '+' : ''}{formatNumberES(movimiento.cantidad)}
                                  </span>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {formatDateTimeES(movimiento.fecha_movimiento)}
                                  </p>
                                </div>
                              </div>

                              {/* Información detallada */}
                              <div className="space-y-2.5">
                                {/* Primera fila - Info básica */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                  {/* Proyecto */}
                                  {movimiento.proyectos && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-md">
                                      <span className="text-slate-500 dark:text-slate-400">📁</span>
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Proyecto</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                          {movimiento.proyectos.nombre}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {/* Usuario */}
                                  {movimiento.usuarios && (
                                    <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/50 rounded-md">
                                      <span className="text-slate-500 dark:text-slate-400">👤</span>
                                      <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Responsable</p>
                                        <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                          {movimiento.usuarios.nombre_usuario}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Estado resultante */}
                                  <div className="flex items-center gap-2 p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded-md">
                                    <span className="text-slate-500 dark:text-slate-400">📊</span>
                                    <div>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Stock después</p>
                                      <p className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                                        {calcularStockDespues(movimientos, index, herramienta.stock)} unidades
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Segunda fila - Información específica del movimiento */}
                                {(movimiento.razon_movimiento || movimiento.usuario_receptor || movimiento.fecha_devolucion_esperada || movimiento.estado_movimiento) && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-gray-200/50 dark:border-gray-600/50">
                                    {/* Razón específica */}
                                    {movimiento.razon_movimiento && (
                                      <div className="flex items-center gap-2 p-2 bg-emerald-50/50 dark:bg-emerald-900/20 rounded-md">
                                        <span className="text-emerald-600 dark:text-emerald-400">🏷️</span>
                                        <div>
                                          <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 font-medium">Razón</p>
                                          <p className="font-medium text-emerald-700 dark:text-emerald-300 text-xs">
                                            {movimiento.razon_movimiento.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Usuario receptor (solo para asignaciones) */}
                                    {movimiento.usuario_receptor && movimiento.razon_movimiento === 'asignacion' && (
                                      <div className="flex items-center gap-2 p-2 bg-amber-50/50 dark:bg-amber-900/20 rounded-md">
                                        <span className="text-amber-600 dark:text-amber-400">👥</span>
                                        <div>
                                          <p className="text-xs text-amber-600/70 dark:text-amber-400/70 font-medium">Asignado a</p>
                                          <p className="font-medium text-amber-700 dark:text-amber-300 text-xs">
                                            {movimiento.usuario_receptor}
                                          </p>
                                        </div>
                                      </div>
                                    )}



                                    {/* Estado del movimiento */}
                                    {movimiento.estado_movimiento && movimiento.estado_movimiento !== 'activo' && (
                                      <div className="flex items-center gap-2">
                                        <span className={`${
                                          movimiento.estado_movimiento === 'completado' ? 'text-green-600 dark:text-green-400' :
                                          movimiento.estado_movimiento === 'cancelado' ? 'text-red-600 dark:text-red-400' :
                                          'text-gray-600 dark:text-gray-400'
                                        }`}>
                                          {movimiento.estado_movimiento === 'completado' ? '✅' : 
                                           movimiento.estado_movimiento === 'cancelado' ? '❌' : '⏳'}
                                        </span>
                                        <div>
                                          <p className="text-xs text-gray-500 dark:text-gray-400">Estado</p>
                                          <p className={`font-medium text-xs capitalize ${
                                            movimiento.estado_movimiento === 'completado' ? 'text-green-600 dark:text-green-400' :
                                            movimiento.estado_movimiento === 'cancelado' ? 'text-red-600 dark:text-red-400' :
                                            'text-gray-900 dark:text-white'
                                          }`}>
                                            {movimiento.estado_movimiento}
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Detalles adicionales */}
                              {movimiento.detalle_adicional && (
                                <div className="mt-3 p-3 bg-slate-50/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">📝 Detalles específicos:</p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {movimiento.detalle_adicional}
                                  </p>
                                </div>
                              )}

                              {/* Notas generales */}
                              {movimiento.notas && (
                                <div className="mt-3 p-3 bg-slate-50/60 dark:bg-slate-800/60 rounded-lg border border-slate-200/50 dark:border-slate-600/50">
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1 font-medium">💬 Notas generales:</p>
                                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                    "{movimiento.notas}"
                                  </p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Columna lateral - Imagen */}
              <div className="xl:col-span-1">
                <div className="sticky top-4">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Imagen de la Herramienta</h4>
                  
                  {/* Preview de imagen */}
                  <div className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-900/30 mb-4">
                    {imagePreview || formData.image_url ? (
                      <img 
                        src={imagePreview || `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}${formData.image_url}`}
                        alt="Preview"
                        className={`max-w-full max-h-full object-contain rounded-lg ${
                          isReadOnly && (imagePreview || formData.image_url) 
                            ? 'cursor-pointer hover:opacity-90 transition-opacity duration-200' 
                            : ''
                        }`}
                        onClick={() => {
                          if (isReadOnly && (imagePreview || formData.image_url)) {
                            setShowImageModal(true);
                          }
                        }}
                        title={isReadOnly ? "Clic para ampliar imagen" : ""}
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
                                   file:bg-gray-100 file:text-gray-700
                                   hover:file:bg-gray-200
                                   dark:file:bg-gray-700 dark:file:text-gray-300
                                   dark:hover:file:bg-gray-600"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          PNG, JPG, GIF, WebP hasta 10MB
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
                  
                  {isReadOnly && formData.image_url && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      🔍 Clic en la imagen para ampliar
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-600 dark:text-white dark:border-gray-500 dark:hover:bg-gray-700"
              >
                {isReadOnly ? 'Cerrar' : 'Cancelar'}
              </button>
              
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-primary-600 dark:hover:bg-primary-700"
                >
                  {mode === 'create' && 'Crear Herramienta'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Herramienta'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      
      {/* Modal de confirmación para eliminar historial */}
      <ConfirmationModal
        isOpen={showConfirmDeleteHistory}
        onClose={() => setShowConfirmDeleteHistory(false)}
        onConfirm={() => {
          setShowConfirmDeleteHistory(false);
          eliminarHistorialMovimientos();
        }}
        title="Eliminar Historial de Movimientos"
        message={`¿Eliminar historial de movimientos?\n\nSe eliminarán ${movimientos.length} registro${movimientos.length !== 1 ? 's' : ''} de movimiento.\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal de imagen expandida */}
      {showImageModal && (imagePreview || formData.image_url) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative flex flex-col items-center justify-center max-w-[90vw] max-h-[90vh]">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10 bg-black bg-opacity-50 rounded-full p-2"
              title="Cerrar imagen"
            >
              <FaTimes className="h-5 w-5" />
            </button>
            <img 
              src={imagePreview || `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}${formData.image_url}`}
              alt="Imagen expandida de la herramienta"
              className="max-w-full max-h-[calc(90vh-80px)] object-contain rounded-t-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="bg-black bg-opacity-50 text-white p-3 rounded-b-lg w-full text-center">
              <p className="text-sm font-medium">{formData.nombre || 'Herramienta'}</p>
              <p className="text-xs opacity-75">Clic fuera de la imagen para cerrar</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HerramientaModal;