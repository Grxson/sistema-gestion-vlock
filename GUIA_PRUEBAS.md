# 🧪 GUÍA DE PRUEBAS - Sistema VLock

## 📋 Checklist de Pruebas Frontend

### 1️⃣ **Prueba de Login Administrador**
```
Email: admin@vlock.com
Password: admin123
```

**Verificaciones:**
- [ ] Login exitoso
- [ ] Sidebar muestra todos los módulos
- [ ] Botones de acción habilitados (Crear, Editar, Eliminar)
- [ ] Permisos en consola: 43 permisos

### 2️⃣ **Prueba de Login Usuario**
```
Email: usuario@vlock.com
Password: usuario123
```

**Verificaciones:**
- [ ] Login exitoso
- [ ] Sidebar muestra solo módulos de lectura
- [ ] Solo botones de "Ver" habilitados
- [ ] Permisos en consola: 6 permisos (Ver auditoría, Ver contratos, Ver empleados, Ver nómina, Ver oficios, Ver reportes)

### 3️⃣ **Pruebas de Debugging**

#### En la consola del navegador (F12):
```javascript
// Mostrar información de permisos
window._vlock_debug.permissions.show()

// Verificar permiso específico
window._vlock_debug.permissions.check('empleados.crear')
window._vlock_debug.permissions.check('empleados.ver')

// Actualizar permisos
window._vlock_debug.permissions.refresh()
```

### 4️⃣ **Módulos a Verificar**

**👨‍💼 ADMINISTRADOR debe ver:**
- ✅ Empleados (Ver, Crear, Editar, Eliminar)
- ✅ Nómina (Ver, Crear, Editar, Eliminar)
- ✅ Contratos (Ver, Crear, Editar, Eliminar)
- ✅ Oficios (Ver, Crear, Editar, Eliminar)
- ✅ Auditoría (Ver)
- ✅ Usuarios (Ver, Crear, Editar, Eliminar)
- ✅ Roles (Ver, Crear, Editar, Eliminar)
- ✅ Reportes (Ver, Generar)

**👤 USUARIO debe ver:**
- ✅ Empleados (Solo Ver)
- ✅ Nómina (Solo Ver)
- ✅ Contratos (Solo Ver)
- ✅ Oficios (Solo Ver)
- ✅ Auditoría (Solo Ver)
- ✅ Reportes (Solo Ver)
- ❌ Usuarios (NO debe aparecer)
- ❌ Roles (NO debe aparecer)

### 5️⃣ **Errores Comunes a Verificar**

1. **Si no aparecen permisos:**
   - Verificar que el backend esté corriendo en puerto 4000
   - Revisar la consola del navegador por errores de API
   - Verificar token JWT válido

2. **Si aparecen permisos incorrectos:**
   - Ejecutar en consola: `window._vlock_debug.permissions.refresh()`
   - Verificar rol del usuario en la respuesta del login

3. **Si hay errores de autenticación:**
   - Limpiar localStorage y volver a hacer login
   - Verificar que el token no haya expirado

### 🔍 **URLs de Prueba**

- **Aplicación:** http://localhost:3000
- **API Backend:** http://localhost:4000/api
- **Login Directo:** http://localhost:4000/api/auth/login
- **Permisos:** http://localhost:4000/api/auth/permissions

---

## 🎯 **Estado Actual**
- ✅ Backend funcionando (puerto 4000)
- ✅ Sistema de permisos configurado
- ✅ Cuentas de prueba creadas
- ✅ Frontend iniciando (puerto 3000)
- 🔄 Electron app abriendo...

**¡Lista para probar!** 🚀
