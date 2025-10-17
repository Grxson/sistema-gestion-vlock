import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

export default function AutoCompleteOficio({ 
  value, 
  onChange, 
  placeholder = "Seleccionar o agregar oficio...",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [oficios, setOficios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingOficio, setEditingOficio] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newOficio, setNewOficio] = useState({
    nombre: '',
    descripcion: ''
  });
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (searchTerm.trim()) {
        searchOficios(searchTerm);
      } else {
        loadAllOficios();
      }
    }
  }, [isOpen, searchTerm]);

  // Cargar oficios cuando hay un valor inicial (para edición)
  useEffect(() => {
    if (value && oficios.length === 0) {
      loadAllOficios();
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setShowEditForm(false);
        setEditingOficio(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllOficios = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/oficios');
      // El backend devuelve { oficios: [...] } no { data: [...] }
      setOficios(response.oficios || []);
    } catch (error) {
      console.error('Error al cargar oficios:', error);
      setOficios([]);
    } finally {
      setLoading(false);
    }
  };

  const searchOficios = async (query) => {
    try {
      setLoading(true);
      const response = await apiService.get(`/oficios/search?q=${encodeURIComponent(query)}`);
      // El backend devuelve { data: [...] } para búsquedas
      setOficios(response.data || []);
    } catch (error) {
      console.error('Error al buscar oficios:', error);
      setOficios([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOficio = (oficio) => {
    onChange(oficio.id_oficio);
    setSearchTerm('');
    setIsEditing(false);
    setIsOpen(false);
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingOficio(null);
  };

  const handleCreateOficio = async () => {
    try {
      // Limpiar datos antes de enviar
      const oficioData = {
        nombre: newOficio.nombre.trim(),
        descripcion: newOficio.descripcion?.trim() || null
      };
      
      const response = await apiService.post('/oficios', oficioData);
      const createdOficio = response.oficio;
      
      // Seleccionar el nuevo oficio
      onChange(createdOficio.id_oficio);
      
      // Limpiar formulario
      setNewOficio({
        nombre: '',
        descripcion: ''
      });
      
      setShowCreateForm(false);
      setIsOpen(false);
      setSearchTerm('');
      
      // Recargar lista
      loadAllOficios();
    } catch (error) {
      console.error('Error al crear oficio:', error);
    }
  };

  const handleEditOficio = async () => {
    try {
      // Limpiar datos antes de enviar
      const oficioData = {
        nombre: editingOficio.nombre.trim(),
        descripcion: editingOficio.descripcion?.trim() || null
      };
      
      await apiService.put(`/oficios/${editingOficio.id_oficio}`, oficioData);
      
      // Mantener la selección del oficio editado
      onChange(editingOficio.id_oficio);
      
      setShowEditForm(false);
      setEditingOficio(null);
      setIsOpen(false);
      setSearchTerm('');
      
      // Recargar lista
      loadAllOficios();
    } catch (error) {
      console.error('Error al editar oficio:', error);
    }
  };

  const handleDeleteOficio = async (oficio) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el oficio "${oficio.nombre}"?`)) {
      try {
        await apiService.delete(`/oficios/${oficio.id_oficio}`);
        
        // Recargar lista
        loadAllOficios();
      } catch (error) {
        console.error('Error al eliminar oficio:', error);
        
        // Mostrar mensaje de error al usuario
        let errorMessage = 'Error al eliminar oficio';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const startEdit = (oficio) => {
    setEditingOficio({ ...oficio });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  // Solo mostrar el nombre del oficio si no hay searchTerm activo y no se está editando
  const displayValue = searchTerm !== '' ? searchTerm : (isEditing ? '' : (oficios.find(o => o.id_oficio === value)?.nombre || ''));

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsEditing(true);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setIsEditing(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="mt-1 block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-4 py-3 pr-10 focus:outline-none focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 disabled:cursor-not-allowed"
        >
          <ChevronDownIcon
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {!showCreateForm && !showEditForm ? (
            <>
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Buscando...
                </div>
              ) : oficios.length > 0 ? (
                <>
                  {oficios.map((oficio) => (
                    <div
                      key={oficio.id_oficio}
                      className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-200 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex items-center justify-between group"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectOficio(oficio)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">{oficio.nombre}</div>
                        {oficio.descripcion && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {oficio.descripcion}
                          </div>
                        )}
                      </button>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(oficio);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Editar oficio"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOficio(oficio);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar oficio"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full text-left px-4 py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-200 border-t border-gray-200 dark:border-gray-700 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Agregar nuevo oficio
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No se encontraron oficios
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Crear nuevo oficio
                  </button>
                </div>
              )}
            </>
          ) : showCreateForm ? (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Agregar Nuevo Oficio
              </h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del oficio *"
                    value={newOficio.nombre}
                    onChange={(e) => setNewOficio({ ...newOficio, nombre: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && newOficio.nombre.trim() && handleCreateOficio()}
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={newOficio.descripcion}
                    onChange={(e) => setNewOficio({ ...newOficio, descripcion: e.target.value })}
                    rows={2}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCreateOficio}
                    disabled={!newOficio.nombre.trim()}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : showEditForm && editingOficio ? (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Editar Oficio
              </h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del oficio *"
                    value={editingOficio.nombre}
                    onChange={(e) => setEditingOficio({ ...editingOficio, nombre: e.target.value })}
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={editingOficio.descripcion || ''}
                    onChange={(e) => setEditingOficio({ ...editingOficio, descripcion: e.target.value })}
                    rows={2}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleEditOficio}
                    disabled={!editingOficio.nombre.trim()}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingOficio(null);
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
