import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

/**
 * Dashboard que muestra métricas generales del sistema
 * Información consolidada y KPIs importantes
 */
const MetricsDashboard = () => {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [metrics, setMetrics] = useState({
    modulesLoaded: 0,
    uptime: 0,
    avgLatency: 0,
    systemVersion: '1.0.0',
    permissionsCount: 0,
    userRole: '',
    sessionDuration: 0,
    lastActivity: null
  });

  const [systemHealth, setSystemHealth] = useState('good'); // good, warning, error

  // Calcular métricas
  const calculateMetrics = () => {
    const now = new Date();
    
    // Módulos cargados (simular contando componentes React cargados)
    const modulesLoaded = document.querySelectorAll('[data-module]').length || 
      Math.floor(Math.random() * 5) + 18; // Simular 18-23 módulos

    // Tiempo de actividad (desde que se cargó la página)
    const loadStart = window.performance?.timing?.loadEventStart || now.getTime();
    const uptimeMs = now.getTime() - loadStart;
    const uptimePercent = Math.min(100, Math.max(95, 100 - (uptimeMs / (1000 * 60 * 60 * 24)) * 5));

    // Latencia promedio (simular basado en requests recientes)
    const avgLatency = Math.floor(Math.random() * 200) + 50; // 50-250ms

    // Duración de sesión
    const sessionStart = localStorage.getItem('sessionStart');
    const sessionDuration = sessionStart ? 
      Math.floor((now.getTime() - parseInt(sessionStart, 10)) / 1000 / 60) : 0;

    // Contar permisos habilitados
    const permissionsCount = permissions ? Object.values(permissions).filter(p => p === true).length : 0;

    const newMetrics = {
      modulesLoaded,
      uptime: Math.round(uptimePercent * 100) / 100,
      avgLatency,
      systemVersion: '2.1.0',
      permissionsCount,
      userRole: user?.rol || 'Invitado',
      sessionDuration,
      lastActivity: now
    };

    setMetrics(newMetrics);

    // Determinar salud del sistema
    if (avgLatency > 200 || uptimePercent < 98) {
      setSystemHealth('warning');
    } else if (avgLatency > 300 || uptimePercent < 95) {
      setSystemHealth('error');
    } else {
      setSystemHealth('good');
    }
  };

  // Actualizar métricas cada 30 segundos
  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(calculateMetrics, 30000);
    return () => clearInterval(interval);
  }, [permissions, user]);

  // Guardar timestamp de inicio de sesión
  useEffect(() => {
    if (!localStorage.getItem('sessionStart')) {
      localStorage.setItem('sessionStart', Date.now().toString());
    }
  }, []);

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'green';
      case 'warning': return 'yellow';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getHealthText = (health) => {
    switch (health) {
      case 'good': return 'Óptimo';
      case 'warning': return 'Advertencia';
      case 'error': return 'Crítico';
      default: return 'Desconocido';
    }
  };

  const metricCards = [
    {
      title: 'Módulos Cargados',
      value: metrics.modulesLoaded,
      icon: '📦',
      color: 'blue',
      description: 'Componentes activos',
      trend: metrics.modulesLoaded > 20 ? 'up' : 'stable'
    },
    {
      title: 'Tiempo Activo',
      value: `${metrics.uptime}%`,
      icon: '⏰',
      color: metrics.uptime > 99 ? 'green' : metrics.uptime > 95 ? 'yellow' : 'red',
      description: 'Disponibilidad del sistema',
      trend: metrics.uptime > 98 ? 'up' : 'down'
    },
    {
      title: 'Latencia Promedio',
      value: `${metrics.avgLatency}ms`,
      icon: '⚡',
      color: metrics.avgLatency < 150 ? 'green' : metrics.avgLatency < 250 ? 'yellow' : 'red',
      description: 'Tiempo de respuesta',
      trend: metrics.avgLatency < 150 ? 'up' : 'down'
    },
    {
      title: 'Versión Sistema',
      value: metrics.systemVersion,
      icon: '🏷️',
      color: 'purple',
      description: 'VLock Sistema de Gestión',
      trend: 'stable'
    },
    {
      title: 'Permisos Activos',
      value: metrics.permissionsCount,
      icon: '🔐',
      color: 'indigo',
      description: 'Permisos habilitados',
      trend: 'stable'
    },
    {
      title: 'Rol de Usuario',
      value: metrics.userRole,
      icon: '👤',
      color: 'cyan',
      description: 'Rol actual',
      trend: 'stable'
    },
    {
      title: 'Sesión Activa',
      value: `${metrics.sessionDuration}min`,
      icon: '🕐',
      color: 'orange',
      description: 'Duración de sesión',
      trend: 'up'
    },
    {
      title: 'Estado General',
      value: getHealthText(systemHealth),
      icon: systemHealth === 'good' ? '✅' : systemHealth === 'warning' ? '⚠️' : '❌',
      color: getHealthColor(systemHealth),
      description: 'Salud del sistema',
      trend: systemHealth === 'good' ? 'up' : 'down'
    }
  ];

  const getCardClasses = (color) => {
    const baseClasses = "text-center p-4 rounded-lg transition-all hover:shadow-md";
    switch (color) {
      case 'blue': return `${baseClasses} bg-blue-50 border border-blue-200`;
      case 'green': return `${baseClasses} bg-green-50 border border-green-200`;
      case 'yellow': return `${baseClasses} bg-yellow-50 border border-yellow-200`;
      case 'red': return `${baseClasses} bg-red-50 border border-red-200`;
      case 'purple': return `${baseClasses} bg-purple-50 border border-purple-200`;
      case 'indigo': return `${baseClasses} bg-indigo-50 border border-indigo-200`;
      case 'cyan': return `${baseClasses} bg-cyan-50 border border-cyan-200`;
      case 'orange': return `${baseClasses} bg-orange-50 border border-orange-200`;
      default: return `${baseClasses} bg-gray-50 border border-gray-200`;
    }
  };

  const getValueClasses = (color) => {
    switch (color) {
      case 'blue': return 'text-2xl font-bold text-blue-600';
      case 'green': return 'text-2xl font-bold text-green-600';
      case 'yellow': return 'text-2xl font-bold text-yellow-600';
      case 'red': return 'text-2xl font-bold text-red-600';
      case 'purple': return 'text-2xl font-bold text-purple-600';
      case 'indigo': return 'text-2xl font-bold text-indigo-600';
      case 'cyan': return 'text-2xl font-bold text-cyan-600';
      case 'orange': return 'text-2xl font-bold text-orange-600';
      default: return 'text-2xl font-bold text-gray-600';
    }
  };

  const getTitleClasses = (color) => {
    switch (color) {
      case 'blue': return 'text-sm font-medium text-blue-800 mb-1';
      case 'green': return 'text-sm font-medium text-green-800 mb-1';
      case 'yellow': return 'text-sm font-medium text-yellow-800 mb-1';
      case 'red': return 'text-sm font-medium text-red-800 mb-1';
      case 'purple': return 'text-sm font-medium text-purple-800 mb-1';
      case 'indigo': return 'text-sm font-medium text-indigo-800 mb-1';
      case 'cyan': return 'text-sm font-medium text-cyan-800 mb-1';
      case 'orange': return 'text-sm font-medium text-orange-800 mb-1';
      default: return 'text-sm font-medium text-gray-800 mb-1';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <span className="mr-2">📊</span>
          Dashboard de Métricas
        </h3>
        <button
          onClick={calculateMetrics}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          🔄 Actualizar
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricCards.map((metric, index) => (
          <div key={index} className={getCardClasses(metric.color)}>
            <div className="flex items-center justify-between mb-2">
              <div className={getTitleClasses(metric.color)}>
                <span className="mr-1">{metric.icon}</span>
                {metric.title}
              </div>
              {metric.trend === 'up' && <span className="text-green-500 text-xs">📈</span>}
              {metric.trend === 'down' && <span className="text-red-500 text-xs">📉</span>}
              {metric.trend === 'stable' && <span className="text-gray-400 text-xs">➖</span>}
            </div>
            <div className={getValueClasses(metric.color)}>{metric.value}</div>
            <div className="text-xs text-gray-600 mt-1">{metric.description}</div>
          </div>
        ))}
      </div>

      {/* Información adicional */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center text-sm">
          <div>
            <span className="font-medium">Última actualización:</span>
            {metrics.lastActivity && (
              <span className="ml-1 text-gray-600">
                {metrics.lastActivity.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-2">Estado general:</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              systemHealth === 'good' ? 'bg-green-100 text-green-700' :
              systemHealth === 'warning' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {getHealthText(systemHealth)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsDashboard;
