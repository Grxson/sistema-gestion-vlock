import React, { useMemo, useEffect, useState, useCallback } from 'react';
import api from '../../services/api';

const formatCurrency = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

const ProyectoSuministrosTable = ({ suministros = [] }) => {
  const parseMonto = (val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === 'number') return val;
    const cleaned = String(val).replace(/\$/g, '').replace(/,/g, '').replace(/\s+/g, '').trim();
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };

  const getMontoSuministro = (s) => {
    const base = s.total ?? s.total_neto ?? s.monto_total ?? s.monto ?? s.importe ?? s.costo_total ?? s.total_con_iva;
    if (base !== undefined && base !== null && base !== '') {
      const parsed = parseMonto(base);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    const items = s.items || s.articulos || s.detalle || s.detalles;
    if (Array.isArray(items) && items.length > 0) {
      return items.reduce((acc, it) => {
        const t = it.total ?? it.importe ?? it.monto ?? (parseFloat(it.precio || it.precio_unitario || 0) * parseFloat(it.cantidad || 1));
        return acc + parseMonto(t);
      }, 0);
    }
    const subtotal = parseMonto(s.subtotal ?? 0);
    const iva = parseMonto(s.iva ?? s.impuesto ?? 0);
    return subtotal + iva;
  };

  const total = useMemo(() => suministros.reduce((acc, s) => acc + getMontoSuministro(s), 0), [suministros]);

  useEffect(() => {
    const hasItems = (r) => Array.isArray(r?.items) || Array.isArray(r?.articulos) || Array.isArray(r?.detalle) || Array.isArray(r?.detalles);
    const multiples = suministros.filter(hasItems);
    const simples = suministros.filter(r => !hasItems(r));
  }, [suministros, total]);

  // Proveedores map para resolver nombre desde id
  const [proveedoresMap, setProveedoresMap] = useState({});
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.getProveedores({ activos: true });
        const list = Array.isArray(res?.data) ? res.data : (res?.proveedores || res || []);
        const map = {};
        list.forEach(p => { map[p.id_proveedor || p.id || p._id] = p.nombre || p.razon_social || p.alias; });
        if (mounted) setProveedoresMap(map);
      } catch (e) {
        // silencioso
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getProveedorNombre = useCallback((s) => {
    return (
      s.proveedor?.nombre ||
      s.proveedor_nombre ||
      s.proveedor ||
      proveedoresMap[s.id_proveedor] ||
      proveedoresMap[s.proveedor_id] ||
      'Sin proveedor'
    );
  }, [proveedoresMap]);

  // Agrupación por proveedor(id)+folio
  const groupKey = useCallback((s) => {
    const provId = s.id_proveedor || s.proveedor?.id_proveedor || s.proveedor_id || getProveedorNombre(s);
    const folio = (s.folio || '').toString().trim();
    // Si no hay folio, no agrupar con otros: usar id_suministro para clave única
    if (!folio) return `uniq_${provId}_${s.id_suministro || Math.random()}`;
    return `${provId}__${folio}`;
  }, [getProveedorNombre]);

  const grupos = useMemo(() => {
    const map = new Map();
    for (const s of suministros) {
      const key = groupKey(s);
      if (!map.has(key)) {
        map.set(key, {
          id: key,
          proveedor: getProveedorNombre(s),
          folio: s.folio || '',
          fecha: s.fecha || s.fecha_necesaria || s.fecha_compra || s.fecha_registro || s.createdAt?.slice(0,10) || null,
          items: [],
          total: 0
        });
      }
      const g = map.get(key);
      g.items.push(s);
      g.total += getMontoSuministro(s);
      const f = s.fecha || s.fecha_necesaria || s.fecha_compra || s.fecha_registro || s.createdAt?.slice(0,10) || null;
      if (!g.fecha || (f && f > g.fecha)) g.fecha = f; // usar la más reciente
    }
    // Ordenar por fecha desc
    return Array.from(map.values()).sort((a,b) => String(b.fecha).localeCompare(String(a.fecha)));
  }, [suministros, groupKey]);

  const [expanded, setExpanded] = useState(new Set());
  const toggle = (id) => setExpanded(prev => {
    const nx = new Set(prev);
    if (nx.has(id)) nx.delete(id); else nx.add(id);
    return nx;
  });

  // Paginación a nivel grupo
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const totalItems = grupos.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (page > totalPages) setPage(totalPages);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageGroups = useMemo(() => grupos.slice(startIndex, endIndex), [grupos, startIndex, endIndex]);

  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-3 text-sm text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
        <div>Vista filtrada: <span className="font-medium">{totalItems}</span> suministros</div>
        <div>Total: <span className="font-semibold">{formatCurrency(total)}</span></div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50/95 dark:bg-dark-200/95 sticky top-0 z-10 backdrop-blur">
            <tr>
              <th className="px-6 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Nombre</th>
              <th className="px-6 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Proveedor</th>
              <th className="px-6 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Fecha</th>
              <th className="px-6 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Categoría</th>
              <th className="px-6 py-2 text-left text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Folio</th>
              <th className="px-6 py-2 text-right text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300 uppercase">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {pageGroups.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Sin suministros en el periodo</td>
              </tr>
            ) : pageGroups.map((g) => {
              if (g.items.length > 1) {
                const isOpen = expanded.has(g.id);
                return (
                  <React.Fragment key={`grpwrap-${g.id}`}>
                    <tr key={`grp-${g.id}`} className="bg-gray-100 dark:bg-dark-200">
                      <td className="px-6 py-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                        <button onClick={() => toggle(g.id)} className="mr-2 text-primary-600 hover:underline">{isOpen ? '−' : '+'}</button>
                        Recibo - {g.items.length} artículos
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{g.proveedor}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{g.fecha}</td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">Múltiple</td>
                      <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{g.folio || '—'}</td>
                      <td className="px-6 py-3 text-sm font-semibold text-right text-gray-900 dark:text-white tabular-nums">{formatCurrency(g.total)}</td>
                    </tr>
                    {isOpen && g.items.map((s, idx) => {
                      const fecha = s.fecha || s.fecha_necesaria || s.fecha_compra || s.fecha_registro || s.createdAt?.slice(0,10);
                      const categoria = s.categoria?.nombre || s.categoria_nombre || s.tipo_suministro || '—';
                      const monto = getMontoSuministro(s);
                      return (
                        <tr key={`row-${g.id}-${s.id_suministro}`} className="bg-white dark:bg-dark-100">
                          <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{s.nombre || s.descripcion || '—'}</td>
                          <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{g.proveedor}</td>
                          <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{fecha}</td>
                          <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{categoria}</td>
                          <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{s.folio || '—'}</td>
                          <td className="px-6 py-2 text-sm font-semibold text-right text-gray-900 dark:text-white tabular-nums">{formatCurrency(monto)}</td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              }
              const s = g.items[0];
              const fecha = s.fecha || s.fecha_necesaria || s.fecha_compra || s.fecha_registro || s.createdAt?.slice(0,10);
              const categoria = s.categoria?.nombre || s.categoria_nombre || s.tipo_suministro || '—';
              const monto = getMontoSuministro(s);
              return (
                <tr key={`row-${g.id}-${s.id_suministro}`} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                  <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{s.nombre || s.descripcion || '—'} </td>
                  <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{g.proveedor}</td>
                  <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{fecha}</td>
                  <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{categoria}</td>
                  <td className="px-6 py-2 text-sm text-gray-700 dark:text-gray-300">{s.folio || '—'}</td>
                  <td className="px-6 py-2 text-sm font-semibold text-right text-gray-900 dark:text-white tabular-nums">{formatCurrency(monto)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
        <div>
          Mostrando {Math.min(endIndex, totalItems)} de {totalItems}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className={`px-3 py-1 rounded border ${page===1? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-dark-200'}`}>Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className={`px-3 py-1 rounded border ${page===totalPages? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-dark-2 00'}`}>Siguiente</button>
          <select value={pageSize} onChange={(e)=>{setPageSize(Number(e.target.value)); setPage(1);}} className="ml-2 border rounded px-2 py-1 bg-white dark:bg-dark-200">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProyectoSuministrosTable;
