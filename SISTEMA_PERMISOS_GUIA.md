# 🔐 Sistema de Permisos - Guía Completa

## 📋 Índice
1. [Arquitectura del Sistema](#arquitectura)
2. [Estructura de Base de Datos](#estructura-bd)
3. [Instalación y Configuración](#instalacion)
4. [Gestión de Permisos](#gestion)
5. [Pruebas y Validación](#pruebas)
6. [Casos de Uso](#casos-uso)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Sistema {#arquitectura}

El sistema de permisos se basa en **RBAC (Role-Based Access Control)** con tres tablas principales:

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Roles     │──────│  Permisos_Rol    │──────│ Acciones_Permiso│
│             │ 1:N  │                  │ N:1  │                 │
│ - id_rol    │      │ - id_permiso     │      │ - id_accion     │
│ - nombre    │      │ - id_rol         │      │ - codigo        │
│ - desc      │      │ - id_accion      │      │ - nombre        │
└─────────────┘      │ - permitido      │      │ - modulo        │
                     └──────────────────┘      └─────────────────┘
```

### Flujo de Autorización

```
Usuario → Rol → Permisos_Rol → Acciones_Permiso → Módulo/Acción
```

---

## 🗄️ Estructura de Base de Datos {#estructura-bd}

### Tabla: `roles`
```sql
CREATE TABLE roles (
  id_rol INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Roles predefinidos:**
- `admin` (id_rol = 1): Acceso total al sistema
- `supervisor`: Gestión de equipos y proyectos
- `operador`: Operaciones básicas
- `consulta`: Solo lectura

### Tabla: `acciones_permisos`
```sql
CREATE TABLE acciones_permisos (
  id_accion INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  codigo VARCHAR(30) UNIQUE NOT NULL,
  descripcion TEXT,
  modulo VARCHAR(30) NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Formato de código:** `modulo.accion`
- Ejemplo: `empleados.ver`, `nomina.crear`, `adeudos.liquidar`

### Tabla: `permisos_rols`
```sql
CREATE TABLE permisos_rols (
  id_permiso INT PRIMARY KEY AUTO_INCREMENT,
  id_rol INT NOT NULL,
  id_accion INT NOT NULL,
  permitido BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_rol) REFERENCES roles(id_rol),
  FOREIGN KEY (id_accion) REFERENCES acciones_permisos(id_accion)
);
```

---

## 🚀 Instalación y Configuración {#instalacion}

### Paso 1: Ejecutar Script de Inicialización

```bash
# Desde la raíz del proyecto
mysql -u root -p gestion_vlock < backend/api/src/scripts/init_all_permissions.sql
```

O desde MySQL Workbench/phpMyAdmin:
1. Abrir el archivo `init_all_permissions.sql`
2. Ejecutar todo el script
3. Verificar las consultas de validación al final

### Paso 2: Verificar la Instalación

```bash
# Ejecutar script de prueba
cd backend/api/src
node scripts/test_permissions.js
```

**Salida esperada:**
```
✅ Conexión exitosa

📊 ESTADÍSTICAS GENERALES
Total de permisos en el sistema: 85

📦 PERMISOS POR MÓDULO
  dashboard           → 1 permisos
  empleados           → 5 permisos
  nomina              → 7 permisos
  ...
```

### Paso 3: Crear Roles Personalizados

```sql
-- Ejemplo: Crear rol "Supervisor"
INSERT INTO roles (nombre, descripcion)
VALUES ('supervisor', 'Supervisor de operaciones y personal');

-- Asignar permisos específicos
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 
  (SELECT id_rol FROM roles WHERE nombre = 'supervisor'),
  id_accion,
  1
FROM acciones_permisos
WHERE codigo IN (
  'dashboard.ver',
  'empleados.ver',
  'empleados.crear',
  'empleados.editar',
  'nomina.ver',
  'proyectos.ver',
  'suministros.ver'
);
```

---

## 🎯 Gestión de Permisos {#gestion}

### Módulos del Sistema

| Módulo | Código | Acciones Típicas |
|--------|--------|------------------|
| Dashboard | `dashboard` | ver |
| Empleados | `empleados` | ver, crear, editar, eliminar, exportar |
| Nómina | `nomina` | ver, crear, editar, eliminar, procesar, exportar, historial |
| Contratos | `contratos` | ver, crear, editar, eliminar, exportar |
| Oficios | `oficios` | ver, crear, editar, eliminar, exportar |
| Proyectos | `proyectos` | ver, crear, editar, eliminar, finanzas, exportar |
| Presupuestos | `presupuestos` | ver, crear, editar, eliminar, aprobar, exportar |
| Suministros | `suministros` | ver, crear, editar, eliminar, movimientos, entrada, salida, exportar |
| Proveedores | `proveedores` | ver, crear, editar, eliminar, exportar |
| Herramientas | `herramientas` | ver, crear, editar, eliminar, movimientos, asignar, devolver, exportar |
| Adeudos | `adeudos` | ver, crear, editar, eliminar, liquidar, pago_parcial, exportar |
| Auditoría | `auditoria` | ver, exportar, limpiar |
| Usuarios | `usuarios` | ver, crear, editar, eliminar, cambiar_password, toggle_estado |
| Roles | `roles` | ver, crear, editar, eliminar, asignar_permisos |
| Configuración | `configuracion` | ver, editar, respaldos |
| Reportes | `reportes` | ver, generar, exportar |

### Asignar Permisos a un Rol

```sql
-- Ver permisos disponibles para un módulo
SELECT id_accion, codigo, nombre, descripcion
FROM acciones_permisos
WHERE modulo = 'empleados';

-- Asignar permiso específico
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
VALUES (2, 15, 1); -- Rol 2, Acción 15, Permitido

-- Asignar múltiples permisos de un módulo
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 2, id_accion, 1
FROM acciones_permisos
WHERE modulo = 'suministros';
```

### Revocar Permisos

```sql
-- Método 1: Marcar como no permitido
UPDATE permisos_rols
SET permitido = 0
WHERE id_rol = 2 AND id_accion = 15;

-- Método 2: Eliminar el registro
DELETE FROM permisos_rols
WHERE id_rol = 2 AND id_accion = 15;
```

### Consultas Útiles

```sql
-- Ver todos los permisos de un rol
SELECT 
  r.nombre as rol,
  ap.modulo,
  ap.codigo,
  ap.nombre as permiso,
  pr.permitido
FROM permisos_rols pr
JOIN roles r ON pr.id_rol = r.id_rol
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE r.id_rol = 2
ORDER BY ap.modulo, ap.codigo;

-- Ver qué roles tienen un permiso específico
SELECT 
  r.nombre as rol,
  ap.codigo as permiso,
  pr.permitido
FROM permisos_rols pr
JOIN roles r ON pr.id_rol = r.id_rol
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE ap.codigo = 'empleados.eliminar';

-- Copiar permisos de un rol a otro
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 3, id_accion, permitido
FROM permisos_rols
WHERE id_rol = 2;
```

---

## 🧪 Pruebas y Validación {#pruebas}

### 1. Prueba de Acceso al Sidebar

El sidebar filtra automáticamente los módulos según permisos:

```javascript
// En Sidebar.jsx
const modulePermissionMap = {
  'empleados': 'empleados.ver',
  'nomina': 'nomina.ver',
  'contratos': 'contratos.ver',
  // ...
};
```

**Prueba:**
1. Crear usuario con rol limitado
2. Iniciar sesión
3. Verificar que solo aparecen módulos permitidos

### 2. Prueba de Acceso a Componentes

```javascript
// Ejemplo en un componente
import { usePermissions } from '../contexts/PermissionsContext';

function EmpleadosPage() {
  const { hasPermission } = usePermissions();
  
  const canCreate = hasPermission('empleados.crear');
  const canEdit = hasPermission('empleados.editar');
  const canDelete = hasPermission('empleados.eliminar');
  
  return (
    <div>
      {canCreate && <button>Crear Empleado</button>}
      {canEdit && <button>Editar</button>}
      {canDelete && <button>Eliminar</button>}
    </div>
  );
}
```

### 3. Prueba Backend (Middleware)

```javascript
// Ejemplo de middleware de permisos
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    
    // Obtener permisos del usuario
    const hasAccess = await checkUserPermission(userId, requiredPermission);
    
    if (!hasAccess) {
      return res.status(403).json({
        error: 'No tienes permisos para esta acción'
      });
    }
    
    next();
  };
};

// Uso en rutas
router.post('/empleados', 
  authMiddleware,
  checkPermission('empleados.crear'),
  empleadosController.create
);
```

### 4. Script de Prueba Automatizada

```bash
# Ejecutar test completo
node backend/api/src/scripts/test_permissions.js

# Verificar permisos de un usuario específico
# (Crear script personalizado si es necesario)
```

---

## 💼 Casos de Uso {#casos-uso}

### Caso 1: Operador de Campo

**Perfil:** Solo necesita ver y registrar información básica

```sql
-- Crear rol
INSERT INTO roles (nombre, descripcion)
VALUES ('operador_campo', 'Operador de campo con acceso limitado');

-- Asignar permisos
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 
  (SELECT id_rol FROM roles WHERE nombre = 'operador_campo'),
  id_accion,
  1
FROM acciones_permisos
WHERE codigo IN (
  'dashboard.ver',
  'proyectos.ver',
  'suministros.ver',
  'suministros.salida',
  'herramientas.ver',
  'herramientas.asignar',
  'herramientas.devolver'
);
```

### Caso 2: Contador/Finanzas

**Perfil:** Acceso completo a módulos financieros

```sql
INSERT INTO roles (nombre, descripcion)
VALUES ('contador', 'Responsable de finanzas y nómina');

INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 
  (SELECT id_rol FROM roles WHERE nombre = 'contador'),
  id_accion,
  1
FROM acciones_permisos
WHERE modulo IN ('nomina', 'adeudos', 'proyectos', 'presupuestos', 'reportes')
   OR codigo = 'dashboard.ver';
```

### Caso 3: Gerente de Proyectos

**Perfil:** Gestión completa de proyectos y recursos

```sql
INSERT INTO roles (nombre, descripcion)
VALUES ('gerente_proyectos', 'Gerente de proyectos y recursos');

INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 
  (SELECT id_rol FROM roles WHERE nombre = 'gerente_proyectos'),
  id_accion,
  1
FROM acciones_permisos
WHERE modulo IN (
  'dashboard', 'proyectos', 'presupuestos', 'suministros', 
  'proveedores', 'herramientas', 'empleados'
)
AND codigo NOT LIKE '%.eliminar'; -- Sin permisos de eliminación
```

### Caso 4: Auditor/Solo Lectura

**Perfil:** Solo consulta, sin modificaciones

```sql
INSERT INTO roles (nombre, descripcion)
VALUES ('auditor', 'Auditor con acceso de solo lectura');

INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 
  (SELECT id_rol FROM roles WHERE nombre = 'auditor'),
  id_accion,
  1
FROM acciones_permisos
WHERE codigo LIKE '%.ver' OR codigo LIKE '%.exportar';
```

---

## 🔧 Troubleshooting {#troubleshooting}

### Problema: Usuario no ve ningún módulo

**Diagnóstico:**
```sql
-- Verificar rol del usuario
SELECT u.nombre_usuario, r.nombre as rol
FROM usuarios u
LEFT JOIN roles r ON u.id_rol = r.id_rol
WHERE u.id_usuario = 5;

-- Verificar permisos del rol
SELECT COUNT(*) as total_permisos
FROM permisos_rols
WHERE id_rol = (SELECT id_rol FROM usuarios WHERE id_usuario = 5);
```

**Solución:**
1. Asignar rol al usuario si no tiene
2. Asignar permisos al rol
3. Refrescar permisos en el frontend (botón en sidebar)

### Problema: Permisos no se actualizan

**Causa:** Cache de permisos en frontend

**Solución:**
```javascript
// En PermissionsContext.jsx
const refreshPermissions = async () => {
  // Limpiar cache
  localStorage.removeItem('user_permissions');
  
  // Recargar permisos
  await loadUserPermissions();
};
```

### Problema: Error "Permission denied" en backend

**Diagnóstico:**
```sql
-- Verificar si el permiso existe
SELECT * FROM acciones_permisos WHERE codigo = 'empleados.crear';

-- Verificar si está asignado al rol
SELECT pr.*, ap.codigo
FROM permisos_rols pr
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE pr.id_rol = 2 AND ap.codigo = 'empleados.crear';
```

**Solución:**
- Asignar el permiso faltante al rol
- Verificar que el middleware esté usando el código correcto

### Problema: Rol Admin no tiene todos los permisos

**Solución:**
```sql
-- Re-ejecutar asignación de permisos al admin
INSERT INTO permisos_rols (id_rol, id_accion, permitido)
SELECT 1, ap.id_accion, 1
FROM acciones_permisos ap
WHERE NOT EXISTS (
  SELECT 1
  FROM permisos_rols pr
  WHERE pr.id_rol = 1 AND pr.id_accion = ap.id_accion
);
```

---

## 📝 Checklist de Implementación

- [ ] Ejecutar `init_all_permissions.sql`
- [ ] Verificar con `test_permissions.js`
- [ ] Crear roles personalizados según necesidades
- [ ] Asignar permisos a cada rol
- [ ] Crear usuarios de prueba con diferentes roles
- [ ] Probar acceso al sidebar con cada rol
- [ ] Probar acceso a funcionalidades específicas
- [ ] Implementar middleware de permisos en backend
- [ ] Documentar permisos de cada rol
- [ ] Capacitar usuarios sobre el sistema

---

## 🎓 Mejores Prácticas

1. **Principio de Menor Privilegio:** Asigna solo los permisos necesarios
2. **Roles Específicos:** Crea roles por función, no por persona
3. **Auditoría Regular:** Revisa permisos periódicamente
4. **Documentación:** Mantén actualizada la matriz de permisos
5. **Testing:** Prueba con usuarios reales antes de producción
6. **Backup:** Respalda la configuración de permisos antes de cambios grandes

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar esta guía
2. Ejecutar `test_permissions.js` para diagnóstico
3. Verificar logs de auditoría
4. Consultar con el equipo de desarrollo

---

**Última actualización:** 2025-01-24
**Versión del sistema:** 1.0.0
