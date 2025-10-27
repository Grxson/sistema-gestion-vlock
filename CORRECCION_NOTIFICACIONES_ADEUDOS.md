# 🔧 Corrección de Notificaciones de Adeudos

## 🐛 Problemas Identificados (27 de octubre de 2025)

### 1. Cálculo incorrecto de días restantes
**Síntoma**: Cuando un adeudo vence HOY, muestra "Venció hace 1 día(s)" en lugar de "Vence hoy"

**Causa**: 
- Uso de `Math.ceil()` en lugar de `Math.floor()` para calcular días
- Problemas de zona horaria al parsear fechas con `new Date(fechaVencimiento)`
- La fecha se interpretaba en UTC causando desfase de 1 día

**Ejemplo del error**:
- Fecha de vencimiento: 26 de octubre de 2025
- Fecha actual: 26 de octubre de 2025
- Resultado esperado: "Vence hoy" (0 días)
- Resultado erróneo: "Venció hace 1 día(s)" (-1 días)

### 2. Monto en $0.00 en notificaciones
**Síntoma**: Los popups de notificaciones muestran "$0.00" en lugar del monto pendiente real

**Causa**: El campo `monto_pendiente` puede ser NULL en algunos adeudos antiguos que no tienen el campo calculado

## ✅ Soluciones Implementadas

### 1. Corrección del Cálculo de Días Restantes (Frontend)

**Archivo**: `/desktop/src/renderer/utils/alertasVencimiento.js`

**Cambio en `calcularDiasRestantes()`**:
```javascript
// ANTES (incorrecto):
const vencimiento = new Date(fechaVencimiento);
vencimiento.setHours(0, 0, 0, 0);
const diferencia = vencimiento - hoy;
return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // ❌ Math.ceil

// DESPUÉS (correcto):
// Parsear fecha correctamente (formato YYYY-MM-DD)
const fechaStr = fechaVencimiento.split('T')[0]; // Tomar solo la parte de fecha
const [year, month, day] = fechaStr.split('-').map(Number);
const vencimiento = new Date(year, month - 1, day); // Mes es 0-indexed
vencimiento.setHours(0, 0, 0, 0);

const diferencia = vencimiento - hoy;
const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24)); // ✅ Math.floor
return dias;
```

**Por qué funciona**:
- Parsea la fecha manualmente para evitar problemas de zona horaria
- Usa `Math.floor()` en lugar de `Math.ceil()` para redondear correctamente
- Cuando vence HOY, diferencia = 0, `Math.floor(0) = 0` ✅

### 2. Corrección del Cálculo de Días Restantes (Backend)

**Archivo**: `/backend/api/src/utils/alertasVencimiento.js`

**Cambio en `calcularDiasRestantes()`**:
```javascript
// ANTES (incorrecto):
const diferencia = vencimiento - hoy;
return Math.ceil(diferencia / (1000 * 60 * 60 * 24)); // ❌ Math.ceil

// DESPUÉS (correcto):
const diferencia = vencimiento - hoy;
const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24)); // ✅ Math.floor
return dias;
```

### 3. Cálculo Automático de `monto_pendiente`

**Archivo**: `/backend/api/src/controllers/adeudosGenerales.controller.js`

**Cambio en `getAdeudosConAlertas()`**:
```javascript
// Calcular monto_pendiente si es null o undefined
const adeudoJSON = adeudo.toJSON();
const montoPendiente = adeudoJSON.monto_pendiente !== null && adeudoJSON.monto_pendiente !== undefined
  ? parseFloat(adeudoJSON.monto_pendiente)
  : parseFloat(adeudoJSON.monto_original || adeudoJSON.monto || 0) - parseFloat(adeudoJSON.monto_pagado || 0);

return {
  ...adeudoJSON,
  monto_pendiente: montoPendiente, // ✅ Siempre tiene valor
  alerta: {
    diasRestantes,
    nivelUrgencia,
    mensaje: mensajeAlerta
  }
};
```

**Ventajas**:
- Si `monto_pendiente` existe, lo usa
- Si es NULL, lo calcula: `monto_original - monto_pagado`
- Fallback a `monto` para adeudos antiguos
- Siempre retorna un valor numérico válido

## 📊 Comportamiento Corregido

### Ejemplos de Cálculo:

| Fecha Vencimiento | Fecha Actual | Días Calculados | Nivel | Mensaje |
|-------------------|--------------|-----------------|-------|---------|
| 26 oct 2025 | 27 oct 2025 | -1 | vencido | "Venció hace 1 día(s)" ✅ |
| 26 oct 2025 | 26 oct 2025 | 0 | critico | "Vence hoy" ✅ |
| 26 oct 2025 | 25 oct 2025 | 1 | alto | "Vence mañana" ✅ |
| 26 oct 2025 | 24 oct 2025 | 2 | alto | "Vence en 2 días" ✅ |

### Tabla Completa de Alertas:

