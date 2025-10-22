# 🏗️ Arquitectura del Módulo de Reportes de Suministros

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                      Reportes.jsx                                │
│                   (Contenedor Principal)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 SuministrosReportsTab.jsx                        │
│                  (Componente Principal)                          │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │         useSuministrosData Hook                          │   │
│  │  • dashboardData                                         │   │
│  │  • loading, error                                        │   │
│  │  • filtros, handleFilterChange                           │   │
│  │  • proyectos, proveedores, categorias                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Header + Export Buttons                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SuministrosFilters                              │  │
│  │  • Fecha inicio/fin                                       │  │
│  │  • Proyecto (select)                                      │  │
│  │  • Proveedor (select)                                     │  │
│  │  • Categoría (select)                                     │  │
│  │  • Botón limpiar filtros                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SuministrosStatsCards                             │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │  │
│  │  │Total │ │Total │ │Provee│ │Proyec│ │Prome │ │Provee│ │  │
│  │  │Gasta │ │Regis │ │dores │ │tos   │ │dio   │ │dor   │ │  │
│  │  │do    │ │tros  │ │      │ │      │ │Gasto │ │Princ │ │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SuministrosCharts                               │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐       │  │
│  │  │  Costo por Proyecto │  │  Distribución por   │       │  │
│  │  │     (Bar Chart)     │  │  Proveedores (Dona) │       │  │
│  │  └─────────────────────┘  └─────────────────────┘       │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐       │  │
│  │  │ Evolución Mensual   │  │  Distribución por   │       │  │
│  │  │   (Line Chart)      │  │  Categorías (Pie)   │       │  │
│  │  └─────────────────────┘  └─────────────────────┘       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SuministrosTable                                │  │
│  │  ┌────────────────────────────────────────────────────┐ │  │
│  │  │ Material │ Categoría │ Frecuencia │ Cantidad │ $   │ │  │
│  │  ├────────────────────────────────────────────────────┤ │  │
│  │  │ ...      │ ...       │ ...        │ ...      │ ... │ │  │
│  │  └────────────────────────────────────────────────────┘ │  │
│  │  • Ordenamiento por columnas                             │  │
│  │  • Paginación (10 items/página)                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         │                                         │
│                         ▼                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         SuministrosExport (Floating)                      │  │
│  │  [PDF] [Excel] [Personalizado]                           │  │
│  │                                                            │  │
│  │  Modal de Configuración:                                  │  │
│  │  • Título y subtítulo                                     │  │
│  │  • Incluir filtros                                        │  │
│  │  • Incluir estadísticas                                   │  │
│  │  • Selección de gráficos                                  │  │
│  │  • Incluir tabla                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────┐
│                        INICIO                                     │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              useSuministrosData Hook                              │
│                    (useEffect inicial)                            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐
│ cargarDatosIniciales│      │  cargarDashboard    │
│  • getProyectos()   │      │  • getDashboard     │
│  • getProveedores() │      │    Suministros()    │
│  • setCategorias()  │      │                     │
└─────────────────────┘      └─────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│                   Estado Actualizado                              │
│  • dashboardData                                                  │
│  • proyectos, proveedores, categorias                             │
│  • loading = false                                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              Componentes se Renderizan                            │
│  • SuministrosFilters (recibe proyectos, proveedores, etc.)      │
│  • SuministrosStatsCards (recibe estadisticas)                   │
│  • SuministrosCharts (recibe dashboardData)                      │
│  • SuministrosTable (recibe materiales)                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              Usuario Interactúa                                   │
│  • Cambia filtros                                                 │
│  • Ordena tabla                                                   │
│  • Exporta reporte                                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐
│  handleFilterChange │      │  Otras acciones     │
│  (en hook)          │      │  (locales)          │
└─────────────────────┘      └─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Debounce 500ms     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  cargarDashboard    │
│  (con nuevos filtros)│
└─────────────────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────────┐
│              Componentes se Re-renderizan                         │
│              con Nuevos Datos                                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Exportación

```
┌──────────────────────────────────────────────────────────────────┐
│            Usuario Click en Botón de Exportación                 │
└────────────────────────┬─────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────────┐      ┌─────────────────────┐
│  Exportación Rápida │      │  Exportación        │
│  • PDF              │      │  Personalizada      │
│  • Excel            │      │  • Abre Modal       │
└─────────────────────┘      └─────────────────────┘
         │                               │
         │                               ▼
         │                   ┌─────────────────────┐
         │                   │ Usuario Configura:  │
         │                   │ • Título            │
         │                   │ • Contenido         │
         │                   │ • Gráficos          │
         │                   └─────────────────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              API Call a Backend                                   │
│  • exportDashboardSuministrosToPDF()                             │
│  • exportDashboardSuministrosToExcel()                           │
│  • exportDashboardCustomToPDF()                                  │
│  • exportDashboardCustomToExcel()                                │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              Backend Genera Archivo                               │
│  • Procesa datos                                                  │
│  • Genera PDF/Excel                                               │
│  • Retorna Blob                                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│              Frontend Descarga Archivo                            │
│  • Crea URL temporal                                              │
│  • Crea elemento <a>                                              │
│  • Trigger download                                               │
│  • Limpia recursos                                                │
└──────────────────────────────────────────────────────────────────┘
```

---

## Responsabilidades por Componente

