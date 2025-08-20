# Guía de Implementación - Manejo de Errores de Permisos

Este documento explica cómo implementar el manejo de errores de permisos en la aplicación VLock.

## Componentes Disponibles

### 1. `PermissionDenied.jsx`

Componente para mostrar un mensaje de error cuando el usuario no tiene permisos para acceder a una funcionalidad específica dentro de un componente.

```jsx
import PermissionDenied from './components/PermissionDenied';

// Uso
<PermissionDenied message="No tienes permiso para ver esta información" />
```

### 2. `AccessDenied.jsx`

Componente para mostrar un mensaje de error a nivel de página cuando el usuario no tiene acceso a un módulo completo.

```jsx
import AccessDenied from './components/AccessDenied';

// Uso
<AccessDenied moduleName="Usuarios" />
```

### 3. `ApiErrorHandler.jsx`

Componente para manejar errores de API, incluyendo errores de permisos, de manera uniforme.

```jsx
import ApiErrorHandler from './components/ui/ApiErrorHandler';

// Uso
<ApiErrorHandler
  apiCall={fetchDatos}
  onSuccess={(response) => {
    setDatos(response.datos || []);
  }}
  dependencies={[filtro1, filtro2]}
>
  {({ isLoading, executeCall }) => {
    if (isLoading) {
      return <Spinner />;
    }

    return (
      // Contenido del componente
    );
  }}
</ApiErrorHandler>
```

## Servicio API Mejorado

El servicio API ha sido mejorado para detectar y manejar mejor los errores de permisos (403) y otros errores HTTP comunes:

```javascript
// Ejemplo de manejo de errores en componentes
try {
  const data = await apiService.get('/ruta');
  // Manejar respuesta exitosa
} catch (error) {
  if (error.status === 403) {
    setPermissionDenied(true);
    setErrorMessage(error.message);
  } else {
    // Manejar otros errores
  }
}
```

## Pasos para Implementación

1. **Importar los componentes necesarios**:
   ```jsx
   import PermissionDenied from './components/PermissionDenied';
   import ApiErrorHandler from './components/ui/ApiErrorHandler';
   ```

2. **Opción 1: Usar ApiErrorHandler para componentes que hacen llamadas a la API**:
   ```jsx
   <ApiErrorHandler
     apiCall={fetchDatos}
     onSuccess={(response) => {
       // Manejar éxito
     }}
   >
     {({ isLoading }) => (
       // Render condicional
     )}
   </ApiErrorHandler>
   ```

3. **Opción 2: Manejar errores manualmente**:
   ```jsx
   const [permissionDenied, setPermissionDenied] = useState(false);
   const [errorMessage, setErrorMessage] = useState('');

   const fetchData = async () => {
     try {
       const response = await apiService.get('/ruta');
       // Manejar éxito
     } catch (error) {
       if (error.status === 403) {
         setPermissionDenied(true);
         setErrorMessage(error.message);
       }
     }
   };

   if (permissionDenied) {
     return <PermissionDenied message={errorMessage} />;
   }
   ```

## Mensajes de Error Personalizados

El servicio API proporciona mensajes de error predeterminados según el código de estado HTTP, pero puedes personalizarlos:

```javascript
// En el servicio API
getDefaultErrorMessage(statusCode) {
  const messages = {
    403: 'No tienes permisos para realizar esta acción.',
    // Otros códigos...
  };
  
  return messages[statusCode] || 'Error en la solicitud';
}
```

## Componentes que ya implementan este manejo

1. `Roles.jsx` - Implementa manejo manual de errores de permisos
2. `Usuarios.jsx` - Implementa el componente `ApiErrorHandler`

## Estrategia de Unificación de Permisos

Para unificar el manejo de permisos en toda la aplicación, se recomienda seguir este enfoque:

> **Nota:** Ver el diagrama de flujo de decisiones en `docs/permission-flow.md` para una representación visual del proceso.

### 1. Uso del Contexto de Permisos

Utilizar consistentemente el contexto de permisos para verificar permisos en todos los componentes:

