import React from 'react';
import { formatCurrency } from '../../utils/currency';
import {
  CurrencyDollarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function NominaWeeklySummary({ weeklyData, loading }) {
  if (loading || !weeklyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Calculando resumen semanal...</p>
        </div>
      </div>
    );
  }

  const {
    totalAmount,
    totalNominas,
    paidNominas,
    pendingNominas,
    partialPayments,
    paidAmount,
    pendingAmount,
    startOfWeek,
    endOfWeek
  } = weeklyData;

  const summaryCards = [
    {
      title: 'Total a Pagar Esta Semana',
      value: formatCurrency(totalAmount),
      icon: CurrencyDollarIcon,
      color: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      description: `${totalNominas} nóminas procesadas`
    },
    {
      title: 'Nóminas Pagadas',
      value: paidNominas,
      icon: CheckCircleIcon,
      color: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      description: formatCurrency(paidAmount),
      subtitle: 'Completadas'
    },
    {
      title: 'Nóminas Pendientes',
      value: pendingNominas,
      icon: ClockIcon,
      color: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      description: formatCurrency(pendingAmount),
      subtitle: 'Por procesar'
    },
    {
      title: 'Pagos Parciales',
      value: partialPayments,
      icon: ExclamationTriangleIcon,
      color: 'bg-orange-100 dark:bg-orange-900/30',
      iconColor: 'text-orange-600 dark:text-orange-400',
      description: 'Requieren liquidación',
      subtitle: 'Adeudos pendientes'
    }
  ];

  const progressPercentage = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Resumen de la Semana */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Resumen de la Semana
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <Icon className={`h-5 w-5 ${card.iconColor}`} />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.title}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {card.description}
                    </p>
                    {card.subtitle && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Progreso */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Progreso de Pagos de la Semana
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {progressPercentage.toFixed(1)}% completado
          </span>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Pagado:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(paidAmount)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Pendiente:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(pendingAmount)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
            <span className="text-gray-600 dark:text-gray-400">Total:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* Información Adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Período de la Semana */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Período de Pago
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Inicio:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {startOfWeek.toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Fin:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {endOfWeek.toLocaleDateString('es-MX', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Días laborales:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                6 días
              </span>
            </div>
          </div>
        </div>

        {/* Estadísticas Rápidas */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-4">
            <UserGroupIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Estadísticas Rápidas
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Promedio por nómina:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {formatCurrency(totalNominas > 0 ? totalAmount / totalNominas : 0)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Tasa de completitud:</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Nóminas con adeudos:</span>
              <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                {partialPayments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
