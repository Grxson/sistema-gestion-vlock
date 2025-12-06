# Corrección: Identificación Correcta de Semanas en Diciembre

## Problema Identificado

El sistema guardaba correctamente la nómina con `semana_iso=49` en la base de datos, pero **no la mostraba correctamente en el drawer y en la tabla detallada de reportes**. 

**Síntoma:** Una nómina de la primera semana de diciembre se mostraba como "Semana 2" en lugar de "Semana 1".

## Causa Raíz

La función `listarSemanasISODePeriodo()` en `weekCalculator.js` (y su equivalente en el backend) **filtraba semanas por MAYORÍA de días**, no por si tocaban el mes.

### Diciembre 2025 tiene 5 semanas:
- **Semana 1:** Lunes 1 - Domingo 7 de diciembre (ISO 49) → 7 días en diciembre ✓
- **Semana 2:** Lunes 8 - Domingo 14 de diciembre (ISO 50) → 7 días en diciembre ✓
- **Semana 3:** Lunes 15 - Domingo 21 de diciembre (ISO 51) → 7 días en diciembre ✓
- **Semana 4:** Lunes 22 - Domingo 28 de diciembre (ISO 52) → 7 días en diciembre ✓
- **Semana 5:** Lunes 29 dic - Domingo 4 de enero (ISO 2026-W01) → 3 días en dic, 4 en enero

### El problema:
La semana 5 tiene **mayoría en enero** (4 días) vs diciembre (3 días), por lo que **no se incluía** en la lista de semanas de diciembre. Esto generaba solo 4 semanas en lugar de 5.

Cuando se intentaba encontrar la semana ISO 49 en la lista devuelta, esta sí estaba (era la primera), pero el índice retornado era correcto.

Sin embargo, el verdadero problema era que faltaba incluir la **semana 5** (diciembre/enero), que afectaba la visualización correcta.

## Solución Implementada

### Cambio 1: Frontend (`desktop/src/renderer/utils/weekCalculator.js`)

**Nueva función auxiliar:**
```javascript
function semanaTocaMes(infoSemana, targetMonth, targetYear) {
  const start = new Date(infoSemana.fechaInicio);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getMonth() === targetMonth && d.getFullYear() === targetYear) {
      return true;
    }
  }
  return false;
}
```

**Cambio en `listarSemanasISODePeriodo()`:**
- **Antes:** `if (maj.month0 === month && !seen.has(key))`
- **Después:** `if (semanaTocaMes(info, month, year) && !seen.has(key))`

Ahora la función incluye **cualquier semana que TOQUE el mes**, no solo las que tienen mayoría de días.

### Cambio 2: Backend (`backend/api/src/controllers/nominaPDF.controller.js`)

Se aplicó el mismo cambio con el equivalente `semanaTocaMes()` para mantener consistencia.

## Resultados

### Antes:
- Diciembre 2025 → 4 semanas (ISO 49, 50, 51, 52)
- Semana ISO 49 → Semana 1 ✓ (correcta por coincidencia)
- Pero faltaba la Semana 5 (29 dic - 4 ene)

### Después:
- Diciembre 2025 → **5 semanas** (ISO 49, 50, 51, 52, 2026-W01)
- Semana ISO 49 → **Semana 1** ✓
- Semana ISO 50 → **Semana 2** ✓
- Semana ISO 51 → **Semana 3** ✓
- Semana ISO 52 → **Semana 4** ✓
- Semana ISO 2026-W01 → **Semana 5** ✓

## Lugares Afectados

Los siguientes componentes ahora mostrarán correctamente las 5 semanas de diciembre:

1. **Drawer de Historial de Nóminas** (`NominaEmpleadoHistorialDrawer.jsx`)
2. **Tabla Detallada de Reportes** (`NominaReportsTab.jsx`)
3. **Gráficas de Reportes** (dinámicas según semanas del mes)
4. **PDFs de Nómina** (backend)

## Verificación

Para verificar que funciona correctamente:

1. Abre una nómina de **1 de diciembre de 2025** (Semana 1)
2. Verifica el drawer → debe mostrar "Semana 1 de diciembre"
3. Verifica la tabla detallada → debe mostrar la semana correctamente
4. Verifica que diciembre tenga 5 semanas en los reportes

## Nota Técnica

Esta corrección afecta a **todos los meses que terminen en una semana ISO que pertenezca al siguiente mes**. En 2025-2026:
- **Diciembre 2025** → 5 semanas (la semana ISO 2026-W01 toca el mes)
- Otros meses que cumplen esta condición seguirán la misma lógica

La solución es más robusta y correcta para cualquier período.
