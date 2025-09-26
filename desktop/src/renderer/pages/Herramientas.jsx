import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import HerramientaModal from '../components/modals/HerramientaModal';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  CogIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

const Herramientas = () => {
  const { user } = useAuth();
  const { isDarkMode } = useTheme();
  
  // Estados principales
  const [herramientas, setHerramientas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedHerramienta, setSelectedHerramienta] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [herramientaToDelete, setHerramientaToDelete] = useState(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState({
    categoria: '',
    estado: '',
    ubicacion: '',
    disponible: ''
  });

  const itemsPerPage = 10;

  // Categorías de herramientas
  const categorias = [
    'Herramientas Manuales',
    'Herramientas Eléctricas',
    'Maquinaria Pesada',
    'Equipos de Medición',
    'Equipos de Seguridad',
    'Herramientas de Corte',
    'Herramientas de Soldadura',
    'Equipos Hidráulicos'
  ];

  // Estados de herramientas
  const estados = [
    { value: 'disponible', label: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
    { value: 'prestado', label: 'Prestado', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
    { value: 'mantenimiento', label: 'Mantenimiento', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
    { value: 'reparacion', label: 'Reparación', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' }
  ];

  // Datos de ejemplo
  const herramientasEjemplo = [
    {
      id: 1,
      codigo: 'HER-001',
      nombre: 'Taladro Percutor',
      marca: 'Bosch',
      modelo: 'GSB 13 RE',
      categoria: 'Herramientas Eléctricas',
      estado: 'disponible',
      ubicacion: 'Almacén Principal',
      numero_serie: 'BS001234567',
      fecha_compra: '2024-01-15',
      valor_compra: 2500.00,
      empleado_asignado: null,
      fecha_ultimo_mantenimiento: '2024-08-01',
      proximo_mantenimiento: '2025-02-01',
      observaciones: 'En perfecto estado'
    },
    {
      id: 2,
      codigo: 'HER-002',
      nombre: 'Soldadora Inverter',
      marca: 'Lincoln Electric',
      modelo: 'Invertec V160-T',
      categoria: 'Herramientas de Soldadura',
      estado: 'prestado',
      ubicacion: 'Obra Central Park',
      numero_serie: 'LE987654321',
      fecha_compra: '2023-11-20',
      valor_compra: 8500.00,
      empleado_asignado: 'Juan Pérez',
      fecha_ultimo_mantenimiento: '2024-06-15',
      proximo_mantenimiento: '2024-12-15',
      observaciones: 'Prestado para proyecto especial'
    },
    {
      id: 3,
      codigo: 'HER-003',
      nombre: 'Compresor de Aire',
      marca: 'DeWalt',
      modelo: 'DCC020IB',
      categoria: 'Maquinaria Pesada',
      estado: 'mantenimiento',
      ubicacion: 'Taller de Mantenimiento',
      numero_serie: 'DW112233445',
      fecha_compra: '2023-08-10',
      valor_compra: 4200.00,
      empleado_asignado: null,
      fecha_ultimo_mantenimiento: '2024-09-20',
      proximo_mantenimiento: '2024-12-20',
      observaciones: 'Mantenimiento preventivo programado'
    },
    {
      id: 4,
      codigo: 'HER-004',
      nombre: 'Nivel Láser',
      marca: 'Bosch',
      modelo: 'GLL 3-80 P',
      categoria: 'Equipos de Medición',
      estado: 'disponible',
      ubicacion: 'Almacén Principal',
      numero_serie: 'BS445566778',
      fecha_compra: '2024-03-05',
      valor_compra: 3200.00,
      empleado_asignado: null,
      fecha_ultimo_mantenimiento: null,
      proximo_mantenimiento: '2025-03-05',
      observaciones: 'Herramienta nueva, sin uso intensivo'
    },
    {
      id: 5,
      codigo: 'HER-005',
      nombre: 'Martillo Demoledor',
      marca: 'Makita',
      modelo: 'HM1812',
      categoria: 'Herramientas Eléctricas',
      estado: 'reparacion',
      ubicacion: 'Taller de Reparación',
      numero_serie: 'MK778899001',
      fecha_compra: '2022-12-18',
      valor_compra: 6800.00,
      empleado_asignado: null,
      fecha_ultimo_mantenimiento: '2024-07-10',
      proximo_mantenimiento: '2025-01-10',
      observaciones: 'En reparación por daño en motor'
    }
  ];

  // Cargar herramientas
  const loadHerramientas = async () => {
    setLoading(true);
    try {
      // Simular llamada a API
      setTimeout(() => {
        setHerramientas(herramientasEjemplo);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error al cargar herramientas:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHerramientas();
  }, []);

  // Filtrar herramientas
  const filteredHerramientas = herramientas.filter(herramienta => {
    const matchesSearch = !searchTerm || 
      herramienta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.marca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      herramienta.modelo.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategoria = !selectedCategoria || herramienta.categoria === selectedCategoria;
    const matchesEstado = !selectedEstado || herramienta.estado === selectedEstado;

    return matchesSearch && matchesCategoria && matchesEstado;
  });

  // Paginación
  const totalPages = Math.ceil(filteredHerramientas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHerramientas = filteredHerramientas.slice(startIndex, startIndex + itemsPerPage);

  // Funciones de manejo
  const handleCreate = () => {
    setModalMode('create');
    setSelectedHerramienta(null);
    setShowModal(true);
  };

  const handleEdit = (herramienta) => {
    setModalMode('edit');
    setSelectedHerramienta(herramienta);
    setShowModal(true);
  };

  const handleView = (herramienta) => {
    setModalMode('view');
    setSelectedHerramienta(herramienta);
    setShowModal(true);
  };

  const handleDelete = (herramienta) => {
    setHerramientaToDelete(herramienta);
    setShowConfirmModal(true);
  };

  const confirmDelete = () => {
    if (herramientaToDelete) {
      setHerramientas(prev => prev.filter(h => h.id !== herramientaToDelete.id));
      setHerramientaToDelete(null);
    }
  };

  const handleDuplicate = (herramienta) => {
    setModalMode('duplicate');
    setSelectedHerramienta(herramienta);
    setShowModal(true);
  };

  const handleSave = (formData) => {
    if (modalMode === 'create' || modalMode === 'duplicate') {
      const newId = Math.max(...herramientas.map(h => h.id), 0) + 1;
      const newHerramienta = {
        ...formData,
        id: newId
      };
      setHerramientas(prev => [...prev, newHerramienta]);
    } else if (modalMode === 'edit') {
      setHerramientas(prev => 
        prev.map(h => h.id === selectedHerramienta.id ? { ...formData, id: selectedHerramienta.id } : h)
      );
    }
    setShowModal(false);
    setSelectedHerramienta(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedHerramienta(null);
  };

  const getEstadoConfig = (estado) => {
    return estados.find(e => e.value === estado) || estados[0];
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                <WrenchScrewdriverIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Inventario de Herramientas
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Gestiona el inventario de herramientas y equipos de trabajo
                </p>
              </div>
            </div>
            
            <button
              onClick={handleCreate}
              className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Herramienta
            </button>
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="px-6 py-4 bg-white dark:bg-dark-100 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar herramientas por nombre, código, marca o modelo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-dark-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center space-x-3">
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria} value={categoria}>{categoria}</option>
              ))}
            </select>

            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-200 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Todos los estados</option>
              {estados.map(estado => (
                <option key={estado.value} value={estado.value}>{estado.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de herramientas */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {filteredHerramientas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Herramienta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ubicación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Empleado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Próximo Mantenimiento
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
                {paginatedHerramientas.map((herramienta) => {
                  const estadoConfig = getEstadoConfig(herramienta.estado);
                  
                  return (
                    <tr key={herramienta.id} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center">
                              <WrenchScrewdriverIcon className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {herramienta.nombre}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {herramienta.codigo} • {herramienta.marca} {herramienta.modelo}
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {herramienta.categoria}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${estadoConfig.color}`}>
                          {estadoConfig.label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {herramienta.ubicacion}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {herramienta.empleado_asignado ? (
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 mr-1 text-gray-400" />
                              {herramienta.empleado_asignado}
                            </div>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Sin asignar</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900 dark:text-white">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {formatDate(herramienta.proximo_mantenimiento)}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(herramienta)}
                            className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(herramienta)}
                            className="text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                            title="Editar herramienta"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(herramienta)}
                            className="text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                            title="Duplicar herramienta"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(herramienta)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title="Eliminar herramienta"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hay herramientas
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comienza agregando una nueva herramienta al inventario.
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Herramienta
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-dark-100 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredHerramientas.length)} de {filteredHerramientas.length} herramientas
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-sm text-gray-900 dark:text-white">
              {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-dark-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-dark-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <HerramientaModal
        isOpen={showModal}
        onClose={handleCloseModal}
        mode={modalMode}
        herramienta={selectedHerramienta}
        onSave={handleSave}
      />

      {/* Modal de Confirmación */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Herramienta"
        message={herramientaToDelete ? `¿Estás seguro de eliminar la herramienta "${herramientaToDelete.nombre}"? Esta acción no se puede deshacer.` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default Herramientas;