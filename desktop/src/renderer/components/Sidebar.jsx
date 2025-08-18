import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClipboardDocumentCheckIcon,
  CogIcon,
  ChartBarIcon,
  BuildingOfficeIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: true },
  { name: 'Empleados', href: '/empleados', icon: UserGroupIcon, current: false },
  { name: 'Nómina', href: '/nomina', icon: CurrencyDollarIcon, current: false },
  { name: 'Contratos', href: '/contratos', icon: DocumentTextIcon, current: false },
  { name: 'Oficios', href: '/oficios', icon: BuildingOfficeIcon, current: false },
  { name: 'Auditoría', href: '/auditoria', icon: ClipboardDocumentCheckIcon, current: false },
  { name: 'Reportes', href: '/reportes', icon: ChartBarIcon, current: false },
  { name: 'Configuración', href: '/configuracion', icon: CogIcon, current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function Sidebar({ currentPath, onNavigate, isCollapsed, onToggle }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      logout();
    }
  };
  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} sidebar-transition flex flex-col bg-gradient-to-b from-primary-800 to-primary-900 h-screen`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <div className="flex items-center">
            <img
              className="h-8 w-auto"
              src="../public/images/vlock_logo.png"
              alt="VLock"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <span className="ml-2 text-white font-bold text-lg">VLock</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="text-white hover:bg-primary-700 p-2 rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 pb-4 space-y-1">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <button
              key={item.name}
              onClick={() => onNavigate(item.href)}
              className={classNames(
                isActive
                  ? 'bg-primary-700 text-white'
                  : 'text-primary-100 hover:bg-primary-700 hover:text-white',
                'group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full transition-all duration-200'
              )}
            >
              <item.icon
                className={classNames(
                  isActive ? 'text-white' : 'text-primary-300 group-hover:text-white',
                  'mr-3 flex-shrink-0 h-5 w-5 transition-colors'
                )}
                aria-hidden="true"
              />
              {!isCollapsed && (
                <span className="transition-opacity duration-200">{item.name}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      <div className="flex-shrink-0 p-4 border-t border-primary-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
            {!isCollapsed && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-white truncate">
                  {user?.nombre_usuario || 'Usuario'}
                </p>
                <p className="text-xs text-primary-300 truncate">
                  {user?.email || 'usuario@vlock.com'}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="text-primary-300 hover:text-white p-1 rounded transition-colors"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
