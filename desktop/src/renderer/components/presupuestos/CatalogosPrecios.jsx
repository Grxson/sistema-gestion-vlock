import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelector from '../ui/CategorySelector';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  TagIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  BookOpenIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline';

const CatalogosPrecios = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados del componente
  const [catalogos, setCatalogos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedCatalogo, setSelectedCatalogo] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    tipo: '',
    estado: 'activo',
    fecha_desde: '',
    fecha_hasta: '',
    organismo: ''
  });
  
  const itemsPerPage = 10;

  // Tipos de catálogo
  const tipos = [
    'Oficial',
    'Especializado',
    'Regional',
    'Empresarial',
    'Temporal'
  ];

  // Estados
  const estados = [
    'activo',
    'inactivo',
    'en_revision',
    'archivado'
  ];

  // Organismos
  const organismos = [
    'CMIC',
    'SEDATU',
    'SCT',
    'CFE',
    'PEMEX',
    'IMSS',
    'Empresarial',
    'Otro'
  ];

  // Cargar catálogos
  const loadCatalogos = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada a la API
      const mockData = [
        {
          id: 1,
          codigo: 'CAT-CMIC-2024',
          nombre: 'Catálogo CMIC 2024',
          descripcion: 'Catálogo oficial de la Cámara Mexicana de la Industria de la Construcción 2024',
          tipo: 'Oficial',
          organismo: 'CMIC',
          version: '2024.1',
          fecha_publicacion: '2024-01-01',
          fecha_vigencia_inicio: '2024-01-01',
          fecha_vigencia_fin: '2024-12-31',
          estado: 'activo',
          total_conceptos: 1250,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: 2,
          codigo: 'CAT-EMP-001',
          nombre: 'Catálogo Especializado Estructuras',
          descripcion: 'Catálogo especializado para trabajos de estructuras de concreto',
          tipo: 'Especializado',
          organismo: 'Empresarial',
          version: '1.0',
          fecha_publicacion: '2024-02-01',
          fecha_vigencia_inicio: '2024-02-01',
          fecha_vigencia_fin: '2024-12-31',
          estado: 'activo',
          total_conceptos: 350,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      setCatalogos(mockData);
    } catch (error) {
      console.error('Error loading catalogos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogos();
  }, []);

  // Filtrar catálogos
  const filteredCatalogos = catalogos.filter(catalogo => {
    const matchesSearch = catalogo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalogo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         catalogo.organismo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo = !selectedTipo || catalogo.tipo === selectedTipo;
    const matchesEstado = !filters.estado || catalogo.estado === filters.estado;
    
    return matchesSearch && matchesTipo && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredCatalogos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCatalogos = filteredCatalogos.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleCreateCatalogo = () => {
    setModalMode('create');
    setSelectedCatalogo(null);
    setShowModal(true);
  };

  const handleEditCatalogo = (catalogo) => {
    setModalMode('edit');
    setSelectedCatalogo(catalogo);
    setShowModal(true);
  };

  const handleViewCatalogo = (catalogo) => {
    setModalMode('view');
    setSelectedCatalogo(catalogo);
    setShowModal(true);
  };

  const handleDeleteCatalogo = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este catálogo?')) {
      try {
        // TODO: Implementar llamada a la API
        setCatalogos(catalogos.filter(c => c.id !== id));
      } catch (error) {
        console.error('Error deleting catalogo:', error);
      }
    }
  };

  const handleDuplicateCatalogo = (catalogo) => {
    setModalMode('duplicate');
    setSelectedCatalogo({ ...catalogo, id: null, codigo: '' });
    setShowModal(true);
  };

  const handleSaveCatalogo = async (catalogoData) => {
    try {
      setLoading(true);
      
      if (modalMode === 'create' || modalMode === 'duplicate') {
        // Generar nuevo ID y código
        const newId = Math.max(...catalogos.map(c => c.id), 0) + 1;
        const newCodigo = modalMode === 'duplicate' ? 
          `CAT-${String(newId).padStart(3, '0')}` : 
          catalogoData.codigo;
        
        const newCatalogo = {
          ...catalogoData,
          id: newId,
          codigo: newCodigo,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        setCatalogos([...catalogos, newCatalogo]);
      } else if (modalMode === 'edit') {
        setCatalogos(catalogos.map(c => 
          c.id === selectedCatalogo.id 
            ? { ...catalogoData, id: selectedCatalogo.id, updated_at: new Date() }
            : c
        ));
      }
      
      setShowModal(false);
      // TODO: Integrar con API real
    } catch (error) {
      console.error('Error saving catalogo:', error);
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

  const getEstadoBadge = (estado, fechaVigenciaFin) => {
    const today = new Date();
    const vencimiento = new Date(fechaVigenciaFin);
    
    let colorClasses = '';
    let icon = null;
    let displayText = estado;
    
    if (estado === 'activo') {
      if (vencimiento < today) {
        colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
        icon = <ExclamationTriangleIcon className="h-3 w-3" />;
        displayText = 'Vencido';
      } else if (vencimiento < new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        colorClasses = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
        icon = <ClockIcon className="h-3 w-3" />;
        displayText = 'Por vencer';
      } else {
        colorClasses = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        icon = <CheckCircleIcon className="h-3 w-3" />;
        displayText = 'Activo';
      }
    } else {
      switch (estado) {
        case 'inactivo':
          colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
          icon = <ClockIcon className="h-3 w-3" />;
          displayText = 'Inactivo';
          break;
        case 'en_revision':
          colorClasses = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
          icon = <ClockIcon className="h-3 w-3" />;
          displayText = 'En Revisión';
          break;
        case 'archivado':
          colorClasses = 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
          icon = <CheckCircleIcon className="h-3 w-3" />;
          displayText = 'Archivado';
          break;
        default:
          colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
          icon = <ClockIcon className="h-3 w-3" />;
      }
    }
    
    return { colorClasses, icon, displayText };
  };

  const getTipoBadge = (tipo) => {
    const colorMap = {
      'Oficial': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      'Especializado': 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      'Regional': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      'Empresarial': 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      'Temporal': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
    };
    
    return colorMap[tipo] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ChartPieIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Catálogos de Precios
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Administrar catálogos especializados y oficiales
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                <TagIcon className="h-4 w-4 mr-1" />
                Beta
              </span>
              <button
                onClick={handleCreateCatalogo}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Catálogo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="px-6 py-4 bg-white dark:bg-dark-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Catálogos</p>
                <p className="text-2xl font-bold">{catalogos.length}</p>
              </div>
              <ChartPieIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Activos</p>
                <p className="text-2xl font-bold">{catalogos.filter(c => c.estado === 'activo').length}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Oficiales</p>
                <p className="text-2xl font-bold">{catalogos.filter(c => c.tipo === 'Oficial').length}</p>
              </div>
              <BuildingOfficeIcon className="h-8 w-8 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Conceptos</p>
                <p className="text-2xl font-bold">
                  {catalogos.reduce((sum, c) => sum + c.total_conceptos, 0).toLocaleString()}
                </p>
              </div>
              <TagIcon className="h-8 w-8 text-orange-200" />
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
              placeholder="Buscar por nombre, código u organismo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedTipo}
              onChange={(e) => setSelectedTipo(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los tipos</option>
              {tipos.map(tipo => (
                <option key={tipo} value={tipo}>{tipo}</option>
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
                  {estado.charAt(0).toUpperCase() + estado.slice(1).replace('_', ' ')}
                </option>
              ))}
            </select>

            <select
              value={filters.organismo}
              onChange={(e) => setFilters(prev => ({ ...prev, organismo: e.target.value }))}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Todos los organismos</option>
              {organismos.map(organismo => (
                <option key={organismo} value={organismo}>{organismo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de catálogos */}
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
                        Catálogo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tipo / Organismo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Vigencia
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Conceptos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Versión
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                    {paginatedCatalogos.map((catalogo) => {
                      const { colorClasses, icon, displayText } = getEstadoBadge(catalogo.estado, catalogo.fecha_vigencia_fin);
                      
                      return (
                        <tr key={catalogo.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {catalogo.codigo}
                              </div>
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                                {catalogo.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {catalogo.descripcion}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTipoBadge(catalogo.tipo)}`}>
                                {catalogo.tipo}
                              </span>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                                {catalogo.organismo}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div>{formatDate(catalogo.fecha_vigencia_inicio)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  hasta {formatDate(catalogo.fecha_vigencia_fin)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {catalogo.total_conceptos?.toLocaleString()} conceptos
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
                              {icon}
                              <span className="ml-1">{displayText}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            v{catalogo.version}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewCatalogo(catalogo)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-150"
                                title="Ver detalles"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditCatalogo(catalogo)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-150"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicateCatalogo(catalogo)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-150"
                                title="Duplicar"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCatalogo(catalogo.id)}
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
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredCatalogos.length)} de {filteredCatalogos.length} resultados
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

      {/* Modal de Catalogos - CRUD Completo */}
      {showModal && (
        <CatalogoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          catalogo={selectedCatalogo}
          onSave={handleSaveCatalogo}
        />
      )}
    </div>
  );
};

// Componente CatalogoModal - CRUD completo
const CatalogoModal = ({ isOpen, onClose, mode, catalogo, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    version: '1.0',
    tipo_catalogo: 'regional',
    region: 'Región 1 - Norte',
    fecha_vigencia: '',
    fecha_publicacion: new Date().toISOString().split('T')[0],
    estado: 'borrador',
    total_conceptos: '',
    total_precios: '',
    observaciones: ''
  });

  const [errors, setErrors] = useState({});

  // Opciones disponibles
  const regiones = [
    'Región 1 - Norte', 'Región 2 - Centro', 'Región 3 - Sur',
    'Región 4 - Golfo', 'Región 5 - Pacífico', 'Región 6 - Península'
  ];

  const tiposCatalogo = [
    { value: 'regional', label: 'Regional' },
    { value: 'nacional', label: 'Nacional' },
    { value: 'especializado', label: 'Especializado' },
    { value: 'corporativo', label: 'Corporativo' }
  ];

  const estados = [
    { value: 'borrador', label: 'Borrador', color: 'gray' },
    { value: 'revision', label: 'En Revisión', color: 'yellow' },
    { value: 'publicado', label: 'Publicado', color: 'green' },
    { value: 'obsoleto', label: 'Obsoleto', color: 'red' }
  ];

  useEffect(() => {
    if (catalogo && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setFormData({
        codigo: mode === 'duplicate' ? '' : catalogo.codigo || '',
        nombre: catalogo.nombre || '',
        descripcion: catalogo.descripcion || '',
        version: catalogo.version || '1.0',
        tipo_catalogo: catalogo.tipo_catalogo || 'regional',
        region: catalogo.region || 'Región 1 - Norte',
        fecha_vigencia: catalogo.fecha_vigencia ? catalogo.fecha_vigencia.split('T')[0] : '',
        fecha_publicacion: catalogo.fecha_publicacion ? catalogo.fecha_publicacion.split('T')[0] : new Date().toISOString().split('T')[0],
        estado: catalogo.estado || 'borrador',
        total_conceptos: catalogo.total_conceptos || '',
        total_precios: catalogo.total_precios || '',
        observaciones: catalogo.observaciones || ''
      });
    } else {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        version: '1.0',
        tipo_catalogo: 'regional',
        region: 'Región 1 - Norte',
        fecha_vigencia: '',
        fecha_publicacion: today,
        estado: 'borrador',
        total_conceptos: '',
        total_precios: '',
        observaciones: ''
      });
    }
    setErrors({});
  }, [catalogo, mode, isOpen]);

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
      newErrors.nombre = 'El nombre del catálogo es requerido';
    }
    if (!formData.fecha_vigencia) {
      newErrors.fecha_vigencia = 'La fecha de vigencia es requerida';
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
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <BookOpenIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' && 'Crear Nuevo Catálogo'}
                  {mode === 'edit' && 'Editar Catálogo'}
                  {mode === 'view' && 'Detalles del Catálogo'}
                  {mode === 'duplicate' && 'Duplicar Catálogo'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isReadOnly ? 'Ver información del catálogo de precios' : 'Gestión de catálogos de precios regionales'}
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
                  Código del Catálogo *
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
                  placeholder="CAT-001"
                />
                {errors.codigo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codigo}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Versión
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  readOnly={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  placeholder="1.0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Catálogo *
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
                placeholder="Catálogo de Precios Región Centro 2024"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Catálogo
                </label>
                <select
                  value={formData.tipo_catalogo}
                  onChange={(e) => handleInputChange('tipo_catalogo', e.target.value)}
                  disabled={isReadOnly}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly 
                      ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                      : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                  } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                >
                  {tiposCatalogo.map(tipo => (
                    <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Región Aplicable
                </label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  disabled={isReadOnly || formData.tipo_catalogo === 'nacional'}
                  className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                    isReadOnly || formData.tipo_catalogo === 'nacional'
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
                placeholder="Descripción del catálogo de precios..."
              />
            </div>

            {/* Información de Vigencia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Publicación
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fecha_publicacion}
                    onChange={(e) => handleInputChange('fecha_publicacion', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fecha de Vigencia *
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fecha_vigencia}
                    onChange={(e) => handleInputChange('fecha_vigencia', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                      errors.fecha_vigencia 
                        ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                        : 'border-gray-300 dark:border-gray-600'
                    } ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } text-gray-900 dark:text-white`}
                  />
                </div>
                {errors.fecha_vigencia && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha_vigencia}</p>
                )}
              </div>
            </div>

            {/* Estadísticas del Catálogo */}
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-300 mb-3">
                Estadísticas del Catálogo
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total de Conceptos
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_conceptos}
                    onChange={(e) => handleInputChange('total_conceptos', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Total de Precios
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.total_precios}
                    onChange={(e) => handleInputChange('total_precios', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-orange-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="0"
                  />
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
                    {estados.map(estado => (
                      <option key={estado.value} value={estado.value}>{estado.label}</option>
                    ))}
                  </select>
                </div>
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
                placeholder="Notas adicionales sobre el catálogo..."
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
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Crear Catálogo'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Catálogo'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogosPrecios;