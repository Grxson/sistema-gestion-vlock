import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon, DocumentTextIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NominaService as nominasServices } from '../../services/nominas/nominaService';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import EditNominaModal from './EditNominaModal';
import ConfirmModal from '../ui/ConfirmModal';
import { semanaDelMesDesdeISO, calcularSemanaDelMes } from '../../utils/weekCalculator';

// Caché simple en memoria por empleado
const HIST_CACHE = new Map(); // key: empleadoId, value: { data, timestamp }
const HIST_TTL = 5 * 60 * 1000; // 5 minutos

export default function NominaEmpleadoHistorialDrawer({ open, empleado, onClose, onEditarNomina }) {
  const [loading, setLoading] = useState(false);
  const [nominas, setNominas] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({ periodo: '', estado: 'all' });
  const [proyectosMap, setProyectosMap] = useState({});
  const [editingOpen, setEditingOpen] = useState(false);
  const [editingNomina, setEditingNomina] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, nomina: null });

  const empleadoId = empleado?.id_empleado || empleado?.id;

  // Utilidad: semanas ISO del mes según mayoría de días (regla de jueves/majority)
  const getWeeksTouchingMonth = (periodo) => {
    if (!periodo || !/^[0-9]{4}-[0-9]{2}$/.test(periodo)) return [];
    const [yy, mm] = periodo.split('-');
    const year = parseInt(yy, 10);
    const month0 = parseInt(mm, 10) - 1;

    const first = new Date(year, month0, 1, 12, 0, 0, 0);
    const last = new Date(year, month0 + 1, 0, 12, 0, 0, 0);

    // lunes que contiene el día 1 del mes
    const day = first.getDay() || 7; // 1..7 (dom=0 -> 7)
    const mondayStart = new Date(first);
    mondayStart.setDate(first.getDate() - day + 1);

    const end = new Date(last);
    end.setDate(last.getDate() + 7); // abarcar la última semana

    const seen = new Set();
    const list = [];

    const getMajorityMonthFromMonday = (monday) => {
      const counts = new Map(); // key = month index 0..11
      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = d.getMonth();
        counts.set(key, (counts.get(key) || 0) + 1);
      }
      let bestMonth = month0;
      let best = -1;
      counts.forEach((v, k) => { if (v > best) { best = v; bestMonth = k; } });
      return bestMonth;
    };

    for (let d = new Date(mondayStart); d <= end; d.setDate(d.getDate() + 7)) {
      // Calcular jueves de esa semana para ISO year/week
      const jueves = new Date(d);
      const dow = jueves.getDay();
      const diasHastaJueves = dow === 0 ? 4 : (4 - dow);
      jueves.setDate(d.getDate() + diasHastaJueves);
      const isoYear = jueves.getFullYear();

      // Primer jueves del año ISO
      const primerEnero = new Date(isoYear, 0, 1);
      const diaPrimerEnero = primerEnero.getDay();
      const diasHastaPrimerJueves = (11 - diaPrimerEnero) % 7; // 0..6
      const primerJueves = new Date(isoYear, 0, 1 + diasHastaPrimerJueves);
      const diff = Math.floor((jueves - primerJueves) / (1000 * 60 * 60 * 24));
      const isoWeek = Math.floor(diff / 7) + 1;

      // Incluir solo si la mayoría de días de esa semana pertenece al mes
      const majMonth = getMajorityMonthFromMonday(d);
      if (majMonth === month0) {
        const key = `${isoYear}-${isoWeek}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ anio: isoYear, semana_iso: isoWeek });
        }
      }
    }
    return list;
  };

  // Identificador seguro de nómina
  const getNominaId = (n) => (n && n.id_nomina != null ? n.id_nomina : n?.id);

  const normalizarEstadoValor = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e === 'borrador') return 'Borrador';
    if (e === 'pendiente') return 'Pendiente';
    if (e === 'en_proceso' || e === 'en proceso') return 'En_Proceso';
    if (e === 'aprobada' || e === 'aprobado') return 'Aprobada';
    if (e === 'pagado' || e === 'pagada') return 'Pagado';
    if (e === 'cancelada' || e === 'cancelado') return 'Cancelada';
    return 'Pendiente';
  };

  const cambiarEstado = async (n, nuevoEstado) => {
    const id = getNominaId(n);
    const prev = n.estado;
    // Update optimista en tabla
    setNominas((arr) => arr.map(item => (
      getNominaId(item) === id ? { ...item, estado: nuevoEstado } : item
    )));
    try {
      // limpiar caché para que el siguiente load sea fresco
      if (empleadoId) HIST_CACHE.delete(empleadoId);
      await apiService.cambiarEstadoNomina(id, nuevoEstado);
    } catch (err) {
      // revertir si falla
      setNominas((arr) => arr.map(item => (
        getNominaId(item) === id ? { ...item, estado: prev } : item
      )));
      console.error('Error cambiando estado de nómina:', err);
      alert(err.message || 'No se pudo cambiar el estado');
    }
  };

  const abrirEditor = async (n) => {
    try {
      const det = await nominasServices.getById(getNominaId(n));
      const data = det?.data || det;
      if (data) {
        setEditingNomina(data);
        setEditingOpen(true);
      }
    } catch (e) {
      console.error('Error cargando nómina para edición:', e);
      alert('No se pudo abrir el editor de nómina');
    }
  };

  // Helper para parsear fechas DATEONLY (YYYY-MM-DD) evitando confusión de zona horaria
  const parseDateOnly = (dateStr) => {
    if (!dateStr) return null;
    // Si es string ISO (YYYY-MM-DD o YYYY-MM-DDTHH:MM:SS), extraer parte de fecha
    const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return { year: parseInt(match[1], 10), month: parseInt(match[2], 10), day: parseInt(match[3], 10) };
    }
    return null;
  };

  const getPeriodo = (n) => {
    if (n?.periodo) return n.periodo;
    const b = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
    if (!b) return '';
    // Parsear como DATEONLY para evitar confusión de zona horaria
    const parsed = parseDateOnly(b);
    if (parsed) {
      return `${parsed.year}-${String(parsed.month).padStart(2,'0')}`;
    }
    // Fallback a new Date si no es string ISO
    const d = new Date(b);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  // Calcula semana del mes (1-5) para una nómina específica usando su periodo y su (anio, semana_iso)
  // Cálculo consistente de semana del mes (1..N) usando util semanaDelMesDesdeISO.
  // Evita duplicar lógica y corrige desajustes (semanas marcadas como 2 cuando son 1, etc.).
  const getSemanaDelMes = (n) => {
    // Prioridad 1: si la nómina trae campo escalar 'semana' (1-5) almacenado directamente
    if (typeof n?.semana === 'number') return n.semana;
    // Prioridad 2: si el include trae 'semana.semana_mes'
    if (typeof n?.semana?.semana_mes === 'number') return n.semana.semana_mes;
    // Prioridad 3: reconstruir usando ISO
    if (!n?.semana?.anio || !n?.semana?.semana_iso) {
      // Fallback: si no hay ISO, intentar calcular desde fecha
      const fechaBase = n?.fecha_pago || n?.fecha || n?.createdAt;
      if (fechaBase) {
        return calcularSemanaDelMes(new Date(fechaBase));
      }
      return '—';
    }
    
    const fechaBase = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
    if (!fechaBase) return '—';
    
    // Parsear como DATEONLY para evitar confusión de zona horaria
    const parsed = parseDateOnly(fechaBase);
    let periodo;
    if (parsed) {
      periodo = `${parsed.year}-${String(parsed.month).padStart(2,'0')}`;
    } else {
      // Fallback a new Date
      const d = new Date(fechaBase);
      periodo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    }
    
    const idx = semanaDelMesDesdeISO(periodo, n.semana.anio, n.semana.semana_iso);
    // Verificar que idx sea un número válido (no NaN y mayor que 0)
    if (typeof idx === 'number' && !Number.isNaN(idx) && idx > 0) {
      return idx;
    }
    return '—';
  };

  const loadData = async (force = false) => {
    if (!empleadoId) return;
    setLoading(true);
    setError(null);
    try {
      // Intentar cache
      const cached = HIST_CACHE.get(empleadoId);
      if (!force && cached && (Date.now() - cached.timestamp) < HIST_TTL) {
        setNominas(cached.data);
        setLoading(false);
        return;
      }
  // Obtener nóminas SOLO del empleado seleccionado desde el backend (bypass cache ApiService si force)
  const res = await apiService.getNominasPorEmpleado(empleadoId, { noCache: force });
  const lista = res?.nominas || res?.data || res || [];
      const base = Array.isArray(lista) ? lista : [];
      // Enriquecer con proyecto real si falta
      const enriched = await Promise.all(base.map(async (n) => {
        const hasProyecto = n?.proyecto?.nombre;
        if (hasProyecto) return n;
        try {
          const det = await nominasServices.getById(n.id_nomina || n.id);
          if (det?.success && det?.data) {
            return { ...n, proyecto: det.data.proyecto || n.proyecto };
          }
        } catch (e) {
          // ignorar y devolver n
        }
        return n;
      }));
      setNominas(enriched);
      HIST_CACHE.set(empleadoId, { data: enriched, timestamp: Date.now() });
    } catch (e) {
      setError(e.message || 'Error al cargar nóminas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && empleadoId) {
      // Al abrir siempre forzar para incluir nóminas recién creadas
      loadData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, empleadoId]);

  // Cargar proyectos activos para resolver nombres cuando falten
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const res = await apiService.getProyectosActivos();
        const arr = res?.data || res || [];
        const map = {};
        arr.forEach(p => { if (p?.id_proyecto) map[p.id_proyecto] = p; });
        setProyectosMap(map);
      } catch (e) {
        // silencioso
      }
    })();
  }, [open]);

  const getProyectoNombre = (n) => {
    // Prioridad 1: id_proyecto directo de la nómina (puede ser proyecto temporal override)
    const idp = n?.id_proyecto || n?.proyecto?.id_proyecto;
    if (idp && proyectosMap[idp]?.nombre) return proyectosMap[idp].nombre;
    // Prioridad 2: objeto proyecto incluido en la nómina
    if (n?.proyecto?.nombre) return n.proyecto.nombre;
    // Fallback: Administrativo (cuando no hay proyecto asignado)
    return 'Administrativo';
  };

  const renderEstadoBadge = (estadoRaw) => {
    const estado = (estadoRaw || '').toLowerCase();
    const map = {
      borrador: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      pendiente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      aprobada: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
      pagado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      cancelada: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    const cls = map[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    const label = estadoRaw || '—';
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${cls}`}>{label}</span>;
  };

  const filteredNominas = useMemo(() => {
    let arr = [...nominas];
    const periodoFilter = (filters.periodo || '').trim();
    if (periodoFilter) {
      arr = arr.filter(n => getPeriodo(n).startsWith(periodoFilter));
    }
    const estadoFilter = (filters.estado || '').toLowerCase();
    if (estadoFilter && estadoFilter !== 'all') {
      arr = arr.filter(n => (n.estado || '').toLowerCase() === estadoFilter);
    }
    return arr;
  }, [nominas, filters]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadData(true); // forzar bypass de caché
    } finally {
      setRefreshing(false);
    }
  };

  const descargarPDF = async (n) => {
    try {
      const blob = await nominasServices.generarReciboPDF(n.id_nomina || n.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const nombreEmpleado = (empleado?.nombre || empleado?.nombre_usuario || 'empleado').toString().replace(/\s+/g, '_');
      const semanaMes = getSemanaDelMes(n) || 'X';
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
      a.download = `nomina_semana-${semanaMes}_${nombreEmpleado}_${ts}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error descargando PDF:', err);
      alert('No se pudo descargar el PDF');
    }
  };

  const eliminarNomina = (n) => {
    setDeleteModal({ isOpen: true, nomina: n });
  };

  const handleConfirmDelete = async () => {
    const n = deleteModal.nomina;
    if (!n) return;
    try {
      // limpiar caché para que no muestre registros obsoletos
      if (empleadoId) HIST_CACHE.delete(empleadoId);
      // El backend debe realizar eliminación completa en cascada (nómina + historial + pagos relacionados)
      const deletedId = n.id_nomina || n.id;
  await nominasServices.delete(deletedId);
  // Invalidar caché ApiService explícito
  try { apiService._cache?.delete?.(`GET:/nomina/empleado/${empleadoId}`); } catch(_) {}
      setDeleteModal({ isOpen: false, nomina: null });
      // Refrescar lista del drawer (bypass caché para ver el cambio al instante)
      await loadData(true);
      // Notificar globalmente para que otras vistas (tabla principal) se refresquen sin recargar ventana
      try {
        const detail = { action: 'deleted', entity: 'nomina', id: deletedId, empleadoId };
        window.dispatchEvent(new CustomEvent('nomina:changed', { detail }));
      } catch (e) {
        // en entornos sin window/customEvent, ignorar
      }
      // Cerrar el drawer si ya no quedan nóminas o si el usuario estaba viendo solo una
      if (!filteredNominas || filteredNominas.length <= 1) {
        onClose?.();
      }
    } catch (err) {
      console.error('Error eliminando nómina:', err);
      alert(err.message || 'No se pudo eliminar la nómina');
      setDeleteModal({ isOpen: false, nomina: null });
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`absolute top-0 right-0 h-full w-full max-w-5xl bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl transform transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header sticky con mayor contraste */}
        <div className="sticky top-0 z-10 bg-white/95 dark:bg-slate-900/90 backdrop-blur border-b border-gray-200 dark:border-gray-800 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                Historial de nómina — {empleado?.nombre?.toUpperCase?.() || empleado?.nombre_usuario || 'EMPLEADO'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">ID Empleado: {empleadoId || '—'}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleRefresh} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50" disabled={refreshing}>
                <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refrescar
              </button>
              <button onClick={onClose} className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800" title="Cerrar">
                <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
          {/* Resumen */}
          {filteredNominas.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-gray-200">Nóminas: {filteredNominas.length}</span>
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                Total: {formatCurrency(filteredNominas.reduce((acc, n) => acc + (n?.monto_total || n?.monto || 0), 0))}
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Período (YYYY-MM)</label>
              <input value={filters.periodo} onChange={(e) => setFilters(f => ({ ...f, periodo: e.target.value }))} placeholder="YYYY-MM" className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm placeholder-gray-400 dark:placeholder-gray-500 text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Estado</label>
              <select value={filters.estado} onChange={(e) => setFilters(f => ({ ...f, estado: e.target.value }))} className="w-full px-3 py-2 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-gray-100">
                <option value="all">Todos</option>
                <option value="Borrador">Borrador</option>
                <option value="Aprobada">Aprobada</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Pagado">Pagado</option>
                <option value="Cancelada">Cancelada</option>
              </select>
            </div>
            <div className="flex items-end">
              <button onClick={() => setFilters({ periodo: '', estado: 'all' })} className="px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 w-full sm:w-auto">Limpiar</button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="px-5 pb-5 overflow-auto h-[calc(100%-190px)]">
          {loading ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">Cargando...</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : filteredNominas.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500 dark:text-gray-400">
              <DocumentTextIcon className="h-10 w-10 mb-2 opacity-60" />
              <p className="text-sm">Sin nóminas registradas para este empleado.</p>
              <p className="text-xs mt-1">Crea una nómina desde la vista principal para verla aquí.</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
              <thead className="sticky top-0 z-10 bg-gray-50/95 dark:bg-slate-800/80 backdrop-blur">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Semana (1-5)</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Período</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Proyecto</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Monto</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300">Fecha</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {/* Ordenar por fecha de creación descendente antes de renderizar */}
                {filteredNominas
                  .slice() // copia
                  .sort((a,b) => new Date(b.createdAt || b.fecha_pago || b.fecha || 0) - new Date(a.createdAt || a.fecha_pago || a.fecha || 0))
                  .map((n, idx) => (
                  <tr key={n.id_nomina || n.id} className={`hover:bg-gray-50 dark:hover:bg-slate-800/50 ${idx % 2 === 1 ? 'bg-gray-50/40 dark:bg-slate-800/30' : ''}`}>
                    <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-100">{getSemanaDelMes(n) || '—'}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-100">{(n?.periodo) || (() => { const b = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt; if (!b) return '—'; const d = new Date(b); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`; })()}</td>
                    <td className="px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        {renderEstadoBadge(n?.estado)}
                        <select
                          className="text-xs px-2 py-1 rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200"
                          value={normalizarEstadoValor(n?.estado)}
                          onChange={(e) => cambiarEstado(n, e.target.value)}
                        >
                          {['Borrador','Pendiente','En_Proceso','Aprobada','Pagado','Cancelada'].map(opt => (
                            <option key={opt} value={opt}>
                              {opt === 'En_Proceso' ? 'En Proceso' : opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-100">{getProyectoNombre(n)}</td>
                    <td className="px-3 py-2 text-sm text-right text-gray-800 dark:text-gray-100">{formatCurrency(n?.monto_total || n?.monto || 0)}</td>
                    <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-100">{new Date(n?.createdAt || n?.fecha_pago || n?.fecha).toLocaleDateString()}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <button type="button" onClick={() => abrirEditor(n)} className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400" title="Editar">
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => eliminarNomina(n)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" title="Eliminar">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                        <button type="button" onClick={() => descargarPDF(n)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-primary-600 dark:text-primary-400" title="PDF">
                          <DocumentTextIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Editor de nómina embebido */}
      <EditNominaModal
        isOpen={editingOpen}
        onClose={() => setEditingOpen(false)}
        nominaData={editingNomina}
        empleado={empleado}
        onSuccess={async () => {
          setEditingOpen(false);
          setEditingNomina(null);
          await loadData(true);
        }}
      />

      {/* Confirmación de eliminación */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, nomina: null })}
        onConfirm={handleConfirmDelete}
        title="Eliminar Nómina"
        message={`¿Estás seguro de eliminar esta nómina?\n\nEsta acción eliminará:\n• La nómina\n• El historial de cambios\n• Los pagos relacionados\n\nEsta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
