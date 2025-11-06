import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

function formatCurrency(v) {
  if (v == null || isNaN(v)) return '$0';
  return Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function typeBadge(tipo) {
  const map = {
    ingreso: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
    gasto: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200',
    ajuste: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200',
  };
  return map[tipo] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
}

export default function IngresosMovimientosTable({ data, loading, error }) {
  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  const rows = data || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-dark-50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Proyecto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fuente</th>
            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Monto</th>
            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Descripción</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="px-4 py-6 text-center text-gray-500 dark:text-gray-300">Sin movimientos</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.id_mov || `${r.fecha}-${r.fuente}-${r.monto}`}>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-800 dark:text-gray-100">{new Date(r.fecha).toLocaleDateString('es-ES')}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{r.proyecto_nombre || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap">
                <span className={`px-2 py-1 rounded text-xs font-medium ${typeBadge(r.tipo)}`}>{r.tipo}</span>
              </td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">{r.fuente || '-'}</td>
              <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(r.monto)}</td>
              <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-300">{r.descripcion || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