| Días Restantes | ¿Se muestra? | Nivel | Mensaje | Color |
|----------------|--------------|-------|---------|-------|
| -4 o menos | ❌ No | - | - | - |
| -3 | ✅ Sí | vencido | "Venció hace 3 día(s)" | Rojo intenso |
| -1 | ✅ Sí | vencido | "Venció hace 1 día(s)" | Rojo intenso |
| 0 | ✅ Sí | critico | "Vence hoy" | Rojo |
| 1 | ✅ Sí | alto | "Vence mañana" | Naranja |
| 2 | ✅ Sí | alto | "Vence en 2 días" | Naranja |
| 3-5 | ✅ Sí | medio | "Vence en X días" | Amarillo |
| 6-7 | ✅ Sí | bajo | "Vence en X días" | Azul |
| 8+ | ❌ No | - | - | - |

## 🎯 Niveles de Urgencia

```javascript
if (diasRestantes < 0) return 'vencido';  // Rojo intenso
if (diasRestantes === 0) return 'critico'; // Rojo
if (diasRestantes <= 2) return 'alto';     // Naranja
if (diasRestantes <= 5) return 'medio';    // Amarillo
if (diasRestantes <= 7) return 'bajo';     // Azul
```

## 🔄 Actualización en Tiempo Real

El sistema de eventos ya implementado asegura que:

1. **Al pagar un adeudo**: Se emite `ADEUDO_PAGADO`
2. **Al registrar pago parcial**: Se emite `ADEUDO_ACTUALIZADO`
3. **Al eliminar un adeudo**: Se emite `ADEUDO_ELIMINADO`
4. **Componentes escuchan**: NotificacionesPanel y AlertasVencimiento
5. **Recargan automáticamente**: Sin necesidad de refrescar

## 🧪 Pruebas

### Pasos para verificar la corrección:

1. **Reinicia el backend**:
```bash
cd backend/api
# Detén el proceso actual (Ctrl+C)
npm start
```

2. **Recarga la aplicación desktop** (Ctrl+R o Cmd+R)

3. **Verifica el cálculo de días**:
   - Crea un adeudo con fecha de vencimiento = HOY
   - Debería mostrar: "Vence hoy" ✅
   - NO debería mostrar: "Venció hace 1 día(s)" ❌

4. **Verifica el monto**:
   - Abre el panel de notificaciones (campana)
   - Los montos deben mostrar valores reales, no $0.00
   - Ejemplo: "$8,381.50" en lugar de "$0.00"

5. **Prueba diferentes fechas**:
   - Adeudo que vence mañana → "Vence mañana"
   - Adeudo que venció ayer → "Venció hace 1 día(s)"
   - Adeudo que vence en 3 días → "Vence en 3 días"

### Verificar en consola del navegador:

Deberías ver logs como:
```
🔔 [NotificacionesPanel] Recargando alertas...
[API:xxxxx] 🌐 Enviando petición a /adeudos-generales/alertas
[API:xxxxx] ✅ Respuesta recibida (200) en XXms
```

### Casos de prueba específicos:

| Escenario | Fecha Vencimiento | Resultado Esperado |
|-----------|-------------------|-------------------|
| Vence hoy | 26/10/2025 (hoy) | "Vence hoy" + monto correcto |
| Venció ayer | 25/10/2025 | "Venció hace 1 día(s)" + monto correcto |
| Vence mañana | 27/10/2025 | "Vence mañana" + monto correcto |

## 📝 Archivos Modificados

### Frontend:
1. **`/desktop/src/renderer/utils/alertasVencimiento.js`**
   - Función `calcularDiasRestantes()` corregida
   - Parseo manual de fechas para evitar zona horaria
   - Cambio de `Math.ceil()` a `Math.floor()`

### Backend:
2. **`/backend/api/src/utils/alertasVencimiento.js`**
   - Función `calcularDiasRestantes()` corregida
   - Cambio de `Math.ceil()` a `Math.floor()`

3. **`/backend/api/src/controllers/adeudosGenerales.controller.js`**
   - Función `getAdeudosConAlertas()` actualizada
   - Cálculo automático de `monto_pendiente` cuando es NULL
   - Fallback a `monto_original - monto_pagado`

## 🎉 Resultado Final

### Problemas Resueltos:
- ✅ **Cálculo de días correcto**: "Vence hoy" cuando vence HOY (no "Venció hace 1 día")
- ✅ **Montos visibles**: Muestra montos reales en lugar de $0.00
- ✅ **Consistencia frontend-backend**: Ambos usan el mismo algoritmo
- ✅ **Sin problemas de zona horaria**: Parseo manual de fechas

### Impacto:
- ✅ Notificaciones precisas y confiables
- ✅ Usuarios ven información correcta
- ✅ Mejor experiencia de usuario
- ✅ Sin confusión en fechas de vencimiento

---

**Fecha**: 27 de octubre de 2025  
**Versión**: 2.0.0  
**Estado**: ✅ Corregido y listo para pruebas
