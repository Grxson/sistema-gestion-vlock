-- ============================================
-- Migraciones de Optimización de Nóminas
-- Fecha: 2025-10-27
-- Versión: 2.0.0
-- ============================================

-- PASO 1: Agregar columna descuentos
-- ============================================
ALTER TABLE nomina_empleados 
ADD COLUMN IF NOT EXISTS descuentos DECIMAL(10,2) DEFAULT 0 
COMMENT 'Descuentos adicionales (adelantos, préstamos, etc.)';

-- PASO 2: Eliminar campos redundantes
-- ============================================

-- Eliminar checkboxes redundantes (usar deducciones_* = 0 en su lugar)
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS aplicar_isr;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS aplicar_imss;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS aplicar_infonavit;

-- Eliminar campo deducciones (suma redundante, se calcula en tiempo real)
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS deducciones;

-- Eliminar archivo_pdf_path (duplicado de recibo_pdf)
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS archivo_pdf_path;

-- Eliminar es_pago_semanal (siempre true)
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS es_pago_semanal;

-- Eliminar campos de auditoría innecesarios
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS version;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS creada_por;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS revisada_por;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS pagada_por;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS fecha_revision;
ALTER TABLE nomina_empleados DROP COLUMN IF EXISTS motivo_ultimo_cambio;

-- PASO 3: Actualizar columnas de deducciones
-- ============================================

-- Asegurar que deducciones_isr permita NULL y tenga default 0
ALTER TABLE nomina_empleados 
MODIFY COLUMN deducciones_isr DECIMAL(10,2) DEFAULT 0 
COMMENT 'Monto de ISR (0 = no aplicado, >0 = monto aplicado)';

-- Asegurar que deducciones_imss permita NULL y tenga default 0
ALTER TABLE nomina_empleados 
MODIFY COLUMN deducciones_imss DECIMAL(10,2) DEFAULT 0 
COMMENT 'Monto de IMSS (0 = no aplicado, >0 = monto aplicado)';

-- Asegurar que deducciones_infonavit permita NULL y tenga default 0
ALTER TABLE nomina_empleados 
MODIFY COLUMN deducciones_infonavit DECIMAL(10,2) DEFAULT 0 
COMMENT 'Monto de Infonavit (0 = no aplicado, >0 = monto aplicado)';

-- Asegurar que deducciones_adicionales permita NULL y tenga default 0
ALTER TABLE nomina_empleados 
MODIFY COLUMN deducciones_adicionales DECIMAL(10,2) DEFAULT 0 
COMMENT 'Otras deducciones';

-- ============================================
-- Verificación
-- ============================================
SELECT 
    'Migración completada exitosamente' as mensaje,
    COUNT(*) as total_nominas
FROM nomina_empleados;

-- Mostrar estructura final de la tabla
DESCRIBE nomina_empleados;
