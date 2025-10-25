# 🔄 Actualización en Tiempo Real de Notificaciones

## 📋 Problema Resuelto

Cuando un adeudo se pagaba, actualizaba o eliminaba, las notificaciones no se actualizaban automáticamente. El usuario tenía que recargar la página o esperar 5 minutos para ver los cambios.

## ✅ Solución Implementada

Sistema de eventos en tiempo real usando `CustomEvent` del navegador para sincronizar todos los componentes de notificaciones.

## 🏗️ Arquitectura

### EventBus (Sistema de Eventos)

**Archivo**: `/desktop/src/renderer/utils/eventBus.js`

```javascript
class EventBus {
  emit(eventName, data)  // Emitir evento
  on(eventName, callback) // Escuchar evento
  once(eventName, callback) // Escuchar una sola vez
}
```

### Eventos Disponibles

```javascript
export const EVENTS = {
  ADEUDO_ACTUALIZADO: 'adeudo:actualizado',  // Cuando se edita un adeudo
  ADEUDO_PAGADO: 'adeudo:pagado',            // Cuando se liquida completamente
  ADEUDO_ELIMINADO: 'adeudo:eliminado',      // Cuando se elimina
  ADEUDO_CREADO: 'adeudo:creado',            // Cuando se crea uno nuevo
  RECARGAR_ALERTAS: 'alertas:recargar',      // Recarga manual
};
```

## 🔄 Flujo de Actualización

### 1. Usuario Paga un Adeudo

```
Usuario hace clic en "Liquidar"
  ↓
AdeudosGenerales.marcarComoPagado()
  ↓
Petición PUT al servidor
  ↓
Servidor actualiza BD
  ↓
Respuesta exitosa
  ↓
eventBus.emit(EVENTS.ADEUDO_PAGADO, { id, accion })
  ↓
NotificacionesPanel escucha evento → cargarAlertas()
  ↓
AlertasVencimiento escucha evento → cargarAlertas()
  ↓
Ambos componentes se actualizan en tiempo real
  ↓
Si el adeudo ya no está pendiente → Desaparece de notificaciones
```

### 2. Usuario Registra Pago Parcial

```
Usuario registra pago parcial
  ↓
AdeudosGenerales.registrarPagoParcial()
  ↓
Petición PUT al servidor
  ↓
Servidor actualiza monto_pendiente
  ↓
eventBus.emit(EVENTS.ADEUDO_ACTUALIZADO, { id, accion })
  ↓
Notificaciones se actualizan
  ↓
Monto pendiente se actualiza en tiempo real
```

### 3. Usuario Elimina un Adeudo

```
Usuario elimina adeudo
  ↓
AdeudosGenerales.eliminarAdeudo()
  ↓
Petición DELETE al servidor
  ↓
eventBus.emit(EVENTS.ADEUDO_ELIMINADO, { id, accion })
  ↓
Notificaciones se actualizan
  ↓
Adeudo desaparece de notificaciones
```

## 📝 Implementación

### 1. Emisor de Eventos (AdeudosGenerales.jsx)

```javascript
import { eventBus, EVENTS } from '../utils/eventBus';

// Al liquidar adeudo
const marcarComoPagado = async (id) => {
  // ... lógica de pago ...
  
  if (data.success) {
    eventBus.emit(EVENTS.ADEUDO_PAGADO, { 
      id: id,
      accion: 'liquidado'
    });
  }
};

// Al registrar pago parcial
const registrarPagoParcial = async (datosPago) => {
  // ... lógica de pago ...
  
  if (data.success) {
    eventBus.emit(EVENTS.ADEUDO_ACTUALIZADO, { 
      id: adeudoParaPago.id_adeudo_general,
      accion: 'pago_parcial'
    });
  }
};

// Al eliminar
const eliminarAdeudo = async (id) => {
  // ... lógica de eliminación ...
  
  if (data.success) {
    eventBus.emit(EVENTS.ADEUDO_ELIMINADO, { 
      id: id,
      accion: 'eliminado'
    });
  }
};

// Al crear o actualizar
const handleSubmit = async (e) => {
  // ... lógica de guardado ...
  
  if (data.success) {
    if (adeudoEditando) {
      eventBus.emit(EVENTS.ADEUDO_ACTUALIZADO, { 
        id: adeudoEditando.id_adeudo_general,
        accion: 'actualizado'
      });
    } else {
      eventBus.emit(EVENTS.ADEUDO_CREADO, { 
        accion: 'creado'
      });
    }
  }
};
```

### 2. Receptor de Eventos (NotificacionesPanel.jsx)

