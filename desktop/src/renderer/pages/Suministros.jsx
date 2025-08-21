import React, { useState, useEffect, useCallback } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSearch, 
  FaFilter,
  FaBox,
  FaTruck,
  FaCalendarAlt,
  FaDollarSign,
  FaBuilding,
  FaDownload,
  FaEye
} from 'react-icons/fa';
import api from '../services/api';
import ProveedorAutocomplete from '../components/common/ProveedorAutocomplete';

const CATEGORIAS_SUMINISTRO = {
  'Material': 'Material',
  'Herramienta': 'Herramienta',
  'Equipo': 'Equipo',
  'Servicio': 'Servicio',
  'Consumible': 'Consumible'
};

const ESTADOS_SUMINISTRO = {
  'Solicitado': { label: 'Solicitado', color: 'bg-yellow-100 text-yellow-800' },
  'Aprobado': { label: 'Aprobado', color: 'bg-blue-100 text-blue-800' },
  'Pedido': { label: 'Pedido', color: 'bg-purple-100 text-purple-800' },
  'En_Transito': { label: 'En Tránsito', color: 'bg-orange-100 text-orange-800' },
  'Entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800' },
  'Cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800' }
};

const Suministros = () => {
  const [suministros, setSuministros] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSuministro, setEditingSuministro] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    proyecto: '',
    proveedor: ''
  });

  // Formulario
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
    proveedor_info: null, // Objeto completo del proveedor
    observaciones: '',
    codigo_producto: '',
    marca: '',
    modelo: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [suministrosResponse, proyectosResponse] = await Promise.all([
        api.getSuministros(),
        api.getProyectos()
      ]);
      
      if (suministrosResponse.success) {
        setSuministros(suministrosResponse.data || []);
      }
      
      if (proyectosResponse.success) {
        setProyectos(proyectosResponse.data || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = {
        ...formData,
        precio_unitario: parseFloat(formData.precio_unitario) || 0,
        cantidad: parseFloat(formData.cantidad) || 0,
        id_proveedor: formData.proveedor_info?.id_proveedor || null,
        proveedor: formData.proveedor_info?.nombre || formData.proveedor // Backup para el campo legacy
      };

      let response;
      if (editingSuministro) {
        response = await api.updateSuministro(editingSuministro.id_suministro, submitData);
      } else {
        response = await api.createSuministro(submitData);
      }

      if (response.success) {
        await loadData();
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error guardando suministro:', error);
      alert('Error al guardar: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleEdit = (suministro) => {
    setEditingSuministro(suministro);
    setFormData({
      nombre: suministro.nombre || '',
      descripcion: suministro.descripcion || '',
      categoria: suministro.categoria || 'Material',
      cantidad: suministro.cantidad?.toString() || '',
      unidad_medida: suministro.unidad_medida || '',
      precio_unitario: suministro.precio_unitario?.toString() || '',
      fecha_necesaria: suministro.fecha_necesaria ? 
        new Date(suministro.fecha_necesaria).toISOString().split('T')[0] : '',
      estado: suministro.estado || 'Solicitado',
      id_proyecto: suministro.id_proyecto?.toString() || '',
      proveedor_info: suministro.proveedorInfo || null,
      observaciones: suministro.observaciones || '',
      codigo_producto: suministro.codigo_producto || '',
      marca: suministro.marca || '',
      modelo: suministro.modelo || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este suministro?')) {
      try {
        const response = await api.deleteSuministro(id);
        if (response.success) {
          await loadData();
        }
      } catch (error) {
        console.error('Error eliminando suministro:', error);
        alert('Error al eliminar: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSuministro(null);
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
  };

  const filteredSuministros = suministros.filter(suministro => {
    const matchesSearch = suministro.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         suministro.codigo_producto?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategoria = !filters.categoria || suministro.categoria === filters.categoria;
    const matchesEstado = !filters.estado || suministro.estado === filters.estado;
    const matchesProyecto = !filters.proyecto || suministro.id_proyecto?.toString() === filters.proyecto;
    const matchesProveedor = !filters.proveedor || 
                            suministro.proveedor?.toLowerCase().includes(filters.proveedor.toLowerCase()) ||
                            suministro.proveedorInfo?.nombre?.toLowerCase().includes(filters.proveedor.toLowerCase());

    return matchesSearch && matchesCategoria && matchesEstado && matchesProyecto && matchesProveedor;
  });

  const calculateTotal = (suministro) => {
    return (suministro.cantidad || 0) * (suministro.precio_unitario || 0);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    return new Date(dateString).toLocaleDateString('es-MX');
  };

  const getEstadoStyle = (estado) => {
    return ESTADOS_SUMINISTRO[estado]?.color || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Suministros</h1>
        <p className="text-gray-600">Administra materiales, herramientas y equipos para proyectos</p>
      </div>

      {/* Controles superiores */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar suministros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filters.categoria}
              onChange={(e) => setFilters({...filters, categoria: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las categorías</option>
              {Object.entries(CATEGORIAS_SUMINISTRO).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>

            <select
              value={filters.estado}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Nuevo Suministro
          </button>
        </div>
      </div>

      {/* Tabla de suministros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Suministro
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Necesaria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSuministros.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    <FaBox className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <p>No hay suministros registrados</p>
                  </td>
                </tr>
              ) : (
                filteredSuministros.map((suministro) => (
                  <tr key={suministro.id_suministro} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{suministro.nombre}</div>
                        <div className="text-sm text-gray-500">{suministro.descripcion}</div>
                        {suministro.codigo_producto && (
                          <div className="text-xs text-gray-400">Código: {suministro.codigo_producto}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {suministro.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FaBuilding className="text-gray-400 w-4 h-4" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {suministro.proveedorInfo?.nombre || suministro.proveedor || 'Sin asignar'}
                          </div>
                          {suministro.proveedorInfo?.tipo_proveedor && (
                            <div className="text-xs text-gray-500">
                              {suministro.proveedorInfo.tipo_proveedor}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {suministro.cantidad} {suministro.unidad_medida}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm text-gray-900">
                          {formatCurrency(suministro.precio_unitario)} / {suministro.unidad_medida}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {formatCurrency(calculateTotal(suministro))}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEstadoStyle(suministro.estado)}`}>
                        {ESTADOS_SUMINISTRO[suministro.estado]?.label || suministro.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {formatDate(suministro.fecha_necesaria)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(suministro)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Editar"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(suministro.id_suministro)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Eliminar"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingSuministro ? 'Editar Suministro' : 'Nuevo Suministro'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Suministro *
                      </label>
                      <input
                        type="text"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          value={formData.categoria}
                          onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          {Object.entries(CATEGORIAS_SUMINISTRO).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Proyecto *
                        </label>
                        <select
                          value={formData.id_proyecto}
                          onChange={(e) => setFormData({...formData, id_proyecto: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Seleccionar proyecto</option>
                          {proyectos.map((proyecto) => (
                            <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                              {proyecto.nombre}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Código de Producto
                      </label>
                      <input
                        type="text"
                        value={formData.codigo_producto}
                        onChange={(e) => setFormData({...formData, codigo_producto: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SKU, código interno, etc."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Marca
                        </label>
                        <input
                          type="text"
                          value={formData.marca}
                          onChange={(e) => setFormData({...formData, marca: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Modelo
                        </label>
                        <input
                          type="text"
                          value={formData.modelo}
                          onChange={(e) => setFormData({...formData, modelo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información comercial */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Información Comercial</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Proveedor *
                      </label>
                      <ProveedorAutocomplete
                        value={formData.proveedor_info}
                        onChange={(proveedor) => setFormData({...formData, proveedor_info: proveedor})}
                        tipoSugerido={
                          formData.categoria === 'Material' ? 'Material' :
                          formData.categoria === 'Servicio' ? 'Servicio' :
                          formData.categoria === 'Equipo' ? 'Equipo' : 'Mixto'
                        }
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.cantidad}
                          onChange={(e) => setFormData({...formData, cantidad: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unidad de Medida *
                        </label>
                        <input
                          type="text"
                          value={formData.unidad_medida}
                          onChange={(e) => setFormData({...formData, unidad_medida: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="pz, kg, m, m2, etc."
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Unitario *
                      </label>
                      <div className="relative">
                        <FaDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.precio_unitario}
                          onChange={(e) => setFormData({...formData, precio_unitario: e.target.value})}
                          className="w-full pl-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      {formData.cantidad && formData.precio_unitario && (
                        <p className="text-sm text-gray-600 mt-1">
                          Total: {formatCurrency(parseFloat(formData.cantidad) * parseFloat(formData.precio_unitario))}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estado
                        </label>
                        <select
                          value={formData.estado}
                          onChange={(e) => setFormData({...formData, estado: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {Object.entries(ESTADOS_SUMINISTRO).map(([key, {label}]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha Necesaria
                        </label>
                        <input
                          type="date"
                          value={formData.fecha_necesaria}
                          onChange={(e) => setFormData({...formData, fecha_necesaria: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observaciones
                      </label>
                      <textarea
                        value={formData.observaciones}
                        onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Notas adicionales, especificaciones técnicas, etc."
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingSuministro ? 'Actualizar' : 'Crear'} Suministro
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suministros;
