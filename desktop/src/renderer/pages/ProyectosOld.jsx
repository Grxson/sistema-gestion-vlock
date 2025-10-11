import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import api from '../services/api';
import { formatDate } from '../utils/dateUtils';
import {
  RectangleGroupIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PauseCircleIcon,
  MapPinIcon,
  ChevronDownIcon,
  ArrowsUpDownIcon
} from '@heroicons/react/24/outline';

const Proyectos = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Estados principales
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedProyecto, setSelectedProyecto] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [proyectoToDelete, setProyectoToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, currentPage: 1 });
  
  // Estados para cambio de estado
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [proyectoForStatusChange, setProyectoForStatusChange] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    responsable: '',
    ubicacion: ''
  });

  const ESTADOS = {
    'Activo': { 
      label: 'Activo', 
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      icon: CheckCircleIcon
    },
    'Pausado': { 
      label: 'Pausado', 
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      icon: PauseCircleIcon
    },
    'Finalizado': { 
      label: 'Finalizado', 
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
      icon: XCircleIcon
    }
  };

  // Cargar proyectos con paginación
  const loadProyectos = async (page = currentPage, limit = itemsPerPage, filters = {}) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit,
        search: searchTerm,
        estado: selectedEstado,
        ...filters
      };

      const result = await api.getProyectos(params);
      
      if (result && result.success) {
        setProyectos(result.data || []);
        if (result.pagination) {
          setPaginationData({
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            currentPage: result.pagination.currentPage
          });
        } else {
          // Si no hay paginación, calcular manualmente
          const totalItems = result.data?.length || 0;
          setPaginationData({
            total: totalItems,
            totalPages: Math.ceil(totalItems / limit),
            currentPage: page
          });
        }
      } else {
        showError('Error al cargar proyectos');
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      showError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  // Efectos
  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        loadProyectos(1, itemsPerPage);
      } else {
        setCurrentPage(1);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedEstado]);

  useEffect(() => {
    loadProyectos(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  // Funciones de paginación
  const totalPages = paginationData.totalPages;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getPaginationInfo = () => {
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, paginationData.total);
    const end = Math.min(currentPage * itemsPerPage, paginationData.total);
    return {
      start,
      end,
      total: paginationData.total
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion?.trim() || null,
        responsable: formData.responsable?.trim() || null,
        ubicacion: formData.ubicacion?.trim() || null,
        fecha_inicio: formData.fecha_inicio || null,
        fecha_fin: formData.fecha_fin || null
      };

      if (editingProyecto) {
        const response = await api.updateProyecto(editingProyecto.id_proyecto, submitData);
        if (response.success) {
          await cargarProyectos();
          resetForm();
          setShowModal(false);
          showNotification('Proyecto actualizado exitosamente', 'success');
        } else {
          showNotification('Error al actualizar el proyecto', 'error');
        }
      } else {
        const response = await api.createProyecto(submitData);
        if (response.success) {
          await cargarProyectos();
          resetForm();
          setShowModal(false);
          showNotification('Proyecto creado exitosamente', 'success');
        } else {
          showNotification('Error al crear el proyecto', 'error');
        }
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      showNotification('Error al guardar el proyecto', 'error');
    }
  };

  const handleEdit = (proyecto) => {
    setEditingProyecto(proyecto);
    setFormData({
      nombre: proyecto.nombre || '',
      descripcion: proyecto.descripcion || '',
      fecha_inicio: proyecto.fecha_inicio || '',
      fecha_fin: proyecto.fecha_fin || '',
      estado: proyecto.estado || 'Activo',
      responsable: proyecto.responsable || '',
      ubicacion: proyecto.ubicacion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el proyecto "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      try {
        const response = await api.deleteProyecto(id);
        if (response.success) {
          await cargarProyectos();
          showNotification('Proyecto eliminado exitosamente', 'success');
        } else {
          showNotification(response.message || 'Error al eliminar el proyecto', 'error');
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification('Error al eliminar el proyecto', 'error');
      }
    }
  };

  const handleStatusChange = async (proyecto, nuevoEstado) => {
    try {
      const response = await api.updateProyecto(proyecto.id_proyecto, {
        ...proyecto,
        estado: nuevoEstado
      });
      
      if (response.success) {
        await cargarProyectos();
        showNotification(`Estado del proyecto cambiado a "${nuevoEstado}"`, 'success');
      } else {
        showNotification('Error al cambiar el estado del proyecto', 'error');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showNotification('Error al cambiar el estado del proyecto', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: 'Activo',
      responsable: '',
      ubicacion: ''
    });
    setEditingProyecto(null);
  };

  const proyectosFiltrados = proyectos.filter(proyecto => {
    const matchesSearch = proyecto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         proyecto.responsable?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !filtroEstado || proyecto.estado === filtroEstado;
    return matchesSearch && matchesEstado;
  });

  // Cálculos de paginación
  const totalPages = Math.ceil(proyectosFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const proyectosPaginados = proyectosFiltrados.slice(startIndex, endIndex);

  // Resetear página cuando cambien los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroEstado]);

  const getEstadoInfo = (estado) => {
    return ESTADOS[estado] || ESTADOS['Activo'];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-200 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <RectangleGroupIcon className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Proyectos
                </h1>
              </div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Gestión de proyectos y asignaciones
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nuevo Proyecto
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar proyectos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
              >
                <option value="">Todos los estados</option>
                <option value="Activo">Activo</option>
                <option value="Pausado">Pausado</option>
                <option value="Finalizado">Finalizado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="bg-white dark:bg-dark-100 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 border-b-0">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startIndex + 1} a {Math.min(endIndex, proyectosFiltrados.length)} de {proyectosFiltrados.length} proyectos
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Registros por página: {itemsPerPage}
              </div>
            </div>
          </div>
        </div>

        {/* Lista de proyectos */}
        <div className={`bg-white dark:bg-dark-100 shadow-sm border border-gray-200 dark:border-gray-700 border-t-0 ${proyectosFiltrados.length <= itemsPerPage ? '' : 'border-b-0'}`}>
          {proyectosFiltrados.length === 0 ? (
            <div className="p-8 text-center">
              <RectangleGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No se encontraron proyectos
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                {searchTerm || filtroEstado ? 'Intenta ajustar los filtros de búsqueda' : 'Comienza creando tu primer proyecto'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-dark-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Proyecto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Responsable
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Ubicación
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                  {proyectosPaginados.map((proyecto) => {
                    const estadoInfo = getEstadoInfo(proyecto.estado);
                    const IconEstado = estadoInfo.icon;
                    
                    return (
                      <tr key={proyecto.id_proyecto} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {proyecto.nombre}
                            </div>
                            {proyecto.descripcion && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {proyecto.descripcion}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <UserIcon className="h-4 w-4 mr-2" />
                            {proyecto.responsable || 'No asignado'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            {proyecto.fecha_inicio && (
                              <div className="text-gray-600 dark:text-gray-400">
                                Inicio: {formatDate(proyecto.fecha_inicio)}
                              </div>
                            )}
                            {proyecto.fecha_fin && (
                              <div className="text-gray-600 dark:text-gray-400">
                                Fin: {formatDate(proyecto.fecha_fin)}
                              </div>
                            )}
                            {!proyecto.fecha_inicio && !proyecto.fecha_fin && (
                              <span className="text-gray-400">Sin fechas</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.color}`}>
                              <IconEstado className="w-3 h-3 mr-1" />
                              {estadoInfo.label}
                            </span>
                            <select
                              value={proyecto.estado}
                              onChange={(e) => handleStatusChange(proyecto, e.target.value)}
                              className="text-xs border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                            >
                              <option value="Activo">Activo</option>
                              <option value="Pausado">Pausado</option>
                              <option value="Finalizado">Finalizado</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPinIcon className="h-4 w-4 mr-2" />
                            {proyecto.ubicacion || 'No especificada'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(proyecto)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Editar proyecto"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(proyecto.id_proyecto, proyecto.nombre)}
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              title="Eliminar proyecto"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
          
        )}
        
        {/* Paginación - siempre mostrar para mantener consistencia visual */}
        <div className={`bg-white dark:bg-dark-100 shadow-sm border border-gray-200 dark:border-gray-700 border-t-0 ${proyectosFiltrados.length <= itemsPerPage ? 'rounded-b-xl' : 'rounded-b-xl'}`}>
          <div className="px-6 py-4">
            {proyectosFiltrados.length > itemsPerPage ? (
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon className="h-4 w-4 mr-1" />
                  Anterior
                </button>
                
                <div className="flex items-center space-x-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    const isCurrentPage = page === currentPage;
                    
                    // Mostrar solo algunas páginas alrededor de la actual
                    if (totalPages > 7 && Math.abs(page - currentPage) > 2 && page !== 1 && page !== totalPages) {
                      if (page === currentPage - 3 || page === currentPage + 3) {
                        return <span key={page} className="px-2 text-gray-400">...</span>;
                      }
                      if (Math.abs(page - currentPage) > 2) {
                        return null;
                      }
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isCurrentPage
                            ? 'bg-primary-600 text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-300'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                  <ChevronRightIcon className="h-4 w-4 ml-1" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {proyectosFiltrados.length === 0 ? 'Sin resultados para mostrar' : `${proyectosFiltrados.length} proyecto${proyectosFiltrados.length !== 1 ? 's' : ''} en total`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl w-full max-w-lg">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nombre del Proyecto *
                    </label>
                    <input
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción
                    </label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de Inicio
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_inicio}
                        onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Fecha de Fin
                      </label>
                      <input
                        type="date"
                        value={formData.fecha_fin}
                        onChange={(e) => setFormData({...formData, fecha_fin: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.estado}
                      onChange={(e) => setFormData({...formData, estado: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    >
                      <option value="Activo">Activo</option>
                      <option value="Pausado">Pausado</option>
                      <option value="Finalizado">Finalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Responsable
                    </label>
                    <input
                      type="text"
                      value={formData.responsable}
                      onChange={(e) => setFormData({...formData, responsable: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ubicación
                    </label>
                    <input
                      type="text"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      {editingProyecto ? 'Guardar Cambios' : 'Crear Proyecto'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Notificaciones */}
        {notification && (
          <NotificationAlert
            message={notification.message}
            type={notification.type}
            onClose={() => setNotification(null)}
          />
        )}
      </div>
    </div>
  );
}
