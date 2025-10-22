import React from 'react';
import { BanknotesIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

const AdeudosStats = ({ estadisticas, formatCurrency }) => {
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

      <div
        className={`rounded-lg shadow p-6 text-white ${
          estadisticas.montos.balance >= 0
            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
            : 'bg-gradient-to-br from-orange-500 to-orange-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90">Balance</p>
            <p className="text-2xl font-bold mt-1">
              {formatCurrency(estadisticas.montos.balance)}
            </p>
          </div>
          <BanknotesIcon className="h-10 w-10 opacity-80" />
        </div>
      </div>
    </div>
  );
};

export default AdeudosStats;
