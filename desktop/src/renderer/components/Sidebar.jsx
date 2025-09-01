import React, { useState, useEffect } from 'react';
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
  WrenchScrewdriverIcon,
  ChevronLeftIcon,
  ChevronRightIcon
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

  // Estados para animaciones y tooltips
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Guardar preferencia de sidebar en localStorage
  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsed !== null) {
      const isCollapsedSaved = JSON.parse(savedCollapsed);
      if (isCollapsedSaved !== isCollapsed) {
        onToggle();
      }
    }
  }, []);

  // Guardar estado cuando cambie
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  // Auto-colapsar en pantallas pequeñas
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && !isCollapsed) {
        onToggle();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Verificar al cargar

    return () => window.removeEventListener('resize', handleResize);
  }, [isCollapsed, onToggle]);

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
    <div className={`
      sidebar-container
      ${isCollapsed ? 'w-16' : 'w-64'} 
      flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-dark-100 dark:to-dark-200 
      border-r border-gray-200 dark:border-gray-700 h-screen shadow-xl
      transition-all duration-300 ease-in-out transform
      ${isCollapsed ? 'hover:w-64 hover:shadow-2xl' : ''}
      relative group z-30
    `}>
      {/* Header mejorado */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100">
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className="relative">
            <img
              className="h-10 w-auto transition-transform duration-300 hover:scale-110"
              src="/images/vlock_logo.png"
              alt={import.meta.env.VITE_APP_NAME || 'VLock'}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="ml-3 text-gray-900 dark:text-white font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {import.meta.env.VITE_APP_NAME || 'VLock'}
          </span>
        </div>
        
        <button
          onClick={onToggle}
          className={`
            p-2 rounded-lg transition-all duration-300 transform hover:scale-110 group/toggle
            text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-700
            ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          `}
          title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
        >
          <div className="relative w-5 h-5 flex flex-col justify-center items-center">
            {/* Líneas del menú hamburguesa con animación */}
            <div className={`
              w-5 h-0.5 bg-current transition-all duration-300 transform
              ${isCollapsed ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-1'}
            `}></div>
            <div className={`
              w-5 h-0.5 bg-current transition-all duration-300
              ${isCollapsed ? 'opacity-0' : 'opacity-100 my-1'}
            `}></div>
            <div className={`
              w-5 h-0.5 bg-current transition-all duration-300 transform
              ${isCollapsed ? '-rotate-45 -translate-y-0.5' : 'rotate-0 translate-y-1'}
            `}></div>
          </div>
        </button>
      </div>

      {/* Navigation mejorada */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-hidden hover:overflow-y-auto custom-scrollbar"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {navigation.map((item, index) => {
          const isActive = currentPath === item.href;
          return (
            <div key={item.name} className="relative group">
              <button
                onClick={() => onNavigate(item.href)}
                onMouseEnter={() => {
                  setHoveredItem(item.name);
                  if (isCollapsed) {
                    setShowTooltip(true);
                  }
                }}
                onMouseLeave={() => {
                  setHoveredItem(null);
                  setShowTooltip(false);
                }}
                className={classNames(
                  isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-primary-50 hover:to-primary-100 dark:hover:from-primary-900/30 dark:hover:to-primary-800/30 hover:text-primary-700 dark:hover:text-primary-300',
                  'group/item flex items-center px-4 py-3.5 text-sm font-medium rounded-xl w-full transition-all duration-300 transform hover:scale-105 hover:shadow-md relative overflow-hidden'
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Efecto de hover background */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-primary-400/10 to-primary-600/10 
                  transform transition-transform duration-300 
                  ${hoveredItem === item.name ? 'translate-x-0' : '-translate-x-full'}
                  ${isActive ? 'opacity-0' : 'opacity-100'}
                `}></div>
                
                <item.icon
                  className={classNames(
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-500 dark:text-gray-400 group-hover/item:text-primary-600 dark:group-hover/item:text-primary-400',
                    'flex-shrink-0 h-6 w-6 transition-all duration-300 transform group-hover/item:scale-110 relative z-10'
                  )}
                  aria-hidden="true"
                />
                
                <span className={`
                  ml-4 transition-all duration-300 relative z-10
                  ${isCollapsed ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : 'opacity-100 translate-x-0'}
                  ${isActive ? 'font-semibold' : 'font-medium'}
                `}>
                  {item.name}
                </span>
                
                {/* Indicador activo mejorado */}
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                )}
                
                {/* Tooltip para modo colapsado */}
                {isCollapsed && showTooltip && hoveredItem === item.name && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg 
                    shadow-xl z-50 whitespace-nowrap animate-fadeIn
                    before:content-[''] before:absolute before:top-1/2 before:-left-1 before:-translate-y-1/2
                    before:border-4 before:border-transparent before:border-r-gray-900 dark:before:border-r-gray-800
                  ">
                    {item.name}
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Sección de diagnóstico y utilidades mejorada */}
      <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-dark-200 dark:to-dark-100">
        {/* Diagnóstico */}
        <button
          onClick={() => onNavigate('/diagnostico')}
          onMouseEnter={() => setHoveredItem('diagnostico')}
          onMouseLeave={() => setHoveredItem(null)}
          className={classNames(
            currentPath === '/diagnostico'
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 hover:text-orange-700 dark:hover:text-orange-300',
            'w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 mb-2 relative overflow-hidden group'
          )}
        >
          <WrenchScrewdriverIcon 
            className={classNames(
              currentPath === '/diagnostico'
                ? 'text-white'
                : 'text-gray-500 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400',
              'flex-shrink-0 h-5 w-5 transition-all duration-300 transform group-hover:rotate-12'
            )}
          />
          <span className={`
            ml-3 transition-all duration-300
            ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          `}>
            Diagnóstico
          </span>
        </button>
        
        {/* Theme Toggle mejorado */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setHoveredItem('theme')}
          onMouseLeave={() => setHoveredItem(null)}
          className="
            w-full flex items-center px-4 py-3 text-sm font-medium 
            text-gray-600 dark:text-gray-300 
            hover:bg-gradient-to-r hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900/30 dark:hover:to-yellow-800/30 
            hover:text-yellow-700 dark:hover:text-yellow-300
            rounded-xl transition-all duration-300 transform hover:scale-105
            group relative overflow-hidden
          "
        >
          <div className="relative">
            {isDarkMode ? (
              <SunIcon className="flex-shrink-0 h-5 w-5 text-yellow-500 transform group-hover:rotate-180 transition-transform duration-500" />
            ) : (
              <MoonIcon className="flex-shrink-0 h-5 w-5 text-gray-500 group-hover:text-indigo-500 transform group-hover:-rotate-12 transition-all duration-300" />
            )}
          </div>
          <span className={`
            ml-3 transition-all duration-300
            ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          `}>
            {isDarkMode ? 'Modo claro' : 'Modo oscuro'}
          </span>
        </button>
      </div>

      {/* Información de usuario mejorada */}
      <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-white to-gray-50 dark:from-dark-100 dark:to-dark-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0 relative">
              <div className="h-10 w-10 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-full flex items-center justify-center shadow-lg transform transition-transform duration-300 hover:scale-110 status-indicator">
                <span className="text-white text-sm font-bold">
                  {user?.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            
            <div className={`
              ml-3 flex-1 transition-all duration-300
              ${isCollapsed ? 'opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0' : 'opacity-100 translate-x-0'}
            `}>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.nombre_usuario || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || 'usuario@vlock.com'}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-soft mr-2"></div>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">En línea</span>
              </div>
            </div>
          </div>
          
          <div className={`
            flex items-center space-x-1 transition-all duration-300
            ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
          `}>
            <button
              onClick={handleRefreshPermissions}
              onMouseEnter={() => setHoveredItem('refresh')}
              onMouseLeave={() => setHoveredItem(null)}
              className="
                text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 
                p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 
                transition-all duration-300 transform hover:scale-110 hover:rotate-180
                group/refresh
              "
              title="Actualizar permisos"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="h-5 w-5 transform group-hover/refresh:rotate-180 transition-transform duration-500"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            
            <button
              onClick={handleLogout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              className="
                text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 
                p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 
                transition-all duration-300 transform hover:scale-110
                group/logout
              "
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 transform group-hover/logout:translate-x-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