```javascript
import { eventBus, EVENTS } from '../utils/eventBus';

useEffect(() => {
  // ... código existente ...
  
  // Escuchar eventos
  const unsubscribeActualizado = eventBus.on(EVENTS.ADEUDO_ACTUALIZADO, () => {
    console.log('🔔 Adeudo actualizado, recargando alertas...');
    cargarAlertas();
  });

  const unsubscribePagado = eventBus.on(EVENTS.ADEUDO_PAGADO, () => {
    console.log('🔔 Adeudo pagado, recargando alertas...');
    cargarAlertas();
  });

  const unsubscribeEliminado = eventBus.on(EVENTS.ADEUDO_ELIMINADO, () => {
    console.log('🔔 Adeudo eliminado, recargando alertas...');
    cargarAlertas();
  });

  const unsubscribeRecargar = eventBus.on(EVENTS.RECARGAR_ALERTAS, () => {
    console.log('🔔 Recarga manual solicitada...');
    cargarAlertas();
  });
  
  // Cleanup
  return () => {
    unsubscribeActualizado();
    unsubscribePagado();
    unsubscribeEliminado();
    unsubscribeRecargar();
  };
}, []);
```

### 3. Receptor de Eventos (AlertasVencimiento.jsx)

```javascript
import { eventBus, EVENTS } from '../../utils/eventBus';

useEffect(() => {
  // ... código existente ...
  
  // Escuchar eventos
  const unsubscribeActualizado = eventBus.on(EVENTS.ADEUDO_ACTUALIZADO, () => {
    cargarAlertas();
  });

  const unsubscribePagado = eventBus.on(EVENTS.ADEUDO_PAGADO, () => {
    cargarAlertas();
  });

  const unsubscribeEliminado = eventBus.on(EVENTS.ADEUDO_ELIMINADO, () => {
    cargarAlertas();
  });

  const unsubscribeRecargar = eventBus.on(EVENTS.RECARGAR_ALERTAS, () => {
    cargarAlertas();
  });
  
  return () => {
    unsubscribeActualizado();
    unsubscribePagado();
    unsubscribeEliminado();
    unsubscribeRecargar();
  };
}, []);
```

## 🧪 Pruebas

### Caso 1: Liquidar Adeudo

1. Abre el panel de notificaciones (debería mostrar 4 alertas)
2. Ve al módulo de Adeudos
3. Liquida uno de los adeudos de prueba
4. **Resultado esperado**: 
   - El adeudo desaparece de la tabla
   - El badge del panel se actualiza (3 alertas)
   - Los popups se actualizan automáticamente
   - No necesitas recargar la página

### Caso 2: Pago Parcial

1. Registra un pago parcial en un adeudo
2. **Resultado esperado**:
   - El monto pendiente se actualiza en el panel
   - La notificación sigue visible (porque aún está pendiente)
   - El monto mostrado es el nuevo monto pendiente

### Caso 3: Eliminar Adeudo

1. Elimina un adeudo
2. **Resultado esperado**:
   - Desaparece del panel de notificaciones
   - Desaparece de los popups
   - El badge se actualiza

### Caso 4: Editar Fecha de Vencimiento

1. Edita un adeudo y cambia la fecha de vencimiento a más de 7 días
2. **Resultado esperado**:
   - Desaparece de las notificaciones (ya no está en rango de 7 días)
   - El badge se actualiza

## 🔍 Debugging

### Ver Eventos en Consola

Los eventos se logean automáticamente:

```
📡 [EventBus] Evento emitido: adeudo:pagado {id: 5, accion: "liquidado"}
🔔 [NotificacionesPanel] Adeudo pagado, recargando alertas...
```

### Emitir Evento Manual

Desde la consola del navegador:

```javascript
// Importar eventBus (solo para debugging)
const { eventBus, EVENTS } = await import('./utils/eventBus.js');

// Forzar recarga de alertas
eventBus.emit(EVENTS.RECARGAR_ALERTAS);
```

## ⚡ Ventajas

1. **Tiempo real**: Las notificaciones se actualizan inmediatamente
2. **Sin polling**: No necesita consultar el servidor cada X segundos
3. **Desacoplado**: Los componentes no necesitan conocerse entre sí
4. **Escalable**: Fácil agregar más listeners o eventos
5. **Ligero**: Usa APIs nativas del navegador (CustomEvent)

## 🚀 Futuras Mejoras

- [ ] Agregar animación cuando una notificación desaparece
- [ ] Mostrar toast cuando se actualiza una notificación
- [ ] Sincronizar entre pestañas (usando BroadcastChannel)
- [ ] Agregar debounce para evitar múltiples recargas
- [ ] Persistir eventos en IndexedDB para offline

## 📊 Comparación

### Antes (Sin EventBus)

```
Usuario paga adeudo
  ↓
Adeudo se actualiza en BD
  ↓
Usuario debe:
  - Recargar la página manualmente, O
  - Esperar 5 minutos (próxima actualización automática)
  ↓
Notificaciones se actualizan
```

**Tiempo de actualización**: 5 minutos (máximo)

### Después (Con EventBus)

```
Usuario paga adeudo
  ↓
Adeudo se actualiza en BD
  ↓
Evento emitido
  ↓
Notificaciones se actualizan automáticamente
```

**Tiempo de actualización**: < 1 segundo

## 🔒 Consideraciones de Seguridad

- Los eventos solo se emiten después de confirmación del servidor
- No se exponen datos sensibles en los eventos
- Los eventos son locales (no se envían a otros usuarios)
- La recarga de datos siempre requiere autenticación (JWT)

---

**Versión**: 2.0.0  
**Fecha**: 25 de octubre de 2025  
**Autor**: Sistema de Gestión Vlock
