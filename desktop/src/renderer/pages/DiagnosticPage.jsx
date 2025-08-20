import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import PermissionDebugger from '../components/PermissionDebugger';

const DiagnosticPage = () => {
  const { user } = useAuth();
  const { permissions, loading, error, hasPermission } = usePermissions();
  const [systemInfo, setSystemInfo] = useState({
    os: 'Desconocido',
    node: 'Desconocido',
    app: 'Desconocido',
    version: 'Desconocido',
    platform: 'Desconocido'
  });
  
  useEffect(() => {
    // En un entorno Electron, podemos obtener información del sistema
    if (window.electron) {
      window.electron.ipcRenderer.invoke('get-system-info').then(info => {
        setSystemInfo(info);
      });
    }
  }, []);

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Diagnóstico del Sistema</h1>
      
      {/* Sección de información del sistema */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="System" className="mr-2">💻</span>
          Información del Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="mb-2">
              <span className="font-semibold">Sistema Operativo:</span> {systemInfo.os}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Plataforma:</span> {systemInfo.platform}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Versión Node:</span> {systemInfo.node}
            </div>
          </div>
          <div>
            <div className="mb-2">
              <span className="font-semibold">Aplicación:</span> {systemInfo.app}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Versión:</span> {systemInfo.version}
            </div>
            <div className="mb-2">
              <span className="font-semibold">Sesión:</span> {user ? `Usuario: ${user.nombre} (${user.email})` : 'No iniciada'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Depurador de permisos */}
      <PermissionDebugger />
      
      {/* Herramientas de diagnóstico adicionales */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3 flex items-center">
          <span role="img" aria-label="Tools" className="mr-2">🔧</span>
          Herramientas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            className="p-3 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-800 text-left"
            onClick={() => {
              console.clear();
              console.log('======= DIAGNÓSTICO VLOCK =======');
              console.log('Usuario:', user);
              console.log('Permisos:', permissions);
              console.log('Sistema:', systemInfo);
              console.log('================================');
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
              alert('Caché local limpiada. La aplicación se recargará.');
              window.location.reload();
            }}
          >
            <div className="font-semibold mb-1">Limpiar caché</div>
            <div className="text-sm">Elimina los datos almacenados localmente y recarga la aplicación</div>
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
            onClick={() => {
              if (window.electron) {
                window.electron.ipcRenderer.invoke('open-logs');
              } else {
                alert('Esta función solo está disponible en la aplicación de escritorio');
              }
            }}
          >
            <div className="font-semibold mb-1">Ver logs</div>
            <div className="text-sm">Abre la ubicación de los archivos de registro</div>
          </button>
        </div>
      </div>
      
      <p className="text-sm text-gray-500 mt-4">
        Versión de diagnóstico 1.0 • VLock Sistema de Gestión
      </p>
    </div>
  );
};

export default DiagnosticPage;
