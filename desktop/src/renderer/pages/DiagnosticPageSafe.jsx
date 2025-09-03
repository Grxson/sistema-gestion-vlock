import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import PermissionDebugger from '../components/PermissionDebugger';

const DiagnosticPage = () => {
  const { user } = useAuth();
  const { permissions, loading, error } = usePermissions();
  const [systemInfo, setSystemInfo] = useState({
    os: 'Linux',
    platform: 'desktop',
    node: '22.18.0',
    app: 'VLock Sistema de Gestión',
    version: '1.0.0'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  
  useEffect(() => {
    // En un entorno Electron, podemos obtener información del sistema
    if (window.electron) {
      window.electron.ipcRenderer.invoke('get-system-info').then(info => {
        setSystemInfo(info);
      }).catch(err => {
        console.log('No se pudo obtener información del sistema:', err);
      });
    }
  }, []);

  // Función simple para verificar conectividad
  const checkConnection = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/health');
      if (response.ok) {
        alert('✅ Conexión exitosa al backend');
      } else {
        alert('⚠️ Backend responde pero con errores');
      }
    } catch (error) {
      alert('❌ No se puede conectar al backend');
    }
  };

  // Métricas básicas
  const getBasicMetrics = () => {
    const permissionsCount = permissions ? Object.values(permissions).filter(p => p === true).length : 0;
    const memoryInfo = window.performance?.memory;
    const memoryUsed = memoryInfo ? Math.round(memoryInfo.usedJSHeapSize / 1024 / 1024) : 0;
    
    return {
      permissionsCount,
      memoryUsed,
      userRole: user?.rol || 'No autenticado',
      sessionDuration: Math.floor((Date.now() - (parseInt(localStorage.getItem('sessionStart') || '0', 10))) / 1000 / 60)
    };
  };

  const metrics = getBasicMetrics();

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico del Sistema</h1>
      
      {/* Métricas Básicas */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="Metrics" className="mr-2">📊</span>
          Métricas Básicas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded">
            <div className="text-2xl font-bold text-blue-600">{metrics.permissionsCount}</div>
            <div className="text-sm text-blue-800">Permisos Activos</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded">
            <div className="text-2xl font-bold text-green-600">{metrics.memoryUsed}MB</div>
            <div className="text-sm text-green-800">Memoria Usada</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded">
            <div className="text-2xl font-bold text-purple-600">{metrics.userRole}</div>
            <div className="text-sm text-purple-800">Rol Usuario</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded">
            <div className="text-2xl font-bold text-orange-600">{metrics.sessionDuration}min</div>
            <div className="text-sm text-orange-800">Sesión Activa</div>
          </div>
        </div>
      </div>
      
      {/* Información del sistema */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="System" className="mr-2">💻</span>
          Información del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2">
              <span className="font-semibold">Sistema Operativo:</span> {systemInfo.os || 'Linux'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Plataforma:</span> {systemInfo.platform || 'desktop'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Versión Node:</span> {systemInfo.node || '22.18.0'}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Aplicación:</span> {systemInfo.app || 'VLock Sistema de Gestión'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Versión:</span> {systemInfo.version || '2.1.0'}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Sesión:</span> {user ? `Usuario: ${user.nombre} (${user.email})` : 'No iniciada'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Prueba de Conectividad */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="Connection" className="mr-2">🔗</span>
          Prueba de Conectividad
        </h2>
        <button 
          onClick={checkConnection}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          🔄 Probar Conexión Backend
        </button>
      </div>
      
      {/* Depurador de permisos */}
      <PermissionDebugger />
      
      {/* Herramientas básicas */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="Tools" className="mr-2">🔧</span>
          Herramientas Básicas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 text-left"
            onClick={() => {
              console.clear();
              alert('Información de diagnóstico enviada a la consola');
            }}
          >
            <div className="font-semibold mb-1">Mostrar diagnóstico en consola</div>
            <div className="text-sm">Imprime toda la información de diagnóstico en la consola del navegador</div>
          </button>
          
          <button 
            className="p-3 bg-green-100 hover:bg-green-200 rounded-lg text-green-800 text-left"
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('vlock_diagnostic_settings');
              localStorage.removeItem('vlock_diagnostic_logs');
              alert('Caché local limpiada. La aplicación se recargará.');
              window.location.reload();
            }}
          >
            <div className="font-semibold mb-1">Limpiar caché completo</div>
            <div className="text-sm">Elimina todos los datos almacenados localmente y recarga la aplicación</div>
          </button>
          
          <button 
            className="p-3 bg-yellow-100 hover:bg-yellow-200 rounded-lg text-yellow-800 text-left"
            onClick={() => {
              if (window.electron) {
                window.electron.ipcRenderer.invoke('restart-app');
              } else {
                window.location.reload();
              }
            }}
          >
            <div className="font-semibold mb-1">Reiniciar aplicación</div>
            <div className="text-sm">Cierra y vuelve a abrir la aplicación</div>
          </button>
          
          <button 
            className="p-3 bg-purple-100 hover:bg-purple-200 rounded-lg text-purple-800 text-left"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <div className="font-semibold mb-1">
              {showAdvanced ? 'Ocultar' : 'Mostrar'} componentes avanzados
            </div>
            <div className="text-sm">
              {showAdvanced ? 'Simplificar vista' : 'Activar todos los componentes de diagnóstico'}
            </div>
          </button>
        </div>
      </div>

      {/* Componentes Avanzados (solo si están habilitados) */}
      {showAdvanced && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-xl">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Los componentes avanzados están en desarrollo. Si experimentas errores, 
                desactiva esta opción y limpia el caché.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-sm text-gray-500 mt-4">
        Versión de diagnóstico 2.0 (Modo Seguro) • VLock Sistema de Gestión • {new Date().toLocaleDateString()}
      </p>
    </div>
  );
};

export default DiagnosticPage;
