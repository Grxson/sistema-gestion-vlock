import React, { useState, useEffect } from 'react';
import { 
  FaSave, 
  FaCog, 
  FaPalette, 
  FaBell, 
  FaShieldAlt,
  FaDatabase,
  FaDownload,
  FaUpload,
  FaTrash,
  FaRedo,
  FaToggleOn,
  FaToggleOff,
  FaExclamationTriangle,
  FaCheck,
  FaInfo,
  FaLanguage,
  FaClock,
  FaDesktop,
  FaUsers
} from "react-icons/fa";
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ConfigurationPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // Estados para configuraciones generales
  const [generalConfig, setGeneralConfig] = useState({
    companyName: 'VLock Sistema de Gestión',
    language: 'es',
    timezone: 'America/Mexico_City',
    dateFormat: 'DD/MM/YYYY',
    currency: 'MXN',
    autoSave: true,
    autoBackup: true,
    sessionTimeout: 30
  });

  // Estados para notificaciones
  const [notificationConfig, setNotificationConfig] = useState({
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    browserNotifications: true,
    alertTypes: {
      newMovements: true,
      lowStock: true,
      maintenance: true,
      expiredTools: true,
      systemUpdates: false
    }
  });

  // Estados para configuraciones de interfaz
  const [interfaceConfig, setInterfaceConfig] = useState({
    theme: isDarkMode ? 'dark' : 'light',
    compactMode: false,
    showAnimations: true,
    sidebarCollapsed: false,
    showTooltips: true,
    accentColor: 'emerald'
  });

  // Estados para configuraciones de seguridad
  const [securityConfig, setSecurityConfig] = useState({
    twoFactorAuth: false,
    requirePasswordChange: false,
    sessionLogging: true,
    ipRestriction: false,
    maxLoginAttempts: 3,
    passwordExpiry: 90
  });

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/config/user-settings`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.general) setGeneralConfig(data.general);
        if (data.notifications) setNotificationConfig(data.notifications);
        if (data.interface) setInterfaceConfig(data.interface);
        if (data.security) setSecurityConfig(data.security);
      }
    } catch (error) {
      console.error('Error loading configurations:', error);
    }
  };

  const saveConfigurations = async () => {
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const response = await fetch(`${apiUrl}/config/user-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          general: generalConfig,
          notifications: notificationConfig,
          interface: interfaceConfig,
          security: securityConfig
        })
      });

      if (response.ok) {
        showToast('Configuración guardada correctamente', 'success');
      } else {
        showToast('Error al guardar la configuración', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast('Error de conexión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetConfigurations = () => {
    if (window.confirm('¿Estás seguro de que quieres restablecer todas las configuraciones a sus valores predeterminados?')) {
      setGeneralConfig({
        companyName: 'VLock Sistema de Gestión',
        language: 'es',
        timezone: 'America/Mexico_City',
        dateFormat: 'DD/MM/YYYY',
        currency: 'MXN',
        autoSave: true,
        autoBackup: true,
        sessionTimeout: 30
      });
      
      setNotificationConfig({
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        browserNotifications: true,
        alertTypes: {
          newMovements: true,
          lowStock: true,
          maintenance: true,
          expiredTools: true,
          systemUpdates: false
        }
      });

      setInterfaceConfig({
        theme: 'light',
        compactMode: false,
        showAnimations: true,
        sidebarCollapsed: false,
        showTooltips: true,
        accentColor: 'emerald'
      });

      setSecurityConfig({
        twoFactorAuth: false,
        requirePasswordChange: false,
        sessionLogging: true,
        ipRestriction: false,
        maxLoginAttempts: 3,
        passwordExpiry: 90
      });

      showToast('Configuraciones restablecidas', 'success');
    }
  };

  const exportConfig = () => {
    const config = {
      general: generalConfig,
      notifications: notificationConfig,
      interface: interfaceConfig,
      security: securityConfig,
      exportDate: new Date().toISOString()
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `vlock-config-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showToast('Configuración exportada correctamente', 'success');
  };

  const handleThemeChange = (newTheme) => {
    setInterfaceConfig({...interfaceConfig, theme: newTheme});
    if ((newTheme === 'dark') !== isDarkMode) {
      toggleTheme();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <FaCog className="text-white text-2xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Configuración
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Personaliza tu experiencia y configuraciones del sistema
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar de pestañas */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'general'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FaCog className="text-lg" />
                <span className="font-medium">General</span>
              </button>
              
              <button
                onClick={() => setActiveTab('interface')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'interface'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FaPalette className="text-lg" />
                <span className="font-medium">Interfaz</span>
              </button>

              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'notifications'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FaBell className="text-lg" />
                <span className="font-medium">Notificaciones</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FaShieldAlt className="text-lg" />
                <span className="font-medium">Seguridad</span>
              </button>

              <button
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === 'system'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <FaDatabase className="text-lg" />
                <span className="font-medium">Sistema</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-dark-100 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            
            {/* Pestaña: General */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaCog className="text-cyan-600 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Configuración General
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre de la empresa */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaUsers className="inline mr-2" />
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={generalConfig.companyName}
                      onChange={(e) => setGeneralConfig({...generalConfig, companyName: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* Idioma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaLanguage className="inline mr-2" />
                      Idioma
                    </label>
                    <select
                      value={generalConfig.language}
                      onChange={(e) => setGeneralConfig({...generalConfig, language: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                    </select>
                  </div>

                  {/* Zona horaria */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FaClock className="inline mr-2" />
                      Zona Horaria
                    </label>
                    <select
                      value={generalConfig.timezone}
                      onChange={(e) => setGeneralConfig({...generalConfig, timezone: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
                      <option value="America/New_York">Nueva York (UTC-5)</option>
                      <option value="America/Los_Angeles">Los Ángeles (UTC-8)</option>
                      <option value="Europe/Madrid">Madrid (UTC+1)</option>
                    </select>
                  </div>

                  {/* Formato de fecha */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Formato de Fecha
                    </label>
                    <select
                      value={generalConfig.dateFormat}
                      onChange={(e) => setGeneralConfig({...generalConfig, dateFormat: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>

                  {/* Moneda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Moneda
                    </label>
                    <select
                      value={generalConfig.currency}
                      onChange={(e) => setGeneralConfig({...generalConfig, currency: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="MXN">Peso Mexicano (MXN)</option>
                      <option value="USD">Dólar Americano (USD)</option>
                      <option value="EUR">Euro (EUR)</option>
                    </select>
                  </div>

                  {/* Tiempo de sesión */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiempo de Sesión (minutos)
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="480"
                      value={generalConfig.sessionTimeout}
                      onChange={(e) => setGeneralConfig({...generalConfig, sessionTimeout: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* Opciones automáticas */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Opciones Automáticas</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Guardado Automático</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Guardar cambios automáticamente</p>
                    </div>
                    <button
                      onClick={() => setGeneralConfig({...generalConfig, autoSave: !generalConfig.autoSave})}
                      className={`text-2xl transition-colors ${
                        generalConfig.autoSave ? 'text-green-500' : 'text-gray-400'
                      }`}
                    >
                      {generalConfig.autoSave ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white">Respaldo Automático</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Crear respaldos periódicos de datos</p>
                    </div>
                    <button
                      onClick={() => setGeneralConfig({...generalConfig, autoBackup: !generalConfig.autoBackup})}
                      className={`text-2xl transition-colors ${
                        generalConfig.autoBackup ? 'text-green-500' : 'text-gray-400'
                      }`}
                    >
                      {generalConfig.autoBackup ? <FaToggleOn /> : <FaToggleOff />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Interfaz */}
            {activeTab === 'interface' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaPalette className="text-cyan-600 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Configuración de Interfaz
                  </h2>
                </div>

                {/* Tema */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Apariencia
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleThemeChange('light')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        interfaceConfig.theme === 'light'
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaDesktop className="text-2xl mb-2 text-gray-600 dark:text-gray-400" />
                      <h5 className="font-medium text-gray-900 dark:text-white">Tema Claro</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fondo claro, ideal para el día</p>
                    </button>

                    <button
                      onClick={() => handleThemeChange('dark')}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        interfaceConfig.theme === 'dark'
                          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <FaDesktop className="text-2xl mb-2 text-gray-600 dark:text-gray-400" />
                      <h5 className="font-medium text-gray-900 dark:text-white">Tema Oscuro</h5>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fondo oscuro, ideal para la noche</p>
                    </button>
                  </div>
                </div>

                {/* Color de acento */}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Color de Acento</h5>
                  <div className="flex gap-2">
                    {['emerald', 'blue', 'purple', 'pink', 'orange'].map(color => (
                      <button
                        key={color}
                        onClick={() => setInterfaceConfig({...interfaceConfig, accentColor: color})}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          interfaceConfig.accentColor === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-300'
                        } bg-${color}-500`}
                      />
                    ))}
                  </div>
                </div>

                {/* Opciones de interfaz */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-900 dark:text-white">Opciones de Visualización</h5>
                  
                  {[
                    { key: 'compactMode', label: 'Modo Compacto', desc: 'Reduce el espaciado entre elementos' },
                    { key: 'showAnimations', label: 'Animaciones', desc: 'Mostrar transiciones y efectos animados' },
                    { key: 'showTooltips', label: 'Tooltips', desc: 'Mostrar ayudas contextuales' },
                    { key: 'sidebarCollapsed', label: 'Sidebar Colapsado', desc: 'Iniciar con el sidebar contraído' }
                  ].map(option => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h6 className="font-medium text-gray-900 dark:text-white">{option.label}</h6>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
                      </div>
                      <button
                        onClick={() => setInterfaceConfig({...interfaceConfig, [option.key]: !interfaceConfig[option.key]})}
                        className={`text-2xl transition-colors ${
                          interfaceConfig[option.key] ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {interfaceConfig[option.key] ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña: Notificaciones */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaBell className="text-cyan-600 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Preferencias de Notificaciones
                  </h2>
                </div>

                {/* Tipos de notificaciones */}
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Notificaciones por Email', desc: 'Recibir alertas por correo electrónico' },
                    { key: 'pushNotifications', label: 'Notificaciones Push', desc: 'Recibir notificaciones en tiempo real' },
                    { key: 'soundEnabled', label: 'Sonidos', desc: 'Reproducir sonidos para las notificaciones' },
                    { key: 'browserNotifications', label: 'Notificaciones del Navegador', desc: 'Mostrar notificaciones en el navegador' }
                  ].map(option => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{option.label}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotificationConfig({...notificationConfig, [option.key]: !notificationConfig[option.key]})}
                        className={`text-2xl transition-colors ${
                          notificationConfig[option.key] ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {notificationConfig[option.key] ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Tipos de alertas */}
                <div>
                  <h5 className="font-medium text-gray-900 dark:text-white mb-3">Tipos de Alertas</h5>
                  <div className="space-y-3">
                    {[
                      { key: 'newMovements', label: 'Nuevos Movimientos', desc: 'Préstamos y devoluciones de herramientas' },
                      { key: 'lowStock', label: 'Stock Bajo', desc: 'Cuando el inventario esté bajo' },
                      { key: 'maintenance', label: 'Mantenimiento', desc: 'Recordatorios de mantenimiento programado' },
                      { key: 'expiredTools', label: 'Herramientas Vencidas', desc: 'Préstamos que exceden el tiempo límite' },
                      { key: 'systemUpdates', label: 'Actualizaciones del Sistema', desc: 'Notificaciones sobre nuevas versiones' }
                    ].map(alert => (
                      <div key={alert.key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div>
                          <h6 className="font-medium text-gray-900 dark:text-white">{alert.label}</h6>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{alert.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotificationConfig({
                            ...notificationConfig,
                            alertTypes: {
                              ...notificationConfig.alertTypes,
                              [alert.key]: !notificationConfig.alertTypes[alert.key]
                            }
                          })}
                          className={`text-xl transition-colors ${
                            notificationConfig.alertTypes[alert.key] ? 'text-green-500' : 'text-gray-400'
                          }`}
                        >
                          {notificationConfig.alertTypes[alert.key] ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pestaña: Seguridad */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaShieldAlt className="text-cyan-600 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Configuraciones de Seguridad
                  </h2>
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                    <FaExclamationTriangle />
                    <span className="font-medium">Aviso de Seguridad</span>
                  </div>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Los cambios en la configuración de seguridad pueden afectar el acceso a tu cuenta. Procede con precaución.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Intentos Máximos de Login
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={securityConfig.maxLoginAttempts}
                      onChange={(e) => setSecurityConfig({...securityConfig, maxLoginAttempts: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiración de Contraseña (días)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="365"
                      value={securityConfig.passwordExpiry}
                      onChange={(e) => setSecurityConfig({...securityConfig, passwordExpiry: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'twoFactorAuth', label: 'Autenticación en Dos Pasos', desc: 'Requerir un segundo factor de autenticación' },
                    { key: 'requirePasswordChange', label: 'Forzar Cambio de Contraseña', desc: 'Requerir cambio periódico de contraseña' },
                    { key: 'sessionLogging', label: 'Registro de Sesiones', desc: 'Mantener un log de todas las sesiones' },
                    { key: 'ipRestriction', label: 'Restricción por IP', desc: 'Limitar acceso a IPs específicas' }
                  ].map(option => (
                    <div key={option.key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{option.label}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{option.desc}</p>
                      </div>
                      <button
                        onClick={() => setSecurityConfig({...securityConfig, [option.key]: !securityConfig[option.key]})}
                        className={`text-2xl transition-colors ${
                          securityConfig[option.key] ? 'text-green-500' : 'text-gray-400'
                        }`}
                      >
                        {securityConfig[option.key] ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pestaña: Sistema */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <FaDatabase className="text-cyan-600 text-xl" />
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Administración del Sistema
                  </h2>
                </div>

                {/* Información del sistema */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                  <h5 className="font-medium text-gray-900 dark:text-white mb-4">Información del Sistema</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Versión:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">1.0.0-beta.5</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Base de datos:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">MySQL 8.0</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Última actualización:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Estado:</span>
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        Activo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Acciones del sistema */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={exportConfig}
                    className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaDownload className="text-cyan-500" />
                    <div className="text-left">
                      <h6 className="font-medium text-gray-900 dark:text-white">Exportar Configuración</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Descargar archivo de configuración</p>
                    </div>
                  </button>

                  <button
                    onClick={() => document.getElementById('import-config').click()}
                    className="flex items-center gap-3 p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <FaUpload className="text-emerald-500" />
                    <div className="text-left">
                      <h6 className="font-medium text-gray-900 dark:text-white">Importar Configuración</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Cargar archivo de configuración</p>
                    </div>
                    <input
                      id="import-config"
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        // TODO: Implementar importación
                        console.log('Archivo seleccionado:', e.target.files[0]);
                      }}
                    />
                  </button>

                  <button
                    onClick={resetConfigurations}
                    className="flex items-center gap-3 p-4 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <FaRedo className="text-red-500" />
                    <div className="text-left">
                      <h6 className="font-medium text-gray-900 dark:text-white">Restablecer Configuración</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Volver a valores predeterminados</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de que quieres limpiar la caché? Esto reiniciará la aplicación.')) {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.reload();
                      }
                    }}
                    className="flex items-center gap-3 p-4 border border-yellow-300 dark:border-yellow-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                  >
                    <FaTrash className="text-yellow-500" />
                    <div className="text-left">
                      <h6 className="font-medium text-gray-900 dark:text-white">Limpiar Caché</h6>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Borrar datos temporales</p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaInfo />
                <span>Los cambios se aplicarán inmediatamente</span>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={saveConfigurations}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-600 text-white rounded-lg hover:from-cyan-600 hover:to-emerald-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <LoadingSpinner size="sm" /> : <FaSave />}
                  {loading ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationPage;