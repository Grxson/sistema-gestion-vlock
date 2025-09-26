import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelector from '../ui/CategorySelector';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';

const ConceptosObra = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados del componente
  const [conceptos, setConceptos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedConcepto, setSelectedConcepto] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    categoria: '',
    tipo: '',
    estado: 'activo',
    precio_min: '',
    precio_max: ''
  });
  
  const itemsPerPage = 10;

  // Estado para categorías dinámicas
  const [categorias, setCategorias] = useState([
    { id: 1, nombre: 'Preliminares', descripcion: 'Trabajos preliminares de construcción', color: '#3B82F6' },
    { id: 2, nombre: 'Cimentación', descripcion: 'Trabajos de cimentación y zapatas', color: '#8B5CF6' },
    { id: 3, nombre: 'Estructura', descripcion: 'Estructura principal', color: '#10B981' },
    { id: 4, nombre: 'Albañilería', descripcion: 'Trabajos de albañilería', color: '#F59E0B' },
    { id: 5, nombre: 'Instalaciones', descripcion: 'Instalaciones eléctricas, hidráulicas, etc.', color: '#EF4444' },
    { id: 6, nombre: 'Acabados', descripcion: 'Acabados finales', color: '#EC4899' },
    { id: 7, nombre: 'Urbanización', descripcion: 'Trabajos de urbanización', color: '#06B6D4' },
    { id: 8, nombre: 'Paisajismo', descripcion: 'Áreas verdes y paisajismo', color: '#84CC16' }
  ]);

  // Estado para tipos dinámicos
  const [tipos, setTipos] = useState([
    { id: 1, nombre: 'Material', descripcion: 'Materiales de construcción', color: '#3B82F6' },
    { id: 2, nombre: 'Mano de Obra', descripcion: 'Trabajo humano', color: '#10B981' },
    { id: 3, nombre: 'Equipo', descripcion: 'Maquinaria y equipo', color: '#F59E0B' },
    { id: 4, nombre: 'Mixto', descripcion: 'Combinación de materiales y mano de obra', color: '#8B5CF6' }
  ]);

  // Funciones para manejar categorías
  const handleCreateCategory = async (categoryData) => {
    const newId = Math.max(...categorias.map(c => c.id)) + 1;
    const newCategory = { id: newId, ...categoryData };
    setCategorias(prev => [...prev, newCategory]);
    return newCategory;
  };

  const handleEditCategory = async (categoryId, categoryData) => {
    setCategorias(prev => prev.map(c => c.id === categoryId ? { ...c, ...categoryData } : c));
    return { id: categoryId, ...categoryData };
  };

  const handleDeleteCategory = async (categoryId) => {
    setCategorias(prev => prev.filter(c => c.id !== categoryId));
  };

  // Funciones para manejar tipos
  const handleCreateType = async (typeData) => {
    const newId = Math.max(...tipos.map(t => t.id)) + 1;
    const newType = { id: newId, ...typeData };
    setTipos(prev => [...prev, newType]);
    return newType;
  };

  const handleEditType = async (typeId, typeData) => {
    setTipos(prev => prev.map(t => t.id === typeId ? { ...t, ...typeData } : t));
    return { id: typeId, ...typeData };
  };

  const handleDeleteType = async (typeId) => {
    setTipos(prev => prev.filter(t => t.id !== typeId));
  };

  // Cargar conceptos
  const loadConceptos = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada a la API
      const mockData = [
        {
          id: 1,
          codigo: 'CON-001',
          nombre: 'Excavación manual',
          categoria: 'Preliminares',
          tipo: 'Mano de Obra',
          unidad: 'm³',
          descripcion: 'Excavación manual en terreno tipo II',
          precio_base: 150.00,
          estado: 'activo',
          created_at: new Date()
        },
        {
          id: 2,
          codigo: 'CON-002',
          nombre: 'Concreto f\'c=200 kg/cm²',
          categoria: 'Estructura',
          tipo: 'Material',
          unidad: 'm³',
          descripcion: 'Concreto premezclado resistencia 200 kg/cm²',
          precio_base: 2800.00,
          estado: 'activo',
          created_at: new Date()
        }
      ];
      setConceptos(mockData);
    } catch (error) {
      console.error('Error loading conceptos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConceptos();
  }, []);

  // Filtrar conceptos
  const filteredConceptos = conceptos.filter(concepto => {
    const matchesSearch = concepto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         concepto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = !selectedCategoria || concepto.categoria === selectedCategoria;
    const matchesTipo = !filters.tipo || concepto.tipo === filters.tipo;
    const matchesEstado = !filters.estado || concepto.estado === filters.estado;
    
    return matchesSearch && matchesCategoria && matchesTipo && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredConceptos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedConceptos = filteredConceptos.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleCreateConcepto = () => {
    setModalMode('create');
    setSelectedConcepto(null);
    setShowModal(true);
  };

  const handleEditConcepto = (concepto) => {
    setModalMode('edit');
    setSelectedConcepto(concepto);
    setShowModal(true);
  };

  const handleViewConcepto = (concepto) => {
    setModalMode('view');
    setSelectedConcepto(concepto);
    setShowModal(true);
  };

  const handleDeleteConcepto = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este concepto?')) {
      try {
        // TODO: Implementar llamada a la API
        setConceptos(conceptos.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting concepto:', error);
      }
    }
  };

  const handleDuplicateConcepto = (concepto) => {
    setModalMode('duplicate');
    setSelectedConcepto({ ...concepto, id: null, codigo: '' });
    setShowModal(true);
  };

  const handleSaveConcepto = async (conceptoData) => {
    try {
      setLoading(true);
      
      if (modalMode === 'create' || modalMode === 'duplicate') {
        // Generar nuevo ID y código
        const newId = Math.max(...conceptos.map(c => c.id), 0) + 1;
        const newCodigo = modalMode === 'duplicate' ? 
          `CON-${String(newId).padStart(3, '0')}` : 
          conceptoData.codigo;
        
        const newConcepto = {
          ...conceptoData,
          id: newId,
          codigo: newCodigo,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        setConceptos([...conceptos, newConcepto]);
      } else if (modalMode === 'edit') {
        setConceptos(conceptos.map(c => 
          c.id === selectedConcepto.id 
            ? { ...conceptoData, id: selectedConcepto.id, updated_at: new Date() }
            : c
        ));
      }
      
      setShowModal(false);
      // TODO: Integrar con API real
    } catch (error) {
      console.error('Error saving concepto:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ClipboardDocumentListIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Conceptos de Obra
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestionar catálogo de conceptos de construcción
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                <TagIcon className="h-4 w-4 mr-1" />
                Beta
              </span>
              <button
                onClick={handleCreateConcepto}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Concepto
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="px-6 py-4 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Barra de búsqueda */}
          <div className="relative flex-1 max-w-lg">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.nombre}>{categoria.nombre}</option>
              ))}
            </select>

            <select
              value={filters.tipo}
              onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los tipos</option>
              {tipos.map(tipo => (
                <option key={tipo.id} value={tipo.nombre}>{tipo.nombre}</option>
              ))}
            </select>

            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de conceptos */}
      <div className="px-6 py-6">
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-dark-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Concepto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Categoría
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Unidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio Base
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedConceptos.map((concepto) => (
                      <tr key={concepto.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {concepto.codigo}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {concepto.nombre}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {concepto.descripcion}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                            {concepto.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {concepto.tipo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {concepto.unidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${concepto.precio_base?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            concepto.estado === 'activo' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {concepto.estado}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleViewConcepto(concepto)}
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-150"
                              title="Ver detalles"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditConcepto(concepto)}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-150"
                              title="Editar"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDuplicateConcepto(concepto)}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-150"
                              title="Duplicar"
                            >
                              <DocumentDuplicateIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteConcepto(concepto.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-150"
                              title="Eliminar"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredConceptos.length)} de {filteredConceptos.length} resultados
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index + 1}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-3 py-1 border rounded-md text-sm ${
                            currentPage === index + 1
                              ? 'bg-primary-600 border-primary-600 text-white'
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de ConceptosObra - CRUD Completo */}
      {showModal && (
        <ConceptoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          concepto={selectedConcepto}
          onSave={handleSaveConcepto}
        />
      )}
    </div>
  );
};

