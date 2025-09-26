import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronDownIcon, 
  PlusIcon, 
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon 
} from '@heroicons/react/24/outline';

const CategorySelector = ({ 
  value, 
  onChange, 
  categories = [],
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  placeholder = "Seleccionar o buscar categoría...",
  disabled = false,
  allowCreate = true,
  allowEdit = true,
  allowDelete = true,
  categoryLabel = "Categoría"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6'
  });
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filtrar categorías basado en el término de búsqueda
  const filteredCategories = categories.filter(category => 
    category.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCreateForm(false);
        setEditingCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCategory = (category) => {
    onChange(category);
    setSearchTerm('');
    setIsOpen(false);
    setShowCreateForm(false);
    setEditingCategory(null);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.nombre.trim()) return;

    try {
      const createdCategory = await onCreateCategory(newCategory);
      if (createdCategory) {
        onChange(createdCategory);
        resetForm();
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory.nombre.trim()) return;

    try {
      const updatedCategory = await onEditCategory(editingCategory.id, editingCategory);
      if (updatedCategory && value?.id === editingCategory.id) {
        onChange(updatedCategory);
      }
      setEditingCategory(null);
    } catch (error) {
      console.error('Error al editar categoría:', error);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm(`¿Estás seguro de eliminar esta ${categoryLabel.toLowerCase()}?`)) {
      try {
        await onDeleteCategory(categoryId);
        if (value?.id === categoryId) {
          onChange(null);
        }
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  const resetForm = () => {
    setNewCategory({ nombre: '', descripcion: '', color: '#3B82F6' });
    setShowCreateForm(false);
    setIsOpen(false);
    setSearchTerm('');
  };

  const displayValue = value ? value.nombre : (searchTerm || '');

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

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
          className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors"
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
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-80 overflow-hidden">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar ${categoryLabel.toLowerCase()}...`}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto">
            {!showCreateForm && !editingCategory ? (
              <>
                {filteredCategories.length > 0 ? (
                  <>
                    {filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="group flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-200 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelectCategory(category)}
                          className="flex-1 text-left flex items-center space-x-3"
                        >
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color || '#3B82F6' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-white truncate">
                              {category.nombre}
                            </div>
                            {category.descripcion && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {category.descripcion}
                              </div>
                            )}
                          </div>
                        </button>
                        
                        {(allowEdit || allowDelete) && (
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {allowEdit && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingCategory({...category});
                                }}
                                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {allowDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteCategory(category.id);
                                }}
                                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {allowCreate && (
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="w-full text-left px-4 py-3 text-orange-600 dark:text-orange-400 hover:bg-gray-100 dark:hover:bg-dark-200 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2"
                      >
                        <PlusIcon className="h-4 w-4" />
                        <span>Crear nueva {categoryLabel.toLowerCase()}</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      No se encontraron {categoryLabel.toLowerCase()}s
                    </div>
                    {allowCreate && (
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(true)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 hover:text-orange-500"
                      >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Crear nueva {categoryLabel.toLowerCase()}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Create/Edit Form
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {editingCategory ? `Editar ${categoryLabel}` : `Nueva ${categoryLabel}`}
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingCategory(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
                
                <form onSubmit={editingCategory ? handleEditCategory : handleCreateCategory} className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder={`Nombre de la ${categoryLabel.toLowerCase()} *`}
                      value={editingCategory ? editingCategory.nombre : newCategory.nombre}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editingCategory) {
                          setEditingCategory(prev => ({ ...prev, nombre: value }));
                        } else {
                          setNewCategory(prev => ({ ...prev, nombre: value }));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <input
                      type="text"
                      placeholder="Descripción (opcional)"
                      value={editingCategory ? editingCategory.descripcion : newCategory.descripcion}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (editingCategory) {
                          setEditingCategory(prev => ({ ...prev, descripcion: value }));
                        } else {
                          setNewCategory(prev => ({ ...prev, descripcion: value }));
                        }
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Color
                    </label>
                    <div className="flex items-center space-x-2">
                      {colors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            if (editingCategory) {
                              setEditingCategory(prev => ({ ...prev, color }));
                            } else {
                              setNewCategory(prev => ({ ...prev, color }));
                            }
                          }}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            (editingCategory ? editingCategory.color : newCategory.color) === color
                              ? 'border-gray-900 dark:border-white scale-110'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 px-3 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md transition-colors"
                    >
                      {editingCategory ? 'Guardar' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingCategory(null);
                      }}
                      className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;