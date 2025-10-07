-- =====================================================
-- MIGRACIÓN CONSOLIDADA PARA RAILWAY
-- Fecha: 2025-10-07
-- Propósito: Sincronizar estructura de BD local con Railway
-- IMPORTANTE: Esta migración preserva datos existentes
-- =====================================================

-- ===== CATEGORÍAS DE SUMINISTRO =====
-- Verificar si la columna tipo ya existe, si no agregarla
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'categorias_suministro' 
     AND COLUMN_NAME = 'tipo') = 0,
    'ALTER TABLE categorias_suministro ADD COLUMN tipo ENUM(''Proyecto'', ''Administrativo'') NOT NULL DEFAULT ''Proyecto'' COMMENT ''Clasificación de la categoría: Proyecto (gastos de obra) o Administrativo (gastos de oficina)''',
    'SELECT ''Column tipo already exists'' as msg'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insertar categorías predefinidas si no existen
INSERT IGNORE INTO categorias_suministro (nombre, descripcion, tipo, color, orden, activo) VALUES
-- Categorías de Proyecto (gastos de obra)
('Material', 'Materiales de construcción en general', 'Proyecto', '#3B82F6', 1, true),
('Herramienta', 'Herramientas de trabajo y construcción', 'Proyecto', '#10B981', 2, true),
('Equipo Ligero', 'Equipos ligeros para construcción', 'Proyecto', '#F59E0B', 3, true),
('Acero', 'Materiales de acero y estructura metálica', 'Proyecto', '#EF4444', 4, true),
('Cimbra', 'Materiales para cimbrado y moldeo', 'Proyecto', '#8B5CF6', 5, true),
('Ferretería', 'Artículos de ferretería y accesorios', 'Proyecto', '#06B6D4', 6, true),
('Maquinaria', 'Maquinaria pesada y equipos especializados', 'Proyecto', '#F97316', 7, true),
('Concreto', 'Concreto y materiales relacionados', 'Proyecto', '#6B7280', 8, true),
-- Categorías Administrativas (gastos de oficina)
('Servicio', 'Servicios diversos y subcontratación', 'Administrativo', '#EC4899', 9, true),
('Consumible', 'Materiales consumibles y suministros de oficina', 'Administrativo', '#84CC16', 10, true);

-- Crear índice para tipo si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'categorias_suministro' 
     AND INDEX_NAME = 'idx_categorias_tipo') = 0,
    'CREATE INDEX idx_categorias_tipo ON categorias_suministro(tipo)',
    'SELECT ''Index idx_categorias_tipo already exists'' as msg'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ===== SUMINISTROS =====
-- Verificar si la columna id_categoria_suministro ya existe en suministros
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'suministros' 
     AND COLUMN_NAME = 'id_categoria_suministro') = 0,
    'ALTER TABLE suministros ADD COLUMN id_categoria_suministro INT',
    'SELECT ''Column id_categoria_suministro already exists'' as msg'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Crear índice para categoría si no existe
SET @sql = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS 
     WHERE TABLE_SCHEMA = DATABASE() 
     AND TABLE_NAME = 'suministros' 
     AND INDEX_NAME = 'idx_suministros_categoria') = 0,
    'CREATE INDEX idx_suministros_categoria ON suministros(id_categoria_suministro)',
    'SELECT ''Index idx_suministros_categoria already exists'' as msg'
));

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Migrar datos existentes (mapear tipo_suministro a id_categoria)
UPDATE suministros s 
JOIN categorias_suministro c ON c.nombre = s.tipo_suministro 
SET s.id_categoria_suministro = c.id_categoria 
WHERE s.id_categoria_suministro IS NULL AND s.tipo_suministro IS NOT NULL;

-- ===== TABLAS DE PRESUPUESTOS =====
-- Crear tabla conceptos_obra si no existe
CREATE TABLE IF NOT EXISTS conceptos_obra (
  id_concepto INT PRIMARY KEY AUTO_INCREMENT,
  codigo_concepto VARCHAR(50) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  unidad_medida VARCHAR(20) NOT NULL,
  precio_unitario DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_conceptos_codigo (codigo_concepto),
  INDEX idx_conceptos_activo (activo)
) COMMENT='Catálogo de conceptos de obra para presupuestos';

-- Crear tabla precios_unitarios si no existe
CREATE TABLE IF NOT EXISTS precios_unitarios (
  id_precio INT PRIMARY KEY AUTO_INCREMENT,
  id_concepto INT NOT NULL,
  precio DECIMAL(15,4) NOT NULL,
  fecha_vigencia DATE NOT NULL,
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_concepto) REFERENCES conceptos_obra(id_concepto) ON DELETE CASCADE,
  INDEX idx_precios_concepto (id_concepto),
  INDEX idx_precios_vigencia (fecha_vigencia),
  INDEX idx_precios_activo (activo)
) COMMENT='Histórico de precios unitarios por concepto';

-- Crear tabla presupuestos si no existe
CREATE TABLE IF NOT EXISTS presupuestos (
  id_presupuesto INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  id_proyecto INT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  total_presupuesto DECIMAL(15,2) DEFAULT 0.00,
  estado ENUM('borrador', 'activo', 'cerrado') DEFAULT 'borrador',
  observaciones TEXT,
  INDEX idx_presupuestos_proyecto (id_proyecto),
  INDEX idx_presupuestos_estado (estado),
  FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE SET NULL
) COMMENT='Presupuestos de obra por proyecto';

