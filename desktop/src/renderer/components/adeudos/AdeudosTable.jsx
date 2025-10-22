import React from 'react';
import { BanknotesIcon, CheckCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const AdeudosTable = ({
  adeudos,
  loading,
  onMarkPaid,
  onEdit,
  onDelete,
  formatCurrency,
  formatDate,
  filterText
}) => {
  const adeudosFiltrados = adeudos.filter((adeudo) =>
    adeudo.nombre_entidad.toLowerCase().includes(filterText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (adeudosFiltrados.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow overflow-hidden">
        <div className="text-center py-12">
          <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No hay adeudos</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Comienza agregando un nuevo adeudo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dark-100 rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-dark-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-100 divide-y divide-gray-200 dark:divide-gray-700">
            {adeudosFiltrados.map((adeudo) => (
              <tr key={adeudo.id_adeudo_general} className="hover:bg-gray-50 dark:hover:bg-dark-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {adeudo.nombre_entidad}
                  </div>
                  {adeudo.notas && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                      {adeudo.notas}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      adeudo.tipo_adeudo === 'nos_deben'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}
                  >
                    {adeudo.tipo_adeudo === 'nos_deben' ? '💸 Nos deben' : '🔻 Debemos'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div
                    className={`text-sm font-semibold ${
                      adeudo.tipo_adeudo === 'nos_deben'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {formatCurrency(adeudo.monto)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      adeudo.estado === 'pagado'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {adeudo.estado === 'pagado' ? 'Pagado' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(adeudo.fecha_registro)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {adeudo.estado === 'pendiente' && (
                      <>
                        <button
                          onClick={() => onMarkPaid(adeudo.id_adeudo_general)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Marcar como pagado"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onEdit(adeudo)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => onDelete(adeudo.id_adeudo_general)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdeudosTable;
