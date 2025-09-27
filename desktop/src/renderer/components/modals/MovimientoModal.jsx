import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cantidad || isNaN(parseInt(formData.cantidad)) || parseInt(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser un número positivo';
    }
    
    if (formData.tipo_movimiento === 'Salida' && parseInt(formData.cantidad) > herramienta?.stock) {
      newErrors.cantidad = `La cantidad no puede ser mayor al stock disponible (${herramienta?.stock})`;
    }
    
    if (formData.tipo_movimiento === 'Salida' && !formData.id_proyecto) {
      newErrors.id_proyecto = 'Debe seleccionar un proyecto para la salida';
    }
    
    if (formData.tipo_movimiento === 'Devolucion' && herramienta?.id_proyecto && !formData.id_proyecto) {
      // Para devoluciones, usar el proyecto actual de la herramienta si no se especifica otro
      setFormData(prev => ({ ...prev, id_proyecto: herramienta.id_proyecto }));
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      <div className="bg-white dark:bg-dark-100 rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Registrar Movimiento
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {herramienta && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="font-medium text-gray-900 dark:text-white">{herramienta.nombre}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Stock actual: {herramienta.stock} unidades
            </p>
            {herramienta.proyectos?.nombre && (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Asignado a: {herramienta.proyectos.nombre}
              </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          {/* Tipo de Movimiento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Movimiento
            </label>
            <select
              value={formData.tipo_movimiento}
              onChange={(e) => {
                const nuevoTipo = e.target.value;
                handleInputChange('tipo_movimiento', nuevoTipo);
                // Resetear campos específicos cuando cambie el tipo
                setFormData(prev => ({
                  ...prev,
                  tipo_movimiento: nuevoTipo,
                  razon_movimiento: '',
                  usuario_receptor: '',
                  fecha_devolucion_esperada: ''
                }));
              }}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="Entrada">Entrada (Agregar stock)</option>
              <option value="Salida">Salida (Préstamo/Uso)</option>
              <option value="Devolucion">Devolución (Regresar de proyecto)</option>
              <option value="Baja">Baja (Pérdida/Daño)</option>
            </select>
          </div>

          {/* Cantidad */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cantidad
            </label>
            <input
              type="number"
              min="1"
              value={formData.cantidad}
              onChange={(e) => handleInputChange('cantidad', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Ingrese la cantidad"
            />
            {errors.cantidad && (
              <p className="mt-1 text-sm text-red-600">{errors.cantidad}</p>
            )}
          </div>

          {/* Proyecto (para salidas y devoluciones) */}
          {(formData.tipo_movimiento === 'Salida' || formData.tipo_movimiento === 'Devolucion') && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {formData.tipo_movimiento === 'Salida' ? 'Proyecto Destino' : 'Proyecto de Origen'}
              </label>
              <select
                value={formData.id_proyecto}
                onChange={(e) => handleInputChange('id_proyecto', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Seleccionar proyecto...</option>
                {proyectos.map((proyecto) => (
                  <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                    {proyecto.nombre}
                  </option>
                ))}
              </select>
              {errors.id_proyecto && (
                <p className="mt-1 text-sm text-red-600">{errors.id_proyecto}</p>
              )}
            </div>
          )}

          {/* Razón específica del movimiento */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Razón del Movimiento
            </label>
            <select
              value={formData.razon_movimiento}
              onChange={(e) => handleInputChange('razon_movimiento', e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
            >
              <option value="">Seleccionar razón...</option>
              {razonesMovimiento[formData.tipo_movimiento]?.map((razon) => (
                <option key={razon.value} value={razon.value}>
                  {razon.label}
                </option>
              ))}
            </select>
          </div>

          {/* Usuario receptor (solo para asignaciones) */}
          {formData.razon_movimiento === 'asignacion' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Usuario Receptor
              </label>
              <input
                type="text"
                value={formData.usuario_receptor}
                onChange={(e) => handleInputChange('usuario_receptor', e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                placeholder="Nombre del usuario asignado"
              />
            </div>
          )}

          {/* Detalle adicional */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Detalles Adicionales
            </label>
            <textarea
              value={formData.detalle_adicional}
              onChange={(e) => handleInputChange('detalle_adicional', e.target.value)}
              rows="2"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Información específica sobre el movimiento, condiciones, etc."
            />
          </div>

          {/* Notas */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Notas Generales (Opcional)
            </label>
            <textarea
              value={formData.notas}
              onChange={(e) => handleInputChange('notas', e.target.value)}
              rows="3"
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              placeholder="Detalles del movimiento, responsable, motivo, etc."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Registrando...' : 'Registrar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovimientoModal;