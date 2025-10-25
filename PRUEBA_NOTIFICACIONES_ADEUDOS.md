# 🧪 Prueba de Notificaciones de Adeudos por Vencimiento

## ✅ Configuración Completada

### 1. Adeudos de Prueba Creados

Se crearon **6 adeudos de prueba** en la base de datos local con diferentes niveles de urgencia:

| # | Nombre | Tipo | Monto | Vence | Nivel | ¿Alerta? |
|---|--------|------|-------|-------|-------|----------|
| 1 | Proveedor ABC [PRUEBA] | 🔻 Debemos | $15,000 | HOY | 🔴 CRÍTICO | ✅ SÍ |
| 2 | Cliente XYZ [PRUEBA] | 💸 Nos deben | $8,500 | MAÑANA | 🟠 ALTO | ✅ SÍ |
| 3 | Proveedor DEF [PRUEBA] | 🔻 Debemos | $12,000 | En 2 días | 🟠 ALTO | ✅ SÍ |
| 4 | Cliente 123 [PRUEBA] | 💸 Nos deben | $20,000 | En 4 días | 🟡 MEDIO | ✅ SÍ |
| 5 | Proveedor GHI [PRUEBA] | 🔻 Debemos | $9,500 | En 6 días | 🔵 BAJO | ✅ SÍ |
| 6 | Cliente 456 [PRUEBA] | 💸 Nos deben | $5,000 | En 10 días | ⚪ Sin alerta | ❌ NO |

**Total**: $70,000 en adeudos de prueba

### 2. Componente Global Configurado

✅ `AlertasVencimiento` ahora se muestra en **toda la aplicación**
- Ubicación: `/desktop/src/renderer/App.jsx`
- Se renderiza fuera del contenido principal
- Posición: Esquina superior derecha (fixed)
- z-index: 50 (sobre todo el contenido)

### 3. Características del Sistema de Notificaciones

#### Niveles de Urgencia

- **🔴 CRÍTICO**: Vence HOY (0 días)
- **🟠 ALTO**: Vence en 1-2 días
- **🟡 MEDIO**: Vence en 3-5 días
- **🔵 BAJO**: Vence en 6-7 días
- **⚪ Sin alerta**: Más de 7 días

#### Comportamiento de las Notificaciones

1. **Aparición automática**: Se cargan al abrir la app
2. **Actualización**: Cada 5 minutos
3. **Persistencia**: Las notificaciones cerradas se guardan en `localStorage`
4. **Reaparición**: Solo si se crea un nuevo adeudo o se limpia el localStorage
5. **Animación**: Slide-in desde la derecha con delay escalonado
6. **Interacción**: Botón X para cerrar cada notificación

#### Información Mostrada

- ⚠️ Título: "Adeudo por Vencer"
- 📅 Mensaje: "Vence HOY" / "Vence MAÑANA" / "Vence en X días"
- 🏢 Nombre de la entidad
- 💰 Monto pendiente
- 🔻/💸 Tipo de adeudo (Nos deben / Debemos)
- 📆 Fecha de vencimiento completa

## 🚀 Cómo Probar

### Paso 1: Iniciar el Backend

```bash
cd backend/api
npm start
```

**Verifica que esté corriendo en**: `http://localhost:4000`

### Paso 2: Iniciar la Aplicación Desktop

```bash
cd desktop
npm run dev
```

### Paso 3: Observar las Notificaciones

1. **Al abrir la app**, deberías ver **5 notificaciones** en la esquina superior derecha:
   - 1 roja (CRÍTICO)
   - 2 naranjas (ALTO)
   - 1 amarilla (MEDIO)
   - 1 azul (BAJO)

2. **Orden de aparición**: De más urgente a menos urgente

3. **Animación**: Aparecen con un efecto de slide-in desde la derecha

### Paso 4: Interactuar con las Notificaciones

#### Cerrar una notificación:
- Haz clic en el botón **X** de cualquier notificación
- La notificación desaparece
- Se guarda en localStorage para no volver a mostrarse

#### Ver todas las notificaciones de nuevo:
```javascript
// En la consola del navegador (DevTools):
localStorage.removeItem('alertas_cerradas');
// Luego recarga la página
```

#### Verificar qué notificaciones están cerradas:
```javascript
// En la consola del navegador:
JSON.parse(localStorage.getItem('alertas_cerradas') || '[]');
```

## 🔍 Verificación del Endpoint

### Endpoint de Alertas

**URL**: `GET /api/adeudos-generales/alertas`

**Prueba manual**:
```bash
# Asegúrate de tener un token válido
curl -H "Authorization: Bearer TU_TOKEN" \
  http://localhost:4000/api/adeudos-generales/alertas
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": [
    {
      "id_adeudo_general": 1,
      "nombre_entidad": "Proveedor ABC [PRUEBA]",
      "tipo_adeudo": "debemos",
      "monto_pendiente": 15000,
      "fecha_vencimiento": "2025-10-25T00:00:00.000Z",
      "alerta": {
        "diasRestantes": 0,
        "nivelUrgencia": "critico",
        "mensaje": "Vence hoy"
      }
    },
    // ... más adeudos
  ],
  "count": 5
}
```

