import React from 'react';

function formatCurrency(v) {
  if (v == null || isNaN(v)) return '$0';
  return Number(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

export default function IngresosMovimientosCards({ resumen, globalResumen }) {
  const {
    montoInicial = 0,
    totalIngresos = 0,
    totalGastos = 0,
    totalAjustes = 0,
    saldoActual = montoInicial + totalIngresos - totalGastos + totalAjustes
  } = resumen || {};

  const porcentajeGastado = totalIngresos > 0 ? (totalGastos / totalIngresos) * 100 : 0;
  const porcentajeDisponible = totalIngresos > 0 ? (saldoActual / totalIngresos) * 100 : 0;
  const globalSaldo = globalResumen ? (globalResumen.saldoActual ?? (globalResumen.totalIngresos - globalResumen.totalGastos + (globalResumen.totalAjustes || 0))) : null;

  // Determinar estado del capital
  const getCapitalStatus = () => {
    if (saldoActual < 0) return { color: 'red', icon: '🚨', text: 'SOBREGIRO' };
    if (porcentajeDisponible < 20) return { color: 'orange', icon: '⚠️', text: 'BAJO' };
    if (porcentajeDisponible < 50) return { color: 'yellow', icon: '⚡', text: 'MEDIO' };
    return { color: 'green', icon: '✅', text: 'DISPONIBLE' };
  };

  const capitalStatus = getCapitalStatus();

  return (
    <div className="space-y-4">
      {/* Card Principal - Capital Disponible */}
      <div className={`rounded-xl p-6 shadow-lg border-2 ${
        capitalStatus.color === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-500' :
        capitalStatus.color === 'orange' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-500' :
        capitalStatus.color === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500' :
        'bg-green-50 dark:bg-green-900/20 border-green-500'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{capitalStatus.icon}</span>
              <span className={`text-xs font-bold uppercase tracking-wide ${
                capitalStatus.color === 'red' ? 'text-red-700 dark:text-red-300' :
                capitalStatus.color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                capitalStatus.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                'text-green-700 dark:text-green-300'
              }`}>
                CAPITAL {capitalStatus.text}
              </span>
            </div>
            <div className={`text-4xl font-bold ${
              capitalStatus.color === 'red' ? 'text-red-700 dark:text-red-400' :
              capitalStatus.color === 'orange' ? 'text-orange-700 dark:text-orange-400' :
              capitalStatus.color === 'yellow' ? 'text-yellow-700 dark:text-yellow-400' :
              'text-green-700 dark:text-green-400'
            }`}>
              {formatCurrency(saldoActual)}
            </div>
            <div className={`text-sm mt-2 ${
              capitalStatus.color === 'red' ? 'text-red-600 dark:text-red-300' :
              capitalStatus.color === 'orange' ? 'text-orange-600 dark:text-orange-300' :
              capitalStatus.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-300' :
              'text-green-600 dark:text-green-300'
            }`}>
              {totalIngresos > 0 ? `${porcentajeDisponible.toFixed(1)}% disponible` : 'Sin ingresos registrados'}
            </div>
          </div>
          
          {/* Indicador visual de porcentaje */}
          <div className="hidden md:flex flex-col items-end gap-2">
            <div className="text-sm font-medium text-gray-600 dark:text-gray-300">
              De {formatCurrency(totalIngresos)}
            </div>
            <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${
                  capitalStatus.color === 'red' ? 'bg-red-500' :
                  capitalStatus.color === 'orange' ? 'bg-orange-500' :
                  capitalStatus.color === 'yellow' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.max(0, Math.min(100, porcentajeDisponible))}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards secundarias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg p-4 shadow bg-white dark:bg-dark-100 border border-blue-300 dark:border-blue-500">
          <div className="flex items-center gap-2 mb-1">
            <span>💰</span>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ingresos</div>
          </div>
          <div className="text-2xl font-semibold text-blue-700 dark:text-blue-400">{formatCurrency(totalIngresos)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total registrado</div>
        </div>

        <div className="rounded-lg p-4 shadow bg-white dark:bg-dark-100 border border-red-300 dark:border-red-500">
          <div className="flex items-center gap-2 mb-1">
            <span>💸</span>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Gastos</div>
          </div>
          <div className="text-2xl font-semibold text-red-700 dark:text-red-400">{formatCurrency(totalGastos)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {totalIngresos > 0 ? `${porcentajeGastado.toFixed(1)}% utilizado` : 'Sin ingresos'}
          </div>
        </div>

        <div className="rounded-lg p-4 shadow bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-500">
          <div className="flex items-center gap-2 mb-1">
            <span>🔧</span>
            <div className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Ajustes</div>
          </div>
          <div className={`text-2xl font-semibold ${totalAjustes < 0 ? 'text-red-700 dark:text-red-400' : totalAjustes > 0 ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-400'}`}>
            {formatCurrency(totalAjustes)}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Correcciones</div>
        </div>
      </div>

      {/* Banner global si existe */}
      {globalSaldo != null && (
        <div className="rounded-lg border border-primary-200 dark:border-primary-600 bg-primary-50 dark:bg-primary-900/30 px-4 py-3 text-sm text-primary-800 dark:text-primary-200">
          💼 Capital total del sistema: <span className="font-semibold">{formatCurrency(globalSaldo)}</span>
        </div>
      )}
    </div>
  );
}
