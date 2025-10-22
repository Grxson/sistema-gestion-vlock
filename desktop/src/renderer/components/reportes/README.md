# Módulo de Reportes de Suministros

## 📋 Descripción General

Este módulo proporciona una ventana optimizada de reportes para el módulo de Suministros, con una arquitectura modular, componentes reutilizables y una experiencia de usuario mejorada.

## 🏗️ Arquitectura Modular

### Estructura de Directorios

```
reportes/
├── README.md                          # Este archivo
├── SuministrosReportsTab.jsx          # Componente principal
└── suministros/                       # Componentes modulares
    ├── index.js                       # Barrel export
    ├── SuministrosStatsCards.jsx      # Tarjetas de estadísticas
    ├── SuministrosFilters.jsx         # Filtros dinámicos
    ├── SuministrosCharts.jsx          # Gráficas múltiples
    ├── SuministrosTable.jsx           # Tabla con ordenamiento
    └── SuministrosExport.jsx          # Exportación PDF/Excel

hooks/reportes/
└── useSuministrosData.js              # Hook personalizado para datos
```

## 🧩 Componentes

### 1. **SuministrosReportsTab** (Principal)
Componente contenedor que integra todos los módulos.

**Características:**
- Gestión centralizada de estado mediante custom hook
- Manejo de estados de carga y error
- Layout responsivo
- Integración de todos los subcomponentes

**Uso:**
```jsx
import SuministrosReportsTab from './reportes/SuministrosReportsTab';

<SuministrosReportsTab />
```

---

### 2. **SuministrosStatsCards**
Tarjetas de estadísticas con métricas clave.

**Props:**
- `estadisticas` (Object): Objeto con métricas del dashboard

**Métricas mostradas:**
- Total Gastado
- Total Registros
- Proveedores Activos
- Proyectos
- Promedio de Gasto
- Proveedor Principal

**Características:**
- Diseño con gradientes
- Iconos descriptivos
- Formato de moneda automático
- Responsive grid (1-6 columnas)

---

### 3. **SuministrosFilters**
Panel de filtros dinámicos para búsqueda avanzada.

**Props:**
- `filtros` (Object): Estado actual de filtros
- `onFilterChange` (Function): Callback para cambios
- `onLimpiarFiltros` (Function): Callback para limpiar
- `proyectos` (Array): Lista de proyectos
- `proveedores` (Array): Lista de proveedores
- `categorias` (Array): Lista de categorías

**Filtros disponibles:**
- Fecha inicio/fin (DateInput)
- Proyecto (Select)
- Proveedor (Select)
- Categoría (Select)

**Características:**
- Indicador de filtros activos
- Botón de limpieza rápida
- Validación automática

---

### 4. **SuministrosCharts**
Múltiples visualizaciones de datos.

**Props:**
- `dashboardData` (Object): Datos del dashboard

**Gráficas incluidas:**
1. **Costo por Proyecto** (Barras)
   - Muestra gastos por obra
   - Colores diferenciados
   - Tooltips con formato de moneda

2. **Distribución por Proveedores** (Dona)
   - Top 8 proveedores
   - Porcentajes automáticos
   - Leyenda inferior

3. **Evolución de Gastos Mensuales** (Línea)
   - Tendencia temporal
   - Área rellena
   - Puntos interactivos

4. **Distribución por Categorías** (Pie)
   - Agrupación por categoría
   - Top 6 categorías
   - Colores consistentes

**Características:**
- Estados vacíos informativos
- Configuración consistente
- Responsive
- Tooltips personalizados

---

### 5. **SuministrosTable**
Tabla detallada con funcionalidades avanzadas.

**Props:**
- `materiales` (Array): Lista de materiales

**Características:**
- **Ordenamiento:** Click en columnas para ordenar
- **Paginación:** 10 items por página
- **Columnas:**
  - Material (con unidad de medida)
  - Categoría (badge)
  - Frecuencia
  - Cantidad Total
  - Costo Total

**Funcionalidades:**
- Ordenamiento ascendente/descendente
- Indicadores visuales de ordenamiento
- Hover effects
- Estados vacíos

---

### 6. **SuministrosExport**
Sistema de exportación con configuración personalizada.

**Props:**
- `dashboardData` (Object): Datos a exportar
- `filtros` (Object): Filtros aplicados

**Modos de exportación:**

1. **Exportación Rápida:**
   - Botón PDF: Genera reporte estándar
   - Botón Excel: Genera hoja de cálculo

2. **Exportación Personalizada:**
   - Modal de configuración
   - Título y subtítulo personalizables
   - Selección de contenido:
     - Filtros aplicados
     - Estadísticas generales
     - Gráficos individuales
     - Tabla de datos

**Características:**
- Estados de carga
- Descarga automática
- Manejo de errores
- UI intuitiva

