import React, { useState, useEffect } from 'react';
import { useToast } from '../contexts/ToastContext';
import { 
  RectangleGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import api from '../services/api';

const ESTADOS = {
  'Activo': {
    label: 'Activo',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    icon: CheckCircleIcon
  },
  'Pausado': {
    label: 'Pausado',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    icon: ClockIcon
  },
  'Finalizado': {
    label: 'Finalizado',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    icon: XCircleIcon
  }
};

const Proyectos = () => {
  // Estados principales
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  
  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: 'Activo',
    responsable: '',
    ubicacion: ''
  });

  // Estados de confirmación
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'danger'
  });

  const { showSuccess, showError } = useToast();

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Cargar todos los proyectos (sin filtros del servidor)
  const loadProyectos = async () => {
    setLoading(true);
    try {
      const result = await api.getProyectos();
      
      if (result && result.success) {
        setProyectos(result.data || []);
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

  // Efecto para resetear la página cuando cambien los filtros o búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedEstado]);

  // Funciones de filtros y búsqueda
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEstadoChange = (event) => {
    setSelectedEstado(event.target.value);
  };

  const handleLimpiarFiltros = () => {
    setSearchTerm('');
    setSelectedEstado('');
    setCurrentPage(1);
  };

  // Funciones de paginación
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Funciones del formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
          await loadProyectos();
          resetForm();
          setShowModal(false);
          showSuccess('Proyecto actualizado exitosamente');
        } else {
          showError('Error al actualizar el proyecto');
        }
      } else {
        const response = await api.createProyecto(submitData);
        if (response.success) {
          await loadProyectos();
          resetForm();
          setShowModal(false);
          showSuccess('Proyecto creado exitosamente');
        } else {
          showError('Error al crear el proyecto');
        }
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
      showError('Error al guardar el proyecto');
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

  const handleDelete = (proyecto) => {
    setConfirmModal({
      show: true,
      title: 'Confirmar eliminación',
      message: `¿Estás seguro de que deseas eliminar el proyecto "${proyecto.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: () => confirmDelete(proyecto.id_proyecto),
      type: 'danger'
    });
  };

  const confirmDelete = async (id) => {
    try {
      const response = await api.deleteProyecto(id);
      if (response.success) {
        await loadProyectos();
        showSuccess('Proyecto eliminado exitosamente');
      } else {
        showError(response.message || 'Error al eliminar el proyecto');
      }
    } catch (error) {
      console.error('Error al eliminar:', error);
      showError('Error al eliminar el proyecto');
    } finally {
      setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'danger' });
    }
  };

  const handleStatusChange = (proyecto, nuevoEstado) => {
    setConfirmModal({
      show: true,
      title: 'Confirmar cambio de estado',
      message: `¿Deseas cambiar el estado del proyecto "${proyecto.nombre}" a "${nuevoEstado}"?`,
      onConfirm: () => confirmStatusChange(proyecto, nuevoEstado),
      type: 'warning'
    });
  };

  const confirmStatusChange = async (proyecto, nuevoEstado) => {
    try {
      const response = await api.updateProyecto(proyecto.id_proyecto, {
        ...proyecto,
        estado: nuevoEstado
      });
      
      if (response.success) {
        await loadProyectos();
        showSuccess(`Estado del proyecto cambiado a "${nuevoEstado}"`);
      } else {
        showError('Error al cambiar el estado del proyecto');
      }
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      showError('Error al cambiar el estado del proyecto');
    } finally {
      setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'warning' });
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

  const getEstadoInfo = (estado) => {
    return ESTADOS[estado] || ESTADOS['Activo'];
  };

  // Cálculos de paginación
  // Filtrado local de proyectos (búsqueda en tiempo real)
  const filteredProyectos = proyectos.filter(proyecto => {
    const matchesSearch = !searchTerm || 
      proyecto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proyecto.descripcion?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEstado = !selectedEstado || proyecto.estado === selectedEstado;
    
    return matchesSearch && matchesEstado;
  });

  // Calcular paginación basada en proyectos filtrados
  const totalFilteredItems = filteredProyectos.length;
  const calculatedTotalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  
  // Actualizar totalPages si es diferente
  if (calculatedTotalPages !== totalPages) {
    setTotalPages(calculatedTotalPages);
  }
  
  // Asegurar que currentPage esté dentro del rango válido
  const validCurrentPage = Math.max(1, Math.min(currentPage, calculatedTotalPages || 1));
  if (validCurrentPage !== currentPage) {
    setCurrentPage(validCurrentPage);
  }
  
  // Aplicar paginación a los proyectos filtrados
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProyectos = filteredProyectos.slice(startIndex, endIndex);

  const getPaginationInfo = () => {
    const start = Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems);
    const end = Math.min(currentPage * itemsPerPage, totalFilteredItems);
    return { start, end, total: totalFilteredItems };
  };

  const paginationInfo = getPaginationInfo();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 p-6">
      <div className="w-full max-w-none mx-auto">
        
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
                  placeholder="Buscar proyectos por nombre, responsable o ubicación..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <select
              value={selectedEstado}
              onChange={handleEstadoChange}
              className="px-3 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors"
            >
              <option value="">Todos los estados</option>
              <option value="Activo">Activo</option>
              <option value="Pausado">Pausado</option>
              <option value="Finalizado">Finalizado</option>
            </select>
            <button
              onClick={handleLimpiarFiltros}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Tabla de proyectos */}
        <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedProyectos.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center">
                      <RectangleGroupIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-500 dark:text-gray-400 text-lg">
                        {searchTerm || selectedEstado ? 'No se encontraron proyectos con los filtros aplicados' : 'No hay proyectos registrados'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginatedProyectos.map((proyecto) => {
                    const estadoInfo = getEstadoInfo(proyecto.estado);
                    const IconEstado = estadoInfo.icon;
                    
                    return (
                      <tr key={proyecto.id_proyecto} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                              <RectangleGroupIcon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="text-base font-medium text-gray-900 dark:text-white">
                                {proyecto.nombre}
                              </div>
                              {proyecto.descripcion && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">
                                  {proyecto.descripcion}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="font-medium">{proyecto.responsable || 'No asignado'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm space-y-2">
                            {proyecto.fecha_inicio && (
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="text-xs text-gray-400">Inicio</div>
                                  <div className="font-medium">{formatDate(proyecto.fecha_inicio)}</div>
                                </div>
                              </div>
                            )}
                            {proyecto.fecha_fin && (
                              <div className="flex items-center text-gray-600 dark:text-gray-400">
                                <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                <div>
                                  <div className="text-xs text-gray-400">Fin</div>
                                  <div className="font-medium">{formatDate(proyecto.fecha_fin)}</div>
                                </div>
                              </div>
                            )}
                            {!proyecto.fecha_inicio && !proyecto.fecha_fin && (
                              <span className="text-sm text-gray-400">Sin fechas</span>
                            )}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col items-start space-y-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${estadoInfo.color}`}>
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
                        <td className="px-8 py-6">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                            <span className="font-medium">{proyecto.ubicacion || 'No especificada'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => window.navigateApp && window.navigateApp(`/proyectos/${proyecto.id_proyecto}`)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                              title="Ver detalles"
                            >
                              <EyeIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleEdit(proyecto)}
                              className="text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 p-2 hover:bg-amber-50 dark:hover:bg-amber-900/30 rounded-lg transition-colors duration-200"
                              title="Editar"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(proyecto)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          
          {/* Paginación integrada */}
          {totalFilteredItems > 0 && (
            <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Información de registros */}
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando {paginationInfo.start} a {paginationInfo.end} de {paginationInfo.total} resultados
              </div>
              
              {/* Controles de paginación */}
              <div className="flex items-center gap-4">
                {/* Selector de items por página */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-700 dark:text-gray-300">
                    Registros por página:
                  </label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
                
                {/* Navegación de páginas */}
                <div className="flex items-center gap-2">
                  {/* Botón Primera página */}
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Primera
                  </button>
                  
                  {/* Botón Anterior */}
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  
                  {/* Números de página */}
                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                      
                      // Ajustar si estamos cerca del final
                      if (endPage - startPage < maxVisible - 1) {
                        startPage = Math.max(1, endPage - maxVisible + 1);
                      }
                      
                      for (let i = startPage; i <= endPage; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => handlePageChange(i)}
                            className={`px-3 py-1 text-sm border rounded-md ${
                              i === currentPage
                                ? 'bg-indigo-600 border-indigo-600 text-white'
                                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </div>
                  
                  {/* Botón Siguiente */}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                  
                  {/* Botón Última página */}
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Última
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmModal.show}
        onClose={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'danger' })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />

      {/* Modal de formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingProyecto ? 'Editar Proyecto' : 'Nuevo Proyecto'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre del proyecto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Descripción
                </label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de inicio
                  </label>
                  <input
                    type="date"
                    name="fecha_inicio"
                    value={formData.fecha_inicio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fecha de fin
                  </label>
                  <input
                    type="date"
                    name="fecha_fin"
                    value={formData.fecha_fin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsable
                  </label>
                  <input
                    type="text"
                    name="responsable"
                    value={formData.responsable}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                  >
                    <option value="Activo">Activo</option>
                    <option value="Pausado">Pausado</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-dark-200 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  {editingProyecto ? 'Actualizar' : 'Crear'} Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Proyectos;