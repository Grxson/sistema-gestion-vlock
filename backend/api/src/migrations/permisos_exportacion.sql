-- Script de configuración de permisos para el módulo de Exportación/Importación
-- Sistema de Gestión Vlock
-- Fecha: 13 de noviembre de 2025

-- ============================================
-- 1. CREAR PERMISOS DEL MÓDULO
-- ============================================

INSERT INTO acciones_permisos (nombre, codigo, descripcion, modulo, fecha_creacion, fecha_actualizacion) VALUES
('Ver Exportación', 'exportacion.ver', 'Acceder al módulo de exportación/importación de datos', 'exportacion', NOW(), NOW()),
('Exportar Datos', 'exportacion.exportar', 'Exportar datos del sistema en diferentes formatos', 'exportacion', NOW(), NOW()),
('Importar Datos', 'exportacion.importar', 'Importar datos al sistema desde archivos externos', 'exportacion', NOW(), NOW()),
('Vaciar Tablas', 'exportacion.eliminar', 'Eliminar datos de tablas seleccionadas', 'exportacion', NOW(), NOW());

-- ============================================
-- 2. ASIGNAR PERMISOS AL ROL ADMINISTRADOR
-- ============================================

-- Asignar todos los permisos de exportación al rol admin (id_rol = 1)
INSERT INTO permisos_rols (id_rol, id_accion, permitido, fecha_creacion, fecha_actualizacion)
SELECT 1, id_accion, 1, NOW(), NOW() FROM acciones_permisos WHERE modulo = 'exportacion'
AND NOT EXISTS (
    SELECT 1 FROM permisos_rols pr 
    WHERE pr.id_rol = 1 AND pr.id_accion = acciones_permisos.id_accion
);

-- ============================================
-- 3. VERIFICACIÓN DE PERMISOS
-- ============================================

-- Ver todos los permisos del módulo de exportación
SELECT 
    ap.id_accion,
    ap.codigo,
    ap.nombre,
    ap.descripcion,
    ap.modulo
FROM acciones_permisos ap
WHERE ap.modulo = 'exportacion'
ORDER BY ap.codigo;

-- Ver roles que tienen acceso al módulo de exportación
SELECT 
    r.id_rol,
    r.nombre as rol_nombre,
    ap.codigo as permiso_codigo,
    ap.nombre as permiso_nombre
FROM roles r
JOIN permisos_rols pr ON r.id_rol = pr.id_rol
JOIN acciones_permisos ap ON pr.id_accion = ap.id_accion
WHERE ap.modulo = 'exportacion'
ORDER BY r.id_rol, ap.codigo;

-- ============================================
-- 4. CONFIGURACIÓN OPCIONAL
-- ============================================

-- Si deseas asignar permisos a otros roles específicos:
-- Ejemplo: Asignar solo permiso de ver y exportar al rol "Supervisor" (ajusta el id_rol según tu BD)

-- INSERT INTO permisos_rols (id_rol, id_accion, permitido, fecha_creacion, fecha_actualizacion)
-- SELECT 2, id_accion, 1, NOW(), NOW() FROM acciones_permisos 
-- WHERE codigo IN ('exportacion.ver', 'exportacion.exportar')
-- AND NOT EXISTS (
--     SELECT 1 FROM permisos_rols pr 
--     WHERE pr.id_rol = 2 AND pr.id_accion = acciones_permisos.id_accion
-- );

-- ============================================
-- 5. REGISTRAR EN AUDITORÍA (OPCIONAL)
-- ============================================

-- Registrar la creación del módulo en auditoría si está habilitada
-- INSERT INTO auditoria (
--     id_usuario,
--     accion,
--     tabla,
--     descripcion,
--     fecha_hora
-- ) VALUES (
--     1,  -- ID del usuario administrador que ejecuta el script
--     'CREATE',
--     'permisos',
--     'Creación de permisos para módulo de Exportación/Importación',
--     NOW()
-- );

-- ============================================
-- FIN DEL SCRIPT
-- ============================================

-- Mensaje de confirmación
SELECT 'Permisos de exportación/importación configurados correctamente ✓' AS resultado;
