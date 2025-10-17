import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

const CustomSelect = ({ 
  value, 
  onChange, 
  options = [],
  label, 
  placeholder = "Seleccionar opción",
  className = "",
  disabled = false,
  required = false,
  error = null,
  searchable = false,
  multiple = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const searchInputRef = useRef(null);

  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (option) => {
    if (multiple) {
      const isSelected = Array.isArray(value) && value.includes(option.value);
      const newValue = isSelected
        ? value.filter(v => v !== option.value)
        : [...(Array.isArray(value) ? value : []), option.value];
      onChange(newValue);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const getDisplayText = () => {
    if (multiple && Array.isArray(value)) {
      if (value.length === 0) return placeholder;
      if (value.length === 1) {
        const option = options.find(opt => opt.value === value[0]);
        return option ? option.label : placeholder;
      }
      return `${value.length} elementos seleccionados`;
    } else {
      const option = options.find(opt => opt.value === value);
      return option ? option.label : placeholder;
    }
  };

  const isSelected = (optionValue) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(optionValue);
    }
    return value === optionValue;
  };

  const baseClasses = `
    relative w-full px-4 py-3 pr-10 
    border rounded-lg shadow-sm cursor-pointer
    transition-all duration-200 ease-in-out
    focus:outline-none focus:border-red-500
    dark:bg-gray-700 dark:border-gray-600 dark:text-white
    ${disabled ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'bg-white hover:border-gray-400'}
    ${error ? 'border-red-300 focus:border-red-500' : 'border-gray-300'}
    ${className}
  `;

  return (
    <div className="space-y-1" ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Trigger */}
        <div 
          className={baseClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <span className={`block text-left truncate ${!value || (Array.isArray(value) && value.length === 0) ? 'text-gray-500' : 'text-gray-900 dark:text-white'}`}>
            {getDisplayText()}
          </span>
          
          {/* Arrow */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <ChevronDownIcon 
              className={`h-5 w-5 transition-transform duration-200 ${
                isOpen ? 'rotate-180' : ''
              } ${error ? 'text-red-400' : 'text-gray-400'}`} 
            />
          </div>
        </div>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search input */}
            {searchable && (
              <div className="p-3 border-b border-gray-200 dark:border-gray-600">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                           focus:outline-none focus:border-red-500 
                           dark:bg-gray-800 dark:text-white text-sm"
                />
              </div>
            )}
            
            {/* Options */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                  {searchable && searchTerm ? 'No se encontraron resultados' : 'No hay opciones disponibles'}
                </div>
              ) : (
                filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-4 py-3 cursor-pointer flex items-center justify-between
                      transition-colors duration-150
                      ${isSelected(option.value) 
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                        : 'hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {option.description && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {option.description}
                      </span>
                    )}
                    {isSelected(option.value) && (
                      <CheckIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* Selected items display for multiple */}
      {multiple && Array.isArray(value) && value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((val, index) => {
            const option = options.find(opt => opt.value === val);
            return option ? (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                         bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
              >
                {option.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(option);
                  }}
                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full 
                           hover:bg-blue-200 dark:hover:bg-blue-800 focus:outline-none"
                >
                  <span className="sr-only">Eliminar</span>
                  <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                    <path strokeLinecap="round" strokeWidth="1.5" d="m1 1 6 6m0-6-6 6" />
                  </svg>
                </button>
              </span>
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
