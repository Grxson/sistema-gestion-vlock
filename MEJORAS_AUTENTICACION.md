# Mejoras en Sistema de Autenticación y Sesiones

## 📋 Resumen de Cambios

Se ha implementado un sistema de autenticación más robusto que resuelve los problemas de:
- Sesiones que expiran sin aviso
- Logout que falla cuando el token está expirado
- Necesidad de limpiar preferencias manualmente
- Errores de conexión que rompen el flujo de login
- Error "Sesión expirada" mostrado incorrectamente durante login con credenciales inválidas

## 🔧 Cambios Implementados

### Backend

#### 1. Controlador de Autenticación (`/backend/api/src/controllers/auth.controller.js`)

**Cambio en `logout()`:**
- Ahora devuelve status 200 incluso si hay errores
- La auditoría es opcional (no falla el logout si falla)
- Manejo robusto de excepciones

```javascript
// Antes: Fallaba si había error en auditoría
// Ahora: Siempre devuelve 200 con success: true
```

#### 2. Middleware de Autenticación (`/backend/api/src/middlewares/auth.js`)

**Mejoras:**
- Códigos de error específicos para diferentes casos
- Mejor información en respuestas de error
- Timestamps en errores de token expirado

**Códigos de error:**
- `TOKEN_EXPIRED` - Token expirado
- `INVALID_TOKEN` - Token inválido
- `NO_TOKEN` - No hay token en la solicitud
- `AUTH_ERROR` - Error genérico de autenticación

### Frontend

#### 1. Servicio API (`/desktop/src/renderer/services/api.js`)

**Mejoras en `clearAuthData()`:**
- Limpia todos los items de autenticación: token, user, authState, currentPath
- Manejo de errores en limpieza

**Mejoras en `logout()`:**
- Usa fetch directo para evitar interferencias del middleware
- Resiliente a errores de conexión
- SIEMPRE limpia datos locales al final
- Logging detallado del proceso

**Mejoras en manejo de 401:**
- Parsea el código de error del servidor
- Diferencia entre TOKEN_EXPIRED e INVALID_TOKEN
- **Solo limpia datos si es TOKEN_EXPIRED**, no en otros errores 401
- Permite que credenciales inválidas se muestren correctamente

#### 2. AuthContext (`/desktop/src/renderer/contexts/AuthContext.jsx`)

**Mejoras en `checkAuth()`:**
- Verifica expiración local del token ANTES de llamar al servidor
- Manejo diferenciado de errores
- No muestra notificación de sesión expirada en verificación inicial
- Limpia datos si el token está expirado

**Mejoras en `logout()`:**
- Es async y maneja errores correctamente
- Siempre limpia el estado local
- Logging detallado

#### 3. Componente Login (`/desktop/src/renderer/components/Login.jsx`)

**Nuevas características:**
- Detecta sesión expirada al montar el componente
- Muestra advertencia visual si hay sesión expirada
- Reintentos automáticos en errores de conexión (hasta 2 intentos)
- Limpia datos de sesión expirada automáticamente
- **Diferencia entre credenciales inválidas y sesión expirada**
- Muestra mensajes de error específicos según el tipo de error

## 🔄 Flujos de Autenticación Mejorados

### Flujo de Inicio de Aplicación

```
1. AuthProvider monta
2. useEffect llama a checkAuth()
3. Verifica si hay token en localStorage
4. Verifica expiración local del token
   ├─ Si expirado → Limpia datos, desautentica
   └─ Si válido → Verifica con servidor
5. Si servidor devuelve 401 → Limpia datos, desautentica
6. Si válido → Autentica usuario
```

### Flujo de Login

```
1. Usuario ingresa credenciales
2. Intenta login
3. Si error de conexión → Reintenta (hasta 2 veces)
4. Si credenciales inválidas → Muestra error
5. Si éxito → Guarda token y usuario, autentica
```

### Flujo de Logout

```
1. Usuario hace clic en Logout
2. Intenta notificar al servidor (sin fallar si hay error)
3. Limpia SIEMPRE los datos locales:
   ├─ token
   ├─ user
   ├─ authState
   └─ currentPath
4. Limpia estado del AuthContext
5. Redirige a login
```

### Flujo de Sesión Expirada

```
1. Usuario intenta hacer una acción
2. Servidor devuelve 401 (TOKEN_EXPIRED o INVALID_TOKEN)
3. Cliente limpia datos automáticamente
4. Si estaba autenticado → Muestra notificación
5. Redirige a login
```

## ✅ Testing

### Test 1: Credenciales Inválidas
```
1. Ir a la pantalla de login
2. Ingresar usuario o contraseña incorrectos
3. Hacer clic en "Iniciar Sesión"
4. Debe mostrar error "Usuario o contraseña incorrectos"
5. NO debe mostrar "Sesión expirada"
6. Debe permitir reintentar
```

