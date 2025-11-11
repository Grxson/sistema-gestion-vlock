import React, { useEffect, useMemo, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import DateRangePicker from '../ui/DateRangePicker';
import api from '../../services/api';
import { computeGastoFromItem } from '../../utils/calc';

// Utilidad: obtener clave Año-Mes (YYYY-MM) de una fecha
const ymKey = (d) => {
  const dt = new Date(d);
  if (isNaN(dt)) return '0000-00';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
};

// Normalizar fecha a medianoche local (o conservar si ya viene YYYY-MM-DD) igual que en Suministros.jsx
const normalizarFecha = (fechaStr) => {
  if (!fechaStr) return null;
  if (typeof fechaStr === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fechaStr)) {
    const [year, month, day] = fechaStr.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
  }
  if (typeof fechaStr === 'string' && fechaStr.includes('T')) {
    const [datePart] = fechaStr.split('T');
    const [year, month, day] = datePart.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0, 0);
  }
  const fecha = new Date(fechaStr);
  if (isNaN(fecha.getTime())) return null;
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate(), 0, 0, 0, 0);
};

// Generar lista de meses entre rango
const monthsBetween = (start, end) => {
  const res = [];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e) || s > e) return res;
  const cur = new Date(s.getFullYear(), s.getMonth(), 1);
  const last = new Date(e.getFullYear(), e.getMonth(), 1);
  while (cur <= last) {
    res.push(`${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`);
    cur.setMonth(cur.getMonth() + 1);
  }
  return res;
};

const currencyMx = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(n || 0);

/**
 * IngresosVsGastosTab
 * - Muestra un gráfico profesional (barras agrupadas) comparando Ingresos vs Gastos por mes
 * - Incluye filtro por rango de fechas (DateRangePicker) que afecta la gráfica
 * - Gastos se calculan a partir de props.combinedData (suministros + nómina)
 * - Ingresos se consultan vía API según el rango seleccionado
 */
