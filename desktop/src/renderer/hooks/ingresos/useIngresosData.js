import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import ingresosService from '../../services/ingresos/ingresosService';

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

export default function useIngresosData() {
  const [ingresos, setIngresos] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ id_proyecto: '', q: '', fecha_inicio: '', fecha_fin: '' });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total_ingresos: 0, ingresos_mes_actual: 0, ingresos_mes_anterior: 0, variacion_mes: 0, promedio_ticket: 0 });

  const debouncedFilters = useDebounce(filters, 400);

  const loadProyectos = async () => {
    try {
      const resp = await api.getProyectos();
      if (resp?.success !== false) {
        setProyectos(resp.data || resp || []);
      }
    } catch (e) {
      console.warn('No se pudieron cargar proyectos', e);
    }
  };

  const loadIngresos = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await ingresosService.list({
        id_proyecto: debouncedFilters.id_proyecto || undefined,
        q: debouncedFilters.q || undefined,
        fecha_inicio: debouncedFilters.fecha_inicio || undefined,
        fecha_fin: debouncedFilters.fecha_fin || undefined,
        page,
        limit,
      });
      // backend puede devolver {success, data, total} o un arreglo directo; soportar ambos
      const data = Array.isArray(resp) ? resp : (resp.data || []);
      setIngresos(data);
      if (resp && typeof resp.total === 'number') setTotal(resp.total);
      else setTotal(Array.isArray(data) ? data.length : 0);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const s = await ingresosService.stats({
        id_proyecto: debouncedFilters.id_proyecto || undefined,
        fecha_inicio: debouncedFilters.fecha_inicio || undefined,
        fecha_fin: debouncedFilters.fecha_fin || undefined,
      });
      const data = s?.data || s || {};
      setStats({
        total_ingresos: data.total_ingresos || 0,
        ingresos_mes_actual: data.ingresos_mes_actual || 0,
        ingresos_mes_anterior: data.ingresos_mes_anterior || 0,
        variacion_mes: data.variacion_mes || 0,
        promedio_ticket: data.promedio_ticket || 0,
      });
    } catch (e) {
      // silencioso
    }
  };

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    loadIngresos();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters.id_proyecto, debouncedFilters.q, debouncedFilters.fecha_inicio, debouncedFilters.fecha_fin, page, limit]);

  const reload = async () => {
    await Promise.all([loadIngresos(), loadStats()]);
  };

  const createIngreso = async (payload) => {
    await ingresosService.create(payload);
    await reload();
  };
  const updateIngreso = async (id, payload) => {
    await ingresosService.update(id, payload);
    await reload();
  };
  const deleteIngreso = async (ingresoOrId) => {
    const id = typeof ingresoOrId === 'object' && ingresoOrId !== null ? ingresoOrId.id_ingreso : ingresoOrId;
    if (!id) return;
    await ingresosService.remove(id);
    await reload();
  };

  return {
    ingresos,
    proyectos,
    loading,
    error,
    filters,
    setFilters,
    page,
    setPage,
    limit,
    setLimit,
    total,
    stats,
    reload,
    createIngreso,
    updateIngreso,
    deleteIngreso,
  };
}