-- Crear tabla presupuestos_detalle si no existe
CREATE TABLE IF NOT EXISTS presupuestos_detalle (
  id_detalle INT PRIMARY KEY AUTO_INCREMENT,
  id_presupuesto INT NOT NULL,
  id_concepto INT NOT NULL,
  cantidad DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
  precio_unitario DECIMAL(15,4) NOT NULL DEFAULT 0.0000,
  importe DECIMAL(15,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  observaciones TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_presupuesto) REFERENCES presupuestos(id_presupuesto) ON DELETE CASCADE,
  FOREIGN KEY (id_concepto) REFERENCES conceptos_obra(id_concepto) ON DELETE CASCADE,
  INDEX idx_detalle_presupuesto (id_presupuesto),
  INDEX idx_detalle_concepto (id_concepto)
) COMMENT='Detalle de conceptos por presupuesto';

-- ===== TABLAS DE HERRAMIENTAS =====
-- Crear tabla categoria_herramienta si no existe
CREATE TABLE IF NOT EXISTS categoria_herramienta (
  id_categoria INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  activo BOOLEAN DEFAULT true,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_categoria_herramienta_activo (activo)
) COMMENT='Categorías para clasificar herramientas';

-- Insertar categorías de herramientas predefinidas
INSERT IGNORE INTO categoria_herramienta (nombre, descripcion, color) VALUES
('Herramientas Manuales', 'Herramientas de mano básicas', '#3B82F6'),
('Herramientas Eléctricas', 'Herramientas que requieren electricidad', '#10B981'),
('Maquinaria Pesada', 'Equipos y maquinaria de gran tamaño', '#F59E0B'),
('Equipos de Medición', 'Instrumentos de medición y topografía', '#EF4444'),
('Equipos de Seguridad', 'Elementos de protección personal', '#8B5CF6');

-- Crear tabla herramientas si no existe
CREATE TABLE IF NOT EXISTS herramientas (
  id_herramienta INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  id_categoria INT,
  codigo_herramienta VARCHAR(100) UNIQUE,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  fecha_adquisicion DATE,
  costo_adquisicion DECIMAL(10,2),
  estado ENUM('disponible', 'en_uso', 'mantenimiento', 'dañada', 'perdida') DEFAULT 'disponible',
  ubicacion VARCHAR(255),
  id_proyecto INT,
  observaciones TEXT,
  imagen_url VARCHAR(500),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categoria_herramienta(id_categoria) ON DELETE SET NULL,
  FOREIGN KEY (id_proyecto) REFERENCES proyectos(id_proyecto) ON DELETE SET NULL,
  INDEX idx_herramientas_categoria (id_categoria),
  INDEX idx_herramientas_estado (estado),
  INDEX idx_herramientas_proyecto (id_proyecto),
  INDEX idx_herramientas_codigo (codigo_herramienta)
) COMMENT='Inventario de herramientas y equipos';

-- Crear tabla movimientos_herramienta si no existe
CREATE TABLE IF NOT EXISTS movimientos_herramienta (
  id_movimiento INT PRIMARY KEY AUTO_INCREMENT,
  id_herramienta INT NOT NULL,
  tipo_movimiento ENUM('entrada', 'salida', 'transferencia', 'mantenimiento') NOT NULL,
  cantidad INT DEFAULT 1,
  fecha_movimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_proyecto_origen INT,
  id_proyecto_destino INT,
  usuario_responsable VARCHAR(255),
  observaciones TEXT,
  razon_movimiento VARCHAR(100) COMMENT 'Razón específica: prestamo, perdida, dano, mantenimiento, transferencia, etc.',
  detalle_adicional TEXT COMMENT 'Información adicional detallada sobre el movimiento',
  usuario_receptor VARCHAR(255) COMMENT 'Usuario que recibe la herramienta en caso de préstamo',
  fecha_devolucion_esperada DATE COMMENT 'Fecha esperada de devolución para préstamos',
  estado_movimiento ENUM('activo', 'completado', 'cancelado') DEFAULT 'activo' COMMENT 'Estado del movimiento',
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id_herramienta) ON DELETE CASCADE,
  FOREIGN KEY (id_proyecto_origen) REFERENCES proyectos(id_proyecto) ON DELETE SET NULL,
  FOREIGN KEY (id_proyecto_destino) REFERENCES proyectos(id_proyecto) ON DELETE SET NULL,
  INDEX idx_movimientos_herramienta (id_herramienta),
  INDEX idx_movimientos_fecha (fecha_movimiento),
  INDEX idx_movimientos_tipo (tipo_movimiento),
  INDEX idx_movimientos_razon (razon_movimiento),
  INDEX idx_movimientos_estado (estado_movimiento)
) COMMENT='Tabla de movimientos de herramientas con información detallada sobre razones y contexto';

-- ===== VERIFICACIÓN FINAL =====
-- Mostrar resumen de tablas creadas/actualizadas
SELECT 
    'MIGRACIÓN COMPLETADA' as status,
    NOW() as fecha_migracion,
    (SELECT COUNT(*) FROM categorias_suministro) as categorias_suministro,
    (SELECT COUNT(*) FROM conceptos_obra) as conceptos_obra,
    (SELECT COUNT(*) FROM categoria_herramienta) as categorias_herramienta;
