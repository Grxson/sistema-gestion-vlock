import React, { useEffect, useRef } from 'react';
import {
  ArrowLeftIcon,
  BanknotesIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  RectangleGroupIcon
} from '@heroicons/react/24/outline';
import Chart from 'chart.js/auto';
import StatCard from '../ui/StatCard';

const formatCurrency = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

const ProyectoResumen = ({ proyecto, fechaInicio, setFechaInicio, fechaFin, setFechaFin, totals, ingresos, suministros, canSeeCosts, onBack, showResumen = true, showHeader = true, showProjectCard = true }) => {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    // Solo construir la gráfica cuando se está mostrando el resumen (canvas existe)
    const canvas = canvasRef.current;
    if (!canvas) return () => {};

    const ctx = canvas.getContext('2d');
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }

    const isDark = document.documentElement.classList.contains('dark');
    const axisColor = isDark ? '#d1d5db' : '#374151';
    const gridColor = isDark ? 'rgba(209,213,219,0.12)' : 'rgba(107,114,128,0.12)';
    const legendColor = isDark ? '#e5e7eb' : '#374151';

    const parseMonto = (val) => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      const cleaned = String(val).replace(/\$/g, '').replace(/,/g, '').replace(/\s+/g, '').trim();
      const n = parseFloat(cleaned);
      return isNaN(n) ? 0 : n;
    };

    const getMontoSuministro = (r) => {
      // Alineado con el cálculo de Totales (Suministros.jsx)
      // 1) Priorizar costo_total numérico
      const costoTotalNum = parseFloat(r?.costo_total);
      if (!isNaN(costoTotalNum) && costoTotalNum > 0) {
        return Math.round(costoTotalNum * 100) / 100;
      }
      // 2) cantidad * precio_unitario
      const cantidadNum = parseFloat(r?.cantidad) || 0;
      const precioNum = parseFloat(r?.precio_unitario) || 0;
      const calc = Math.round((cantidadNum * precioNum) * 100) / 100;
      if (calc > 0) return calc;

      // 3) Suministro múltiple: sumar items si existen
      const candidates = r?.items || r?.articulos || r?.detalle || r?.detalles;
      if (Array.isArray(candidates) && candidates.length > 0) {
        const sumItems = candidates.reduce((acc, it) => {
          const base = it.total ?? it.importe ?? it.monto;
          if (base !== undefined && base !== null && base !== '') {
            return acc + parseMonto(base);
          }
          const cant = parseFloat(it.cantidad) || 0;
          const pu = parseFloat(it.precio || it.precio_unitario) || 0;
          return acc + (cant * pu);
        }, 0);
        if (sumItems > 0) return Math.round(sumItems * 100) / 100;
      }

      // 4) Fallback: campos totales usuales
      const baseFields = r.total ?? r.total_neto ?? r.monto_total ?? r.monto ?? r.importe ?? r.total_con_iva;
      const parsedBase = parseMonto(baseFields);
      if (!isNaN(parsedBase) && parsedBase > 0) return Math.round(parsedBase * 100) / 100;

      // 5) Último recurso: subtotal + iva
      const subtotal = parseMonto(r.subtotal ?? 0);
      const iva = parseMonto(r.iva ?? r.impuesto ?? 0);
      return Math.round((subtotal + iva) * 100) / 100;
    };

    const groupByMonth = (arr, key) => {
      const map = new Map();
      arr.forEach((r) => {
        const dStr = r.fecha || r.fecha_pago || r.fecha_registro || r.createdAt;
        const d = new Date(dStr || Date.now());
        const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const val = parseMonto(r[key] ?? r.total ?? r.monto_total ?? r.importe ?? r.costo_total ?? r.total_con_iva ?? 0);
        map.set(label, (map.get(label) || 0) + val);
      });
      return map;
    };

    const ingM = groupByMonth(ingresos, 'monto');
    // map suministros to normalized records with key 'valor' (incluye múltiples)
    const suministrosNorm = suministros.map(s => ({
      fecha: s.fecha || s.fecha_necesaria || s.fecha_compra || s.fecha_registro || s.createdAt || null,
      valor: getMontoSuministro(s)
    }));
    const sumM = (() => {
      const map = new Map();
      suministrosNorm.forEach((r) => {
        const d = new Date(r.fecha || Date.now());
        const label = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const val = Number(r.valor || 0);
        map.set(label, (map.get(label) || 0) + val);
      });
      return map;
    })();

    const labels = Array.from(new Set([...ingM.keys(), ...sumM.keys()])).sort();
    const dataIn = labels.map(l => Number((ingM.get(l) || 0).toFixed(2)) );
    const dataCo = labels.map(l => Number((sumM.get(l) || 0).toFixed(2)) );

    // Gradientes sutiles
    const gradIngresos = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradIngresos.addColorStop(0, 'rgba(14,165,233,0.9)');
    gradIngresos.addColorStop(1, 'rgba(14,165,233,0.4)');
    const gradCostos = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradCostos.addColorStop(0, 'rgba(245,158,11,0.9)');
    gradCostos.addColorStop(1, 'rgba(245,158,11,0.4)');

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Ingresos', data: dataIn, backgroundColor: gradIngresos, borderColor: '#0284c7', borderWidth: 1, borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.6 },
          { label: 'Costos (Suministros)', data: dataCo, backgroundColor: gradCostos, borderColor: '#b45309', borderWidth: 1, borderRadius: 8, barPercentage: 0.6, categoryPercentage: 0.6 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: { beginAtZero: true, ticks: { color: axisColor }, grid: { color: gridColor, drawBorder: false } },
          x: { ticks: { color: axisColor }, grid: { color: 'transparent', drawBorder: false } }
        },
        plugins: {
          legend: { labels: { color: legendColor } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.raw || 0);
                return `${ctx.dataset.label}: ${new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(v)}`;
              }
            }
          }
        },
        animation: { duration: 500, easing: 'easeOutQuart' }
      }
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [ingresos, suministros]);

  return (
    <div className="space-y-6">
      {/* Header */}
      {showHeader && (
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-dark-200">
              <ArrowLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            </button>
            <RectangleGroupIcon className="h-7 w-7 text-primary-600 dark:text-primary-400 flex-shrink-0" />
            <div className="truncate">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white truncate">Proyecto</h1>
              <p className="text-gray-500 dark:text-gray-400">Detalle y rentabilidad</p>
            </div>
          </div>
          {/* filtros de fecha se muestran dentro de la tarjeta de información del proyecto */}
        </div>
      )}

      {/* Info básica y filtros */}
      {showProjectCard && proyecto && (
        <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-6">
            <div className="min-w-0">
              <div className="text-lg font-semibold text-gray-900 dark:text-white truncate">{proyecto.nombre}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{proyecto.ubicacion || 'Sin ubicación'}</div>
            </div>
            <div className="ml-auto">
              <div className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-dark-200 border border-gray-200 dark:border-gray-700">
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e)=>setFechaInicio(e.target.value)}
                  className="px-3 py-2 rounded-md bg-white dark:bg-dark-300 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e)=>setFechaFin(e.target.value)}
                  className="px-3 py-2 rounded-md bg-white dark:bg-dark-300 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {showResumen && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
            <div className="h-full"><StatCard title="Ingresos" value={formatCurrency(totals.totalIngresos)} icon={CurrencyDollarIcon} color="blue" /></div>
            {canSeeCosts && (
              <div className="h-full"><StatCard title="Costos (Suministros)" value={formatCurrency(totals.totalCostos)} icon={ClipboardDocumentListIcon} color="orange" /></div>
            )}
            {canSeeCosts && (
              <div className="h-full"><StatCard title="Margen" value={formatCurrency(totals.margen)} icon={BanknotesIcon} color="green" /></div>
            )}
            {canSeeCosts && (
              <div className="h-full"><StatCard title="Margen %" value={`${totals.margenPct.toFixed(1)}%`} icon={ChartBarIcon} color="purple" /></div>
            )}
          </div>

          {/* Gráfica */}
          <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 p-4 h-80">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>
        </>
      )}
    </div>
  );
};

export default ProyectoResumen;
