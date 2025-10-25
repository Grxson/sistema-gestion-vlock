# 🔔 Sistema de Notificaciones de Adeudos por Vencimiento

## 📋 Descripción General

Sistema completo de notificaciones para alertar sobre adeudos próximos a vencer, con dos componentes principales:

1. **Popups flotantes** (AlertasVencimiento) - Notificaciones emergentes en la esquina superior derecha
2. **Panel de notificaciones** (NotificacionesPanel) - Icono de campana en el header con dropdown

## 🎯 Características Principales

### ✅ Notificaciones Automáticas
- Se cargan automáticamente al abrir la aplicación
- Se actualizan cada 5 minutos
- Se limpian automáticamente cada día (a las 00:00)

### ✅ Niveles de Urgencia
- 🔴 **CRÍTICO**: Vence HOY (0 días)
- 🟠 **ALTO**: Vence en 1-2 días
- 🟡 **MEDIO**: Vence en 3-5 días
- 🔵 **BAJO**: Vence en 6-7 días

### ✅ Gestión de Estado
- **Popups**: Se pueden cerrar individualmente (guardado en `localStorage`)
- **Panel**: Marca como leídas al abrir el panel
- **Limpieza diaria**: Todas las notificaciones cerradas/leídas se resetean cada día

### ✅ Persistencia Inteligente
- Las notificaciones cerradas no vuelven a aparecer el mismo día
- Al día siguiente, se limpian automáticamente para mostrar el estado actualizado
- Ejemplo: Un adeudo que vencía "en 2 días" ayer, hoy mostrará "vence mañana"

## 🏗️ Arquitectura

### Componentes

#### 1. AlertasVencimiento.jsx
**Ubicación**: `/desktop/src/renderer/components/adeudos/AlertasVencimiento.jsx`

**Responsabilidades**:
- Mostrar popups flotantes en la esquina superior derecha
- Permitir cerrar notificaciones individualmente
- Guardar notificaciones cerradas en `localStorage` (key: `alertas_cerradas`)

**Props**: Ninguna (componente autónomo)

**Estado**:
```javascript
{
  alertas: [],              // Alertas del servidor
  alertasCerradas: [],      // IDs de alertas cerradas
  loading: true             // Estado de carga
}
```

#### 2. NotificacionesPanel.jsx
**Ubicación**: `/desktop/src/renderer/components/NotificacionesPanel.jsx`

**Responsabilidades**:
- Mostrar icono de campana en el header
- Badge con contador de notificaciones no leídas
- Panel desplegable con todas las notificaciones
- Marcar notificaciones como leídas

**Props**: Ninguna (componente autónomo)

**Estado**:
```javascript
{
  alertas: [],              // Alertas del servidor
  alertasLeidas: [],        // IDs de alertas leídas
  mostrarPanel: false,      // Estado del dropdown
  loading: true             // Estado de carga
}
```

### Integración en App.jsx

```javascript
// Importaciones
import AlertasVencimiento from './components/adeudos/AlertasVencimiento';
import NotificacionesPanel from './components/NotificacionesPanel';

// En el header
<div className="flex items-center space-x-2 sm:space-x-4">
  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
    {/* Fecha */}
  </div>
  <NotificacionesPanel />  {/* ← Icono de campana */}
</div>

// Al final del layout
<AlertasVencimiento />  {/* ← Popups flotantes */}
```

## 🔄 Flujo de Datos

### 1. Carga Inicial
```
App.jsx monta
  ↓
AlertasVencimiento y NotificacionesPanel se montan
  ↓
Ambos ejecutan useEffect
  ↓
Verifican si es nuevo día (limpiarAlertasAntiguasSiEsNuevoDia)
  ↓
Si es nuevo día → Limpian localStorage
  ↓
Cargan alertas del servidor (GET /api/adeudos-generales/alertas)
  ↓
Cargan alertas cerradas/leídas de localStorage
  ↓
Filtran y muestran notificaciones
```

### 2. Actualización Automática
```
Cada 5 minutos:
  ↓
Verificar si es nuevo día
  ↓
Si es nuevo día → Limpiar localStorage
  ↓
Recargar alertas del servidor
  ↓
Actualizar UI
```

