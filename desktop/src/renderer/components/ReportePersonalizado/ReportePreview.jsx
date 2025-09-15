import React from 'react';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';

const ReportePreview = ({ 
  config, 
  suministros, 
  estadisticas,
  graficasData,
  isPreview = false 
}) => {
  const today = new Date();
  const pageStyle = isPreview ? "max-w-full" : "w-full min-h-screen";

  // Componente para renderizar gráficas
  const renderGrafica = (tipo, data, options, titulo) => {
    if (!data || !data.datasets || data.datasets.length === 0) return null;

    const ChartComponent = {
      'gastos-mes': Line,
      'valor-categoria': Bar,
      'suministros-mes': Line,
      'top-proveedores': Bar,
      'estados-suministros': Doughnut,
      'precios-categoria': Bar,
      'cantidad-categoria': Bar,
      'suministros-proveedor': Bar,
      'gastos-categoria': Bar,
      'promedio-precios': Line,
      'distribucion-unidades': Pie,
      'codigos-producto': Bar,
      'analisis-concreto': Bar,
      'm3-concreto': Line,
      'horas-maquinaria': Line
    }[tipo] || Bar;

    return (
      <div className="mb-8 break-inside-avoid">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          {titulo}
        </h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div style={{ height: '300px', width: '100%' }}>
            <ChartComponent 
              data={data} 
              options={{
                ...options,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  ...options?.plugins,
                  legend: {
                    ...options?.plugins?.legend,
                    position: 'bottom',
                    labels: {
                      fontSize: 10,
                      boxWidth: 12
                    }
                  }
                },
                scales: options?.scales ? {
                  ...options.scales,
                  x: {
                    ...options.scales.x,
                    ticks: {
                      ...options.scales.x?.ticks,
                      fontSize: 10
                    }
                  },
                  y: {
                    ...options.scales.y,
                    ticks: {
                      ...options.scales.y?.ticks,
                      fontSize: 10
                    }
                  }
                } : undefined
              }} 
            />
          </div>
        </div>
      </div>
    );
  };

  // Función para renderizar tabla de suministros
  const renderTabla = () => {
    if (!config.incluirTabla || !suministros || suministros.length === 0) return null;

    const suministrosPaginados = suministros.slice(0, 50); // Primera página para preview
    const totalPaginas = Math.ceil(suministros.length / 50);

    return (
      <div className="mb-8 break-inside-avoid">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Detalle de Suministros
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({suministros.length} registros total)
          </span>
        </h2>
        
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {config.formatoTabla === 'enumerada' && (
                  <th className="border border-gray-300 px-2 py-2 text-left font-semibold">#</th>
                )}
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">ID</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Nombre</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Categoría</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Proveedor</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Cantidad</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Unidad</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Precio Unit.</th>
                <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Total</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Estado</th>
                <th className="border border-gray-300 px-2 py-2 text-left font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {suministrosPaginados.map((suministro, index) => (
                <tr key={suministro.id_suministro} className="hover:bg-gray-50">
                  {config.formatoTabla === 'enumerada' && (
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {index + 1}
                    </td>
                  )}
                  <td className="border border-gray-300 px-2 py-2">
                    {suministro.id_suministro}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {suministro.nombre_suministro}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {suministro.categoria || 'N/A'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {suministro.nombre_proveedor || 'N/A'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right">
                    {formatNumber(suministro.cantidad, 2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {suministro.unidad_medida || 'N/A'}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right">
                    {formatCurrency(suministro.precio_unitario, 2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2 text-right font-semibold">
                    {formatCurrency(suministro.cantidad * suministro.precio_unitario, 2)}
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      suministro.estado === 'Recibido' ? 'bg-green-100 text-green-800' :
                      suministro.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {suministro.estado || 'N/A'}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-2 py-2">
                    {formatDate(suministro.fecha_solicitud)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPaginas > 1 && (
          <p className="text-xs text-gray-600 mt-2">
            Mostrando primeros 50 registros. Total: {suministros.length} suministros en {totalPaginas} páginas.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className={`${pageStyle} bg-white`} id="reporte-preview">
      {/* PORTADA */}
      <div className="p-8 text-center break-after-page">
        <div className="mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">VLOCK SISTEMAS</h1>
          <p className="text-gray-600">Sistema de Gestión de Suministros</p>
        </div>

        <div className="border-t border-b border-gray-200 py-8 my-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {config.titulo || 'REPORTE DE SUMINISTROS'}
          </h2>
          {config.subtitulo && (
            <p className="text-lg text-gray-600 mb-4">{config.subtitulo}</p>
          )}
          <p className="text-gray-500">
            Reporte generado el {formatDate(today)}
          </p>
        </div>

        <div className="text-left max-w-md mx-auto">
          <h3 className="font-semibold text-gray-800 mb-2">Contenido del Reporte:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {config.incluirEstadisticas && <li>• Estadísticas Generales</li>}
            {config.incluirTabla && <li>• Tabla Detallada de Suministros</li>}
            {config.graficasSeleccionadas?.length > 0 && (
              <li>• {config.graficasSeleccionadas.length} Gráfica(s) de Análisis</li>
            )}
          </ul>
        </div>
      </div>

      {/* RESUMEN EJECUTIVO */}
      {config.incluirEstadisticas && estadisticas && (
        <div className="p-8 break-after-page">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
            RESUMEN EJECUTIVO
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-1">Total Suministros</h3>
              <p className="text-2xl font-bold text-blue-900">{formatNumber(estadisticas.totalSuministros || 0)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-800 mb-1">Inversión Total</h3>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(estadisticas.inversionTotal || 0)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <h3 className="text-sm font-semibold text-purple-800 mb-1">Proveedores Activos</h3>
              <p className="text-2xl font-bold text-purple-900">{formatNumber(estadisticas.totalProveedores || 0)}</p>
            </div>
            
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
              <h3 className="text-sm font-semibold text-orange-800 mb-1">Promedio Mensual</h3>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(estadisticas.promedioMensual || 0)}</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Análisis del Período</h3>
            <p className="text-gray-700 mb-4">
              Durante el período analizado, se registraron un total de{' '}
              <strong>{formatNumber(estadisticas.totalSuministros || 0)}</strong> suministros
              con una inversión total de <strong>{formatCurrency(estadisticas.inversionTotal || 0)}</strong>,
              distribuidos entre <strong>{formatNumber(estadisticas.totalProveedores || 0)}</strong> proveedores activos.
            </p>
            
            {estadisticas.categoriaTop && (
              <p className="text-gray-700 mb-4">
                La categoría con mayor movimiento fue <strong>{estadisticas.categoriaTop}</strong>,
                representando el mayor volumen de inversión del período.
              </p>
            )}
            
            <p className="text-gray-700">
              El promedio mensual de inversión es de{' '}
              <strong>{formatCurrency(estadisticas.promedioMensual || 0)}</strong>,
              indicando una gestión constante de los recursos de suministros.
            </p>
          </div>
        </div>
      )}

      {/* GRÁFICAS SELECCIONADAS */}
      {config.graficasSeleccionadas?.length > 0 && (
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b-2 border-blue-600 pb-2">
            ANÁLISIS GRÁFICO
          </h2>
          
          <div className="columns-2 gap-8">
            {config.graficasSeleccionadas.map((grafica) => {
              const data = graficasData?.[grafica.id];
              if (!data) return null;
              
              return renderGrafica(
                grafica.id,
                data.data,
                data.options,
                grafica.titulo
              );
            })}
          </div>
        </div>
      )}

      {/* TABLA DE SUMINISTROS */}
      {renderTabla()}

      {/* PIE DE PÁGINA */}
      <div className="p-8 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>
          Reporte generado por VLOCK Sistema de Gestión - {formatDate(today)} - 
          Confidencial y de uso interno únicamente
        </p>
      </div>
    </div>
  );
};

export default ReportePreview;
