-- Script de verificación de seguridad para migración a Railway
-- Este script verifica qué migraciones son necesarias sin afectar datos existentes

-- 1. Verificar si existe la tabla de categorias de suministro con la nueva estructura
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'railway' 
    AND TABLE_NAME = 'categorias_suministro'
ORDER BY ORDINAL_POSITION;

-- 2. Verificar si existe la columna tipo en categorias_suministro
SELECT COUNT(*) as tiene_campo_tipo
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'railway' 
    AND TABLE_NAME = 'categorias_suministro'
    AND COLUMN_NAME = 'tipo';

-- 3. Verificar si existen datos en la tabla de categorias
SELECT COUNT(*) as total_categorias
FROM categorias_suministro;

-- 4. Verificar estructura de tabla suministros
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'railway' 
    AND TABLE_NAME = 'suministros'
    AND COLUMN_NAME IN ('id_categoria_suministro', 'tipo_suministro', 'categoria')
ORDER BY ORDINAL_POSITION;

-- 5. Verificar si existen datos de suministros que necesiten preservarse
SELECT COUNT(*) as total_suministros
FROM suministros;

-- 6. Verificar tablas de herramientas (nuevas)
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'railway' 
    AND TABLE_NAME IN ('categorias_herramientas', 'herramientas', 'movimientos_herramienta');

-- 7. Verificar tablas de presupuestos (nuevas)
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = 'railway' 
    AND TABLE_NAME LIKE '%presupuesto%' OR TABLE_NAME LIKE '%concepto%' OR TABLE_NAME LIKE '%catalogo%';