import { useState, useEffect, useCallback } from 'react';
import auditoriaService from '../../services/auditoria/auditoriaService';
import { useToast } from '../../contexts/ToastContext';

/**
 * Hook personalizado para gestionar datos de auditoría
 */
const useAuditoriaData = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paginacion, setPaginacion] = useState({
    total: 0,
    pagina: 1,
    limite: 50,
    totalPaginas: 0
  });
  const { showToast } = useToast();

  // Filtros
  const [filtros, setFiltros] = useState({
    id_usuario: '',
    accion: '',
    tabla: '',
    fecha_inicio: '',
    fecha_fin: '',
    busqueda: ''
  });

  /**
   * Cargar registros de auditoría
   */
  const cargarRegistros = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      const parametros = {
        ...params
      };

      // Limpiar parámetros vacíos
      Object.keys(parametros).forEach(key => {
        if (parametros[key] === '' || parametros[key] === null || parametros[key] === undefined) {
          delete parametros[key];
        }
      });

      const response = await auditoriaService.getRegistros(parametros);
      
      setRegistros(response.registros || []);
      // Preservar el límite actual si no viene en la respuesta
      if (response.paginacion) {
        setPaginacion(response.paginacion);
      }
    } catch (err) {
      console.error('Error al cargar registros:', err);
      setError(err.message || 'Error al cargar registros de auditoría');
      showToast('Error al cargar registros de auditoría', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  /**
   * Actualizar filtros
   */
  const actualizarFiltros = useCallback((nuevosFiltros) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros
    }));
    setPaginacion(prev => ({
      ...prev,
      pagina: 1 // Reset a primera página al cambiar filtros
    }));
  }, []);

  /**
   * Limpiar filtros
   */
  const limpiarFiltros = useCallback(() => {
    setFiltros({
      id_usuario: '',
      accion: '',
      tabla: '',
      fecha_inicio: '',
      fecha_fin: '',
      busqueda: ''
    });
    setPaginacion(prev => ({
      ...prev,
      pagina: 1
    }));
  }, []);

  /**
   * Cambiar página
   */
  const cambiarPagina = useCallback((nuevaPagina) => {
    setPaginacion(prev => ({
      ...prev,
      pagina: nuevaPagina
    }));
  }, []);

  /**
   * Cambiar límite de registros por página
   */
  const cambiarLimite = useCallback((nuevoLimite) => {
    setPaginacion(prev => ({
      ...prev,
      limite: nuevoLimite,
      pagina: 1 // Reset a primera página al cambiar límite
    }));
  }, []);

  /**
   * Recargar datos
   */
  const recargar = useCallback(() => {
    cargarRegistros();
  }, [cargarRegistros]);

  // Cargar datos cuando cambien filtros o paginación
  useEffect(() => {
    const parametros = {
      ...filtros,
      pagina: paginacion.pagina,
      limite: paginacion.limite
    };
    cargarRegistros(parametros);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros, paginacion.pagina, paginacion.limite]);

  return {
    registros,
    loading,
    error,
    paginacion,
    filtros,
    actualizarFiltros,
    limpiarFiltros,
    cambiarPagina,
    cambiarLimite,
    recargar
  };
};

export default useAuditoriaData;
