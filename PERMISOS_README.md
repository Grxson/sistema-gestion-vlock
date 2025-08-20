# 📋 Sistema de Permisos VLock - Estado Actual

## 👥 Usuarios Configurados

### 🔧 Administrador
- **Email**: admin@vlock.com
- **Password**: admin123
- **Rol**: Administrador (ID: 1)
- **Permisos**: ✅ TODOS (43 permisos)

### 👤 Usuario de Prueba
- **Email**: usuario@vlock.com
- **Password**: usuario123
- **Rol**: Usuario (ID: 2)
- **Permisos**: ✅ LIMITADOS (6 permisos de solo lectura)

## 🛡️ Estructura de Permisos

### Rol 1: Administrador
- ✅ **Control total del sistema**
- ✅ Acceso a todos los módulos
- ✅ Todas las acciones (ver, crear, editar, eliminar)
- ✅ Gestión de usuarios y roles
- ✅ Configuración del sistema

### Rol 2: Usuario
- ✅ **Acceso limitado de solo lectura**
- ✅ Empleados: Solo ver
- ✅ Nómina: Solo ver
- ✅ Contratos: Solo ver
- ✅ Oficios: Solo ver
- ✅ Auditoría: Solo ver
- ✅ Reportes: Solo ver
- ❌ NO puede acceder a usuarios, roles o configuración
- ❌ NO puede crear, editar o eliminar

## 📁 Módulos del Sistema

| Módulo | Admin | Usuario | Descripción |
|--------|-------|---------|-------------|
| Dashboard | ✅ | ✅ | Siempre disponible |
| Empleados | ✅ CRUD | ✅ Ver | Gestión de empleados |
| Nómina | ✅ CRUD | ✅ Ver | Gestión de nóminas |
| Contratos | ✅ CRUD | ✅ Ver | Gestión de contratos |
| Oficios | ✅ CRUD | ✅ Ver | Gestión de oficios |
| Auditoría | ✅ CRUD | ✅ Ver | Registros de auditoría |
| Reportes | ✅ CRUD | ✅ Ver | Generación de reportes |
| Usuarios | ✅ CRUD | ❌ | Solo administradores |
| Roles | ✅ CRUD | ❌ | Solo administradores |
| Configuración | ✅ CRUD | ❌ | Solo administradores |
| Diagnóstico | ✅ | ✅ | Herramientas de diagnóstico |

## 🎛️ Gestión de Permisos

### Como Administrador puedes:
1. **Ver todos los roles**: Ir a `/roles`
2. **Editar permisos**: Hacer clic en "Gestionar Permisos" para cualquier rol
3. **Crear nuevos roles**: Botón "Nuevo Rol"
4. **Asignar permisos por módulo**: Toggle individual o por módulo completo

### Estructura de Códigos de Permiso:
```
{módulo}.{acción}

Ejemplos:
- empleados.ver
- empleados.crear
- empleados.editar
- empleados.eliminar
- usuarios.ver
- roles.permisos
```

## 🔧 Herramientas de Administración

### Scripts de Mantenimiento:
```bash
# Verificar permisos de un usuario
node seeders/check_permissions.js usuario@vlock.com

# Verificar todos los usuarios
node seeders/check_permissions.js

# Recrear permisos básicos
node seeders/init.js

# Corregir permisos del rol Usuario
node seeders/fix_user_permissions.js

# Crear usuario de prueba
node seeders/create_test_user.js
```

### Página de Diagnóstico:
- **URL**: `/diagnostico`
- **Acceso**: Todos los usuarios autenticados
- **Funciones**:
  - Ver información del sistema
  - Depurar permisos
  - Limpiar caché
  - Reiniciar aplicación

## 🧪 Testing

### Para probar el sistema:
1. **Como Admin**: Iniciar sesión con admin@vlock.com
   - Deberías ver todos los módulos en el sidebar
   - Todos los botones deberían estar habilitados

2. **Como Usuario**: Iniciar sesión con usuario@vlock.com
   - Solo deberías ver: Dashboard, Empleados, Nómina, Contratos, Oficios, Auditoría, Reportes
   - NO deberías ver: Usuarios, Roles, Configuración
   - Los botones de crear/editar/eliminar deberían estar deshabilitados

### Verificación en Navegador:
```javascript
// En la consola del navegador:
window._vlock_debug.showPermissions()
```

## 🔄 Flujo de Trabajo

### Administración de Permisos:
1. **Admin inicia sesión**
2. **Va a `/roles`**
3. **Selecciona un rol**
4. **Hace clic en "Gestionar Permisos"**
5. **Activa/desactiva permisos por módulo o individualmente**
6. **Guarda cambios**
7. **Los usuarios con ese rol ven los cambios inmediatamente**

### Desarrollo:
1. **Crear nuevos permisos**: Agregar a `seeders/init.js`
2. **Actualizar frontend**: Usar `hasPermission('codigo.permiso')`
3. **Proteger componentes**: Usar `PermissionButton` o verificar en render
4. **Proteger rutas**: Verificar permisos en el backend

## ✅ Estado Actual

- ✅ Sistema de permisos implementado
- ✅ Roles configurados correctamente
- ✅ Usuarios de prueba creados
- ✅ Frontend actualizado con verificación de permisos
- ✅ Backend protegido con middleware de autenticación
- ✅ Herramientas de diagnóstico disponibles
- ✅ Scripts de mantenimiento creados

¡El sistema está listo para uso y testing! 🚀
