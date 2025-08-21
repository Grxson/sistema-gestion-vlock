import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../contexts/PermissionsContext';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  UserIcon,
  ShieldCheckIcon,
  TruckIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline';



// Definición de los elementos de navegación con sus respectivos códigos de permiso
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true, permissionModule: 'dashboard' },
  { name: 'Empleados', href: '/empleados', icon: UserGroupIcon, current: false, permissionModule: 'empleados' },
  { name: 'Nómina', href: '/nomina', icon: CurrencyDollarIcon, current: false, permissionModule: 'nomina' },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon, current: false, permissionModule: 'contratos' },
  { name: 'Oficios', href: '/oficios', icon: BuildingOfficeIcon, current: false, permissionModule: 'oficios' },
  { name: 'Auditoría', href: '/auditoria', icon: ClipboardDocumentCheckIcon, current: false, permissionModule: 'auditoria' },
  { name: 'Suministros', href: '/suministros', icon: TruckIcon, current: false, permissionModule: 'suministros' },
  { name: 'Reportes', href: '/reportes', icon: ChartBarIcon, current: false, permissionModule: 'reportes' },
  { name: 'Usuarios', href: '/usuarios', icon: UserIcon, current: false, permissionModule: 'usuarios' },
  { name: 'Roles', href: '/roles', icon: ShieldCheckIcon, current: false, permissionModule: 'roles' },
  { name: 'Configuración', href: '/configuracion', icon: CogIcon, current: false, permissionModule: 'configuracion' },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ currentPath, onNavigate, isCollapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const { hasModuleAccess, hasPermission, refreshPermissions, loading: permissionsLoading } = usePermissions();

  // Mostrar elementos de navegación
  const navigation = navigationItems.filter(item => {
    // El dashboard siempre es visible para todos los usuarios autenticados
    if (item.href === '/') return true;
    
    // Si está cargando permisos, no mostrar módulos hasta que esté listo
    if (permissionsLoading) {
      console.log(`[Sidebar] Módulo ${item.name}: Cargando permisos...`);
      return item.href === '/';
    }
    
    // Para usuarios admin, mostrar todos los módulos
    if (user?.rol === 'admin' || user?.id_rol === 1) {
      console.log(`[Sidebar] Usuario admin, mostrando módulo: ${item.name}`);
      return true;
    }

    // Convertir el módulo a su código de permiso correspondiente
    const modulePermissionMap = {
      'empleados': 'empleados.ver',
      'nomina': 'nomina.ver',
      'contratos': 'contratos.ver', 
      'oficios': 'oficios.ver',
      'auditoria': 'auditoria.ver',
      'suministros': 'suministros.ver',
      'reportes': 'reportes.ver',
      'usuarios': 'usuarios.ver',
      'roles': 'roles.ver',
      'configuracion': 'configuracion.ver',
      'finanzas': 'finanzas.gastos.ver',
      'proyectos': 'proyectos.ver'
    };
    
    // Obtener el código de permiso para este módulo
    const permissionCode = modulePermissionMap[item.permissionModule];
    
    if (!permissionCode) {
      console.error(`[Sidebar] No se encontró código de permiso para el módulo: ${item.permissionModule}`);
      return false;
    }
    
    // Verificar si el usuario tiene el permiso específico "ver" para este módulo
    const hasAccess = hasPermission(permissionCode);
    console.log(`[Sidebar] Módulo ${item.name} (${permissionCode}): ${hasAccess ? 'Visible' : 'Oculto'} | Usuario rol: ${user?.id_rol} | Admin: ${user?.id_rol === 1}`);
    
    // Log adicional para debug
    if (hasAccess && user?.id_rol !== 1) {
      console.log(`[Sidebar] ⚠️ Usuario NO-ADMIN tiene acceso a ${item.name} - verificar si es correcto`);
    }
    
    return hasAccess;
  });
  
  // Si el usuario no tiene acceso a ningún módulo excepto Dashboard, mostrar un mensaje en la consola
  if (navigation.length <= 1) {
    console.warn('¡Advertencia! El usuario solo tiene acceso al Dashboard. Verifica la configuración de permisos.');
    console.log('El usuario actual es:', user);
  }

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };

  const handleRefreshPermissions = () => {
    refreshPermissions();
    // Mostrar notificación
    alert('Actualizando permisos. Los cambios se aplicarán en unos segundos.');
  };
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} sidebar-transition flex flex-col bg-white dark:bg-dark-100 border-r border-gray-200 dark:border-gray-700 h-screen shadow-lg`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="/images/vlock_logo.png"
              alt="VLock"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="ml-2 text-gray-900 dark:text-white font-bold text-lg">VLock</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-all duration-200"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.href)}
              className={classNames(
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-r-2 border-primary-600'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 hover:text-gray-900 dark:hover:text-white',
                'group flex items-center px-3 py-3 text-sm font-medium rounded-lg w-full transition-all duration-200 relative'
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon
                className={classNames(
                  isActive 
                    ? 'text-primary-600 dark:text-primary-400' 
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300',
                  'flex-shrink-0 h-5 w-5 transition-colors duration-200'
                )}
                aria-hidden="true"
              />
              {!isCollapsed && (
                <span className="ml-3 transition-opacity duration-200">{item.name}</span>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute right-3 w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Diagnóstico y utilidades */}
      <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700">
        {/* Enlace a la página de diagnóstico */}
        <button
          onClick={() => onNavigate('/diagnostico')}
          className={classNames(
            currentPath === '/diagnostico'
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 hover:text-gray-900 dark:hover:text-white',
            'w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 mb-1'
          )}
          title={isCollapsed ? "Diagnóstico" : undefined}
        >
          <WrenchScrewdriverIcon 
            className={classNames(
              currentPath === '/diagnostico'
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-gray-400 dark:text-gray-500',
              'flex-shrink-0 h-5 w-5 transition-colors duration-200'
            )}
          />
          {!isCollapsed && (
            <span className="ml-3">Diagnóstico</span>
          )}
        </button>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center px-3 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-200 hover:text-gray-900 dark:hover:text-white rounded-lg transition-all duration-200"
          title={isCollapsed ? (isDarkMode ? 'Modo claro' : 'Modo oscuro') : undefined}
        >
          {isDarkMode ? (
            <SunIcon className="flex-shrink-0 h-5 w-5 text-yellow-500" />
          ) : (
            <MoonIcon className="flex-shrink-0 h-5 w-5 text-gray-400" />
          )}
          {!isCollapsed && (
            <span className="ml-3">{isDarkMode ? 'Modo claro' : 'Modo oscuro'}</span>
          )}
        </button>
      </div>

      {/* User info */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white text-sm font-medium">
                  {user?.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.nombre_usuario || 'Usuario'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || 'usuario@vlock.com'}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center">
            <button
              onClick={handleRefreshPermissions}
              className="text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 mr-2"
              title="Actualizar permisos"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
