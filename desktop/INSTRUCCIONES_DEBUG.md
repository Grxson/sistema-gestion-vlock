# 🔍 Instrucciones de Debugging - Discrepancia en Totales

## Problema Identificado

**Base de Datos (Correcto):**
- Gastos de Proyectos: $3,016,070.19
- Gastos Administrativos: $101,873.00
- Nóminas: $29,112.67
- **Total: $3,147,055.86**

**Frontend UI (Incorrecto):**
- Gastos de Proyectos: $3,209,786.79 ❌
- Gastos Administrativos: $101,873.00 ✅
- Nóminas: $29,112.67 ✅
- **Total: $3,340,772.46** ❌

**Diferencia:** $193,716.60

## Causa Probable

La base de datos tiene registros con **folios duplicados legítimos** (mismo recibo, múltiples items). La BD suma correctamente, pero el frontend puede estar:
1. Duplicando registros al procesarlos
2. Contando el mismo registro múltiples veces
3. Teniendo datos en caché obsoletos

## Pasos para Debuggear

### 1. Limpiar Caché del Navegador

```bash
# Opción 1: Desde DevTools
# - Abre DevTools (F12)
# - Application tab → Storage → Clear site data

# Opción 2: Hard Reload
# - Ctrl + Shift + R (Linux/Windows)
# - Cmd + Shift + R (Mac)
```

### 2. Verificar Logs en Consola

Ahora el código tiene logs detallados en `calculateGeneralStats`. Abre DevTools y busca:

```
📊 ═══════════════════════════════════════════════════════
📊 RESUMEN DE CÁLCULO - STATS GENERALES
📊 ═══════════════════════════════════════════════════════
```

Esto te mostrará:
- Cantidad exacta de registros de cada tipo
- Total sumado de cada tipo
- Primeros 5 registros de cada categoría con ID, folio y monto
- Comparación directa con valores de BD

### 3. Buscar Duplicados en el Array

En la consola del navegador, ejecuta:

```javascript
// Ver total de suministros cargados
console.log('Total suministros:', window.__REACT_DEVTOOLS_GLOBAL_HOOK__);

// Verificar duplicados por ID
const suministros = /* obtener del estado React */;
const ids = suministros.map(s => s.id_suministro);
const duplicados = ids.filter((id, index) => ids.indexOf(id) !== index);
console.log('IDs duplicados:', duplicados);

// Verificar duplicados por folio
const folios = suministros.map(s => s.folio).filter(f => f);
const foliosDuplicados = folios.filter((f, i) => folios.indexOf(f) !== i);
console.log('Folios que aparecen múltiples veces:', [...new Set(foliosDuplicados)]);
```

### 4. Comparar con la BD

Ya ejecutaste los scripts de diagnóstico:
- ✅ `diagnostico-suministros.js` - Mostró totales de BD
- ✅ `verificar-discrepancia.js` - Identificó folios duplicados legítimos

Los **folios duplicados en BD son correctos** (ejemplo: folio 43087 aparece 5 veces porque son 5 items diferentes del mismo recibo).

### 5. Verificar el Endpoint de la API

Prueba directamente el endpoint:

```bash
# Desde el navegador o Postman/Thunder Client
GET http://localhost:4000/api/suministros
Authorization: Bearer <tu_token>

# Verificar que la respuesta tenga exactamente 213 registros
# (192 Proyecto + 21 Admin = 213 total)
```

### 6. Revisar useCombinedTableData

El hook combina suministros + nóminas. Verifica que no esté duplicando:

```javascript
// En la consola, después de que carguen los datos:
console.log('Combined data length:', combinedData.length);
console.log('Suministros length:', suministros.length);
console.log('Nomina rows length:', nominaRows.length);

// Debe cumplir: combinedData.length = suministros.length + nominaRows.length
```

## Soluciones Posibles

### Si hay duplicación en el frontend:

**Opción A: Deduplicate por ID**
```javascript
const suministrosUnicos = Array.from(
  new Map(suministros.map(s => [s.id_suministro, s])).values()
);
```

**Opción B: Verificar que loadData no se llame múltiples veces**
```javascript
// Agregar log en loadData
console.log('🔄 loadData ejecutándose...');
```

### Si la API está devolviendo duplicados:

Revisar el controller `getSuministros` en:
```
backend/api/src/controllers/suministros.controller.js
```

Verificar que no haya JOIN que duplique registros.

## Resultado Esperado

Después de aplicar la solución, los logs deben mostrar:

```
📦 Registros Proyecto: 192 | Total: $3,016,070.19
🏢 Registros Admin: 21 | Total: $101,873.00
💼 Nóminas: 13 | Total: $29,112.67

🔍 COMPARACIÓN CON BD:
   BD Proyectos: $3,016,070.19 vs Frontend: $3,016,070.19
   Diferencia: $0.00
```

## Contacto

Si después de seguir estos pasos el problema persiste, captura:
1. Screenshot de los logs en consola
2. Respuesta del endpoint `/api/suministros`
3. Valor de `suministros.length` en DevTools

Esto ayudará a identificar exactamente dónde está ocurriendo la duplicación.
