import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import PermissionGuard from './PermissionGuard';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  IdentificationIcon,
  BanknotesIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [oficios, setOficios] = useState([]);
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState(null);
  const [editingEmpleado, setEditingEmpleado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    nss: '',
    telefono: '',
    contacto_emergencia: '',
    telefono_emergencia: '',
    banco: '',
    cuenta_bancaria: '',
    id_contrato: '',
    id_oficio: '',
    fecha_alta: new Date().toISOString().split('T')[0],
    fecha_baja: ''
  });

  useEffect(() => {
    fetchEmpleados();
    fetchOficios();
    fetchContratos();
  }, []);

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmpleados();
      setEmpleados(response.empleados || []);
    } catch (error) {
      console.error('Error fetching empleados:', error);
    } finally {
      setLoading(false);
    }
  };
  
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
      const response = await apiService.get('/contratos');
      setContratos(response.contratos || []);
    } catch (error) {
      console.error('Error fetching contratos:', error);
    }
  };

    // Hook para verificar permisos
    const { hasPermission } = usePermissions();
    
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) {
        return;
      }

      try {
        // Verificar permisos según la operación
        const canCreate = hasPermission('empleados.crear');
        const canEdit = hasPermission('empleados.editar');
        
        if (editingEmpleado && !canEdit) {
          alert('No tienes permiso para editar empleados');
          return;
        }
        
        if (!editingEmpleado && !canCreate) {
          alert('No tienes permiso para crear empleados');
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
        
        if (editingEmpleado) {
          await apiService.updateEmpleado(editingEmpleado.id_empleado, dataToSend);
        } else {
          await apiService.createEmpleado(dataToSend);
        }
        
        // Reiniciar el formulario y recargar la lista de empleados
        resetForm();
        loadEmpleados();
        toast.success(editingEmpleado ? 'Empleado actualizado con éxito' : 'Empleado creado con éxito');
      } catch (error) {
        console.error('Error al guardar empleado:', error);
        toast.error('Error al guardar el empleado');
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
      telefono: empleado.telefono || '',
      contacto_emergencia: empleado.contacto_emergencia || '',
      telefono_emergencia: empleado.telefono_emergencia || '',
      banco: empleado.banco || '',
      cuenta_bancaria: empleado.cuenta_bancaria || '',
      id_contrato: empleado.id_contrato || '',
      id_oficio: empleado.id_oficio || '',
      fecha_alta: empleado.fecha_alta || '',
      fecha_baja: empleado.fecha_baja || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este empleado?')) {
      try {
        await apiService.deleteEmpleado(id);
        fetchEmpleados();
      } catch (error) {
        console.error('Error deleting empleado:', error);
        alert('Error al eliminar empleado: ' + error.message);
      }
    }
  };

  const filteredEmpleados = empleados.filter(empleado =>
    empleado.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (empleado.oficio?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    empleado.nss?.includes(searchTerm) ||
    (empleado.contrato?.nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Empleados</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Gestiona la información de los empleados
          </p>
        </div>
        <PermissionGuard 
          permissionCode="empleados.crear" 
          fallback={
            <button 
              disabled
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-400 cursor-not-allowed"
              title="No tienes permiso para crear empleados"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              Acceso restringido
            </button>
          }
        >
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 hover:shadow-md"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Nuevo Empleado
          </button>
        </PermissionGuard>
      </div>

      {/* Search */}
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

      {/* Table */}
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
                          !empleado.fecha_baja 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {!empleado.fecha_baja ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{empleado.oficio?.nombre || 'Sin oficio'}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">NSS: {empleado.nss || 'No registrado'}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {empleado.contrato?.nombre || 'Sin contrato'}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewProfile(empleado)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                        title="Ver perfil"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>
                      </button>
                      <PermissionGuard 
                        permissionCode="empleados.editar" 
                        hideCompletely={false}
                        fallback={
                          <button 
                            disabled
                            className="text-gray-400 cursor-not-allowed p-1"
                            title="No tienes permiso para editar empleados"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        }
                      >
                        <button
                          onClick={() => handleEdit(empleado)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
                      
                      <PermissionGuard 
                        permissionCode="empleados.eliminar" 
                        hideCompletely={false}
                        fallback={
                          <button 
                            disabled
                            className="text-gray-400 cursor-not-allowed p-1"
                            title="No tienes permiso para eliminar empleados"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        }
                      >
                        <button
                          onClick={() => handleDelete(empleado.id_empleado)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-1"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </PermissionGuard>
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
            <p className="mt-1 text-sm text-gray-500">
              Comienza agregando un nuevo empleado.
            </p>
          </div>
        )}
      </div>

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
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">NSS</label>
                    <input
                      type="text"
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      value={formData.nss}
                      onChange={(e) => setFormData({...formData, nss: e.target.value})}
                    />
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
                      <select
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.id_oficio}
                        onChange={(e) => setFormData({...formData, id_oficio: e.target.value})}
                      >
                        <option value="">Seleccionar oficio</option>
                        {oficios.map(oficio => (
                          <option key={oficio.id_oficio} value={oficio.id_oficio}>
                            {oficio.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contrato</label>
                      <select
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.id_contrato}
                        onChange={(e) => setFormData({...formData, id_contrato: e.target.value})}
                      >
                        <option value="">Seleccionar contrato</option>
                        {contratos.map(contrato => (
                          <option key={contrato.id_contrato} value={contrato.id_contrato}>
                            {contrato.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Alta</label>
                      <input
                        type="date"
                        required
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.fecha_alta}
                        onChange={(e) => setFormData({...formData, fecha_alta: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha de Baja</label>
                      <input
                        type="date"
                        className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                        value={formData.fecha_baja}
                        onChange={(e) => setFormData({...formData, fecha_baja: e.target.value})}
                      />
                    </div>
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
                        id_contrato: '',
                        id_oficio: '',
                        fecha_alta: new Date().toISOString().split('T')[0],
                        fecha_baja: ''
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
    </div>
  );
}
