import React, { useRef, useEffect } from 'react';
import { 
  XMarkIcon, 
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { formatCurrency, formatNumber, formatPercentage } from '../../utils/formatters';

const ChartModal = ({ 
  isOpen, 
  onClose, 
  chartData, 
  chartOptions, 
  chartType = 'line',
  title = 'Gráfica', 
  subtitle = '',
  color = 'blue',
  metrics = null,
  customContent = null // Nuevo parámetro para contenido personalizado
}) => {
  const chartRef = useRef(null);
  const modalRef = useRef(null);
  const exportRef = useRef(null); // Nueva referencia para contenido exportable

  // Validar datos antes de renderizar
  const hasValidData = chartData && 
                      chartData.datasets && 
                      Array.isArray(chartData.datasets) && 
                      chartData.datasets.length > 0;

  // Cerrar modal al presionar ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Función para exportar como PNG
  const exportAsPNG = async () => {
    if (!exportRef.current) return;
    
    try {
      // Detectar tema oscuro
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Capturar solo el contenido exportable (sin botones del modal)
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Fondo según tema
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.dataset.exclude === 'true';
        }
      });
      
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error al exportar PNG:', error);
      alert('Error al exportar la imagen. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para exportar como PDF
  const exportAsPDF = async () => {
    if (!exportRef.current) return;
    
    try {
      // Detectar tema oscuro
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      // Capturar solo el contenido exportable (sin botones del modal)
      const canvas = await html2canvas(exportRef.current, {
        backgroundColor: isDarkMode ? '#1f2937' : '#ffffff', // Fondo según tema
        scale: 2,
        logging: false,
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return element.dataset.exclude === 'true';
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
      
      // Calcular dimensiones para ajustar al PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = (pdfHeight - imgHeight * ratio) / 2;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al exportar el PDF. Por favor, inténtalo de nuevo.');
    }
  };

  // Función para renderizar el componente de gráfica correcto
  const renderChart = () => {
    const commonProps = {
      data: chartData,
      options: {
        ...chartOptions,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...chartOptions?.plugins,
          legend: {
            ...chartOptions?.plugins?.legend,
            labels: {
              ...chartOptions?.plugins?.legend?.labels,
              font: {
                size: 14,
                weight: '500'
              }
            }
          }
        }
      }
    };

    switch (chartType) {
      case 'bar':
        return <Bar {...commonProps} />;
      case 'doughnut':
        return <Doughnut {...commonProps} />;
      case 'pie':
        return <Pie {...commonProps} />;
      case 'line':
      default:
        return <Line {...commonProps} />;
    }
  };

  const colorClasses = {
    blue: 'border-blue-200 dark:border-blue-800',
    green: 'border-green-200 dark:border-green-800',
    amber: 'border-amber-200 dark:border-amber-800',
    red: 'border-red-200 dark:border-red-800',
    purple: 'border-purple-200 dark:border-purple-800'
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - NO EXPORTABLE */}
        <div className={`border-b-2 ${colorClasses[color]} p-6 bg-gray-50 dark:bg-gray-700`} data-exclude="true">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                <ArrowDownTrayIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                {subtitle && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {/* Botones de acción */}
            <div className="flex items-center gap-3">
              <button
                onClick={exportAsPNG}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors duration-200 font-medium"
                title="Exportar como PNG"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                PNG
              </button>
              
              <button
                onClick={exportAsPDF}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors duration-200 font-medium"
                title="Exportar como PDF"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                PDF
              </button>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                title="Cerrar"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Contenido de la gráfica - EXPORTABLE */}
        <div ref={exportRef} className="p-8">
          {/* Métricas si están disponibles */}
          {metrics && hasValidData && (
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(metrics).map(([key, value]) => {
                if (key === 'tendencia') return null;
                let displayValue = value;
                let label = key;
                
                // Formatear valores según el tipo
                if (key === 'total' || key === 'promedio' || key === 'maximo' || key === 'minimo') {
                  displayValue = formatCurrency(value);
                  label = key.charAt(0).toUpperCase() + key.slice(1);
                } else if (key === 'cantidad' || key === 'totalItems') {
                  displayValue = formatNumber(value);
                  label = 'Cantidad';
                } else if (typeof value === 'number' && value < 1) {
                  displayValue = formatPercentage(value * 100);
                } else if (typeof value === 'number') {
                  displayValue = formatNumber(value);
                  label = key.charAt(0).toUpperCase() + key.slice(1);
                }
                
                return (
                  <div key={key} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {label}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {displayValue}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Layout especial para gráfica con tabla personalizada */}
          {customContent ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Gráfica */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <div style={{ height: '400px' }}>
                  {hasValidData ? (
                    renderChart()
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-gray-400 dark:text-gray-600 mb-4">
                          <XMarkIcon className="h-16 w-16 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          No hay datos disponibles
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Los datos de la gráfica no están disponibles o son inválidos.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tabla Desglosada - Estilo Original */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Desglose Detallado
                </h4>
                
                {/* Lista de categorías - Sin scroll, todas visibles */}
                <div className="space-y-3">
                  {customContent.detalles?.map((detalle, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: detalle.color }}
                        ></div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {detalle.categoria}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatCurrency(detalle.gasto)}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {detalle.porcentaje}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Total General */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-500">
                  <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-600 rounded-lg shadow-sm">
                    <span className="font-bold text-gray-900 dark:text-white">Total General:</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(customContent.totalGeneral || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Layout normal para otras gráficas */
            <div 
              ref={chartRef}
              className="bg-white dark:bg-gray-800 rounded-xl p-6"
              style={{ height: '60vh', minHeight: '400px' }}
            >
              {hasValidData ? (
                renderChart()
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="text-gray-400 dark:text-gray-600 mb-4">
                      <XMarkIcon className="h-16 w-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No hay datos disponibles
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Los datos de la gráfica no están disponibles o son inválidos.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChartModal;
