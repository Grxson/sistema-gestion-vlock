-- Script para corregir las semanas duplicadas/corruptas en la BD

-- 1. Eliminar la semana ISO 40 que tiene el mismo período que la 42
DELETE FROM semanas_nominas WHERE id_semana = 7 AND semana_iso = 40;

-- 2. Verificar que las semanas restantes sean correctas
SELECT id_semana, anio, semana_iso, etiqueta, fecha_inicio, fecha_fin 
FROM semanas_nominas 
WHERE anio = 2025 
ORDER BY semana_iso;

-- Resultado esperado:
-- ID 8: Semana ISO 42 (13-19 octubre)
-- ID 9: Semana ISO 43 (20-26 octubre)
