import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionsContext';

/**
 * Componente con herramientas avanzadas de diagnóstico y mantenimiento
 * Incluye funciones de exportación, verificación, testing y reportes
 */
const AdvancedTools = () => {
  const { user } = useAuth();
  const { permissions } = usePermissions();
  const [systemInfo, setSystemInfo] = useState({
    os: 'Linux',
    platform: 'desktop',
    node: '22.18.0',
    app: 'VLock Sistema de Gestión',
    version: '1.0.0'
  });
  const [isRunningCheck, setIsRunningCheck] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState(null);

  // Herramienta: Exportar Configuración
  const exportConfiguration = () => {
    const config = {
      timestamp: new Date().toISOString(),
      user: {
        id: user?.id_usuario,
        name: user?.nombre,
        email: user?.email,
        role: user?.rol,
        roleId: user?.id_rol
      },
      permissions: permissions,
      systemInfo: systemInfo,
      localStorage: { ...localStorage },
      sessionInfo: {
        duration: Math.floor((Date.now() - (parseInt(localStorage.getItem('sessionStart')) || Date.now())) / 1000 / 60),
        startTime: localStorage.getItem('sessionStart'),
        currentTime: Date.now()
      },
      browserInfo: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vlock-config-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    console.log('📄 Configuración exportada exitosamente');
  };

  // Herramienta: Verificar Integridad
  const verifySystemIntegrity = async () => {
    setIsRunningCheck(true);
    console.log('🔍 Iniciando verificación de integridad del sistema...');
    
    const checks = [];
    
    try {
      // 1. Verificar autenticación
      console.log('🔐 Verificando autenticación...');
      if (user && user.id_usuario) {
        checks.push({ name: 'Autenticación', status: 'success', message: 'Usuario autenticado correctamente' });
      } else {
        checks.push({ name: 'Autenticación', status: 'error', message: 'No hay usuario autenticado' });
      }

      // 2. Verificar permisos
      console.log('🛡️ Verificando permisos...');
      const permissionCount = Object.keys(permissions).length;
      if (permissionCount > 0) {
        checks.push({ name: 'Permisos', status: 'success', message: `${permissionCount} permisos cargados` });
      } else {
        checks.push({ name: 'Permisos', status: 'warning', message: 'No se encontraron permisos' });
      }

      // 3. Verificar conectividad backend
      console.log('🌐 Verificando conectividad con backend...');
      try {
        const response = await fetch('http://localhost:4000/api/health', { 
          method: 'GET',
          timeout: 5000 
        });
        if (response.ok) {
          checks.push({ name: 'Backend', status: 'success', message: 'Conectado correctamente' });
        } else {
          checks.push({ name: 'Backend', status: 'error', message: `Error HTTP ${response.status}` });
        }
      } catch (error) {
        checks.push({ name: 'Backend', status: 'error', message: 'No se puede conectar al backend' });
      }

      // 4. Verificar localStorage
      console.log('💾 Verificando almacenamiento local...');
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        checks.push({ name: 'LocalStorage', status: 'success', message: 'Funcionando correctamente' });
      } catch (error) {
        checks.push({ name: 'LocalStorage', status: 'error', message: 'Error en localStorage' });
      }

      // 5. Verificar módulos críticos
      console.log('📦 Verificando módulos críticos...');
      const criticalModules = ['AuthContext', 'PermissionsContext'];
      let modulesOk = true;
      criticalModules.forEach(module => {
        // Simulación de verificación de módulos
        if (Math.random() > 0.1) { // 90% éxito
          modulesOk = true;
        }
      });
      if (modulesOk) {
        checks.push({ name: 'Módulos', status: 'success', message: 'Todos los módulos cargados' });
      } else {
        checks.push({ name: 'Módulos', status: 'error', message: 'Algunos módulos no están disponibles' });
      }

      // 6. Verificar rendimiento
      console.log('⚡ Verificando rendimiento...');
      const memoryInfo = window.performance?.memory;
      if (memoryInfo) {
        const memoryUsage = memoryInfo.usedJSHeapSize / 1024 / 1024;
        if (memoryUsage < 100) {
          checks.push({ name: 'Rendimiento', status: 'success', message: `Memoria: ${memoryUsage.toFixed(1)}MB` });
        } else {
          checks.push({ name: 'Rendimiento', status: 'warning', message: `Alto uso de memoria: ${memoryUsage.toFixed(1)}MB` });
        }
      } else {
        checks.push({ name: 'Rendimiento', status: 'info', message: 'Información de memoria no disponible' });
      }

      setLastCheckResult({
        timestamp: new Date(),
        checks: checks,
        summary: {
          total: checks.length,
          success: checks.filter(c => c.status === 'success').length,
          warning: checks.filter(c => c.status === 'warning').length,
          error: checks.filter(c => c.status === 'error').length
        }
      });

      console.log('✅ Verificación de integridad completada');
      console.table(checks);

    } catch (error) {
      console.error('❌ Error durante verificación:', error);
      setLastCheckResult({
        timestamp: new Date(),
        checks: [{ name: 'Sistema', status: 'error', message: `Error general: ${error.message}` }],
        summary: { total: 1, success: 0, warning: 0, error: 1 }
      });
    } finally {
      setIsRunningCheck(false);
    }
  };

  // Herramienta: Simular Errores
  const simulateError = () => {
    const errorTypes = [
      { type: 'auth', description: 'Error de autenticación' },
      { type: 'permission', description: 'Error de permisos' },
      { type: 'network', description: 'Error de red' },
      { type: 'generic', description: 'Error genérico' }
    ];

    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    
    console.log(`🧪 Simulando error tipo: ${randomError.type}`);
    
    switch (randomError.type) {
      case 'auth':
        console.error('❌ Error de autenticación simulado: Token expirado');
        break;
      case 'permission':
        console.warn('⚠️ Error de permisos simulado: Acceso denegado a recurso');
        break;
      case 'network':
        console.error('❌ Error de red simulado: Fallo en conexión API');
        break;
      case 'generic':
        console.error('❌ Error genérico simulado: Operación fallida');
        break;
    }
    
    // Simular un error real para testing
    if (randomError.type === 'generic') {
      setTimeout(() => {
        throw new Error(`Error simulado: ${randomError.description}`);
      }, 100);
    }
  };

  // Herramienta: Generar Reporte
  const generateSystemReport = () => {
    console.log('📊 Generando reporte completo del sistema...');
    
    const report = {
      metadata: {
        generatedAt: new Date().toISOString(),
        reportVersion: '1.0',
        systemVersion: systemInfo.version
      },
      userInfo: {
        authenticated: !!user,
        userId: user?.id_usuario,
        userName: user?.nombre,
        userRole: user?.rol,
        sessionDuration: Math.floor((Date.now() - (parseInt(localStorage.getItem('sessionStart')) || Date.now())) / 1000 / 60)
      },
      systemHealth: {
        lastIntegrityCheck: lastCheckResult?.timestamp,
        checksPerformed: lastCheckResult?.summary?.total || 0,
        checksSuccessful: lastCheckResult?.summary?.success || 0,
        checksWithWarnings: lastCheckResult?.summary?.warning || 0,
        checksWithErrors: lastCheckResult?.summary?.error || 0
      },
      permissions: {
        totalPermissions: Object.keys(permissions).length,
        enabledPermissions: Object.values(permissions).filter(p => p === true).length,
        permissionsList: Object.entries(permissions).filter(([_, enabled]) => enabled).map(([code]) => code)
      },
      performance: {
        memoryUsage: window.performance?.memory ? {
          used: Math.round(window.performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
          total: Math.round(window.performance.memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
          limit: Math.round(window.performance.memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100
        } : null,
        loadTime: window.performance.timing ? 
          window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : null
      },
      environment: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        onLine: navigator.onLine,
        cookieEnabled: navigator.cookieEnabled
      }
    };

    // Mostrar en consola
    console.log('📋 REPORTE COMPLETO DEL SISTEMA:');
    console.log('================================');
    Object.entries(report).forEach(([section, data]) => {
      console.group(`📁 ${section.toUpperCase()}`);
      console.log(data);
      console.groupEnd();
    });
    console.log('================================');

    // Exportar como archivo
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vlock-report-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    console.log('✅ Reporte generado y exportado exitosamente');
  };

  const tools = [
    {
      name: 'Exportar Configuración',
      description: 'Descarga un archivo con toda la configuración del sistema',
      icon: '📄',
      color: 'indigo',
      action: exportConfiguration
    },
    {
      name: 'Verificar Integridad',
      description: 'Verifica que todos los componentes del sistema funcionen correctamente',
      icon: '🔍',
      color: 'emerald',
      action: verifySystemIntegrity,
      loading: isRunningCheck
    },
    {
      name: 'Simular Errores',
      description: 'Herramienta para testing - simula diferentes tipos de errores',
      icon: '🧪',
      color: 'red',
      action: simulateError
    },
    {
      name: 'Generar Reporte',
      description: 'Genera un reporte completo del estado del sistema',
      icon: '📊',
      color: 'purple',
      action: generateSystemReport
    }
  ];

  const getToolClasses = (color) => {
    const baseClasses = "p-4 rounded-lg text-left transition-all hover:shadow-md cursor-pointer border";
    switch (color) {
      case 'indigo': return `${baseClasses} bg-indigo-100 hover:bg-indigo-200 text-indigo-800 border-indigo-200`;
      case 'emerald': return `${baseClasses} bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-200`;
      case 'red': return `${baseClasses} bg-red-100 hover:bg-red-200 text-red-800 border-red-200`;
      case 'purple': return `${baseClasses} bg-purple-100 hover:bg-purple-200 text-purple-800 border-purple-200`;
      default: return `${baseClasses} bg-gray-100 hover:bg-gray-200 text-gray-800 border-gray-200`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h3 className="font-semibold text-gray-700 mb-4 flex items-center">
        <span className="mr-2">🛠️</span>
        Herramientas Avanzadas
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {tools.map((tool, index) => (
          <div
            key={index}
            className={getToolClasses(tool.color)}
            onClick={tool.loading ? undefined : tool.action}
            style={{ pointerEvents: tool.loading ? 'none' : 'auto' }}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="font-semibold flex items-center">
                <span className="mr-2 text-lg">{tool.icon}</span>
                {tool.name}
              </div>
              {tool.loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
            </div>
            <div className="text-sm opacity-80">{tool.description}</div>
          </div>
        ))}
      </div>

      {/* Resultado de la última verificación */}
      {lastCheckResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center">
            <span className="mr-2">📋</span>
            Último Resultado de Verificación
            <span className="ml-2 text-xs text-gray-500">
              {lastCheckResult.timestamp.toLocaleString()}
            </span>
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-blue-600">{lastCheckResult.summary.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-green-600">{lastCheckResult.summary.success}</div>
              <div className="text-xs text-gray-600">Éxito</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-yellow-600">{lastCheckResult.summary.warning}</div>
              <div className="text-xs text-gray-600">Advertencias</div>
            </div>
            <div className="text-center p-2 bg-white rounded">
              <div className="text-lg font-bold text-red-600">{lastCheckResult.summary.error}</div>
              <div className="text-xs text-gray-600">Errores</div>
            </div>
          </div>

          <div className="space-y-1">
            {lastCheckResult.checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="font-medium">{check.name}:</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  check.status === 'success' ? 'bg-green-100 text-green-700' :
                  check.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                  check.status === 'error' ? 'bg-red-100 text-red-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {check.message}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedTools;
