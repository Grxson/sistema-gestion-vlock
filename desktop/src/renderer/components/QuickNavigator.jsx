import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiChevronRight } from 'react-icons/fi';
import { usePermissions } from '../contexts/PermissionsContext';

/**
 * QuickNavigator - Modal de navegación rápida con búsqueda
 * Se activa con Ctrl+B desde cualquier parte de la aplicación
 */
const QuickNavigator = ({ isOpen, onClose, onNavigate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const { hasModuleAccess } = usePermissions();

  // Definir todas las secciones navegables con sus rutas
  const allSections = [
    { name: 'Dashboard', path: '/', keywords: ['inicio', 'home', 'principal'], icon: '📊', module: 'dashboard' },
    { name: 'Empleados', path: '/empleados', keywords: ['personal', 'trabajadores', 'staff'], icon: '👥', module: 'empleados' },
    { name: 'Proyectos', path: '/proyectos', keywords: ['obras', 'construcciones'], icon: '🏗️', module: 'proyectos' },
    { name: 'Nómina', path: '/nomina', keywords: ['pagos', 'salarios', 'nominas'], icon: '💰', module: 'nomina' },
  { name: 'Gastos', path: '/suministros', keywords: ['materiales', 'inventario', 'gastos', 'gasto'], icon: '📦', module: 'suministros' },
    { name: 'Proveedores', path: '/proveedores', keywords: ['suppliers', 'vendedores'], icon: '🏢', module: 'proveedores' },
    { name: 'Herramientas', path: '/herramientas', keywords: ['equipos', 'tools'], icon: '🔧', module: 'herramientas' },
    { name: 'Contratos', path: '/contratos', keywords: ['acuerdos', 'convenios'], icon: '📄', module: 'contratos' },
    { name: 'Oficios', path: '/oficios', keywords: ['documentos', 'comunicados'], icon: '📝', module: 'oficios' },
    { name: 'Adeudos', path: '/adeudos-generales', keywords: ['deudas', 'pendientes', 'pagos'], icon: '💳', module: 'adeudos-generales' },
    { name: 'Ingresos', path: '/ingresos', keywords: ['cobros', 'pagos recibidos'], icon: '💵', module: 'ingresos' },
    { name: 'Reportes', path: '/reportes', keywords: ['informes', 'estadísticas'], icon: '📈', module: 'reportes' },
    { name: 'Auditoría', path: '/auditoria', keywords: ['logs', 'historial'], icon: '🔍', module: 'auditoria' },
    { name: 'Usuarios', path: '/usuarios', keywords: ['users', 'cuentas'], icon: '👤', module: 'usuarios' },
    { name: 'Roles', path: '/roles', keywords: ['permisos', 'accesos'], icon: '🔐', module: 'roles' },
    { name: 'Exportar/Importar', path: '/exportacion', keywords: ['backup', 'respaldo', 'exportar', 'importar', 'datos'], icon: '💾', module: 'exportacion' },
    { name: 'Configuración', path: '/configuracion', keywords: ['ajustes', 'settings'], icon: '⚙️', module: 'config' },
    { name: 'Mi Perfil', path: '/perfil', keywords: ['cuenta', 'usuario', 'profile'], icon: '👨‍💼', module: null },
    { name: 'Diagnóstico', path: '/diagnostico', keywords: ['debug', 'system'], icon: '🩺', module: 'diagnostico' },
    // Presupuestos
    { name: 'Conceptos de Obra', path: '/presupuestos/conceptos', keywords: ['conceptos', 'partidas'], icon: '📋', module: 'presupuestos' },
    { name: 'Precios Unitarios', path: '/presupuestos/precios', keywords: ['precios', 'costos'], icon: '💲', module: 'presupuestos' },
    { name: 'Presupuestos', path: '/presupuestos/listado', keywords: ['estimados', 'cotizaciones'], icon: '📊', module: 'presupuestos' },
    { name: 'Catálogos de Precios', path: '/presupuestos/catalogos', keywords: ['catalogos', 'listados'], icon: '📚', module: 'presupuestos' },
    { name: 'Nuevo Presupuesto', path: '/presupuestos/nuevo', keywords: ['crear', 'generar'], icon: '✨', module: 'presupuestos' },
    { name: 'IA para Presupuestos', path: '/presupuestos/ml', keywords: ['inteligencia artificial', 'ai', 'ml'], icon: '🤖', module: 'presupuestos' },
  ];

  // Filtrar secciones según permisos y búsqueda
  const filteredSections = allSections.filter(section => {
    // El dashboard y perfil siempre están disponibles
    if (section.module === null || section.module === 'dashboard') {
      return matchesSearch(section);
    }
    // Verificar permisos para otros módulos
    if (!hasModuleAccess(section.module)) {
      return false;
    }
    return matchesSearch(section);
  });

  function matchesSearch(section) {
    if (!searchTerm.trim()) return true;
    
    const search = searchTerm.toLowerCase();
    const nameMatch = section.name.toLowerCase().includes(search);
    const keywordMatch = section.keywords.some(kw => kw.toLowerCase().includes(search));
    const pathMatch = section.path.toLowerCase().includes(search);
    
    return nameMatch || keywordMatch || pathMatch;
  }

  // Resetear al abrir
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setSelectedIndex(0);
      // Focus en el input cuando se abre
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredSections.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredSections.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSections[selectedIndex]) {
            handleSelectSection(filteredSections[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredSections, onClose]);

  // Ajustar selectedIndex si la búsqueda reduce los resultados
  useEffect(() => {
    if (selectedIndex >= filteredSections.length && filteredSections.length > 0) {
      setSelectedIndex(filteredSections.length - 1);
    }
  }, [filteredSections, selectedIndex]);

  const handleSelectSection = (section) => {
    onNavigate(section.path);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
        <div className="bg-white dark:bg-dark-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-4 py-3">
            <FiSearch className="text-gray-400 text-xl mr-3" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar sección... (Ejemplo: empleados, nomina, proyectos)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400"
              autoComplete="off"
            />
            <button
              onClick={onClose}
              className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-dark-200 rounded transition-colors"
            >
              <FiX className="text-gray-500" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {filteredSections.length > 0 ? (
              <div className="py-2">
                {filteredSections.map((section, index) => (
                  <button
                    key={section.path}
                    onClick={() => handleSelectSection(section)}
                    className={`w-full flex items-center px-4 py-3 transition-colors ${
                      index === selectedIndex
                        ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-600'
                        : 'hover:bg-gray-50 dark:hover:bg-dark-200 border-l-4 border-transparent'
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="text-2xl mr-3">{section.icon}</span>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {section.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {section.path}
                      </div>
                    </div>
                    {index === selectedIndex && (
                      <FiChevronRight className="text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                <FiSearch className="text-4xl mx-auto mb-3 opacity-30" />
                <p>No se encontraron secciones</p>
                <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer hints */}
          <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-dark-200">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-2 py-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd> Navegar
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded text-xs">Enter</kbd> Seleccionar
                </span>
                <span>
                  <kbd className="px-2 py-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded text-xs">Esc</kbd> Cerrar
                </span>
              </div>
              <div className="text-xs">
                <kbd className="px-2 py-1 bg-white dark:bg-dark-100 border border-gray-300 dark:border-gray-600 rounded text-xs">Ctrl+B</kbd> para abrir
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuickNavigator;
