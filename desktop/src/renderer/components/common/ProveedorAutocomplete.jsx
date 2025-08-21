import React, { useState, useEffect, useRef } from 'react';
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
    razon_social: '',
    rfc: '',
    telefono: '',
    email: '',
    direccion: '',
    tipo_proveedor: tipoSugerido
  });

  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProviders = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
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
  };

  const handleInputChange = (e) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    setSelectedProvider(null);
    setShowDropdown(true);
    setShowCreateForm(false);
    
    // Debounce de búsqueda
    const timeoutId = setTimeout(() => {
      searchProviders(newQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    setQuery(provider.nombre);
    setShowDropdown(false);
    setShowCreateForm(false);
    onChange && onChange(provider);
  };

  const handleCreateNew = () => {
    setNewProviderData({
      ...newProviderData,
      nombre: query,
      razon_social: query,
      tipo_proveedor: tipoSugerido
    });
    setShowCreateForm(true);
    setShowDropdown(false);
  };

  const handleCreateProvider = async (e) => {
    e.preventDefault();
    
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
  };

  const clearSelection = () => {
    setSelectedProvider(null);
    setQuery('');
    onChange && onChange(null);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          required={required}
          className={`w-full px-3 py-2 pl-10 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            selectedProvider ? 'bg-green-50 border-green-300' : ''
          }`}
        />
        
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        {selectedProvider && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        )}

        {selectedProvider && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <FaBuilding className="text-green-500 w-4 h-4" />
          </div>
        )}
      </div>

      {/* Dropdown de sugerencias */}
      {showDropdown && !showCreateForm && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="px-4 py-2 text-center text-gray-500">
              Buscando proveedores...
            </div>
          )}

          {!isLoading && suggestions.length === 0 && query.trim() && (
            <div className="px-4 py-2">
              <div className="text-gray-500 text-sm mb-2">
                No se encontraron proveedores
              </div>
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex items-center gap-2 w-full px-2 py-2 text-left text-blue-600 hover:bg-blue-50 rounded"
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
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{provider.nombre}</div>
                      {provider.razon_social && provider.razon_social !== provider.nombre && (
                        <div className="text-sm text-gray-600">{provider.razon_social}</div>
                      )}
                      <div className="text-xs text-gray-500">
                        {provider.tipo_proveedor} • RFC: {provider.rfc || 'Sin RFC'}
                      </div>
                    </div>
                    <FaBuilding className="text-gray-400 w-4 h-4" />
                  </div>
                </button>
              ))}
              
              {query.trim() && (
                <div className="border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 w-full px-4 py-2 text-left text-blue-600 hover:bg-blue-50"
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Crear Nuevo Proveedor</h4>
          
          <form onSubmit={handleCreateProvider} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={newProviderData.nombre}
                  onChange={(e) => setNewProviderData({...newProviderData, nombre: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  value={newProviderData.tipo_proveedor}
                  onChange={(e) => setNewProviderData({...newProviderData, tipo_proveedor: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {Object.entries(TIPOS_PROVEEDOR).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Razón Social
              </label>
              <input
                type="text"
                value={newProviderData.razon_social}
                onChange={(e) => setNewProviderData({...newProviderData, razon_social: e.target.value})}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  RFC
                </label>
                <input
                  type="text"
                  value={newProviderData.rfc}
                  onChange={(e) => setNewProviderData({...newProviderData, rfc: e.target.value.toUpperCase()})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  maxLength={13}
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={newProviderData.telefono}
                  onChange={(e) => setNewProviderData({...newProviderData, telefono: e.target.value})}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Creando...' : 'Crear Proveedor'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProveedorAutocomplete;
