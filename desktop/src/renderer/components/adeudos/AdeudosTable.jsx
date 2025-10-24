import React from 'react';
import { BanknotesIcon, CheckCircleIcon, PencilIcon, TrashIcon, CurrencyDollarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { calcularDiasRestantes, obtenerNivelUrgencia, obtenerMensajeAlerta, obtenerColoresUrgencia, formatearFecha } from '../../utils/alertasVencimiento';

const AdeudosTable = ({
  adeudos,
  loading,
  onMarkPaid,
  onEdit,
  onDelete,
  onRegistrarPago,
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
                Monto / Pendiente
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
            {adeudosFiltrados.map((adeudo) => {
              const nivelUrgencia = obtenerNivelUrgencia(adeudo.fecha_vencimiento, adeudo.estado);
              const diasRestantes = calcularDiasRestantes(adeudo.fecha_vencimiento);
              const mensajeAlerta = obtenerMensajeAlerta(diasRestantes);
              const coloresUrgencia = obtenerColoresUrgencia(nivelUrgencia);

              return (
                <tr 
                  key={adeudo.id_adeudo_general} 
                  className={`hover:bg-gray-50 dark:hover:bg-dark-200 ${coloresUrgencia.border}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {adeudo.nombre_entidad}
                    </div>
                    {adeudo.notas && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                        {adeudo.notas}
                      </div>
                    )}
                    {nivelUrgencia && (
                      <div className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-xs font-medium ${coloresUrgencia.badge}`}>
                        <ClockIcon className="w-3 h-3" />
                        {mensajeAlerta}
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
                  <div className="space-y-1">
                    <div
                      className={`text-sm font-semibold ${
                        adeudo.tipo_adeudo === 'nos_deben'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {formatCurrency(adeudo.monto_original || adeudo.monto)}
                    </div>
                    {adeudo.estado === 'parcial' && (
                      <div className="text-xs space-y-0.5">
                        <div className="text-gray-600 dark:text-gray-400">
                          Pagado: <span className="font-medium text-green-600 dark:text-green-400">{formatCurrency(adeudo.monto_pagado)}</span>
                        </div>
                        <div className="text-gray-600 dark:text-gray-400">
                          Pendiente: <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(adeudo.monto_pendiente || adeudo.monto)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      adeudo.estado === 'pagado'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : adeudo.estado === 'parcial'
                        ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {adeudo.estado === 'pagado' ? '✓ Pagado' : adeudo.estado === 'parcial' ? '⏳ Parcial' : '⏱ Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(adeudo.fecha_registro)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    {(adeudo.estado === 'pendiente' || adeudo.estado === 'parcial') && (
                      <>
                        <button
                          onClick={() => onRegistrarPago(adeudo)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                          title="Registrar pago"
                        >
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onMarkPaid(adeudo.id_adeudo_general)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Liquidar completo"
                        >
                          <CheckCircleIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                    {adeudo.estado === 'pendiente' && (
                      <button
                        onClick={() => onEdit(adeudo)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="Editar"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdeudosTable;
