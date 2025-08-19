import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Empleados from './components/Empleados';
import Nomina from './components/Nomina';
import Usuarios from './components/Usuarios';

function MainApp() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Recuperar la ruta guardada o usar la predeterminada
    return localStorage.getItem('currentPath') || '/';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (path) => {
    setCurrentPath(path);
    // Guardar la ruta actual en localStorage
    localStorage.setItem('currentPath', path);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/':
        return <Dashboard />;
      case '/empleados':
        return <Empleados />;
      case '/nomina':
        return <Nomina />;
      case '/contratos':
        return (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Módulo de Contratos</h2>
              <p className="text-gray-600 dark:text-gray-400">En desarrollo...</p>
            </div>
          </div>
        );
      case '/oficios':
        return (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Módulo de Oficios</h2>
              <p className="text-gray-600 dark:text-gray-400">En desarrollo...</p>
            </div>
          </div>
        );
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
        return (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Módulo de Reportes</h2>
              <p className="text-gray-600 dark:text-gray-400">En desarrollo...</p>
            </div>
          </div>
        );
      case '/configuracion':
        return (
          <div className="text-center py-20">
            <div className="bg-white dark:bg-dark-100 rounded-xl shadow-xl p-10 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Configuración</h2>
              <p className="text-gray-600 dark:text-gray-400">En desarrollo...</p>
            </div>
          </div>
        );
      case '/usuarios':
        return <Usuarios />;
      default:
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
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-dark-100 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Sistema de Gestión VLock
              </h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">
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
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-dark-50 transition-colors duration-300">
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
        <ProtectedRoute>
          <MainApp />
        </ProtectedRoute>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;