---

## 🎣 Custom Hook: useSuministrosData

Hook personalizado que centraliza la lógica de datos.

**Retorna:**
```javascript
{
  // Datos
  dashboardData,      // Datos del dashboard
  proyectos,          // Lista de proyectos
  proveedores,        // Lista de proveedores
  categorias,         // Lista de categorías
  
  // Estados
  loading,            // Estado de carga
  error,              // Mensaje de error
  
  // Filtros
  filtros,            // Estado de filtros
  handleFilterChange, // Actualizar filtro
  limpiarFiltros,     // Limpiar todos
  
  // Acciones
  recargarDatos       // Recargar manualmente
}
```

**Características:**
- Carga inicial automática
- Debounce en filtros (500ms)
- Manejo de errores
- Datos de fallback
- Memoización

---

## 🎨 Diseño y UX

### Paleta de Colores
- **Azul:** Proyectos, principal
- **Verde:** Registros, Excel
- **Púrpura:** Proveedores
- **Naranja:** Proyectos (secundario)
- **Índigo:** Promedios
- **Amarillo:** Destacados
- **Rojo:** PDF, alertas

### Responsividad
- **Mobile:** 1 columna
- **Tablet:** 2 columnas
- **Desktop:** 3-6 columnas (según componente)

### Dark Mode
Todos los componentes soportan tema oscuro automáticamente.

---

## 🚀 Integración

### En Reportes.jsx
```jsx
import SuministrosReportsTab from './reportes/SuministrosReportsTab';

const renderContent = () => {
  switch (activeTab) {
    case 'suministros':
      return <SuministrosReportsTab />;
    // ...
  }
};
```

---

## 📊 Flujo de Datos

```
useSuministrosData Hook
    ↓
    ├─→ API: getDashboardSuministros(filtros)
    ├─→ API: getProyectos()
    ├─→ API: getActiveProveedores()
    ↓
SuministrosReportsTab
    ↓
    ├─→ SuministrosFilters (filtros)
    ├─→ SuministrosStatsCards (estadisticas)
    ├─→ SuministrosCharts (dashboardData)
    ├─→ SuministrosTable (materiales)
    └─→ SuministrosExport (dashboardData, filtros)
```

---

## 🔧 Mantenimiento

### Agregar nueva métrica en StatsCards
1. Editar `SuministrosStatsCards.jsx`
2. Agregar objeto al array `stats`
3. Definir: title, value, icon, gradient, iconBg, textColor

### Agregar nueva gráfica
1. Editar `SuministrosCharts.jsx`
2. Preparar datos en formato Chart.js
3. Agregar sección en el grid
4. Incluir estado vacío

### Agregar nueva columna en tabla
1. Editar `SuministrosTable.jsx`
2. Agregar `<th>` en thead con `onClick={handleSort}`
3. Agregar `<td>` en tbody con formato
4. Actualizar lógica de ordenamiento si es necesario

---

## ✅ Ventajas de la Arquitectura Modular

1. **Mantenibilidad:** Cada componente tiene responsabilidad única
2. **Reutilización:** Componentes pueden usarse en otros contextos
3. **Testabilidad:** Fácil crear tests unitarios
4. **Escalabilidad:** Agregar funcionalidades sin afectar otros módulos
5. **Legibilidad:** Código organizado y documentado
6. **Performance:** Optimizaciones específicas por componente

---

## 🐛 Solución de Problemas Comunes

### Datos no se cargan
- Verificar que el backend `/reportes/dashboard-suministros` esté activo
- Revisar console para errores de API
- Verificar token de autenticación

### Filtros no funcionan
- Verificar que `handleFilterChange` se pase correctamente
- Revisar debounce en el hook (500ms)
- Verificar formato de datos en filtros

### Exportación falla
- Verificar endpoints de exportación en backend
- Revisar permisos de descarga en navegador
- Verificar que `dashboardData` tenga datos

### Gráficas vacías
- Verificar estructura de `dashboardData`
- Revisar que los arrays no estén vacíos
- Verificar nombres de propiedades (consumoPorObra, distribicionProveedores, etc.)

---

## 📝 Notas Adicionales

- Los componentes usan TailwindCSS para estilos
- Chart.js debe estar registrado globalmente
- DateInput es un componente UI reutilizable
- Los iconos vienen de react-icons/fa

---

## 🔮 Mejoras Futuras

- [ ] Agregar más tipos de gráficas (radar, scatter)
- [ ] Implementar comparativas entre períodos
- [ ] Agregar predicciones con ML
- [ ] Exportación a más formatos (CSV, JSON)
- [ ] Guardado de configuraciones de reporte
- [ ] Compartir reportes por email
- [ ] Programación de reportes automáticos
- [ ] Integración con nómina para gastos totales