const IngresosVsGastosTab = ({ combinedData = [], proyectos = [], categoriasDinamicas = [] }) => {
  // Rango por defecto: últimos 6 meses
  const today = new Date();
  const defaultStart = new Date(today.getFullYear(), today.getMonth() - 6, 1).toISOString().slice(0, 10);
  const defaultEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
  
  // Guardar el rango inicial como constante para poder regresar a él
  const initialRange = { startDate: defaultStart, endDate: defaultEnd };

  const [range, setRange] = useState(initialRange);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stacked, setStacked] = useState(false);
  const [filters, setFilters] = useState({ proyecto: '', tipoGasto: '' }); // tipoGasto: 'Administrativo' | 'Proyecto' | 'Nómina' | ''

  // Cargar ingresos cuando cambia el rango
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const { startDate, endDate } = range;
                
        // Preparar parámetros: solo incluir id_proyecto si hay un filtro activo
        const params = { 
          fecha_inicio: startDate, 
          fecha_fin: endDate
        };
        
        if (filters.proyecto) {
          params.id_proyecto = filters.proyecto;
        }
        
        const resp = await api.getIngresos(params);
        const data = Array.isArray(resp?.data) ? resp.data : (resp || []);
        
        // NO aplicar filtro adicional aquí, confiar en la API
        setIngresos(data);
      } catch (e) {
        console.error('[IngresosVsGastos] Error cargando ingresos:', e);
        setError('No se pudieron cargar los ingresos para el rango seleccionado');
        setIngresos([]);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, [range.startDate, range.endDate, filters.proyecto]);

  // Filtrar gastos del rango y agrupar por mes
  // Resolver tipo de gasto desde item
  const resolveTipo = (item) => {
    // Nómina
    if (item.isNominaRow === true || item.categoria === 'Nómina' || item.tipo_suministro === 'Nómina') return 'Nómina';
    // Categoria por objeto
    if (item.categoria && typeof item.categoria === 'object' && item.categoria.tipo) return item.categoria.tipo;
    // Buscar en categoriasDinamicas
    if (item.id_categoria_suministro && Array.isArray(categoriasDinamicas)) {
      const cat = categoriasDinamicas.find(c => String(c.id) === String(item.id_categoria_suministro) || String(c.id_categoria) === String(item.id_categoria_suministro));
      if (cat?.tipo) return cat.tipo;
    }
    // Nombre
    if (item.categoria && typeof item.categoria === 'string') {
      const cat = categoriasDinamicas.find(c => c.nombre === item.categoria);
      if (cat?.tipo) return cat.tipo;
    }
    return '';
  };

  const gastosPorMes = useMemo(() => {
    if (!range.startDate || !range.endDate) return {};

    // Normalizar rango (fin del día para incluir completamente la fecha fin)
    const s = normalizarFecha(range.startDate);
    const e = normalizarFecha(range.endDate);
    if (e) e.setHours(23, 59, 59, 999);
    const inRange = (dt) => dt && s && e && dt >= s && dt <= e;

    const acc = {};
    (combinedData || []).forEach((it) => {
      // Prioridad de campos de fecha alineada con filteredSuministros: fecha_necesaria -> fecha -> createdAt -> fecha_registro -> fecha_inicio -> fecha_fin
      const raw = it.fecha_necesaria || it.fecha || it.createdAt || it.fecha_registro || it.fecha_inicio || it.fecha_fin;
      const dt = normalizarFecha(raw);
      if (!dt || !inRange(dt)) return;

      // Filtro proyecto
      if (filters.proyecto && String(it.id_proyecto || it.proyecto_id) !== String(filters.proyecto)) return;

      // Filtro tipo de gasto
      if (filters.tipoGasto) {
        const t = resolveTipo(it);
        if (t !== filters.tipoGasto) return;
      }

      const key = ymKey(dt);
      const val = computeGastoFromItem(it) || 0;
      acc[key] = (acc[key] || 0) + val;
    });

    // Debug opcional: comparar con totalGastadoFiltrado si estuviera disponible (no lo tenemos por props todavía)
    console.log('[IngresosVsGastos] Gastos agrupados por mes normalizados:', acc);
    return acc;
  }, [combinedData, range.startDate, range.endDate, filters.proyecto, filters.tipoGasto]);

  // Agrupar ingresos por mes
  const ingresosPorMes = useMemo(() => {
    const acc = {};
    console.log('[IngresosVsGastos] Agrupando ingresos por mes:', ingresos);
    (ingresos || []).forEach((r) => {
      const raw = r.fecha || r.createdAt;
      console.log('[IngresosVsGastos] Procesando ingreso:', { raw, r });
      const key = ymKey(raw);
      const val = Number(r.monto || 0);
      console.log('[IngresosVsGastos] Key:', key, 'Val:', val);
      acc[key] = (acc[key] || 0) + val;
    });
    console.log('[IngresosVsGastos] Ingresos por mes final:', acc);
    return acc;
  }, [ingresos]);

  const labels = useMemo(() => monthsBetween(range.startDate, range.endDate), [range.startDate, range.endDate]);

  const totalIngresos = useMemo(() => ingresos.reduce((a, r) => a + Number(r.monto || 0), 0), [ingresos]);
  const totalGastos = useMemo(() => Object.values(gastosPorMes).reduce((a, n) => a + n, 0), [gastosPorMes]);

  const data = {
    labels: labels.map((k) => {
      const [y, m] = k.split('-');
      return `${m}/${y}`;
    }),
    datasets: [
      {
        label: 'Ingresos',
        data: labels.map((k) => ingresosPorMes[k] || 0),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 38,
        stack: stacked ? 'stack1' : 'ingresos',
      },
      {
        label: 'Gastos',
        data: labels.map((k) => gastosPorMes[k] || 0),
        borderColor: 'rgba(220, 38, 38, 1)',
        backgroundColor: 'rgba(220, 38, 38, 0.65)',
        borderWidth: 1,
        borderRadius: 6,
        maxBarThickness: 38,
        stack: stacked ? 'stack1' : 'gastos',
      },
      {
        type: 'line',
        label: 'Margen (Ing - Gto)',
        data: labels.map((k) => (ingresosPorMes[k] || 0) - (gastosPorMes[k] || 0)),
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 2,
        tension: 0.35,
        yAxisID: 'y',
        pointRadius: 3,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)'
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#e5e7eb',
          usePointStyle: true,
          pointStyle: 'rounded',
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => `${ctx.dataset.label}: ${currencyMx(ctx.parsed.y)}`,
          footer: (items) => {
            const sum = items.reduce((a, it) => a + it.parsed.y, 0);
            return `Total mes: ${currencyMx(sum)}`;
          },
        },
      },
      title: {
        display: true,
        text: 'Ingresos vs Gastos por Mes',
        color: '#fff',
        font: { weight: 'bold', size: 14 },
      },
    },
    scales: {
      x: {
        stacked: stacked,
        grid: { color: 'rgba(148,163,184,0.15)' },
        ticks: { color: '#cbd5e1' },
      },
      y: {
        beginAtZero: true,
        stacked: stacked,
        grid: { color: 'rgba(148,163,184,0.15)' },
        ticks: {
          color: '#cbd5e1',
          callback: (v) => new Intl.NumberFormat('es-MX', { notation: 'compact', maximumFractionDigits: 1 }).format(v),
        },
      },
    },
  };

  const margen = totalIngresos - totalGastos;
  const margenPct = totalIngresos > 0 ? (margen / totalIngresos) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-end lg:justify-between">
          <div className="w-full lg:w-auto">
            <DateRangePicker
              startDate={range.startDate}
              endDate={range.endDate}
              onChange={({ startDate, endDate }) => setRange({ startDate, endDate })}
              onReset={() => setRange(initialRange)}
              startLabel="Desde"
              endLabel="Hasta"
            />
          </div>
          {/* Filtros adicionales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto">
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-sm text-gray-700 dark:text-gray-300"
              value={filters.proyecto}
              onChange={(e) => setFilters((f) => ({ ...f, proyecto: e.target.value }))}
            >
              <option value="">Todos los proyectos</option>
              {proyectos.map((p) => (
                <option key={p.id_proyecto || p.id} value={p.id_proyecto || p.id}>{p.nombre_proyecto || p.nombre || `Proyecto ${p.id_proyecto || p.id}`}</option>
              ))}
            </select>
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-dark-200 text-sm text-gray-700 dark:text-gray-300"
              value={filters.tipoGasto}
              onChange={(e) => setFilters((f) => ({ ...f, tipoGasto: e.target.value }))}
            >
              <option value="">Todos los tipos de gasto</option>
              <option value="Administrativo">Administrativo</option>
              <option value="Proyecto">Proyecto</option>
              <option value="Nómina">Nómina</option>
            </select>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setStacked((s) => !s)}
              className={`px-3 py-2 rounded-md text-sm font-medium border transition-colors ${stacked ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-dark-200 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'}`}
              title="Alternar barras apiladas/agrupadas"
            >
              {stacked ? 'Barras: Apiladas' : 'Barras: Agrupadas'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg px-4 py-3">
            <div className="text-xs text-green-700 dark:text-green-300">Total Ingresos</div>
            <div className="text-lg font-semibold text-green-800 dark:text-green-200">{currencyMx(totalIngresos)}</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-3">
            <div className="text-xs text-red-700 dark:text-red-300">Total Gastos</div>
            <div className="text-lg font-semibold text-red-800 dark:text-red-200">{currencyMx(totalGastos)}</div>
          </div>
          <div className={`${margen>=0? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-lg px-4 py-3`}>
            <div className="text-xs text-blue-700 dark:text-blue-300">Margen (Ing - Gto)</div>
            <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">{currencyMx(margen)}</div>
          </div>
          <div className={`${margen>=0? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-orange-50 dark:bg-orange-900/20'} rounded-lg px-4 py-3`}>
            <div className="text-xs text-blue-700 dark:text-blue-300">Margen %</div>
            <div className="text-lg font-semibold text-blue-800 dark:text-blue-200">{margenPct.toFixed(2)}%</div>
          </div>
        </div>
      </div>

      {/* Gráfica */}
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 min-h-[380px]">
        {loading ? (
          <div className="flex items-center justify-center h-[320px]">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-500 border-t-transparent"></div>
          </div>
        ) : (
          <div className="h-[340px]">
            <Bar data={data} options={options} />
          </div>
        )}
      </div>
    </div>
  );
};

export default IngresosVsGastosTab;
