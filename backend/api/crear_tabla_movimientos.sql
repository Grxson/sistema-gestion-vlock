-- =====================================================
-- Script de Migración: Tabla ingresos_movimientos
-- =====================================================
-- Propósito: Crear tabla para registrar movimientos de ingresos
-- Autor: Sistema de Gestión Vlock
-- Fecha: 2025-01-06
-- 
-- Descripción:
-- Esta tabla registra todos los movimientos financieros asociados
-- a un ingreso: ingresos iniciales, gastos (nómina, suministros),
-- y ajustes (correcciones).
-- 
-- Uso: mysql -u root -p sistema_gestion < crear_tabla_movimientos.sql
-- =====================================================

USE sistema_gestion;

-- Verificar y eliminar tabla si existe (solo en desarrollo)
-- DROP TABLE IF EXISTS ingresos_movimientos;

-- =====================================================
-- 1. CREAR TABLA ingresos_movimientos
-- =====================================================

CREATE TABLE IF NOT EXISTS `ingresos_movimientos` (
  `id_movimiento` INT NOT NULL AUTO_INCREMENT COMMENT 'ID único del movimiento',
  `id_ingreso` INT NOT NULL COMMENT 'ID del ingreso al que pertenece este movimiento',
  `id_proyecto` INT DEFAULT NULL COMMENT 'ID del proyecto asociado (heredado o específico)',
  `tipo` ENUM('ingreso', 'gasto', 'ajuste') NOT NULL DEFAULT 'gasto' COMMENT 'Tipo de movimiento',
  `fuente` ENUM('nomina', 'suministro', 'manual', 'otros') NOT NULL DEFAULT 'manual' COMMENT 'Fuente del movimiento',
  `ref_tipo` VARCHAR(50) DEFAULT NULL COMMENT 'Tipo de referencia polimórfica (nomina, suministro, etc)',
  `ref_id` INT DEFAULT NULL COMMENT 'ID de la referencia externa',
  `fecha` DATE NOT NULL DEFAULT (CURRENT_DATE) COMMENT 'Fecha del movimiento',
  `monto` DECIMAL(12, 2) NOT NULL DEFAULT 0.00 COMMENT 'Monto del movimiento',
  `descripcion` TEXT DEFAULT NULL COMMENT 'Descripción detallada del movimiento',
  `saldo_after` DECIMAL(12, 2) DEFAULT NULL COMMENT 'Saldo después de aplicar este movimiento',
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Fecha de creación del registro',
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Fecha de última actualización',
  
  PRIMARY KEY (`id_movimiento`),
  
  -- Clave foránea a ingresos
  CONSTRAINT `fk_movimientos_ingreso` 
    FOREIGN KEY (`id_ingreso`) 
    REFERENCES `ingresos` (`id_ingreso`) 
    ON DELETE RESTRICT 
    ON UPDATE CASCADE,
  
  -- Clave foránea a proyectos (opcional)
  CONSTRAINT `fk_movimientos_proyecto` 
    FOREIGN KEY (`id_proyecto`) 
    REFERENCES `proyectos` (`id_proyecto`) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
  
  -- Índices para optimizar consultas
  INDEX `idx_movimientos_ingreso` (`id_ingreso`),
  INDEX `idx_movimientos_proyecto` (`id_proyecto`),
  INDEX `idx_movimientos_tipo_fuente` (`tipo`, `fuente`),
  INDEX `idx_movimientos_fecha` (`fecha`),
  INDEX `idx_movimientos_referencia` (`ref_tipo`, `ref_id`)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Registro de movimientos de ingresos - Rastrea ingresos, gastos y ajustes';

-- =====================================================
-- 2. VERIFICACIÓN DE LA TABLA
-- =====================================================

-- Mostrar estructura de la tabla
DESCRIBE ingresos_movimientos;

-- Mostrar claves foráneas
SELECT 
  CONSTRAINT_NAME,
  TABLE_NAME,
  COLUMN_NAME,
  REFERENCED_TABLE_NAME,
  REFERENCED_COLUMN_NAME
FROM 
  INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE 
  TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'ingresos_movimientos'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Mostrar índices
SHOW INDEXES FROM ingresos_movimientos;

-- =====================================================
-- 3. DATOS DE PRUEBA (OPCIONAL - COMENTADO)
-- =====================================================
/*
-- Ejemplo: Insertar movimiento inicial de ingreso
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, fecha, monto, descripcion, saldo_after)
VALUES 
  (1, 10, 'ingreso', 'manual', CURRENT_DATE, 100000.00, 'Ingreso inicial del proyecto', 100000.00);

-- Ejemplo: Insertar gasto de nómina
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, ref_tipo, ref_id, fecha, monto, descripcion, saldo_after)
VALUES 
  (1, 10, 'gasto', 'nomina', 'nomina', 123, CURRENT_DATE, 15000.00, 'Pago nómina semana 1', 85000.00);

-- Ejemplo: Insertar gasto de suministro
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, ref_tipo, ref_id, fecha, monto, descripcion, saldo_after)
VALUES 
  (1, 10, 'gasto', 'suministro', 'suministro', 456, CURRENT_DATE, 5000.00, 'Compra de materiales', 80000.00);

-- Ejemplo: Insertar ajuste
INSERT INTO ingresos_movimientos 
  (id_ingreso, id_proyecto, tipo, fuente, fecha, monto, descripcion, saldo_after)
VALUES 
  (1, 10, 'ajuste', 'manual', CURRENT_DATE, -500.00, 'Corrección de error contable', 79500.00);
*/

-- =====================================================
-- 4. CONSULTAS ÚTILES
-- =====================================================

-- Ver todos los movimientos de un ingreso específico
/*
SELECT 
  id_movimiento,
  tipo,
  fuente,
  fecha,
  monto,
  descripcion,
  saldo_after,
  ref_tipo,
  ref_id
FROM 
  ingresos_movimientos
WHERE 
  id_ingreso = 1
ORDER BY 
  fecha ASC, id_movimiento ASC;
*/

-- Calcular resumen de movimientos por ingreso
/*
SELECT 
  id_ingreso,
  SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) as total_ingresos,
  SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) as total_gastos,
  SUM(CASE WHEN tipo = 'ajuste' THEN monto ELSE 0 END) as total_ajustes,
  (
    SUM(CASE WHEN tipo = 'ingreso' THEN monto ELSE 0 END) -
    SUM(CASE WHEN tipo = 'gasto' THEN monto ELSE 0 END) +
    SUM(CASE WHEN tipo = 'ajuste' THEN monto ELSE 0 END)
  ) as saldo_actual
FROM 
  ingresos_movimientos
WHERE 
  id_ingreso = 1
GROUP BY 
  id_ingreso;
*/

-- Ver movimientos agrupados por tipo y fuente
/*
SELECT 
  tipo,
  fuente,
  COUNT(*) as cantidad,
  SUM(monto) as total,
  AVG(monto) as promedio
FROM 
  ingresos_movimientos
GROUP BY 
  tipo, fuente
ORDER BY 
  tipo, total DESC;
*/

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

SELECT '✅ Tabla ingresos_movimientos creada exitosamente' as Resultado;
SELECT 'Siguiente paso: Reiniciar el servidor backend para cargar el nuevo modelo' as Accion;
