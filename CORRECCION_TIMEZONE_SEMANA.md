# Corrección: Bug de Zona Horaria en Cálculo de Semanas

**Fecha de Corrección:** 2024
**Commit:** cd79d14978516bce9d8f7ebe88fd065e077be468
**Estado:** ✅ RESUELTO

## Problema Reportado

El usuario reportó que las nóminas no mostraban correctamente el número de semana:

1. **Drawer:** Mostraba "-" en lugar del número de semana (ejemplo: debería mostrar "Semana 1" para Dec 6)
2. **Tabla Detallada:** Mostraba "Semana 5" cuando debería mostrar "Semana 1"

### Ejemplo Específico
- Nómina guardada para: **Diciembre 6, 2025** (Semana 1 de diciembre, ISO 2025-W49)
- Drawer mostraba: **"-"** (vacío)
- Tabla mostraba: **"Semana 5"** (incorrecto)

## Raíz del Problema: Bug de Zona Horaria

### Análisis Detallado

El backend guarda `fecha_inicio` en la BD como tipo `DATEONLY` (YYYY-MM-DD sin zona horaria):

```sql
fecha_inicio DATE = '2025-12-01'
```

Cuando se envía al frontend como string JSON `"2025-12-01"` y se parsea con:

```javascript
const d = new Date("2025-12-01");
```

JavaScript interpreta esto como **UTC medianoche** (00:00:00 UTC). Luego `getMonth()` se calcula en la **zona horaria local del navegador**.

### Ejemplo del Bug

En una zona horaria UTC-1:
```
UTC:    2025-12-01 00:00:00 UTC
Local:  2025-11-30 23:00:00 (¡NOVIEMBRE!)

d.getMonth() = 10  (noviembre, 0-indexed)
d.getMonth()+1 = 11

período = "2025-11"  ❌ (debería ser "2025-12")
```

### Consecuencia

Cuando se llamaba:
```javascript
semanaDelMesDesdeISO("2025-11", 2025, 49)
```

No encontraba la semana 49 en noviembre (porque está en diciembre), retornando `NaN` → mostraba "-"

## Solución Implementada

### 1. Crear Parser Seguro para DATEONLY

Se creó helper `parseDateOnly()` que parsea fechas YYYY-MM-DD sin ambigüedad de zona horaria:

```javascript
const parseDateOnly = (dateStr) => {
  if (!dateStr) return null;
  const match = String(dateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return { 
      year: parseInt(match[1], 10), 
      month: parseInt(match[2], 10),    // 1-12 (CIVIL)
      day: parseInt(match[3], 10) 
    };
  }
  return null;
};
```

**Ventajas:**
- Parsea directamente del string sin crear Date
- Devuelve mes 1-12 directamente (sin confusión 0-indexed)
- No depende de zona horaria del navegador

### 2. Archivos Modificados

#### a) `NominaEmpleadoHistorialDrawer.jsx`

**Cambios:**
1. Importar `calcularSemanaDelMes` (faltaba)
2. Agregar helper `parseDateOnly()`
3. Actualizar `getPeriodo()` para usar `parseDateOnly()`
4. Actualizar `getSemanaDelMes()` para usar `parseDateOnly()`

**Antes:**
```javascript
const d = new Date(fechaBase);
const periodo = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
```

**Después:**
```javascript
const parsed = parseDateOnly(fechaBase);
if (parsed) {
  periodo = `${parsed.year}-${String(parsed.month).padStart(2,'0')}`;
} else {
  // fallback a new Date si no es string ISO
}
```

#### b) `useCombinedTableData.js`

**Cambios:**
1. Agregar helper `parseDateOnly()`
2. Actualizar `formatNominaAsRow()` para usar `parseDateOnly()`

**Impacto:**
- Ahora calcula período correctamente para cada nómina
- Tabla muestra semana correcta (1-5)

### 3. Import Faltante

Se agregó `calcularSemanaDelMes` a los imports en `NominaEmpleadoHistorialDrawer.jsx`:

```javascript
import { semanaDelMesDesdeISO, calcularSemanaDelMes } from '../../utils/weekCalculator';
```

## Resultados de las Pruebas

### Test Final: Todos los Casos Pasaron ✅

| Nómina | fecha_inicio | ISO | Período | Resultado | Esperado | Estado |
|--------|--------------|-----|---------|-----------|----------|--------|
| Dic 6  | 2025-12-06   | 2025-W49 | 2025-12 | 1 | 1 | ✅ |
| Dic 13 | 2025-12-08   | 2025-W50 | 2025-12 | 2 | 2 | ✅ |
| Dic 22 | 2025-12-22   | 2025-W52 | 2025-12 | 4 | 4 | ✅ |
| Dic 29 | 2025-12-29   | 2026-W01 | 2025-12 | 5 | 5 | ✅ |

**Conclusión:** 4/4 tests pasados (100%)

### Semanas de Diciembre (Ahora Correctas)

```
1. ISO 2025-W49 (Semana 1)
2. ISO 2025-W50 (Semana 2)
3. ISO 2025-W51 (Semana 3)
4. ISO 2025-W52 (Semana 4)
5. ISO 2026-W01 (Semana 5)
```

## Impacto en la UI

### Drawer (NominaEmpleadoHistorialDrawer)

**Antes:**
- Columna "Semana" mostraba "-" para muchas nóminas

**Después:**
- ✅ Muestra número correcto (1-5)
- ✅ Consistente con la tabla detallada

### Tabla Detallada (NominaReportsTab)

**Antes:**
- Nómina del 6 de diciembre mostraba "Semana 5" (incorrecto)

**Después:**
- ✅ Muestra "Semana 1" (correcto)
- ✅ Todas las semanas numeradas correctamente

## Notas Técnicas

### Por Qué Sucedió

1. El código original usaba `new Date()` sin considerar que DATEONLY es una fecha sin zona horaria
2. JavaScript siempre interpreta strings ISO como UTC
3. `getMonth()` usa zona horaria local, causando desajustes

### Prevención Futura

Cuando trabajar con fechas DATEONLY (sin hora):
- ✅ Parsear el string directamente (como se hace ahora)
- ❌ NO usar `new Date()` directamente
- ❌ NO confiar en `getMonth()` con strings ISO

### Compatibilidad

El código mantiene fallback a `new Date()` si el string no es formato YYYY-MM-DD, asegurando compatibilidad con otros formatos de fecha.

## Verificación

Para verificar que el fix está funcionando:

1. Abrir drawer de un empleado con nóminas en diciembre
2. Verificar que la columna "Semana" muestre números 1-5 (no "-")
3. Abrir tabla detallada de nóminas
4. Verificar que nóminas de dic 6 muestren "Semana 1" (no "Semana 5")
5. Seleccionar período "2025-12" en filtros
6. Verificar que todas las 5 semanas se identifiquen correctamente
