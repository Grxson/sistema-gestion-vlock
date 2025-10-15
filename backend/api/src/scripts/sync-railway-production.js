const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración para Railway
const railwayConfig = {
  host: 'crossover.proxy.rlwy.net',
  user: 'root',
  password: 'nArkIEmlZXJfvffITuStuiuiVIvCmbri',
  database: 'railway',
  port: 15395
};

async function syncRailwayDatabase() {
  let connection;
  
  try {
    console.log('🔗 Conectando a Railway...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Conectado a Railway');
    
    console.log('\\n🔧 Iniciando sincronización de Railway...');
    
    // 1. Crear tablas faltantes
    console.log('\\n📋 Creando tablas faltantes...');
    
    // Tabla adeudos_empleados
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS adeudos_empleados (
        id int NOT NULL AUTO_INCREMENT,
        empleado_id int NOT NULL,
        concepto varchar(255) NOT NULL,
        descripcion text,
        monto_total decimal(10,2) NOT NULL,
        monto_pendiente decimal(10,2) NOT NULL,
        fecha_creacion date NOT NULL,
        fecha_vencimiento date DEFAULT NULL,
        tipo_adeudo enum('prestamo','anticipo','descuento','multa','otros') NOT NULL DEFAULT 'prestamo',
        estado enum('pendiente','en_proceso','liquidado','cancelado') NOT NULL DEFAULT 'pendiente',
        numero_cuotas int DEFAULT NULL,
        cuotas_pagadas int DEFAULT '0',
        monto_cuota decimal(10,2) DEFAULT NULL,
        tasa_interes decimal(5,2) DEFAULT '0.00',
        observaciones text,
        autorizado_por int DEFAULT NULL,
        fecha_autorizacion datetime DEFAULT NULL,
        activo tinyint(1) DEFAULT '1',
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        KEY empleado_id (empleado_id),
        KEY autorizado_por (autorizado_por),
        CONSTRAINT adeudos_empleados_ibfk_1 FOREIGN KEY (empleado_id) REFERENCES empleados (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT adeudos_empleados_ibfk_2 FOREIGN KEY (autorizado_por) REFERENCES usuarios (id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('  ✅ Tabla adeudos_empleados creada');
    
    // Tabla precios_unitarios  
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS precios_unitarios (
        id int NOT NULL AUTO_INCREMENT,
        concepto_obra_id int NOT NULL,
        catalogo_id int NOT NULL,
        precio decimal(12,4) NOT NULL,
        factor_ajuste decimal(8,4) DEFAULT '1.0000',
        precio_ajustado decimal(12,4) GENERATED ALWAYS AS ((precio * factor_ajuste)) STORED,
        fecha_vigencia_inicio date NOT NULL,
        fecha_vigencia_fin date DEFAULT NULL,
        observaciones text,
        activo tinyint(1) DEFAULT '1',
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        KEY concepto_obra_id (concepto_obra_id),
        KEY catalogo_id (catalogo_id),
        CONSTRAINT precios_unitarios_ibfk_1 FOREIGN KEY (concepto_obra_id) REFERENCES conceptos_obra (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT precios_unitarios_ibfk_2 FOREIGN KEY (catalogo_id) REFERENCES catalogos_precios (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('  ✅ Tabla precios_unitarios creada');
    
    // Tabla ubicaciones_especificas
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS ubicaciones_especificas (
        id int NOT NULL AUTO_INCREMENT,
        proyecto_id int NOT NULL,
        nombre varchar(255) NOT NULL,
        descripcion text,
        tipo enum('area','zona','nivel','sector','frente') NOT NULL DEFAULT 'area',
        coordenadas json DEFAULT NULL,
        area_m2 decimal(10,2) DEFAULT NULL,
        ubicacion_padre_id int DEFAULT NULL,
        activo tinyint(1) DEFAULT '1',
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        KEY proyecto_id (proyecto_id),
        KEY ubicacion_padre_id (ubicacion_padre_id),
        CONSTRAINT ubicaciones_especificas_ibfk_1 FOREIGN KEY (proyecto_id) REFERENCES proyectos (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT ubicaciones_especificas_ibfk_2 FOREIGN KEY (ubicacion_padre_id) REFERENCES ubicaciones_especificas (id) ON DELETE SET NULL ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('  ✅ Tabla ubicaciones_especificas creada');
    
    // Tabla user_shortcuts
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_shortcuts (
        id int NOT NULL AUTO_INCREMENT,
        usuario_id int NOT NULL,
        nombre varchar(100) NOT NULL,
        ruta varchar(255) NOT NULL,
        icono varchar(50) DEFAULT NULL,
        color varchar(20) DEFAULT NULL,
        orden int DEFAULT '0',
        activo tinyint(1) DEFAULT '1',
        createdAt datetime NOT NULL,
        updatedAt datetime NOT NULL,
        PRIMARY KEY (id),
        KEY usuario_id (usuario_id),
        CONSTRAINT user_shortcuts_ibfk_1 FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
    `);
    console.log('  ✅ Tabla user_shortcuts creada');
    
    // 2. Modificar estructuras de tablas existentes
    console.log('\\n🔧 Actualizando estructuras de tablas...');
    
    // Actualizar tabla empleados - agregar RFC
    try {
      await connection.execute(`ALTER TABLE empleados ADD COLUMN rfc varchar(13) DEFAULT NULL`);
      console.log('  ✅ Columna RFC agregada a empleados');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log(`  ⚠️  Error agregando RFC: ${error.message}`);
      }
    }
    
    // Actualizar tabla herramientas - agregar stock_inicial
    try {
      await connection.execute(`ALTER TABLE herramientas ADD COLUMN stock_inicial int DEFAULT '0'`);
      console.log('  ✅ Columna stock_inicial agregada a herramientas');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log(`  ⚠️  Error agregando stock_inicial: ${error.message}`);
      }
    }
    
    // Actualizar tabla categorias_suministro - agregar icono
    try {
      await connection.execute(`ALTER TABLE categorias_suministro ADD COLUMN icono varchar(50) DEFAULT NULL`);
      console.log('  ✅ Columna icono agregada a categorias_suministro');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log(`  ⚠️  Error agregando icono: ${error.message}`);
      }
    }
    
    // Actualizar tabla categorias_gastos - agregar fechas
    try {
      await connection.execute(`ALTER TABLE categorias_gastos ADD COLUMN fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP`);
      await connection.execute(`ALTER TABLE categorias_gastos ADD COLUMN fecha_actualizacion timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      console.log('  ✅ Columnas de fecha agregadas a categorias_gastos');
    } catch (error) {
      if (!error.message.includes('Duplicate column name')) {
        console.log(`  ⚠️  Error agregando fechas: ${error.message}`);
      }
    }
    
    // Actualizar tabla nomina_empleados - agregar columnas faltantes
    try {
      const columnasNomina = [
        'deducciones_isr decimal(10,2) DEFAULT 0.00',
        'deducciones_imss decimal(10,2) DEFAULT 0.00', 
        'deducciones_infonavit decimal(10,2) DEFAULT 0.00',
        'deducciones_adicionales decimal(10,2) DEFAULT 0.00',
        'aplicar_isr tinyint(1) DEFAULT 1',
        'aplicar_imss tinyint(1) DEFAULT 1',
        'aplicar_infonavit tinyint(1) DEFAULT 1',
        'monto_pagado decimal(10,2) DEFAULT 0.00'
      ];
      
      for (const columna of columnasNomina) {
        try {
          await connection.execute(`ALTER TABLE nomina_empleados ADD COLUMN ${columna}`);
        } catch (err) {
          if (!err.message.includes('Duplicate column name')) {
            console.log(`    ⚠️  Error agregando ${columna.split(' ')[0]}: ${err.message}`);
          }
        }
      }
      console.log('  ✅ Columnas de deducciones agregadas a nomina_empleados');
    } catch (error) {
      console.log(`  ⚠️  Error actualizando nomina_empleados: ${error.message}`);
    }
    
    // 3. Actualizar stock_inicial en herramientas existentes
    console.log('\\n📊 Actualizando stock inicial en herramientas...');
    try {
      await connection.execute(`
        UPDATE herramientas 
        SET stock_inicial = stock 
        WHERE stock_inicial IS NULL OR stock_inicial = 0
      `);
      console.log('  ✅ Stock inicial actualizado en herramientas');
    } catch (error) {
      console.log(`  ⚠️  Error actualizando stock inicial: ${error.message}`);
    }
    
    console.log('\\n🎉 Sincronización completada!');
    console.log('\\n📋 Resumen de cambios:');
    console.log('  ✅ 4 tablas nuevas creadas');
    console.log('  ✅ Estructuras de tablas actualizadas');
    console.log('  ✅ Datos de stock inicial sincronizados');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar sincronización
syncRailwayDatabase()
  .then(() => {
    console.log('\\n✅ Proceso de sincronización terminado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Error en la sincronización:', error.message);
    process.exit(1);
  });