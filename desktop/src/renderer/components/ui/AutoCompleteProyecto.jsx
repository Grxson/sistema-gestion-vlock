import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

export default function AutoCompleteProyecto({ 
  value, 
  onChange, 
  placeholder = "Seleccionar o agregar proyecto...",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newProyecto, setNewProyecto] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: ''
  });
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (searchTerm.trim()) {
        searchProyectos(searchTerm);
      } else {
        loadAllProyectos();
      }
    }
  }, [isOpen, searchTerm]);

  // Cargar proyectos cuando hay un valor inicial (para edición)
  useEffect(() => {
    if (value && proyectos.length === 0) {
      loadAllProyectos();
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setShowEditForm(false);
        setEditingProyecto(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllProyectos = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/proyectos');
      // El backend devuelve { data: [...] }
      setProyectos(response.data || []);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProyectos = async (query) => {
    try {
      setLoading(true);
      const response = await apiService.get(`/proyectos/search?q=${encodeURIComponent(query)}`);
      // El backend devuelve { data: [...] } para búsquedas
      setProyectos(response.data || []);
    } catch (error) {
      console.error('Error al buscar proyectos:', error);
      setProyectos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProyecto = (proyecto) => {
    onChange(proyecto.id_proyecto);
    setSearchTerm('');
    setIsEditing(false);
    setIsOpen(false);
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingProyecto(null);
  };

  const handleCreateProyecto = async () => {
    try {
      // Limpiar datos antes de enviar
      const proyectoData = {
        nombre: newProyecto.nombre.trim(),
        descripcion: newProyecto.descripcion?.trim() || null,
        fecha_inicio: newProyecto.fecha_inicio?.trim() || null,
        fecha_fin: newProyecto.fecha_fin?.trim() || null
      };
      
      const response = await apiService.post('/proyectos', proyectoData);
      const createdProyecto = response.data;
      
      // Seleccionar el nuevo proyecto
      onChange(createdProyecto.id_proyecto);
      
      // Limpiar formulario
      setNewProyecto({
        nombre: '',
        descripcion: '',
        fecha_inicio: '',
        fecha_fin: ''
      });
      
      setShowCreateForm(false);
      setIsOpen(false);
      setSearchTerm('');
      
      // Recargar lista
      loadAllProyectos();
    } catch (error) {
      console.error('Error al crear proyecto:', error);
    }
  };

  const handleEditProyecto = async () => {
    try {
      // Limpiar datos antes de enviar
      const proyectoData = {
        nombre: editingProyecto.nombre.trim(),
        descripcion: editingProyecto.descripcion?.trim() || null,
        fecha_inicio: editingProyecto.fecha_inicio?.trim() || null,
        fecha_fin: editingProyecto.fecha_fin?.trim() || null
      };
      
      await apiService.put(`/proyectos/${editingProyecto.id_proyecto}`, proyectoData);
      
      // Mantener la selección del proyecto editado
      onChange(editingProyecto.id_proyecto);
      
      setShowEditForm(false);
      setEditingProyecto(null);
      setIsOpen(false);
      setSearchTerm('');
      
      // Recargar lista
      loadAllProyectos();
    } catch (error) {
      console.error('Error al editar proyecto:', error);
    }
  };

  const handleDeleteProyecto = async (proyecto) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el proyecto "${proyecto.nombre}"?`)) {
      try {
        await apiService.delete(`/proyectos/${proyecto.id_proyecto}`);
        
        // Recargar lista
        loadAllProyectos();
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        
        // Mostrar mensaje de error al usuario
        let errorMessage = 'Error al eliminar proyecto';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        alert(`Error: ${errorMessage}`);
      }
    }
  };

  const startEdit = (proyecto) => {
    setEditingProyecto({ ...proyecto });
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };

  // Solo mostrar el nombre del proyecto si no hay searchTerm activo y no se está editando
  const displayValue = searchTerm !== '' ? searchTerm : (isEditing ? '' : (proyectos.find(p => p.id_proyecto === value)?.nombre || ''));

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
              ) : proyectos.length > 0 ? (
                <>
                  {proyectos.map((proyecto) => (
                    <div
                      key={proyecto.id_proyecto}
                      className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-200 border-b border-gray-200 dark:border-gray-700 last:border-b-0 flex items-center justify-between group"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectProyecto(proyecto)}
                        className="flex-1 text-left"
                      >
                        <div className="font-medium">{proyecto.nombre}</div>
                        {proyecto.descripcion && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {proyecto.descripcion}
                          </div>
                        )}
                        {(proyecto.fecha_inicio || proyecto.fecha_fin) && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {proyecto.fecha_inicio && `Inicio: ${formatDate(proyecto.fecha_inicio)}`}
                            {proyecto.fecha_inicio && proyecto.fecha_fin && ' - '}
                            {proyecto.fecha_fin && `Fin: ${formatDate(proyecto.fecha_fin)}`}
                          </div>
                        )}
                      </button>
                      <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEdit(proyecto);
                          }}
                          className="p-1 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                          title="Editar proyecto"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProyecto(proyecto);
                          }}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          title="Eliminar proyecto"
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
                    Agregar nuevo proyecto
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No se encontraron proyectos
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Crear nuevo proyecto
                  </button>
                </div>
              )}
            </>
          ) : showCreateForm ? (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Agregar Nuevo Proyecto
              </h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del proyecto *"
                    value={newProyecto.nombre}
                    onChange={(e) => setNewProyecto({ ...newProyecto, nombre: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && newProyecto.nombre.trim() && handleCreateProyecto()}
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={newProyecto.descripcion}
                    onChange={(e) => setNewProyecto({ ...newProyecto, descripcion: e.target.value })}
                    rows={2}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      placeholder="Fecha de inicio"
                      value={newProyecto.fecha_inicio}
                      onChange={(e) => setNewProyecto({ ...newProyecto, fecha_inicio: e.target.value })}
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      placeholder="Fecha de fin"
                      value={newProyecto.fecha_fin}
                      onChange={(e) => setNewProyecto({ ...newProyecto, fecha_fin: e.target.value })}
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleCreateProyecto}
                    disabled={!newProyecto.nombre.trim()}
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
          ) : showEditForm && editingProyecto ? (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Editar Proyecto
              </h4>
              <div className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del proyecto *"
                    value={editingProyecto.nombre}
                    onChange={(e) => setEditingProyecto({ ...editingProyecto, nombre: e.target.value })}
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Descripción (opcional)"
                    value={editingProyecto.descripcion || ''}
                    onChange={(e) => setEditingProyecto({ ...editingProyecto, descripcion: e.target.value })}
                    rows={2}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="date"
                      placeholder="Fecha de inicio"
                      value={editingProyecto.fecha_inicio || ''}
                      onChange={(e) => setEditingProyecto({ ...editingProyecto, fecha_inicio: e.target.value })}
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      placeholder="Fecha de fin"
                      value={editingProyecto.fecha_fin || ''}
                      onChange={(e) => setEditingProyecto({ ...editingProyecto, fecha_fin: e.target.value })}
                      className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={handleEditProyecto}
                    disabled={!editingProyecto.nombre.trim()}
                    className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingProyecto(null);
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
