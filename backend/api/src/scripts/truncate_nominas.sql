-- Script para limpiar las tablas relacionadas con nóminas
-- ADVERTENCIA: Este script eliminará TODOS los datos de nóminas
-- Ejecutar solo si estás seguro de querer empezar de cero

-- Deshabilitar verificación de claves foráneas temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Limpiar tabla de historial de nóminas
TRUNCATE TABLE nomina_historial;
PRINT 'Tabla nomina_historial limpiada';

-- Limpiar tabla de pagos de nóminas
TRUNCATE TABLE pagos_nomina;
PRINT 'Tabla pagos_nomina limpiada';

-- Limpiar tabla de adeudos de empleados
TRUNCATE TABLE adeudos_empleados;
PRINT 'Tabla adeudos_empleados limpiada';

-- Limpiar tabla principal de nóminas
TRUNCATE TABLE nomina_empleados;
PRINT 'Tabla nomina_empleados limpiada';

-- Limpiar tabla de semanas de nómina
TRUNCATE TABLE semanas_nominas;
PRINT 'Tabla semanas_nominas limpiada';

-- Rehabilitar verificación de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

PRINT '✅ Todas las tablas de nóminas han sido limpiadas exitosamente';
PRINT '⚠️  Ahora puedes empezar a crear nóminas con el algoritmo corregido';
