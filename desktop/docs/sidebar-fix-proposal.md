# Propuesta: Corrección del Sidebar para Permisos de Módulos

## Problema Actual

El sidebar actual muestra todos los módulos para usuarios normales, incluso cuando no tienen permiso para acceder a ellos:

1. **Módulos siempre visibles**: 
   ```javascript
   // Basado en las capturas, siempre mostramos ciertos módulos 
   if (['empleados', 'contratos', 'nomina', 'oficios', 'auditoria', 'config'].includes(item.permissionModule)) {
     console.log(`[Sidebar] Módulo básico habilitado: ${item.name}`);
     return true;
   }
   ```

2. **Verificación incorrecta de permisos**: El código no verifica el permiso específico `.ver` para cada módulo.

## Solución Propuesta

Modificar el código del sidebar para verificar explícitamente el permiso "ver" de cada módulo:

```jsx
// Mostrar elementos de navegación
const navigation = navigationItems.filter(item => {
  // El dashboard siempre es visible para todos los usuarios autenticados
  if (item.href === '/') return true;
  
  // Si está cargando permisos, no mostrar módulos hasta que esté listo
  if (permissionsLoading) {
    console.log(`[Sidebar] Módulo ${item.name}: Cargando permisos...`);
    return item.href === '/';
  }
  
  // Para usuarios admin, mostrar todos los módulos
  if (user?.rol === 'admin' || user?.id_rol === 1) {
    console.log(`[Sidebar] Usuario admin, mostrando módulo: ${item.name}`);
    return true;
  }

  // Convertir el módulo a su código de permiso correspondiente
  const modulePermissionMap = {
    'empleados': 'empleados.ver',
    'nomina': 'nomina.ver',
    'contratos': 'contratos.ver', 
    'oficios': 'oficios.ver',
    'auditoria': 'auditoria.ver',
    'reportes': 'reportes.ver',
    'usuarios': 'usuarios.ver',
    'roles': 'roles.ver',
    'config': 'configuracion.ver'
  };
  
  // Obtener el código de permiso para este módulo
  const permissionCode = modulePermissionMap[item.permissionModule];
  
  if (!permissionCode) {
    console.error(`[Sidebar] No se encontró código de permiso para el módulo: ${item.permissionModule}`);
    return false;
  }
  
  // Verificar si el usuario tiene el permiso específico "ver" para este módulo
  const hasAccess = hasPermission(permissionCode);
  console.log(`[Sidebar] Módulo ${item.name} (${permissionCode}): ${hasAccess ? 'Visible' : 'Oculto'}`);
  return hasAccess;
});
```

## Cambios Necesarios

1. **Importar la función `hasPermission`**:
   ```jsx
   const { hasModuleAccess, hasPermission, loading: permissionsLoading } = usePermissions();
   ```

2. **Crear un mapa de módulos a códigos de permiso** para traducir correctamente los nombres de módulos a los códigos de permiso utilizados en el backend.

3. **Eliminar la lista fija** de módulos que siempre se muestran, y en su lugar verificar cada permiso específico.

4. **Documentar el cambio** para mantener consistencia en futuras actualizaciones.

## Ventajas de este Enfoque

1. **Coherencia con los permisos reales**: Los módulos mostrados coincidirán exactamente con los permisos del usuario
2. **Mejor experiencia de usuario**: No se mostrarán módulos inaccesibles que generen errores de permisos
3. **Mantenimiento más sencillo**: Cualquier cambio en los permisos se reflejará automáticamente en el sidebar
