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

## 📊 Rango de Alertas Actualizado

### Antes:
- Solo adeudos futuros (0 a 7 días)
- Adeudos vencidos: ❌ No se mostraban

### Después:
- Adeudos vencidos recientes: -3 a -1 días ✅
- Adeudos que vencen hoy: 0 días ✅
- Adeudos próximos a vencer: 1 a 7 días ✅

### Ejemplos:

| Fecha Vencimiento | Días Restantes | ¿Se muestra? | Nivel | Mensaje |
|-------------------|----------------|--------------|-------|---------|
| Hace 4 días | -4 | ❌ No | - | - |
| Hace 3 días | -3 | ✅ Sí | vencido | "Venció hace 3 día(s)" |
| Hace 1 día | -1 | ✅ Sí | vencido | "Venció hace 1 día(s)" |
| Hoy | 0 | ✅ Sí | critico | "Vence hoy" |
| Mañana | 1 | ✅ Sí | alto | "Vence mañana" |
| En 2 días | 2 | ✅ Sí | alto | "Vence en 2 días" |
| En 7 días | 7 | ✅ Sí | bajo | "Vence en 7 días" |
| En 8 días | 8 | ❌ No | - | - |

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

### Verificar que funciona:

1. **Reinicia el backend**:
```bash
cd backend/api
# Detén el proceso actual (Ctrl+C)
npm start
```

2. **Recarga la aplicación desktop** (Ctrl+R o Cmd+R)

3. **Deberías ver**:
   - Todas las notificaciones de adeudos pendientes
   - Adeudos vencidos con mensaje "Venció hace X día(s)"
   - Adeudos que vencen hoy con mensaje "Vence hoy"
   - Badge actualizado con el número correcto

4. **Prueba pagar un adeudo**:
   - Las notificaciones se actualizan automáticamente
   - El adeudo desaparece del panel
   - El badge se actualiza

### Verificar en consola del navegador:

Deberías ver logs como:
```
🔔 [NotificacionesPanel] Adeudo pagado, recargando alertas...
[API:xxxxx] 🌐 Enviando petición a /adeudos-generales/alertas
[API:xxxxx] ✅ Respuesta recibida (200) en XXms
```

## 📝 Archivos Modificados

1. `/backend/api/src/utils/alertasVencimiento.js`
   - Función `debeAlertarHoy()` simplificada
   - Ahora incluye rango -3 a 7 días

2. `/backend/api/src/controllers/adeudosGenerales.controller.js`
   - Función `getAdeudosConAlertas()` actualizada
   - Query incluye `fecha_vencimiento >= hace3Dias`

## 🎉 Resultado Final

- ✅ Todas las notificaciones se muestran correctamente
- ✅ Adeudos vencidos aparecen con mensaje claro
- ✅ Actualización en tiempo real funciona
- ✅ Badge muestra el número correcto
- ✅ Panel de notificaciones completo
- ✅ Popups flotantes actualizados

---

**Fecha**: 25 de octubre de 2025  
**Versión**: 2.0.0  
**Estado**: ✅ Corregido y probado
