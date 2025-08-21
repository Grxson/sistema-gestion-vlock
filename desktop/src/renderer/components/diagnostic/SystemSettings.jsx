import React, { useState, useEffect } from 'react';

/**
 * Componente para configurar el comportamiento del sistema de diagnóstico
 * Permite personalizar opciones de logging, monitoreo y debug
 */
const SystemSettings = () => {
  const [settings, setSettings] = useState({
    debugMode: false,
    autoRefresh: true,
    logLevel: 'info',
    maxLogEntries: 100,
    autoSaveInterval: 30,
    enableNotifications: true,
    enableAutoExport: false,
    exportFormat: 'json',
    theme: 'light',
    enablePerformanceMonitoring: true,
    enableConnectionMonitoring: true,
    monitoringInterval: 30
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // Cargar configuración guardada
  useEffect(() => {
    const savedSettings = localStorage.getItem('vlock_diagnostic_settings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Detectar cambios
  useEffect(() => {
    const savedSettings = localStorage.getItem('vlock_diagnostic_settings');
    const currentSettings = JSON.stringify(settings);
    setHasChanges(savedSettings !== currentSettings);
  }, [settings]);

  // Guardar configuración
  const saveSettings = () => {
    try {
      localStorage.setItem('vlock_diagnostic_settings', JSON.stringify(settings));
      setLastSaved(new Date());
      setHasChanges(false);
      
      // Aplicar configuraciones globalmente
      applyGlobalSettings();
      
      console.log('✅ Configuración guardada exitosamente');
      
      // Mostrar notificación si está habilitada
      if (settings.enableNotifications) {
        showNotification('Configuración guardada', 'success');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      showNotification('Error al guardar configuración', 'error');
    }
  };

  // Aplicar configuraciones al sistema
  const applyGlobalSettings = () => {
    // Configurar debug global
    window._vlock_debug = window._vlock_debug || {};
    window._vlock_debug.settings = settings;
    
    // Configurar nivel de log
    if (settings.debugMode) {
      console.log('🔧 Modo debug habilitado');
      window._vlock_debug.enabled = true;
    }
    
    // Configurar tema (si se implementa)
    document.documentElement.setAttribute('data-theme', settings.theme);
  };

  // Mostrar notificación
  const showNotification = (message, type = 'info') => {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-4 py-2 rounded shadow-lg z-50 transition-all ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-black' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.remove();
    }, 3000);
  };

  // Resetear configuración
  const resetSettings = () => {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración?')) {
      const defaultSettings = {
        debugMode: false,
        autoRefresh: true,
        logLevel: 'info',
        maxLogEntries: 100,
        autoSaveInterval: 30,
        enableNotifications: true,
        enableAutoExport: false,
        exportFormat: 'json',
        theme: 'light',
        enablePerformanceMonitoring: true,
        enableConnectionMonitoring: true,
        monitoringInterval: 30
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('vlock_diagnostic_settings');
      setLastSaved(null);
      setHasChanges(false);
      
      console.log('🔄 Configuración reseteada a valores por defecto');
      showNotification('Configuración reseteada', 'info');
    }
  };

  // Exportar configuración
  const exportSettings = () => {
    const exportData = {
      settings: settings,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vlock-diagnostic-settings-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    console.log('📄 Configuración exportada');
    showNotification('Configuración exportada', 'success');
  };

  // Importar configuración
  const importSettings = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);
          if (importData.settings) {
            setSettings(importData.settings);
            showNotification('Configuración importada', 'success');
          } else {
            showNotification('Archivo de configuración inválido', 'error');
          }
        } catch (error) {
          console.error('Error importing settings:', error);
          showNotification('Error al importar configuración', 'error');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700 flex items-center">
          <span className="mr-2">⚙️</span>
          Configuración del Sistema
        </h3>
        <div className="flex gap-2">
          {hasChanges && (
            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
              Cambios sin guardar
            </span>
          )}
          <button
            onClick={saveSettings}
            disabled={!hasChanges}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
          >
            💾 Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Configuración General */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 border-b pb-2">General</h4>
          
          <label className="flex items-center justify-between">
            <span className="text-sm">Modo Debug Avanzado</span>
            <input 
              type="checkbox" 
              checked={settings.debugMode}
              onChange={(e) => handleSettingChange('debugMode', e.target.checked)}
              className="ml-2"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm">Auto-actualización</span>
            <input 
              type="checkbox" 
              checked={settings.autoRefresh}
              onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
              className="ml-2"
            />
          </label>
          
          <label className="flex items-center justify-between">
            <span className="text-sm">Notificaciones</span>
            <input 
              type="checkbox" 
              checked={settings.enableNotifications}
              onChange={(e) => handleSettingChange('enableNotifications', e.target.checked)}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm mb-1">Tema:</label>
            <select 
              value={settings.theme}
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="auto">Automático</option>
            </select>
          </div>
        </div>

        {/* Configuración de Logs */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700 border-b pb-2">Logs y Monitoreo</h4>
          
          <div>
            <label className="block text-sm mb-1">Nivel de Log:</label>
            <select 
              value={settings.logLevel}
              onChange={(e) => handleSettingChange('logLevel', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="error">Solo Errores</option>
              <option value="warning">Errores y Advertencias</option>
              <option value="info">Información General</option>
              <option value="debug">Debug Completo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Máximo de entradas de log:</label>
            <input
              type="number"
              value={settings.maxLogEntries}
              onChange={(e) => handleSettingChange('maxLogEntries', Math.max(10, Math.min(1000, parseInt(e.target.value) || 100)))}
              className="w-full border rounded px-2 py-1 text-sm"
              min="10"
              max="1000"
            />
          </div>

          <label className="flex items-center justify-between">
            <span className="text-sm">Monitor de Rendimiento</span>
            <input 
              type="checkbox" 
              checked={settings.enablePerformanceMonitoring}
              onChange={(e) => handleSettingChange('enablePerformanceMonitoring', e.target.checked)}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm">Monitor de Conexiones</span>
            <input 
              type="checkbox" 
              checked={settings.enableConnectionMonitoring}
              onChange={(e) => handleSettingChange('enableConnectionMonitoring', e.target.checked)}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm mb-1">Intervalo de monitoreo (segundos):</label>
            <input
              type="number"
              value={settings.monitoringInterval}
              onChange={(e) => handleSettingChange('monitoringInterval', Math.max(5, Math.min(300, parseInt(e.target.value) || 30)))}
              className="w-full border rounded px-2 py-1 text-sm"
              min="5"
              max="300"
            />
          </div>
        </div>
      </div>

      {/* Configuración de Exportación */}
      <div className="mt-6 pt-4 border-t">
        <h4 className="font-medium text-gray-700 mb-4">Exportación y Backup</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center justify-between">
            <span className="text-sm">Auto-exportación diaria</span>
            <input 
              type="checkbox" 
              checked={settings.enableAutoExport}
              onChange={(e) => handleSettingChange('enableAutoExport', e.target.checked)}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm mb-1">Formato de exportación:</label>
            <select 
              value={settings.exportFormat}
              onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              className="w-full border rounded px-2 py-1 text-sm"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
              <option value="xml">XML</option>
            </select>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="mt-6 pt-4 border-t flex flex-wrap gap-2">
        <button
          onClick={exportSettings}
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
        >
          📤 Exportar Config
        </button>
        
        <label className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm cursor-pointer">
          📥 Importar Config
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            className="hidden"
          />
        </label>
        
        <button
          onClick={resetSettings}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
        >
          🔄 Reset
        </button>
      </div>

      {/* Información de estado */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div>
            <span className="font-medium">Estado:</span> 
            <span className={hasChanges ? 'text-yellow-600' : 'text-green-600'}>
              {hasChanges ? ' Cambios pendientes' : ' Guardado'}
            </span>
          </div>
          {lastSaved && (
            <div>
              <span className="font-medium">Último guardado:</span>
              <span className="text-gray-600"> {lastSaved.toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
