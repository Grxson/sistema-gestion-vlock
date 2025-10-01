import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaPlus, FaSpinner, FaTimes } from 'react-icons/fa';

const CATEGORIAS_SUMINISTRO = {
  'Material': 'Material',
  'Herramienta': 'Herramienta',
  'Equipo Ligero': 'Equipo Ligero',
  'Acero': 'Acero',
  'Cimbra': 'Cimbra',
  'Ferretería': 'Ferretería',
  'Servicio': 'Servicio',
  'Consumible': 'Consumible',
  'Maquinaria': 'Maquinaria',
  'Concreto': 'Concreto'
};

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
  const [selectedCategoria, setSelectedCategoria] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Inicializar la categoría seleccionada cuando hay un valor
  useEffect(() => {
    if (value) {
      const categoria = Object.entries(CATEGORIAS_SUMINISTRO).find(([key]) => key === value);
      if (categoria) {
        setSelectedCategoria({ key: categoria[0], nombre: categoria[1] });
        setSearchTerm(categoria[1]);
      }
    } else {
      setSelectedCategoria(null);
      setSearchTerm('');
    }
  }, [value]);

  // Función para buscar categorías
  const searchCategorias = (term) => {
    if (!term.trim()) {
      setFilteredCategorias([]);
      return;
    }

    const filtered = Object.entries(CATEGORIAS_SUMINISTRO)
      .filter(([key, nombre]) =>
        nombre.toLowerCase().includes(term.toLowerCase())
      )
      .map(([key, nombre]) => ({
        key,
        nombre,
        isExact: nombre.toLowerCase() === term.toLowerCase()
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
    const term = e.target.value;
    setSearchTerm(term);
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
    setSelectedCategoria(categoria);
    setSearchTerm(categoria.nombre);
    setShowDropdown(false);
    setFilteredCategorias([]);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange(categoria.key);
    }
  };

  // Manejar creación de nueva categoría
  const handleCreateNew = async () => {
    if (!searchTerm.trim() || isCreating) return;

    const newCategoriaName = searchTerm.trim();
    
    // Verificar si ya existe
    const existeCategoria = Object.values(CATEGORIAS_SUMINISTRO).some(
      nombre => nombre.toLowerCase() === newCategoriaName.toLowerCase()
    );

    if (existeCategoria) {
      return;
    }

    setIsCreating(true);

    try {
      // Crear la key normalizada (sin espacios especiales)
      const newKey = newCategoriaName.replace(/\s+/g, ' ').trim();
      
      // Agregar la nueva categoría al objeto local
      CATEGORIAS_SUMINISTRO[newKey] = newCategoriaName;

      const newCategoria = {
        key: newKey,
        nombre: newCategoriaName
      };

      setSelectedCategoria(newCategoria);
      setSearchTerm(newCategoriaName);
      setShowDropdown(false);
      setFilteredCategorias([]);
      setHighlightedIndex(-1);

      if (onChange) {
        onChange(newKey);
      }

      if (onCreateNew) {
        onCreateNew(newCategoria);
      }

    } catch (error) {
      console.error('Error al crear nueva categoría:', error);
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
    setSelectedCategoria(null);
    setSearchTerm('');
    setShowDropdown(false);
    setFilteredCategorias([]);
    setHighlightedIndex(-1);
    
    if (onChange) {
      onChange('');
    }
    
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className={`relative ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full px-3 py-2 pr-10 border rounded-md bg-white dark:bg-dark-100 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${
            error 
              ? 'border-red-500 dark:border-red-400' 
              : selectedCategoria 
                ? 'border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 dark:border-gray-600'
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
          {filteredCategorias.length > 0 ? (
            filteredCategorias.map((categoria, index) => (
              <div
                key={categoria.key}
                onClick={() => handleCategoriaSelect(categoria)}
                className={`px-3 py-2 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                  highlightedIndex === index
                    ? 'bg-red-50 dark:bg-red-900/20'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white font-medium">
                    {categoria.nombre}
                  </span>
                  {categoria.isExact && (
                    <span className="text-xs text-green-600 dark:text-green-400">
                      Coincidencia exacta
                    </span>
                  )}
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