import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import CategorySelector from '../ui/CategorySelector';
import { PresupuestoService } from '../../services/presupuestos/presupuestoService';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  DocumentDuplicateIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon,
  CalendarIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  XMarkIcon,
  CheckIcon,
  CurrencyDollarIcon,
  UserIcon,
  BuildingOfficeIcon,
  ClipboardDocumentListIcon
} from '@heroicons/react/24/outline';

const Presupuestos = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados del componente
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPresupuesto, setSelectedPresupuesto] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    estado: '',
    fecha_desde: '',
    fecha_hasta: '',
    monto_min: '',
    monto_max: '',
    cliente: ''
  });
  
  const itemsPerPage = 10;

  // Estados de presupuesto
  const estados = [
    'borrador',
    'revision',
    'aprobado',
    'rechazado',
    'vigente',
    'vencido',
    'ejecutado'
  ];

  // Cargar presupuestos
  const loadPresupuestos = async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        ...filters
      };

      const response = await PresupuestoService.getAll(params);
      if (response.success) {
        setPresupuestos(response.data);
      }
    } catch (error) {
      console.error('Error loading presupuestos:', error);
      // Fallback con datos mock en caso de error
      const mockData = [
        {
          id: 1,
          codigo: 'PRES-2024-001',
          nombre: 'Construcción Casa Habitación',
          descripcion: 'Presupuesto para construcción de casa habitación de 120m²',
          cliente: 'Juan Pérez González',
          fecha_elaboracion: '2024-01-15',
          fecha_vigencia: '2024-03-15',
          monto_total: 850000.00,
          estado: 'aprobado',
          version: '1.2',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      setPresupuestos(mockData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPresupuestos();
  }, []);

  // Filtrar presupuestos
  const filteredPresupuestos = presupuestos.filter(presupuesto => {
    const matchesSearch = presupuesto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         presupuesto.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         presupuesto.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = !selectedEstado || presupuesto.estado === selectedEstado;
    
    return matchesSearch && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredPresupuestos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPresupuestos = filteredPresupuestos.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleCreatePresupuesto = () => {
    setModalMode('create');
    setSelectedPresupuesto(null);
    setShowModal(true);
  };

  const handleEditPresupuesto = (presupuesto) => {
    setModalMode('edit');
    setSelectedPresupuesto(presupuesto);
    setShowModal(true);
  };

  const handleViewPresupuesto = (presupuesto) => {
    setModalMode('view');
    setSelectedPresupuesto(presupuesto);
    setShowModal(true);
  };

  const handleDeletePresupuesto = async (id) => {
    if (window.confirm('¿Está seguro de eliminar este presupuesto?')) {
      try {
        // TODO: Implementar llamada a la API
        setPresupuestos(presupuestos.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting presupuesto:', error);
      }
    }
  };

  const handleDuplicatePresupuesto = (presupuesto) => {
    setModalMode('duplicate');
    setSelectedPresupuesto({ ...presupuesto, id: null, codigo: '' });
    setShowModal(true);
  };

  const handleSavePresupuesto = async (presupuestoData) => {
    try {
      setLoading(true);
      
      if (modalMode === 'create' || modalMode === 'duplicate') {
        // Generar nuevo ID y código
        const newId = Math.max(...presupuestos.map(p => p.id), 0) + 1;
        const newCodigo = modalMode === 'duplicate' ? 
          `PRES-${String(newId).padStart(4, '0')}` : 
          presupuestoData.codigo;
        
        const newPresupuesto = {
          ...presupuestoData,
          id: newId,
          codigo: newCodigo,
          created_at: new Date(),
          updated_at: new Date()
        };
        
        setPresupuestos([...presupuestos, newPresupuesto]);
      } else if (modalMode === 'edit') {
        setPresupuestos(presupuestos.map(p => 
          p.id === selectedPresupuesto.id 
            ? { ...presupuestoData, id: selectedPresupuesto.id, updated_at: new Date() }
            : p
        ));
      }
      
      setShowModal(false);
      // TODO: Integrar con API real
    } catch (error) {
      console.error('Error saving presupuesto:', error);
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

  const getEstadoBadge = (estado, fechaVigencia) => {
    const today = new Date();
    const vencimiento = new Date(fechaVigencia);
    
    let colorClasses = '';
    let icon = null;
    
    switch (estado) {
      case 'borrador':
        colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
        icon = <PencilIcon className="h-3 w-3" />;
        break;
      case 'revision':
        colorClasses = 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
        icon = <ClockIcon className="h-3 w-3" />;
        break;
      case 'aprobado':
        colorClasses = 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
        icon = <CheckCircleIcon className="h-3 w-3" />;
        break;
      case 'rechazado':
        colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
        icon = <ExclamationTriangleIcon className="h-3 w-3" />;
        break;
      case 'vigente':
        if (vencimiento < today) {
          colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
          icon = <ExclamationTriangleIcon className="h-3 w-3" />;
        } else {
          colorClasses = 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
          icon = <CheckCircleIcon className="h-3 w-3" />;
        }
        break;
      case 'vencido':
        colorClasses = 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
        icon = <ExclamationTriangleIcon className="h-3 w-3" />;
        break;
      case 'ejecutado':
        colorClasses = 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
        icon = <CheckCircleIcon className="h-3 w-3" />;
        break;
      default:
        colorClasses = 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-300';
        icon = <ClockIcon className="h-3 w-3" />;
    }
    
    return { colorClasses, icon };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DocumentDuplicateIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Presupuestos
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Crear y gestionar presupuestos de obra
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
                <TagIcon className="h-4 w-4 mr-1" />
                Beta
              </span>
              <button
                onClick={handleCreatePresupuesto}
                className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Nuevo Presupuesto
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
                <p className="text-blue-100 text-sm">Total Presupuestos</p>
                <p className="text-2xl font-bold">{presupuestos.length}</p>
              </div>
              <DocumentDuplicateIcon className="h-8 w-8 text-blue-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Aprobados</p>
                <p className="text-2xl font-bold">{presupuestos.filter(p => p.estado === 'aprobado').length}</p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">En Revisión</p>
                <p className="text-2xl font-bold">{presupuestos.filter(p => p.estado === 'revision').length}</p>
              </div>
              <ClockIcon className="h-8 w-8 text-yellow-200" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Valor Total</p>
                <p className="text-xl font-bold">
                  ${presupuestos.reduce((sum, p) => sum + p.monto_total, 0).toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-purple-200" />
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
              placeholder="Buscar por nombre, código o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
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
                value={filters.fecha_desde}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_desde: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Desde"
              />
              <span className="text-gray-400">a</span>
              <input
                type="date"
                value={filters.fecha_hasta}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha_hasta: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-sm"
                placeholder="Hasta"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabla de presupuestos */}
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
                        Código / Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fechas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Monto Total
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
                    {paginatedPresupuestos.map((presupuesto) => {
                      const { colorClasses, icon } = getEstadoBadge(presupuesto.estado, presupuesto.fecha_vigencia);
                      
                      return (
                        <tr key={presupuesto.id} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {presupuesto.codigo}
                              </div>
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mt-1">
                                {presupuesto.nombre}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {presupuesto.descripcion}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {presupuesto.cliente}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900 dark:text-white">
                              <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <div>Elaborado: {formatDate(presupuesto.fecha_elaboracion)}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  Vigente hasta: {formatDate(presupuesto.fecha_vigencia)}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-gray-900 dark:text-white">
                              ${presupuesto.monto_total?.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses}`}>
                              {icon}
                              <span className="ml-1">
                                {presupuesto.estado.charAt(0).toUpperCase() + presupuesto.estado.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            v{presupuesto.version}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewPresupuesto(presupuesto)}
                                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 transition-colors duration-150"
                                title="Ver detalles"
                              >
                                <EyeIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleEditPresupuesto(presupuesto)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors duration-150"
                                title="Editar"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDuplicatePresupuesto(presupuesto)}
                                className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors duration-150"
                                title="Duplicar"
                              >
                                <DocumentDuplicateIcon className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePresupuesto(presupuesto.id)}
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
                      Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredPresupuestos.length)} de {filteredPresupuestos.length} resultados
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

      {/* Modal de Presupuestos - CRUD Completo */}
      {showModal && (
        <PresupuestoModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          mode={modalMode}
          presupuesto={selectedPresupuesto}
          onSave={handleSavePresupuesto}
        />
      )}
    </div>
  );
};

// Componente PresupuestoModal - CRUD completo
const PresupuestoModal = ({ isOpen, onClose, mode, presupuesto, onSave }) => {
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    cliente: '',
    contacto_cliente: '',
    direccion_proyecto: '',
    fecha_elaboracion: new Date().toISOString().split('T')[0],
    fecha_vigencia: '',
    region: 'Región 1 - Norte',
    monto_subtotal: '',
    monto_iva: '',
    monto_total: '',
    estado: 'borrador',
    observaciones: '',
    detalles: []
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('general');

  // Opciones disponibles
  const regiones = [
    'Región 1 - Norte', 'Región 2 - Centro', 'Región 3 - Sur',
    'Región 4 - Golfo', 'Región 5 - Pacífico', 'Región 6 - Península'
  ];

  const estados = [
    { value: 'borrador', label: 'Borrador', color: 'gray' },
    { value: 'revision', label: 'En Revisión', color: 'yellow' },
    { value: 'aprobado', label: 'Aprobado', color: 'green' },
    { value: 'rechazado', label: 'Rechazado', color: 'red' },
    { value: 'enviado', label: 'Enviado', color: 'blue' }
  ];

  useEffect(() => {
    if (presupuesto && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setFormData({
        codigo: mode === 'duplicate' ? '' : presupuesto.codigo || '',
        nombre: presupuesto.nombre || '',
        descripcion: presupuesto.descripcion || '',
        cliente: presupuesto.cliente || '',
        contacto_cliente: presupuesto.contacto_cliente || '',
        direccion_proyecto: presupuesto.direccion_proyecto || '',
        fecha_elaboracion: presupuesto.fecha_elaboracion ? presupuesto.fecha_elaboracion.split('T')[0] : new Date().toISOString().split('T')[0],
        fecha_vigencia: presupuesto.fecha_vigencia ? presupuesto.fecha_vigencia.split('T')[0] : '',
        region: presupuesto.region || 'Región 1 - Norte',
        monto_subtotal: presupuesto.monto_subtotal || '',
        monto_iva: presupuesto.monto_iva || '',
        monto_total: presupuesto.monto_total || '',
        estado: presupuesto.estado || 'borrador',
        observaciones: presupuesto.observaciones || '',
        detalles: presupuesto.detalles || []
      });
    } else {
      // Reset form for create mode
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        codigo: '',
        nombre: '',
        descripcion: '',
        cliente: '',
        contacto_cliente: '',
        direccion_proyecto: '',
        fecha_elaboracion: today,
        fecha_vigencia: '',
        region: 'Región 1 - Norte',
        monto_subtotal: '',
        monto_iva: '',
        monto_total: '',
        estado: 'borrador',
        observaciones: '',
        detalles: []
      });
    }
    setErrors({});
    setActiveTab('general');
  }, [presupuesto, mode, isOpen]);

  // Calcular montos automáticamente
  useEffect(() => {
    const subtotal = parseFloat(formData.monto_subtotal) || 0;
    if (subtotal > 0) {
      const iva = subtotal * 0.16; // 16% IVA
      const total = subtotal + iva;
      setFormData(prev => ({
        ...prev,
        monto_iva: iva.toFixed(2),
        monto_total: total.toFixed(2)
      }));
    }
  }, [formData.monto_subtotal]);

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
      newErrors.nombre = 'El nombre del proyecto es requerido';
    }
    if (!formData.cliente.trim()) {
      newErrors.cliente = 'El cliente es requerido';
    }
    if (!formData.fecha_vigencia) {
      newErrors.fecha_vigencia = 'La fecha de vigencia es requerida';
    }
    if (formData.fecha_elaboracion && formData.fecha_vigencia) {
      if (new Date(formData.fecha_elaboracion) >= new Date(formData.fecha_vigencia)) {
        newErrors.fecha_vigencia = 'La fecha de vigencia debe ser posterior a la fecha de elaboración';
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
      <div className="bg-white dark:bg-dark-200 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {mode === 'create' && 'Crear Nuevo Presupuesto'}
                  {mode === 'edit' && 'Editar Presupuesto'}
                  {mode === 'view' && 'Detalles del Presupuesto'}
                  {mode === 'duplicate' && 'Duplicar Presupuesto'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {isReadOnly ? 'Ver información completa del presupuesto' : 'Gestión profesional de presupuestos de construcción'}
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

        {/* Tab Navigation */}
        <div className="px-6 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('general')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'general'
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Información General
            </button>
            <button
              onClick={() => setActiveTab('financiera')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'financiera'
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Información Financiera
            </button>
            <button
              onClick={() => setActiveTab('detalles')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'detalles'
                  ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Conceptos y Detalles
            </button>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="p-6">
            {/* Tab: Información General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Código del Presupuesto *
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
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                      } text-gray-900 dark:text-white`}
                      placeholder="PRES-0001"
                    />
                    {errors.codigo && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.codigo}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Región *
                    </label>
                    <select
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
                      disabled={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isReadOnly 
                          ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
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
                    Nombre del Proyecto *
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
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                    } text-gray-900 dark:text-white`}
                    placeholder="Construcción Casa Habitación"
                  />
                  {errors.nombre && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.nombre}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cliente *
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.cliente}
                      onChange={(e) => handleInputChange('cliente', e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                        errors.cliente 
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                          : 'border-gray-300 dark:border-gray-600'
                      } ${
                        isReadOnly 
                          ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                      } text-gray-900 dark:text-white`}
                      placeholder="Nombre del cliente"
                    />
                  </div>
                  {errors.cliente && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cliente}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Contacto del Cliente
                    </label>
                    <input
                      type="text"
                      value={formData.contacto_cliente}
                      onChange={(e) => handleInputChange('contacto_cliente', e.target.value)}
                      readOnly={isReadOnly}
                      className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                        isReadOnly 
                          ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                      } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                      placeholder="Teléfono o email"
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
                          : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                      } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    >
                      {estados.map(estado => (
                        <option key={estado.value} value={estado.value}>{estado.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección del Proyecto
                  </label>
                  <textarea
                    rows={2}
                    value={formData.direccion_proyecto}
                    onChange={(e) => handleInputChange('direccion_proyecto', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="Dirección completa del proyecto"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Fecha de Elaboración *
                    </label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={formData.fecha_elaboracion}
                        onChange={(e) => handleInputChange('fecha_elaboracion', e.target.value)}
                        readOnly={isReadOnly}
                        className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                          isReadOnly 
                            ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                            : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
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
                            : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                        } text-gray-900 dark:text-white`}
                      />
                    </div>
                    {errors.fecha_vigencia && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.fecha_vigencia}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descripción del Proyecto
                  </label>
                  <textarea
                    rows={4}
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="Descripción detallada del alcance del proyecto..."
                  />
                </div>
              </div>
            )}

            {/* Tab: Información Financiera */}
            {activeTab === 'financiera' && (
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-green-900 dark:text-green-300 mb-4">
                    Resumen Financiero
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Subtotal
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.monto_subtotal}
                          onChange={(e) => handleInputChange('monto_subtotal', e.target.value)}
                          readOnly={isReadOnly}
                          className={`w-full pl-10 pr-3 py-2 border rounded-lg transition-colors ${
                            isReadOnly 
                              ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                              : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-green-500'
                          } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        IVA (16%)
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.monto_iva}
                          readOnly
                          className="w-full pl-10 pr-3 py-2 bg-gray-100 dark:bg-dark-300 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                          placeholder="Calculado automáticamente"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Total
                      </label>
                      <div className="relative">
                        <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                        <input
                          type="text"
                          value={formData.monto_total}
                          readOnly
                          className="w-full pl-10 pr-3 py-2 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg text-green-900 dark:text-green-100 font-semibold"
                          placeholder="Total calculado"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Observaciones Comerciales
                  </label>
                  <textarea
                    rows={4}
                    value={formData.observaciones}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    readOnly={isReadOnly}
                    className={`w-full px-3 py-2 border rounded-lg transition-colors ${
                      isReadOnly 
                        ? 'bg-gray-100 dark:bg-dark-300 cursor-not-allowed' 
                        : 'bg-white dark:bg-dark-200 focus:ring-2 focus:ring-purple-500'
                    } border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white`}
                    placeholder="Términos comerciales, condiciones de pago, garantías, etc..."
                  />
                </div>
              </div>
            )}

            {/* Tab: Conceptos y Detalles */}
            {activeTab === 'detalles' && (
              <div className="space-y-4">
                <div className="text-center py-8">
                  <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Gestión de Conceptos
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Los conceptos y partidas se gestionan desde el Advanced Presupuesto Creator
                  </p>
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Utilice "Nuevo Presupuesto" para acceder al creador completo con integración de catálogos
                  </p>
                </div>
              </div>
            )}
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
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <CheckIcon className="h-4 w-4" />
                <span>
                  {mode === 'create' && 'Crear Presupuesto'}
                  {mode === 'edit' && 'Guardar Cambios'}
                  {mode === 'duplicate' && 'Duplicar Presupuesto'}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Presupuestos;