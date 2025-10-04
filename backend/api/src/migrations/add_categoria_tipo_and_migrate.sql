-- Migración para categorías de suministro con clasificación de tipo

-- Verificar si existe la tabla categorias_suministro, si no, crearla
CREATE TABLE IF NOT EXISTS categorias_suministro (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    color VARCHAR(7) DEFAULT '#3B82F6',
    orden INT DEFAULT 0,
    tipo ENUM('Proyecto', 'Administrativo') NOT NULL DEFAULT 'Proyecto' COMMENT 'Clasificación de la categoría: Proyecto (gastos de obra) o Administrativo (gastos de oficina)',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Si la tabla ya existía, agregar el campo tipo
ALTER TABLE categorias_suministro 
ADD COLUMN tipo ENUM('Proyecto', 'Administrativo') NOT NULL DEFAULT 'Proyecto' 
COMMENT 'Clasificación de la categoría: Proyecto (gastos de obra) o Administrativo (gastos de oficina)';

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

-- Agregar índice para mejorar consultas por tipo
CREATE INDEX idx_categorias_tipo ON categorias_suministro(tipo);

-- Agregar nueva columna FK en suministros
ALTER TABLE suministros 
ADD COLUMN id_categoria_suministro INT,
ADD INDEX idx_suministros_categoria (id_categoria_suministro);

-- Migrar datos existentes (mapear tipo_suministro a id_categoria)
UPDATE suministros s 
JOIN categorias_suministro c ON c.nombre = s.tipo_suministro 
SET s.id_categoria_suministro = c.id_categoria 
WHERE s.id_categoria_suministro IS NULL;