### Test 2: Sesión Expirada
```
1. Iniciar sesión con credenciales válidas
2. Esperar a que expire el token (o modificar JWT_EXPIRES en .env a "1s")
3. Intentar hacer una acción
4. Debe redirigir a login automáticamente
5. Debe mostrar notificación "Sesión expirada"
```

### Test 3: Error de Conexión en Login
```
1. Desconectar internet
2. Intentar login
3. Debe reintentar automáticamente (hasta 2 veces)
4. Debe mostrar error de conexión
5. Reconectar internet y reintentar
6. Debe funcionar correctamente
```

### Test 4: Logout con Token Expirado
```
1. Iniciar sesión
2. Esperar a que expire el token
3. Hacer clic en Logout
4. Debe funcionar sin errores
5. Debe limpiar datos locales
6. Debe redirigir a login
```

### Test 5: Cierre y Reapertura de App
```
1. Iniciar sesión
2. Cerrar aplicación
3. Abrir aplicación nuevamente
4. Debe verificar sesión automáticamente
5. Si token válido → Debe estar autenticado
6. Si token expirado → Debe redirigir a login
```

### Test 6: Sesión Expirada al Abrir App
```
1. Iniciar sesión
2. Esperar a que expire el token
3. Cerrar aplicación
4. Abrir aplicación nuevamente
5. Debe detectar token expirado
6. Debe limpiar datos automáticamente
7. Debe redirigir a login
```

## 📊 Logging y Debugging

### Logs en Consola

**AuthContext:**
```
[AuthContext] Verificando autenticación...
[AuthContext] Token encontrado, verificando con el servidor
[AuthContext] Autenticación verificada correctamente
[AuthContext] Usuario autenticado: usuario@email.com (ID: 1)
```

**API Service:**
```
[API:abc123] 🌐 Enviando petición a /auth/login
[API:abc123] ✅ Respuesta recibida (200) en 245ms
[API] Datos de autenticación limpiados completamente
```

**Login Component:**
```
[Login] Intentando iniciar sesión...
[Login] Error en intento 1: Error de conexión
[Login] Reintentando (1/2)...
```

## 🚀 Cómo Usar

### Para Desarrolladores

1. **Verificar autenticación:**
```javascript
const { isAuthenticated, user } = useAuth();
```

2. **Hacer login:**
```javascript
const { login } = useAuth();
await login({ usuario: 'user@email.com', password: 'password' });
```

3. **Hacer logout:**
```javascript
const { logout } = useAuth();
await logout();
```

4. **Verificar token:**
```javascript
import apiService from '../services/api';
const isExpired = apiService.isTokenExpired();
```

### Para Usuarios

1. **Si la sesión expira:**
   - Se mostrará una notificación
   - Serás redirigido a la pantalla de login
   - Inicia sesión nuevamente

2. **Si hay error de conexión:**
   - El sistema reintentará automáticamente
   - Si persiste, se mostrará un error
   - Haz clic en "Reintentar"

3. **Para cerrar sesión:**
   - Haz clic en "Cerrar sesión"
   - Se limpiarán todos los datos
   - Serás redirigido a la pantalla de login

## 🔐 Seguridad

- Los tokens se almacenan en localStorage (considerar sessionStorage en el futuro)
- Los tokens se validan en el servidor en cada solicitud
- Los tokens expirados se limpian automáticamente
- No se almacenan contraseñas en el cliente
- Las solicitudes de logout son resilientes a errores

## 📝 Notas Técnicas

- JWT_SECRET debe estar configurado en .env
- JWT_EXPIRES controla la duración del token (ej: "24h", "7d", "1s")
- El cliente verifica expiración localmente para mejor UX
- El servidor siempre verifica el token en cada solicitud
- Los errores de conexión se detectan automáticamente

## 🐛 Solución de Problemas

### "Sesión expirada" aparece constantemente
- Verificar que JWT_SECRET sea igual en backend y frontend
- Verificar que JWT_EXPIRES sea suficientemente largo
- Revisar logs en la consola del navegador

### Login no funciona
- Verificar conexión a internet
- Verificar que el backend esté corriendo
- Revisar logs en la consola del navegador
- Verificar credenciales

### Logout no funciona
- Es normal si el token está expirado
- Los datos se limpian automáticamente
- Actualizar la página si es necesario

## 📚 Referencias

- [JWT.io](https://jwt.io) - Información sobre JWT
- [MDN - localStorage](https://developer.mozilla.org/es/docs/Web/API/Window/localStorage)
- [Express.js Middleware](https://expressjs.com/es/guide/using-middleware.html)
