-- ============================================================================
-- SCRIPT DE INICIALIZACIÓN COMPLETA DE PERMISOS
-- Sistema de Gestión V-Lock
-- ============================================================================
-- Este script crea TODOS los permisos necesarios para el sistema
-- y los asigna automáticamente al rol de Administrador (id_rol = 1)
-- ============================================================================

START TRANSACTION;

-- ============================================================================
-- 1. MÓDULO: DASHBOARD
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver Dashboard', 'dashboard.ver', 'Acceso al panel principal del sistema', 'dashboard', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 2. MÓDULO: EMPLEADOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver empleados', 'empleados.ver', 'Puede ver el listado de empleados', 'empleados', NOW(), NOW()),
  ('Crear empleado', 'empleados.crear', 'Puede registrar nuevos empleados', 'empleados', NOW(), NOW()),
  ('Editar empleado', 'empleados.editar', 'Puede editar información de empleados', 'empleados', NOW(), NOW()),
  ('Eliminar empleado', 'empleados.eliminar', 'Puede eliminar empleados del sistema', 'empleados', NOW(), NOW()),
  ('Exportar empleados', 'empleados.exportar', 'Puede exportar listado de empleados', 'empleados', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 3. MÓDULO: NÓMINA
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver nómina', 'nomina.ver', 'Puede ver información de nómina', 'nomina', NOW(), NOW()),
  ('Crear nómina', 'nomina.crear', 'Puede crear registros de nómina', 'nomina', NOW(), NOW()),
  ('Editar nómina', 'nomina.editar', 'Puede modificar nóminas existentes', 'nomina', NOW(), NOW()),
  ('Eliminar nómina', 'nomina.eliminar', 'Puede eliminar registros de nómina', 'nomina', NOW(), NOW()),
  ('Procesar nómina', 'nomina.procesar', 'Puede procesar y calcular nóminas', 'nomina', NOW(), NOW()),
  ('Exportar nómina', 'nomina.exportar', 'Puede exportar reportes de nómina', 'nomina', NOW(), NOW()),
  ('Ver historial nómina', 'nomina.historial', 'Puede ver historial de pagos', 'nomina', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 4. MÓDULO: CONTRATOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver contratos', 'contratos.ver', 'Puede ver listado de contratos', 'contratos', NOW(), NOW()),
  ('Crear contrato', 'contratos.crear', 'Puede crear nuevos contratos', 'contratos', NOW(), NOW()),
  ('Editar contrato', 'contratos.editar', 'Puede editar contratos existentes', 'contratos', NOW(), NOW()),
  ('Eliminar contrato', 'contratos.eliminar', 'Puede eliminar contratos', 'contratos', NOW(), NOW()),
  ('Exportar contratos', 'contratos.exportar', 'Puede exportar contratos', 'contratos', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 5. MÓDULO: OFICIOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver oficios', 'oficios.ver', 'Puede ver listado de oficios', 'oficios', NOW(), NOW()),
  ('Crear oficio', 'oficios.crear', 'Puede crear nuevos oficios', 'oficios', NOW(), NOW()),
  ('Editar oficio', 'oficios.editar', 'Puede editar oficios existentes', 'oficios', NOW(), NOW()),
  ('Eliminar oficio', 'oficios.eliminar', 'Puede eliminar oficios', 'oficios', NOW(), NOW()),
  ('Exportar oficios', 'oficios.exportar', 'Puede exportar oficios', 'oficios', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 6. MÓDULO: PROYECTOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver proyectos', 'proyectos.ver', 'Puede ver listado de proyectos', 'proyectos', NOW(), NOW()),
  ('Crear proyecto', 'proyectos.crear', 'Puede crear nuevos proyectos', 'proyectos', NOW(), NOW()),
  ('Editar proyecto', 'proyectos.editar', 'Puede editar proyectos existentes', 'proyectos', NOW(), NOW()),
  ('Eliminar proyecto', 'proyectos.eliminar', 'Puede eliminar proyectos', 'proyectos', NOW(), NOW()),
  ('Ver finanzas proyecto', 'proyectos.finanzas', 'Puede ver información financiera de proyectos', 'proyectos', NOW(), NOW()),
  ('Exportar proyectos', 'proyectos.exportar', 'Puede exportar información de proyectos', 'proyectos', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 7. MÓDULO: PRESUPUESTOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver presupuestos', 'presupuestos.ver', 'Puede ver listado de presupuestos', 'presupuestos', NOW(), NOW()),
  ('Crear presupuesto', 'presupuestos.crear', 'Puede crear nuevos presupuestos', 'presupuestos', NOW(), NOW()),
  ('Editar presupuesto', 'presupuestos.editar', 'Puede editar presupuestos existentes', 'presupuestos', NOW(), NOW()),
  ('Eliminar presupuesto', 'presupuestos.eliminar', 'Puede eliminar presupuestos', 'presupuestos', NOW(), NOW()),
  ('Aprobar presupuesto', 'presupuestos.aprobar', 'Puede aprobar presupuestos', 'presupuestos', NOW(), NOW()),
  ('Exportar presupuestos', 'presupuestos.exportar', 'Puede exportar presupuestos', 'presupuestos', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 8. MÓDULO: SUMINISTROS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver suministros', 'suministros.ver', 'Puede ver inventario de suministros', 'suministros', NOW(), NOW()),
  ('Crear suministro', 'suministros.crear', 'Puede registrar nuevos suministros', 'suministros', NOW(), NOW()),
  ('Editar suministro', 'suministros.editar', 'Puede editar información de suministros', 'suministros', NOW(), NOW()),
  ('Eliminar suministro', 'suministros.eliminar', 'Puede eliminar suministros', 'suministros', NOW(), NOW()),
  ('Ver movimientos suministros', 'suministros.movimientos', 'Puede ver movimientos de inventario', 'suministros', NOW(), NOW()),
  ('Registrar entrada', 'suministros.entrada', 'Puede registrar entradas de suministros', 'suministros', NOW(), NOW()),
  ('Registrar salida', 'suministros.salida', 'Puede registrar salidas de suministros', 'suministros', NOW(), NOW()),
  ('Exportar suministros', 'suministros.exportar', 'Puede exportar reportes de suministros', 'suministros', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 9. MÓDULO: PROVEEDORES
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver proveedores', 'proveedores.ver', 'Puede ver listado de proveedores', 'proveedores', NOW(), NOW()),
  ('Crear proveedor', 'proveedores.crear', 'Puede registrar nuevos proveedores', 'proveedores', NOW(), NOW()),
  ('Editar proveedor', 'proveedores.editar', 'Puede editar información de proveedores', 'proveedores', NOW(), NOW()),
  ('Eliminar proveedor', 'proveedores.eliminar', 'Puede eliminar proveedores', 'proveedores', NOW(), NOW()),
  ('Exportar proveedores', 'proveedores.exportar', 'Puede exportar listado de proveedores', 'proveedores', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 10. MÓDULO: HERRAMIENTAS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver herramientas', 'herramientas.ver', 'Puede ver inventario de herramientas', 'herramientas', NOW(), NOW()),
  ('Crear herramienta', 'herramientas.crear', 'Puede registrar nuevas herramientas', 'herramientas', NOW(), NOW()),
  ('Editar herramienta', 'herramientas.editar', 'Puede editar información de herramientas', 'herramientas', NOW(), NOW()),
  ('Eliminar herramienta', 'herramientas.eliminar', 'Puede eliminar herramientas', 'herramientas', NOW(), NOW()),
  ('Ver movimientos herramientas', 'herramientas.movimientos', 'Puede ver movimientos de herramientas', 'herramientas', NOW(), NOW()),
  ('Asignar herramienta', 'herramientas.asignar', 'Puede asignar herramientas a empleados/proyectos', 'herramientas', NOW(), NOW()),
  ('Devolver herramienta', 'herramientas.devolver', 'Puede registrar devoluciones de herramientas', 'herramientas', NOW(), NOW()),
  ('Exportar herramientas', 'herramientas.exportar', 'Puede exportar reportes de herramientas', 'herramientas', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 11. MÓDULO: ADEUDOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver adeudos', 'adeudos.ver', 'Puede ver listado de adeudos generales', 'adeudos', NOW(), NOW()),
  ('Crear adeudo', 'adeudos.crear', 'Puede registrar nuevos adeudos', 'adeudos', NOW(), NOW()),
  ('Editar adeudo', 'adeudos.editar', 'Puede editar adeudos existentes', 'adeudos', NOW(), NOW()),
  ('Eliminar adeudo', 'adeudos.eliminar', 'Puede eliminar adeudos', 'adeudos', NOW(), NOW()),
  ('Liquidar adeudo', 'adeudos.liquidar', 'Puede marcar adeudos como pagados', 'adeudos', NOW(), NOW()),
  ('Registrar pago parcial', 'adeudos.pago_parcial', 'Puede registrar pagos parciales', 'adeudos', NOW(), NOW()),
  ('Exportar adeudos', 'adeudos.exportar', 'Puede exportar reportes de adeudos', 'adeudos', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 12. MÓDULO: AUDITORÍA
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver auditoría', 'auditoria.ver', 'Puede ver registros de auditoría', 'auditoria', NOW(), NOW()),
  ('Exportar auditoría', 'auditoria.exportar', 'Puede exportar logs de auditoría', 'auditoria', NOW(), NOW()),
  ('Limpiar auditoría', 'auditoria.limpiar', 'Puede eliminar registros antiguos de auditoría', 'auditoria', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 13. MÓDULO: USUARIOS
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver usuarios', 'usuarios.ver', 'Puede ver listado de usuarios', 'usuarios', NOW(), NOW()),
  ('Crear usuario', 'usuarios.crear', 'Puede crear nuevos usuarios', 'usuarios', NOW(), NOW()),
  ('Editar usuario', 'usuarios.editar', 'Puede editar información de usuarios', 'usuarios', NOW(), NOW()),
  ('Eliminar usuario', 'usuarios.eliminar', 'Puede eliminar usuarios', 'usuarios', NOW(), NOW()),
  ('Cambiar contraseña', 'usuarios.cambiar_password', 'Puede cambiar contraseñas de usuarios', 'usuarios', NOW(), NOW()),
  ('Activar/Desactivar usuario', 'usuarios.toggle_estado', 'Puede activar o desactivar usuarios', 'usuarios', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 14. MÓDULO: ROLES
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver roles', 'roles.ver', 'Puede ver listado de roles', 'roles', NOW(), NOW()),
  ('Crear rol', 'roles.crear', 'Puede crear nuevos roles', 'roles', NOW(), NOW()),
  ('Editar rol', 'roles.editar', 'Puede editar roles existentes', 'roles', NOW(), NOW()),
  ('Eliminar rol', 'roles.eliminar', 'Puede eliminar roles', 'roles', NOW(), NOW()),
  ('Asignar permisos', 'roles.asignar_permisos', 'Puede asignar permisos a roles', 'roles', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 15. MÓDULO: CONFIGURACIÓN
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver configuración', 'configuracion.ver', 'Puede ver configuración del sistema', 'configuracion', NOW(), NOW()),
  ('Editar configuración', 'configuracion.editar', 'Puede modificar configuración del sistema', 'configuracion', NOW(), NOW()),
  ('Ver respaldos', 'configuracion.respaldos', 'Puede ver y gestionar respaldos', 'configuracion', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- 16. MÓDULO: REPORTES
-- ============================================================================
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver reportes', 'reportes.ver', 'Puede ver reportes del sistema', 'reportes', NOW(), NOW()),
  ('Generar reportes', 'reportes.generar', 'Puede generar nuevos reportes', 'reportes', NOW(), NOW()),
  ('Exportar reportes', 'reportes.exportar', 'Puede exportar reportes', 'reportes', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  descripcion = VALUES(descripcion),
  modulo = VALUES(modulo),
  fecha_actualizacion = NOW();

-- ============================================================================
-- ASIGNACIÓN AUTOMÁTICA AL ROL ADMINISTRADOR (id_rol = 1)
-- ============================================================================
-- Asignar TODOS los permisos al administrador
INSERT INTO permisos_rols (id_rol, id_accion, permitido, fecha_creacion, fecha_actualizacion)
SELECT 1, ap.id_accion, 1, NOW(), NOW()
FROM acciones_permisos ap
WHERE NOT EXISTS (
  SELECT 1
  FROM permisos_rols pr
  WHERE pr.id_rol = 1
    AND pr.id_accion = ap.id_accion
);

COMMIT;

-- ============================================================================
-- CONSULTAS DE VERIFICACIÓN
-- ============================================================================

-- Total de permisos creados por módulo
SELECT 
  modulo,
  COUNT(*) as total_permisos
FROM acciones_permisos
GROUP BY modulo
ORDER BY modulo;

-- Todos los permisos registrados
SELECT 
  id_accion,
  modulo,
  codigo,
  nombre,
  descripcion
FROM acciones_permisos
ORDER BY modulo, codigo;

-- Permisos asignados al rol Administrador
SELECT 
  r.nombre AS rol,
  COUNT(pr.id_permiso) as total_permisos_asignados
FROM permisos_rols pr
JOIN roles r ON pr.id_rol = r.id_rol
WHERE pr.id_rol = 1
GROUP BY r.nombre;

-- Detalle de permisos del Administrador por módulo
SELECT 
  ap.modulo,
  COUNT(*) as permisos_asignados
FROM permisos_rols pr
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE pr.id_rol = 1
GROUP BY ap.modulo
ORDER BY ap.modulo;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
