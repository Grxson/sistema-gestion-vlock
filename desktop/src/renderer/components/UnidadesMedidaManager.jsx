import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaGripVertical } from 'react-icons/fa';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

const UnidadesMedidaManager = ({ isOpen, onClose, onUnidadesUpdated }) => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [unidadToDelete, setUnidadToDelete] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    simbolo: '',
    descripcion: '',
    activo: true
  });
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadUnidades();
    }
  }, [isOpen]);

  const loadUnidades = async () => {
    setLoading(true);
    try {
      const response = await api.get('/config/unidades/all');
      if (response.success) {
        setUnidades(response.data || []);
      }
    } catch (error) {
      console.error('Error cargando unidades:', error);
      const errorMessage = error.data?.message || error.response?.data?.message || error.message || 'No se pudieron cargar las unidades de medida';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.nombre.trim() || !formData.simbolo.trim()) {
      showError('Error', 'El nombre y símbolo son requeridos');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        // Actualizar
        const response = await api.put(`/config/unidades/${editingId}`, formData);
        if (response.success) {
          showSuccess('Éxito', 'Unidad actualizada correctamente');
          await loadUnidades();
          onUnidadesUpdated?.();
        }
      } else {
        // Crear
        const response = await api.post('/config/unidades', formData);
        if (response.success) {
          showSuccess('Éxito', 'Unidad creada correctamente');
          await loadUnidades();
          onUnidadesUpdated?.();
        }
      }
      
      resetForm();
    } catch (error) {
      console.error('Error guardando unidad:', error);
      const errorMessage = error.data?.message || error.response?.data?.message || error.message || 'Error al guardar la unidad';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (unidad) => {
    setFormData({
      nombre: unidad.nombre,
      simbolo: unidad.simbolo || '',
      descripcion: unidad.descripcion || '',
      activo: unidad.activo
    });
    setEditingId(unidad.id_unidad);
    setShowForm(true);
  };

  const handleDeleteClick = (unidad) => {
    setUnidadToDelete(unidad);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!unidadToDelete) return;

    setLoading(true);
    try {
      const response = await api.delete(`/config/unidades/${unidadToDelete.id_unidad}`);
      if (response.success) {
        showSuccess('Éxito', response.data?.message || 'Unidad eliminada correctamente');
        await loadUnidades();
        onUnidadesUpdated?.();
      }
    } catch (error) {
      console.error('Error eliminando unidad:', error);
      const errorMessage = error.data?.message || error.response?.data?.message || error.message || 'Error al eliminar la unidad';
      showError('Error', errorMessage);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setUnidadToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setUnidadToDelete(null);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      simbolo: '',
      descripcion: '',
      activo: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Gestión de Unidades de Medida
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {unidades.length} unidad{unidades.length !== 1 ? 'es' : ''} registrada{unidades.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Botón Agregar */}
          <div className="mb-4">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <FaPlus className="w-4 h-4 mr-2" />
              Agregar Unidad
            </button>
          </div>

          {/* Formulario */}
          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingId ? 'Editar Unidad' : 'Nueva Unidad'}
              </h3>
              
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-gray-500"
                    placeholder="ej: Pieza, Kilogramo"
                    maxLength="50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Símbolo *
                  </label>
                  <input
                    type="text"
                    value={formData.simbolo}
                    onChange={(e) => setFormData({...formData, simbolo: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-gray-500"
                    placeholder="ej: pz, kg, m³"
                    maxLength="10"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-gray-500"
                    placeholder="Descripción opcional de la unidad"
                    rows="2"
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.activo}
                      onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                      className="w-4 h-4 text-gray-600 rounded focus:ring-gray-500"
                    />
                    <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Activo
                    </span>
                  </label>
                </div>

                <div className="md:col-span-2 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-red-800 dark:hover:text-red-400 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
                  >
                    <FaSave className="w-4 h-4 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Unidades */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 dark:border-gray-900/30">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/30">
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    #
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nombre
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Símbolo
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Descripción
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Estado
                  </th>
                  <th className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="border border-gray-200 dark:border-gray-700 px-4 py-8 text-center text-gray-500">
                      Cargando unidades...
                    </td>
                  </tr>
                ) : unidades.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="border border-gray-200 dark:border-gray-700 px-4 py-8 text-center text-gray-500">
                      No hay unidades de medida registradas
                    </td>
                  </tr>
                ) : (
                  unidades.map((unidad, index) => (
                    <tr key={unidad.id_unidad} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white text-center font-mono">
                        {index + 1}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {unidad.nombre}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">
                        {unidad.simbolo || '-'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {unidad.descripcion || '-'}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white">
                        {unidad.activo ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                            Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="border border-gray-200 dark:border-gray-700 px-4 py-2 text-sm text-gray-900 dark:text-white">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(unidad)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar"
                          >
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(unidad)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Eliminar"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Confirmación de Eliminación */}
      {showDeleteModal && unidadToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-dark-100 rounded-lg shadow-xl max-w-md w-full mx-4">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <FaTrash className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Confirmar Eliminación
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                ¿Estás seguro de que quieres eliminar esta unidad de medida?
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {unidadToDelete.nombre}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Símbolo: <span className="font-mono">{unidadToDelete.simbolo}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    {unidadToDelete.activo ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">
                        Inactivo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      <strong>Advertencia:</strong> Esta acción no se puede deshacer. Si hay suministros usando esta unidad, solo se desactivará.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 dark:bg-gray-900/30 rounded-b-lg">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <FaTrash className="w-4 h-4 mr-2" />
                    Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnidadesMedidaManager;