```jsx
// En cualquier componente
import { usePermissions } from '../contexts/PermissionsContext';

function MiComponente() {
  const { hasPermission } = usePermissions();
  
  // Verificar permiso antes de mostrar contenido
  if (!hasPermission('modulo.accion')) {
    return <PermissionDenied message="No tienes permiso para ver esta sección" />;
  }
  
  return (
    // Contenido del componente
  );
}
```

### 2. Verificación a Nivel de Componente y Subcomponente

Para componentes complejos que incluyen múltiples acciones:

```jsx
function Empleados() {
  const { hasPermission } = usePermissions();
  
  // Permiso principal para ver el módulo
  if (!hasPermission('empleados.ver')) {
    return <AccessDenied moduleName="Empleados" />;
  }
  
  return (
    <div>
      <h1>Gestión de Empleados</h1>
      
      {/* Verificar permisos para acciones específicas */}
      {hasPermission('empleados.crear') && (
        <button onClick={handleCreate}>Crear Empleado</button>
      )}
      
      {/* Lista de empleados visible para todos con permiso 'ver' */}
      <ListaEmpleados />
      
      {/* Acciones por empleado según permisos */}
      {empleados.map(empleado => (
        <div key={empleado.id}>
          {empleado.nombre}
          {hasPermission('empleados.editar') && (
            <button onClick={() => handleEdit(empleado)}>Editar</button>
          )}
        </div>
      ))}
    </div>
  );
}

## Relación entre Permisos y Visibilidad de Módulos

### Permisos del Rol Usuario

El rol "Usuario" tiene los siguientes permisos configurados:

| Módulo | Ver | Crear | Editar | Eliminar | Otros |
|--------|-----|-------|--------|----------|-------|
| Auditoría | ✅ | - | - | - | Exportar ❌ |
| Configuración | ✅ | - | ✅ | - | - |
| Contratos | ✅ | ❌ | ❌ | ❌ | - |
| Empleados | ✅ | ✅ | ✅ | ✅ | - |
| Finanzas | ✅ | ✅ | ✅ | ✅ | Ingresos ✅ |
| Nómina | ✅ | ❌ | ❌ | ❌ | Procesar ❌ |
| Oficios | ✅ | ❌ | ❌ | ❌ | - |
| Proyectos | ✅ | ✅ | ✅ | ✅ | - |
| Reportes | ✅ | - | - | - | Generar ✅ |
| Roles | ❌ | ❌ | ❌ | ❌ | - |
| Usuarios | ✅ | ❌ | ❌ | ❌ | - |

### Problema Actual

Actualmente, en el sidebar se muestran todos los módulos incluso cuando el usuario no tiene permiso para acceder a ellos (como "Roles"). Esto causa confusión porque:

1. El usuario puede hacer clic en módulos como "Roles" donde no tiene permiso
2. Al hacerlo, ve el mensaje "Acceso denegado - No tiene permiso para realizar esta acción"

### Solución Recomendada

1. **Filtrar módulos en el sidebar**: Solo mostrar los módulos donde el usuario tenga al menos el permiso "ver"
2. **Mostrar acciones según permisos**: Dentro de cada módulo, mostrar/ocultar botones de acción según permisos específicos

> **Importante**: Para una propuesta detallada de implementación, ver el archivo `docs/sidebar-fix-proposal.md`

```jsx
// Ejemplo de filtrado en Sidebar.jsx
const filteredNavigation = navigation.filter(item => {
  // Solo mostrar si tiene permiso para ver ese módulo
  return hasPermission(`${item.module}.ver`);
});
```

```jsx
// Ejemplo de botones condicionales en componentes
{hasPermission('usuarios.crear') && (
  <button onClick={handleCreateUser}>
    <PlusIcon className="h-5 w-5" />
    Crear Usuario
  </button>
)}
```

## Próximos Pasos

1. Aplicar este patrón de manejo de errores a los siguientes componentes prioritarios:
   - Empleados.jsx
   - Nomina.jsx
   - Contratos.jsx

2. Actualizar la lógica del sidebar para solo mostrar módulos con permiso "ver"

3. Revisar y actualizar el componente Dashboard para manejar correctamente los permisos
