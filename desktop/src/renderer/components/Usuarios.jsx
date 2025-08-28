import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import ApiErrorHandler from './ui/ApiErrorHandler';
import PermissionDenied from './PermissionDenied';
import { useAlert } from '../hooks/useAlert';
import AlertContainer from './ui/AlertContainer';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  KeyIcon,
  ShieldCheckIcon,
  UserCircleIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

export default function Usuarios() {
  const { alerts, showError, showSuccess, showWarning, removeAlert } = useAlert();
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [resetPasswordUsuario, setResetPasswordUsuario] = useState(null);
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    email: '',
    password: '',
    id_rol: '',
    activo: true
  });
  const [resetPasswordData, setResetPasswordData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // La llamada inicial a fetchUsuarios se manejará con ApiErrorHandler
    fetchRoles().catch(error => {
      console.error('Error fetching roles:', error);
    });
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/usuarios');
      setUsuarios(response.usuarios || []);
      return response;
    } catch (error) {
      console.error('Error fetching usuarios:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const fetchRoles = async () => {
    try {
      const response = await apiService.get('/roles');
      setRoles(response.roles || []);
      return response;
    } catch (error) {
      console.error('Error fetching roles:', error);
      throw error;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre_usuario) {
      newErrors.nombre_usuario = 'El nombre de usuario es requerido';
    }
    
    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El formato del correo electrónico no es válido';
    }
    
    if (!editingUsuario && !formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (!editingUsuario && formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (!formData.id_rol) {
      newErrors.id_rol = 'El rol es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordReset = () => {
    const newErrors = {};
    
    if (!resetPasswordData.password) {
      newErrors.resetPassword = 'La contraseña es requerida';
    } else if (resetPasswordData.password.length < 6) {
      newErrors.resetPassword = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (resetPasswordData.password !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
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
      const dataToSend = { ...formData };
      
      if (editingUsuario) {
        // Si estamos editando, no enviamos la contraseña a menos que se haya modificado
        if (!dataToSend.password) {
          delete dataToSend.password;
        }
        await apiService.put(`/usuarios/${editingUsuario.id_usuario}`, dataToSend);
      } else {
        await apiService.post('/usuarios', dataToSend);
      }

      fetchUsuarios();
      setShowModal(false);
      setEditingUsuario(null);
      setFormData({
        nombre_usuario: '',
        email: '',
        password: '',
        id_rol: '',
        activo: true
      });
      setErrors({});
      
      // Mostrar mensaje de éxito
      showSuccess(editingUsuario ? 'Usuario actualizado correctamente' : 'Usuario creado correctamente', {
        duration: 4000
      });
    } catch (error) {
      console.error('Error saving usuario:', error);
      showError(`Error al ${editingUsuario ? 'actualizar' : 'crear'} usuario: ${error.message}`, {
        title: 'Error de operación',
        actions: [
          {
            label: 'Reintentar',
            variant: 'primary',
            onClick: () => handleSubmit({ preventDefault: () => {} })
          }
        ]
      });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordReset()) {
      return;
    }
    
    try {
      await apiService.post(`/usuarios/${resetPasswordUsuario.id_usuario}/reset-password`, {
        password: resetPasswordData.password
      });
      
      setShowResetPasswordModal(false);
      setResetPasswordUsuario(null);
      setResetPasswordData({ password: '', confirmPassword: '' });
      setErrors({});
      
      showSuccess('Contraseña actualizada correctamente', {
        duration: 4000
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      showError(`Error al actualizar contraseña: ${error.message}`, {
        title: 'Error de operación',
        actions: [
          {
            label: 'Reintentar',
            variant: 'primary',
            onClick: () => handleResetPassword({ preventDefault: () => {} })
          }
        ]
      });
    }
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({
      nombre_usuario: usuario.nombre_usuario || '',
      email: usuario.email || '',
      password: '', // No mostramos la contraseña actual
      id_rol: usuario.id_rol || '',
      activo: usuario.activo
    });
    setShowModal(true);
  };

  const openResetPasswordModal = (usuario) => {
    setResetPasswordUsuario(usuario);
    setResetPasswordData({ password: '', confirmPassword: '' });
    setShowResetPasswordModal(true);
  };

  const handleDelete = async (id) => {
    showWarning('¿Estás seguro de que quieres desactivar este usuario?', {
      title: 'Confirmar desactivación',
      autoClose: false,
      actions: [
        {
          label: 'Cancelar',
          onClick: () => {}
        },
        {
          label: 'Desactivar',
          variant: 'primary',
          onClick: async () => {
            try {
              await apiService.delete(`/usuarios/${id}`);
              fetchUsuarios();
              showSuccess('Usuario desactivado correctamente', {
                duration: 3000
              });
            } catch (error) {
              console.error('Error deleting usuario:', error);
              showError(`Error al desactivar usuario: ${error.message}`, {
                title: 'Error de operación'
              });
            }
          }
        }
      ]
    });
  };

  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre_usuario?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.rol?.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ApiErrorHandler
      apiCall={fetchUsuarios}
      onSuccess={(response) => {
        setUsuarios(response.usuarios || []);
      }}
      dependencies={[]}
    >
      {({ isLoading }) => {
        if (isLoading) {
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Usuarios</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona los usuarios y sus permisos en el sistema
          </p>
        </div>
        <button
          onClick={() => {
            setEditingUsuario(null);
            setFormData({
              nombre_usuario: '',
              email: '',
              password: '',
              id_rol: '',
              activo: true
            });
            setErrors({});
            setShowModal(true);
          }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Usuario
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
          placeholder="Buscar usuarios..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredUsuarios.map((usuario) => (
            <li key={usuario.id_usuario}>
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
                          {usuario.nombre_usuario}
                        </p>
                        <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          usuario.activo 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {usuario.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{usuario.email}</p>
                      <div className="flex items-center mt-1">
                        <ShieldCheckIcon className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-1" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {usuario.rol?.nombre || 'Sin rol asignado'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => openResetPasswordModal(usuario)}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                      title="Cambiar contraseña"
                    >
                      <KeyIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(usuario)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(usuario.id_usuario)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                      title="Desactivar"
                      disabled={!usuario.activo}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredUsuarios.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay usuarios</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo usuario.
            </p>
          </div>
        )}
      </div>

      {/* Modal para crear/editar usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre de usuario</label>
                    <input
                      type="text"
                      className={`mt-1 block w-full border ${errors.nombre_usuario ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={formData.nombre_usuario}
                      onChange={(e) => setFormData({...formData, nombre_usuario: e.target.value})}
                    />
                    {errors.nombre_usuario && (
                      <p className="mt-1 text-sm text-red-500">{errors.nombre_usuario}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo electrónico</label>
                    <input
                      type="email"
                      className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>
                  
                  {!editingUsuario && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
                      <input
                        type="password"
                        className={`mt-1 block w-full border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                      {errors.password && (
                        <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                      )}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rol</label>
                    <select
                      className={`mt-1 block w-full border ${errors.id_rol ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={formData.id_rol}
                      onChange={(e) => setFormData({...formData, id_rol: e.target.value})}
                    >
                      <option value="">Seleccionar rol</option>
                      {roles.map(rol => (
                        <option key={rol.id_rol} value={rol.id_rol}>
                          {rol.nombre}
                        </option>
                      ))}
                    </select>
                    {errors.id_rol && (
                      <p className="mt-1 text-sm text-red-500">{errors.id_rol}</p>
                    )}
                  </div>
                  
                  {editingUsuario && (
                    <div className="flex items-center">
                      <input
                        id="activo"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        checked={formData.activo}
                        onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      />
                      <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                        Usuario activo
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingUsuario(null);
                      setFormData({
                        nombre_usuario: '',
                        email: '',
                        password: '',
                        id_rol: '',
                        activo: true
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
                    {editingUsuario ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para cambiar contraseña */}
      {showResetPasswordModal && resetPasswordUsuario && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-md shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                Cambiar contraseña - {resetPasswordUsuario.nombre_usuario}
              </h3>
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nueva contraseña</label>
                    <input
                      type="password"
                      className={`mt-1 block w-full border ${errors.resetPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={resetPasswordData.password}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, password: e.target.value})}
                    />
                    {errors.resetPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.resetPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar contraseña</label>
                    <input
                      type="password"
                      className={`mt-1 block w-full border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500`}
                      value={resetPasswordData.confirmPassword}
                      onChange={(e) => setResetPasswordData({...resetPasswordData, confirmPassword: e.target.value})}
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPasswordModal(false);
                      setResetPasswordUsuario(null);
                      setResetPasswordData({ password: '', confirmPassword: '' });
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
                    Actualizar contraseña
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <AlertContainer alerts={alerts} onRemoveAlert={removeAlert} />
    </div>
        );
      }}
    </ApiErrorHandler>
  );
}
