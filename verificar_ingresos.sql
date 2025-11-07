-- Script para verificar ingresos en Railway
-- Ejecutar en Railway Query Editor

USE railway;

-- ============================================
-- 1. INGRESOS REGISTRADOS
-- ============================================
SELECT 
    '=== INGRESOS EN LA TABLA ingresos ===' as seccion;

SELECT 
    id_ingreso,
    fecha,
    id_proyecto,
    monto,
    fuente,
    descripcion,
    createdAt
FROM ingresos
ORDER BY fecha DESC, id_ingreso DESC
LIMIT 10;

-- ============================================
-- 2. TOTAL DE INGRESOS
-- ============================================
SELECT 
    '=== RESUMEN ===' as seccion;

SELECT 
    COUNT(*) as total_registros,
    COALESCE(SUM(monto), 0) as suma_total_ingresos
FROM ingresos;

-- ============================================
-- 3. MOVIMIENTOS REGISTRADOS
-- ============================================
SELECT 
    '=== MOVIMIENTOS ===' as seccion;

SELECT 
    COUNT(*) as total_movimientos,
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos_mov,
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos_mov,
    (SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) - SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END)) as saldo_actual
FROM ingresos_movimientos;

-- ============================================
-- 4. DETALLE DE MOVIMIENTOS
-- ============================================
SELECT 
    '=== DETALLE MOVIMIENTOS ===' as seccion;

SELECT 
    id_movimiento,
    fecha,
    tipo,
    fuente,
    monto,
    saldo_after,
    descripcion
FROM ingresos_movimientos
ORDER BY fecha DESC, id_movimiento DESC;
