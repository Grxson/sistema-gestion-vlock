# Correcciones de UI en Nóminas

## Problemas Resueltos

### 1. ✅ Semana Incorrecta en Tab de Historial

**Ubicación:** `desktop/src/renderer/components/Nomina.jsx` (línea ~1373)

**Problema:** 
La tabla de historial de nóminas (tab "Historial") mostraba números de semana incorrectos, igual que el drawer individual. El sistema estaba **recalculando** la semana del mes en lugar de usar el valor original guardado.

**Solución:**
Implementé la misma lógica de **3 niveles de prioridad** que ya tenían los otros componentes:

```javascript
const semanaMes = (() => {
  try {
    // PRIORIDAD 1: Usar valor directo si existe (nuevo campo guardado)
    if (n?.semana && typeof n.semana === 'number') {
      return n.semana;
    }
    
    // PRIORIDAD 2: Si viene del join con semanas_nomina
    if (n?.semana?.semana_mes && typeof n.semana.semana_mes === 'number') {
      return n.semana.semana_mes;
    }
    
    // PRIORIDAD 3: Recalcular desde semana ISO (fallback para nóminas antiguas)
    // ... lógica de cálculo ISO
  } catch { return '—'; }
})();
```

**Resultado:**
- ✅ Las nóminas nuevas muestran la semana correcta (1-5)
- ✅ Las nóminas antiguas siguen funcionando con el fallback
- ✅ Consistencia entre drawer, historial y reportes

---

### 2. ✅ Mostrar/Ocultar Filtros en Tabla Detallada

**Ubicación:** `desktop/src/renderer/components/nomina/NominaReportsTab.jsx`

**Problema:**
El tab "Tabla Detallada" mostraba siempre los filtros (rango de fechas, proyecto, estado, búsqueda), ocupando mucho espacio visual y haciendo que el usuario tenga que hacer scroll para ver la tabla.

**Solución:**
Agregué un botón toggle para mostrar/ocultar los filtros con persistencia en localStorage:

**Cambios realizados:**

1. **Estado nuevo con persistencia:**
```javascript
const [showFiltersDetailed, setShowFiltersDetailed] = useState(() => {
  try {
    const saved = localStorage.getItem('nominaTablaDetallada_showFilters');
    return saved ? JSON.parse(saved) : true;
  } catch {
    return true;
  }
});
```

2. **Guardar preferencia:**
```javascript
useEffect(() => {
  try {
    localStorage.setItem('nominaTablaDetallada_showFilters', JSON.stringify(showFiltersDetailed));
  } catch {}
}, [showFiltersDetailed]);
```

3. **Botón toggle en el header:**
```javascript
<button
  onClick={() => setShowFiltersDetailed(!showFiltersDetailed)}
  className="inline-flex items-center px-3 py-2 bg-gray-100 dark:bg-slate-700..."
>
  <svg>...</svg>
  {showFiltersDetailed ? 'Ocultar' : 'Mostrar'} Filtros
</button>
```

4. **Filtros envueltos en condicional:**
```javascript
{showFiltersDetailed && (
  <div className="bg-white dark:bg-gray-800 rounded-lg...">
    {/* Filtros: DateRangePicker, Proyecto, Estado, Búsqueda */}
  </div>
)}
```

**Resultado:**
- ✅ Botón visible en el header junto a "Exportar Excel" y "Columnas"
- ✅ Al hacer clic oculta/muestra los filtros
- ✅ La preferencia se guarda en localStorage
- ✅ UI más limpia cuando no se necesitan los filtros
- ✅ Los filtros siguen funcionando aunque estén ocultos

---

### 3. ✅ Suma de Sueldo Base en lugar de Total a Pagar

**Ubicación:** `desktop/src/renderer/components/nomina/NominaReportsTab.jsx` (línea ~2108)

**Problema:**
En la fila de totales de la "Tabla Detallada", la columna "Total" mostraba la **suma de todos los montos totales a pagar** (incluyendo horas extra, bonos, deducciones, etc.). 

El usuario quería ver la **suma de los sueldos base** para tener una métrica más clara del costo base de nómina.

**Solución:**
Cambié el cálculo de la celda de totales para sumar `pago_semanal` en lugar de `monto_total`:

