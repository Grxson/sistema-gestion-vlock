import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  DocumentDuplicateIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentCheckIcon
} from '@heroicons/react/24/outline';
import BaseModal from '../common/BaseModal';
import { PresupuestosService } from '../../services/presupuestos/presupuestosService';

/**
 * Modal para ver detalles completos de un presupuesto
 */
export const VerPresupuestoModal = ({ isOpen, onClose, presupuesto }) => {
  if (!presupuesto) return null;

  const formatCurrency = (amount, currency = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'borrador': return 'bg-gray-100 text-gray-800';
      case 'revision': return 'bg-yellow-100 text-yellow-800';
      case 'aprobado': return 'bg-green-100 text-green-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'ejecutando': return 'bg-blue-100 text-blue-800';
      case 'finalizado': return 'bg-purple-100 text-purple-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Presupuesto: ${presupuesto.codigo || presupuesto.numero}`}
      type="view"
      size="2xl"
    >
      <div className="space-y-6">
        {/* Encabezado con información principal */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {presupuesto.nombre}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {presupuesto.descripcion || 'Sin descripción'}
              </p>
            </div>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(presupuesto.estado)}`}>
              {presupuesto.estado?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código/Número
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
              {presupuesto.codigo || presupuesto.numero}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Versión
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              v{presupuesto.version || '1.0'}
            </p>
          </div>
        </div>

        {/* Cliente e información del proyecto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <UserIcon className="h-4 w-4 mr-1" />
              Cliente
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.cliente?.nombre || presupuesto.nombre_cliente || 'Sin especificar'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <BuildingOfficeIcon className="h-4 w-4 mr-1" />
              Proyecto
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.proyecto?.nombre || presupuesto.nombre_proyecto || 'Sin especificar'}
            </p>
          </div>
        </div>

        {/* Fechas importantes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Fecha de Creación
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.fecha_creacion ? new Date(presupuesto.fecha_creacion).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Validez
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.fecha_validez ? new Date(presupuesto.fecha_validez).toLocaleDateString() : 'Sin límite'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Límite
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.fecha_limite ? new Date(presupuesto.fecha_limite).toLocaleDateString() : 'Sin límite'}
            </p>
          </div>
        </div>

        {/* Información financiera */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
          <h4 className="text-sm font-medium text-green-800 dark:text-green-400 mb-3 flex items-center">
            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
            Información Financiera
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(presupuesto.subtotal, presupuesto.moneda)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Subtotal</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                {formatCurrency(presupuesto.total_impuestos, presupuesto.moneda)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Impuestos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                {formatCurrency(presupuesto.descuentos || 0, presupuesto.moneda)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Descuentos</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(presupuesto.total, presupuesto.moneda)}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Final</p>
            </div>
          </div>
        </div>

        {/* Configuración y parámetros */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Moneda
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.moneda || 'MXN'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Margen de Utilidad
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {presupuesto.margen_utilidad ? `${(presupuesto.margen_utilidad * 100).toFixed(2)}%` : 'No especificado'}
            </p>
          </div>
        </div>

        {/* Catálogo utilizado */}
        {presupuesto.catalogo && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <ClipboardDocumentCheckIcon className="h-4 w-4 mr-1" />
              Catálogo de Precios
            </label>
            <div className="mt-1 bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                {presupuesto.catalogo.nombre}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Código: {presupuesto.catalogo.codigo} | Versión: v{presupuesto.catalogo.version}
              </p>
            </div>
          </div>
        )}

        {/* Observaciones */}
        {presupuesto.observaciones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {presupuesto.observaciones}
            </p>
          </div>
        )}

        {/* Resumen de partidas */}
        {presupuesto.resumen_partidas && (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Resumen de Partidas
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  {presupuesto.total_partidas || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Total Partidas</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  {presupuesto.partidas_con_precio || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Con Precio</p>
              </div>
              <div>
                <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {presupuesto.partidas_sin_precio || 0}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Sin Precio</p>
              </div>
            </div>
          </div>
        )}

        {/* Metadatos de auditoría */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Creado por:</span> {presupuesto.creado_por_nombre || 'Sistema'}
              <br />
              <span className="font-medium">Fecha:</span> {new Date(presupuesto.createdAt || presupuesto.fecha_creacion).toLocaleDateString()}
            </div>
            <div>
              <span className="font-medium">Última modificación:</span> {new Date(presupuesto.updatedAt || presupuesto.fecha_actualizacion).toLocaleDateString()}
              <br />
              <span className="font-medium">Revisión:</span> {presupuesto.numero_revision || 1}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para duplicar un presupuesto
 */
export const DuplicarPresupuestoModal = ({ 
  isOpen, 
  onClose, 
  presupuesto, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    nuevo_codigo: '',
    nuevo_nombre: '',
    incluir_partidas: true,
    incluir_precios: true,
    actualizar_precios: true,
    nuevo_cliente: '',
    nuevo_proyecto: '',
    observaciones_duplicacion: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (presupuesto && isOpen) {
      setFormData({
        nuevo_codigo: `${presupuesto.codigo || presupuesto.numero}_COPIA`,
        nuevo_nombre: `${presupuesto.nombre} (Copia)`,
        incluir_partidas: true,
        incluir_precios: true,
        actualizar_precios: true,
        nuevo_cliente: '',
        nuevo_proyecto: '',
        observaciones_duplicacion: ''
      });
    }
    setErrors({});
  }, [presupuesto, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

    if (!formData.nuevo_codigo.trim()) {
      newErrors.nuevo_codigo = 'El código es obligatorio';
    }
    if (!formData.nuevo_nombre.trim()) {
      newErrors.nuevo_nombre = 'El nombre es obligatorio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDuplicar = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await PresupuestosService.duplicar(presupuesto.id_presupuesto, formData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al duplicar presupuesto:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  if (!presupuesto) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Duplicar Presupuesto"
      type="create"
      size="xl"
      onConfirm={handleDuplicar}
      onCancel={onClose}
      loading={loading}
      confirmText="Duplicar"
    >
      <div className="space-y-6">
        {/* Información del presupuesto original */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center mb-2">
            <DocumentDuplicateIcon className="h-5 w-5 text-blue-600 mr-2" />
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400">
              Presupuesto Original
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700 dark:text-blue-300">
            <p><span className="font-semibold">Código:</span> {presupuesto.codigo}</p>
            <p><span className="font-semibold">Nombre:</span> {presupuesto.nombre}</p>
            <p><span className="font-semibold">Cliente:</span> {presupuesto.cliente?.nombre || 'Sin especificar'}</p>
            <p><span className="font-semibold">Total:</span> {new Intl.NumberFormat('es-MX', {
              style: 'currency',
              currency: presupuesto.moneda || 'MXN'
            }).format(presupuesto.total || 0)}</p>
          </div>
        </div>

        {/* Configuración del duplicado */}
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo Código *
              </label>
              <input
                type="text"
                name="nuevo_codigo"
                value={formData.nuevo_codigo}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                  errors.nuevo_codigo ? 'border-red-300' : ''
                }`}
                placeholder="Código del nuevo presupuesto"
              />
              {errors.nuevo_codigo && (
                <p className="mt-1 text-sm text-red-600">{errors.nuevo_codigo}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo Nombre *
              </label>
              <input
                type="text"
                name="nuevo_nombre"
                value={formData.nuevo_nombre}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                  errors.nuevo_nombre ? 'border-red-300' : ''
                }`}
                placeholder="Nombre del nuevo presupuesto"
              />
              {errors.nuevo_nombre && (
                <p className="mt-1 text-sm text-red-600">{errors.nuevo_nombre}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo Cliente
              </label>
              <input
                type="text"
                name="nuevo_cliente"
                value={formData.nuevo_cliente}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Dejar vacío para mantener el mismo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nuevo Proyecto
              </label>
              <input
                type="text"
                name="nuevo_proyecto"
                value={formData.nuevo_proyecto}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                placeholder="Dejar vacío para mantener el mismo"
              />
            </div>
          </div>

          {/* Opciones de duplicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Opciones de Duplicación
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="incluir_partidas"
                  checked={formData.incluir_partidas}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span className="text-sm">Incluir todas las partidas</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="incluir_precios"
                  checked={formData.incluir_precios}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span className="text-sm">Incluir precios actuales</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="actualizar_precios"
                  checked={formData.actualizar_precios}
                  onChange={handleInputChange}
                  className="mr-2 rounded"
                />
                <span className="text-sm">Actualizar precios desde catálogo vigente</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <textarea
              name="observaciones_duplicacion"
              value={formData.observaciones_duplicacion}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Notas sobre la duplicación"
            />
          </div>
        </form>

        {/* Advertencia */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Nota:</strong> El nuevo presupuesto se creará como borrador. 
            Si se selecciona actualizar precios, se utilizarán los precios vigentes del catálogo asociado.
          </p>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para cambiar estado de presupuesto
 */
export const CambiarEstadoModal = ({ 
  isOpen, 
  onClose, 
  presupuesto, 
  onSuccess 
}) => {
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (presupuesto && isOpen) {
      setNuevoEstado(presupuesto.estado || '');
      setObservaciones('');
    }
  }, [presupuesto, isOpen]);

  const handleCambiarEstado = async () => {
    if (!nuevoEstado || nuevoEstado === presupuesto.estado) {
      onClose();
      return;
    }

    setLoading(true);
    try {
      await PresupuestosService.cambiarEstado(presupuesto.id_presupuesto, {
        nuevo_estado: nuevoEstado,
        observaciones: observaciones.trim() || null,
        fecha_cambio: new Date().toISOString()
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const estados = [
    { value: 'borrador', label: 'Borrador', description: 'En elaboración, editable' },
    { value: 'revision', label: 'En Revisión', description: 'Pendiente de aprobación' },
    { value: 'aprobado', label: 'Aprobado', description: 'Listo para ejecución' },
    { value: 'rechazado', label: 'Rechazado', description: 'Requiere modificaciones' },
    { value: 'ejecutando', label: 'En Ejecución', description: 'Proyecto en curso' },
    { value: 'finalizado', label: 'Finalizado', description: 'Proyecto completado' },
    { value: 'cancelado', label: 'Cancelado', description: 'Proyecto cancelado' }
  ];

  if (!presupuesto) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cambiar Estado del Presupuesto"
      type="edit"
      size="lg"
      onConfirm={handleCambiarEstado}
      onCancel={onClose}
      loading={loading}
      confirmText="Cambiar Estado"
    >
      <div className="space-y-6">
        {/* Información del presupuesto */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Presupuesto
          </h4>
          <p className="text-sm text-gray-900 dark:text-white font-semibold">
            {presupuesto.codigo} - {presupuesto.nombre}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Estado actual: <span className="font-medium">{presupuesto.estado?.toUpperCase()}</span>
          </p>
        </div>

        {/* Selector de nuevo estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nuevo Estado
          </label>
          <div className="space-y-2">
            {estados.map(estado => (
              <label key={estado.value} className="flex items-start">
                <input
                  type="radio"
                  name="estado"
                  value={estado.value}
                  checked={nuevoEstado === estado.value}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {estado.label}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {estado.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Observaciones del Cambio
          </label>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Motivo del cambio de estado (opcional)"
          />
        </div>

        {/* Advertencias según el estado */}
        {nuevoEstado === 'cancelado' && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded border border-red-200 dark:border-red-800">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5 mr-2" />
              <div className="text-sm text-red-800 dark:text-red-200">
                <p className="font-medium">Cancelar Presupuesto</p>
                <p className="mt-1">
                  Esta acción marcará el presupuesto como cancelado. 
                  No se podrá ejecutar ni facturar.
                </p>
              </div>
            </div>
          </div>
        )}

        {nuevoEstado === 'aprobado' && (
          <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-800 dark:text-green-200">
              <p className="font-medium">Aprobar Presupuesto</p>
              <p className="mt-1">
                El presupuesto quedará listo para ejecución y podrá ser facturado.
              </p>
            </div>
          </div>
        )}
      </div>
    </BaseModal>
  );
};

/**
 * Modal de confirmación para eliminar presupuesto
 */
export const EliminarPresupuestoModal = ({ 
  isOpen, 
  onClose, 
  presupuesto, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await PresupuestosService.delete(presupuesto.id_presupuesto);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  if (!presupuesto) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Presupuesto"
      type="delete"
      onConfirm={handleEliminar}
      onCancel={onClose}
      loading={loading}
      confirmText="Eliminar"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Presupuesto a eliminar:
              </h4>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p><span className="font-semibold">Código:</span> {presupuesto.codigo}</p>
                <p><span className="font-semibold">Nombre:</span> {presupuesto.nombre}</p>
                <p><span className="font-semibold">Cliente:</span> {presupuesto.cliente?.nombre || 'Sin especificar'}</p>
                <p><span className="font-semibold">Total:</span> {new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: presupuesto.moneda || 'MXN'
                }).format(presupuesto.total || 0)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Consecuencias de la eliminación:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>Se eliminarán todas las partidas asociadas ({presupuesto.total_partidas || 0} partidas)</li>
                <li>Se perderá el historial de cambios y revisiones</li>
                <li>Los documentos relacionados quedarán huérfanos</li>
                <li>Esta acción es irreversible</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};