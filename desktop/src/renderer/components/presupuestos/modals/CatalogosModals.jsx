import React, { useState, useEffect } from 'react';
import { 
  ExclamationTriangleIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import BaseModal from '../common/BaseModal';
import { CatalogosService } from '../../services/presupuestos/catalogosService';

/**
 * Modal para ver detalles de un catálogo de precios
 */
export const VerCatalogoModal = ({ isOpen, onClose, catalogo }) => {
  if (!catalogo) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Catálogo: ${catalogo.nombre}`}
      type="view"
      size="xl"
    >
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Código
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white font-mono">
              {catalogo.codigo}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Versión
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              v{catalogo.version}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Nombre
          </label>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-white">
            {catalogo.nombre}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <p className="mt-1 text-sm text-gray-900 dark:text-white">
            {catalogo.descripcion || 'Sin descripción'}
          </p>
        </div>

        {/* Estado y tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <span className={`inline-flex mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
              catalogo.tipo === 'oficial' ? 'bg-blue-100 text-blue-800' :
              catalogo.tipo === 'regional' ? 'bg-green-100 text-green-800' :
              catalogo.tipo === 'empresa' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {catalogo.tipo?.toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Estado
            </label>
            <span className={`inline-flex mt-1 px-3 py-1 text-xs font-semibold rounded-full ${
              catalogo.estado === 'activo' ? 'bg-green-100 text-green-800' :
              catalogo.estado === 'inactivo' ? 'bg-red-100 text-red-800' :
              catalogo.estado === 'borrador' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {catalogo.estado?.toUpperCase()}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Región
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {catalogo.region || 'Nacional'}
            </p>
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Fecha de Publicación
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {catalogo.fecha_publicacion ? new Date(catalogo.fecha_publicacion).toLocaleDateString() : 'No publicado'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1" />
              Vigencia
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {catalogo.vigente_desde ? new Date(catalogo.vigente_desde).toLocaleDateString() : 'N/A'} - 
              {catalogo.vigente_hasta ? new Date(catalogo.vigente_hasta).toLocaleDateString() : 'Indefinido'}
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Estadísticas del Catálogo
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {catalogo.total_conceptos || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Total Conceptos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {catalogo.conceptos_con_precio || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Con Precio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {catalogo.conceptos_sin_precio || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Sin Precio</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {catalogo.total_categorias || 0}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Categorías</p>
            </div>
          </div>
        </div>

        {/* Organización y fuente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organización
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {catalogo.organizacion || 'N/A'}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuente de Datos
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white">
              {catalogo.fuente_datos || 'N/A'}
            </p>
          </div>
        </div>

        {catalogo.observaciones && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <p className="mt-1 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
              {catalogo.observaciones}
            </p>
          </div>
        )}

        {/* Metadatos de auditoría */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span className="font-medium">Creado:</span> {new Date(catalogo.createdAt).toLocaleDateString()}
              <br />
              <span className="font-medium">Por:</span> {catalogo.creado_por_nombre || 'Sistema'}
            </div>
            <div>
              <span className="font-medium">Actualizado:</span> {new Date(catalogo.updatedAt).toLocaleDateString()}
              <br />
              <span className="font-medium">Tamaño:</span> {catalogo.tamano_archivo ? `${(catalogo.tamano_archivo / 1024).toFixed(1)} KB` : 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para crear/editar catálogos de precios
 */
export const FormCatalogoModal = ({ 
  isOpen, 
  onClose, 
  catalogo = null, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    version: '1.0',
    tipo: 'empresa',
    estado: 'borrador',
    region: '',
    organizacion: '',
    fuente_datos: '',
    fecha_publicacion: '',
    vigente_desde: '',
    vigente_hasta: '',
    observaciones: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditing = !!catalogo;

  useEffect(() => {
    if (catalogo) {
      setFormData({
        codigo: catalogo.codigo || '',
        nombre: catalogo.nombre || '',
        descripcion: catalogo.descripcion || '',
        version: catalogo.version || '1.0',
        tipo: catalogo.tipo || 'empresa',
        estado: catalogo.estado || 'borrador',
        region: catalogo.region || '',
        organizacion: catalogo.organizacion || '',
        fuente_datos: catalogo.fuente_datos || '',
        fecha_publicacion: catalogo.fecha_publicacion ? catalogo.fecha_publicacion.split('T')[0] : '',
        vigente_desde: catalogo.vigente_desde ? catalogo.vigente_desde.split('T')[0] : '',
        vigente_hasta: catalogo.vigente_hasta ? catalogo.vigente_hasta.split('T')[0] : '',
        observaciones: catalogo.observaciones || ''
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        version: '1.0',
        tipo: 'empresa',
        estado: 'borrador',
        region: '',
        organizacion: '',
        fuente_datos: '',
        fecha_publicacion: '',
        vigente_desde: today,
        vigente_hasta: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [catalogo, isOpen]);

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
    if (!formData.version.trim()) {
      newErrors.version = 'La versión es obligatoria';
    }

    // Validar fechas
    if (formData.vigente_desde && formData.vigente_hasta) {
      if (new Date(formData.vigente_desde) > new Date(formData.vigente_hasta)) {
        newErrors.vigente_hasta = 'La fecha final debe ser posterior a la fecha inicial';
      }
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
        creado_por: 1, // TODO: obtener del contexto de usuario
      };

      if (isEditing) {
        await CatalogosService.update(catalogo.id_catalogo, dataToSend);
      } else {
        await CatalogosService.create(dataToSend);
      }

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al guardar catálogo:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const tiposCatalogo = [
    { value: 'oficial', label: 'Oficial' },
    { value: 'regional', label: 'Regional' },
    { value: 'empresa', label: 'Empresa' },
    { value: 'proyecto', label: 'Proyecto Específico' }
  ];

  const estadosCatalogo = [
    { value: 'borrador', label: 'Borrador' },
    { value: 'revision', label: 'En Revisión' },
    { value: 'activo', label: 'Activo' },
    { value: 'archivado', label: 'Archivado' }
  ];

  const regiones = [
    { value: '', label: 'Nacional' },
    { value: 'norte', label: 'Región Norte' },
    { value: 'centro', label: 'Región Centro' },
    { value: 'sur', label: 'Región Sur' },
    { value: 'golfo', label: 'Región Golfo' },
    { value: 'pacifico', label: 'Región Pacífico' }
  ];

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Catálogo' : 'Nuevo Catálogo de Precios'}
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
              placeholder="Ej: CAT001"
            />
            {errors.codigo && (
              <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Versión *
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.version ? 'border-red-300' : ''
              }`}
              placeholder="1.0"
            />
            {errors.version && (
              <p className="mt-1 text-sm text-red-600">{errors.version}</p>
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
            placeholder="Nombre del catálogo"
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
            placeholder="Descripción del catálogo de precios"
          />
        </div>

        {/* Clasificación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {tiposCatalogo.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
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
              {estadosCatalogo.map(estado => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Región
            </label>
            <select
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            >
              {regiones.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Organización y fuente */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Organización
            </label>
            <input
              type="text"
              name="organizacion"
              value={formData.organizacion}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Organización responsable"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fuente de Datos
            </label>
            <input
              type="text"
              name="fuente_datos"
              value={formData.fuente_datos}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
              placeholder="Fuente de los precios"
            />
          </div>
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha de Publicación
            </label>
            <input
              type="date"
              name="fecha_publicacion"
              value={formData.fecha_publicacion}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Desde
            </label>
            <input
              type="date"
              name="vigente_desde"
              value={formData.vigente_desde}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Vigente Hasta
            </label>
            <input
              type="date"
              name="vigente_hasta"
              value={formData.vigente_hasta}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:text-white sm:text-sm ${
                errors.vigente_hasta ? 'border-red-300' : ''
              }`}
            />
            {errors.vigente_hasta && (
              <p className="mt-1 text-sm text-red-600">{errors.vigente_hasta}</p>
            )}
          </div>
        </div>

        {/* Observaciones */}
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
            placeholder="Notas adicionales sobre el catálogo"
          />
        </div>
      </form>
    </BaseModal>
  );
};

/**
 * Modal de confirmación para eliminar catálogo
 */
export const EliminarCatalogoModal = ({ 
  isOpen, 
  onClose, 
  catalogo, 
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);

  const handleEliminar = async () => {
    setLoading(true);
    try {
      await CatalogosService.delete(catalogo.id_catalogo);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al eliminar catálogo:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  if (!catalogo) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Eliminar Catálogo"
      type="delete"
      onConfirm={handleEliminar}
      onCancel={onClose}
      loading={loading}
      confirmText="Eliminar"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          ¿Estás seguro de que deseas eliminar este catálogo de precios? Esta acción no se puede deshacer.
        </p>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400">
                Catálogo a eliminar:
              </h4>
              <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                <p><span className="font-semibold">Código:</span> {catalogo.codigo}</p>
                <p><span className="font-semibold">Nombre:</span> {catalogo.nombre}</p>
                <p><span className="font-semibold">Versión:</span> v{catalogo.version}</p>
                <p><span className="font-semibold">Conceptos:</span> {catalogo.total_conceptos || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start space-x-3">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium">Impacto de la eliminación:</p>
              <ul className="mt-1 list-disc list-inside">
                <li>Se eliminarán todos los precios asociados ({catalogo.conceptos_con_precio || 0} conceptos)</li>
                <li>Los presupuestos que usen este catálogo podrían verse afectados</li>
                <li>Se perderá el historial de versiones del catálogo</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

/**
 * Modal para importar/exportar catálogo
 */
export const ImportExportModal = ({ 
  isOpen, 
  onClose, 
  catalogo = null,
  tipo = 'import', // 'import' o 'export'
  onSuccess 
}) => {
  const [loading, setLoading] = useState(false);
  const [archivo, setArchivo] = useState(null);
  const [opciones, setOpciones] = useState({
    formato: 'excel',
    incluir_precios: true,
    incluir_conceptos: true,
    incluir_metadatos: true
  });

  const handleArchivoChange = (e) => {
    setArchivo(e.target.files[0]);
  };

  const handleOpcionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOpciones(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImport = async () => {
    if (!archivo) return;

    setLoading(true);
    try {
      await CatalogosService.importar(archivo, opciones);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al importar catálogo:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await CatalogosService.exportar(catalogo.id_catalogo, opciones);
      
      // Descargar archivo
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${catalogo.codigo}_v${catalogo.version}.${opciones.formato}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error al exportar catálogo:', error);
      // TODO: Mostrar toast de error
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={tipo === 'import' ? 'Importar Catálogo' : 'Exportar Catálogo'}
      type={tipo === 'import' ? 'create' : 'info'}
      size="lg"
      onConfirm={tipo === 'import' ? handleImport : handleExport}
      onCancel={onClose}
      loading={loading}
      confirmText={tipo === 'import' ? 'Importar' : 'Exportar'}
    >
      <div className="space-y-6">
        {tipo === 'import' ? (
          <>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <DocumentArrowUpIcon className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">Hacer clic para subir</span> o arrastrar archivo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excel (.xlsx), CSV (.csv) o JSON (.json)
                  </p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".xlsx,.csv,.json"
                  onChange={handleArchivoChange}
                />
              </label>
            </div>

            {archivo && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <TagIcon className="inline h-4 w-4 mr-1" />
                  Archivo seleccionado: {archivo.name}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <DocumentArrowDownIcon className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  Exportar: {catalogo?.nombre}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Código: {catalogo?.codigo} | Versión: v{catalogo?.version}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Opciones de formato */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Formato
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="formato"
                value="excel"
                checked={opciones.formato === 'excel'}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">Excel (.xlsx) - Recomendado</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="formato"
                value="csv"
                checked={opciones.formato === 'csv'}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">CSV (.csv) - Datos básicos</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="formato"
                value="json"
                checked={opciones.formato === 'json'}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">JSON (.json) - Completo</span>
            </label>
          </div>
        </div>

        {/* Opciones de contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Contenido a {tipo === 'import' ? 'importar' : 'incluir'}
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="incluir_conceptos"
                checked={opciones.incluir_conceptos}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">Conceptos de obra</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="incluir_precios"
                checked={opciones.incluir_precios}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">Precios unitarios</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                name="incluir_metadatos"
                checked={opciones.incluir_metadatos}
                onChange={handleOpcionChange}
                className="mr-2"
              />
              <span className="text-sm">Metadatos y configuración</span>
            </label>
          </div>
        </div>

        {tipo === 'import' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Nota:</strong> La importación puede sobrescribir datos existentes. 
              Se recomienda hacer una copia de seguridad antes de proceder.
            </p>
          </div>
        )}
      </div>
    </BaseModal>
  );
};