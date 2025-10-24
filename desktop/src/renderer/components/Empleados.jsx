import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import PermissionGuard from './PermissionGuard';
import { usePermissions } from '../contexts/PermissionsContext';
import { useToast } from '../contexts/ToastContext';
import { useEmpleados } from '../contexts/EmpleadosContext';
import PermissionButton from './ui/PermissionButton';
import DateInput from './ui/DateInput';
import EmpleadoConfirmModal from './EmpleadoConfirmModal';
import AutoCompleteOficio from './ui/AutoCompleteOficio';
import AutoCompleteProyecto from './ui/AutoCompleteProyecto';
import EmpleadosGrid from './Empleados/EmpleadosGrid';
import { STANDARD_ICONS } from '../constants/icons';
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  BanknotesIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  Squares2X2Icon,
  ListBulletIcon
} from '@heroicons/react/24/outline';

export default function Empleados() {
  const { 
    empleados, 
    loading: empleadosLoading, 
    fetchEmpleados, 
    updateEmpleadoInList, 
    addEmpleadoToList, 
    removeEmpleadoFromList 
  } = useEmpleados();
  
  const [oficios, setOficios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [filters, setFilters] = useState({
    proyecto: '',
    oficio: '',
    activo: 'all'
  });
  
  // Estado para la vista (grid o lista) - se guarda en localStorage
  const [viewMode, setViewMode] = useState(() => {
    const savedView = localStorage.getItem('empleados_view_mode');
    return savedView || 'list'; // 'grid' o 'list'
  });
  const { hasPermission } = usePermissions();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  // Estados para modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'delete', // 'delete', 'delete-permanent', 'activate', 'deactivate'
    empleado: null
  });
  
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nss: '',
    rfc: '',
    telefono: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    banco: '',
    cuenta_bancaria: '',
    id_oficio: '',
    id_proyecto: '',
    pago_semanal: ''
  });

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      nss: '',
      rfc: '',
      telefono: '',
      contacto_emergencia: '',
      telefono_emergencia: '',
      banco: '',
      cuenta_bancaria: '',
      id_oficio: '',
      id_proyecto: '',
      pago_semanal: ''
    });
    setEditingEmpleado(null);
    setShowModal(false);
  };

  useEffect(() => {
    // Solo cargar datos auxiliares, los empleados se cargan automáticamente desde el contexto
    fetchOficios();
    fetchContratos();
    fetchProyectos();
  }, []);
  
  // Guardar preferencia de vista en localStorage
  useEffect(() => {
    localStorage.setItem('empleados_view_mode', viewMode);
  }, [viewMode]);
  
  // Soporte de teclado para el modal de crear/editar: ESC para cerrar
  useEffect(() => {
    if (!showModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        resetForm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showModal]);
  
  // Soporte de teclado para el modal de perfil: ESC para cerrar
  useEffect(() => {
    if (!showProfileModal) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowProfileModal(false);
        setSelectedEmpleado(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProfileModal]);

  // Los empleados se cargan automáticamente desde el contexto al inicializar
  
  const fetchOficios = async () => {
    try {
      const response = await apiService.get('/oficios');
      setOficios(response.oficios || []);
    } catch (error) {
      console.error('Error fetching oficios:', error);
    }
  };
  
  const fetchContratos = async () => {
    try {
      const response = await apiService.getContratos();
      setContratos(response.contratos || []);
    } catch (error) {
      console.error('Error fetching contratos:', error);
      setContratos([]); // Asegurar que contratos sea un array vacío en caso de error
    }
  };

  const fetchProyectos = async () => {
    try {
      const response = await apiService.get('/proyectos');
      setProyectos(response.data || []);
    } catch (error) {
      console.error('Error fetching proyectos:', error);
      setProyectos([]);
    }
  };

  // Refrescar empleados cuando cambien los filtros
  useEffect(() => {
    fetchEmpleados(filters).catch(error => {
      console.error('❌ [Empleados] Error al refrescar empleados:', error);
    });
  }, [filters, fetchEmpleados]);
  const validateForm = () => {
    if (!formData.nombre.trim()) {
      showError('Error de validación', 'El nombre es obligatorio');
      return false;
    }
    if (!formData.apellido.trim()) {
      showError('Error de validación', 'El apellido es obligatorio');
      return false;
    }
    
    // Validar que el pago semanal sea obligatorio
    if (!formData.pago_semanal || formData.pago_semanal <= 0) {
      showError('Error de validación', 'El pago semanal es obligatorio y debe ser mayor a 0');
      return false;
    }
    
    // Validar que el pago semanal sea un número válido
    if (isNaN(formData.pago_semanal)) {
      showError('Error de validación', 'El pago semanal debe ser un número válido');
      return false;
    }

    // Validar RFC si se proporciona
    if (formData.rfc && formData.rfc.trim() && (formData.rfc.length < 10 || formData.rfc.length > 13)) {
      showError('Error de validación', 'El RFC debe tener entre 10 y 13 caracteres');
      return false;
    }
    
    return true;
  };    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      try {
        // Verificar permisos según la operación
        const canCreate = hasPermission('empleados.crear');
        const canEdit = hasPermission('empleados.editar');
        
        if (editingEmpleado && !canEdit) {
          showError('Permisos insuficientes', 'No tienes permiso para editar empleados');
          return;
        }
        
        if (!editingEmpleado && !canCreate) {
          showError('Permisos insuficientes', 'No tienes permiso para crear empleados');
          return;
        }
        
        // Preparar datos para enviar al servidor
        const dataToSend = { ...formData };
        
        // Convertir campos vacíos a null para el backend
        Object.keys(dataToSend).forEach(key => {
          if (dataToSend[key] === '') {
            dataToSend[key] = null;
          }
        });
        
        let response;
        if (editingEmpleado) {
          response = await apiService.updateEmpleado(editingEmpleado.id_empleado, dataToSend);
        } else {
          response = await apiService.createEmpleado(dataToSend);
        }
        
        // Verificar que la respuesta sea exitosa
        if (response && (response.success || response.data)) {
          const empleadoData = response.data || response.empleado;
          
          // Actualizar el contexto global
          if (editingEmpleado) {
            updateEmpleadoInList(empleadoData);
          } else {
            addEmpleadoToList(empleadoData);
          }
          
          // Cerrar modal y reiniciar estado
          resetForm();
          showSuccess(
            editingEmpleado ? 'Empleado actualizado' : 'Empleado creado',
            editingEmpleado ? 'El empleado ha sido actualizado con éxito' : 'El empleado ha sido creado con éxito'
          );
        } else {
          showError('Error al guardar', 'No se pudo guardar la información del empleado');
        }
      } catch (error) {
        console.error('Error al guardar empleado:', error);
        showError(
          'Error al guardar',
          error.response?.data?.message || error.message || 'Ocurrió un error inesperado'
        );
      }
    };

  const handleViewProfile = (empleado) => {
    setSelectedEmpleado(empleado);
    setShowProfileModal(true);
  };

  const handleEdit = (empleado) => {
    setEditingEmpleado(empleado);
    setFormData({
      nombre: empleado.nombre || '',
      apellido: empleado.apellido || '',
      nss: empleado.nss || '',
      rfc: empleado.rfc || '',
      telefono: empleado.telefono || '',
      contacto_emergencia: empleado.contacto_emergencia || '',
      telefono_emergencia: empleado.telefono_emergencia || '',
      banco: empleado.banco || '',
      cuenta_bancaria: empleado.cuenta_bancaria || '',
      id_oficio: empleado.id_oficio || '',
      id_proyecto: empleado.id_proyecto || '',
      pago_semanal: empleado.pago_semanal || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const empleado = empleados.find(emp => emp.id_empleado === id);
    if (empleado) {
      setConfirmModal({
        isOpen: true,
        type: 'delete',
        empleado: empleado
      });
    }
  };

  const handleDeletePermanente = async (id) => {
    const empleado = empleados.find(emp => emp.id_empleado === id);
    if (empleado) {
      setConfirmModal({
        isOpen: true,
        type: 'delete-permanent',
        empleado: empleado
      });
    }
  };

  const handleActivar = async (id) => {
    const empleado = empleados.find(emp => emp.id_empleado === id);
    if (empleado) {
      setConfirmModal({
        isOpen: true,
        type: 'activate',
        empleado: empleado
      });
    }
  };

  const handleDesactivar = async (id) => {
    const empleado = empleados.find(emp => emp.id_empleado === id);
    if (empleado) {
      setConfirmModal({
        isOpen: true,
        type: 'deactivate',
        empleado: empleado
      });
    }
  };

  // Función para confirmar las acciones del modal
  const handleConfirmAction = async (empleadoId) => {
    try {
      const { type } = confirmModal;
      
      switch (type) {
        case 'delete':
          const response = await apiService.deleteEmpleado(empleadoId);
          if (response.success) {
            showSuccess('Empleado dado de baja', 'El empleado ha sido dado de baja exitosamente');
            fetchEmpleados();
          } else {
            showError('Error al dar de baja', response.message || 'No se pudo dar de baja el empleado');
          }
          break;
          
        case 'delete-permanent':
          const responsePermanent = await apiService.deleteEmpleadoPermanente(empleadoId);
          if (responsePermanent.success) {
            showSuccess('Empleado eliminado permanentemente', 'El empleado ha sido eliminado completamente del sistema');
            fetchEmpleados();
          } else {
            showError('Error al eliminar permanentemente', responsePermanent.message || 'No se pudo eliminar el empleado');
          }
          break;
          
        case 'activate':
          await apiService.patch(`/empleados/${empleadoId}/activar`);
          showSuccess('Empleado activado', 'El empleado ha sido activado exitosamente');
          fetchEmpleados();
          break;
          
        case 'deactivate':
          await apiService.patch(`/empleados/${empleadoId}/desactivar`);
          showSuccess('Empleado desactivado', 'El empleado ha sido desactivado exitosamente');
          fetchEmpleados();
          break;
      }
    } catch (error) {
      console.error('Error en acción:', error);
      const actions = {
        delete: 'dar de baja',
        'delete-permanent': 'eliminar permanentemente',
        activate: 'activar',
        deactivate: 'desactivar'
      };
      showError(`Error al ${actions[confirmModal.type]} empleado`, error.response?.data?.message || error.message);
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({
      isOpen: false,
      type: 'delete',
      empleado: null
    });
  };

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empleado.oficio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.nss?.includes(searchTerm) ||
    (empleado.contrato?.tipo_contrato || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empleado.proyecto?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );



  if (empleadosLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Empleados</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona la información de los empleados
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle de vista */}
          <div className="flex items-center bg-gray-100 dark:bg-dark-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Vista de lista"
            >
              <ListBulletIcon className="h-4 w-4 mr-1.5" />
              Lista
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-dark-100 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Vista de cuadrícula"
            >
              <Squares2X2Icon className="h-4 w-4 mr-1.5" />
              Grid
            </button>
          </div>
          
          <PermissionButton 
            permissionCode="empleados.crear"
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm hover:shadow-md"
            disabledMessage="No tienes permiso para crear empleados"
          >
            <STANDARD_ICONS.CREATE className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </PermissionButton>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
            placeholder="Buscar empleados..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Proyecto
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.proyecto}
              onChange={(e) => setFilters({...filters, proyecto: e.target.value})}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map(proyecto => (
                <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                  {proyecto.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por Oficio
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.oficio}
              onChange={(e) => setFilters({...filters, oficio: e.target.value})}
            >
              <option value="">Todos los oficios</option>
              {oficios.map(oficio => (
                <option key={oficio.id_oficio} value={oficio.id_oficio}>
                  {oficio.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              value={filters.activo}
              onChange={(e) => setFilters({...filters, activo: e.target.value})}
            >
              <option value="all">Todos</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vista condicional: Grid o Lista */}
      {viewMode === 'grid' ? (
        <EmpleadosGrid
          empleados={filteredEmpleados}
          onViewProfile={handleViewProfile}
          onEdit={handleEdit}
          onActivar={handleActivar}
          onDesactivar={handleDesactivar}
          onDeletePermanente={handleDeletePermanente}
        />
      ) : (
        <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredEmpleados.map((empleado) => (
            <li key={empleado.id_empleado}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-dark-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <UserIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {empleado.nombre} {empleado.apellido}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          empleado.activo 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {empleado.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{empleado.oficio?.nombre || 'Sin oficio'}</p>
                      <div className="flex space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>NSS: {empleado.nss || 'No registrado'}</span>
                        <span>RFC: {empleado.rfc || 'No registrado'}</span>
                      </div>
                      {empleado.proyecto && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">Proyecto: {empleado.proyecto.nombre}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      {empleado.contrato?.tipo_contrato || 'Sin contrato'}
                    </p>
                    
                    {/* Mostrar salario del contrato o pago semanal */}
                    {empleado.contrato?.salario_diario ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        ${parseFloat(empleado.contrato.salario_diario).toLocaleString()}/día (contrato)
                      </p>
                    ) : empleado.pago_semanal ? (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        ${parseFloat(empleado.pago_semanal).toLocaleString()}/semana (independiente)
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        Sin salario definido
                      </p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(empleado)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Ver perfil"
                      >
                        <STANDARD_ICONS.VIEW className="w-4 h-4" />
                      </button>
                      
                      <PermissionButton
                        permissionCode="empleados.editar"
                        onClick={() => handleEdit(empleado)}
                        className="bg-transparent hover:bg-transparent text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                        disabledMessage="No tienes permiso para editar empleados"
                      >
                        <STANDARD_ICONS.EDIT className="h-4 w-4" />
                      </PermissionButton>
                      
                      {/* Botones de activar/desactivar */}
                      {empleado.activo ? (
                        <PermissionButton
                          permissionCode="empleados.editar"
                          onClick={() => handleDesactivar(empleado.id_empleado)}
                          className="bg-transparent hover:bg-transparent text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300 p-1"
                          disabledMessage="No tienes permiso para desactivar empleados"
                        >
                          <STANDARD_ICONS.DEACTIVATE className="h-4 w-4" />
                        </PermissionButton>
                      ) : (
                        <PermissionButton
                          permissionCode="empleados.editar"
                          onClick={() => handleActivar(empleado.id_empleado)}
                          className="bg-transparent hover:bg-transparent text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1"
                          disabledMessage="No tienes permiso para activar empleados"
                        >
                          <STANDARD_ICONS.ACTIVATE className="h-4 w-4" />
                        </PermissionButton>
                      )}
                      
                      
                      
                      {/* Botón de eliminación permanente */}
                      <PermissionButton
                        permissionCode="empleados.eliminar"
                        onClick={() => handleDeletePermanente(empleado.id_empleado)}
                        className="bg-transparent hover:bg-transparent text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                        disabledMessage="No tienes permiso para eliminar empleados permanentemente"
                        title="Eliminar permanentemente"
                      >
                        <STANDARD_ICONS.DELETE className="h-4 w-4" />
                      </PermissionButton>
                    </div>
                  </div>
                </div>
              </div>
            </li>
            ))}
          </ul>
          
          {filteredEmpleados.length === 0 && (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay empleados</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {empleados.length === 0 ? 'Cargando empleados...' : 'No se encontraron empleados con los filtros aplicados.'}
              </p>
              {empleados.length > 0 && (
                <p className="mt-1 text-xs text-gray-400">
                  Total de empleados: {empleados.length}
                </p>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Estado vacío para vista grid */}
      {viewMode === 'grid' && filteredEmpleados.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-dark-100 rounded-lg border border-gray-200 dark:border-gray-700">
          <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">No hay empleados</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {empleados.length === 0 ? 'Cargando empleados...' : 'No se encontraron empleados con los filtros aplicados.'}
          </p>
          {empleados.length > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              Total de empleados: {empleados.length}
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-3xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Datos personales</h4>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.nombre}
                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Apellido</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.apellido}
                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información de contacto</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NSS</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.nss}
                        onChange={(e) => setFormData({...formData, nss: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">RFC</label>
                      <input
                        type="text"
                        maxLength="13"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 uppercase"
                        value={formData.rfc}
                        onChange={(e) => setFormData({...formData, rfc: e.target.value.toUpperCase()})}
                        placeholder="RFC123456789"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Opcional - Entre 10 y 13 caracteres
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                      <input
                        type="tel"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.telefono}
                        onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contacto de emergencia</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.contacto_emergencia}
                        onChange={(e) => setFormData({...formData, contacto_emergencia: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono de emergencia</label>
                    <input
                      type="tel"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.telefono_emergencia}
                      onChange={(e) => setFormData({...formData, telefono_emergencia: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información bancaria</h4>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Banco</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.banco}
                        onChange={(e) => setFormData({...formData, banco: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cuenta bancaria</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.cuenta_bancaria}
                        onChange={(e) => setFormData({...formData, cuenta_bancaria: e.target.value})}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información laboral</h4>
                  
                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Oficio</label>
                      <AutoCompleteOficio
                        value={formData.id_oficio}
                        onChange={(id_oficio) => setFormData({...formData, id_oficio})}
                        placeholder="Buscar o crear oficio..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Proyecto</label>
                      <AutoCompleteProyecto
                        value={formData.id_proyecto}
                        onChange={(id_proyecto) => setFormData({...formData, id_proyecto})}
                        placeholder="Buscar o crear proyecto..."
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pago Semanal
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Ej: 3500.00"
                      value={formData.pago_semanal}
                      onChange={(e) => setFormData({...formData, pago_semanal: e.target.value})}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Especificar el pago semanal del empleado
                    </p>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingEmpleado(null);
                      setFormData({
                        nombre: '',
                        apellido: '',
                        nss: '',
                        telefono: '',
                        contacto_emergencia: '',
                        telefono_emergencia: '',
                        banco: '',
                        cuenta_bancaria: '',
                        id_oficio: '',
                        id_proyecto: '',
                        pago_semanal: ''
                      });
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingEmpleado ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Perfil */}
      {showProfileModal && selectedEmpleado && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-2xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                  Perfil de {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedEmpleado.activo 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}>
                  {selectedEmpleado.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              
              <div className="space-y-6">
                {/* Datos personales */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Datos personales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nombre completo</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.nombre} {selectedEmpleado.apellido}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">NSS</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.nss || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">RFC</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.rfc || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información de contacto</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.telefono || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contacto de emergencia</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.contacto_emergencia || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Teléfono de emergencia</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.telefono_emergencia || 'No registrado'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información bancaria */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información bancaria</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Banco</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.banco || 'No registrado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Cuenta bancaria</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.cuenta_bancaria || 'No registrada'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Información laboral */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-3">Información laboral</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Oficio</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.oficio?.nombre || 'Sin oficio'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Proyecto</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.proyecto?.nombre || 'Sin proyecto asignado'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contrato</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.contrato?.tipo_contrato || 'Sin contrato'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Salario/Pago semanal</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedEmpleado.contrato?.salario_diario 
                          ? `$${parseFloat(selectedEmpleado.contrato.salario_diario).toLocaleString()}/día (contrato)`
                          : selectedEmpleado.pago_semanal 
                            ? `$${parseFloat(selectedEmpleado.pago_semanal).toLocaleString()}/semana (independiente)`
                            : 'Sin salario definido'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileModal(false);
                    setSelectedEmpleado(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <EmpleadoConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleConfirmAction}
        empleado={confirmModal.empleado}
        type={confirmModal.type}
      />
    </div>
  );
}
