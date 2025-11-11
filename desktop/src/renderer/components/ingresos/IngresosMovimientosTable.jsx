import React from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

function formatCurrency(v) {
  if (v == null || isNaN(v)) return '$0';
  return Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function typeBadge(tipo) {
  const map = {
    ingreso: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-200', icon: '↗️', label: 'INGRESO' },
    gasto: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-200', icon: '↘️', label: 'GASTO' },
    ajuste: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-200', icon: '🔧', label: 'AJUSTE' },
  };
  return map[tipo] || { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-200', icon: '•', label: tipo?.toUpperCase() || '-' };
}

function fuenteBadge(fuente) {
  const map = {
    nomina: { icon: '👷', color: 'text-blue-600 dark:text-blue-400' },
    suministro: { icon: '📦', color: 'text-purple-600 dark:text-purple-400' },
    manual: { icon: '✍️', color: 'text-gray-600 dark:text-gray-400' },
    otros: { icon: '📋', color: 'text-gray-600 dark:text-gray-400' },
  };
  return map[fuente] || { icon: '•', color: 'text-gray-600 dark:text-gray-400' };
}

export default function IngresosMovimientosTable({ data, loading, error }) {
  if (loading) return <div className="p-6"><LoadingSpinner /></div>;
  if (error) return <div className="p-6 text-red-600">{String(error)}</div>;
  const rows = data || [];

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-dark-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proyecto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fuente</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Saldo después</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-4xl">📊</span>
                  <span>No hay movimientos registrados</span>
                </div>
              </td>
            </tr>
          )}
          {rows.map((r) => {
            const tipoBadgeData = typeBadge(r.tipo);
            const fuenteBadgeData = fuenteBadge(r.fuente);
            const isNegativeSaldo = r.saldo_after != null && r.saldo_after < 0;
            
            return (
              <tr key={r.id_mov || `${r.fecha || r.createdAt}-${r.fuente}-${r.monto}`} className="hover:bg-gray-50 dark:hover:bg-dark-200 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                  {new Date(r.fecha || r.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <span className="text-xs">🏗️</span>
                    <span>{r.proyecto_nombre || '-'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${tipoBadgeData.bg} ${tipoBadgeData.text}`}>
                    <span>{tipoBadgeData.icon}</span>
                    <span>{tipoBadgeData.label}</span>
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <div className={`flex items-center gap-1 ${fuenteBadgeData.color}`}>
                    <span>{fuenteBadgeData.icon}</span>
                    <span className="font-medium">{r.fuente || '-'}</span>
                  </div>
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-bold ${
                  r.tipo === 'ingreso' ? 'text-green-700 dark:text-green-400' : 
                  r.tipo === 'gasto' ? 'text-red-700 dark:text-red-400' : 
                  'text-yellow-700 dark:text-yellow-400'
                }`}>
                  {r.tipo === 'ingreso' ? '+' : r.tipo === 'gasto' ? '-' : ''}{formatCurrency(r.monto)}
                </td>
                <td className={`px-4 py-3 whitespace-nowrap text-sm text-right font-semibold ${
                  isNegativeSaldo ? 'text-red-700 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {r.saldo_after != null ? (
                    <div className="flex items-center justify-end gap-1">
                      {isNegativeSaldo && <span className="text-xs">⚠️</span>}
                      <span>{formatCurrency(r.saldo_after)}</span>
                    </div>
                  ) : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate" title={r.descripcion}>
                  {r.descripcion || '-'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
