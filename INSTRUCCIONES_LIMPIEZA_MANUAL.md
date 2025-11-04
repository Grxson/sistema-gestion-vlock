# Instrucciones Detalladas para Limpieza de Suministros.jsx
## MANUAL DE EJECUCIÓN PASO A PASO

Este archivo tiene **7771 líneas** y requiere eliminar aproximadamente **2500 líneas** de código relacionado con gráficas. Debido al tamaño, se recomienda hacerlo manualmente con un editor de código.

---

## 🔴 IMPORTANTE: HACER BACKUP PRIMERO

```bash
cd desktop/src/renderer/pages
cp Suministros.jsx Suministros.jsx.backup-$(date +%Y%m%d-%H%M%S)
```

---

## PASO 1: Eliminar función `loadChartData` (líneas 521-740)

### Ubicación: Línea ~521
### Buscar:
```javascript
  // Función para cargar datos de gráficas
  const loadChartData = async () => {
```

### Eliminar hasta:
```javascript
  }; // Fin de loadChartData
```

**Estimado:** ~220 líneas

---

## PASO 2: Eliminar TODAS las funciones `process*` (líneas 742-2620)

### Lista completa de funciones a eliminar:

1. **Línea 742:** `const processGastosPorMes`
2. **Línea 804:** `const processValorPorCategoria`
3. **Línea 914:** `const processSuministrosPorMes`
4. **Línea 947:** `const processGastosPorProyecto`
5. **Línea 988:** `const processGastosPorProveedor`
6. **Línea 1079:** `const processCantidadPorEstado`
7. **Línea 1167:** `const processDistribucionTipos`
8. **Línea 1278:** `const processAnalisisPorTipoGasto`
9. **Línea 1523:** `const processTendenciaEntregas`
10. **Línea 1619:** `const processCodigosProducto`
11. **Línea 1661:** `const processAnalisisTecnicoInteligente`
12. **Línea 1925:** `const processConcretoDetallado`
13. **Línea 1988:** `const processHorasPorMes`
14. **Línea 2031:** `const processHorasPorEquipo`
15. **Línea 2070:** `const processComparativoHorasVsCosto`
16. **Línea 2123:** `const processDistribucionUnidades`
17. **Línea 2164:** `const processCantidadPorUnidad`
18. **Línea 2197:** `const processValorPorUnidad`
19. **Línea 2239:** `const processComparativoUnidades`
20. **Línea 2284:** `const processTotalMetrosCubicos`
21. **Línea 2334:** `const processAnalisisUnidadesMedida`
22. **Línea 2419:** `const processGastosPorCategoriaDetallado`
23. **Línea 2541:** `const processAnalisisFrecuenciaSuministros`

### Método recomendado en VS Code:

1. Ctrl+G (ir a línea) → 742
2. Seleccionar desde `const processGastosPorMes` hasta el final de `processAnalisisFrecuenciaSuministros`
3. Eliminar todo el bloque
4. Buscar si quedan más funciones `process*`:
   - Ctrl+F → buscar "const process"
   - Eliminar cualquier coincidencia restante

**Estimado:** ~1880 líneas

---

## PASO 3: Eliminar funciones helper de gráficas (líneas ~2625-2900)

### Funciones a eliminar:

- `getChartColors`
- `getLineChartOptions`
- `getDoughnutChartOptions`
- `getBarChartOptions`
- `getPieChartOptions`
- Cualquier otra función relacionada con configuración de gráficas

### Método:
1. Después de eliminar las funciones process*, buscar estas funciones
2. Eliminar cada una completamente
3. **NOTA:** Estas funciones ahora están en `chartHelpers.js`

**Estimado:** ~200-300 líneas

---

## PASO 4: Eliminar estados de gráficas (líneas ~250-270)

### Buscar y eliminar:

```javascript
const [chartData, setChartData] = useState({
  gastosPorMes: null,
  valorPorCategoria: null,
  // ... etc
});

const [loadingCharts, setLoadingCharts] = useState(false);
```

### MANTENER:
```javascript
const [chartFilters, setChartFilters] = useState({...});
const [selectedCharts, setSelectedCharts] = useState({...});
```

**Estimado:** ~40-60 líneas

---

## PASO 5: Eliminar useEffects de carga de gráficas

### Buscar y eliminar useEffects que contengan:

```javascript
useEffect(() => {
  if (activeTab === 'reportes') {
    loadChartData();
  }
}, [...]);
```

### Método:
1. Buscar: `loadChartData()` en el archivo
2. Eliminar los useEffect que la llamen

**Estimado:** ~20-30 líneas

---

## PASO 6: Simplificar JSX de tab "reportes" (líneas ~4754-7000)

### Ubicación: Línea ~4754

### BUSCAR el bloque completo:

```jsx
{activeTab === 'reportes' && (
  <div className="bg-white dark:bg-dark-100 rounded-lg shadow-sm...">
    {/* TODO EL CÓDIGO DE GRÁFICAS AQUÍ */}
    {/* Panel de filtros */}
    {/* Selector de gráficas */}
    {/* Grid de gráficas con Line, Bar, Doughnut, etc. */}
  </div>
)}
```

