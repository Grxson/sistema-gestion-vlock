# Guía de Implementación: Sistema de Permisos

## Componentes de Permisos

### 1. Sidebar Visible Si Tiene "ver"

La barra lateral ahora muestra módulos solo si el usuario tiene el permiso básico de ver ese módulo:

```jsx
// En Sidebar.jsx
const hasAccess = hasPermission(permissionCode); // ejemplo: 'empleados.ver'
return hasAccess; // Solo muestra el módulo si tiene permiso
```

### 2. Botones de Acción Según Permisos

Dentro de cada módulo, los botones de acción (crear, editar, eliminar) aparecen de forma condicional:

#### Opción 1: PermissionButton (Recomendado)

El componente `PermissionButton` muestra un botón habilitado o deshabilitado según los permisos:

```jsx
<PermissionButton 
  permissionCode="empleados.crear"
  onClick={handleAction}
  disabledMessage="No tienes permiso para crear empleados"
>
  <PlusIcon className="h-4 w-4 mr-2" />
  Nuevo Empleado
</PermissionButton>
```

Características:
- Si no tiene permiso, muestra un botón deshabilitado con un ícono de advertencia
- Al pasar el mouse, muestra un tooltip explicativo
- Estilo visual consistente en toda la aplicación

#### Opción 2: PermissionGuard

Para contenido más complejo que un simple botón:

```jsx
<PermissionGuard 
  permissionCode="empleados.crear" 
  fallback={<MensajeDeAccesoDenegado />}
>
  {/* Contenido visible solo si tiene permiso */}
</PermissionGuard>
```

## Flujo de Experiencia de Usuario

1. **Usuario sin permisos para un módulo**
   - No ve el módulo en el sidebar

2. **Usuario con permiso "ver" pero sin otros permisos**
   - Ve el módulo en el sidebar
   - Dentro del módulo, ve la lista/datos
   - Botones de acción (crear, editar, eliminar) aparecen deshabilitados con indicadores visuales
   - Al pasar el mouse, se muestra un mensaje explicativo

3. **Usuario con todos los permisos**
   - Ve el módulo en el sidebar
   - Todos los botones de acción están habilitados

## Implementación en Nuevos Componentes

Para implementar este patrón en un nuevo componente:

1. Importar los componentes necesarios:
```jsx
import { usePermissions } from '../contexts/PermissionsContext';
import PermissionButton from './ui/PermissionButton';
```

2. Obtener la función `hasPermission`:
```jsx
const { hasPermission } = usePermissions();
```

3. Usar `PermissionButton` para las acciones:
```jsx
<PermissionButton 
  permissionCode="modulo.accion"
  onClick={handleAction}
>
  Texto del botón
</PermissionButton>
```

## Prueba de Permisos

Para probar diferentes permisos, puedes modificar los permisos del rol en la base de datos o usar el componente de administración de roles.
