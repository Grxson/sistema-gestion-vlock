import React, { useEffect, useRef } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdeudosChartModal = ({ isOpen, onClose, estadisticas, formatCurrency }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !estadisticas) return null;

  // Calcular totales desde la estructura correcta del backend
  const totalDebemos = estadisticas.montos?.montoDebemos || 0;
  const totalNosDeben = estadisticas.montos?.montoNosDeben || 0;
  const totalPagado = estadisticas.montos?.totalPagado || 0;
  
  // Contadores
  const cantidadDebemos = estadisticas.conteo?.totalDebemos || 0;
  const cantidadNosDeben = estadisticas.conteo?.totalNosDeben || 0;
  const cantidadPagados = estadisticas.conteo?.totalPagados || 0;

  // Datos para la gráfica de pastel
  const chartData = {
    labels: ['Lo que debemos', 'Lo que nos deben', 'Lo que hemos pagado'],
    datasets: [
      {
        data: [totalDebemos, totalNosDeben, totalPagado],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Rojo para lo que debemos
          'rgba(34, 197, 94, 0.8)',   // Verde para lo que nos deben
          'rgba(59, 130, 246, 0.8)',  // Azul para lo pagado
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          font: {
            size: 14,
            family: "'Inter', sans-serif",
          },
          color: document.documentElement.classList.contains('dark') ? '#e5e7eb' : '#374151',
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        ref={modalRef}
        className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Análisis de Adeudos
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Visualización de deudas, créditos y pagos
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Gráfica de Pastel */}
          <div className="bg-gray-50 dark:bg-dark-200 rounded-lg p-6">
            <div className="max-w-md mx-auto">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Resumen de datos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lo que debemos */}
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">
                    Lo que debemos
                  </p>
                  <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                    {formatCurrency(totalDebemos)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                {cantidadDebemos} adeudo(s)
              </p>
            </div>

            {/* Lo que nos deben */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Lo que nos deben
                  </p>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                    {formatCurrency(totalNosDeben)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {cantidadNosDeben} adeudo(s)
              </p>
            </div>

            {/* Lo que hemos pagado */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Lo que hemos pagado
                  </p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {formatCurrency(totalPagado)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                {cantidadPagados} adeudo(s) liquidado(s)
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdeudosChartModal;
