import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';
import CategoriaSuministroModal from './CategoriaSuministroModal';
import api from '../../services/api';

const CategoriaAutocomplete = ({ 
  value, 
  onChange, 
  onCreateNew,
  className = "",
  placeholder = "Buscar categoría...",
  disabled = false,
  required = false,
  error = null
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCategorias, setFilteredCategorias] = useState([]);
  const [allCategorias, setAllCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    loadCategorias();
  }, []);

  // Cargar categorías desde la API
  const loadCategorias = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/config/categorias');
      setAllCategorias(response.data || []);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      setAllCategorias([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Inicializar la categoría seleccionada cuando hay un valor
  useEffect(() => {
    console.log('🔄 useEffect ejecutándose:', { 
      value, 
      allCategoriasLength: allCategorias.length, 
      selectedCategoriaId: selectedCategoria?.id_categoria,
      currentSearchTerm: searchTerm 
    });
    
    if (value && allCategorias.length > 0) {
      const categoria = allCategorias.find(cat => cat.id_categoria == value);
      console.log('🔍 Buscando categoría con ID:', value, 'encontrada:', categoria);
      
      if (categoria) {
        console.log('✅ Actualizando categoría seleccionada:', categoria);
        setSelectedCategoria(categoria);
        // Forzar actualización del searchTerm solo si es diferente
        if (searchTerm !== categoria.nombre) {
          setSearchTerm(categoria.nombre);
        }
      }
    } else if (value === null || value === '') {
      console.log('🧹 Limpiando categoría seleccionada, value:', value);
      setSelectedCategoria(null);
      setSearchTerm('');
    }
  }, [value, allCategorias]); // Removido selectedCategoria y searchTerm de dependencias

  // Función para buscar categorías
  const searchCategorias = (term) => {
    if (!term || typeof term !== 'string' || !term.trim()) {
      setFilteredCategorias([]);
      return;
    }

    const filtered = allCategorias
      .filter(categoria =>
        categoria.activo && categoria.nombre && categoria.nombre.toLowerCase().includes(term.toLowerCase())
      )
      .map(categoria => ({
        ...categoria,
        isExact: categoria.nombre.toLowerCase() === term.toLowerCase()
      }))
      .sort((a, b) => {
        // Priorizar coincidencias exactas
        if (a.isExact && !b.isExact) return -1;
        if (!a.isExact && b.isExact) return 1;
        // Luego por orden alfabético
        return a.nombre.localeCompare(b.nombre);
      });

    setFilteredCategorias(filtered);
  };

  // Manejar cambio en el input de búsqueda
  const handleSearchChange = (e) => {
    const term = e.target.value || '';
    setSearchTerm(term);
    
    // Solo limpiar la selección si el término está completamente vacío Y no coincide con la categoría seleccionada
    if (!term.trim() && selectedCategoria) {
      setSelectedCategoria(null);
      if (onChange) {
        onChange(null);
      }
    }
    
    setShowDropdown(true);
    setHighlightedIndex(-1);

    // Debounce la búsqueda
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchCategorias(term);
    }, 150);
  };

  // Manejar selección de categoría
  const handleCategoriaSelect = (categoria) => {
    console.log('🎯 handleCategoriaSelect ejecutándose con:', categoria);
    console.log('🎯 Estado actual antes:', { selectedCategoria: selectedCategoria?.nombre, searchTerm, value });
    
    // Actualizar estado local inmediatamente
    setSelectedCategoria(categoria);
    setSearchTerm(categoria.nombre); // Asegurar que se establece el nombre
    setShowDropdown(false);
    setFilteredCategorias([]);
    setHighlightedIndex(-1);
    
    console.log('🎯 Estados actualizados localmente a:', categoria.nombre);
    console.log('🎯 Llamando onChange con ID:', categoria.id_categoria);
    
    // Llamar a onChange inmediatamente
    if (onChange) {
      onChange(categoria.id_categoria);
      console.log('🎯 onChange ejecutado con:', categoria.id_categoria);
    }
  };

  // Manejar creación de nueva categoría - abrir modal
  const handleCreateNew = () => {
    const trimmedTerm = (searchTerm || '').trim();
    if (!trimmedTerm || isCreating) return;

    // Verificar si ya existe
    const existeCategoria = allCategorias.some(
      categoria => categoria.nombre && categoria.nombre.toLowerCase() === trimmedTerm.toLowerCase()
    );

    if (existeCategoria) {
      return;
    }

    setShowModal(true);
    setShowDropdown(false);
  };

  // Guardar nueva categoría desde el modal
  const handleSaveCategoria = async (categoriaData) => {
    try {
      setIsCreating(true);
      console.log('🆕 Creando nueva categoría:', categoriaData);
      
      const response = await api.post('/config/categorias', categoriaData);
      console.log('🆕 Respuesta completa de la API:', response);
      
      // La respuesta del backend viene en response.data
      const newCategoria = response.data || response;
      console.log('🆕 Nueva categoría extraída:', newCategoria);

      // Validar que la respuesta tenga la estructura correcta
      if (!newCategoria || !newCategoria.id_categoria || !newCategoria.nombre) {
        console.error('🆕 Respuesta de API inválida:', newCategoria);
        throw new Error('La respuesta de la API no tiene la estructura esperada');
      }

      console.log('🆕 Nueva categoría válida:', newCategoria);

      // Actualizar lista de categorías
      setAllCategorias(prev => [...prev, newCategoria]);

      // Seleccionar la nueva categoría
      setSelectedCategoria(newCategoria);
      setSearchTerm(newCategoria.nombre || '');

      console.log('🆕 Llamando onChange con nueva categoría ID:', newCategoria.id_categoria);
      if (onChange) {
        onChange(newCategoria.id_categoria);
      }

      if (onCreateNew) {
        onCreateNew(newCategoria);
      }

      setShowModal(false);
    } catch (error) {
      console.error('🆕 Error al crear categoría:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    } finally {
      setIsCreating(false);
    }
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCategorias.length - 1 ? prev + 1 : prev
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCategorias.length) {
          handleCategoriaSelect(filteredCategorias[highlightedIndex]);
        } else if (filteredCategorias.length === 0 && searchTerm.trim()) {
          handleCreateNew();
        }
        break;
      
      case 'Escape':
        setShowDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Manejar focus
  const handleFocus = () => {
    setShowDropdown(true);
    if (searchTerm && !selectedCategoria) {
      searchCategorias(searchTerm);
    }
  };

  // Manejar blur
  const handleBlur = (e) => {
    // Verificar si el click fue dentro del dropdown
    if (dropdownRef.current && dropdownRef.current.contains(e.relatedTarget)) {
      return;
    }
    
    setTimeout(() => {
      setShowDropdown(false);
      setHighlightedIndex(-1);
      
      // Si no hay categoría seleccionada, limpiar el input
      if (!selectedCategoria) {
        setSearchTerm('');
      }
    }, 150);
  };

  // Limpiar selección
  const handleClear = () => {
    console.log('🧹 Limpiando campo de categoría');
    setSelectedCategoria(null);
    setSearchTerm('');
    setShowDropdown(false);
    setFilteredCategorias([]);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange(null); // Enviar null en lugar de string vacío
    }
    
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || ''}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={selectedCategoria ? selectedCategoria.nombre : placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-10 border rounded-md bg-white dark:bg-dark-100 focus:outline-none focus:ring-2 focus:ring-red-500 ${
            error 
              ? 'border-red-500 dark:border-red-400 text-gray-900 dark:text-white' 
              : selectedCategoria 
                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 text-gray-900 dark:text-white' 
                : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {selectedCategoria ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={disabled}
            >
              <FaTimes className="h-4 w-4" />
            </button>
          ) : (
            <FaSearch className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-3 py-2 text-center">
              <FaSpinner className="h-4 w-4 text-gray-400 animate-spin mx-auto" />
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">Cargando...</span>
            </div>
          ) : filteredCategorias.length > 0 ? (
            filteredCategorias.map((categoria, index) => (
              <div
                key={categoria.id_categoria}
                onClick={() => handleCategoriaSelect(categoria)}
                className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  highlightedIndex === index
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: categoria.color }}
                    ></div>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {categoria.nombre}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      categoria.tipo === 'Proyecto' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                    }`}>
                      {categoria.tipo}
                    </span>
                    {categoria.isExact && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Exacta
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : searchTerm.trim() ? (
            <div
              onClick={handleCreateNew}
              className={`px-3 py-2 cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 ${
                isCreating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-center space-x-2">
                {isCreating ? (
                  <FaSpinner className="h-4 w-4 text-green-600 animate-spin" />
                ) : (
                  <FaPlus className="h-4 w-4 text-green-600" />
                )}
                <span className="text-green-600 dark:text-green-400">
                  Crear "{searchTerm}"
                </span>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-500 dark:text-gray-400 text-sm">
              Escribe para buscar categorías...
            </div>
          )}
        </div>
      )}

      {/* Modal para crear categoría */}
      <CategoriaSuministroModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCategoria}
        initialData={{ nombre: (searchTerm || '').trim() }}
        title="Crear Nueva Categoría"
        existingCategories={allCategorias}
      />

      {/* Mensaje de error */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default CategoriaAutocomplete;