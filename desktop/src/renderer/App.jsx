import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Empleados from './components/Empleados';
import Nomina from './components/Nomina';

function MainApp() {
  const [currentPath, setCurrentPath] = useState('/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (path) => {
    setCurrentPath(path);
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Módulo de Contratos</h2>
            <p className="mt-2 text-gray-600">En desarrollo...</p>
          </div>
        );
      case '/oficios':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Módulo de Oficios</h2>
            <p className="mt-2 text-gray-600">En desarrollo...</p>
          </div>
        );
      case '/auditoria':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Módulo de Auditoría</h2>
            <p className="mt-2 text-gray-600">En desarrollo...</p>
          </div>
        );
      case '/reportes':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Módulo de Reportes</h2>
            <p className="mt-2 text-gray-600">En desarrollo...</p>
          </div>
        );
      case '/configuracion':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900">Configuración</h2>
            <p className="mt-2 text-gray-600">En desarrollo...</p>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isCollapsed={sidebarCollapsed}
        onToggle={toggleSidebar}
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold text-gray-900">
                Sistema de Gestión VLock
              </h1>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
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
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <MainApp />
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;