import React, { useState, useEffect, useRef } from 'react';

/**
 * Componente para mostrar y gestionar el registro de actividades del sistema
 * Captura logs, errores y eventos importantes
 */
const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [isCapturing, setIsCapturing] = useState(true);
  const [maxEntries, setMaxEntries] = useState(100);
  const logContainerRef = useRef(null);

  const logLevels = {
    info: { color: 'blue', icon: 'ℹ️', bgClass: 'bg-blue-50 border-blue-200' },
    warning: { color: 'yellow', icon: '⚠️', bgClass: 'bg-yellow-50 border-yellow-200' },
    error: { color: 'red', icon: '❌', bgClass: 'bg-red-50 border-red-200' },
    success: { color: 'green', icon: '✅', bgClass: 'bg-green-50 border-green-200' },
    debug: { color: 'purple', icon: '🐛', bgClass: 'bg-purple-50 border-purple-200' }
  };

  // Función para agregar un log
  const addLog = (level, message, details = null) => {
    const newLog = {
      id: Date.now() + Math.random(),
      level,
      message,
      details,
      timestamp: new Date().toLocaleTimeString(),
      fullTimestamp: new Date()
    };

    setLogs(prevLogs => {
      const updatedLogs = [newLog, ...prevLogs].slice(0, maxEntries);
      return updatedLogs;
    });

    // Auto-scroll al nuevo log
    setTimeout(() => {
      if (logContainerRef.current) {
        logContainerRef.current.scrollTop = 0;
      }
    }, 100);
  };

  // Interceptar console.log, console.error, etc.
  useEffect(() => {
    if (!isCapturing) return;

    const originalConsole = {
      log: console.log,
      error: console.error,
      warn: console.warn,
      info: console.info
    };

    console.log = (...args) => {
      originalConsole.log(...args);
      if (isCapturing) {
        addLog('info', args.join(' '));
      }
    };

    console.error = (...args) => {
      originalConsole.error(...args);
      if (isCapturing) {
        addLog('error', args.join(' '));
      }
    };

    console.warn = (...args) => {
      originalConsole.warn(...args);
      if (isCapturing) {
        addLog('warning', args.join(' '));
      }
    };

    console.info = (...args) => {
      originalConsole.info(...args);
      if (isCapturing) {
        addLog('info', args.join(' '));
      }
    };

    // Interceptar errores globales
    const handleError = (event) => {
      if (isCapturing) {
        addLog('error', `Error no capturado: ${event.error?.message || event.message}`, {
          stack: event.error?.stack,
          filename: event.filename,
          lineno: event.lineno
        });
      }
    };

    const handleUnhandledRejection = (event) => {
      if (isCapturing) {
        addLog('error', `Promise rechazada: ${event.reason}`, {
          reason: event.reason
        });
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Logs iniciales
    addLog('success', 'Sistema de logs iniciado');
    addLog('info', `Capturando hasta ${maxEntries} entradas`);

    return () => {
      // Restaurar console original
      console.log = originalConsole.log;
      console.error = originalConsole.error;
      console.warn = originalConsole.warn;
      console.info = originalConsole.info;

      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isCapturing, maxEntries]);

  // Filtrar logs
  const filteredLogs = (logs || []).filter(log => {
    if (!log || !log.level) return false;
    if (filter === 'all') return true;
    return log.level === filter;
  });

  // Estadísticas de logs
  const logStats = (logs || []).reduce((stats, log) => {
    if (log && log.level) {
      stats[log.level] = (stats[log.level] || 0) + 1;
    }
    return stats;
  }, {});

  // Funciones de utilidad para testing
  const generateTestLogs = () => {
    addLog('info', 'Este es un log de información de prueba');
    addLog('warning', 'Este es un warning de prueba');
    addLog('error', 'Este es un error de prueba');
    addLog('success', 'Operación completada exitosamente');
    addLog('debug', 'Información de debug para desarrollo');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <span className="mr-2">📝</span>
          Registro de Actividades
          <span className="ml-2 text-sm bg-gray-200 px-2 py-1 rounded">
            {logs.length}/{maxEntries}
          </span>
        </h3>
        
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setIsCapturing(!isCapturing)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              isCapturing 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {isCapturing ? '⏹️ Detener' : '▶️ Capturar'}
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      {logs.length > 0 && (
        <div className="flex gap-2 mb-3 text-xs">
          {Object.entries(logStats).map(([level, count]) => (
            <span
              key={level}
              className={`px-2 py-1 rounded flex items-center ${
                logLevels[level]?.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                logLevels[level]?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                logLevels[level]?.color === 'red' ? 'bg-red-100 text-red-700' :
                logLevels[level]?.color === 'green' ? 'bg-green-100 text-green-700' :
                'bg-purple-100 text-purple-700'
              }`}
            >
              <span className="mr-1">{logLevels[level]?.icon}</span>
              {count}
            </span>
          ))}
        </div>
      )}

      {/* Controles */}
      <div className="flex gap-2 mb-3">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="all">Todos ({logs.length})</option>
          <option value="error">Errores ({logStats.error || 0})</option>
          <option value="warning">Advertencias ({logStats.warning || 0})</option>
          <option value="info">Información ({logStats.info || 0})</option>
          <option value="success">Éxito ({logStats.success || 0})</option>
          <option value="debug">Debug ({logStats.debug || 0})</option>
        </select>

        <input
          type="number"
          value={maxEntries}
          onChange={(e) => setMaxEntries(Math.max(10, Math.min(500, parseInt(e.target.value) || 100)))}
          className="text-sm border rounded px-2 py-1 w-20"
          min="10"
          max="500"
          title="Máximo número de logs"
        />

        <button
          onClick={generateTestLogs}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
        >
          🧪 Test
        </button>
      </div>

      {/* Container de logs */}
      <div 
        ref={logContainerRef}
        className="max-h-64 overflow-y-auto space-y-1 border rounded p-2 bg-gray-50"
      >
        {filteredLogs.length > 0 ? filteredLogs.map((log) => (
          <div 
            key={log.id} 
            className={`text-xs border-l-2 pl-2 py-1 ${logLevels[log.level]?.bgClass || 'bg-gray-50 border-gray-200'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start min-w-0 flex-1">
                <span className="mr-1 flex-shrink-0">{logLevels[log.level]?.icon}</span>
                <span className="text-gray-500 mr-2 flex-shrink-0">{log.timestamp}</span>
                <span className="break-words">{log.message}</span>
              </div>
            </div>
            {log.details && (
              <div className="mt-1 ml-6 text-gray-600 bg-white bg-opacity-50 p-1 rounded text-xs">
                <details>
                  <summary className="cursor-pointer">Ver detalles</summary>
                  <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(log.details, null, 2)}</pre>
                </details>
              </div>
            )}
          </div>
        )) : (
          <p className="text-gray-500 text-sm text-center py-4">
            {filter === 'all' ? 'No hay actividades registradas' : `No hay logs de tipo "${filter}"`}
          </p>
        )}
      </div>

      {/* Botón limpiar */}
      <div className="flex justify-between items-center mt-3">
        <button 
          onClick={() => setLogs([])}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
          disabled={logs.length === 0}
        >
          🗑️ Limpiar Registro
        </button>
        
        {/* Exportar logs */}
        <button
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `vlock-logs-${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          disabled={logs.length === 0}
        >
          💾 Exportar
        </button>
      </div>

      {/* Estado */}
      <div className="mt-3 text-xs text-gray-500">
        {isCapturing ? (
          <span className="text-green-600">🟢 Capturando logs en tiempo real</span>
        ) : (
          <span className="text-red-600">🔴 Captura de logs pausada</span>
        )}
      </div>
    </div>
  );
};

export default ActivityLog;
