import React, { useState, useEffect, useRef } from 'react';
import { 
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  TagIcon,
  ClipboardDocumentCheckIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { ConceptoObraService } from '../../../services/conceptoObra/conceptoObraService';
import { PreciosUnitariosService } from '../../../services/preciosUnitarios/preciosUnitariosService';

/**
 * Selector avanzado de partidas similar a Opus
 * Permite buscar, filtrar y agregar conceptos con precios actualizados
 */
const PartidaSelector = ({ 
  onAgregarPartida, 
  region = 'nacional',
  catalogoId = null,
  partidasExistentes = []
}) => {
  const [conceptos, setConceptos] = useState([]);
  const [conceptosFiltrados, setConceptosFiltrados] = useState([]);
  const [precios, setPrecios] = useState(new Map());
  const [loading, setLoading] = useState(false);
  
  // Estados de búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtros, setFiltros] = useState({
    categoria: '',
    unidad: '',
    tipo: '',
    con_precio: false,
    rango_precio: { min: '', max: '' }
  });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  // Estados de la UI
  const [categorias, setCategorias] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const conceptosPorPagina = 20;

  const searchInputRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, [region, catalogoId]);

  useEffect(() => {
    aplicarFiltros();
  }, [busqueda, filtros, conceptos]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Cargar conceptos
      const conceptosData = await ConceptoObraService.getAll({
        incluir_activos: true,
        ordenar_por: 'codigo'
      });
      
      // Cargar precios por región
      const preciosData = await PreciosUnitariosService.getAll({
        region,
        catalogo_id: catalogoId,
        vigentes: true
      });

      // Crear mapa de precios por concepto_id
      const mapPrecios = new Map();
      preciosData.forEach(precio => {
        mapPrecios.set(precio.concepto_id, precio);
      });

      setConceptos(conceptosData);
      setPrecios(mapPrecios);
      
      // Extraer categorías y unidades únicas
      const categoriasUnicas = [...new Set(conceptosData.map(c => c.categoria))].filter(Boolean);
      const unidadesUnicas = [...new Set(conceptosData.map(c => c.unidad))].filter(Boolean);
      
      setCategorias(categoriasUnicas.sort());
      setUnidades(unidadesUnicas.sort());
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const aplicarFiltros = () => {
    let resultado = conceptos;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      const terminoBusqueda = busqueda.toLowerCase();
      resultado = resultado.filter(concepto =>
        concepto.codigo.toLowerCase().includes(terminoBusqueda) ||
        concepto.descripcion.toLowerCase().includes(terminoBusqueda) ||
        concepto.unidad.toLowerCase().includes(terminoBusqueda) ||
        (concepto.categoria && concepto.categoria.toLowerCase().includes(terminoBusqueda))
      );
    }

    // Filtro por categoría
    if (filtros.categoria) {
      resultado = resultado.filter(c => c.categoria === filtros.categoria);
    }

    // Filtro por unidad
    if (filtros.unidad) {
      resultado = resultado.filter(c => c.unidad === filtros.unidad);
    }

    // Filtro por disponibilidad de precio
    if (filtros.con_precio) {
      resultado = resultado.filter(c => precios.has(c.id_concepto_obra));
    }

    // Filtro por rango de precio
    if (filtros.rango_precio.min || filtros.rango_precio.max) {
      resultado = resultado.filter(concepto => {
        const precio = precios.get(concepto.id_concepto_obra);
        if (!precio) return false;
        
        const precioValue = precio.precio;
        const min = parseFloat(filtros.rango_precio.min) || 0;
        const max = parseFloat(filtros.rango_precio.max) || Infinity;
        
        return precioValue >= min && precioValue <= max;
      });
    }

    // Excluir conceptos ya agregados
    const idsExistentes = new Set(partidasExistentes.map(p => p.concepto_id));
    resultado = resultado.filter(c => !idsExistentes.has(c.id_concepto_obra));

    setConceptosFiltrados(resultado);
    setPaginaActual(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      categoria: '',
      unidad: '',
      tipo: '',
      con_precio: false,
      rango_precio: { min: '', max: '' }
    });
    setBusqueda('');
    setMostrarFiltros(false);
  };

  const handleFiltroChange = (campo, valor, subcampo = null) => {
    if (subcampo) {
      setFiltros(prev => ({
        ...prev,
        [campo]: {
          ...prev[campo],
          [subcampo]: valor
        }
      }));
    } else {
      setFiltros(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  const agregarConcepto = (concepto) => {
    const precio = precios.get(concepto.id_concepto_obra);
    
    const nuevaPartida = {
      concepto_id: concepto.id_concepto_obra,
      codigo: concepto.codigo,
      descripcion: concepto.descripcion,
      unidad: concepto.unidad,
      categoria: concepto.categoria,
      precio_unitario: precio?.precio || 0,
      precio_fecha: precio?.fecha_vigencia || null,
      cantidad: 1,
      observaciones: ''
    };

    onAgregarPartida(nuevaPartida);
  };

  const formatearPrecio = (precio, moneda = 'MXN') => {
    if (!precio) return 'Sin precio';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda
    }).format(precio);
  };

  // Paginación
  const indiceInicio = (paginaActual - 1) * conceptosPorPagina;
  const indiceFin = indiceInicio + conceptosPorPagina;
  const conceptosPaginados = conceptosFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(conceptosFiltrados.length / conceptosPorPagina);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header con búsqueda */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center">
          <ClipboardDocumentCheckIcon className="h-5 w-5 text-primary-600 mr-2" />
          Catálogo de Conceptos
          {conceptosFiltrados.length > 0 && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              ({conceptosFiltrados.length} disponibles)
            </span>
          )}
        </h3>

        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            mostrarFiltros 
              ? 'text-primary-700 bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300'
              : 'text-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          <FunnelIcon className="h-4 w-4 mr-1" />
          Filtros
          <ChevronDownIcon className={`h-4 w-4 ml-1 transform transition-transform ${mostrarFiltros ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative mb-4">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Buscar por código, descripción, unidad..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
        />
        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        {busqueda && (
          <button
            onClick={() => setBusqueda('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4 border border-gray-200 dark:border-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filtro por categoría */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <select
                value={filtros.categoria}
                onChange={(e) => handleFiltroChange('categoria', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Todas las categorías</option>
                {categorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            {/* Filtro por unidad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Unidad
              </label>
              <select
                value={filtros.unidad}
                onChange={(e) => handleFiltroChange('unidad', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="">Todas las unidades</option>
                {unidades.map(unidad => (
                  <option key={unidad} value={unidad}>{unidad}</option>
                ))}
              </select>
            </div>

            {/* Filtro por disponibilidad de precio */}
            <div className="flex items-center">
              <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={filtros.con_precio}
                  onChange={(e) => handleFiltroChange('con_precio', e.target.checked)}
                  className="mr-2 rounded"
                />
                Solo con precio disponible
              </label>
            </div>

            {/* Rango de precios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Rango de Precio
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filtros.rango_precio.min}
                  onChange={(e) => handleFiltroChange('rango_precio', e.target.value, 'min')}
                  className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filtros.rango_precio.max}
                  onChange={(e) => handleFiltroChange('rango_precio', e.target.value, 'max')}
                  className="w-1/2 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={limpiarFiltros}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      )}

      {/* Lista de conceptos */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2">Cargando conceptos...</p>
          </div>
        ) : conceptosPaginados.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <ClipboardDocumentCheckIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No se encontraron conceptos</p>
            {busqueda && (
              <p className="text-sm">Intenta con otros términos de búsqueda</p>
            )}
          </div>
        ) : (
          conceptosPaginados.map(concepto => {
            const precio = precios.get(concepto.id_concepto_obra);
            const tienePrecio = precio && precio.precio > 0;
            
            return (
              <div
                key={concepto.id_concepto_obra}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                          {concepto.codigo}
                        </h4>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200">
                          {concepto.unidad}
                        </span>
                        {concepto.categoria && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                            {concepto.categoria}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                        {concepto.descripcion}
                      </p>
                    </div>
                    
                    <div className="ml-4 text-right flex-shrink-0">
                      {tienePrecio ? (
                        <div>
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            {formatearPrecio(precio.precio)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {precio.fecha_vigencia && new Date(precio.fecha_vigencia).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-orange-600 dark:text-orange-400">
                            Sin precio
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Región: {region}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => agregarConcepto(concepto)}
                  className="ml-4 flex items-center justify-center w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110"
                  title="Agregar partida"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mostrando {indiceInicio + 1} a {Math.min(indiceFin, conceptosFiltrados.length)} de {conceptosFiltrados.length} conceptos
          </p>
          
          <div className="flex space-x-1">
            <button
              onClick={() => setPaginaActual(paginaActual - 1)}
              disabled={paginaActual === 1}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            
            <span className="px-3 py-1 text-sm bg-primary-600 text-white rounded">
              {paginaActual}
            </span>
            
            <button
              onClick={() => setPaginaActual(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartidaSelector;