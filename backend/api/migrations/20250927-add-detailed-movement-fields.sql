-- Migración para agregar campos detallados a movimientos_herramienta
-- Fecha: 2025-09-27
-- Propósito: Agregar información específica sobre razones y detalles de movimientos

ALTER TABLE movimientos_herramienta 
ADD COLUMN razon_movimiento VARCHAR(100) COMMENT 'Razón específica: prestamo, perdida, dano, mantenimiento, transferencia, etc.',
ADD COLUMN detalle_adicional TEXT COMMENT 'Información adicional detallada sobre el movimiento',
ADD COLUMN usuario_receptor VARCHAR(255) COMMENT 'Usuario que recibe la herramienta en caso de préstamo',
ADD COLUMN fecha_devolucion_esperada DATE COMMENT 'Fecha esperada de devolución para préstamos',
ADD COLUMN estado_movimiento ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo' COMMENT 'Estado del movimiento';

-- Agregar índices para optimizar consultas
CREATE INDEX idx_movimientos_razon ON movimientos_herramienta(razon_movimiento);
CREATE INDEX idx_movimientos_estado ON movimientos_herramienta(estado_movimiento);

-- Comentarios de documentación
ALTER TABLE movimientos_herramienta COMMENT = 'Tabla de movimientos de herramientas con información detallada sobre razones y contexto';