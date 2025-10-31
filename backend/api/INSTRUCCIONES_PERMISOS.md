# 🔐 Configuración de Permisos - Guía Rápida

## ⚠️ Problema Actual
El sistema muestra "¡Advertencia! El usuario solo tiene acceso al Dashboard" porque:
1. La tabla `acciones_permiso` está vacía o incompleta
2. El backend necesita reiniciarse para aplicar cambios
3. Los roles no tienen permisos asignados

## ✅ Solución en 3 Pasos

### Paso 1: Poblar Catálogo de Acciones
```bash
cd backend/api
node src/scripts/seed-acciones-permiso.js
```

**Qué hace:**
- Inserta/actualiza ~100 acciones de permiso en la tabla `acciones_permiso`
- Es idempotente (puedes ejecutarlo múltiples veces sin problemas)
- Cubre todos los módulos: empleados, nómina, suministros, proyectos, etc.

**Salida esperada:**
```
✓ Creado: empleados.ver (Ver empleados)
✓ Creado: empleados.crear (Crear empleado)
...
✔ Permisos sincronizados correctamente.
```

### Paso 2: Reiniciar Backend
```bash
# Detener el servidor (Ctrl+C)
# Volver a iniciar
npm run dev
```

**Por qué:**
- El controlador de auth ahora devuelve códigos en lugar de nombres
- Necesita reiniciarse para aplicar los cambios

### Paso 3: Asignar Permisos al Rol Admin

**Opción A: Desde la UI (Recomendado)**
1. Inicia sesión como admin
2. Ve a "Roles" en el menú
3. Edita el rol "Administrador"
4. Marca todos los permisos que desees
5. Guarda

**Opción B: Desde la API (Rápido para testing)**
```bash
# Asignar TODOS los permisos al rol admin (id_rol = 1)
# Primero obtén todos los id_accion:
curl http://localhost:4000/api/roles/acciones-permiso/all \
  -H "Authorization: Bearer TU_TOKEN"

# Luego asigna todos (ejemplo con 10 acciones):
curl -X PUT http://localhost:4000/api/roles/1/permisos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN" \
  -d '{
    "permisos": [
      {"id_accion": 1, "permitido": true},
      {"id_accion": 2, "permitido": true},
      {"id_accion": 3, "permitido": true}
      // ... resto de acciones
    ]
  }'
```

**Opción C: Script SQL directo (Más rápido)**
```sql
-- Asignar TODOS los permisos al rol admin (id_rol = 1)
INSERT INTO permisos_rol (id_rol, id_accion, permitido)
SELECT 1, id_accion, 1
FROM acciones_permiso
ON DUPLICATE KEY UPDATE permitido = 1;
```

### Paso 4: Refrescar Permisos en el Cliente
1. En la app, cierra sesión
2. Vuelve a iniciar sesión
3. O borra el hash de permisos en consola del navegador:
   ```javascript
   localStorage.removeItem('vlock_permissions_hash')
   location.reload()
   ```

## 🔍 Verificación

### Backend
```bash
# Ver todas las acciones disponibles
curl http://localhost:4000/api/roles/acciones-permiso/all \
  -H "Authorization: Bearer TU_TOKEN"

# Ver permisos del usuario actual
curl http://localhost:4000/api/auth/permissions \
  -H "Authorization: Bearer TU_TOKEN"
```

**Respuesta esperada:**
```json
{
  "message": "Permisos obtenidos exitosamente",
  "permisos": [
    "empleados.ver",
    "empleados.crear",
    "nomina.ver",
    ...
  ],
  "permisos_nombres": [
    "Ver empleados",
    "Crear empleado",
    ...
  ]
}
```

### Frontend (Consola del navegador)
```javascript
// Ver permisos cargados
window._vlock_debug.permissions.show()

// Verificar un permiso específico
window._vlock_debug.permissions.check('empleados.ver')
```

## 📋 Checklist

- [ ] Ejecutar `seed-acciones-permiso.js`
- [ ] Reiniciar backend
- [ ] Asignar permisos al rol admin
- [ ] Cerrar sesión y volver a iniciar
- [ ] Verificar que aparecen más módulos en el menú
- [ ] Confirmar que no aparece el warning "solo Dashboard"

## 🐛 Solución de Problemas

### "Permiso no reconocido: ..."
- Ejecuta el seeder de nuevo
- Verifica que el backend se reinició

### "Solo acceso al Dashboard"
- Verifica que el rol tiene permisos asignados en `permisos_rol`
- Ejecuta: `SELECT * FROM permisos_rol WHERE id_rol = 1;`
- Debe haber múltiples filas con `permitido = 1`

### Error de source map (installHook.js.map)
- Es un warning inofensivo del navegador
- No afecta la funcionalidad
- Puedes ignorarlo

## 📚 Archivos Relacionados

**Backend:**
- `/backend/api/src/scripts/seed-acciones-permiso.js` - Script de seeding
- `/backend/api/src/controllers/auth.controller.js` - Devuelve códigos
- `/backend/api/src/models/accionesPermiso.model.js` - Modelo de acciones

**Frontend:**
- `/desktop/src/renderer/contexts/PermissionsContext.jsx` - Mapeo dinámico
- `/desktop/src/renderer/components/Sidebar.jsx` - Usa permisos para menú

## 🎯 Resultado Esperado

Después de seguir estos pasos:
- ✅ El menú lateral muestra todos los módulos permitidos
- ✅ No aparece el warning "solo Dashboard"
- ✅ Los permisos se cargan dinámicamente desde el backend
- ✅ Puedes gestionar permisos desde la UI de Roles
