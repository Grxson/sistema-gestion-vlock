import React, { useState, useEffect } from 'react';
import { checkBackendHealth, checkDatabaseHealth, logDiagnosticEvent } from '../../utils/diagnosticUtils';

/**
 * Componente para monitorear el estado de las conexiones del sistema
 * Verifica conectividad con backend y base de datos
 */
const ConnectionMonitor = () => {
  const [connections, setConnections] = useState({
    backend: 'unknown',
    database: 'unknown',
    lastCheck: null,
    checking: false
  });

  const [autoCheck, setAutoCheck] = useState(false);

  const checkConnections = async () => {
    setConnections(prev => ({ ...prev, checking: true }));
    logDiagnosticEvent('info', 'Iniciando verificación de conexiones');
    
    try {
      // Verificar backend
      const backendResult = await checkBackendHealth();
      const backendStatus = backendResult.status === 'healthy' ? 'connected' : 'error';
      
      if (backendResult.status === 'error') {
        logDiagnosticEvent('warning', `Backend no disponible: ${backendResult.error}`);
      } else {
        logDiagnosticEvent('success', 'Backend conectado correctamente');
      }
      
      // Verificar base de datos
      const dbResult = await checkDatabaseHealth();
      const dbStatus = dbResult.status === 'healthy' ? 'connected' : 'error';
      
      if (dbResult.status === 'error') {
        logDiagnosticEvent('warning', `Base de datos no disponible: ${dbResult.error}`);
      } else {
        logDiagnosticEvent('success', 'Base de datos conectada correctamente');
      }
      
      setConnections({
        backend: backendStatus,
        database: dbStatus,
        lastCheck: new Date(),
        checking: false
      });
      
      logDiagnosticEvent('info', 'Verificación de conexiones completada', {
        backend: backendStatus,
        database: dbStatus
      });
      
    } catch (error) {
      console.error('Error during connection checks:', error);
      logDiagnosticEvent('error', 'Error durante verificación de conexiones', { error: error.message });
      
      setConnections({
        backend: 'error',
        database: 'error',
        lastCheck: new Date(),
        checking: false
      });
    }
  };

  // Auto-check cada 30 segundos si está habilitado
  useEffect(() => {
    let interval;
    if (autoCheck) {
      interval = setInterval(checkConnections, 30000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoCheck]);

  // Check inicial al montar el componente
  useEffect(() => {
    checkConnections();
  }, []);

  const getStatusInfo = (status) => {
    switch (status) {
      case 'connected':
        return { 
          text: '✅ Conectado', 
          className: 'bg-green-100 text-green-800',
          icon: '✅'
        };
      case 'error':
        return { 
          text: '❌ Error', 
          className: 'bg-red-100 text-red-800',
          icon: '❌'
        };
      default:
        return { 
          text: '❓ Desconocido', 
          className: 'bg-gray-100 text-gray-800',
          icon: '❓'
        };
    }
  };

  const backendInfo = getStatusInfo(connections.backend);
  const databaseInfo = getStatusInfo(connections.database);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <span className="mr-2">🔗</span>
          Estado de Conexiones
        </h3>
        <label className="flex items-center text-sm">
          <input
            type="checkbox"
            checked={autoCheck}
            onChange={(e) => setAutoCheck(e.target.checked)}
            className="mr-1"
          />
          Auto-verificar
        </label>
      </div>
      
      <div className="space-y-3">
        {/* Backend Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">🖥️</span>
            <span className="font-medium">Backend API:</span>
            <span className="ml-2 text-sm text-gray-500">{import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${backendInfo.className}`}>
            {backendInfo.text}
          </span>
        </div>

        {/* Database Status */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="mr-2">🗄️</span>
            <span className="font-medium">Base de Datos:</span>
            <span className="ml-2 text-sm text-gray-500">MySQL/MariaDB</span>
          </div>
          <span className={`px-2 py-1 rounded text-xs font-medium ${databaseInfo.className}`}>
            {databaseInfo.text}
          </span>
        </div>

        {/* Last Check Info */}
        {connections.lastCheck && (
          <div className="text-xs text-gray-500 flex items-center">
            <span className="mr-2">🕐</span>
            Última verificación: {connections.lastCheck.toLocaleTimeString()}
            {autoCheck && <span className="ml-2 text-blue-600">(auto-verificando cada 30s)</span>}
          </div>
        )}

        {/* Check Button */}
        <button 
          onClick={checkConnections} 
          disabled={connections.checking}
          className="w-full mt-3 p-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {connections.checking ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Verificando...
            </span>
          ) : (
            '🔄 Verificar Conexiones'
          )}
        </button>

        {/* Health Summary */}
        <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
          <div className="font-medium mb-1">Resumen de Estado:</div>
          {connections.backend === 'connected' && connections.database === 'connected' ? (
            <span className="text-green-600">✅ Sistema completamente operacional</span>
          ) : connections.backend === 'connected' ? (
            <span className="text-yellow-600">⚠️ Backend conectado, verificar base de datos</span>
          ) : (
            <span className="text-red-600">❌ Problemas de conectividad detectados</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConnectionMonitor;
