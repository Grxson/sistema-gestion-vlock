import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaUndo, 
  FaTrash, 
  FaUser, 
  FaCalendarAlt,
  FaProjectDiagram,
  FaInfoCircle,
  FaCheckCircle,
  FaTimes,
  FaExchangeAlt
} from 'react-icons/fa';

const MovimientoModal = ({ isOpen, onClose, herramienta, proyectos = [], onSave }) => {
  const { user } = useAuth();

  // Opciones específicas de razones por tipo de movimiento
  const razonesMovimiento = {
    'Entrada': [
      { value: 'compra', label: 'Compra nueva' },
      { value: 'devolucion', label: 'Devolución de préstamo' },
      { value: 'reparacion', label: 'Vuelta de reparación' },
      { value: 'donacion', label: 'Donación' },
      { value: 'transferencia', label: 'Transferencia desde otro proyecto' },
      { value: 'otro', label: 'Otro motivo' }
    ],
    'Salida': [
      { value: 'prestamo', label: 'Préstamo para uso' },
      { value: 'asignacion', label: 'Asignación a proyecto' },
      { value: 'mantenimiento', label: 'Envío a mantenimiento' },
      { value: 'reparacion', label: 'Envío a reparación' },
      { value: 'transferencia', label: 'Transferencia a otro proyecto' },
      { value: 'otro', label: 'Otro motivo' }
    ],
    'Devolucion': [
      { value: 'finalizacion', label: 'Finalización de préstamo' },
      { value: 'cambio_proyecto', label: 'Cambio de proyecto' },
      { value: 'mantenimiento_programado', label: 'Mantenimiento programado' },
      { value: 'otro', label: 'Otro motivo' }
    ],
    'Baja': [
      { value: 'perdida', label: 'Pérdida de herramienta' },
      { value: 'robo', label: 'Robo' },
      { value: 'dano_irreparable', label: 'Daño irreparable' },
      { value: 'obsolescencia', label: 'Obsolescencia' },
      { value: 'fin_vida_util', label: 'Fin de vida útil' },
      { value: 'otro', label: 'Otro motivo' }
    ]
  };
  const [formData, setFormData] = useState({
    tipo_movimiento: 'Salida',
    cantidad: '',
    id_proyecto: '',
    notas: '',
    razon_movimiento: '',
    detalle_adicional: '',
    usuario_receptor: '',
    fecha_devolucion_esperada: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        tipo_movimiento: 'Salida',
        cantidad: '',
        id_proyecto: '',
        notas: '',
        razon_movimiento: '',
        detalle_adicional: '',
        usuario_receptor: '',
        fecha_devolucion_esperada: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value); // Validación en tiempo real
    setShowPreview(false); // Reset preview when form changes
  };

  // Función para obtener el icono del tipo de movimiento
  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'Entrada': return <FaArrowUp className="text-green-500" />;
      case 'Salida': return <FaArrowDown className="text-blue-500" />;
      case 'Devolucion': return <FaUndo className="text-orange-500" />;
      case 'Baja': return <FaTrash className="text-red-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  // Función para calcular el nuevo stock
  const getNuevoStock = () => {
    if (!herramienta || !formData.cantidad) return herramienta?.stock || 0;
    
    const cantidad = parseInt(formData.cantidad);
    let nuevoStock = herramienta.stock;
    
    switch (formData.tipo_movimiento) {
      case 'Entrada':
        nuevoStock += cantidad;
        break;
      case 'Salida':
      case 'Baja':
        nuevoStock -= cantidad;
        break;
      case 'Devolucion':
        nuevoStock += cantidad;
        break;
    }
    
    return Math.max(0, nuevoStock);
  };

  // Función para verificar si el formulario está listo para preview
  const isFormReadyForPreview = () => {
    return formData.tipo_movimiento && 
           formData.cantidad && 
           parseInt(formData.cantidad) > 0 &&
           (!needsProject() || formData.id_proyecto) &&
           formData.razon_movimiento &&
           Object.keys(errors).length === 0; // No mostrar preview si hay errores
  };

  // Función para verificar si necesita proyecto
  const needsProject = () => {
    return formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Devolucion';
  };

  // Función para verificar si necesita usuario receptor
  const needsUsuarioReceptor = () => {
    return formData.razon_movimiento === 'asignacion' || formData.razon_movimiento === 'prestamo';
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validación de cantidad
    if (!formData.cantidad || isNaN(parseInt(formData.cantidad)) || parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser un número positivo';
    } else {
      const cantidad = parseInt(formData.cantidad);
      const stockActual = herramienta?.stock || 0;
      
      // Validar stock para salidas y bajas
      if ((formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Baja') && cantidad > stockActual) {
        newErrors.cantidad = `No hay suficiente stock. Disponible: ${stockActual} unidades`;
      }
    }
    
    // Validación de proyecto para salidas
    if (formData.tipo_movimiento === 'Salida' && !formData.id_proyecto) {
      newErrors.id_proyecto = 'Debe seleccionar un proyecto destino para la salida';
    }
    
    // Validación de proyecto para devoluciones
    if (formData.tipo_movimiento === 'Devolucion' && !formData.id_proyecto) {
      newErrors.id_proyecto = 'Debe seleccionar el proyecto de origen para la devolución';
    }
    
    // Validación de usuario receptor para asignaciones/préstamos
    if (needsUsuarioReceptor() && !formData.usuario_receptor?.trim()) {
      newErrors.usuario_receptor = 'Debe especificar el encargado de la herramienta';
    }
    
    // Validación de razón del movimiento
    if (!formData.razon_movimiento) {
      newErrors.razon_movimiento = 'Debe seleccionar una razón para el movimiento';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para validar en tiempo real
  const validateField = (field, value) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'cantidad':
        if (!value || isNaN(parseInt(value)) || parseInt(value) <= 0) {
          newErrors.cantidad = 'La cantidad debe ser un número positivo';
        } else {
          const cantidad = parseInt(value);
          const stockActual = herramienta?.stock || 0;
          
          if ((formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Baja') && cantidad > stockActual) {
            newErrors.cantidad = `No hay suficiente stock. Disponible: ${stockActual} unidades`;
          } else {
            delete newErrors.cantidad;
          }
        }
        break;
        
      case 'id_proyecto':
        if (needsProject() && !value) {
          newErrors.id_proyecto = formData.tipo_movimiento === 'Salida' 
            ? 'Debe seleccionar un proyecto destino' 
            : 'Debe seleccionar el proyecto de origen';
        } else {
          delete newErrors.id_proyecto;
        }
        break;
        
      case 'usuario_receptor':
        if (needsUsuarioReceptor() && !value?.trim()) {
          newErrors.usuario_receptor = 'Debe especificar el encargado de la herramienta';
        } else {
          delete newErrors.usuario_receptor;
        }
        break;
        
      case 'razon_movimiento':
        if (!value) {
          newErrors.razon_movimiento = 'Debe seleccionar una razón para el movimiento';
        } else {
          delete newErrors.razon_movimiento;
        }
        break;
    }
    
    setErrors(newErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const movimientoData = {
        id_herramienta: herramienta.id_herramienta,
        tipo_movimiento: formData.tipo_movimiento,
        cantidad: parseInt(formData.cantidad),
        id_proyecto: formData.id_proyecto ? parseInt(formData.id_proyecto) : null,
        notas: formData.notas,
        fecha_movimiento: new Date().toISOString(),
        id_usuario: user?.id_usuario
      };

      const response = await fetch('http://localhost:4000/api/herramientas/movimientos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(movimientoData)
      });

      const result = await response.json();
      
      if (result.success) {
        onSave(result.data);
        onClose();
      } else {
        setErrors({ general: result.message || 'Error al registrar el movimiento' });
      }
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      setErrors({ general: 'Error de conexión al servidor' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-100 rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <FaExchangeAlt className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registrar Movimiento
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gestión de inventario de herramientas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Cerrar"
          >
            <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Información de la herramienta */}
        {herramienta && (
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <FaUser className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {herramienta.nombre}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {herramienta.marca} • Serial: {herramienta.serial}
                  </p>
                  {herramienta.proyecto?.nombre && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      <FaProjectDiagram className="w-3 h-3" />
                      {herramienta.proyecto.nombre}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {herramienta.stock}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  unidades disponibles
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <div className="p-6">
          <form onSubmit={handleSubmit}>
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                {errors.general}
              </div>
            )}

            {/* Sección 1: Tipo de Movimiento */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Tipo de Movimiento
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Entrada', label: 'Entrada', desc: 'Agregar stock', icon: 'FaArrowUp', color: 'green' },
                  { value: 'Salida', label: 'Salida', desc: 'Préstamo/Uso', icon: 'FaArrowDown', color: 'blue' },
                  { value: 'Devolucion', label: 'Devolución', desc: 'Regresar stock', icon: 'FaUndo', color: 'orange' },
                  { value: 'Baja', label: 'Baja', desc: 'Pérdida/Daño', icon: 'FaTrash', color: 'red' }
                ].map((tipo) => (
                  <button
                    key={tipo.value}
                    type="button"
                    onClick={() => {
                      handleInputChange('tipo_movimiento', tipo.value);
                      // Resetear campos específicos cuando cambie el tipo
                      setFormData(prev => ({
                        ...prev,
                        tipo_movimiento: tipo.value,
                        razon_movimiento: '',
                        usuario_receptor: '',
                        fecha_devolucion_esperada: ''
                      }));
                    }}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      formData.tipo_movimiento === tipo.value
                        ? `border-${tipo.color}-500 bg-${tipo.color}-50 dark:bg-${tipo.color}-900/20`
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {getTipoIcon(tipo.value)}
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{tipo.label}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{tipo.desc}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Sección 2: Cantidad y Razón */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cantidad
                </label>
                <input
                  type="number"
                  min="1"
                  max={formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Baja' ? herramienta?.stock : undefined}
                  value={formData.cantidad}
                  onChange={(e) => handleInputChange('cantidad', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                    errors.cantidad 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-dark-100'
                  } text-gray-900 dark:text-white`}
                  placeholder="Ej: 5"
                />
                {errors.cantidad ? (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="text-red-500">⚠️</span>
                      {errors.cantidad}
                    </p>
                  </div>
                ) : (
                  (formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Baja') && formData.cantidad && (
                    <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center gap-1">
                        <span className="text-blue-500">ℹ️</span>
                        Máximo disponible: {herramienta?.stock} unidades
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Razón del Movimiento */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Razón del Movimiento
                </label>
                <select
                  value={formData.razon_movimiento}
                  onChange={(e) => handleInputChange('razon_movimiento', e.target.value)}
                  className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                    errors.razon_movimiento 
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-dark-100'
                  } text-gray-900 dark:text-white`}
                >
                  <option value="">Seleccionar razón...</option>
                  {razonesMovimiento[formData.tipo_movimiento]?.map((razon) => (
                    <option key={razon.value} value={razon.value}>
                      {razon.label}
                    </option>
                  ))}
                </select>
                {errors.razon_movimiento && (
                  <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                      <span className="text-red-500">⚠️</span>
                      {errors.razon_movimiento}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Sección 3: Proyecto y Usuario Receptor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Proyecto (para salidas y devoluciones) */}
              {needsProject() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaProjectDiagram className="inline w-4 h-4 mr-1" />
                    {formData.tipo_movimiento === 'Salida' ? 'Proyecto Destino' : 'Proyecto de Origen'}
                  </label>
                  <select
                    value={formData.id_proyecto}
                    onChange={(e) => handleInputChange('id_proyecto', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.id_proyecto 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-dark-100'
                    } text-gray-900 dark:text-white`}
                  >
                    <option value="">Seleccionar proyecto...</option>
                    {proyectos.map((proyecto) => (
                      <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                        {proyecto.nombre}
                      </option>
                    ))}
                  </select>
                  {errors.id_proyecto && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-red-500">⚠️</span>
                        {errors.id_proyecto}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Usuario receptor (para asignaciones y préstamos) */}
              {needsUsuarioReceptor() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <FaUser className="inline w-4 h-4 mr-1" />
                    Encargado de la Herramienta
                  </label>
                  <input
                    type="text"
                    value={formData.usuario_receptor}
                    onChange={(e) => handleInputChange('usuario_receptor', e.target.value)}
                    className={`w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                      errors.usuario_receptor 
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-dark-100'
                    } text-gray-900 dark:text-white`}
                    placeholder="Nombre completo del responsable"
                  />
                  {errors.usuario_receptor && (
                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                        <span className="text-red-500">⚠️</span>
                        {errors.usuario_receptor}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview del Impacto */}
            {isFormReadyForPreview() && (
              <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <FaInfoCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium text-orange-800 dark:text-orange-200">Vista Previa del Movimiento</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Stock Actual:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">{herramienta?.stock} unidades</div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Movimiento:</span>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {getTipoIcon(formData.tipo_movimiento)}
                      <span className="ml-1">{formData.cantidad} unidades</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Nuevo Stock:</span>
                    <div className={`font-semibold ${getNuevoStock() < 5 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      {getNuevoStock()} unidades
                    </div>
                  </div>
                </div>
                {getNuevoStock() < 5 && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ El stock quedará bajo (menos de 5 unidades)
                  </div>
                )}
              </div>
            )}

            {/* Sección 4: Detalles y Notas */}
            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Detalle adicional */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Detalles Adicionales (Opcional)
                </label>
                <textarea
                  value={formData.detalle_adicional}
                  onChange={(e) => handleInputChange('detalle_adicional', e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Información específica sobre el movimiento, condiciones, ubicación específica, etc."
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notas Generales (Opcional)
                </label>
                <textarea
                  value={formData.notas}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  rows="3"
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Observaciones adicionales, responsable del movimiento, motivo específico, etc."
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {Object.keys(errors).length > 0 ? (
                  <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                    <span className="text-red-500">⚠️</span>
                    {Object.keys(errors).length} error(es) por corregir
                  </span>
                ) : isFormReadyForPreview() ? (
                  <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <FaCheckCircle className="w-4 h-4" />
                    Formulario completo
                  </span>
                ) : (
                  <span>Complete los campos requeridos</span>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !isFormReadyForPreview() || Object.keys(errors).length > 0}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Registrando...
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="w-4 h-4" />
                      Registrar Movimiento
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MovimientoModal;