## 🧹 Limpieza de Datos de Prueba

### Opción 1: Script Automático
```bash
cd backend/api
# Crear un script de limpieza o ejecutar SQL directamente
```

### Opción 2: SQL Manual
```sql
DELETE FROM adeudos_generales 
WHERE nombre_entidad LIKE '%[PRUEBA]%';
```

### Opción 3: Desde la Aplicación
1. Ve al módulo de **Adeudos**
2. Busca los adeudos con `[PRUEBA]` en el nombre
3. Elimínalos manualmente uno por uno

## 📊 Casos de Prueba

### ✅ Caso 1: Notificaciones Aparecen al Abrir la App
- **Acción**: Abrir la aplicación
- **Resultado esperado**: 5 notificaciones visibles en la esquina superior derecha
- **Estado**: ⏳ Pendiente de probar

### ✅ Caso 2: Cerrar una Notificación
- **Acción**: Hacer clic en X de una notificación
- **Resultado esperado**: La notificación desaparece y no vuelve a aparecer
- **Estado**: ⏳ Pendiente de probar

### ✅ Caso 3: Notificaciones Persisten Entre Páginas
- **Acción**: Navegar a diferentes módulos (Dashboard, Empleados, etc.)
- **Resultado esperado**: Las notificaciones siguen visibles en todas las páginas
- **Estado**: ⏳ Pendiente de probar

### ✅ Caso 4: Actualización Automática
- **Acción**: Esperar 5 minutos sin interactuar
- **Resultado esperado**: Las notificaciones se recargan automáticamente
- **Estado**: ⏳ Pendiente de probar

### ✅ Caso 5: Sin Notificaciones
- **Acción**: Eliminar todos los adeudos de prueba
- **Resultado esperado**: No se muestra ninguna notificación
- **Estado**: ⏳ Pendiente de probar

### ✅ Caso 6: Dark Mode
- **Acción**: Cambiar a modo oscuro
- **Resultado esperado**: Las notificaciones se adaptan al tema oscuro
- **Estado**: ⏳ Pendiente de probar

## 🐛 Problemas Conocidos y Soluciones

### Problema 1: Las notificaciones no aparecen
**Posibles causas**:
- Backend no está corriendo
- No hay token de autenticación válido
- Los adeudos no tienen fecha de vencimiento
- Los adeudos ya están pagados

**Solución**:
1. Verifica que el backend esté corriendo
2. Verifica en DevTools → Network que el endpoint `/alertas` se llame
3. Verifica la respuesta del endpoint
4. Verifica que los adeudos tengan `estado: 'pendiente'` o `'parcial'`

### Problema 2: Las notificaciones no se cierran
**Posibles causas**:
- localStorage no está disponible
- Error en el evento onClick

**Solución**:
1. Abre DevTools → Console y busca errores
2. Verifica que localStorage funcione: `localStorage.setItem('test', '1')`

### Problema 3: Las notificaciones se muestran duplicadas
**Posibles causas**:
- El componente está montado dos veces
- Hay dos instancias del componente en el árbol

**Solución**:
1. Verifica que `AlertasVencimiento` solo esté en `App.jsx`
2. Verifica que no esté también en `AdeudosGenerales.jsx`

## 📝 Notas Adicionales

### Personalización

Para cambiar el intervalo de actualización:
```javascript
// En AlertasVencimiento.jsx, línea 14:
const interval = setInterval(cargarAlertas, 5 * 60 * 1000); // 5 minutos
// Cambiar a:
const interval = setInterval(cargarAlertas, 1 * 60 * 1000); // 1 minuto
```

### Agregar Sonido de Notificación

```javascript
// En AlertasVencimiento.jsx, en la función cargarAlertas:
if (response.data.data.length > 0) {
  const audio = new Audio('/notification-sound.mp3');
  audio.play().catch(e => console.log('No se pudo reproducir el sonido'));
}
```

### Limitar Número de Notificaciones Visibles

```javascript
// En AlertasVencimiento.jsx:
const alertasVisibles = alertas
  .filter(alerta => !alertasCerradas.includes(alerta.id_adeudo_general))
  .slice(0, 5); // Mostrar máximo 5 notificaciones
```

## ✅ Checklist de Prueba

- [ ] Backend corriendo en localhost:4000
- [ ] Desktop corriendo en localhost:3000
- [ ] 5 notificaciones visibles al abrir la app
- [ ] Notificaciones tienen colores correctos según urgencia
- [ ] Botón X cierra la notificación
- [ ] Notificación cerrada no vuelve a aparecer
- [ ] Notificaciones persisten al navegar entre páginas
- [ ] Notificaciones se adaptan al dark mode
- [ ] Endpoint `/alertas` responde correctamente
- [ ] localStorage guarda las notificaciones cerradas

---

**Fecha de creación**: 25 de octubre de 2025  
**Versión del sistema**: 2.0.0  
**Base de datos**: Local (sistema_gestion)
