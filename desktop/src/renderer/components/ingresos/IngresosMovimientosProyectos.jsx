import React, { useMemo } from 'react';

function formatCurrency(value) {
  if (value == null || isNaN(value)) return '$0';
  return Number(value).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

const tabs = [
  { id: 'filtrado', label: 'Según filtros' },
  { id: 'global', label: 'Global' }
];

export default function IngresosMovimientosProyectos({
  filteredData,
  globalData,
  view,
  onViewChange,
  emptyMessageFiltered = 'Sin información por proyecto para los filtros actuales',
  emptyMessageGlobal = 'Sin información global por proyecto'
}) {
  const rows = useMemo(() => {
    if (view === 'global') return Array.isArray(globalData) ? globalData : [];
    return Array.isArray(filteredData) ? filteredData : [];
  }, [filteredData, globalData, view]);

  const emptyMessage = view === 'global' ? emptyMessageGlobal : emptyMessageFiltered;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Capital por proyecto</h3>
        <div className="inline-flex rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          {tabs.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => onViewChange(tab.id)}
              className={`px-3 py-1 text-xs font-medium transition ${
                view === tab.id
                  ? 'bg-primary-600 text-white dark:bg-primary-500'
                  : 'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proyecto</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ingresos</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Gastos</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Ajustes</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Saldo</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-300">{emptyMessage}</td>
              </tr>
            )}
            {rows.map((row) => {
              const saldo = Number(row.saldoActual || 0);
              const saldoClass = saldo < 0 ? 'text-red-600 dark:text-red-300' : 'text-green-600 dark:text-green-300';

              return (
                <tr key={`${row.id_proyecto ?? 'np'}-${row.proyecto_nombre ?? 'sn'}`}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{row.proyecto_nombre || `Proyecto ${row.id_proyecto ?? 'N/D'}`}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-200">{formatCurrency(row.totalIngresos)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-200">{formatCurrency(row.totalGastos)}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-700 dark:text-gray-200">{formatCurrency(row.totalAjustes)}</td>
                  <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-semibold ${saldoClass}`}>{formatCurrency(saldo)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