### REEMPLAZAR CON:

```jsx
{activeTab === 'reportes' && (
  <ReportesTab
    suministros={suministros}
    proyectos={proyectos}
    proveedores={proveedores}
    categoriasDinamicas={categoriasDinamicas}
    chartFilters={chartFilters}
    setChartFilters={setChartFilters}
    selectedCharts={selectedCharts}
    setSelectedCharts={setSelectedCharts}
    showError={showError}
  />
)}
```

**Estimado:** ~500-1000 líneas eliminadas

---

## PASO 7: Verificar imports

### Eliminar estos imports SI NO SE USAN en otras partes:

```javascript
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
```

### MANTENER:
```javascript
import ReportesTab from '../components/suministros/ReportesTab';
```

### Verificar que ReportesTab esté importado:

Si no está, agregarlo en la sección de imports:
```javascript
import ReportesTab from '../components/suministros/ReportesTab';
```

---

## PASO 8: Verificar compilación

Después de todos los cambios:

```bash
# En la carpeta desktop/
npm run dev
```

O:
```bash
npm run build
```

Verificar que no haya errores de compilación.

---

## PASO 9: Verificar funcionalidad

1. ✅ La app inicia sin errores
2. ✅ La tab de "Gestión" funciona normalmente
3. ✅ La tab de "Gastos" funciona normalmente
4. ✅ La tab de "Reportes" carga el nuevo componente
5. ✅ Las gráficas se renderizan
6. ✅ Los filtros funcionan
7. ✅ El selector de gráficas funciona

---

## RESUMEN DE LÍNEAS A ELIMINAR

| Sección | Líneas aproximadas | Estimado eliminación |
|---------|-------------------|----------------------|
| loadChartData | 521-740 | ~220 líneas |
| Funciones process* | 742-2620 | ~1880 líneas |
| Funciones helper gráficas | 2625-2900 | ~275 líneas |
| Estados de gráficas | ~250-270 | ~50 líneas |
| useEffects | Varios | ~30 líneas |
| JSX de reportes | 4754-~5700 | ~900 líneas |
| **TOTAL** | | **~3355 líneas** |

---

## RESULTADO ESPERADO

### Antes:
- **7771 líneas totales**

### Después:
- **~4416 líneas** (reducción de ~3355 líneas)

---

## ⚠️ PRECAUCIONES

1. ✅ Hacer backup completo antes de empezar
2. ✅ NO eliminar funciones CRUD (crear, editar, eliminar suministros)
3. ✅ NO eliminar funciones de carga de datos (loadSuministros, loadProyectos, etc.)
4. ✅ MANTENER estados `chartFilters` y `selectedCharts`
5. ✅ MANTENER lógica de otras tabs (Gestión, Gastos)
6. ✅ Probar después de cada eliminación grande
7. ✅ Guardar cambios frecuentemente

---

## ALTERNATIVA: Usar script de línea de comandos

Si prefieres automatizar, puedes crear un script en Node.js:

```javascript
// cleanup-suministros.js
const fs = require('fs');

const file = 'desktop/src/renderer/pages/Suministros.jsx';
let content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

// Eliminar líneas específicas (ajustar números según sea necesario)
const linesToRemove = [];
// Agregar rangos: [inicio, fin]
linesToRemove.push([520, 740]);   // loadChartData
linesToRemove.push([741, 2620]);  // funciones process*
linesToRemove.push([2621, 2900]); // helpers
// ... etc

// Implementar lógica de eliminación
// ...

fs.writeFileSync(file, lines.join('\n'));
console.log('✅ Limpieza completada');
```

---

## CHECKLIST FINAL

- [ ] Backup creado
- [ ] loadChartData eliminada
- [ ] Todas las funciones process* eliminadas
- [ ] Funciones helper eliminadas
- [ ] Estados de gráficas eliminados
- [ ] useEffects de gráficas eliminados
- [ ] JSX de reportes simplificado con ReportesTab
- [ ] Imports limpiados
- [ ] ReportesTab importado correctamente
- [ ] Compilación exitosa
- [ ] App funciona correctamente
- [ ] Tab Gestión funciona
- [ ] Tab Gastos funciona
- [ ] Tab Reportes funciona con nuevo componente
- [ ] Gráficas se renderizan
- [ ] Filtros funcionan
- [ ] Selector funciona
- [ ] Archivo formateado (Prettier)
- [ ] Git commit realizado

---

**¿Necesitas ayuda?**
Consulta:
- `PLAN_REFACTORIZACION_GRAFICAS.md`
- `GUIA_LIMPIEZA_SUMINISTROS.md`
- `REFACTORIZACION_GRAFICAS_COMPLETADA.md`

**Estado actual:** Archivos nuevos creados y funcionando ✅  
**Próximo paso:** Limpieza manual de Suministros.jsx 🔄