### 3. Interacción del Usuario

#### Cerrar popup (AlertasVencimiento)
```
Usuario hace clic en X
  ↓
Agregar ID a alertasCerradas
  ↓
Guardar en localStorage (alertas_cerradas)
  ↓
Re-renderizar (el popup desaparece)
```

#### Abrir panel (NotificacionesPanel)
```
Usuario hace clic en campana
  ↓
Mostrar dropdown
  ↓
Después de 1 segundo → Marcar todas como leídas
  ↓
Guardar en localStorage (alertas_leidas)
  ↓
Actualizar badge (contador = 0)
```

## 💾 LocalStorage

### Keys Utilizadas

| Key | Tipo | Descripción | Limpieza |
|-----|------|-------------|----------|
| `alertas_cerradas` | Array de IDs | Popups cerrados manualmente | Diaria |
| `alertas_leidas` | Array de IDs | Notificaciones vistas en el panel | Diaria |
| `ultima_limpieza_alertas` | String (fecha) | Última vez que se limpiaron las alertas | Nunca |

### Ejemplo de Datos

```javascript
// localStorage
{
  "alertas_cerradas": [5, 8, 9],
  "alertas_leidas": [5, 8, 9, 10],
  "ultima_limpieza_alertas": "Fri Oct 25 2025"
}
```

## 🔧 API Endpoint

### GET /api/adeudos-generales/alertas

**Descripción**: Obtiene todos los adeudos que vencen en los próximos 7 días

**Headers**:
```
Authorization: Bearer {token}
```

**Respuesta Exitosa** (200):
```json
{
  "success": true,
  "data": [
    {
      "id_adeudo_general": 5,
      "nombre_entidad": "Proveedor ABC",
      "tipo_adeudo": "debemos",
      "monto_pendiente": 15000.00,
      "fecha_vencimiento": "2025-10-25T00:00:00.000Z",
      "alerta": {
        "diasRestantes": 0,
        "nivelUrgencia": "critico",
        "mensaje": "Vence hoy"
      }
    }
  ],
  "count": 4
}
```

**Campos de `alerta`**:
- `diasRestantes`: Número de días hasta el vencimiento
- `nivelUrgencia`: `"critico"` | `"alto"` | `"medio"` | `"bajo"`
- `mensaje`: Texto descriptivo ("Vence hoy", "Vence mañana", "Vence en X días")

## 🎨 Estilos y Diseño

### Colores por Nivel de Urgencia

```javascript
// Crítico (rojo)
bg-red-50 dark:bg-red-900/20 border-red-500

// Alto (naranja)
bg-orange-50 dark:bg-orange-900/20 border-orange-500

// Medio (amarillo)
bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500

// Bajo (azul)
bg-blue-50 dark:bg-blue-900/20 border-blue-500
```

### Posicionamiento

```css
/* Popups flotantes */
.fixed.top-4.right-4.z-40

/* Panel de notificaciones */
.absolute.right-0.mt-2.z-50
```

### Animaciones

```css
/* Slide-in desde la derecha */
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## 🧪 Pruebas

### Crear Adeudos de Prueba

```bash
cd backend/api
node src/scripts/test-notificaciones-adeudos.js
```

Esto crea 6 adeudos con diferentes fechas de vencimiento.

### Verificar Endpoint

```bash
./test-endpoint-alertas.sh
```

### Limpiar Datos de Prueba

```sql
DELETE FROM adeudos_generales 
WHERE nombre_entidad LIKE '%[PRUEBA]%';
```

### Limpiar LocalStorage (Consola del Navegador)

```javascript
// Limpiar notificaciones cerradas
localStorage.removeItem('alertas_cerradas');

// Limpiar notificaciones leídas
localStorage.removeItem('alertas_leidas');

// Forzar limpieza (simular nuevo día)
localStorage.removeItem('ultima_limpieza_alertas');