**Antes:**
```javascript
{visibleCols.total && (
  <td className="px-3 py-4 whitespace-nowrap">
    <div className="text-lg font-bold text-green-600 dark:text-green-400">
      {formatCurrency(filteredNominas.reduce((total, nomina) => {
        const monto = parseFloat(nomina.monto_total || nomina.monto);
        return total + (isNaN(monto) ? 0 : monto);
      }, 0))}
    </div>
  </td>
)}
```

**Después:**
```javascript
{visibleCols.total && (
  <td className="px-3 py-4 whitespace-nowrap">
    <div className="text-lg font-bold text-green-600 dark:text-green-400">
      {formatCurrency(filteredNominas.reduce((total, nomina) => {
        const sueldoBase = parseFloat(nomina.pago_semanal || 0);
        return total + (isNaN(sueldoBase) ? 0 : sueldoBase);
      }, 0))}
    </div>
    <div className="text-xs text-gray-500 dark:text-gray-400">Suma de sueldos base</div>
  </td>
)}
```

**Resultado:**
- ✅ La fila de totales ahora muestra la suma de sueldos base (`pago_semanal`)
- ✅ Se agregó un texto aclaratorio: "Suma de sueldos base"
- ✅ Métricas más claras para análisis de costos base de nómina
- ✅ Las otras columnas (Hrs Extra, Bonos, Deducciones) mantienen sus totales correctos

---

## Archivos Modificados

```
desktop/src/renderer/components/Nomina.jsx
desktop/src/renderer/components/nomina/NominaReportsTab.jsx
```

## Comportamiento Esperado

### Tab Historial (Nomina.jsx)
1. Crear una nómina en "Semana 1"
2. Ir al tab "Historial"
3. **Debe aparecer como "Semana 1"** (no "Semana 2")

### Tab Reportes > Tabla Detallada
1. Abrir el tab "Reportes"
2. Ir a la sub-pestaña "Tabla Detallada"
3. **Botón "Ocultar Filtros"** visible en el header
4. Al hacer clic, los filtros desaparecen
5. Al hacer clic de nuevo, los filtros reaparecen
6. La preferencia se mantiene al refrescar la página
7. **Fila de totales** muestra la suma de sueldos base con etiqueta aclaratoria

## Pruebas Recomendadas

### Semana del Mes
- [ ] Crear nómina en Semana 1 → verificar en drawer
- [ ] Verificar en tab Historial → debe mostrar Semana 1
- [ ] Verificar en Tabla Detallada → debe mostrar Semana 1
- [ ] Verificar nóminas antiguas → deben seguir mostrándose correctamente

### Filtros Tabla Detallada
- [ ] Abrir Tabla Detallada → filtros visibles por defecto
- [ ] Hacer clic en "Ocultar Filtros" → filtros desaparecen
- [ ] Refrescar página → filtros siguen ocultos (persistencia)
- [ ] Hacer clic en "Mostrar Filtros" → filtros reaparecen
- [ ] Aplicar filtros estando ocultos → tabla se actualiza correctamente

### Suma de Totales
- [ ] Ver fila de totales en Tabla Detallada
- [ ] Columna "Total" debe mostrar suma de sueldos base
- [ ] Debe aparecer texto "Suma de sueldos base"
- [ ] Comparar con suma manual de columna "Sueldo Base"
- [ ] Exportar a Excel → verificar que columna sigue siendo "Total a Pagar" (no afectado)

## Notas Técnicas

### Persistencia de Preferencias
- `nominaTablaDetallada_showFilters`: Estado de visibilidad de filtros (localStorage)
- `nominaTablaDetallada_visibleCols`: Columnas visibles (ya existía)

### Retrocompatibilidad
- Nóminas antiguas sin campo `semana` directo siguen funcionando con el cálculo ISO
- El cambio de suma no afecta exportaciones ni otros reportes
- Los filtros funcionan independientemente de su visibilidad

### Dark Mode
- ✅ Botón "Ocultar/Mostrar Filtros" tiene estilos para dark mode
- ✅ Texto aclaratorio "Suma de sueldos base" tiene estilos para dark mode

---

**Estado:** ✅ Completado y listo para probar
**Impacto:** Bajo riesgo - cambios visuales y de UX sin afectar lógica de negocio
**Compatibilidad:** Totalmente compatible con datos existentes
