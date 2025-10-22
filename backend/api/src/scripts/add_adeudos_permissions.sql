-- Script para agregar permisos del módulo de Adeudos Generales (estructura actual)
-- Tablas utilizadas: acciones_permisos, permisos_rols, roles

START TRANSACTION;

-- 1. Crear acciones de permiso para adeudos generales
INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
VALUES
  ('Ver adeudos generales', 'adeudos_generales.ver', 'Puede ver el listado de adeudos generales', 'adeudos', NOW(), NOW()),
  ('Crear adeudo general', 'adeudos_generales.crear', 'Puede registrar nuevos adeudos generales', 'adeudos', NOW(), NOW()),
  ('Editar adeudo general', 'adeudos_generales.editar', 'Puede editar adeudos generales existentes', 'adeudos', NOW(), NOW()),
  ('Eliminar adeudo general', 'adeudos_generales.eliminar', 'Puede eliminar adeudos generales', 'adeudos', NOW(), NOW()),
  ('Liquidar adeudo general', 'adeudos_generales.liquidar', 'Puede marcar adeudos generales como pagados', 'adeudos', NOW(), NOW())
AS new_vals(nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion)
ON DUPLICATE KEY UPDATE
  descripcion = new_vals.descripcion,
  modulo = new_vals.modulo,
  fecha_actualizacion = NOW();

-- 2. Asignar acciones al rol administrador (id_rol = 1) si aún no existen
INSERT INTO permisos_rols (id_rol, id_accion, permitido, fecha_creacion, fecha_actualizacion)
SELECT 1, ap.id_accion, 1, NOW(), NOW()
FROM acciones_permisos ap
WHERE ap.codigo LIKE 'adeudos_generales.%'
  AND NOT EXISTS (
    SELECT 1
    FROM permisos_rols pr
    WHERE pr.id_rol = 1
      AND pr.id_accion = ap.id_accion
  );

COMMIT;

-- 3. Consultas de verificación
-- Permisos registrados
SELECT id_accion, nombre, codigo, descripcion, modulo
FROM acciones_permisos
WHERE codigo LIKE 'adeudos_generales.%'
ORDER BY id_accion;

-- Permisos del rol administrador
SELECT pr.id_permiso, r.nombre AS rol, ap.codigo, ap.nombre
FROM permisos_rols pr
JOIN roles r ON pr.id_rol = r.id_rol
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE pr.id_rol = 1
  AND ap.codigo LIKE 'adeudos_generales.%'
ORDER BY ap.codigo;
