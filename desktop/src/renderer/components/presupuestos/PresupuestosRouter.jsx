import React, { useState, useEffect } from 'react';
import ConceptosObra from './ConceptosObra';
import PreciosUnitarios from './PreciosUnitarios';
import Presupuestos from './Presupuestos';
import CatalogosPrecios from './CatalogosPrecios';
import NuevoPresupuesto from './NuevoPresupuesto';
import PresupuestosMLFeatures from './PresupuestosMLFeatures';
import presupuestosServices from '../../services/presupuestos';

/**
 * Router principal para el módulo de presupuestos
 * Maneja la navegación entre todas las páginas del módulo
 */
const PresupuestosRouter = ({ currentPath, onNavigate }) => {
  const [loading, setLoading] = useState(true);
  const [moduleReady, setModuleReady] = useState(false);
  const [stats, setStats] = useState(null);

  // Inicializar el módulo de presupuestos
  useEffect(() => {
    initializeModule();
  }, []);

  const initializeModule = async () => {
    try {
      setLoading(true);
      console.log('🔧 Inicializando módulo de presupuestos...');
      
      // Inicializar los servicios (siempre continúa)
      const initialized = await presupuestosServices.initialize();
      console.log('📊 Servicios inicializados:', initialized);
      
      // Siempre marcar como ready para no bloquear la interfaz
      setModuleReady(true);
      
      // Intentar obtener estadísticas si es posible
      try {
        const moduleStats = await presupuestosServices.getModuleStats();
        setStats(moduleStats);
        console.log('📈 Estadísticas cargadas:', moduleStats);
      } catch (statsError) {
        console.warn('⚠️ No se pudieron cargar estadísticas:', statsError.message);
        // Continuar sin estadísticas
      }
    } catch (error) {
      console.error('❌ Error inicializando módulo de presupuestos:', error);
      // Siempre continuar para no bloquear la UI
      setModuleReady(true);
    } finally {
      setLoading(false);
      console.log('✅ Módulo de presupuestos listo');
    }
  };

  // Breadcrumb mapping
  const breadcrumbMap = {
    '/presupuestos/conceptos': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' },
      { label: 'Conceptos de Obra', path: '/presupuestos/conceptos' }
    ],
    '/presupuestos/precios': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' },
      { label: 'Precios Unitarios', path: '/presupuestos/precios' }
    ],
    '/presupuestos/listado': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' }
    ],
    '/presupuestos/catalogos': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' },
      { label: 'Catálogos de Precios', path: '/presupuestos/catalogos' }
    ],
    '/presupuestos/nuevo': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' },
      { label: 'Nuevo Presupuesto', path: '/presupuestos/nuevo' }
    ],
    '/presupuestos/ml': [
      { label: 'Dashboard', path: '/' },
      { label: 'Presupuestos', path: '/presupuestos/listado' },
      { label: 'Inteligencia Artificial', path: '/presupuestos/ml' }
    ]
  };

  // Renderizar breadcrumbs
  const renderBreadcrumbs = (path) => {
    const breadcrumbs = breadcrumbMap[path] || [];
    
    return (
      <nav className="flex mb-4" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          {breadcrumbs.map((crumb, index) => (
            <li key={index} className="inline-flex items-center">
              {index > 0 && (
                <svg 
                  className="w-3 h-3 text-gray-400 mx-1" 
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 6 10"
                >
                  <path 
                    stroke="currentColor" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="m1 9 4-4-4-4"
                  />
                </svg>
              )}
              <button
                onClick={() => onNavigate && onNavigate(crumb.path)}
                className={`inline-flex items-center text-sm font-medium transition-colors duration-200 ${
                  index === breadcrumbs.length - 1
                    ? 'text-gray-500 dark:text-gray-400 cursor-default'
                    : 'text-blue-700 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 hover:underline'
                }`}
                disabled={index === breadcrumbs.length - 1}
              >
                {crumb.label}
              </button>
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  // Renderizar pantalla de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Inicializando Módulo de Presupuestos
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Cargando servicios y configuración...
          </p>
        </div>
      </div>
    );
  }

  // Renderizar error si el módulo no se pudo inicializar
  if (!moduleReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-8 max-w-md mx-auto">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
              <svg className="h-8 w-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
              Error de Inicialización
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No se pudo inicializar el módulo de presupuestos.
            </p>
            <button
              onClick={initializeModule}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar contenido principal
  const renderMainContent = () => {
    switch (currentPath) {
      case '/presupuestos/conceptos':
        return <ConceptosObra stats={stats?.conceptos} />;
      
      case '/presupuestos/precios':
        return <PreciosUnitarios stats={stats?.precios} />;
      
      case '/presupuestos/listado':
        return <Presupuestos stats={stats?.presupuestos} />;
      
      case '/presupuestos/catalogos':
        return <CatalogosPrecios stats={stats?.catalogos} />;
      
      case '/presupuestos/nuevo':
        return <NuevoPresupuesto onNavigate={onNavigate} />;
      
      case '/presupuestos/ml':
        return <PresupuestosMLFeatures onNavigate={onNavigate} />;
      
      default:
        // Redirigir al listado de presupuestos por defecto
        if (onNavigate) {
          onNavigate('/presupuestos/listado');
        }
        return <Presupuestos stats={stats?.presupuestos} />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Breadcrumbs */}
      <div className="flex-shrink-0 px-1 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
        {renderBreadcrumbs(currentPath)}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden">
        {renderMainContent()}
      </div>

      {/* Footer con información del módulo */}
      <div className="flex-shrink-0 mt-4 px-2 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Módulo de Presupuestos v1.0.0</span>
          {stats && (
            <span>
              Última actualización: {new Date(stats.ultimaActualizacion).toLocaleDateString('es-ES')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PresupuestosRouter;