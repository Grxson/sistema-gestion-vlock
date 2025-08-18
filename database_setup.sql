-- Script SQL para crear la base de datos sistema_gestion
-- Este script incluye todas las tablas necesarias, índices y vistas

-- Crear base de datos
CREATE DATABASE IF NOT EXISTS sistema_gestion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE sistema_gestion;

-- Tabla de roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    id_rol INT NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles (id_rol)
) ENGINE = InnoDB;

-- Tabla de acciones de permisos
CREATE TABLE IF NOT EXISTS acciones_permiso (
    id_accion INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    descripcion TEXT,
    modulo VARCHAR(30) NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB;

-- Tabla de permisos por rol
CREATE TABLE IF NOT EXISTS permisos_rol (
    id_permiso INT AUTO_INCREMENT PRIMARY KEY,
    id_rol INT NOT NULL,
    id_accion INT NOT NULL,
    permitido BOOLEAN DEFAULT TRUE,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES roles (id_rol),
    FOREIGN KEY (id_accion) REFERENCES acciones_permiso (id_accion),
    UNIQUE KEY `rol_accion_unique` (id_rol, id_accion)
) ENGINE = InnoDB;

-- Tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    accion ENUM(
        'LOGIN',
        'INSERT',
        'UPDATE',
        'DELETE'
    ) NOT NULL,
    tabla VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255),
    fecha_hora DATETIME NOT NULL,
    ip VARCHAR(45),
    datos_antiguos JSON,
    datos_nuevos JSON,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

-- Tabla de oficios
CREATE TABLE IF NOT EXISTS oficios (
    id_oficio INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    salario_base DECIMAL(10, 2)
) ENGINE = InnoDB;

-- Tabla de tipos de contrato
CREATE TABLE IF NOT EXISTS contratos (
    id_contrato INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT,
    tipo ENUM(
        'Temporal',
        'Indefinido',
        'Obra',
        'Servicio'
    ) NOT NULL
) ENGINE = InnoDB;

-- Tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id_empleado INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    nss VARCHAR(20),
    telefono VARCHAR(20),
    contacto_emergencia VARCHAR(100),
    telefono_emergencia VARCHAR(20),
    banco VARCHAR(50),
    cuenta_bancaria VARCHAR(50),
    id_contrato INT,
    id_oficio INT,
    fecha_alta DATE NOT NULL,
    fecha_baja DATE,
    FOREIGN KEY (id_contrato) REFERENCES contratos (id_contrato),
    FOREIGN KEY (id_oficio) REFERENCES oficios (id_oficio)
) ENGINE = InnoDB;

-- Tabla de semanas para nómina
CREATE TABLE IF NOT EXISTS semana_nomina (
    id_semana INT AUTO_INCREMENT PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    cerrada BOOLEAN DEFAULT FALSE,
    observaciones TEXT
) ENGINE = InnoDB;

-- Tabla de nóminas de empleados
CREATE TABLE IF NOT EXISTS nomina_empleados (
    id_nomina INT AUTO_INCREMENT PRIMARY KEY,
    id_empleado INT NOT NULL,
    id_semana INT NOT NULL,
    dias_trabajados DECIMAL(3, 1) NOT NULL,
    horas_extra INT DEFAULT 0,
    descuentos DECIMAL(10, 2) DEFAULT 0,
    bonos DECIMAL(10, 2) DEFAULT 0,
    total_pagar DECIMAL(10, 2) NOT NULL,
    observaciones TEXT,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_empleado) REFERENCES empleados (id_empleado),
    FOREIGN KEY (id_semana) REFERENCES semana_nomina (id_semana)
) ENGINE = InnoDB;

-- Tabla de pagos de nómina
CREATE TABLE IF NOT EXISTS pagos_nomina (
    id_pago INT AUTO_INCREMENT PRIMARY KEY,
    id_nomina INT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha_pago DATE NOT NULL,
    metodo_pago ENUM(
        'Efectivo',
        'Transferencia',
        'Cheque'
    ) NOT NULL,
    comprobante VARCHAR(100),
    observaciones TEXT,
    FOREIGN KEY (id_nomina) REFERENCES nomina_empleados (id_nomina)
) ENGINE = InnoDB;

-- Tabla de proyectos
CREATE TABLE IF NOT EXISTS proyectos (
    id_proyecto INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado ENUM(
        'Activo',
        'Pausado',
        'Finalizado'
    ) DEFAULT 'Activo',
    responsable VARCHAR(100)
) ENGINE = InnoDB;

-- Tabla de categorías de gastos
CREATE TABLE IF NOT EXISTS categoria_gasto (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
) ENGINE = InnoDB;

-- Tabla de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id_gasto INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT,
    id_categoria INT NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    comprobante BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos (id_proyecto),
    FOREIGN KEY (id_categoria) REFERENCES categoria_gasto (id_categoria)
) ENGINE = InnoDB;

-- Tabla de ingresos
CREATE TABLE IF NOT EXISTS ingresos (
    id_ingreso INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    fecha DATE NOT NULL,
    comprobante BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos (id_proyecto)
) ENGINE = InnoDB;

-- Tabla de presupuestos
CREATE TABLE IF NOT EXISTS presupuestos (
    id_presupuesto INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    concepto VARCHAR(100) NOT NULL,
    monto_estimado DECIMAL(10, 2) NOT NULL,
    monto_real DECIMAL(10, 2),
    fecha_estimacion DATE NOT NULL,
    observaciones TEXT,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos (id_proyecto)
) ENGINE = InnoDB;

-- Tabla de estados de cuenta
CREATE TABLE IF NOT EXISTS estado_cuenta (
    id_estado INT AUTO_INCREMENT PRIMARY KEY,
    id_proyecto INT NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    total_ingresos DECIMAL(10, 2) NOT NULL,
    total_gastos DECIMAL(10, 2) NOT NULL,
    balance DECIMAL(10, 2) NOT NULL,
    observaciones TEXT,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_proyecto) REFERENCES proyectos (id_proyecto)
) ENGINE = InnoDB;

-- Tabla de categorías de herramientas
CREATE TABLE IF NOT EXISTS categoria_herramienta (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion TEXT
) ENGINE = InnoDB;

-- Tabla de herramientas
CREATE TABLE IF NOT EXISTS herramientas (
    id_herramienta INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha_adquisicion DATE,
    costo DECIMAL(10, 2),
    estado ENUM(
        'Disponible',
        'En uso',
        'En mantenimiento',
        'Baja'
    ) DEFAULT 'Disponible',
    FOREIGN KEY (id_categoria) REFERENCES categoria_herramienta (id_categoria)
) ENGINE = InnoDB;

-- Tabla de movimientos de herramientas
CREATE TABLE IF NOT EXISTS movimiento_herramienta (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_herramienta INT NOT NULL,
    id_proyecto INT,
    tipo_movimiento ENUM(
        'Asignación',
        'Devolución',
        'Mantenimiento',
        'Baja'
    ) NOT NULL,
    fecha_movimiento DATETIME NOT NULL,
    responsable VARCHAR(100),
    observaciones TEXT,
    FOREIGN KEY (id_herramienta) REFERENCES herramientas (id_herramienta),
    FOREIGN KEY (id_proyecto) REFERENCES proyectos (id_proyecto)
) ENGINE = InnoDB;

-- Tabla de adjuntos
CREATE TABLE IF NOT EXISTS adjuntos (
    id_adjunto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    tipo_archivo VARCHAR(50) NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    tamaño INT NOT NULL,
    id_usuario INT NOT NULL,
    fecha_subida DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

-- Tabla de relaciones de adjuntos
CREATE TABLE IF NOT EXISTS adjunto_relaciones (
    id_relacion INT AUTO_INCREMENT PRIMARY KEY,
    id_adjunto INT NOT NULL,
    tabla_relacion VARCHAR(50) NOT NULL,
    id_registro INT NOT NULL,
    descripcion TEXT,
    FOREIGN KEY (id_adjunto) REFERENCES adjuntos (id_adjunto)
) ENGINE = InnoDB;

-- Tabla de reportes generados
CREATE TABLE IF NOT EXISTS reportes_generados (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    tipo_reporte VARCHAR(50) NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta VARCHAR(255) NOT NULL,
    parametros JSON,
    id_usuario INT NOT NULL,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

-- Tabla de logs de integración
CREATE TABLE IF NOT EXISTS integracion_log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    tipo_integracion VARCHAR(50) NOT NULL,
    evento VARCHAR(50) NOT NULL,
    resultado ENUM('Exitoso', 'Error') NOT NULL,
    detalles TEXT,
    id_usuario INT,
    fecha_hora DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios (id_usuario)
) ENGINE = InnoDB;

-- Crear índices para mejorar el rendimiento

-- Índice para búsquedas de usuarios por email (frecuente en login)
CREATE INDEX idx_usuarios_email ON usuarios (email);

-- Índice para búsquedas de usuarios por nombre de usuario
CREATE INDEX idx_usuarios_nombre ON usuarios (nombre_usuario);

-- Índice para búsquedas de auditoría por tipo de acción y fecha
CREATE INDEX idx_auditoria_accion_fecha ON auditoria (accion, fecha_hora);

-- Índice para búsquedas de empleados por nombre y apellido
CREATE INDEX idx_empleados_nombre ON empleados (nombre, apellido);

-- Índice para búsquedas de proyectos por estado
CREATE INDEX idx_proyectos_estado ON proyectos (estado);

-- Índice para búsquedas de gastos por fecha
CREATE INDEX idx_gastos_fecha ON gastos (fecha);

-- Índice para búsquedas de herramientas por estado
CREATE INDEX idx_herramientas_estado ON herramientas (estado);

-- Índice para búsquedas de movimientos por tipo y fecha
CREATE INDEX idx_movimientos_tipo_fecha ON movimiento_herramienta (
    tipo_movimiento,
    fecha_movimiento
);

-- Crear vistas para consultas comunes

-- Vista de empleados activos con sus datos de contrato y oficio
CREATE OR REPLACE VIEW vw_empleados_activos AS
SELECT
    e.id_empleado,
    e.nombre,
    e.apellido,
    e.nss,
    e.telefono,
    o.nombre AS oficio,
    o.salario_base,
    c.nombre AS tipo_contrato,
    e.fecha_alta
FROM
    empleados e
    LEFT JOIN oficios o ON e.id_oficio = o.id_oficio
    LEFT JOIN contratos c ON e.id_contrato = c.id_contrato
WHERE
    e.fecha_baja IS NULL;

-- Vista de resumen de proyectos con totales financieros
CREATE OR REPLACE VIEW vw_resumen_proyectos AS
SELECT
    p.id_proyecto,
    p.nombre,
    p.estado,
    p.fecha_inicio,
    p.fecha_fin,
    COALESCE(SUM(i.monto), 0) AS total_ingresos,
    COALESCE(SUM(g.monto), 0) AS total_gastos,
    COALESCE(SUM(i.monto), 0) - COALESCE(SUM(g.monto), 0) AS balance
FROM
    proyectos p
    LEFT JOIN ingresos i ON p.id_proyecto = i.id_proyecto
    LEFT JOIN gastos g ON p.id_proyecto = g.id_proyecto
GROUP BY
    p.id_proyecto;

-- Vista de gastos por categoría y proyecto
CREATE OR REPLACE VIEW vw_gastos_por_categoria AS
SELECT
    p.id_proyecto,
    p.nombre AS proyecto,
    cg.nombre AS categoria,
    SUM(g.monto) AS total_gastado,
    COUNT(g.id_gasto) AS num_gastos
FROM
    gastos g
    JOIN categoria_gasto cg ON g.id_categoria = cg.id_categoria
    JOIN proyectos p ON g.id_proyecto = p.id_proyecto
GROUP BY
    p.id_proyecto,
    cg.id_categoria;

-- Vista de inventario de herramientas con su estado actual
CREATE OR REPLACE VIEW vw_inventario_herramientas AS
SELECT
    h.id_herramienta,
    h.codigo,
    h.nombre,
    h.estado,
    ch.nombre AS categoria,
    h.fecha_adquisicion,
    h.costo,
    CASE
        WHEN h.estado = 'En uso' THEN (
            SELECT p.nombre
            FROM
                movimiento_herramienta mh
                JOIN proyectos p ON mh.id_proyecto = p.id_proyecto
            WHERE
                mh.id_herramienta = h.id_herramienta
                AND mh.tipo_movimiento = 'Asignación'
            ORDER BY mh.fecha_movimiento DESC
            LIMIT 1
        )
        ELSE NULL
    END AS proyecto_actual
FROM
    herramientas h
    JOIN categoria_herramienta ch ON h.id_categoria = ch.id_categoria;

-- Vista de resumen de usuarios con sus roles
CREATE OR REPLACE VIEW vw_usuarios_roles AS
SELECT u.id_usuario, u.nombre_usuario, u.email, u.activo, r.id_rol, r.nombre AS rol
FROM usuarios u
    JOIN roles r ON u.id_rol = r.id_rol;

-- Vista de nóminas pendientes de pago
CREATE OR REPLACE VIEW vw_nominas_pendientes AS
SELECT
    ne.id_nomina,
    e.nombre,
    e.apellido,
    sn.fecha_inicio AS semana_inicio,
    sn.fecha_fin AS semana_fin,
    ne.total_pagar,
    COALESCE(SUM(pn.monto), 0) AS total_pagado,
    ne.total_pagar - COALESCE(SUM(pn.monto), 0) AS pendiente_pago
FROM
    nomina_empleados ne
    JOIN empleados e ON ne.id_empleado = e.id_empleado
    JOIN semana_nomina sn ON ne.id_semana = sn.id_semana
    LEFT JOIN pagos_nomina pn ON ne.id_nomina = pn.id_nomina
GROUP BY
    ne.id_nomina
HAVING
    pendiente_pago > 0;

-- Trigger para actualizar el estado de herramientas cuando se registra un movimiento
DELIMITER /
/

CREATE TRIGGER trg_actualizar_estado_herramienta AFTER INSERT ON movimiento_herramienta
FOR EACH ROW
BEGIN
  IF NEW.tipo_movimiento = 'Asignación' THEN
    UPDATE herramientas SET estado = 'En uso' WHERE id_herramienta = NEW.id_herramienta;
  ELSEIF NEW.tipo_movimiento = 'Devolución' THEN
    UPDATE herramientas SET estado = 'Disponible' WHERE id_herramienta = NEW.id_herramienta;
  ELSEIF NEW.tipo_movimiento = 'Mantenimiento' THEN
    UPDATE herramientas SET estado = 'En mantenimiento' WHERE id_herramienta = NEW.id_herramienta;
  ELSEIF NEW.tipo_movimiento = 'Baja' THEN
    UPDATE herramientas SET estado = 'Baja' WHERE id_herramienta = NEW.id_herramienta;
  END IF;
END
/
/

DELIMITER /
/

-- Insertar datos iniciales para roles
INSERT INTO
    roles (id_rol, nombre, descripcion)
VALUES (
        1,
        'Administrador',
        'Control total del sistema'
    ),
    (
        2,
        'Usuario',
        'Usuario con acceso limitado'
    );