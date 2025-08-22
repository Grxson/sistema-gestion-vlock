import React, { useState, useEffect } from 'react';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  TruckIcon,
  ClockIcon,
  BuildingOfficeIcon,
  CubeIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import apiService from '../services/api';
import DateInput from './ui/DateInput';
import CustomSelect from './ui/CustomSelect';
import ProveedorAutocomplete from './common/ProveedorAutocomplete';

export default function Suministros() {
  const [suministros, setSuministros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroProyecto, setFiltroProyecto] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: 'Material',
    cantidad: '',
    unidad_medida: '',
    precio_unitario: '',
    fecha_necesaria: '',
    estado: 'Solicitado',
    id_proyecto: '',
    proveedor_info: null,
    observaciones: '',
    codigo_producto: '',
    marca: '',
    modelo: ''
  });

  const CATEGORIAS_SUMINISTRO = {
    'Material': 'Material',
    'Herramienta': 'Herramienta',
    'Equipo': 'Equipo',
    'Servicio': 'Servicio',
    'Consumible': 'Consumible',
    'Maquinaria': 'Maquinaria'
  };

  const ESTADOS_SUMINISTRO = {
    'Solicitado': { label: 'Solicitado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    'Aprobado': { label: 'Aprobado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    'Pedido': { label: 'Pedido', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
    'En_Transito': { label: 'En Tránsito', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    'Entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    'Cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [suministrosResponse, proyectosResponse] = await Promise.all([
        apiService.getSuministros(),
        apiService.getProyectos()
      ]);
      
      if (suministrosResponse.success) {
        setSuministros(suministrosResponse.data || []);
      }
      
      if (proyectosResponse.success) {
        setProyectos(proyectosResponse.data || []);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario) || 0,
        cantidad: parseFloat(formData.cantidad) || 0,
        proveedor: formData.proveedor_info ? formData.proveedor_info.nombre : ''
      };

      if (editingItem) {
        const response = await apiService.updateSuministro(editingItem.id_suministro, submitData);
        if (response.success) {
          await cargarDatos();
          resetForm();
          setShowModal(false);
        }
      } else {
        const response = await apiService.createSuministro(submitData);
        if (response.success) {
          await cargarDatos();
          resetForm();
          setShowModal(false);
        }
      }
    } catch (error) {
      console.error('Error al guardar suministro:', error);
      alert('Error al guardar el suministro');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre || '',
      descripcion: item.descripcion || '',
      categoria: item.categoria || 'Material',
      cantidad: item.cantidad || '',
      unidad_medida: item.unidad_medida || '',
      precio_unitario: item.precio_unitario || '',
      fecha_necesaria: item.fecha_necesaria || '',
      estado: item.estado || 'Solicitado',
      id_proyecto: item.id_proyecto || '',
      proveedor_info: item.proveedor_info || null,
      observaciones: item.observaciones || '',
      codigo_producto: item.codigo_producto || '',
      marca: item.marca || '',
      modelo: item.modelo || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este suministro?')) {
      try {
        const response = await apiService.deleteSuministro(id);
        if (response.success) {
          await cargarDatos();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        alert('Error al eliminar el suministro');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      categoria: 'Material',
      cantidad: '',
      unidad_medida: '',
      precio_unitario: '',
      fecha_necesaria: '',
      estado: 'Solicitado',
      id_proyecto: '',
      proveedor_info: null,
      observaciones: '',
      codigo_producto: '',
      marca: '',
      modelo: ''
    });
    setEditingItem(null);
  };

  const filteredSuministros = suministros.filter(item => {
    const matchesSearch = (
      item.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.proveedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesProyecto = !filtroProyecto || item.id_proyecto?.toString() === filtroProyecto;
    const matchesCategoria = !filtroCategoria || item.categoria === filtroCategoria;
    
    return matchesSearch && matchesProyecto && matchesCategoria;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Suministros</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestión de materiales, equipos y servicios por proyecto
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm hover:shadow-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Suministro
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <div className="px-4 py-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
                placeholder="Buscar suministros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtro Proyecto */}
            <CustomSelect
              value={filtroProyecto}
              onChange={setFiltroProyecto}
              options={[
                { value: '', label: 'Todos los proyectos' },
                ...proyectos.map(p => ({
                  value: p.id_proyecto.toString(),
                  label: p.nombre
                }))
              ]}
              placeholder="Filtrar por proyecto"
            />

            {/* Filtro Categoría */}
            <CustomSelect
              value={filtroCategoria}
              onChange={setFiltroCategoria}
              options={[
                { value: '', label: 'Todas las categorías' },
                ...Object.entries(CATEGORIAS_SUMINISTRO).map(([key, value]) => ({
                  value: key,
                  label: value
                }))
              ]}
              placeholder="Filtrar por categoría"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredSuministros.map((item) => (
            <li key={item.id_suministro}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-dark-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        {item.categoria === 'Material' && <CubeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
                        {item.categoria === 'Equipo' && <TruckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
                        {item.categoria === 'Servicio' && <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
                        {!['Material', 'Equipo', 'Servicio'].includes(item.categoria) && <CubeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.nombre || 'Sin nombre'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {proyectos.find(p => p.id_proyecto == item.id_proyecto)?.nombre || 'Sin proyecto'}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {item.categoria || 'Sin categoría'}
                          </span>
                          {item.estado && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ESTADOS_SUMINISTRO[item.estado]?.color || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'}`}>
                              {ESTADOS_SUMINISTRO[item.estado]?.label || item.estado}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                        {item.cantidad && (
                          <>
                            <CubeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{item.cantidad} {item.unidad_medida || 'unidades'}</span>
                          </>
                        )}
                        {item.fecha_necesaria && (
                          <>
                            <span className="mx-2">•</span>
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{new Date(item.fecha_necesaria).toLocaleDateString('es-ES')}</span>
                          </>
                        )}
                        {item.proveedor && (
                          <>
                            <span className="mx-2">•</span>
                            <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                            <span>{item.proveedor}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors duration-200"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id_suministro)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg transition-colors duration-200"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredSuministros.length === 0 && (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay suministros</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando un nuevo registro de suministro.
            </p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-4xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingItem ? 'Editar Suministro' : 'Nuevo Suministro'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Suministro *
                    </label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      placeholder="Ej: Cemento Portland"
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Categoría *"
                      value={formData.categoria}
                      onChange={(value) => setFormData({...formData, categoria: value})}
                      options={Object.entries(CATEGORIAS_SUMINISTRO).map(([key, value]) => ({
                        value: key,
                        label: value
                      }))}
                      required={true}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Descripción detallada del suministro..."
                  />
                </div>

                {/* Proyecto y cantidad */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <CustomSelect
                      label="Proyecto *"
                      value={formData.id_proyecto}
                      onChange={(value) => setFormData({...formData, id_proyecto: value})}
                      placeholder="Seleccionar proyecto"
                      options={proyectos.map(p => ({
                        value: p.id_proyecto.toString(),
                        label: p.nombre,
                        description: p.ubicacion
                      }))}
                      searchable={true}
                      required={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.cantidad}
                      onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.unidad_medida}
                      onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                      placeholder="Ej: kg, m², unidades, litros"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Precio Unitario
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.precio_unitario}
                      onChange={(e) => setFormData({...formData, precio_unitario: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Proveedor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Proveedor
                  </label>
                  <ProveedorAutocomplete
                    value={formData.proveedor_info}
                    onChange={(proveedor) => setFormData({...formData, proveedor_info: proveedor})}
                    placeholder="Buscar o agregar proveedor..."
                    tipoSugerido={formData.categoria}
                  />
                </div>

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <DateInput
                      label="Fecha Necesaria"
                      value={formData.fecha_necesaria}
                      onChange={(value) => setFormData({...formData, fecha_necesaria: value})}
                    />
                  </div>

                  <div>
                    <CustomSelect
                      label="Estado"
                      value={formData.estado}
                      onChange={(value) => setFormData({...formData, estado: value})}
                      options={Object.entries(ESTADOS_SUMINISTRO).map(([key, value]) => ({
                        value: key,
                        label: value.label
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código de Producto
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.codigo_producto}
                      onChange={(e) => setFormData({...formData, codigo_producto: e.target.value})}
                      placeholder="Ej: CEM001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Marca
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.marca}
                      onChange={(e) => setFormData({...formData, marca: e.target.value})}
                      placeholder="Ej: CEMEX"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Modelo
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.modelo}
                      onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                      placeholder="Ej: Portland Compuesto"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                    placeholder="Notas adicionales..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingItem ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}