// Recargar
location.reload();
```

## 📱 Casos de Uso

### Caso 1: Usuario abre la app por primera vez en el día
1. Se limpian las notificaciones del día anterior
2. Se cargan las alertas actualizadas del servidor
3. Se muestran popups para todas las alertas
4. Se muestra badge en la campana con el contador

### Caso 2: Usuario cierra un popup
1. El popup desaparece
2. Se guarda el ID en `alertas_cerradas`
3. El popup no vuelve a aparecer ese día
4. El badge se actualiza (contador - 1)

### Caso 3: Usuario abre el panel de notificaciones
1. Se muestra el dropdown con todas las alertas
2. Después de 1 segundo, se marcan todas como leídas
3. El badge desaparece (contador = 0)
4. Las notificaciones siguen visibles en el panel

### Caso 4: Pasa un día (00:00)
1. Al abrir la app, se detecta que es un nuevo día
2. Se limpian `alertas_cerradas` y `alertas_leidas`
3. Se cargan alertas actualizadas (fechas recalculadas)
4. Se muestran todas las alertas de nuevo

### Caso 5: Un adeudo cambia de estado
**Ayer**: "Vence en 2 días" (nivel ALTO 🟠)  
**Hoy**: "Vence mañana" (nivel ALTO 🟠)  
**Mañana**: "Vence hoy" (nivel CRÍTICO 🔴)

Gracias a la limpieza diaria, el usuario verá el estado actualizado cada día.

## 🔒 Seguridad

- Todas las peticiones requieren autenticación (JWT token)
- Los datos se filtran por permisos del usuario
- No se exponen datos sensibles en localStorage (solo IDs)

## ⚡ Rendimiento

- Las alertas se cachean en el estado del componente
- Solo se hace una petición al servidor cada 5 minutos
- El localStorage es más rápido que consultar la DB constantemente
- La limpieza diaria evita que el localStorage crezca indefinidamente

## 🐛 Troubleshooting

### Las notificaciones no aparecen

**Posibles causas**:
1. Backend no está corriendo
2. No hay adeudos próximos a vencer
3. Token expirado
4. Todas las notificaciones están cerradas

**Solución**:
```javascript
// En la consola del navegador
localStorage.removeItem('alertas_cerradas');
localStorage.removeItem('alertas_leidas');
location.reload();
```

### El badge muestra un número incorrecto

**Causa**: Desincronización entre `alertas_cerradas` y `alertas_leidas`

**Solución**:
```javascript
localStorage.clear();
location.reload();
```

### Las notificaciones no se limpian al día siguiente

**Causa**: El sistema de detección de nuevo día no funciona

**Solución**:
```javascript
// Forzar limpieza manual
localStorage.removeItem('ultima_limpieza_alertas');
location.reload();
```

## 📝 Notas de Desarrollo

### Agregar un nuevo nivel de urgencia

1. Actualizar `obtenerNivelUrgencia()` en `/backend/api/src/utils/alertasVencimiento.js`
2. Agregar color en `getNivelColor()` en ambos componentes
3. Agregar icono en `getNivelIcono()` si es necesario

### Cambiar el intervalo de actualización

```javascript
// En AlertasVencimiento.jsx y NotificacionesPanel.jsx
const interval = setInterval(() => {
  limpiarAlertasAntiguasSiEsNuevoDia();
  cargarAlertas();
}, 5 * 60 * 1000); // ← Cambiar aquí (en milisegundos)
```

### Agregar sonido de notificación

```javascript
// En cargarAlertas(), después de setAlertas()
if (response.data.length > 0) {
  const audio = new Audio('/notification.mp3');
  audio.play().catch(e => console.log('No se pudo reproducir'));
}
```

## 🚀 Futuras Mejoras

- [ ] Notificaciones push del navegador
- [ ] Sonido personalizable
- [ ] Filtros en el panel (por tipo, urgencia, etc.)
- [ ] Búsqueda en el panel
- [ ] Marcar como leída individualmente
- [ ] Configuración de intervalos de actualización
- [ ] Exportar notificaciones a PDF/Excel
- [ ] Historial de notificaciones

---

**Versión**: 2.0.0  
**Última actualización**: 25 de octubre de 2025  
**Autor**: Sistema de Gestión Vlock
