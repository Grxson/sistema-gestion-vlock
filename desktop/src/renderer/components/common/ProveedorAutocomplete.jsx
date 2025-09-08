import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FaSearch, FaPlus, FaBuilding, FaTimes } from 'react-icons/fa';
import api from '../../services/api';

const TIPOS_PROVEEDOR = {
  'Material': 'Material',
  'Servicio': 'Servicio', 
  'Equipo': 'Equipo',
  'Mixto': 'Mixto'
};

const ProveedorAutocomplete = ({ 
  value, 
  onChange, 
  placeholder = "Buscar o crear proveedor...",
  required = false,
  className = "",
  tipoSugerido = "Material" // Tipo sugerido basado en el contexto
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(value || null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProviderData, setNewProviderData] = useState({
    nombre: '',
    telefono: '',
     tipo_proveedor: tipoSugerido
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Función de búsqueda optimizada con useCallback
  const searchProviders = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // No buscar si ya tenemos un proveedor seleccionado y el query coincide
    if (selectedProvider && selectedProvider.nombre === searchQuery.trim()) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.searchProveedores(searchQuery);
      if (response.success) {
        setSuggestions(response.data || []);
      }
    } catch (error) {
      console.error('Error buscando proveedores:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProvider]);

  // Debounce optimizado con useCallback
  const debouncedSearch = useCallback((searchQuery) => {
    // Limpiar timeout anterior
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Establecer nuevo timeout
    searchTimeoutRef.current = setTimeout(() => {
      searchProviders(searchQuery);
    }, 300);
  }, [searchProviders]);

  useEffect(() => {
    if (value && value.nombre) {
      setSelectedProvider(value);
      setQuery(value.nombre);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      // Limpiar timeout al desmontar componente
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = useCallback((e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    
    // Solo resetear selección si el query cambió
    if (selectedProvider && selectedProvider.nombre !== newQuery) {
      setSelectedProvider(null);
      onChange && onChange(null);
    }
    
    setShowDropdown(true);
    setShowCreateForm(false);
    
    // Usar la búsqueda con debounce
    debouncedSearch(newQuery);
  }, [selectedProvider, onChange, debouncedSearch]);

  const handleProviderSelect = useCallback((provider) => {
    setSelectedProvider(provider);
    setQuery(provider.nombre);
    setShowDropdown(false);
    setShowCreateForm(false);
    onChange && onChange(provider);
  }, [onChange]);

  const handleCreateNew = useCallback(() => {
    setNewProviderData({
      ...newProviderData,
      nombre: query,
      tipo_proveedor: tipoSugerido
    });
    setShowCreateForm(true);
    setShowDropdown(false);
  }, [newProviderData, query, tipoSugerido]);

  const handleCreateProvider = useCallback(async () => {
    if (!newProviderData.nombre.trim()) {
      alert('El nombre del proveedor es requerido');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.createOrGetProveedor(newProviderData);
      if (response.success) {
        handleProviderSelect(response.data);
        setNewProviderData({
          nombre: '',
          razon_social: '',
          rfc: '',
          telefono: '',
          email: '',
          direccion: '',
          tipo_proveedor: tipoSugerido
        });
      }
    } catch (error) {
      console.error('Error creando proveedor:', error);
      alert('Error al crear proveedor: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  }, [newProviderData, tipoSugerido, handleProviderSelect]);

  const clearSelection = useCallback(() => {
    setSelectedProvider(null);
    setQuery('');
    onChange && onChange(null);
    inputRef.current?.focus();
  }, [onChange]);

  const handleFocus = useCallback(() => {
    setShowDropdown(true);
    // Si hay query pero no hay sugerencias, buscar inmediatamente
    if (query.trim() && suggestions.length === 0) {
      searchProviders(query);
    }
    // Si no hay query, mostrar todos los proveedores
    else if (!query.trim()) {
      loadAllProviders();
    }
  }, [query, suggestions.length, searchProviders]);

  // Función para cargar todos los proveedores
  const loadAllProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.getProveedores();
      if (response.success && Array.isArray(response.data)) {
        setSuggestions(response.data.slice(0, 10)); // Mostrar solo los primeros 10
      }
    } catch (error) {
      console.error('Error al cargar proveedores:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 pl-10 pr-10 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-red-500 ${
            selectedProvider ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' : ''
          }`}
        />
        
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
        
        {selectedProvider && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        {selectedProvider && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <FaBuilding className="text-green-500 dark:text-green-400 w-4 h-4" />
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showDropdown && !showCreateForm && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-4 py-2 text-center text-gray-500 dark:text-gray-400">
              Buscando proveedores...
            </div>
          )}

          {!isLoading && suggestions.length === 0 && query.trim() && (
            <div className="px-4 py-2">
              <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                No se encontraron proveedores
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
              >
                <FaPlus className="w-4 h-4" />
                <span>Crear nuevo proveedor: "{query}"</span>
              </button>
            </div>
          )}

          {!isLoading && suggestions.length > 0 && (
            <>
              {suggestions.map((provider) => (
                <button
                  key={provider.id_proveedor}
                  type="button"
                  onClick={() => handleProviderSelect(provider)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">{provider.nombre}</div>
                      {provider.razon_social && provider.razon_social !== provider.nombre && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">{provider.razon_social}</div>
                      )}
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {provider.tipo_proveedor}
                      </div>
                    </div>
                    <FaBuilding className="text-gray-400 dark:text-gray-500 w-4 h-4" />
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <div className="border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Crear nuevo proveedor</span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Formulario de creación */}
      {showCreateForm && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">Crear Nuevo Proveedor</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                value={newProviderData.nombre}
                onChange={(e) => setNewProviderData({...newProviderData, nombre: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                placeholder="Ej: CEMEX, Ferretería La Esperanza, etc."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Proveedor
                </label>
                <select
                  value={newProviderData.tipo_proveedor}
                  onChange={(e) => setNewProviderData({...newProviderData, tipo_proveedor: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  {Object.entries(TIPOS_PROVEEDOR).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newProviderData.telefono}
                  onChange={(e) => setNewProviderData({...newProviderData, telefono: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:border-red-500"
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleCreateProvider}
                disabled={isLoading}
                className="flex-1 bg-red-600 text-white px-3 py-1 text-sm rounded hover:bg-red-700 disabled:opacity-50 transition-colors duration-200"
              >
                {isLoading ? 'Creando...' : 'Crear Proveedor'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-dark-200 text-gray-700 dark:text-gray-300 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProveedorAutocomplete;
