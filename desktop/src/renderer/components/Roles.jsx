import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import PermissionDenied from './PermissionDenied';
import { STANDARD_ICONS } from '../constants/icons';
import {
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  LockOpenIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [acciones, setAcciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showPermisosModal, setShowPermisosModal] = useState(false);
  const [editingRol, setEditingRol] = useState(null);
  const [selectedRol, setSelectedRol] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [permisosData, setPermisosData] = useState([]);
  const [errors, setErrors] = useState({});
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchAcciones();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await apiService.getRoles();
      setRoles(response.roles || []);
      setPermissionDenied(false);
    } catch (error) {
      console.error('Error fetching roles:', error);
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permiso para ver los roles');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAcciones = async () => {
    try {
      const response = await apiService.getAccionesPermiso();
      setAcciones(response.acciones || []);
    } catch (error) {
      console.error('Error fetching acciones:', error);
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permiso para acceder a las acciones');
      }
    }
  };
  
  const fetchPermisosRol = async (idRol) => {
    try {
      const response = await apiService.getPermisosRol(idRol);
      return response.permisos || [];
    } catch (error) {
      console.error('Error fetching permisos:', error);
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permiso para ver los permisos de este rol');
      }
      return [];
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre) {
      newErrors.nombre = 'El nombre del rol es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      if (editingRol) {
        await apiService.updateRol(editingRol.id_rol, formData);
      } else {
        await apiService.createRol(formData);
      }

      fetchRoles();
      setShowModal(false);
      setEditingRol(null);
      setFormData({
        nombre: '',
        descripcion: ''
      });
      setErrors({});
    } catch (error) {
      console.error('Error saving rol:', error);
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permiso para modificar roles');
        setShowModal(false);
      } else {
        alert('Error al guardar rol: ' + error.message);
      }
    }
  };

  const handleEdit = (rol) => {
    setEditingRol(rol);
    setFormData({
      nombre: rol.nombre || '',
      descripcion: rol.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este rol?')) {
      try {
        await apiService.deleteRol(id);
        fetchRoles();
      } catch (error) {
        console.error('Error deleting rol:', error);
        if (error.status === 403) {
          setPermissionDenied(true);
          setErrorMessage(error.message || 'No tienes permiso para eliminar roles');
        } else {
          alert('Error al eliminar rol: ' + error.message);
        }
      }
    }
  };

  const handleOpenPermisosModal = async (rol) => {
    setSelectedRol(rol);
    setLoading(true);
    
    try {
      const permisos = await fetchPermisosRol(rol.id_rol);
      
      // Crear un mapa de id_accion -> permiso para facilitar la búsqueda
      const permisosMap = {};
      permisos.forEach(permiso => {
        permisosMap[permiso.id_accion] = permiso;
      });
      
      // Crear array de permisos con todas las acciones disponibles
      const permisosCompletos = acciones.map(accion => {
        const permisoExistente = permisosMap[accion.id_accion];
        return {
          id_accion: accion.id_accion,
          nombre: accion.nombre,
          codigo: accion.codigo,
          descripcion: accion.descripcion,
          modulo: accion.modulo,
          permitido: permisoExistente ? permisoExistente.permitido : false,
          id_permiso: permisoExistente ? permisoExistente.id_permiso : null
        };
      });
      
      setPermisosData(permisosCompletos);
      setShowPermisosModal(true);
    } catch (error) {
      console.error('Error loading permisos:', error);
      alert('Error al cargar permisos: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermiso = (idAccion) => {
    setPermisosData(prevPermisos => {
      const updatedPermisos = prevPermisos.map(permiso => {
        if (permiso.id_accion === idAccion) {
          // Asegurarse de que estamos manejando un valor booleano
          const nuevoValor = permiso.permitido === true ? false : true;
          return { ...permiso, permitido: nuevoValor };
        }
        return permiso;
      });
      
      return updatedPermisos;
    });
  };
  
  // Nueva función para alternar todos los permisos de un módulo
  const handleToggleModulo = (modulo, nuevoEstado) => {
    // Confirmar antes de cambiar todos los permisos
    const mensaje = nuevoEstado 
      ? `¿Estás seguro de permitir todos los permisos del módulo "${modulo}"?`
      : `¿Estás seguro de denegar todos los permisos del módulo "${modulo}"?`;
      
    if (window.confirm(mensaje)) {
      setPermisosData(prevPermisos => {
        const updatedPermisos = prevPermisos.map(permiso => {
          if (permiso.modulo === modulo) {
            return { ...permiso, permitido: nuevoEstado };
          }
          return permiso;
        });
              
        return updatedPermisos;
      });
    }
  };
  
  // Función para verificar el estado actual del módulo
  const getModuloStatus = (modulo) => {
    const permisos = accionesPorModulo[modulo] || [];
    
    // Si todos los permisos del módulo están permitidos
    const todosPermitidos = permisos.every(permiso => permiso.permitido === true);
    
    // Si todos los permisos del módulo están denegados
    const todosDenegados = permisos.every(permiso => permiso.permitido === false);
    
    // Si hay mezcla de permisos
    const mixto = !todosPermitidos && !todosDenegados;
    
    // Contar permisos permitidos
    const permitidosCount = permisos.filter(permiso => permiso.permitido === true).length;
    const totalPermisos = permisos.length;
    
    return { 
      todosPermitidos, 
      todosDenegados, 
      mixto, 
      permitidosCount,
      totalPermisos 
    };
  };

  const handleSavePermisos = async () => {
    try {
      // Asegúrate de que se envíen los permisos con el estado correcto
      const permisosToSave = permisosData.map(permiso => ({
        id_accion: permiso.id_accion,
        permitido: permiso.permitido
      }));
      
      await apiService.updatePermisosRol(selectedRol.id_rol, permisosToSave);
      
      // Actualiza la lista de roles para reflejar los cambios
      await fetchRoles();
      
      setShowPermisosModal(false);
      setSelectedRol(null);
      alert('Permisos actualizados correctamente');
    } catch (error) {
      console.error('Error saving permisos:', error);
      if (error.status === 403) {
        setPermissionDenied(true);
        setErrorMessage(error.message || 'No tienes permiso para modificar permisos de roles');
        setShowPermisosModal(false);
        setSelectedRol(null);
      } else {
        alert('Error al guardar permisos: ' + error.message);
      }
    }
  };

  // Agrupar acciones por módulo para mostrarlas organizadas
  const accionesPorModulo = permisosData.reduce((acc, permiso) => {
    if (!acc[permiso.modulo]) {
      acc[permiso.modulo] = [];
    }
    acc[permiso.modulo].push(permiso);
    return acc;
  }, {});

  const filteredRoles = roles.filter(rol =>
    rol.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rol.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !showPermisosModal) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (permissionDenied) {
    return <PermissionDenied message={errorMessage} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Roles y Permisos</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los roles y asigna permisos específicos
          </p>
        </div>
        <button
          onClick={() => {
            setEditingRol(null);
            setFormData({
              nombre: '',
              descripcion: ''
            });
            setErrors({});
            setShowModal(true);
          }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
        >
          <STANDARD_ICONS.CREATE className="h-4 w-4 mr-2" />
          Nuevo Rol
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-colors duration-200"
          placeholder="Buscar roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredRoles.map((rol) => (
            <li key={rol.id_rol}>
              <div className="px-4 py-4 sm:px-6 hover:bg-gray-50 dark:hover:bg-dark-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {rol.nombre}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {rol.descripcion || 'Sin descripción'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleOpenPermisosModal(rol)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Gestionar permisos"
                    >
                      <LockOpenIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(rol)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                      title="Editar"
                    >
                      <STANDARD_ICONS.EDIT className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(rol.id_rol)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Eliminar"
                    >
                      <STANDARD_ICONS.DELETE className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredRoles.length === 0 && (
          <div className="text-center py-12">
            <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay roles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo rol.
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar rol */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingRol ? 'Editar Rol' : 'Nuevo Rol'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del rol</label>
                    <input
                      type="text"
                      className={`mt-1 block w-full border ${errors.nombre ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={formData.nombre}
                      onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    />
                    {errors.nombre && (
                      <p className="mt-1 text-sm text-red-500">{errors.nombre}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                    <textarea
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.descripcion}
                      onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                      rows={3}
                    ></textarea>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingRol(null);
                      setFormData({
                        nombre: '',
                        descripcion: ''
                      });
                      setErrors({});
                    }}
                    className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    {editingRol ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para gestionar permisos */}
      {showPermisosModal && selectedRol && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-4xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-[800px] mb-10">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Permisos del Rol: {selectedRol.nombre}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Selecciona los permisos que deseas otorgar a este rol
              </p>
              
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-8 max-h-[65vh] overflow-y-auto pr-3">
                  {Object.keys(accionesPorModulo).sort().map(modulo => {
                    const { todosPermitidos, todosDenegados, permitidosCount, totalPermisos } = getModuloStatus(modulo);
                    
                    return (
                      <div key={modulo} className="space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                              {modulo}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {permitidosCount} de {totalPermisos} permisos activos
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-sm font-medium ${
                              todosPermitidos 
                                ? 'text-green-600 dark:text-green-400' 
                                : todosDenegados 
                                  ? 'text-red-600 dark:text-red-400'
                                  : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {todosPermitidos 
                                ? 'Todos permitidos' 
                                : todosDenegados 
                                  ? 'Todos denegados'
                                  : 'Permisos mixtos'
                              }
                            </span>
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleToggleModulo(modulo, true)}
                                className="p-1 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
                                title="Permitir todos los permisos del módulo"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleToggleModulo(modulo, false)}
                                className="p-1 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30"
                                title="Denegar todos los permisos del módulo"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-3">
                          {accionesPorModulo[modulo].map(permiso => (
                          <div 
                            key={permiso.id_accion} 
                            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-200 rounded-lg mb-2"
                          >
                            <div className="flex-1 pr-4">
                              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                                {permiso.nombre}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {permiso.descripcion}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Código: {permiso.codigo}
                              </p>
                            </div>
                            <div className="flex items-center min-w-[120px] justify-end">
                              <span className={`mr-3 text-sm font-medium ${permiso.permitido ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                {permiso.permitido ? 'Permitido' : 'Denegado'}
                              </span>
                              <button
                                onClick={() => handleTogglePermiso(permiso.id_accion)}
                                className={`p-2 rounded-lg ${
                                  permiso.permitido 
                                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30' 
                                    : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/30'
                                }`}
                                title={permiso.permitido ? 'Revocar permiso' : 'Otorgar permiso'}
                              >
                                {permiso.permitido ? (
                                  <CheckCircleIcon className="h-5 w-5" />
                                ) : (
                                  <XCircleIcon className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )})}
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPermisosModal(false);
                    setSelectedRol(null);
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSavePermisos}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Guardar Permisos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
