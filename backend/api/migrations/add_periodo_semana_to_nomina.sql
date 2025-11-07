-- Migración: Agregar campos periodo y semana a nomina_empleados
-- Fecha: 2025-11-07
-- Propósito: Guardar el periodo (YYYY-MM) y número de semana del mes (1-5) 
--            directamente en la tabla para evitar recalcular y mostrar el valor correcto

USE sistema_gestion;

-- Agregar campo periodo
ALTER TABLE nomina_empleados 
ADD COLUMN periodo VARCHAR(7) NULL COMMENT 'Periodo en formato YYYY-MM' 
AFTER monto_pagado;

-- Agregar campo semana
ALTER TABLE nomina_empleados 
ADD COLUMN semana INT NULL COMMENT 'Número de semana del mes (1-5)' 
AFTER periodo;

-- Verificar cambios
DESCRIBE nomina_empleados;

-- Opcional: Actualizar nóminas existentes con sus valores calculados
-- Solo ejecutar si quieres poblar los datos históricos
-- ADVERTENCIA: Este update puede tardar si tienes muchas nóminas

UPDATE nomina_empleados ne
INNER JOIN semanas_nomina sn ON ne.id_semana = sn.id_semana
SET 
  ne.periodo = DATE_FORMAT(sn.fecha_inicio, '%Y-%m'),
  ne.semana = CASE 
    -- Aquí deberías calcular la semana del mes basándote en tu lógica
    -- Por simplicidad, dejamos NULL para que se actualice cuando se edite
    WHEN sn.fecha_inicio IS NOT NULL THEN NULL
    ELSE NULL
  END
WHERE ne.periodo IS NULL;

-- Mensaje de confirmación
SELECT '✅ Campos periodo y semana agregados exitosamente a nomina_empleados' AS resultado;
