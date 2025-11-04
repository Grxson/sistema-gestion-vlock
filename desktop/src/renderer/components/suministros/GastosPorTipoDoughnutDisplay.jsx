import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { FiDollarSign } from 'react-icons/fi';
import { MetricsDisplay } from '../../utils/chartHelpers.jsx';

/**
 * Componente profesional para mostrar la gráfica de pastel de gastos por tipo
 * con desglose de detalles y total de nómina del mes
 */
const GastosPorTipoDoughnutDisplay = ({ chartData }) => {
  // Detectar modo oscuro dinámicamente
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!chartData || !chartData.datasets || chartData.datasets[0].data.every(val => val === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <FiDollarSign size={48} className={`mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} />
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
          No hay datos suficientes para mostrar la gráfica
        </span>
      </div>
    );
  }

  const { labels, datasets, metrics } = chartData;
  const total = metrics?.total || 0;
  const nomina = metrics?.nomina || 0;

  // Opciones de la gráfica con soporte dinámico para modo oscuro
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDarkMode ? 'rgb(229, 231, 235)' : 'rgb(31, 41, 55)',
          font: {
            size: 12,
            family: "'Inter', sans-serif",
            weight: '500'
          },
          padding: 15,
          usePointStyle: true
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(17, 24, 39, 0.95)' : 'rgba(0, 0, 0, 0.85)',
        titleColor: 'rgb(243, 244, 246)',
        bodyColor: 'rgb(229, 231, 235)',
        borderColor: isDarkMode ? 'rgb(75, 85, 99)' : 'rgba(59, 130, 246, 0.5)',
        borderWidth: 1,
        padding: 12,
        callbacks: {
          label: (ctx) => `${ctx.label}: $${ctx.parsed.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        }
      }
    }
  };

  return (
    <div className={`flex flex-col md:flex-row gap-8 items-stretch w-full p-6 rounded-lg shadow-sm transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
    }`}>
      {/* Gráfica de pastel */}
      <div className="md:w-1/2 w-full flex items-center justify-center p-4">
        <Doughnut data={{ labels, datasets }} options={chartOptions} />
      </div>
      
      {/* Desglose de detalles */}
      <div className="md:w-1/2 w-full flex flex-col justify-center">
        <h4 className={`text-xl font-bold mb-6 pb-3 border-b transition-colors ${
          isDarkMode 
            ? 'text-white border-gray-700' 
            : 'text-gray-900 border-gray-200'
        }`}>
          Desglose de Gastos por Tipo
        </h4>
        
        {/* Lista de gastos por tipo */}
        <ul className="space-y-3 mb-6">
          {labels.map((label, idx) => (
            <li 
              key={label} 
              className={`flex justify-between items-center py-2 px-3 rounded transition-colors ${
                isDarkMode 
                  ? 'bg-gray-700/50 hover:bg-gray-700' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                {label}
              </span>
              <span className={`font-semibold ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                ${datasets[0].data[idx].toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </li>
          ))}
        </ul>
        
        {/* Totales */}
        <div className={`border-t pt-4 space-y-3 ${isDarkMode ? 'border-gray-600' : 'border-gray-300'}`}>
          <div className={`flex justify-between items-center py-2 px-3 rounded transition-colors ${
            isDarkMode 
              ? 'bg-blue-900/30 hover:bg-blue-900/40' 
              : 'bg-blue-50 hover:bg-blue-100'
          }`}>
            <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Total Gastos
            </span>
            <span className={`text-xl font-bold ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
              ${total.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default GastosPorTipoDoughnutDisplay;
