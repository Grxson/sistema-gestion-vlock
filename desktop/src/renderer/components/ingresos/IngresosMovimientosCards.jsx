import React from 'react';

function formatCurrency(v) {
  if (v == null || isNaN(v)) return '$0';
  return Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export default function IngresosMovimientosCards({ resumen }) {
  const { montoInicial = 0, totalIngresos = 0, totalGastos = 0, totalAjustes = 0 } = resumen || {};
  const saldo = montoInicial + totalIngresos - totalGastos + totalAjustes;
  const porcentajeGastado = montoInicial + totalIngresos > 0 ? (totalGastos / (montoInicial + totalIngresos)) * 100 : 0;

  const cards = [
    { label: 'Inicial + Ingresos', value: montoInicial + totalIngresos, subtitle: `${formatCurrency(montoInicial)} inicial` },
    { label: 'Gastos', value: totalGastos, subtitle: formatCurrency(totalGastos), type: 'danger' },
    { label: 'Ajustes', value: totalAjustes, subtitle: formatCurrency(totalAjustes), type: 'warning' },
    { label: 'Saldo', value: saldo, subtitle: `${formatCurrency(saldo)} (${porcentajeGastado.toFixed(1)}% gastado)` , type: saldo < 0 ? 'danger' : 'success' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <div key={c.label} className={`rounded-lg p-4 shadow bg-white dark:bg-dark-100 border ${c.type==='danger' ? 'border-red-300 dark:border-red-500' : c.type==='warning' ? 'border-yellow-300 dark:border-yellow-500' : c.type==='success' ? 'border-green-300 dark:border-green-500' : 'border-gray-200 dark:border-gray-600'}`}> 
          <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">{c.label}</div>
          <div className="text-xl font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(c.value)}</div>
          <div className="text-sm text-gray-600 dark:text-gray-300 mt-2">{c.subtitle}</div>
        </div>
      ))}
    </div>
  );
}
