import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  UserIcon, 
  ArrowRightOnRectangleIcon, 
  CogIcon,
  UserCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';

const UserMenu = ({ user, isCollapsed, sidebarWidth }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  // Calcular posición del menú
  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 192; // w-48 = 192px
      const menuHeight = 140; // altura aproximada del menú
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left, top;
      
      if (isCollapsed) {
        // Sidebar colapsado: mostrar menú a la derecha del botón
        left = rect.right + 8;
        
        // Si no cabe a la derecha, mostrar a la izquierda
        if (left + menuWidth > viewportWidth - 16) {
          left = rect.left - menuWidth - 8;
        }
        
        // Centrar verticalmente con el botón
        top = rect.top + (rect.height / 2) - (menuHeight / 2);
      } else {
        // Sidebar expandido: mantener menú dentro del sidebar
        // Calcular posición para que quede dentro del contenedor del sidebar
        const sidebarRect = buttonRef.current.closest('[class*="w-64"]') || 
                           buttonRef.current.closest('[class*="sidebar"]') ||
                           buttonRef.current.parentElement;
        
        if (sidebarRect) {
          const sidebarBounds = sidebarRect.getBoundingClientRect();
          // Posicionar dentro del sidebar, alineado a la derecha del ancho disponible
          left = sidebarBounds.right - menuWidth - 16;
        } else {
          // Fallback: alinear con el botón
          left = rect.left;
        }
        
        // Posicionar arriba del botón
        top = rect.top - menuHeight - 8;
      }
      
      // Ajustar si se sale por arriba o abajo de la pantalla
      if (top < 16) {
        top = 16;
      } else if (top + menuHeight > viewportHeight - 16) {
        top = viewportHeight - menuHeight - 16;
      }
      
      // Asegurar que no se salga por los lados
      left = Math.max(16, Math.min(left, viewportWidth - menuWidth - 16));
      
      setMenuPosition({ top, left });
    }
  }, [isMenuOpen, isCollapsed]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    setIsMenuOpen(false);
    logout();
  };

  const handleProfile = () => {
    setIsMenuOpen(false);
    // TODO: Implementar navegación al perfil
    console.log('Ir al perfil');
  };

  const handleSettings = () => {
    setIsMenuOpen(false);
    // TODO: Implementar navegación a configuración
    console.log('Ir a configuración');
  };

  return (
    <div className="relative">
      {/* Botón del usuario */}
      <button
        ref={buttonRef}
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
      >
        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-lg">
              {user?.nombre_usuario?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          {/* Badge Admin */}
          {(user?.rol === 'admin' || user?.id_rol === 1) && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-3 h-3 text-white" />
            </div>
          )}
          {/* Indicador en línea */}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>

        {/* Información del usuario */}
        <div className={`
          flex-1 text-left transition-all duration-300
          ${isCollapsed ? 'opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0' : 'opacity-100 translate-x-0'}
        `}>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {user?.nombre_usuario || 'Usuario'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {(user?.rol === 'admin' || user?.id_rol === 1) ? 'Administrador' : 'Usuario'}
          </p>
        </div>

        {/* Icono de menú */}
        <div className={`
          transition-all duration-300
          ${isCollapsed ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}
        `}>
          <div className={`transform transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {/* Menú desplegable usando Portal para evitar desbordamiento */}
      {isMenuOpen && createPortal(
        <div 
          ref={menuRef}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 1000
          }}
          className="w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2"
        >
          {/* Perfil */}
          <button
            onClick={handleProfile}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <UserCircleIcon className="w-4 h-4" />
            Mi Perfil
          </button>

          {/* Configuración */}
          <button
            onClick={handleSettings}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <CogIcon className="w-4 h-4" />
            Configuración
          </button>

          {/* Separador */}
          <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>

          {/* Cerrar sesión */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>,
        document.body
      )}
    </div>
  );
};

export default UserMenu;
