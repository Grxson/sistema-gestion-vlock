import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FiDollarSign } from 'react-icons/fi';
import { MetricsDisplay } from '../../utils/chartHelpers.jsx';

/**
 * Componente profesional para mostrar la gráfica de pastel de gastos por tipo
 * con desglose de detalles y total de nómina del mes
 */
const GastosPorTipoDoughnutDisplay = ({ chartData }) => {
  if (!chartData || !chartData.datasets || chartData.datasets[0].data.every(val => val === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiDollarSign size={48} className="text-gray-400 mb-2" />
        <span className="text-gray-500">No hay datos suficientes para mostrar la gráfica</span>
      </div>
    );
  }

  const { labels, datasets, metrics } = chartData;
  const total = metrics?.total || 0;
  const nomina = metrics?.nomina || 0;

  // Opciones de la gráfica con soporte para modo oscuro
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgb(156, 163, 175)', // Color visible en modo oscuro
          font: {
            size: 12,
            family: "'Inter', sans-serif"
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(229, 231, 235)',
        borderColor: 'rgb(75, 85, 99)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.label}: $${ctx.parsed.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-stretch w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      {/* Gráfica de pastel */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-4">
        <Doughnut data={{ labels, datasets }} options={chartOptions} />
      </div>
      
      {/* Desglose de detalles */}
      <div className="md:w-1/2 w-full flex flex-col justify-center">
        <h4 className="text-xl font-bold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
          Desglose de Gastos por Tipo
        </h4>
        
        {/* Lista de gastos por tipo */}
        <ul className="space-y-3 mb-6">
          {labels.map((label, idx) => (
            <li key={label} className="flex justify-between items-center py-2 px-3 rounded bg-gray-50 dark:bg-gray-700/50">
              <span className="font-medium text-gray-800 dark:text-gray-100">{label}</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                ${datasets[0].data[idx].toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
        
        {/* Totales */}
        <div className="border-t border-gray-300 dark:border-gray-600 pt-4 space-y-3">
          <div className="flex justify-between items-center py-2 px-3 rounded bg-blue-50 dark:bg-blue-900/30">
            <span className="font-bold text-gray-900 dark:text-white">Total Gastos</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GastosPorTipoDoughnutDisplay;
