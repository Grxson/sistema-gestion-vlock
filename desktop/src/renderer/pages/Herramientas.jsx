import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import { STANDARD_ICONS } from '../constants/icons';
import HerramientaModal from '../components/modals/HerramientaModal';
import MovimientoModal from '../components/modals/MovimientoModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import apiService from '../services/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon
} from '@heroicons/react/24/outline';

const Herramientas = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Estados principales
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedProyecto, setSelectedProyecto] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedHerramienta, setSelectedHerramienta] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [herramientaToDelete, setHerramientaToDelete] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Estados para modal de movimientos
  const [showMovimientoModal, setShowMovimientoModal] = useState(false);
  const [herramientaParaMovimiento, setHerramientaParaMovimiento] = useState(null);
  
  // Estados para datos de API
  const [categorias, setCategorias] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [paginationData, setPaginationData] = useState({ total: 0, totalPages: 1, currentPage: 1 });

  // Estados de herramientas (números del backend)
  const estadosHerramientas = {
    1: { label: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    2: { label: 'Prestado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    3: { label: 'Mantenimiento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    4: { label: 'Reparación', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    5: { label: 'Fuera de Servicio', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
  };





  // Función para cargar categorías
  const loadCategorias = async () => {
    try {
      console.log('Cargando categorías usando apiService...');
      const result = await apiService.getCategoriasHerramientas();
      console.log('Categorías cargadas:', result);
      if (result && result.success) {
        setCategorias(result.data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  // Función para cargar proyectos
  const loadProyectos = async () => {
    try {
      console.log('Cargando proyectos usando apiService...');
      const result = await apiService.getProyectos();
      console.log('Proyectos cargados:', result);
      if (result && result.success) {
        setProyectos(result.data || []);
      }
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  };



  // Cargar herramientas
  const loadHerramientas = async (page = currentPage, limit = itemsPerPage, filters = {}, isInitialLoad = false) => {
    if (isInitialLoad) {
      setLoading(true);
    } else {
      setTableLoading(true);
    }
    
    try {
      const params = { page, limit };
      if (debouncedSearchTerm) params.search = debouncedSearchTerm;
      if (selectedCategoria) params.categoria = selectedCategoria;
      if (selectedEstado) params.estado = selectedEstado;
      if (selectedProyecto) params.proyecto = selectedProyecto;
      
      console.log('Cargando herramientas usando apiService...', params);
      const result = await apiService.getHerramientas(params);
      console.log('Respuesta completa del API:', result);
      
      if (result && result.success) {
        console.log('Herramientas cargadas:', result.data);
        setHerramientas(result.data || []);
        // Guardar datos de paginación del API
        if (result.pagination) {
          setPaginationData({
            total: result.pagination.total,
            totalPages: result.pagination.totalPages,
            currentPage: result.pagination.currentPage
          });
        }
      } else {
        console.error('Error en la respuesta de la API:', result);
        setHerramientas([]);
      }
    } catch (error) {
      console.error('Error al cargar herramientas:', error);
      setHerramientas([]);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      } else {
        setTableLoading(false);
      }
    }
  };

  useEffect(() => {
    loadHerramientas(1, itemsPerPage, {}, true); // Carga inicial
    loadCategorias();
    loadProyectos();
  }, []);

  // Debounce para el término de búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms de delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reload data when filters change (usando el término con debounce)
  useEffect(() => {
    setCurrentPage(1);
    loadHerramientas(1, itemsPerPage, {}, false); // No es carga inicial
  }, [debouncedSearchTerm, selectedCategoria, selectedEstado, selectedProyecto]);

  // Con paginación del servidor, no necesitamos filtrar en el cliente
  const filteredHerramientas = herramientas;

  // Paginación usando datos del API
  const totalPages = paginationData.totalPages;
  const paginatedHerramientas = herramientas; // El API ya devuelve los datos paginados

  // Funciones para manejar paginación avanzada
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      loadHerramientas(newPage, itemsPerPage, {}, false);
    }
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Resetear a la primera página
    loadHerramientas(1, newItemsPerPage, {}, false);
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

  // Funciones de manejo
  const handleCreate = () => {
    setModalMode('create');
    setSelectedHerramienta(null);
    setShowModal(true);
  };

  const handleEdit = (herramienta) => {
    setModalMode('edit');
    setSelectedHerramienta(herramienta);
    setShowModal(true);
  };

  const handleView = (herramienta) => {
    setModalMode('view');
    setSelectedHerramienta(herramienta);
    setShowModal(true);
  };

  const handleDelete = (herramienta) => {
    setHerramientaToDelete(herramienta);
    setShowConfirmModal(true);
  };

  const handleMovimiento = (herramienta) => {
    setHerramientaParaMovimiento(herramienta);
    setShowMovimientoModal(true);
  };

  const confirmDelete = async () => {
    if (!herramientaToDelete) return;
    
    try {
      const herramientaId = herramientaToDelete.id_herramienta || herramientaToDelete.id;
      const herramientaNombre = herramientaToDelete.nombre;
      
      // Primero eliminar el historial de movimientos si existe
      try {
        const token = localStorage.getItem('token');
        await fetch(`http://localhost:4000/api/herramientas/${herramientaId}/movimientos`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (movError) {
        console.warn('Error al eliminar movimientos (continuando):', movError);
        // Continuamos aunque falle la eliminación de movimientos
      }
      
      // Luego eliminar la herramienta
      const response = await apiService.deleteHerramienta(herramientaId);
      
      if (response && response.success) {
        // Recargar la lista desde la API
        await loadHerramientas();
        showSuccess(
          '¡Herramienta eliminada!', 
          `La herramienta "${herramientaNombre}" y todo su historial han sido eliminados exitosamente.`
        );
      } else {
        console.error('Error al eliminar herramienta:', response);
        showError('Error al eliminar', response?.message || 'No se pudo eliminar la herramienta. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al eliminar herramienta:', error);
      showError('Error', 'Ocurrió un error al eliminar la herramienta. Intenta nuevamente.');
    }
    
    setShowConfirmModal(false);
    setHerramientaToDelete(null);
  };

    const handleSave = async (herramientaData, imageUploadCallback) => {
    try {
      let response;
      
      if (modalMode === 'create' || modalMode === 'duplicate') {
        response = await apiService.createHerramienta(herramientaData);
      } else if (modalMode === 'edit') {
        response = await apiService.updateHerramienta(selectedHerramienta.id_herramienta, herramientaData);
      }

      if (response && response.success) {
        // Manejar subida de imagen si existe callback
        let finalHerramienta = response.data;
        if (imageUploadCallback) {
          finalHerramienta = await imageUploadCallback(response.data);
        }

        // Recargar la lista completa desde la API para asegurar datos actualizados
        await loadHerramientas();

        // Mostrar mensaje de éxito
        if (modalMode === 'create' || modalMode === 'duplicate') {
          showSuccess('¡Herramienta creada!', `La herramienta "${herramientaData.nombre}" ha sido creada exitosamente.`);
        } else if (modalMode === 'edit') {
          showSuccess('¡Herramienta actualizada!', `La herramienta "${herramientaData.nombre}" ha sido actualizada exitosamente.`);
        }
      } else {
        showError('Error', response?.message || 'No se pudo guardar la herramienta. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al guardar herramienta:', error);
      showError('Error', 'Ocurrió un error al guardar la herramienta. Intenta nuevamente.');
    }
    
    setShowModal(false);
    setSelectedHerramienta(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHerramienta(null);
  };

  const handleMovimientoSave = async (movimientoData) => {
    showSuccess('¡Movimiento registrado!', 'El movimiento ha sido registrado exitosamente.');
    setShowMovimientoModal(false);
    setHerramientaParaMovimiento(null);
    // Recargar la lista de herramientas para actualizar el stock
    loadHerramientas();
  };

  // Función específica para refrescar datos (usada después de eliminar historial)
  const handleRefreshData = async () => {
    await loadHerramientas();
  };

  const getEstadoConfig = (estado) => {
    return estadosHerramientas[estado] || estadosHerramientas[1];
  };



  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inventario de Herramientas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona el inventario de herramientas y equipos de trabajo
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Herramienta
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="px-6 py-4 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar herramientas por nombre, código, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id_categoria_herr} value={categoria.id_categoria_herr}>
                  {categoria.nombre}
                </option>
              ))}
            </select>

            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los estados</option>
              <option value="1">Disponible</option>
              <option value="2">Prestado</option>
              <option value="3">Mantenimiento</option>
              <option value="4">Reparación</option>
              <option value="5">Fuera de Servicio</option>
            </select>

            <select
              value={selectedProyecto}
              onChange={(e) => setSelectedProyecto(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>


          </div>
        </div>
      </div>

      {/* Tabla de herramientas */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredHerramientas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/40 text-white">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Herramienta
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {tableLoading ? (
                  <tr>
                    <td colSpan="7" className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Buscando herramientas...
                        </span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedHerramientas.map((herramienta) => {
                  const estadoConfig = getEstadoConfig(herramienta.estado);
                  
                  return (
                    <tr key={herramienta.id_herramienta || herramienta.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-200">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {herramienta.nombre}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {herramienta.serial} • {herramienta.marca}
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {herramienta.categorias_herramientum?.nombre || 'Sin categoría'}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {herramienta.proyecto?.nombre || 'No asignado'}
                        </span>
                      </td>
                      

                      
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <span className={`font-medium ${herramienta.stock <= 5 ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {herramienta.stock || 0}
                            {herramienta.stock <= 5 && (
                              <span className="text-xs text-red-600 font-medium ml-2">⚠️</span>
                            )}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {herramienta.ubicacion}
                        </span>
                      </td>
                      
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleView(herramienta)}
                            className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors rounded"
                            title="Ver detalles"
                          >
                            <STANDARD_ICONS.VIEW className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleMovimiento(herramienta)}
                            className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-colors rounded"
                            title="Registrar movimiento"
                          >
                            <ArrowsRightLeftIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(herramienta)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded"
                            title="Editar herramienta"
                          >
                            <STANDARD_ICONS.EDIT className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(herramienta)}
                            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors rounded"
                            title="Eliminar herramienta"
                          >
                            <STANDARD_ICONS.DELETE className="h-4 w-4" />
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
        ) : (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {herramientas.length === 0 ? 'No hay herramientas registradas' : 'No se encontraron herramientas'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {herramientas.length === 0 
                ? 'Comienza agregando una nueva herramienta al inventario.'
                : 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
              }
            </p>
            <div className="mt-6 space-x-3">
              {herramientas.length === 0 ? (
                <button
                  onClick={handleCreate}
                  className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Nueva Herramienta
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategoria('');
                      setSelectedEstado('');
                      setSelectedProyecto('');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    Limpiar Filtros
                  </button>
                  <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Nueva Herramienta
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Componente de Paginación */}
      {paginationData.total > 0 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Información de registros */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <span>
              Mostrando {getPaginationInfo().start} a {getPaginationInfo().end} de {getPaginationInfo().total} registros
            </span>
            {(searchTerm || selectedCategoria || selectedEstado || selectedProyecto) && (
              <span className="ml-2 text-orange-600 dark:text-orange-400">
                (filtradas)
              </span>
            )}
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

      {/* Modal */}
      <HerramientaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        mode={modalMode}
        herramienta={selectedHerramienta}
        onSave={handleSave}
        onRefresh={handleRefreshData}
        proyectos={proyectos}
      />

      {/* Modal de Movimientos */}
      <MovimientoModal
        isOpen={showMovimientoModal}
        onClose={() => setShowMovimientoModal(false)}
        herramienta={herramientaParaMovimiento}
        proyectos={proyectos}
        onSave={handleMovimientoSave}
      />

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Herramienta"
        message={herramientaToDelete ? `¿Eliminar "${herramientaToDelete.nombre}"?\n\nEsta acción eliminará:\n• La herramienta\n• Todo su historial de movimientos\n• Todos los registros asociados\n\nEsta acción no se puede deshacer.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Herramientas;