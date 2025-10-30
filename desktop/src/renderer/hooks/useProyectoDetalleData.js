import { useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const toISO = (d) => d.toISOString().slice(0,10);
const monthStart = (date) => new Date(date.getFullYear(), date.getMonth(), 1);
const monthEnd = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

export function useProyectoDetalleData(id) {
  const [proyecto, setProyecto] = useState(null);
  const [fechaInicio, setFechaInicio] = useState(() => toISO(monthStart(new Date())));
  const [fechaFin, setFechaFin] = useState(() => toISO(monthEnd(new Date())));
  const [ingresos, setIngresos] = useState([]);
  const [suministros, setSuministros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadProyecto() {
      const res = await api.getProyectoById(id);
      if (mounted && res?.success) {
        const p = res.data;
        setProyecto(p);
        // Ajustar rango por fechas del proyecto
        const pickDate = (obj, keys) => {
          for (const k of keys) {
            const v = obj?.[k];
            if (v) return v;
          }
          return null;
        };
        const inicioStr = pickDate(p, ['fecha_inicio', 'fechaInicio', 'inicio']);
        const finStr = pickDate(p, ['fecha_fin', 'fechaFin', 'fin']);
        const inicio = inicioStr ? parseDateOnly(inicioStr) : null;
        const fin = finStr ? parseDateOnly(finStr) : null;
        if (inicio) setFechaInicio(toISO(inicio));
        if (fin) {
          setFechaFin(toISO(fin));
        } else {
          // Si no hay fecha fin, usar hoy
          const hoy = new Date();
          setFechaFin(toISO(hoy));
        }
      }
    }
    if (id) loadProyecto();
    return () => { mounted = false; };
  }, [id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const [ing, sum] = await Promise.all([
          api.getIngresos({ id_proyecto: id, fecha_inicio: fechaInicio, fecha_fin: fechaFin }),
          api.get(`/suministros/proyecto/${id}?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`)
        ]);
        if (!mounted) return;
        const ingresosData = Array.isArray(ing) ? ing : (ing?.data || []);
        const suministrosData = Array.isArray(sum) ? sum : (sum?.data || []);
        console.log('[ProyectoDetalle] ingresos recibidos:', ingresosData.length, ingresosData[0]);
        // Debug: resumen de suministros recibidos
        const hasItems = (r) => Array.isArray(r?.items) || Array.isArray(r?.articulos) || Array.isArray(r?.detalle) || Array.isArray(r?.detalles);
        const multiples = suministrosData.filter(hasItems);
        const simples = suministrosData.filter(r => !hasItems(r));
        console.log('[ProyectoDetalle] suministros recibidos:', suministrosData.length);
        console.log('[ProyectoDetalle]   multiples:', multiples.length, 'simples:', simples.length);
        console.log('[ProyectoDetalle]   ejemplo multiple:', multiples[0]);
        console.log('[ProyectoDetalle]   ejemplo simple:', simples[0]);
        setIngresos(ingresosData);
        setSuministros(suministrosData);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id && fechaInicio && fechaFin) load();
    return () => { mounted = false; };
  }, [id, fechaInicio, fechaFin]);

  const parseDateOnly = (str) => {
    if (!str) return null;
    // Si viene en formato YYYY-MM-DD, construir fecha local sin TZ
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [y, m, d] = str.split('-').map(Number);
      return new Date(y, m - 1, d, 0, 0, 0, 0);
    }
    // Si viene ISO con tiempo, usar Date nativo
    const d = new Date(str);
    if (isNaN(d.getTime())) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
  };

  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

  const totals = useMemo(() => {
    // Filtrar por rango de fechas en cliente para garantizar consistencia, aunque el backend no filtre
    const inRange = (dateStr) => {
      const dOnly = parseDateOnly(dateStr);
      if (!dOnly) return false;
      const from = parseDateOnly(fechaInicio);
      const to = endOfDay(parseDateOnly(fechaFin));
      return dOnly >= from && dOnly <= to;
    };

    const ingresosFiltrados = ingresos.filter(r => inRange(r.fecha || r.createdAt));
    const suministrosFiltrados = suministros.filter(r => inRange(r.fecha || r.fecha_necesaria || r.fecha_compra || r.fecha_registro || r.createdAt));

    const totalIngresos = ingresosFiltrados.reduce((a, r) => a + Number(r.monto || 0), 0);
    const parseMonto = (val) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      // Remover símbolos $, comas de miles y espacios
      const cleaned = String(val).replace(/\$/g, '').replace(/,/g, '').replace(/\s+/g, '').trim();
      const n = parseFloat(cleaned);
      return isNaN(n) ? 0 : n;
    };
    const getMontoSuministro = (r) => {
      // Alineado con Suministros.jsx -> calculateTotal
      const costoTotalNum = parseFloat(r.costo_total);
      if (!isNaN(costoTotalNum) && costoTotalNum > 0) {
        return Math.round(costoTotalNum * 100) / 100;
      }
      const cantidadNum = parseFloat(r.cantidad) || 0;
      const precioNum = parseFloat(r.precio_unitario) || 0;
      const calc = Math.round((cantidadNum * precioNum) * 100) / 100;
      if (calc > 0) return calc;

      // 2) Suministro múltiple: sumar items si existen (por si en algún caso llegan anidados)
      const candidates = r.items || r.articulos || r.detalle || r.detalles;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const sumItems = candidates.reduce((acc, it) => {
          const t = it.total ?? it.importe ?? it.monto ?? (parseFloat(it.precio || it.precio_unitario || 0) * parseFloat(it.cantidad || 1));
          return acc + parseMonto(t);
        }, 0);
        if (sumItems > 0) return sumItems;
      }

      // 3) Fallbacks previos
      const base = r.total ?? r.total_neto ?? r.monto_total ?? r.monto ?? r.importe ?? r.costo_total ?? r.total_con_iva;
      if (base !== undefined && base !== null && base !== '') {
        const parsed = parseMonto(base);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      // 4) Fallback: subtotal + iva si existen
      const subtotal = parseMonto(r.subtotal ?? 0);
      const iva = parseMonto(r.iva ?? r.impuesto ?? 0);
      const tot = subtotal + iva;
      return tot;
    };
    const totalCostos = suministrosFiltrados.reduce((a, r) => a + getMontoSuministro(r), 0);
    console.log('[ProyectoDetalle] totales filtrados:', {
      rango: { desde: fechaInicio, hasta: fechaFin },
      ingresos_count: ingresosFiltrados.length,
      suministros_count: suministrosFiltrados.length,
      totalIngresos,
      totalCostos
    });
    const margen = totalIngresos - totalCostos;
    const margenPct = totalIngresos > 0 ? (margen / totalIngresos) * 100 : 0;
    return { totalIngresos, totalCostos, margen, margenPct };
  }, [ingresos, suministros, fechaInicio, fechaFin]);

  return {
    proyecto,
    fechaInicio,
    setFechaInicio,
    fechaFin,
    setFechaFin,
    ingresos: useMemo(() => ingresos.filter(r => {
      const d = parseDateOnly(r.fecha || r.createdAt);
      if (!d) return false;
      const from = parseDateOnly(fechaInicio);
      const to = endOfDay(parseDateOnly(fechaFin));
      return d >= from && d <= to;
    }), [ingresos, fechaInicio, fechaFin]),
    suministros: useMemo(() => suministros.filter(r => {
      const d = parseDateOnly(r.fecha || r.fecha_necesaria || r.fecha_compra || r.fecha_registro || r.createdAt);
      if (!d) return false;
      const from = parseDateOnly(fechaInicio);
      const to = endOfDay(parseDateOnly(fechaFin));
      return d >= from && d <= to;
    }), [suministros, fechaInicio, fechaFin]),
    totals,
    loading
  };
}
