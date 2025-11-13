import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePermissions } from '../contexts/PermissionsContext';
import UserMenu from './ui/UserMenu';
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
  ChevronRightIcon,
  BuildingStorefrontIcon,
  RectangleGroupIcon,
  CalculatorIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BanknotesIcon,
  LockClosedIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';



// Definición de los elementos de navegación con sus respectivos códigos de permiso
const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true, permissionModule: 'dashboard' },
  { name: 'Nómina', href: '/nomina', icon: CurrencyDollarIcon, current: false, permissionModule: 'nomina' },
  { 
    name: 'Gastos', 
    href: '/suministros', 
    icon: TruckIcon, 
    current: false, 
    permissionModule: 'suministros',
    hasSubmenu: false
  },
  { name: 'Adeudos', href: '/adeudos-generales', icon: BanknotesIcon, current: false, permissionModule: 'adeudos' },
  { name: 'Ingresos', href: '/ingresos', icon: BanknotesIcon, current: false, permissionModule: 'ingresos' },
  { 
    name: 'Inventario', 
    href: '/herramientas', 
    icon: WrenchScrewdriverIcon, 
    current: false, 
    permissionModule: 'herramientas',
    hasSubmenu: false
  },
  { name: 'Empleados', href: '/empleados', icon: UserGroupIcon, current: false, permissionModule: 'empleados' },
  { name: 'Oficios', href: '/oficios', icon: BuildingOfficeIcon, current: false, permissionModule: 'oficios' },
  { name: 'Proveedores', href: '/proveedores', icon: BuildingStorefrontIcon, current: false, permissionModule: 'proveedores' },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon, current: false, permissionModule: 'contratos' },
  { name: 'Proyectos', href: '/proyectos', icon: RectangleGroupIcon, current: false, permissionModule: 'proyectos' },
  { 
    name: 'Presupuestos', 
    href: '/presupuestos/en-desarrollo', 
    icon: CalculatorIcon, 
    current: false, 
    permissionModule: 'presupuestos', 
    hasSubmenu: false,
    badge: ' '
  },
  
  // Administración
  { name: 'Auditoría', href: '/auditoria', icon: ClipboardDocumentCheckIcon, current: false, permissionModule: 'auditoria' },
  { name: 'Usuarios', href: '/usuarios', icon: UserIcon, current: false, permissionModule: 'usuarios' },
  { name: 'Roles', href: '/roles', icon: ShieldCheckIcon, current: false, permissionModule: 'roles' },
  { name: 'Exportar/Importar', href: '/exportacion', icon: ArrowDownTrayIcon, current: false, permissionModule: 'exportacion' },
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
  const [expandedMenus, setExpandedMenus] = useState({});

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

  // Función para alternar submenús
  const toggleSubmenu = (itemName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

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
      return item.href === '/';
    }
    
    // Para usuarios admin, mostrar todos los módulos
    if (user?.rol === 'admin' || user?.id_rol === 1) {
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
      'proyectos': 'proyectos.ver',
      'adeudos': 'adeudos.ver',
      'ingresos': 'ingresos.ver',
      'exportacion': 'exportacion.ver'
    };
    
    // Obtener el código de permiso para este módulo
    const permissionCode = modulePermissionMap[item.permissionModule];
    
    if (!permissionCode) {
      console.error(`[Sidebar] No se encontró código de permiso para el módulo: ${item.permissionModule}`);
      return false;
    }
    
    // Verificar si el usuario tiene el permiso específico "ver" para este módulo
    const hasAccess = hasPermission(permissionCode);
    
    return hasAccess;
  });
  
  // Si el usuario no tiene acceso a ningún módulo excepto Dashboard, mostrar un mensaje en la consola
  if (navigation.length <= 1) {
    console.warn('¡Advertencia! El usuario solo tiene acceso al Dashboard. Verifica la configuración de permisos.');
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
      ${isCollapsed ? 'w-16' : 'w-56'} 
      flex flex-col bg-gradient-to-b from-white to-gray-50 dark:from-dark-100 dark:to-dark-200 
      border-r border-gray-200 dark:border-gray-700 h-screen shadow-xl
      transition-all duration-300 ease-in-out transform
      ${isCollapsed ? 'hover:w-56 hover:shadow-2xl' : ''}
      relative group z-30
    `}>
      {/* Header mejorado */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-dark-100">
        <div className={`flex items-center transition-all duration-300 ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
          <div className="relative">
            <img
              className="h-10 w-auto transition-transform duration-300 hover:scale-110"
              src="/images/vlock_logo.png"
              alt={import.meta.env.VITE_APP_NAME || 'Vlock'}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          <span className="ml-3 text-gray-900 dark:text-white font-bold text-xl bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            {import.meta.env.VITE_APP_NAME}
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

      {/* Navigation minimalista con indicador conectado */}
      <nav className="flex-1 px-2 py-6 space-y-2 overflow-y-hidden hover:overflow-y-auto custom-scrollbar relative"
           style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {navigation.map((item, index) => {
          const isActive = currentPath === item.href;
          const isComingSoon = Boolean(item.badge);
          return (
            <div key={item.name} className="relative">
              {/* Indicador - solo visible cuando está activo */}
              {isActive && (
                <>
                  {/* Línea principal del indicador */}
                  <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-500 to-primary-600 rounded-r-full animate-slideInLeft"></div>
                  

                </>
              )}
              
              <button
                onClick={() => {
                  if (item.hasSubmenu) {
                    toggleSubmenu(item.name);
                    // También navegar a la página principal si no es solo un contenedor de submenús
                    if (item.href && item.href !== '#') {
                      onNavigate(item.href);
                    }
                    return;
                  }
                  onNavigate(item.href);
                }}
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
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-semibold'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50',
                  'group/item flex items-center px-4 py-3 text-sm rounded-lg w-full transition-all duration-300 relative'
                )}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                {/* Hover effect sutil */}
                <div className={`
                  absolute inset-0 bg-gradient-to-r from-transparent via-gray-50/50 to-transparent dark:via-gray-700/30
                  transform transition-transform duration-500 rounded-lg
                  ${hoveredItem === item.name ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
                  ${isActive ? 'hidden' : 'block'}
                `}></div>
                
                <item.icon
                  className={classNames(
                    isActive 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover/item:text-gray-700 dark:group-hover/item:text-gray-300',
                    'flex-shrink-0 h-5 w-5 transition-all duration-300 relative z-10'
                  )}
                  aria-hidden="true"
                />
                
                <span className={`
                  ml-3 transition-all duration-300 relative z-10 flex items-center justify-between w-full
                  ${isCollapsed ? 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0' : 'opacity-100 translate-x-0'}
                  ${isActive ? 'font-semibold' : 'font-medium'}
                `}>
                  <span className="flex items-center space-x-2">
                    <span>{item.name}</span>
                    {isComingSoon && !isCollapsed && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                        <LockClosedIcon className="w-3.5 h-3.5 mr-1" />
                        {item.badge}
                      </span>
                    )}
                  </span>
                  {item.hasSubmenu && !isCollapsed && (
                    <ChevronDownIcon 
                      className={`h-4 w-4 transition-transform duration-300 ${expandedMenus[item.name] ? 'rotate-180' : ''}`}
                    />
                  )}
                </span>
                
                {/* Tooltip para modo colapsado */}
                {isCollapsed && showTooltip && hoveredItem === item.name && (
                  <div className="
                    absolute left-full ml-4 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-sm rounded-lg 
                    shadow-xl z-50 whitespace-nowrap animate-fadeIn
                    before:content-[''] before:absolute before:top-1/2 before:-left-1 before:-translate-y-1/2
                    before:border-4 before:border-transparent before:border-r-gray-900 dark:before:border-r-gray-800
                  ">
                    {item.name}
                    {item.hasSubmenu && (
                      <div className="mt-2 pt-2 border-t border-gray-700">
                        {item.submenu?.map(subItem => (
                          <div key={subItem.name} className="text-xs text-gray-300 py-1">
                            {subItem.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </button>

              {/* Submenu items */}
              {item.hasSubmenu && expandedMenus[item.name] && !isCollapsed && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu?.map((subItem, subIndex) => {
                    const isSubActive = currentPath === subItem.href;
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => onNavigate(subItem.href)}
                        className={classNames(
                          isSubActive
                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border-l-2 border-primary-500'
                            : subItem.isAction
                            ? 'text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border-l-2 border-transparent hover:border-primary-300'
                            : subItem.isAdvanced
                            ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 border-l-2 border-transparent hover:border-purple-300'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-l-2 border-transparent hover:border-gray-300',
                          'group/subitem flex items-center px-4 py-2 text-sm rounded-r-lg w-full transition-all duration-300 relative'
                        )}
                        style={{
                          animationDelay: `${(index * 50) + (subIndex * 25)}ms`
                        }}
                      >
                        <subItem.icon
                          className={classNames(
                            isSubActive 
                              ? 'text-primary-600 dark:text-primary-400' 
                              : subItem.isAction
                              ? 'text-primary-500 dark:text-primary-400'
                              : subItem.isAdvanced
                              ? 'text-purple-500 dark:text-purple-400 group-hover/subitem:text-purple-600 dark:group-hover/subitem:text-purple-300'
                              : 'text-gray-400 dark:text-gray-500 group-hover/subitem:text-gray-600 dark:group-hover/subitem:text-gray-400',
                            'flex-shrink-0 h-4 w-4 transition-colors duration-300'
                          )}
                          aria-hidden="true"
                        />
                        <div className="ml-3 flex-1">
                          <div className={`font-medium ${isSubActive ? 'text-primary-700 dark:text-primary-300' : ''}`}>
                            {subItem.name}
                          </div>
                          {subItem.description && (
                            <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {subItem.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sección de utilidades minimalista */}
      <div className="px-2 py-4 border-t border-gray-200 dark:border-gray-700/50">
        {/* Diagnóstico */}
        <div className="relative mb-2">
          {/* Indicador para diagnóstico */}
          {currentPath === '/diagnostico' && (
            <>
              <div className="absolute -left-2 top-0 bottom-0 w-1 bg-gradient-to-b from-orange-500 to-orange-600 rounded-r-full animate-slideInLeft"></div>
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-0.5 bg-gradient-to-r from-orange-500 to-transparent animate-slideInRight"></div>
              <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-orange-500 rounded-full animate-pulse-soft"></div>
            </>
          )}
          
          <button
            onClick={() => onNavigate('/diagnostico')}
            onMouseEnter={() => setHoveredItem('diagnostico')}
            onMouseLeave={() => setHoveredItem(null)}
            className={classNames(
              currentPath === '/diagnostico'
                ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 font-semibold'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50',
              'w-full flex items-center px-4 py-3 text-sm rounded-lg transition-all duration-300 relative'
            )}
          >
            
            <WrenchScrewdriverIcon 
              className={classNames(
                currentPath === '/diagnostico'
                  ? 'text-orange-600 dark:text-orange-400'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300',
                'flex-shrink-0 h-5 w-5 transition-all duration-300'
              )}
            />
            <span className={`
              ml-3 transition-all duration-300
              ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
            `}>
              Diagnóstico
            </span>
          </button>
        </div>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          onMouseEnter={() => setHoveredItem('theme')}
          onMouseLeave={() => setHoveredItem(null)}
          className="
            w-full flex items-center px-4 py-3 text-sm rounded-lg
            text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white 
            hover:bg-gray-50 dark:hover:bg-gray-700/50
            transition-all duration-300 relative
          "
        >
          
          <div className="relative">
            {isDarkMode ? (
              <SunIcon className="flex-shrink-0 h-5 w-5 text-yellow-500 transform transition-transform duration-500" />
            ) : (
              <MoonIcon className="flex-shrink-0 h-5 w-5 text-gray-500 transition-all duration-300" />
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
      <div>
        <UserMenu 
          user={user} 
          isCollapsed={isCollapsed}
          sidebarWidth={isCollapsed ? 'w-16' : 'w-64'}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );
}
