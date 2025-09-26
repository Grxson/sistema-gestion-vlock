import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelector from '../ui/CategorySelector';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  TagIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  XMarkIcon,
  CheckIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const PreciosUnitarios = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados del componente
  const [precios, setPrecios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPrecio, setSelectedPrecio] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    region: '',
    vigencia_desde: '',
    vigencia_hasta: '',
    precio_min: '',
    precio_max: '',
    estado: 'vigente'
  });
  
  const itemsPerPage = 10;

  // Regiones predefinidas
  const regiones = [
    'Región 1 - Norte',
    'Región 2 - Centro',
    'Región 3 - Sur',
    'Región 4 - Golfo',
    'Región 5 - Pacífico',
    'Región 6 - Península'
  ];

  // Estados de vigencia
  const estados = [
    'vigente',
    'vencido',
    'programado',
    'cancelado'
  ];

  // Cargar precios
  const loadPrecios = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada a la API
      const mockData = [
        {
          id: 1,
          concepto_id: 1,
          concepto: {
            codigo: 'CON-001',
            nombre: 'Excavación manual',
            unidad: 'm³'
          },
          region: 'Región 2 - Centro',
          precio: 150.00,
          vigencia_desde: '2024-01-01',
          vigencia_hasta: '2024-12-31',
          estado: 'vigente',
          created_at: new Date()
        },
        {
          id: 2,
          concepto_id: 2,
          concepto: {
            codigo: 'CON-002',
            nombre: 'Concreto f\'c=200 kg/cm²',
            unidad: 'm³'
          },
          region: 'Región 2 - Centro',
          precio: 2800.00,
          vigencia_desde: '2024-01-01',
          vigencia_hasta: '2024-12-31',
          estado: 'vigente',
          created_at: new Date()
        }
      ];
      setPrecios(mockData);
    } catch (error) {
      console.error('Error loading precios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrecios();
  }, []);

  // Filtrar precios
  const filteredPrecios = precios.filter(precio => {
    const matchesSearch = precio.concepto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         precio.concepto.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = !selectedRegion || precio.region === selectedRegion;
    const matchesEstado = !filters.estado || precio.estado === filters.estado;
    
    return matchesSearch && matchesRegion && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPrecios.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrecios = filteredPrecios.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleCreatePrecio = () => {
    setModalMode('create');
    setSelectedPrecio(null);
    setShowModal(true);
  };

  const handleEditPrecio = (precio) => {
    setModalMode('edit');
    setSelectedPrecio(precio);
    setShowModal(true);
  };

  const handleViewPrecio = (precio) => {
    setModalMode('view');
    setSelectedPrecio(precio);
    setShowModal(true);
  };

  const handleDeletePrecio = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este precio?')) {
      try {
        // TODO: Implementar llamada a la API
        setPrecios(precios.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting precio:', error);
      }
    }
  };

  const handleDuplicatePrecio = (precio) => {
    setModalMode('duplicate');
    setSelectedPrecio({ ...precio, id: null });
    setShowModal(true);
  };

  const handleSavePrecio = async (precioData) => {
    try {
      setLoading(true);
      
      if (modalMode === 'create' || modalMode === 'duplicate') {
        // Generar nuevo ID
        const newId = Math.max(...precios.map(p => p.id), 0) + 1;
        
        const newPrecio = {
          ...precioData,
          id: newId,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        setPrecios([...precios, newPrecio]);
      } else if (modalMode === 'edit') {
        setPrecios(precios.map(p => 
          p.id === selectedPrecio.id 
            ? { ...precioData, id: selectedPrecio.id, updated_at: new Date() }
            : p
        ));
      }
      
      setShowModal(false);
      // TODO: Integrar con API real
    } catch (error) {
      console.error('Error saving precio:', error);
    } finally {
      setLoading(false);
    }
  };

  // Utilidades
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const getEstadoBadge = (estado, vigenciaHasta) => {
    const today = new Date();
    const vencimiento = new Date(vigenciaHasta);
    
    let colorClasses = '';
    let displayText = estado;
    
    if (estado === 'vigente') {
      if (vencimiento < today) {
        colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
        displayText = 'Vencido';
      } else if (vencimiento < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        colorClasses = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
        displayText = 'Por vencer';
      } else {
        colorClasses = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        displayText = 'Vigente';
      }
    } else {
      switch (estado) {
        case 'vencido':
          colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
          break;
        case 'programado':
          colorClasses = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
          break;
        case 'cancelado':
          colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
          break;
        default:
          colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
      }
    }
    
    return { colorClasses, displayText };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CurrencyDollarIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Precios Unitarios
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administrar precios regionales por concepto
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                <TagIcon className="h-4 w-4 mr-1" />
                Beta
              </span>
              <button
                onClick={handleCreatePrecio}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Precio
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
              placeholder="Buscar por concepto o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todas las regiones</option>
              {regiones.map(region => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>

            <select
              value={filters.estado}
              onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado} value={estado}>
                  {estado.charAt(0).toUpperCase() + estado.slice(1)}
                </option>
              ))}
            </select>

            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={filters.vigencia_desde}
                onChange={(e) => setFilters(prev => ({ ...prev, vigencia_desde: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Desde"
              />
              <span className="text-gray-400">a</span>
              <input
                type="date"
                value={filters.vigencia_hasta}
                onChange={(e) => setFilters(prev => ({ ...prev, vigencia_hasta: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de precios */}
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
                        Concepto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Región
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vigencia
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
                    {paginatedPrecios.map((precio) => {
                      const { colorClasses, displayText } = getEstadoBadge(precio.estado, precio.vigencia_hasta);
                      
                      return (
                        <tr key={precio.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {precio.concepto.codigo} - {precio.concepto.nombre}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Unidad: {precio.concepto.unidad}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <MapPinIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {precio.region}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              ${precio.precio?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              por {precio.concepto.unidad}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div>{formatDate(precio.vigencia_desde)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  hasta {formatDate(precio.vigencia_hasta)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
                              {displayText}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewPrecio(precio)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-150"
                                title="Ver detalles"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditPrecio(precio)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-150"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicatePrecio(precio)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-150"
                                title="Duplicar"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePrecio(precio.id)}
                                className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 transition-colors duration-150"
                                title="Eliminar"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-200 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredPrecios.length)} de {filteredPrecios.length} resultados
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

      {/* Modal placeholder - TODO: Implementar modal component */}
      {/* Modal de PreciosUnitarios - CRUD Completo */}
      {showModal && (
        <PrecioUnitarioModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          precio={selectedPrecio}
          onSave={handleSavePrecio}
        />
      )}
    </div>
  );
};

// Componente PrecioUnitarioModal - CRUD completo
const PrecioUnitarioModal = ({ isOpen, onClose, mode, precio, onSave }) => {
  const [formData, setFormData] = useState({
    concepto_codigo: '',
    concepto_nombre: '',
    region: 'Región 1 - Norte',
    precio_unitario: '',
    moneda: 'MXN',
    vigencia_desde: '',
    vigencia_hasta: '',
    factor_indirectos: '1.25',
    factor_utilidad: '1.10',
    precio_final: '',
    proveedor: '',
    observaciones: '',
    estado: 'activo'
  });

  const [errors, setErrors] = useState({});

  // Opciones disponibles
  const regiones = [
    'Región 1 - Norte',
    'Región 2 - Centro', 
    'Región 3 - Sur',
    'Región 4 - Golfo',
    'Región 5 - Pacífico',
    'Región 6 - Península'
  ];

  const monedas = ['MXN', 'USD', 'EUR'];

  useEffect(() => {
    if (precio && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setFormData({
        concepto_codigo: precio.concepto_codigo || '',
        concepto_nombre: precio.concepto_nombre || '',
        region: precio.region || 'Región 1 - Norte',
        precio_unitario: precio.precio_unitario || '',
        moneda: precio.moneda || 'MXN',
        vigencia_desde: precio.vigencia_desde ? precio.vigencia_desde.split('T')[0] : '',
        vigencia_hasta: precio.vigencia_hasta ? precio.vigencia_hasta.split('T')[0] : '',
        factor_indirectos: precio.factor_indirectos || '1.25',
        factor_utilidad: precio.factor_utilidad || '1.10',
        precio_final: precio.precio_final || '',
        proveedor: precio.proveedor || '',
        observaciones: precio.observaciones || '',
        estado: precio.estado || 'activo'
      });
    } else {
      // Reset form for create mode
      setFormData({
        concepto_codigo: '',
        concepto_nombre: '',
        region: 'Región 1 - Norte',
        precio_unitario: '',
        moneda: 'MXN',
        vigencia_desde: '',
        vigencia_hasta: '',
        factor_indirectos: '1.25',
        factor_utilidad: '1.10',
        precio_final: '',
        proveedor: '',
        observaciones: '',
        estado: 'activo'
      });
    }
    setErrors({});
  }, [precio, mode, isOpen]);

  // Calcular precio final automáticamente
  useEffect(() => {
    const precioBase = parseFloat(formData.precio_unitario) || 0;
    const factorIndirectos = parseFloat(formData.factor_indirectos) || 1;
    const factorUtilidad = parseFloat(formData.factor_utilidad) || 1;
    
    if (precioBase > 0) {
      const precioFinal = precioBase * factorIndirectos * factorUtilidad;
      setFormData(prev => ({ ...prev, precio_final: precioFinal.toFixed(2) }));
    }
  }, [formData.precio_unitario, formData.factor_indirectos, formData.factor_utilidad]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.concepto_codigo.trim()) {
      newErrors.concepto_codigo = 'El código del concepto es requerido';
    }
    if (!formData.concepto_nombre.trim()) {
      newErrors.concepto_nombre = 'El nombre del concepto es requerido';
    }
    if (!formData.precio_unitario || formData.precio_unitario <= 0) {
      newErrors.precio_unitario = 'El precio unitario debe ser mayor a 0';
    }
    if (!formData.vigencia_desde) {
      newErrors.vigencia_desde = 'La fecha de inicio de vigencia es requerida';
    }
    if (!formData.vigencia_hasta) {
      newErrors.vigencia_hasta = 'La fecha de fin de vigencia es requerida';
    }
    if (formData.vigencia_desde && formData.vigencia_hasta) {
      if (new Date(formData.vigencia_desde) >= new Date(formData.vigencia_hasta)) {
        newErrors.vigencia_hasta = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
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
      <div className="bg-white dark:bg-dark-200 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-lg">
                <CurrencyDollarIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' && 'Crear Nuevo Precio'}
                  {mode === 'edit' && 'Editar Precio Unitario'}
                  {mode === 'view' && 'Detalles del Precio'}
                  {mode === 'duplicate' && 'Duplicar Precio'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isReadOnly ? 'Ver información del precio unitario' : 'Gestión de precios regionales por concepto'}
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
            {/* Información del Concepto */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Información del Concepto
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código del Concepto *
                  </label>
                  <input
                    type="text"
                    value={formData.concepto_codigo}
                    onChange={(e) => handleInputChange('concepto_codigo', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      errors.concepto_codigo 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                    placeholder="CON-001"
                  />
                  {errors.concepto_codigo && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.concepto_codigo}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre del Concepto *
                  </label>
                  <input
                    type="text"
                    value={formData.concepto_nombre}
                    onChange={(e) => handleInputChange('concepto_nombre', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      errors.concepto_nombre 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                    placeholder="Excavación manual"
                  />
                  {errors.concepto_nombre && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.concepto_nombre}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información Regional y Monetaria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Región *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <select
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  >
                    {regiones.map(region => (
                      <option key={region} value={region}>{region}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Moneda *
                </label>
                <select
                  value={formData.moneda}
                  onChange={(e) => handleInputChange('moneda', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                >
                  {monedas.map(moneda => (
                    <option key={moneda} value={moneda}>{moneda}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Precios y Factores */}
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-3">
                Cálculo de Precios
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio Unitario Base *
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.precio_unitario}
                      onChange={(e) => handleInputChange('precio_unitario', e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                        errors.precio_unitario 
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
                  {errors.precio_unitario && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.precio_unitario}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Precio Final (Calculado)
                  </label>
                  <div className="relative">
                    <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    <input
                      type="text"
                      value={formData.precio_final}
                      readOnly
                      className="w-full pl-10 pr-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-900 dark:text-green-100 font-semibold"
                      placeholder="Calculado automáticamente"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Factor Indirectos
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.factor_indirectos}
                    onChange={(e) => handleInputChange('factor_indirectos', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="1.25"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ej: 1.25 = 25% de indirectos</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Factor Utilidad
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={formData.factor_utilidad}
                    onChange={(e) => handleInputChange('factor_utilidad', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="1.10"
                  />
                  <p className="text-xs text-gray-500 mt-1">Ej: 1.10 = 10% de utilidad</p>
                </div>
              </div>
            </div>

            {/* Vigencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vigencia Desde *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.vigencia_desde}
                    onChange={(e) => handleInputChange('vigencia_desde', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      errors.vigencia_desde 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                  />
                </div>
                {errors.vigencia_desde && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vigencia_desde}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Vigencia Hasta *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.vigencia_hasta}
                    onChange={(e) => handleInputChange('vigencia_hasta', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      errors.vigencia_hasta 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                  />
                </div>
                {errors.vigencia_hasta && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.vigencia_hasta}</p>
                )}
              </div>
            </div>

            {/* Información Adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Proveedor
                </label>
                <div className="relative">
                  <BuildingOfficeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.proveedor}
                    onChange={(e) => handleInputChange('proveedor', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="Nombre del proveedor"
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
                  <option value="vencido">Vencido</option>
                  <option value="revision">En Revisión</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Observaciones
              </label>
              <textarea
                rows={3}
                value={formData.observaciones}
                onChange={(e) => handleInputChange('observaciones', e.target.value)}
                readOnly={isReadOnly}
                className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                  isReadOnly 
                    ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                    : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                placeholder="Observaciones sobre el precio..."
              />
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
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Crear Precio'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Precio'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreciosUnitarios;