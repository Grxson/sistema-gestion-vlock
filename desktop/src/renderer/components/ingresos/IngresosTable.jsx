import React from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

function Row({ row, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-dark-200">
      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(row.fecha).toLocaleDateString('es-ES')}</td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.proyecto?.nombre || row.proyecto_nombre || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{row.fuente || '—'}</td>
      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={row.descripcion}>{row.descripcion || '—'}</td>
      <td className="px-4 py-3 text-sm font-semibold text-green-700 dark:text-green-400">${Number(row.monto).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => onEdit(row)} className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg">
          <PencilIcon className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(row)} className="ml-1 p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-200 rounded-lg">
          <TrashIcon className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}

export default function IngresosTable({ data, loading, error, onEdit, onDelete }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600 dark:text-red-400">{error.message || 'Error al cargar ingresos'}</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-gray-500 dark:text-gray-400">No hay ingresos registrados</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-dark-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Proyecto</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fuente</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Descripción</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Monto</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map(row => (
            <Row key={row.id_ingreso} row={row} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
