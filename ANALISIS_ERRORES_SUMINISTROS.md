# Análisis de Errores en Área de Suministros/Gastos

## Problema 1: No se actualizaban suministros individuales

**Problema Identificado**

❌ No se podía actualizar ningún dato de suministros/gastos. Cuando se hacía clic en la acción "editar", el sistema creaba un duplicado en lugar de actualizar.

### Causa Raíz

En la función `handleEdit` (línea 1517 de `Suministros.jsx`), solo se asignaba el suministro a `editingRecibo`, pero **NO** se asignaba a `editingSuministro`.

**El flujo de error:**
1. Al hacer clic en editar → `editingRecibo` se asigna ✅
2. Se abre el formulario → pero `editingSuministro` es `null` ❌
3. Al enviar → `handleMultipleSubmit` verifica `if (editingSuministro)`
4. Como es `null` → Toma la rama de **CREACIÓN** en lugar de **ACTUALIZACIÓN**
5. Resultado: Se intenta crear un nuevo suministro en lugar de actualizar ❌

### Solución Aplicada

Se realizaron **3 cambios** en `desktop/src/renderer/pages/Suministros.jsx`:

#### **1. handleEdit (línea ~1517)** 
```javascript
// ANTES
setEditingRecibo(suministroLimpio);

// DESPUÉS  
setEditingSuministro(suministroLimpio);  // ✅ AGREGADO
setEditingRecibo(suministroLimpio);
```

#### **2. handleCloseModal (línea ~2098)**
```javascript
// ANTES
setEditingSuministro(null);

// DESPUÉS
setEditingSuministro(null);
setEditingRecibo(null);  // ✅ AGREGADO
```

#### **3. FormularioSuministros onCancel (línea ~2849)**
```javascript
// ANTES
setShowMultipleModal(false);
setEditingRecibo(null);

// DESPUÉS
setShowMultipleModal(false);
setEditingRecibo(null);
setEditingSuministro(null);  // ✅ AGREGADO
```

### Resultado
✅ La edición de suministros individuales ahora funciona correctamente  
✅ Los datos se actualizan sin crear duplicados  
✅ No se requieren recargas manuales  
✅ El estado se mantiene consistente

---

## Problema 2: Campos de recibo no se actualizaban en edición múltiple

**Problema Identificado**

❌ Al editar un suministro desde el formulario múltiple y cambiar campos como "Proyecto", "Proveedor", "Fecha", etc., estos cambios **no se guardaban** en la base de datos, aunque sí se veían en la tabla.

### Causa Raíz

En `handleMultipleSubmit` (línea 1336), cuando se construía el `updatePayload` para actualizar un suministro existente, **solo se incluían los campos del suministro individual**, no los campos del recibo:

```javascript
// ANTES - Problema
const updatePayload = {
  ...suministroData,  // ❌ Solo campos del suministro, no del recibo
  include_iva: suministrosData.include_iva,
  metodo_pago: infoRecibo.metodo_pago || suministroData.metodo_pago || 'Efectivo'
};
```

**Campos que faltaban:**
- `id_proyecto` (por eso no se actualizaba el proyecto)
- `folio`
- `fecha`
- `id_proveedor` / `proveedor`
- `vehiculo_transporte`
- `operador_responsable`
- Campos de logística (hora_salida, hora_llegada, etc.)

### Solución Aplicada

Se amplió el `updatePayload` en `handleMultipleSubmit` (línea 1336) para incluir explícitamente todos los campos del recibo:

```javascript
// DESPUÉS - Corregido
const updatePayload = {
  ...suministroData,
  // Campos del recibo que deben actualizarse
  id_proyecto: infoRecibo.id_proyecto ? parseInt(infoRecibo.id_proyecto) : suministroData.id_proyecto,
  folio: infoRecibo.folio || suministroData.folio,
  fecha: infoRecibo.fecha || suministroData.fecha,
  id_proveedor: infoRecibo.id_proveedor || infoRecibo.proveedor_info?.id_proveedor || suministroData.id_proveedor,
  proveedor: infoRecibo.proveedor_info?.nombre || infoRecibo.proveedor || suministroData.proveedor,
  metodo_pago: infoRecibo.metodo_pago || suministroData.metodo_pago || 'Efectivo',
  vehiculo_transporte: infoRecibo.vehiculo_transporte || suministroData.vehiculo_transporte,
  operador_responsable: infoRecibo.operador_responsable || suministroData.operador_responsable,
  hora_salida: infoRecibo.hora_salida || suministroData.hora_salida,
  hora_llegada: infoRecibo.hora_llegada || suministroData.hora_llegada,
  hora_inicio_descarga: infoRecibo.hora_inicio_descarga || suministroData.hora_inicio_descarga,
  hora_fin_descarga: infoRecibo.hora_fin_descarga || suministroData.hora_fin_descarga,
  include_iva: suministrosData.include_iva
};
```

**Estrategia:**
- Priorizar los valores de `infoRecibo` (lo que editó el usuario en el formulario)
- Fallback a `suministroData` (valores existentes en el suministro)
- Fallback a valores por defecto (ej: 'Efectivo' para metodo_pago)

### Resultado
✅ Cambios en proyecto, proveedor, fecha y otros campos de recibo se guardan correctamente  
✅ La base de datos se actualiza con todos los cambios realizados  
✅ No se pierden datos al editar  
✅ Las actualizaciones son consistentes

---

## Resumen de Correcciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Edición creaba duplicados en lugar de actualizar | `editingSuministro` nunca se asignaba en `handleEdit` | Asignar ambas variables: `editingSuministro` y `editingRecibo` |
| Campos de recibo no se actualizaban | `updatePayload` no incluía campos del recibo | Incluir explícitamente todos los campos de recibo en `updatePayload` |

## Archivos Modificados

- `/desktop/src/renderer/pages/Suministros.jsx` (4 cambios en 2 commits)

## Estado

✅ **RESUELTO** - Área de suministros/gastos funciona correctamente para:
- Edición de suministros individuales
- Actualización de campos de recibo
- Edición múltiple de suministros
- Cambio de proyecto, proveedor y otros campos
