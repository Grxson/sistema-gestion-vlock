import React, { forwardRef, useRef } from 'react';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const ReportePersonalizadoPreview = forwardRef(({ 
  data, 
  statistics, 
  config, 
  filtros, 
  chartsData = {} 
}, ref) => {
  
  // Componente para renderizar gráficas
  const ChartComponent = ({ type, data, options, title }) => {
    const ChartMap = {
      line: Line,
      bar: Bar,
      doughnut: Doughnut,
      pie: Pie
    };
    
    const Chart = ChartMap[type] || Line;
    
    if (!data?.datasets || data.datasets.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
          <p>Sin datos para mostrar</p>
        </div>
      );
    }
    
    return (
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {title}
        </h4>
        <div style={{ height: '300px', width: '100%' }}>
          <Chart data={data} options={{
            ...options,
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              ...options?.plugins,
              legend: {
                ...options?.plugins?.legend,
                labels: {
                  color: document.documentElement.classList.contains('dark') ? '#ffffff' : '#374151'
                }
              }
            },
            scales: options?.scales ? {
              ...options.scales,
              x: {
                ...options.scales.x,
                ticks: {
                  ...options.scales.x?.ticks,
                  color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
                }
              },
              y: {
                ...options.scales.y,
                ticks: {
                  ...options.scales.y?.ticks,
                  color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                },
                grid: {
                  color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
                }
              }
            } : undefined
          }} />
        </div>
      </div>
    );
  };

  return (
    <div ref={ref} className="bg-white dark:bg-gray-800 p-8 min-h-screen">
      {/* Encabezado del reporte */}
      <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {config.title || 'Reporte de Suministros'}
        </h1>
        {config.subtitle && (
          <h2 className="text-lg text-gray-600 dark:text-gray-400 mb-2">
            {config.subtitle}
          </h2>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Generado el: {new Date().toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Estadísticas generales */}
      {config.includeStatistics && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Estadísticas Generales
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Suministros</h4>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {formatNumber(statistics.total)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-green-600 dark:text-green-400">Valor Total</h4>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {formatCurrency(statistics.totalValue)}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Stock Bajo</h4>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {formatNumber(statistics.lowStock)}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-purple-600 dark:text-purple-400">Alto Valor</h4>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {formatNumber(statistics.highValue)}
              </p>
            </div>
          </div>
          
          {/* Distribución por categorías */}
          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
              Distribución por Categorías
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {Object.entries(statistics.byCategory).map(([category, count]) => (
                <div key={category} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                    {category}:
                  </span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gráficas seleccionadas */}
      {config.includeCharts && chartsData && Object.keys(chartsData).length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Análisis Gráfico
          </h3>
          <div className="space-y-8">
            {Object.entries(config.charts).map(([chartKey, isEnabled]) => {
              if (!isEnabled || !chartsData[chartKey]) return null;
              
              const chartInfo = chartsData[chartKey];
              return (
                <div key={chartKey} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <ChartComponent
                    type={chartInfo.type}
                    data={chartInfo.data}
                    options={chartInfo.options}
                    title={chartInfo.title}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tabla de datos */}
      {config.includeTable && data && data.length > 0 && (
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
            Detalle de Suministros
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    {config.tableFormat === 'enumerated' ? '#' : 'ID'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descripción
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proyecto
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Proveedor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {data.slice(0, 100).map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {config.tableFormat === 'enumerated' ? item.numero_fila : item.id_suministro}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {(item.descripcion || '').substring(0, 50)}
                      {(item.descripcion || '').length > 50 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.tipo_suministro || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatNumber(item.cantidad)} {item.unidad || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {formatCurrency(parseFloat(item.precio_unitario) || 0)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.proyecto || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {item.proveedor || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.length > 100 && (
              <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Mostrando los primeros 100 elementos de {data.length} total
              </p>
            )}
          </div>
        </div>
      )}

      {/* Pie de página */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-8">
        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Sistema de Gestión VLock - Reporte Generado Automáticamente</p>
          <p>Filtros aplicados: {JSON.stringify(filtros, null, 2).replace(/[{}\"]/g, '').replace(/,/g, ', ') || 'Ninguno'}</p>
        </div>
      </div>
    </div>
  );
});

ReportePersonalizadoPreview.displayName = 'ReportePersonalizadoPreview';

export default ReportePersonalizadoPreview;