### **SuministrosReportsTab**
- ✅ Orquestar todos los subcomponentes
- ✅ Gestionar estado global con hook
- ✅ Manejar estados de carga y error
- ✅ Proporcionar layout y estructura

### **useSuministrosData**
- ✅ Cargar datos iniciales
- ✅ Gestionar filtros con debounce
- ✅ Hacer llamadas a API
- ✅ Manejar errores y fallbacks
- ✅ Proporcionar funciones de actualización

### **SuministrosStatsCards**
- ✅ Mostrar métricas clave
- ✅ Formatear valores (moneda, números)
- ✅ Diseño visual atractivo
- ✅ Responsive grid

### **SuministrosFilters**
- ✅ Renderizar controles de filtro
- ✅ Validar entradas
- ✅ Comunicar cambios al padre
- ✅ Mostrar indicadores de filtros activos

### **SuministrosCharts**
- ✅ Configurar gráficas de Chart.js
- ✅ Procesar datos para visualización
- ✅ Manejar estados vacíos
- ✅ Proporcionar tooltips personalizados

### **SuministrosTable**
- ✅ Renderizar tabla de datos
- ✅ Implementar ordenamiento
- ✅ Implementar paginación
- ✅ Formatear valores de celdas

### **SuministrosExport**
- ✅ Proporcionar botones de exportación
- ✅ Gestionar modal de configuración
- ✅ Hacer llamadas a API de exportación
- ✅ Manejar descarga de archivos

---

## Patrones de Diseño Utilizados

### 1. **Container/Presentational Pattern**
- **Container:** `SuministrosReportsTab` (lógica)
- **Presentational:** Componentes en `/suministros` (UI)

### 2. **Custom Hook Pattern**
- `useSuministrosData` encapsula lógica de datos
- Reutilizable en otros contextos
- Separación de concerns

### 3. **Compound Components**
- Componentes trabajan juntos pero son independientes
- Cada uno tiene responsabilidad única
- Fácil composición

### 4. **Render Props (implícito)**
- Componentes reciben datos como props
- No manejan lógica de negocio
- Fácil testing

### 5. **Barrel Export Pattern**
- `index.js` centraliza exports
- Importaciones limpias
- Mejor organización

---

## Principios SOLID Aplicados

### **S - Single Responsibility**
✅ Cada componente tiene una responsabilidad única
- StatsCards: Solo mostrar métricas
- Filters: Solo gestionar filtros
- Charts: Solo visualizar datos
- Table: Solo mostrar tabla
- Export: Solo exportar

### **O - Open/Closed**
✅ Componentes abiertos a extensión, cerrados a modificación
- Fácil agregar nuevas métricas sin cambiar StatsCards
- Fácil agregar nuevas gráficas sin cambiar Charts

### **L - Liskov Substitution**
✅ Componentes intercambiables
- Cualquier componente de gráfica puede reemplazar a otro
- Props consistentes

### **I - Interface Segregation**
✅ Props específicas por componente
- Componentes no reciben props innecesarias
- Interfaces mínimas y claras

### **D - Dependency Inversion**
✅ Componentes dependen de abstracciones
- Hook proporciona interfaz abstracta
- Componentes no conocen implementación de API

---

## Performance Optimizations

### 1. **Debouncing**
```javascript
// En useSuministrosData
useEffect(() => {
  const timeoutId = setTimeout(() => {
    cargarDashboard();
  }, 500);
  return () => clearTimeout(timeoutId);
}, [cargarDashboard]);
```

### 2. **Memoization**
```javascript
// En SuministrosTable
const sortedMateriales = React.useMemo(() => {
  // ... lógica de ordenamiento
}, [materiales, sortConfig]);
```

### 3. **Lazy Loading**
- Componentes se cargan solo cuando se necesitan
- Gráficas se renderizan solo si hay datos

### 4. **Conditional Rendering**
```javascript
{chartConsumoProyecto ? (
  <Bar data={chartConsumoProyecto} />
) : (
  <EmptyState />
)}
```

---

## Testing Strategy

### Unit Tests
```javascript
// Ejemplo para SuministrosStatsCards
describe('SuministrosStatsCards', () => {
  it('renders all 6 metric cards', () => {
    // ...
  });
  
  it('formats currency correctly', () => {
    // ...
  });
  
  it('handles missing data gracefully', () => {
    // ...
  });
});
```

### Integration Tests
```javascript
// Ejemplo para SuministrosReportsTab
describe('SuministrosReportsTab', () => {
  it('loads data on mount', () => {
    // ...
  });
  
  it('updates charts when filters change', () => {
    // ...
  });
  
  it('handles API errors', () => {
    // ...
  });
});
```

### E2E Tests
```javascript
// Ejemplo con Playwright/Cypress
describe('Suministros Reports', () => {
  it('allows user to filter and export report', () => {
    // 1. Navigate to reports
    // 2. Apply filters
    // 3. Verify charts update
    // 4. Click export
    // 5. Verify download
  });
});
```

---

## Conclusión

Esta arquitectura modular proporciona:
- ✅ Código mantenible y escalable
- ✅ Componentes reutilizables
- ✅ Separación clara de responsabilidades
- ✅ Performance optimizado
- ✅ Fácil testing
- ✅ Documentación completa
- ✅ Preparado para crecimiento futuro
