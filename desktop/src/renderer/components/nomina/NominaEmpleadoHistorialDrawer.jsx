import React, { useEffect, useMemo, useState } from 'react';
import { XMarkIcon, DocumentTextIcon, PencilSquareIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { NominaService as nominasServices } from '../../services/nominas/nominaService';
import apiService from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import EditNominaModal from './EditNominaModal';
import ConfirmModal from '../ui/ConfirmModal';

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

  // Utilidad: obtener semanas ISO que tocan el mes del período (ordenadas)
  const getWeeksTouchingMonth = (periodo) => {
    if (!periodo || !/^[0-9]{4}-[0-9]{2}$/.test(periodo)) return [];
    const [yearStr, monthStr] = periodo.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10) - 1; // 0-index
    const first = new Date(year, month, 1, 12, 0, 0, 0);
    const last = new Date(year, month + 1, 0, 12, 0, 0, 0);
    const seen = new Set();
    const list = [];
    for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
      // calcular ISO week-year y week number usando jueves de la semana
      const temp = new Date(d);
      const dow = temp.getDay();
      const deltaToThursday = dow === 0 ? -3 : (4 - dow);
      const th = new Date(temp);
      th.setDate(temp.getDate() + deltaToThursday);
      const isoYear = th.getFullYear();
      // semana ISO: número de semana del año
      const firstThursday = new Date(isoYear, 0, 4, 12, 0, 0, 0);
      const firstDow = firstThursday.getDay();
      const deltaFirst = firstDow === 0 ? -3 : (4 - firstDow);
      const firstIsoWeekThursday = new Date(firstThursday);
      firstIsoWeekThursday.setDate(firstThursday.getDate() + deltaFirst);
      const diffDays = Math.round((th - firstIsoWeekThursday) / (24 * 3600 * 1000));
      const isoWeek = 1 + Math.floor(diffDays / 7);
      const key = `${isoYear}-${isoWeek}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ anio: isoYear, semana_iso: isoWeek });
      }
    }
    return list;
  };

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
    const id = n.id_nomina || n.id;
    const prev = n.estado;
    // Update optimista en tabla
    setNominas((arr) => arr.map(item => ( (item.id_nomina||item.id) === id ? { ...item, estado: nuevoEstado } : item )));
    try {
      // limpiar caché para que el siguiente load sea fresco
      if (empleadoId) HIST_CACHE.delete(empleadoId);
      await apiService.cambiarEstadoNomina(id, nuevoEstado);
    } catch (err) {
      // revertir si falla
      setNominas((arr) => arr.map(item => ( (item.id_nomina||item.id) === id ? { ...item, estado: prev } : item )));
      console.error('Error cambiando estado de nómina:', err);
      alert(err.message || 'No se pudo cambiar el estado');
    }
  };

  const abrirEditor = async (n) => {
    try {
      const det = await nominasServices.getById(n.id_nomina || n.id);
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

  const getPeriodo = (n) => {
    if (n?.periodo) return n.periodo;
    const b = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
    if (!b) return '';
    const d = new Date(b);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  };

  // Calcula semana del mes (1-5) para una nómina específica usando su periodo y su (anio, semana_iso)
  const getSemanaDelMes = (n) => {
    // Derivar periodo si no viene: usar semana.fecha_inicio o createdAt
    let periodo = n?.periodo;
    if (!periodo) {
      const baseDateStr = n?.semana?.fecha_inicio || n?.fecha_pago || n?.fecha || n?.createdAt;
      if (baseDateStr) {
        const d = new Date(baseDateStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        periodo = `${y}-${m}`;
      }
    }
    const semana = n?.semana;
    if (!periodo || !semana?.anio || !semana?.semana_iso) return null;
    const weeks = getWeeksTouchingMonth(periodo);
    const idx = weeks.findIndex(w => w.anio === semana.anio && w.semana_iso === semana.semana_iso);
    return idx >= 0 ? (idx + 1) : null;
  };

  const loadData = async () => {
    if (!empleadoId) return;
    setLoading(true);
    setError(null);
    try {
      // Intentar cache
      const cached = HIST_CACHE.get(empleadoId);
      if (cached && (Date.now() - cached.timestamp) < HIST_TTL) {
        setNominas(cached.data);
        setLoading(false);
        return;
      }
      // Obtener nóminas SOLO del empleado seleccionado desde el backend
      const res = await apiService.getNominasPorEmpleado(empleadoId);
      const lista = res?.data || res?.nominas || res || [];
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
      loadData();
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
    if (n?.proyecto?.nombre) return n.proyecto.nombre;
    const idp = n?.id_proyecto || n?.proyecto?.id_proyecto;
    if (idp && proyectosMap[idp]?.nombre) return proyectosMap[idp].nombre;
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
      await loadData();
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
      await nominasServices.delete(n.id_nomina || n.id);
      setDeleteModal({ isOpen: false, nomina: null });
      await loadData();
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
                {filteredNominas.map((n, idx) => (
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
          await loadData();
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
