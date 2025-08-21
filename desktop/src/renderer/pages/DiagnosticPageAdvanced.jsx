import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useTheme } from '../contexts/ThemeContext';

const DiagnosticPageAdvanced = () => {
  const { user } = useAuth();
  const { permissions, hasPermission } = usePermissions();
  const { isDarkMode } = useTheme();
  
  const [systemHealth, setSystemHealth] = useState({
    backend: 'checking',
    database: 'checking',
    permissions: 'checking'
  });
  
  const [metrics, setMetrics] = useState({
    memory: 0,
    uptime: 0,
    totalUsers: 0,
    totalPermissions: 0,
    responseTime: 0
  });

  const [activeTab, setActiveTab] = useState('overview');
  const [activityLog, setActivityLog] = useState([]);
  const [settings, setSettings] = useState({
    autoRefresh: true,
    refreshInterval: 30,
    showNotifications: true,
    logLevel: 'info'
  });
  
  // Función para agregar al log de actividad
  const addToLog = (message, type = 'info') => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setActivityLog(prev => [logEntry, ...prev.slice(0, 99)]); // Mantener solo los últimos 100
  };

  // Función para verificar salud del sistema
  const checkSystemHealth = async () => {
    addToLog('Iniciando verificación de salud del sistema...', 'info');
    
    try {
      const startTime = performance.now();
      
      // Verificar backend
      const response = await fetch('http://localhost:4000/api/health');
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);
      
      setMetrics(prev => ({ ...prev, responseTime }));
      
      if (response.ok) {
        setSystemHealth(prev => ({ ...prev, backend: 'healthy' }));
        addToLog(`Backend conectado correctamente (${responseTime}ms)`, 'success');
        
        // Intentar verificar base de datos
        try {
          const dbResponse = await fetch('http://localhost:4000/api/db/health');
          if (dbResponse.ok) {
            setSystemHealth(prev => ({ ...prev, database: 'healthy' }));
            addToLog('Base de datos conectada correctamente', 'success');
          } else {
            setSystemHealth(prev => ({ ...prev, database: 'warning' }));
            addToLog('Base de datos con problemas', 'warning');
          }
        } catch (dbError) {
          setSystemHealth(prev => ({ ...prev, database: 'error' }));
          addToLog('Error al verificar base de datos', 'error');
        }
      } else {
        setSystemHealth(prev => ({ ...prev, backend: 'error' }));
        addToLog('Backend responde con errores', 'error');
      }
    } catch (error) {
      setSystemHealth(prev => ({ ...prev, backend: 'error' }));
      addToLog('No se puede conectar al backend', 'error');
    }
    
    // Verificar permisos
    if (permissions && Object.keys(permissions).length > 0) {
      setSystemHealth(prev => ({ ...prev, permissions: 'healthy' }));
      addToLog(`Sistema de permisos operativo (${Object.keys(permissions).length} permisos)`, 'success');
    } else {
      setSystemHealth(prev => ({ ...prev, permissions: 'warning' }));
      addToLog('Sistema de permisos con problemas', 'warning');
    }
  };

  // Función para obtener métricas del sistema
  const updateMetrics = () => {
    const newMetrics = {
      memory: Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024) || 0,
      uptime: Math.round(performance.now() / 1000),
      totalUsers: user ? 1 : 0,
      totalPermissions: permissions ? Object.keys(permissions).length : 0,
      responseTime: metrics.responseTime
    };
    
    setMetrics(newMetrics);
    addToLog(`Métricas actualizadas: ${newMetrics.memory}MB memoria`, 'info');
  };

  // Función para exportar configuración
  const exportConfig = () => {
    const config = {
      user: user ? {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol?.nombre
      } : null,
      permissions: permissions || {},
      systemHealth,
      metrics,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vlock-diagnostic-${Date.now()}.json`;
    a.click();
    
    addToLog('Configuración exportada correctamente', 'success');
  };

  // Función para simular error (para pruebas)
  const simulateError = () => {
    addToLog('SIMULACIÓN: Error de prueba generado', 'error');
    setSystemHealth(prev => ({ ...prev, backend: 'error' }));
    
    setTimeout(() => {
      addToLog('SIMULACIÓN: Sistema recuperado automáticamente', 'success');
      checkSystemHealth();
    }, 3000);
  };

  useEffect(() => {
    checkSystemHealth();
    updateMetrics();
    addToLog('Sistema de diagnóstico inicializado', 'info');
    
    let interval;
    if (settings.autoRefresh) {
      interval = setInterval(() => {
        checkSystemHealth();
        updateMetrics();
      }, settings.refreshInterval * 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [permissions, settings.autoRefresh, settings.refreshInterval]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      case 'checking': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'checking': return '🔄';
      default: return '❓';
    }
  };

  const getLogTypeColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const renderOverviewTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Estado del Sistema */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          📊 Estado del Sistema
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Backend API</span>
            <span className={`flex items-center gap-2 ${getStatusColor(systemHealth.backend)}`}>
              {getStatusIcon(systemHealth.backend)} 
              {systemHealth.backend}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Base de Datos</span>
            <span className={`flex items-center gap-2 ${getStatusColor(systemHealth.database)}`}>
              {getStatusIcon(systemHealth.database)} 
              {systemHealth.database}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Sistema de Permisos</span>
            <span className={`flex items-center gap-2 ${getStatusColor(systemHealth.permissions)}`}>
              {getStatusIcon(systemHealth.permissions)} 
              {systemHealth.permissions}
            </span>
          </div>
        </div>
      </div>

      {/* Métricas del Sistema */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          📈 Métricas de Rendimiento
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Memoria Usada</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{metrics.memory} MB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Tiempo Activo</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{Math.floor(metrics.uptime / 60)}m {metrics.uptime % 60}s</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Tiempo de Respuesta</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{metrics.responseTime}ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 dark:text-gray-300">Permisos Cargados</span>
            <span className="font-mono text-sm text-gray-800 dark:text-gray-200">{metrics.totalPermissions}</span>
          </div>
        </div>
      </div>

      {/* Indicadores Rápidos */}
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          🚥 Indicadores
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              systemHealth.backend === 'healthy' ? 'bg-green-500' : 
              systemHealth.backend === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700 dark:text-gray-300">Conectividad General</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              metrics.memory < 100 ? 'bg-green-500' : 
              metrics.memory < 200 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700 dark:text-gray-300">Uso de Memoria</span>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              metrics.responseTime < 1000 ? 'bg-green-500' : 
              metrics.responseTime < 3000 ? 'bg-yellow-500' : 'bg-red-500'
            }`}></div>
            <span className="text-gray-700 dark:text-gray-300">Rendimiento API</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConnectionTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          🔗 Monitor de Conexiones en Tiempo Real
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              🖥️ Frontend (Electron + React)
            </h4>
            <div className="text-sm space-y-1">
              <div className="text-gray-600 dark:text-gray-400">Puerto: 3001 (Vite Dev Server)</div>
              <div className="text-gray-600 dark:text-gray-400">Estado: <span className="text-green-500">✅ Activo</span></div>
              <div className="text-gray-600 dark:text-gray-400">Memoria: {metrics.memory} MB</div>
              <div className="text-gray-600 dark:text-gray-400">Uptime: {Math.floor(metrics.uptime / 60)}m</div>
            </div>
          </div>
          
          <div className="p-4 border dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
            <h4 className="font-medium mb-2 flex items-center gap-2 text-gray-800 dark:text-gray-200">
              🚀 Backend API
            </h4>
            <div className="text-sm space-y-1">
              <div className="text-gray-600 dark:text-gray-400">URL: http://localhost:4000/api</div>
              <div className="text-gray-600 dark:text-gray-400">Estado: <span className={getStatusColor(systemHealth.backend)}>
                {getStatusIcon(systemHealth.backend)} {systemHealth.backend}
              </span></div>
              <div className="text-gray-600 dark:text-gray-400">Tiempo de Respuesta: {metrics.responseTime}ms</div>
              <div className="text-gray-600 dark:text-gray-400">Base de Datos: <span className={getStatusColor(systemHealth.database)}>
                {getStatusIcon(systemHealth.database)} {systemHealth.database}
              </span></div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium mb-2 text-gray-800 dark:text-gray-200">🔄 Pruebas de Conectividad</h4>
          <div className="flex gap-3">
            <button 
              onClick={checkSystemHealth}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded transition-colors text-sm"
            >
              Probar Conexión Backend
            </button>
            <button 
              onClick={simulateError}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-500 text-white rounded transition-colors text-sm"
            >
              Simular Error
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
          📝 Log de Actividad del Sistema
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setActivityLog([])}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded text-sm transition-colors"
          >
            Limpiar Log
          </button>
          <select 
            value={settings.logLevel}
            onChange={(e) => setSettings(prev => ({ ...prev, logLevel: e.target.value }))}
            className="px-3 py-1 border dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="info">Todos</option>
            <option value="warning">Warning+</option>
            <option value="error">Solo Errores</option>
          </select>
        </div>
      </div>
      
      <div className="h-96 overflow-y-auto border dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-900 font-mono text-sm">
        {activityLog.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">No hay actividad registrada</div>
        ) : (
          activityLog
            .filter(log => {
              if (settings.logLevel === 'error') return log.type === 'error';
              if (settings.logLevel === 'warning') return ['warning', 'error'].includes(log.type);
              return true;
            })
            .map((log, index) => (
              <div key={`${log.id}-${index}`} className="mb-2 flex gap-3">
                <span className="text-gray-400 dark:text-gray-500">[{log.timestamp}]</span>
                <span className={getLogTypeColor(log.type)}>
                  {log.type.toUpperCase()}:
                </span>
                <span className="text-gray-700 dark:text-gray-300">{log.message}</span>
              </div>
            ))
        )}
      </div>
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          📊 Dashboard de Métricas Avanzadas
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center border dark:border-gray-600">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{metrics.memory}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">MB Memoria</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center border dark:border-gray-600">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{metrics.responseTime}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">ms Respuesta</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center border dark:border-gray-600">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{Math.floor(metrics.uptime / 60)}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">min Uptime</div>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center border dark:border-gray-600">
            <div className="text-2xl font-bold text-gray-700 dark:text-gray-200">{metrics.totalPermissions}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Permisos</div>
          </div>
        </div>
        
        <div className="border-t dark:border-gray-600 pt-4">
          <h4 className="font-medium mb-3 text-gray-800 dark:text-gray-200">📈 Indicadores de Salud</h4>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">Uso de Memoria</span>
                <span className="text-gray-700 dark:text-gray-300">{Math.min(100, Math.round((metrics.memory / 200) * 100))}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.memory < 100 ? 'bg-green-500' : 
                    metrics.memory < 200 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.round((metrics.memory / 200) * 100))}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-gray-700 dark:text-gray-300">Rendimiento API</span>
                <span className="text-gray-700 dark:text-gray-300">{metrics.responseTime < 1000 ? 'Óptimo' : metrics.responseTime < 3000 ? 'Aceptable' : 'Lento'}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    metrics.responseTime < 1000 ? 'bg-green-500' : 
                    metrics.responseTime < 3000 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, 100 - Math.round((metrics.responseTime / 5000) * 100))}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderToolsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
          🛠️ Herramientas Avanzadas de Diagnóstico
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            onClick={checkSystemHealth}
            className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">🔄 Verificación Completa</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Verificar todas las conexiones y servicios del sistema</div>
          </button>
          
          <button 
            onClick={updateMetrics}
            className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">📊 Actualizar Métricas</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Refrescar todas las métricas de rendimiento</div>
          </button>
          
          <button 
            onClick={exportConfig}
            className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">📋 Exportar Configuración</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Descargar reporte completo del sistema</div>
          </button>
          
          <button 
            onClick={simulateError}
            className="p-4 border-2 border-orange-300 dark:border-orange-700 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors text-left"
          >
            <div className="text-orange-600 dark:text-orange-400 font-medium mb-2">⚡ Simular Error</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Probar recuperación automática del sistema</div>
          </button>
          
          <button 
            onClick={() => window.location.reload()}
            className="p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="text-gray-700 dark:text-gray-300 font-medium mb-2">🔄 Reiniciar Aplicación</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recargar completamente la aplicación</div>
          </button>
          
          <button 
            onClick={() => { localStorage.clear(); addToLog('Cache local limpiado', 'info'); }}
            className="p-4 border-2 border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
          >
            <div className="text-red-600 dark:text-red-400 font-medium mb-2">🗑️ Limpiar Cache</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Borrar todos los datos almacenados localmente</div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
        ⚙️ Configuración del Sistema de Diagnóstico
      </h3>
      
      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={settings.autoRefresh}
              onChange={(e) => setSettings(prev => ({ ...prev, autoRefresh: e.target.checked }))}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Actualización automática del estado del sistema</span>
          </label>
        </div>
        
        <div>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">Intervalo de actualización (segundos):</label>
          <input 
            type="range"
            min="10"
            max="300"
            value={settings.refreshInterval}
            onChange={(e) => setSettings(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
            className="w-full"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{settings.refreshInterval} segundos</div>
        </div>
        
        <div>
          <label className="flex items-center gap-3">
            <input 
              type="checkbox"
              checked={settings.showNotifications}
              onChange={(e) => setSettings(prev => ({ ...prev, showNotifications: e.target.checked }))}
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">Mostrar notificaciones de cambios de estado</span>
          </label>
        </div>
        
        <div>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">Nivel de logging:</label>
          <select 
            value={settings.logLevel}
            onChange={(e) => setSettings(prev => ({ ...prev, logLevel: e.target.value }))}
            className="px-3 py-2 border dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
          >
            <option value="info">Información completa</option>
            <option value="warning">Advertencias y errores</option>
            <option value="error">Solo errores críticos</option>
          </select>
        </div>
        
        <div className="pt-4 border-t dark:border-gray-600">
          <button 
            onClick={() => {
              setSettings({
                autoRefresh: true,
                refreshInterval: 30,
                showNotifications: true,
                logLevel: 'info'
              });
              addToLog('Configuración restaurada a valores por defecto', 'info');
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded transition-colors"
          >
            Restaurar valores por defecto
          </button>
        </div>
      </div>
    </div>
  );

  const renderPermissionsTab = () => (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-200">
        🔐 Debug Avanzado de Permisos
      </h3>
      
      {/* Información del Usuario */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">👤 Usuario Actual:</h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600">
          {user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="text-gray-700 dark:text-gray-300"><strong>ID:</strong> {user.id || 'N/A'}</div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Nombre:</strong> {user.nombre || 'N/A'}</div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {user.email || 'N/A'}</div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Rol:</strong> {user.rol?.nombre || 'N/A'}</div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Estado:</strong> <span className="text-green-600 dark:text-green-400">✓ Autenticado</span></div>
              <div className="text-gray-700 dark:text-gray-300"><strong>Sesión:</strong> Activa</div>
            </div>
          ) : (
            <div className="text-red-500 dark:text-red-400">❌ No hay usuario logueado</div>
          )}
        </div>
      </div>

      {/* Permisos Detallados */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">
          🛡️ Matriz de Permisos ({permissions ? Object.keys(permissions).length : 0} total):
        </h4>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded border dark:border-gray-600 max-h-80 overflow-y-auto">
          {permissions && Object.keys(permissions).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(permissions).map(([key, value], index) => (
                <div key={`${key}-${index}`} className="flex justify-between items-center p-2 bg-white dark:bg-gray-600 rounded border dark:border-gray-500">
                  <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">{key}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    value ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  }`}>
                    {value ? '✓ PERMITIDO' : '✗ DENEGADO'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-orange-500 dark:text-orange-400 text-center py-8">
              ⚠️ No hay permisos cargados en el contexto
            </div>
          )}
        </div>
      </div>

      {/* Pruebas de Permisos */}
      <div>
        <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-3">🧪 Pruebas de Permisos:</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            'usuarios.ver',
            'usuarios.crear',
            'empleados.ver',
            'empleados.crear',
            'nomina.ver',
            'nomina.gestionar'
          ].map((permission, index) => (
            <div key={`${permission}-${index}`} className="p-3 border dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-700">
              <div className="text-sm font-mono text-gray-600 dark:text-gray-400">{permission}</div>
              <div className={`text-sm font-medium ${
                hasPermission && hasPermission(permission) ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {hasPermission && hasPermission(permission) ? '✓ ACCESO PERMITIDO' : '✗ ACCESO DENEGADO'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: '📊' },
    { id: 'connections', label: 'Conexiones', icon: '🔗' },
    { id: 'activity', label: 'Actividad', icon: '📝' },
    { id: 'metrics', label: 'Métricas', icon: '📈' },
    { id: 'tools', label: 'Herramientas', icon: '🛠️' },
    { id: 'permissions', label: 'Permisos', icon: '🔐' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
          🔧 Sistema de Diagnóstico Avanzado VLock
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Monitoreo completo, métricas en tiempo real y herramientas de diagnóstico
        </p>
        
        {/* Estado general rápido */}
        <div className="mt-4 flex gap-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            systemHealth.backend === 'healthy' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
            systemHealth.backend === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
          }`}>
            Backend: {systemHealth.backend}
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Memoria: {metrics.memory}MB
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            Respuesta: {metrics.responseTime}ms
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6 bg-white dark:bg-gray-900 rounded-t-lg border dark:border-gray-700">
        <nav className="-mb-px flex space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={`${tab.id}-${index}`}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de las tabs */}
      <div className="pb-6">
        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'connections' && renderConnectionTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'metrics' && renderMetricsTab()}
        {activeTab === 'tools' && renderToolsTab()}
        {activeTab === 'permissions' && renderPermissionsTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>
      </div>
    </div>
  );
};

export default DiagnosticPageAdvanced;
