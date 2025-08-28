import React, { useState, useEffect, useRef } from 'react';
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/24/outline';
import apiService from '../../services/api';

export default function AutoCompleteProvider({ 
  value, 
  onChange, 
  placeholder = "Seleccionar o agregar proveedor...",
  disabled = false 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProvider, setNewProvider] = useState({
    nombre: '',
    tipo_proveedor: '',
    telefono: '',
    email: '',
    direccion: ''
  });
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchTerm.trim()) {
      searchProviders(searchTerm);
    } else if (isOpen) {
      loadAllProviders();
    }
  }, [isOpen, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadAllProviders = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/proveedores');
      setProviders(response.data || []);
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const searchProviders = async (query) => {
    try {
      setLoading(true);
      const response = await apiService.get(`/proveedores/search?q=${encodeURIComponent(query)}`);
      setProviders(response.data || []);
    } catch (error) {
      console.error('Error al buscar proveedores:', error);
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProvider = (provider) => {
    onChange(provider.nombre);
    setSearchTerm('');
    setIsOpen(false);
    setShowCreateForm(false);
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    try {
      const response = await apiService.post('/proveedores', newProvider);
      const createdProvider = response.data;
      
      // Seleccionar el nuevo proveedor
      onChange(createdProvider.nombre);
      
      // Limpiar formulario
      setNewProvider({
        nombre: '',
        tipo_proveedor: '',
        telefono: '',
        email: '',
        direccion: ''
      });
      
      setShowCreateForm(false);
      setIsOpen(false);
      setSearchTerm('');
    } catch (error) {
      console.error('Error al crear proveedor:', error);
      // Simplemente mostrar en consola por ahora, ya que este es un componente de utilidad
      // Se puede mejorar después implementando un sistema de notificaciones más integrado
    }
  };

  const displayValue = value || searchTerm;

  return (
    <div ref={dropdownRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
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
          {!showCreateForm ? (
            <>
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  Buscando...
                </div>
              ) : providers.length > 0 ? (
                <>
                  {providers.map((provider) => (
                    <button
                      key={provider.id_proveedor}
                      type="button"
                      onClick={() => handleSelectProvider(provider)}
                      className="w-full text-left px-4 py-3 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-dark-200 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="font-medium">{provider.nombre}</div>
                      {provider.tipo_proveedor && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {provider.tipo_proveedor}
                        </div>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="w-full text-left px-4 py-3 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-200 border-t border-gray-200 dark:border-gray-700 flex items-center"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Agregar nuevo proveedor
                  </button>
                </>
              ) : (
                <div className="px-4 py-8 text-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    No se encontraron proveedores
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(true)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-500"
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Crear nuevo proveedor
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Agregar Nuevo Proveedor
              </h4>
              <form onSubmit={handleCreateProvider} className="space-y-3">
                <div>
                  <input
                    type="text"
                    placeholder="Nombre del proveedor *"
                    value={newProvider.nombre}
                    onChange={(e) => setNewProvider({ ...newProvider, nombre: e.target.value })}
                    required
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Tipo de proveedor"
                    value={newProvider.tipo_proveedor}
                    onChange={(e) => setNewProvider({ ...newProvider, tipo_proveedor: e.target.value })}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newProvider.telefono}
                    onChange={(e) => setNewProvider({ ...newProvider, telefono: e.target.value })}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={newProvider.email}
                    onChange={(e) => setNewProvider({ ...newProvider, email: e.target.value })}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Dirección"
                    value={newProvider.direccion}
                    onChange={(e) => setNewProvider({ ...newProvider, direccion: e.target.value })}
                    rows={2}
                    className="block w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-100 text-gray-900 dark:text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="flex space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={!newProvider.nombre.trim()}
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
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
