import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PermissionsProvider, usePermissions } from './contexts/PermissionsContext';
import { ToastProvider } from './contexts/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Empleados from './components/Empleados';
import Nomina from './components/Nomina';
import Contratos from './components/Contratos';
import Oficios from './components/Oficios';
import Usuarios from './components/Usuarios';
import Roles from './components/Roles';
import Reportes from './components/Reportes';
import Suministros from './pages/Suministros';
import Proveedores from './pages/Proveedores';
import Proyectos from './pages/Proyectos';
import Herramientas from './pages/Herramientas';
import DiagnosticPageAdvanced from './pages/DiagnosticPageAdvanced';
import ProfilePage from './pages/ProfilePage';
import ConfigurationPage from './pages/ConfigurationPage';
import { useDocumentTitle } from './hooks/useDocumentTitle';

// Importar router de presupuestos
import PresupuestosRouter from './components/presupuestos/PresupuestosRouter';

// Importar componente AccessDenied
import AccessDenied from './components/AccessDenied';

function MainApp() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Recuperar la ruta guardada o usar la predeterminada
    return localStorage.getItem('currentPath') || '/';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { hasModuleAccess, loading: permissionsLoading } = usePermissions();

  // Mapeo de rutas a títulos
  const routeTitles = {
    '/': 'Dashboard',
    '/empleados': 'Empleados',
    '/proyectos': 'Proyectos',
    '/nomina': 'Nomina',
    '/contratos': 'Contratos',
    '/oficios': 'Oficios',
    '/usuarios': 'Usuarios',
    '/roles': 'Roles',
    '/reportes': 'Reportes',
    '/suministros': 'Suministros',
    '/proveedores': 'Proveedores',
    '/diagnostico': 'Diagnóstico',
    '/configuracion': 'Configuración',
    '/perfil': 'Mi Perfil',
    '/presupuestos/conceptos': 'Conceptos de Obra',
    '/presupuestos/precios': 'Precios Unitarios',
    '/presupuestos/listado': 'Presupuestos',
    '/presupuestos/catalogos': 'Catálogos de Precios',
    '/presupuestos/nuevo': 'Nuevo Presupuesto',
    '/presupuestos/ml': 'IA para Presupuestos'
  };

  // Usar el hook para actualizar el título dinámicamente
  const currentPageTitle = routeTitles[currentPath] || 'Sistema';
  useDocumentTitle(currentPageTitle);

  const handleNavigate = (path) => {
    setCurrentPath(path);
    // Guardar la ruta actual en localStorage
    localStorage.setItem('currentPath', path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Función para obtener el módulo basado en la ruta actual
  const getModuleFromPath = (path) => {
    // Si es una subruta de presupuestos, devolver 'presupuestos'
    if (path.startsWith('/presupuestos/')) {
      return 'presupuestos';
    }
    // Eliminar la barra inicial para obtener el nombre del módulo
    return path.substring(1) || 'dashboard';
  };

  const renderContent = () => {
    // Mostrar un indicador de carga mientras se cargan los permisos
    if (permissionsLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando permisos...</p>
          </div>
        </div>
      );
    }

    // El dashboard siempre está disponible
    if (currentPath === '/') {
      return <Dashboard />;
    }

    // Rutas especiales que no requieren verificación de permisos específicos
    if (currentPath === '/perfil') {
      return <ProfilePage />;
    }
    
    // Obtener el módulo de la ruta actual
    const currentModule = getModuleFromPath(currentPath);
    
    // Verificar si el usuario tiene acceso al módulo
    if (!hasModuleAccess(currentModule)) {
      // Mostrar componente de acceso denegado con el nombre del módulo
      const moduleNames = {
        empleados: 'Empleados',
        proyectos: 'Proyectos',
        nomina: 'Nómina',
        contratos: 'Contratos',
        oficios: 'Oficios',
        auditoria: 'Auditoria',
        reportes: 'Reportes',
        usuarios: 'Usuarios',
        roles: 'Roles',
        config: 'Configuración',
        presupuestos: 'Presupuestos'
      };
      
      return <AccessDenied moduleName={moduleNames[currentModule]} />;
    }
    
    // Si tiene acceso, mostrar el componente correspondiente
    switch (currentPath) {
      case '/empleados':
        return <Empleados />;
      case '/proyectos':
        return <Proyectos />;
      case '/nomina':
        return <Nomina />;
      case '/contratos':
        return <Contratos />;
      case '/oficios':
        return <Oficios />;
      case '/auditoria':
        return (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Módulo de Auditoría</h2>
              <p className="text-gray-600 dark:text-gray-400">En desarrollo...</p>
            </div>
          </div>
        );
      case '/reportes':
        return <Reportes />;
      case '/suministros':
        return <Suministros />;
      case '/proveedores':
        return <Proveedores />;
      case '/herramientas':
        return <Herramientas />;
      case '/configuracion':
        return <ConfigurationPage />;
      case '/usuarios':
        return <Usuarios />;
      case '/roles':
        return <Roles />;
      case '/diagnostico':
        return <DiagnosticPageAdvanced />;
      default:
        // Si la ruta empieza con /presupuestos/, usar el router de presupuestos
        if (currentPath.startsWith('/presupuestos/')) {
          return <PresupuestosRouter currentPath={currentPath} onNavigate={handleNavigate} />;
        }
        // Si la ruta empieza con /suministros/, manejar las subrutas
        if (currentPath.startsWith('/suministros/')) {
          return <Suministros />;
        }
        // Si la ruta empieza con /herramientas/, manejar las subrutas
        if (currentPath.startsWith('/herramientas/')) {
          return <Herramientas />;
        }
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {import.meta.env.VITE_APP_FULL_NAME}
              </h1>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                  {new Date().toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PermissionsProvider>
          <ToastProvider>
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          </ToastProvider>
        </PermissionsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;