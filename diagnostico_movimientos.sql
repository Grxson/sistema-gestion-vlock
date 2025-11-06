-- ================================================================
-- SCRIPT DE DIAGNÓSTICO - SISTEMA DE MOVIMIENTOS
-- ================================================================
-- Ejecutar en Railway o tu cliente MySQL
-- ================================================================

USE railway;

-- ================================================================
-- 1. VERIFICAR PROYECTOS
-- ================================================================
SELECT 
    '=== PROYECTOS DISPONIBLES ===' as Seccion;

SELECT 
    id_proyecto,
    nombre,
    estado,
    fecha_inicio,
    fecha_fin
FROM proyectos
ORDER BY id_proyecto DESC
LIMIT 10;

-- ================================================================
-- 2. VERIFICAR INGRESOS
-- ================================================================
SELECT 
    '=== INGRESOS REGISTRADOS ===' as Seccion;

SELECT 
    i.id_ingreso,
    i.id_proyecto,
    p.nombre as proyecto_nombre,
    i.fecha,
    i.monto,
    i.descripcion,
    i.fuente
FROM ingresos i
LEFT JOIN proyectos p ON i.id_proyecto = p.id_proyecto
ORDER BY i.fecha DESC, i.id_ingreso DESC
LIMIT 10;

-- ================================================================
-- 3. PROYECTOS SIN INGRESOS
-- ================================================================
SELECT 
    '=== PROYECTOS SIN INGRESOS ===' as Seccion;

SELECT 
    p.id_proyecto,
    p.nombre,
    p.estado,
    COUNT(i.id_ingreso) as total_ingresos
FROM proyectos p
LEFT JOIN ingresos i ON p.id_proyecto = i.id_proyecto
GROUP BY p.id_proyecto, p.nombre, p.estado
HAVING total_ingresos = 0
ORDER BY p.nombre;

-- ================================================================
-- 4. VERIFICAR SUMINISTROS RECIENTES
-- ================================================================
SELECT 
    '=== SUMINISTROS RECIENTES ===' as Seccion;

SELECT 
    s.id_suministro,
    s.folio,
    s.fecha,
    s.id_proyecto,
    p.nombre as proyecto_nombre,
    s.nombre as suministro_nombre,
    s.costo_total,
    s.estado
FROM suministros s
LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
ORDER BY s.createdAt DESC
LIMIT 5;

-- ================================================================
-- 5. VERIFICAR MOVIMIENTOS REGISTRADOS
-- ================================================================
SELECT 
    '=== MOVIMIENTOS REGISTRADOS ===' as Seccion;

SELECT 
    m.id_movimiento,
    m.fecha,
    m.tipo,
    m.fuente,
    m.monto,
    m.descripcion,
    m.id_proyecto,
    p.nombre as proyecto_nombre,
    m.ref_tipo,
    m.ref_id
FROM ingresos_movimientos m
LEFT JOIN proyectos p ON m.id_proyecto = p.id_proyecto
ORDER BY m.createdAt DESC
LIMIT 10;

-- ================================================================
-- 6. BUSCAR EL SUMINISTRO DE PRUEBA QUE CREASTE
-- ================================================================
SELECT 
    '=== SUMINISTRO DE PRUEBA (F-1762462399272-639) ===' as Seccion;

SELECT 
    s.id_suministro,
    s.folio,
    s.fecha,
    s.id_proyecto,
    p.nombre as proyecto_nombre,
    s.nombre as suministro_nombre,
    s.costo_total,
    s.estado,
    s.createdAt,
    'Tiene ingreso?' as verificacion,
    IF(i.id_ingreso IS NOT NULL, 'SI', 'NO') as tiene_ingreso
FROM suministros s
LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
LEFT JOIN ingresos i ON i.id_proyecto = s.id_proyecto
WHERE s.folio = 'F-1762462399272-639' OR s.nombre = 'prueba'
ORDER BY s.createdAt DESC;

-- ================================================================
-- 7. RESUMEN POR PROYECTO
-- ================================================================
SELECT 
    '=== RESUMEN POR PROYECTO ===' as Seccion;

SELECT 
    p.id_proyecto,
    p.nombre as proyecto,
    COUNT(DISTINCT i.id_ingreso) as total_ingresos,
    SUM(i.monto) as monto_ingresos,
    COUNT(DISTINCT s.id_suministro) as total_suministros,
    SUM(s.costo_total) as monto_suministros,
    COUNT(DISTINCT m.id_movimiento) as total_movimientos
FROM proyectos p
LEFT JOIN ingresos i ON p.id_proyecto = i.id_proyecto
LEFT JOIN suministros s ON p.id_proyecto = s.id_proyecto
LEFT JOIN ingresos_movimientos m ON p.id_proyecto = m.id_proyecto
GROUP BY p.id_proyecto, p.nombre
ORDER BY p.nombre;

-- ================================================================
-- 8. COMANDO PARA CREAR INGRESO DE PRUEBA
-- ================================================================
SELECT 
    '=== COMANDOS PARA CREAR INGRESO ===' as Seccion;

SELECT 
    CONCAT(
        'INSERT INTO ingresos (id_proyecto, fecha, monto, descripcion, fuente, createdAt, updatedAt) ',
        'VALUES (',
        id_proyecto, ', ',
        'CURDATE(), ',
        '100000, ',
        '"Ingreso inicial de prueba", ',
        '"Manual", ',
        'NOW(), ',
        'NOW());'
    ) as comando_sql
FROM proyectos
WHERE nombre = 'Oficina Principal'
LIMIT 1;
