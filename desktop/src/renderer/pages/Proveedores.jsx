import React, { useState, useEffect, useCallback } from 'react';
import { STANDARD_ICONS } from '../constants/icons';
import { 
  FaSearch, 
  FaFilter,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { formatCurrency } from '../utils/currency';
import { useToast } from '../contexts/ToastContext';
import { usePermissions } from '../contexts/PermissionsContext';
import api from '../services/api';

// Componentes
import ProveedorModal from '../components/proveedores/ProveedorModal';
import ProveedorDetailsModal from '../components/proveedores/ProveedorDetailsModal';
import DeleteConfirmModal from '../components/proveedores/DeleteConfirmModal';
import ProveedorDeactivateModal from '../components/proveedores/ProveedorDeactivateModal';
import ProveedorFilters from '../components/proveedores/ProveedorFilters';
import ProveedorCard from '../components/proveedores/ProveedorCard';
import ProveedorStats from '../components/proveedores/ProveedorStats';
import ProveedorTable from '../components/proveedores/ProveedorTable';
import Pagination from '../components/ui/Pagination';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import EmptyState from '../components/ui/EmptyState';

const TIPOS_PROVEEDOR = {
  'MATERIALES': 'Materiales',
  'SERVICIOS': 'Servicios',
  'EQUIPOS': 'Equipos',
  'MIXTO': 'Mixto',
  'TRANSPORTE': 'Transporte',
  'CONSTRUCCION': 'Construcción',
  'MANTENIMIENTO': 'Mantenimiento',
  'CONSULTORIA': 'Consultoría',
  'SUBCONTRATISTA': 'Subcontratista',
  'HERRAMIENTAS': 'Herramientas',
  'COMBUSTIBLE': 'Combustible',
  'ALIMENTACION': 'Alimentación'
};

const ESTADOS_PROVEEDOR = {
  true: { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  false: { label: 'Inactivo', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
};

const Proveedores = () => {
  // Estados principales
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  
  // Estados del modal
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [editingProveedor, setEditingProveedor] = useState(null);
  const [viewingProveedor, setViewingProveedor] = useState(null);
  const [deletingProveedor, setDeletingProveedor] = useState(null);
  const [deactivatingProveedor, setDeactivatingProveedor] = useState(null);
  const [suministrosData, setSuministrosData] = useState(null);
  const [deleteType, setDeleteType] = useState('deactivate'); // 'deactivate', 'activate', 'delete'
  const [isModalLoading, setIsModalLoading] = useState(false);
  
  // Estados de filtros
  const [filters, setFilters] = useState({
    tipo_proveedor: '',
    activo: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  
  // Estados de estadísticas
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Hooks
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const { hasPermission } = usePermissions();

  // Cargar proveedores
  const cargarProveedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (filters.tipo_proveedor) params.append('tipo_proveedor', filters.tipo_proveedor);
      if (filters.activo !== '') params.append('activo', filters.activo);
      if (filters.search || searchTerm) params.append('search', filters.search || searchTerm);
      
      const response = await api.getProveedores(params.toString());
      
      if (response.success) {
        setProveedores(response.data || []);
        
        // Calcular paginación
        const totalItems = response.data?.length || 0;
        const pages = Math.ceil(totalItems / itemsPerPage) || 1;
        setTotalPages(pages);
        
        // Ajustar página actual si es necesario
        if (currentPage > pages) {
          setCurrentPage(1);
        }
      } else {
        throw new Error(response.message || 'Error al cargar proveedores');
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error);
      setError(error.message);
      showError('Error', 'No se pudieron cargar los proveedores');
    } finally {
      setLoading(false);
    }
  }, [filters, searchTerm, itemsPerPage, currentPage, showError]);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    if (!hasPermission('proveedores.ver') || statsLoading) return;
    
    try {
      setStatsLoading(true);
      const response = await api.getProveedoresStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    } finally {
      setStatsLoading(false);
    }
  }, [hasPermission, statsLoading]);

  // Efectos
  useEffect(() => {
    cargarProveedores();
  }, [cargarProveedores]);

  useEffect(() => {
    if (showStats && !stats) {
      cargarEstadisticas();
    }
  }, [showStats, stats, cargarEstadisticas]);

  // Handlers del modal
  const handleOpenModal = useCallback((proveedor = null) => {
    setEditingProveedor(proveedor);
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
    setEditingProveedor(null);
    setIsModalLoading(false);
  }, []);

  // Handler para abrir modal de vista detallada (solo lectura)
  const handleOpenDetailsModal = useCallback((proveedor) => {
    setViewingProveedor(proveedor);
    setShowDetailsModal(true);
  }, []);

  // Handler para cerrar modal de vista detallada
  const handleCloseDetailsModal = useCallback(() => {
    setShowDetailsModal(false);
    setViewingProveedor(null);
  }, []);

  // Handler para abrir modal de confirmación de eliminación
  const handleOpenDeleteModal = useCallback((proveedor, type = 'deactivate') => {
    setDeletingProveedor(proveedor);
    setDeleteType(type);
    setShowDeleteModal(true);
  }, []);

  // Handler para cerrar modal de eliminación
  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setDeletingProveedor(null);
    setDeleteType('deactivate');
  }, []);

  // Handler para desactivar/reactivar proveedor
  const handleToggleProveedor = useCallback((proveedor) => {
    const type = proveedor.activo ? 'deactivate' : 'activate';
    handleOpenDeleteModal(proveedor, type);
  }, [handleOpenDeleteModal]);

  // Handler para eliminación definitiva
  const handlePermanentDelete = useCallback((proveedor) => {
    handleOpenDeleteModal(proveedor, 'delete');
  }, [handleOpenDeleteModal]);

  // Handlers para el modal de desactivación con suministros
  const handleCloseDeactivateModal = useCallback(() => {
    setShowDeactivateModal(false);
    setDeactivatingProveedor(null);
    setSuministrosData(null);
  }, []);

  const handleConfirmDeactivate = useCallback(async (proveedor, force = false) => {
    try {
      setIsModalLoading(true);
      
      const response = await api.deleteProveedor(proveedor.id_proveedor, { force });
      
      if (response.success) {
        showSuccess('Éxito', response.message);
        handleCloseDeactivateModal();
        cargarProveedores();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error al desactivar proveedor:', error);
      showError('Error', error.response?.data?.message || error.message || 'Error al desactivar proveedor');
    } finally {
      setIsModalLoading(false);
    }
  }, [showSuccess, showError, handleCloseDeactivateModal, cargarProveedores]);

  const handleSubmitProveedor = useCallback(async (proveedorData) => {
    console.log('🚀 [Proveedores] handleSubmitProveedor iniciado con datos:', proveedorData);
    try {
      setIsModalLoading(true);
      
      let response;
      if (editingProveedor) {
        console.log('✏️ [Proveedores] Actualizando proveedor existente:', editingProveedor.id_proveedor);
        // Actualizar proveedor
        response = await api.updateProveedor(editingProveedor.id_proveedor, proveedorData);
        if (response.success) {
          showSuccess('Éxito', 'Proveedor actualizado correctamente');
        }
      } else {
        console.log('➕ [Proveedores] Creando nuevo proveedor');
        // Crear proveedor
        response = await api.createProveedor(proveedorData);
        console.log('📡 [Proveedores] Respuesta de createProveedor:', response);
        if (response.success) {
          showSuccess('Éxito', 'Proveedor creado correctamente');
        }
      }
      
      if (response.success) {
        console.log('✅ [Proveedores] Operación exitosa, cerrando modal y recargando');
        handleCloseModal();
        cargarProveedores();
      } else {
        console.log('❌ [Proveedores] Respuesta no exitosa:', response.message);
        throw new Error(response.message || 'Error en la operación');
      }
    } catch (error) {
      console.error('❌ [Proveedores] Error guardando proveedor:', error);
      showError('Error', error.response?.data?.message || error.message || 'Error al guardar proveedor');
    } finally {
      setIsModalLoading(false);
    }
  }, [editingProveedor, showSuccess, showError, handleCloseModal, cargarProveedores]);

  // Handler para eliminar/desactivar proveedor (nueva versión mejorada)
  const handleConfirmAction = useCallback(async (proveedor) => {
    try {
      setIsModalLoading(true);
      let response;
      let message = '';
      
      switch (deleteType) {
        case 'delete':
          // Eliminación definitiva
          response = await api.deletePermanentProveedor(proveedor.id_proveedor);
          message = 'Proveedor eliminado definitivamente';
          break;
        case 'activate':
          // Reactivar proveedor
          response = await api.updateProveedor(proveedor.id_proveedor, { activo: true });
          message = 'Proveedor reactivado correctamente';
          break;
        default: // 'deactivate'
          // Desactivar proveedor
          response = await api.deleteProveedor(proveedor.id_proveedor);
          message = 'Proveedor desactivado correctamente';
          break;
      }
      
      if (response.success) {
        showSuccess('Éxito', message);
        handleCloseDeleteModal();
        cargarProveedores();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error en acción del proveedor:', error);
      
      // Manejar específicamente el caso de conflicto con suministros asociados
      const errorResponse = error.response?.data;
      if (error.response?.status === 409 && errorResponse?.hasAssociatedData) {
        // Cerrar modal actual y abrir modal especializado
        handleCloseDeleteModal();
        setSuministrosData(errorResponse);
        setDeactivatingProveedor(proveedor);
        setShowDeactivateModal(true);
        return;
      }
      
      // Manejar otros tipos de errores de suministros asociados
      if (errorResponse?.hasAssociatedData) {
        const suministrosCount = errorResponse.suministrosCount;
        showError(
          'No se puede proceder', 
          `🚫 El proveedor "${proveedor.nombre}" tiene ${suministrosCount} suministros registrados. 
          
          📋 Para continuar, debe:
          • Eliminar los suministros asociados
          • O transferirlos a otro proveedor
          
          ⚠️ Esta validación protege la integridad de los datos.`
        );
      } else {
        // Error genérico
        showError('Error', errorResponse?.message || error.message || 'Error en la operación');
      }
    } finally {
      setIsModalLoading(false);
    }
  }, [deleteType, showSuccess, showError, handleCloseDeleteModal, cargarProveedores]);

  // Handlers de filtros
  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetear a primera página
  }, []);

  const handleSearchChange = useCallback((searchValue) => {
    setSearchTerm(searchValue);
    setCurrentPage(1); // Resetear a primera página
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      tipo_proveedor: '',
      activo: '',
      search: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  }, []);

  // Datos paginados
  const proveedoresPaginados = React.useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return proveedores.slice(startIndex, endIndex);
  }, [proveedores, currentPage, itemsPerPage]);

  // Verificar permisos
  const canCreate = hasPermission('proveedores.crear');
  const canEdit = hasPermission('proveedores.editar');
  const canDelete = hasPermission('proveedores.eliminar');
  const canView = hasPermission('proveedores.ver');

  if (!canView) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Sin permisos
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            No tienes permisos para ver esta sección.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaBuilding className="text-red-500" />
              Proveedores
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona proveedores y sus datos de contacto
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Botón de estadísticas */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <FaCog className="w-4 h-4 mr-2" />
              Estadísticas
            </button>
            
            {/* Botón para cambiar vista */}
            <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200'
                }`}
              >
                Tabla
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 text-sm font-medium border-l border-gray-300 dark:border-gray-600 transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-red-500 text-white'
                    : 'bg-white dark:bg-dark-100 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-dark-200'
                }`}
              >
                Tarjetas
              </button>
            </div>

            {/* Botón crear */}
            {canCreate && (
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                <STANDARD_ICONS.CREATE className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {showStats && (
        <ProveedorStats 
          stats={stats}
          loading={statsLoading}
          onClose={() => setShowStats(false)}
        />
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Barra de búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar proveedores por nombre, razón social..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              showFilters
                ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-200 hover:bg-gray-50 dark:hover:bg-dark-300'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
          >
            <FaFilter className="w-4 h-4 mr-2" />
            Filtros
            {showFilters ? (
              <FaChevronUp className="w-4 h-4 ml-2" />
            ) : (
              <FaChevronDown className="w-4 h-4 ml-2" />
            )}
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <ProveedorFilters
            filters={filters}
            onFiltersChange={handleFilterChange}
            onClear={clearFilters}
            tipos={TIPOS_PROVEEDOR}
          />
        )}
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl p-6">
          <div className="flex items-center">
            <FaExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button
            onClick={cargarProveedores}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800 hover:bg-red-200 dark:hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reintentar
          </button>
        </div>
      ) : proveedores.length === 0 ? (
        <EmptyState
          icon={FaBuilding}
          title="No hay proveedores"
          description="No se encontraron proveedores con los criterios actuales."
          action={canCreate && {
            label: "Crear primer proveedor",
            onClick: () => handleOpenModal()
          }}
        />
      ) : (
        <>
          {/* Vista de tabla o tarjetas */}
          {viewMode === 'table' ? (
            <ProveedorTable
              proveedores={proveedoresPaginados}
              onEdit={canEdit ? handleOpenModal : null}
              onDelete={canDelete ? handleToggleProveedor : null}
              onDeletePermanent={canDelete ? handlePermanentDelete : null}
              onViewDetails={handleOpenDetailsModal}
              onView={handleOpenModal}
              loading={loading}
              estados={ESTADOS_PROVEEDOR}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {proveedoresPaginados.map((proveedor) => (
                <ProveedorCard
                  key={proveedor.id_proveedor}
                  proveedor={proveedor}
                  onEdit={canEdit ? handleOpenModal : null}
                  onDelete={canDelete ? handleToggleProveedor : null}
                  onDeletePermanent={canDelete ? handlePermanentDelete : null}
                  onViewDetails={handleOpenDetailsModal}
                  onView={handleOpenModal}
                  estados={ESTADOS_PROVEEDOR}
                />
              ))}
            </div>
          )}

          {/* Paginación */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={proveedores.length}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </>
      )}

      {/* Modal de Edición */}
      {showModal && (
        <ProveedorModal
          proveedor={editingProveedor}
          isOpen={showModal}
          onClose={handleCloseModal}
          onSave={handleSubmitProveedor}
          loading={isModalLoading}
          tipos={TIPOS_PROVEEDOR}
        />
      )}

      {/* Modal de Vista Detallada */}
      {showDetailsModal && (
        <ProveedorDetailsModal
          proveedor={viewingProveedor}
          onClose={handleCloseDetailsModal}
        />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && (
        <DeleteConfirmModal
          proveedor={deletingProveedor}
          type={deleteType}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmAction}
          loading={isModalLoading}
        />
      )}

      {/* Modal de Desactivación con Suministros */}
      {showDeactivateModal && (
        <ProveedorDeactivateModal
          proveedor={deactivatingProveedor}
          suministrosData={suministrosData}
          onClose={handleCloseDeactivateModal}
          onConfirm={handleConfirmDeactivate}
          loading={isModalLoading}
        />
      )}
    </div>
  );
};

export default Proveedores;
