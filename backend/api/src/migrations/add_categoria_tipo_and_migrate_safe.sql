-- Migración segura para categorías de suministro

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

-- Verificar si el índice ya existe, si no crearlo
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

-- Verificar si el índice ya existe en suministros
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