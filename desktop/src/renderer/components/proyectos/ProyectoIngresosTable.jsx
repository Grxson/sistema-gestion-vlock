import React from 'react';

const formatCurrency = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(n || 0));

const ProyectoIngresosTable = ({ ingresos = [] }) => {
  return (
    <div className="bg-white dark:bg-dark-100 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-dark-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fuente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Monto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {ingresos.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">Sin ingresos en el periodo</td>
              </tr>
            ) : ingresos.map((i) => (
              <tr key={i.id_ingreso} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{i.fecha}</td>
                <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{i.fuente || '—'}</td>
                <td className="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{i.descripcion || '—'}</td>
                <td className="px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(i.monto)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProyectoIngresosTable;
