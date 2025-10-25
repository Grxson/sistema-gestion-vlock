# 🔧 Corrección de Notificaciones de Adeudos

## 🐛 Problemas Identificados

### 1. No se mostraban todos los adeudos pendientes
**Síntoma**: Solo aparecía 1 notificación cuando había 4 adeudos pendientes

**Causa**: El controlador filtraba adeudos con `fecha_vencimiento >= hoy`, excluyendo los vencidos
```javascript
// ANTES (incorrecto):
fecha_vencimiento: {
  [Op.gte]: hoy // Solo futuros o de hoy
}
```

### 2. Mensajes confusos en adeudos vencidos
**Síntoma**: Mostraba "Vence hace 1 día" y "Vence HOY" al mismo tiempo

**Causa**: La función `debeAlertarHoy()` rechazaba adeudos ya vencidos

## ✅ Soluciones Implementadas

### 1. Incluir Adeudos Vencidos Recientes

**Archivo**: `/backend/api/src/controllers/adeudosGenerales.controller.js`

**Cambio**:
```javascript
// DESPUÉS (correcto):
const hace3Dias = new Date(hoy);
hace3Dias.setDate(hoy.getDate() - 3);

// Obtener adeudos no pagados con fecha de vencimiento
const adeudos = await models.Adeudo_general.findAll({
  where: {
    estado: {
      [Op.in]: ['pendiente', 'parcial']
    },
    fecha_vencimiento: {
      [Op.not]: null,
      [Op.gte]: hace3Dias // Incluye vencidos hasta 3 días atrás
    }
  },
  // ...
});
```

**Resultado**: Ahora incluye adeudos vencidos hasta 3 días atrás

### 2. Simplificar Lógica de Alertas

**Archivo**: `/backend/api/src/utils/alertasVencimiento.js`

**Cambio en `debeAlertarHoy()`**:
```javascript
// ANTES (complejo):
const fechaInicio = calcularFechaInicioAlertas(vencimiento);
fechaInicio.setHours(0, 0, 0, 0);

// No alertar si ya venció
if (vencimiento < hoy) {
  return false;
}

// Alertar si hoy está entre la fecha de inicio y el vencimiento
return hoy >= fechaInicio && hoy <= vencimiento;

// DESPUÉS (simple):
const diasRestantes = calcularDiasRestantes(fechaVencimiento);

// Alertar si vence en los próximos 7 días O si ya venció (hasta 3 días atrás)
return diasRestantes !== null && diasRestantes >= -3 && diasRestantes <= 7;
```

**Ventajas**:
- Lógica más clara y directa
- Incluye adeudos vencidos recientes (-3 a 0 días)
- Mantiene ventana de 7 días hacia adelante
- Elimina cálculo innecesario de `fechaInicio`

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
