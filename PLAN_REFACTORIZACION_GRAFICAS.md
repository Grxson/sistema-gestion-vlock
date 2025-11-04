# Refactorización de Gráficas de Suministros - Plan de Implementación

## ✅ Completado

1. **Utilidades de gráficas** (`chartHelpers.js`)
   - `getChartColors()` - Colores según tema
   - `getLineChartOptions()` - Opciones para gráficas de línea
   - `getDoughnutChartOptions()` - Opciones para gráficas de dona
   - `getBarChartOptions()` - Opciones para gráficas de barras
   - `MetricsDisplay` - Componente para mostrar métricas

2. **Componente de filtros** (`SuministrosChartFilters.jsx`)
   - Filtros de fecha (inicio/fin)
   - Filtro por proyecto
   - Filtro por proveedor
   - Filtro por tipo de suministro
   - Filtro por estado
   - Botón de reset

3. **Componente selector de gráficas** (`SuministrosChartSelector.jsx`)
   - Agrupación por categorías
   - Checkboxes para cada gráfica
   - Botones "Todas" y "Ninguna" por categoría

## 📋 Pendiente

### 4. Hook personalizado `useChartData`

Crear: `desktop/src/renderer/hooks/useChartData.js`

Este hook debe contener TODAS las funciones de procesamiento de datos:
- `processGastosPorMes`
- `processValorPorCategoria`
- `processSuministrosPorMes`
- `processGastosPorProyecto`
- `processGastosPorProveedor`
- `processCantidadPorEstado`
- `processDistribucionTipos`
- `processAnalisisPorTipoGasto`
- `processTendenciaEntregas`
- `processCodigosProducto`
- `processAnalisisTecnicoInteligente`
- `processConcretoDetallado`
- `processHorasPorMes`
- `processHorasPorEquipo`
- `processComparativoHorasVsCosto`
- `processDistribucionUnidades`
- `processCantidadPorUnidad`
- `processValorPorUnidad`
- `processComparativoUnidades`
- `processTotalMetrosCubicos`
- `processAnalisisUnidadesMedida`
- `processGastosPorCategoriaDetallado`
- `processAnalisisFrecuenciaSuministros`

**Estructura del hook:**
```javascript
export const useChartData = (suministros, chartFilters, categoriasDinamicas, proyectos) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChartData();
  }, [suministros, chartFilters]);

  const loadChartData = async () => {
    // Procesar todos los datos
  };

  return { chartData, loading, loadChartData };
};
```

### 5. Componente `SuministrosChartsDisplay`

Crear: `desktop/src/renderer/components/suministros/SuministrosChartsDisplay.jsx`

Este componente debe renderizar TODAS las gráficas:
- Recibe `chartData` y `selectedCharts` como props
- Renderiza solo las gráficas seleccionadas
- Usa los componentes de Chart.js (Line, Bar, Doughnut)
- Incluye el componente `MetricsDisplay` de las utilidades
- Maneja el modal de gráficas expandidas

### 6. Actualizar `ReportesTab.jsx`

Integrar todos los componentes nuevos en el tab de reportes:

```javascript
import SuministrosChartFilters from './SuministrosChartFilters';
import SuministrosChartSelector from './SuministrosChartSelector';
import SuministrosChartsDisplay from './SuministrosChartsDisplay';
import { useChartData } from '../../hooks/useChartData';

const ReportesTab = ({ 
  suministros, 
  proyectos, 
  proveedores, 
  categoriasDinamicas,
  // ... otras props
}) => {
  const [chartFilters, setChartFilters] = useState({...});
  const [selectedCharts, setSelectedCharts] = useState({...});
  
  const { chartData, loading } = useChartData(
    suministros, 
    chartFilters, 
    categoriasDinamicas,
    proyectos
  );

  return (
    <div>
      <SuministrosChartFilters 
        chartFilters={chartFilters}
        setChartFilters={setChartFilters}
        proyectos={proyectos}
        proveedores={proveedores}
        categoriasDinamicas={categoriasDinamicas}
      />
      
      <SuministrosChartSelector 
        selectedCharts={selectedCharts}
        setSelectedCharts={setSelectedCharts}
      />
      
      <SuministrosChartsDisplay 
        chartData={chartData}
        selectedCharts={selectedCharts}
        loading={loading}
      />
    </div>
  );
};
```

### 7. Limpiar `Suministros.jsx`

Eliminar de Suministros.jsx:
- Todas las funciones `process*` (mover al hook)
- Funciones `getChartColors`, `getLineChartOptions`, etc. (ya en utilidades)
- Componente `MetricsDisplay` (ya en utilidades)
- Estados `chartData`, `chartFilters`, `selectedCharts` (moverlos a ReportesTab)
- Estado `loadingCharts` (manejado por el hook)
- Función `loadChartData` (ahora en el hook)
- Todos los efectos relacionados con gráficas
- Todo el JSX de renderizado de gráficas (moverlo a SuministrosChartsDisplay)

**Mantener en Suministros.jsx solo:**
- Lógica de suministros (CRUD)
- Estados de suministros, proyectos, proveedores
- Funciones de formulario
- Componentes de tabs (GastosTab, TablaGastosTab, ReportesTab)

## 🎯 Beneficios de esta refactorización

1. **Separación de responsabilidades**: Cada componente tiene una función clara
2. **Reusabilidad**: Los componentes de gráficas se pueden usar en otras partes
3. **Mantenibilidad**: Más fácil de encontrar y corregir código
4. **Performance**: Mejor optimización con componentes más pequeños
5. **Testing**: Más fácil de probar componentes individuales
6. **Tamaño de archivo**: Suministros.jsx será mucho más pequeño y legible

## 📦 Estructura de archivos resultante

```
desktop/src/renderer/
├── components/
│   └── suministros/
│       ├── GastosTab.jsx (existente)
│       ├── TablaGastosTab.jsx (existente)
│       ├── ReportesTab.jsx (actualizar)
│       ├── SuministrosChartFilters.jsx (✅ creado)
│       ├── SuministrosChartSelector.jsx (✅ creado)
│       └── SuministrosChartsDisplay.jsx (pendiente)
├── hooks/
│   └── useChartData.js (pendiente)
├── utils/
│   └── chartHelpers.js (✅ creado)
└── pages/
    └── Suministros.jsx (limpiar)
```

## ⚠️ Notas importantes

- El hook `useChartData` debe ser robusto y manejar errores
- Mantener los mismos nombres de funciones para facilitar la migración
- Las funciones helper (`getTituloAnalisisTecnico`, `getUnidadPrincipalCategoria`, etc.) también deben moverse al hook
- Asegurarse de que las dependencias de Chart.js están correctamente importadas
- Mantener la funcionalidad de exportación (PNG/PDF) en los componentes
