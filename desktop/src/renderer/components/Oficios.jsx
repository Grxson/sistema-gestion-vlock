import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, WrenchScrewdriverIcon, UsersIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../contexts/PermissionsContext';
import apiService from '../services/api';

export default function Oficios() {
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingOficio, setEditingOficio] = useState(null);
  const [selectedOficio, setSelectedOficio] = useState(null);
  const [stats, setStats] = useState(null);
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  useEffect(() => {
    loadOficios();
  }, []);

  const loadOficios = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOficios();
      setOficios(response.oficios || []);
    } catch (error) {
      console.error('Error al cargar oficios:', error);
      alert('Error al cargar los oficios');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getOficiosStats();
      setStats(response.estadisticas);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar las estadísticas');
    }
  };

  const loadOficioDetail = async (oficio) => {
    try {
      const response = await apiService.getOficioById(oficio.id_oficio);
      setSelectedOficio(response.oficio);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error al cargar detalle del oficio:', error);
      alert('Error al cargar el detalle del oficio');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: ''
    });
    setEditingOficio(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingOficio) {
        await apiService.updateOficio(editingOficio.id_oficio, formData);
        alert('Oficio actualizado con éxito');
      } else {
        await apiService.createOficio(formData);
        alert('Oficio creado con éxito');
      }
      
      resetForm();
      setShowModal(false);
      loadOficios();
    } catch (error) {
      console.error('Error al guardar oficio:', error);
      alert(error.response?.data?.message || 'Error al guardar el oficio');
    }
  };

  const handleEdit = (oficio) => {
    setEditingOficio(oficio);
    setFormData({
      nombre: oficio.nombre || '',
      descripcion: oficio.descripcion || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (oficio) => {
    if (window.confirm(`¿Estás seguro de eliminar el oficio "${oficio.nombre}"?`)) {
      try {
        await apiService.deleteOficio(oficio.id_oficio);
        alert('Oficio eliminado con éxito');
        loadOficios();
      } catch (error) {
        console.error('Error al eliminar oficio:', error);
        alert(error.response?.data?.message || 'Error al eliminar el oficio');
      }
    }
  };

  const filteredOficios = oficios.filter(oficio =>
    oficio.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oficio.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestión de Oficios</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Administra los oficios y especialidades de los trabajadores
          </p>
        </div>
        <div className="flex space-x-3">
          {hasPermission('oficios.ver') && (
            <button
              onClick={loadStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <WrenchScrewdriverIcon className="h-4 w-4 mr-2" />
              Estadísticas
            </button>
          )}
          {hasPermission('oficios.crear') && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Oficio
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Buscar oficios..."
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Oficios
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {oficios.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Con Empleados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {oficios.filter(o => o.empleados_count > 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <WrenchScrewdriverIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Sin Personal
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {oficios.filter(o => o.empleados_count === 0).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-100 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Empleados
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {oficios.reduce((sum, o) => sum + (o.empleados_count || 0), 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{/* Agregamos xl:grid-cols-4 para mejor distribución */}
        {filteredOficios.map((oficio) => (
          <div key={oficio.id_oficio} className="bg-white dark:bg-dark-100 overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-200 flex flex-col min-h-[180px]">
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <WrenchScrewdriverIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-lg font-medium text-gray-900 dark:text-white truncate" title={oficio.nombre}>
                        {oficio.nombre}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {oficio.id_oficio}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                  {oficio.descripcion || 'Sin descripción'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <UsersIcon className="h-3 w-3 mr-1" />
                  {oficio.empleados_count || 0} empleados
                </span>
                
                <div className="flex space-x-2">
                  {hasPermission('oficios.ver') && (
                    <button
                      onClick={() => loadOficioDetail(oficio)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Ver detalle"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  )}
                  {hasPermission('oficios.editar') && (
                    <button
                      onClick={() => handleEdit(oficio)}
                      className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                      title="Editar"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  )}
                  {hasPermission('oficios.eliminar') && (
                    <button
                      onClick={() => handleDelete(oficio)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOficios.length === 0 && (
        <div className="text-center py-12">
          <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay oficios</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza creando un nuevo oficio.
          </p>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-lg shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingOficio ? 'Editar Oficio' : 'Nuevo Oficio'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={50}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Albañil, Electricista, Plomero..."
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
                    <span>Máximo 50 caracteres</span>
                    <span className={formData.nombre.length > 40 ? 'text-orange-500' : formData.nombre.length > 45 ? 'text-red-500' : ''}>
                      {formData.nombre.length}/50
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    rows={4}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    placeholder="Describe las responsabilidades y habilidades requeridas..."
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    {editingOficio ? 'Actualizar' : 'Crear'} Oficio
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {showDetailModal && selectedOficio && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-2xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 break-words">
                Detalle del Oficio: {selectedOficio.nombre}
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Información General
                  </h4>
                  <dl className="grid grid-cols-1 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre:</dt>
                      <dd className="text-sm text-gray-900 dark:text-white break-words">{selectedOficio.nombre}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Descripción:</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {selectedOficio.descripcion || 'Sin descripción'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Empleados asignados:</dt>
                      <dd className="text-sm text-gray-900 dark:text-white">
                        {selectedOficio.empleados?.length || 0} empleados
                      </dd>
                    </div>
                  </dl>
                </div>

                {selectedOficio.empleados && selectedOficio.empleados.length > 0 && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Empleados con este Oficio
                    </h4>
                    <div className="space-y-2">
                      {selectedOficio.empleados.map((empleado) => (
                        <div key={empleado.id_empleado} className="flex justify-between items-center py-2 px-3 bg-white dark:bg-dark-100 rounded">
                          <div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {empleado.nombre} {empleado.apellido}
                            </span>
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              NSS: {empleado.nss || 'No registrado'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {empleado.contrato?.tipo_contrato || 'Sin contrato'} - 
                            {empleado.contrato?.salario_diario ? ` $${empleado.contrato.salario_diario}/día` : ' Sin salario definido'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estadísticas */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-4xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                Estadísticas de Oficios
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Oficios con empleados */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Oficios con Empleados
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {stats.oficios_con_empleados?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {item.nombre}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.empleados_count} empleados
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salarios por oficio */}
                {stats.salarios_por_oficio && stats.salarios_por_oficio.length > 0 && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Salarios Promedio por Oficio
                    </h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {stats.salarios_por_oficio.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                              {item.nombre}
                            </span>
                            <span className="text-sm text-gray-900 dark:text-white">
                              {new Intl.NumberFormat('es-MX', {
                                style: 'currency',
                                currency: 'MXN'
                              }).format(item.salario_promedio || 0)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {item.empleados_count} empleados
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Oficios sin empleados */}
                {stats.oficios_sin_empleados && stats.oficios_sin_empleados.length > 0 && (
                  <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg md:col-span-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                      Oficios sin Empleados Asignados
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {stats.oficios_sin_empleados.map((item, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                        >
                          {item.nombre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowStatsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