// Componente ConceptoModal - CRUD completo
const ConceptoModal = ({ isOpen, onClose, mode, concepto, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Preliminares',
    tipo: 'Mano de obra',
    unidad: 'm²',
    descripcion: '',
    precio_base: '',
    especificaciones: '',
    rendimiento: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});

  // Categorías y tipos disponibles
  const categorias = [
    'Preliminares', 'Cimentación', 'Estructura', 'Albañilería',
    'Instalaciones', 'Acabados', 'Urbanización', 'Paisajismo'
  ];

  const tipos = ['Mano de obra', 'Material', 'Herramienta', 'Equipo', 'Subcontrato'];

  const unidades = [
    'm²', 'm³', 'm', 'pza', 'kg', 'ton', 'lts', 'glob', 'jor', 'hr'
  ];

  useEffect(() => {
    if (concepto && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setFormData({
        codigo: mode === 'duplicate' ? '' : concepto.codigo || '',
        nombre: concepto.nombre || '',
        categoria: concepto.categoria || 'Preliminares',
        tipo: concepto.tipo || 'Mano de obra',
        unidad: concepto.unidad || 'm²',
        descripcion: concepto.descripcion || '',
        precio_base: concepto.precio_base || '',
        especificaciones: concepto.especificaciones || '',
        rendimiento: concepto.rendimiento || '',
        estado: concepto.estado || 'activo'
      });
    } else {
      // Reset form for create mode
      setFormData({
        codigo: '',
        nombre: '',
        categoria: 'Preliminares',
        tipo: 'Mano de obra',
        unidad: 'm²',
        descripcion: '',
        precio_base: '',
        especificaciones: '',
        rendimiento: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [concepto, mode, isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.codigo.trim()) {
      newErrors.codigo = 'El código es requerido';
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido';
    }
    if (!formData.precio_base || formData.precio_base <= 0) {
      newErrors.precio_base = 'El precio base debe ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (mode === 'view') {
      onClose();
      return;
    }
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-dark-100 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <ClipboardDocumentListIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' && 'Crear Nuevo Concepto'}
                  {mode === 'edit' && 'Editar Concepto'}
                  {mode === 'view' && 'Detalles del Concepto'}
                  {mode === 'duplicate' && 'Duplicar Concepto'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isReadOnly ? 'Ver información del concepto' : 'Complete la información del concepto de obra'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  value={formData.codigo}
                  onChange={(e) => handleInputChange('codigo', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    errors.codigo 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-300 dark:border-gray-600'
                  } ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } text-gray-900 dark:text-white`}
                  placeholder="CON-001"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categoría *
                </label>
                <CategorySelector
                  value={categorias.find(c => c.nombre === formData.categoria) || null}
                  onChange={(categoria) => handleInputChange('categoria', categoria ? categoria.nombre : '')}
                  categories={categorias}
                  onCreateCategory={handleCreateCategory}
                  onEditCategory={handleEditCategory}
                  onDeleteCategory={handleDeleteCategory}
                  placeholder="Seleccionar categoría..."
                  disabled={isReadOnly}
                  categoryLabel="Categoría"
                />
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Concepto *
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  errors.nombre 
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                    : 'border-gray-300 dark:border-gray-600'
                } ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } text-gray-900 dark:text-white`}
                placeholder="Ej: Excavación manual en terreno tipo II"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo *
                </label>
                <CategorySelector
                  value={tipos.find(t => t.nombre === formData.tipo) || null}
                  onChange={(tipo) => handleInputChange('tipo', tipo ? tipo.nombre : '')}
                  categories={tipos}
                  onCreateCategory={handleCreateType}
                  onEditCategory={handleEditType}
                  onDeleteCategory={handleDeleteType}
                  placeholder="Seleccionar tipo..."
                  disabled={isReadOnly}
                  categoryLabel="Tipo"
                />
                {errors.tipo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unidad *
                </label>
                <select
                  value={formData.unidad}
                  onChange={(e) => handleInputChange('unidad', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                >
                  {unidades.map(unidad => (
                    <option key={unidad} value={unidad}>{unidad}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Precio Base *
                </label>
                <div className="relative">
                  <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precio_base}
                    onChange={(e) => handleInputChange('precio_base', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      errors.precio_base 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                    placeholder="0.00"
                  />
                </div>
                {errors.precio_base && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.precio_base}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                rows={3}
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                placeholder="Descripción detallada del concepto..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Especificaciones Técnicas
                </label>
                <textarea
                  rows={3}
                  value={formData.especificaciones}
                  onChange={(e) => handleInputChange('especificaciones', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="Especificaciones técnicas..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rendimiento
                </label>
                <textarea
                  rows={3}
                  value={formData.rendimiento}
                  onChange={(e) => handleInputChange('rendimiento', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="Información de rendimiento..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => handleInputChange('estado', e.target.value)}
                disabled={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
              >
                <option value="activo">Activo</option>
                <option value="inactivo">Inactivo</option>
                <option value="revision">En Revisión</option>
              </select>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors duration-200"
            >
              {isReadOnly ? 'Cerrar' : 'Cancelar'}
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Crear Concepto'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Concepto'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConceptosObra;