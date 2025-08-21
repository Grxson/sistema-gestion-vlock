import React, { useState, useEffect } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, DocumentTextIcon, UsersIcon } from '@heroicons/react/24/outline';
import { usePermissions } from '../contexts/PermissionsContext';
import apiService from '../services/api';
import DateInput from './ui/DateInput';

export default function Contratos() {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [editingContrato, setEditingContrato] = useState(null);
  const [stats, setStats] = useState(null);
  const { hasPermission } = usePermissions();

  const [formData, setFormData] = useState({
    tipo_contrato: '',
    salario_diario: '',
    fecha_inicio: '',
    fecha_fin: ''
  });

  const tiposContrato = [
    { value: 'Fijo', label: 'Fijo' },
    { value: 'Temporal', label: 'Temporal' },
    { value: 'Honorarios', label: 'Honorarios' },
    { value: 'Por_Proyecto', label: 'Por Proyecto' }
  ];

  useEffect(() => {
    loadContratos();
  }, []);

  const loadContratos = async () => {
    try {
      setLoading(true);
      const response = await apiService.getContratos();
      setContratos(response.contratos || []);
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      alert('Error al cargar los contratos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiService.getContratosStats();
      setStats(response.estadisticas);
      setShowStatsModal(true);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
      alert('Error al cargar las estadísticas');
    }
  };

  const resetForm = () => {
    setFormData({
      tipo_contrato: '',
      salario_diario: '',
      fecha_inicio: '',
      fecha_fin: ''
    });
    setEditingContrato(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Preparar los datos, limpiando fecha_fin si está vacía
      const dataToSend = {
        ...formData,
        fecha_fin: formData.fecha_fin && formData.fecha_fin.trim() !== '' ? formData.fecha_fin : null
      };

      if (editingContrato) {
        await apiService.updateContrato(editingContrato.id_contrato, dataToSend);
        alert('Contrato actualizado con éxito');
      } else {
        await apiService.createContrato(dataToSend);
        alert('Contrato creado con éxito');
      }
      
      resetForm();
      setShowModal(false);
      loadContratos();
    } catch (error) {
      console.error('Error al guardar contrato:', error);
      alert(error.response?.data?.message || 'Error al guardar el contrato');
    }
  };

  const handleEdit = (contrato) => {
    setEditingContrato(contrato);
    setFormData({
      tipo_contrato: contrato.tipo_contrato || '',
      salario_diario: contrato.salario_diario || '',
      fecha_inicio: contrato.fecha_inicio || '',
      fecha_fin: contrato.fecha_fin && contrato.fecha_fin !== 'null' ? contrato.fecha_fin : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (contrato) => {
    if (window.confirm(`¿Estás seguro de eliminar el contrato ${contrato.tipo_contrato}?`)) {
      try {
        await apiService.deleteContrato(contrato.id_contrato);
        alert('Contrato eliminado con éxito');
        loadContratos();
      } catch (error) {
        console.error('Error al eliminar contrato:', error);
        alert(error.response?.data?.message || 'Error al eliminar el contrato');
      }
    }
  };

  const filteredContratos = contratos.filter(contrato =>
    contrato.tipo_contrato?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contrato.salario_diario?.toString().includes(searchTerm)
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

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
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Gestión de Contratos</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Administra los tipos de contratos y salarios de los empleados
          </p>
        </div>
        <div className="flex space-x-3">
          {hasPermission('contratos.ver') && (
            <button
              onClick={loadStats}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-dark-100 hover:bg-gray-50 dark:hover:bg-dark-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Estadísticas
            </button>
          )}
          {hasPermission('contratos.crear') && (
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Nuevo Contrato
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Buscar contratos..."
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
                <DocumentTextIcon className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Contratos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {contratos.length}
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
                    {contratos.filter(c => c.empleados_count > 0).length}
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
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Tipos Activos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {new Set(contratos.map(c => c.tipo_contrato)).size}
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
                <DocumentTextIcon className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Salario Promedio
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {formatCurrency(
                      contratos.reduce((sum, c) => sum + (parseFloat(c.salario_diario) || 0), 0) / (contratos.length || 1)
                    )}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-100 shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-dark-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo de Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Salario Diario
                </th>
                <th className="hidden md:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Inicio
                </th>
                <th className="hidden lg:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Fecha Fin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Empleados
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredContratos.map((contrato) => (
                <tr key={contrato.id_contrato} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={contrato.tipo_contrato}>
                          {contrato.tipo_contrato}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {contrato.id_contrato}
                        </div>
                        {/* Información adicional en pantallas pequeñas */}
                        <div className="md:hidden text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                          <div>Inicio: {formatDate(contrato.fecha_inicio)}</div>
                          {contrato.fecha_fin && <div>Fin: {formatDate(contrato.fecha_fin)}</div>}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(contrato.salario_diario)}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(contrato.fecha_inicio)}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(contrato.fecha_fin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                      {contrato.empleados_count || 0} empleados
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      {hasPermission('contratos.editar') && (
                        <button
                          onClick={() => handleEdit(contrato)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      )}
                      {hasPermission('contratos.eliminar') && (
                        <button
                          onClick={() => handleDelete(contrato)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContratos.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay contratos</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza creando un nuevo tipo de contrato.
            </p>
          </div>
        )}
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-lg shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6">
                {editingContrato ? 'Editar Contrato' : 'Nuevo Contrato'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Contrato *
                  </label>
                  <select
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.tipo_contrato}
                    onChange={(e) => setFormData({...formData, tipo_contrato: e.target.value})}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tiposContrato.map(tipo => (
                      <option key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Salario Diario *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    value={formData.salario_diario}
                    onChange={(e) => setFormData({...formData, salario_diario: e.target.value})}
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Ingrese el salario diario en pesos (máximo $999,999.99)
                  </p>
                </div>

                <DateInput
                  label="Fecha de Inicio"
                  value={formData.fecha_inicio}
                  onChange={(value) => setFormData({...formData, fecha_inicio: value})}
                  required={true}
                  placeholder="Seleccionar fecha de inicio"
                />

                <DateInput
                  label="Fecha de Fin"
                  value={formData.fecha_fin}
                  onChange={(value) => setFormData({...formData, fecha_fin: value})}
                  placeholder="Seleccionar fecha de fin (opcional)"
                />

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
                    {editingContrato ? 'Actualizar' : 'Crear'} Contrato
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Estadísticas */}
      {showStatsModal && stats && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 dark:bg-black dark:bg-opacity-70 overflow-y-auto h-screen w-screen z-50 flex items-start justify-center">
          <div className="relative top-10 mx-auto p-6 border border-gray-300 dark:border-gray-700 max-w-4xl shadow-lg rounded-md bg-white dark:bg-dark-100 w-full md:w-auto">
            <div className="mt-3">
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 break-words">
                Estadísticas de Contratos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Contratos por tipo */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Contratos por Tipo
                  </h4>
                  <div className="space-y-2">
                    {stats.contratos_por_tipo?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-1">
                        <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-xs" title={item.tipo_contrato}>
                          {item.tipo_contrato}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Salarios por tipo */}
                <div className="bg-gray-50 dark:bg-dark-200 p-4 rounded-lg">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                    Salarios por Tipo
                  </h4>
                  <div className="space-y-2">
                    {stats.salarios_por_tipo?.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-xs" title={item.tipo_contrato}>
                            {item.tipo_contrato}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Promedio: {formatCurrency(item.salario_promedio)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
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
