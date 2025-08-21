import React, { useState, useEffect } from 'react';
import { measureResponseTime, getMemoryInfo, getPerformanceInfo, logDiagnosticEvent } from '../../utils/diagnosticUtils';

/**
 * Componente para monitorear el rendimiento del sistema
 * Muestra métricas de memoria, tiempo de carga, y respuesta de APIs
 */
const PerformanceMonitor = () => {
  const [metrics, setMetrics] = useState({
    memoryUsage: 0,
    loadTime: 0,
    apiResponseTimes: [],
    renderTime: 0,
    lastUpdate: null,
    memoryLimit: 0
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Medir tiempo de renderizado
  const measureRenderTime = () => {
    const start = performance.now();
    setTimeout(() => {
      const renderTime = performance.now() - start;
      setMetrics(prev => ({
        ...prev,
        renderTime: parseFloat(renderTime.toFixed(2))
      }));
    }, 0);
  };

  // Obtener información de memoria
  const getMemoryMetrics = () => {
    return getMemoryInfo();
  };

  // Actualizar métricas
  const updateMetrics = async () => {
    logDiagnosticEvent('info', 'Actualizando métricas de rendimiento');
    
    const memory = getMemoryMetrics();
    const performance = getPerformanceInfo();

    // Medir APIs usando endpoints públicos
    const apiTests = ['/health', '/db/health'];
    const apiTimes = [];
    
    for (const endpoint of apiTests) {
      const result = await measureResponseTime(endpoint);
      if (result.responseTime) {
        apiTimes.push(result.responseTime);
      }
    }

    measureRenderTime();

    const newMetrics = {
      memoryUsage: memory.used,
      memoryLimit: memory.limit,
      loadTime: performance.available ? performance.loadEnd : 0,
      apiResponseTimes: apiTimes,
      renderTime: metrics.renderTime, // Mantener el valor anterior hasta que se actualice
      lastUpdate: new Date()
    };

    setMetrics(newMetrics);
    
    logDiagnosticEvent('info', 'Métricas de rendimiento actualizadas', {
      memory: `${memory.used}MB`,
      apiCount: apiTimes.length,
      avgApiTime: apiTimes.length > 0 ? (apiTimes.reduce((a, b) => a + b) / apiTimes.length).toFixed(2) : 0
    });
  };

  // Auto-actualización cada 10 segundos si está monitoreando
  useEffect(() => {
    let interval;
    if (isMonitoring) {
      interval = setInterval(updateMetrics, 10000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring]);

  // Actualización inicial
  useEffect(() => {
    updateMetrics();
  }, []);

  const getPerformanceStatus = (value, type) => {
    switch (type) {
      case 'memory':
        if (value < 50) return { color: 'green', status: 'Excelente' };
        if (value < 100) return { color: 'yellow', status: 'Bueno' };
        return { color: 'red', status: 'Alto' };
      case 'api':
        if (value < 200) return { color: 'green', status: 'Rápido' };
        if (value < 1000) return { color: 'yellow', status: 'Normal' };
        return { color: 'red', status: 'Lento' };
      case 'render':
        if (value < 16) return { color: 'green', status: 'Fluido' };
        if (value < 50) return { color: 'yellow', status: 'Aceptable' };
        return { color: 'red', status: 'Lento' };
      default:
        return { color: 'gray', status: 'N/A' };
    }
  };

  const avgApiTime = (metrics.apiResponseTimes && metrics.apiResponseTimes.length > 0) ? 
    metrics.apiResponseTimes.reduce((a, b) => a + b, 0) / metrics.apiResponseTimes.length : 0;

  const memoryStatus = getPerformanceStatus(metrics.memoryUsage, 'memory');
  const apiStatus = getPerformanceStatus(avgApiTime, 'api');
  const renderStatus = getPerformanceStatus(metrics.renderTime, 'render');

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <span className="mr-2">📈</span>
          Monitor de Rendimiento
        </h3>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            isMonitoring 
              ? 'bg-red-100 text-red-700 hover:bg-red-200' 
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          {isMonitoring ? '⏹️ Detener' : '▶️ Monitorear'}
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Memoria */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">💾 Memoria</span>
            <span className={`text-xs px-2 py-1 rounded ${
              memoryStatus.color === 'green' ? 'bg-green-100 text-green-700' :
              memoryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {memoryStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">{metrics.memoryUsage || 0} MB</div>
          {metrics.memoryLimit > 0 && (
            <div className="text-xs text-gray-500">
              Límite: {metrics.memoryLimit || 0} MB
            </div>
          )}
        </div>

        {/* Tiempo de Carga */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">⚡ Carga Inicial</span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {metrics.loadTime > 0 ? `${metrics.loadTime}ms` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">Tiempo de carga</div>
        </div>

        {/* APIs */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">🌐 APIs</span>
            <span className={`text-xs px-2 py-1 rounded ${
              apiStatus.color === 'green' ? 'bg-green-100 text-green-700' :
              apiStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {apiStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">
            {avgApiTime > 0 ? `${Math.round(avgApiTime)}ms` : 'N/A'}
          </div>
          <div className="text-xs text-gray-500">
            {(metrics.apiResponseTimes || []).length} pruebas
          </div>
        </div>

        {/* Renderizado */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">🎨 Render</span>
            <span className={`text-xs px-2 py-1 rounded ${
              renderStatus.color === 'green' ? 'bg-green-100 text-green-700' :
              renderStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {renderStatus.status}
            </span>
          </div>
          <div className="text-lg font-bold text-gray-800">{metrics.renderTime || 0}ms</div>
          <div className="text-xs text-gray-500">Último render</div>
        </div>
      </div>

      {/* Controles */}
      <div className="flex gap-2">
        <button
          onClick={updateMetrics}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔄 Actualizar
        </button>
        {metrics.lastUpdate && (
          <span className="text-xs text-gray-500 self-center">
            Actualizado: {metrics.lastUpdate.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* Información adicional */}
      {isMonitoring && (
        <div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
          📊 Monitoreando en tiempo real (actualización cada 10 segundos)
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
