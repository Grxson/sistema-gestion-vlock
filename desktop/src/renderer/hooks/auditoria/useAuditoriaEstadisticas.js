import { useState, useEffect, useCallback } from 'react';
import auditoriaService from '../../services/auditoria/auditoriaService';
import { useToast } from '../../contexts/ToastContext';

/**
 * Hook personalizado para gestionar estadísticas de auditoría
 */
const useAuditoriaEstadisticas = (filtros = {}) => {
  const [estadisticas, setEstadisticas] = useState({
    totalRegistros: 0,
    totalUsuarios: 0,
    totalAcciones: 0,
    accionesPorTipo: [],
    actividadPorUsuario: [],
    actividadPorTabla: [],
    actividadPorDia: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  /**
   * Cargar estadísticas
   */
  const cargarEstadisticas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Limpiar parámetros vacíos
      const parametros = { ...filtros };
      Object.keys(parametros).forEach(key => {
        if (parametros[key] === '' || parametros[key] === null || parametros[key] === undefined) {
          delete parametros[key];
        }
      });

      const response = await auditoriaService.getEstadisticas(parametros);
      setEstadisticas(response.estadisticas || {
        totalRegistros: 0,
        totalUsuarios: 0,
        totalAcciones: 0,
        accionesPorTipo: [],
        actividadPorUsuario: [],
        actividadPorTabla: [],
        actividadPorDia: []
      });
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError(err.message || 'Error al cargar estadísticas');
      showToast('Error al cargar estadísticas de auditoría', 'error');
    } finally {
      setLoading(false);
    }
  }, [filtros, showToast]);

  /**
   * Recargar estadísticas
   */
  const recargar = useCallback(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  // Cargar estadísticas al montar o cambiar filtros
  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  return {
    estadisticas,
    loading,
    error,
    recargar
  };
};

export default useAuditoriaEstadisticas;
