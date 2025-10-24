import React from 'react';
import { BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const AdeudosStats = ({ estadisticas, formatCurrency, filtrosActivos }) => {
  if (!estadisticas) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-dark-100 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Pendientes</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {estadisticas.conteo.totalPendientes}
            </p>
          </div>
          <BanknotesIcon className="h-10 w-10 text-gray-400" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-green-100">Nos Deben</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(estadisticas.montos.montoNosDeben)}
            </p>
          </div>
          <ArrowTrendingUpIcon className="h-10 w-10 text-green-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-red-100">Debemos</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(estadisticas.montos.montoDebemos)}
            </p>
          </div>
          <ArrowTrendingDownIcon className="h-10 w-10 text-red-200" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow p-6 text-white relative">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-100">Total Pagado</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(estadisticas.montos.totalPagado || 0)}
            </p>
            {filtrosActivos && (
              <p className="text-xs text-purple-200 mt-1">
                📅 Con filtro de fechas
              </p>
            )}
          </div>
          <CheckCircleIcon className="h-10 w-10 text-purple-200" />
        </div>
      </div>
    </div>
  );
};

export default AdeudosStats;
