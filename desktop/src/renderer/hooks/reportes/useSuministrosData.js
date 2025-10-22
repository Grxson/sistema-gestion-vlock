import { useState, useEffect, useCallback } from 'react';
import apiService from '../../services/api';

/**
 * Custom hook para gestionar datos de suministros en reportes
 * Centraliza la lógica de carga, filtrado y procesamiento de datos
 */
export const useSuministrosData = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtros, setFiltros] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    id_proyecto: '',
    id_proveedor: '',
    categoria: ''
  });

  // Datos auxiliares para filtros
  const [proyectos, setProyectos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [categorias, setCategorias] = useState([]);

  /**
   * Cargar datos iniciales (proyectos, proveedores, categorías)
   */
  const cargarDatosIniciales = useCallback(async () => {
    try {
      const [proyectosRes, proveedoresRes] = await Promise.all([
        apiService.getProyectos(),
        apiService.getActiveProveedores()
      ]);

      setProyectos(proyectosRes.data || []);
      setProveedores(proveedoresRes.data || []);
      
      // Categorías estáticas (pueden venir de BD en el futuro)
      setCategorias([
        'Material',
        'Cimbra', 
        'Maquinaria',
        'Concreto'
      ]);
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
      setError('Error al cargar datos de configuración');
    }
  }, []);

  /**
   * Cargar dashboard con filtros aplicados
   */
  const cargarDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiService.getDashboardSuministros(filtros);
      console.log('📊 Dashboard data loaded:', response.data);
      
      setDashboardData(response.data);
    } catch (err) {
      console.error('❌ Error al cargar dashboard:', err);
      setError('Error al cargar datos del dashboard');
      
      // Datos de fallback
      setDashboardData({
        consumoPorObra: [],
        distribicionProveedores: [],
        tiposMateriales: [],
        consumoPorMes: [],
        estadisticas: {
          totalGastado: 0,
          totalRegistros: 0,
          totalProveedores: 0,
          totalProyectos: 0,
          promedioGasto: 0,
          proveedorMasFrecuente: 'N/A'
        }
      });
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  /**
   * Actualizar un filtro específico
   */
  const handleFilterChange = useCallback((key, value) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      fecha_inicio: '',
      fecha_fin: '',
      id_proyecto: '',
      id_proveedor: '',
      categoria: ''
    });
  }, []);

  /**
   * Recargar datos manualmente
   */
  const recargarDatos = useCallback(() => {
    cargarDashboard();
  }, [cargarDashboard]);

  // Cargar datos iniciales al montar
  useEffect(() => {
    cargarDatosIniciales();
  }, [cargarDatosIniciales]);

  // Recargar dashboard cuando cambian filtros (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarDashboard();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [cargarDashboard]);

  return {
    // Datos
    dashboardData,
    proyectos,
    proveedores,
    categorias,
    
    // Estados
    loading,
    error,
    
    // Filtros
    filtros,
    handleFilterChange,
    limpiarFiltros,
    
    // Acciones
    recargarDatos
  };
};
