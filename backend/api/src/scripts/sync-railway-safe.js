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

async function syncRailwayDatabaseSafe() {
  let connection;
  
  try {
    console.log('🔗 Conectando a Railway...');
    connection = await mysql.createConnection(railwayConfig);
    console.log('✅ Conectado a Railway');
    
    console.log('\\n🔍 Verificando estructura de tablas existentes...');
    
    // Verificar estructura de empleados
    const [empleadosStructure] = await connection.execute('DESCRIBE empleados');
    console.log('📋 Estructura de empleados:', empleadosStructure.map(c => c.Field).join(', '));
    
    // Verificar estructura de usuarios  
    const [usuariosStructure] = await connection.execute('DESCRIBE usuarios');
    console.log('📋 Estructura de usuarios:', usuariosStructure.map(c => c.Field).join(', '));
    
    console.log('\\n🔧 Iniciando sincronización segura...');
    
    // 1. Agregar columnas faltantes a tablas existentes primero
    console.log('\\n🔧 Actualizando estructuras de tablas existentes...');
    
    // Actualizar tabla empleados - agregar RFC
    try {
      await connection.execute(`ALTER TABLE empleados ADD COLUMN rfc varchar(13) DEFAULT NULL`);
      console.log('  ✅ Columna RFC agregada a empleados');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('  ℹ️  Columna RFC ya existe en empleados');
      } else {
        console.log(`  ⚠️  Error agregando RFC: ${error.message}`);
      }
    }
    
    // Actualizar tabla herramientas - agregar stock_inicial
    try {
      await connection.execute(`ALTER TABLE herramientas ADD COLUMN stock_inicial int DEFAULT '0'`);
      console.log('  ✅ Columna stock_inicial agregada a herramientas');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('  ℹ️  Columna stock_inicial ya existe en herramientas');
      } else {
        console.log(`  ⚠️  Error agregando stock_inicial: ${error.message}`);
      }
    }
    
    // Actualizar tabla categorias_suministro - agregar icono
    try {
      await connection.execute(`ALTER TABLE categorias_suministro ADD COLUMN icono varchar(50) DEFAULT NULL`);
      console.log('  ✅ Columna icono agregada a categorias_suministro');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('  ℹ️  Columna icono ya existe en categorias_suministro');
      } else {
        console.log(`  ⚠️  Error agregando icono: ${error.message}`);
      }
    }
    
    // Actualizar tabla categorias_gastos - agregar fechas
    try {
      await connection.execute(`ALTER TABLE categorias_gastos ADD COLUMN fecha_creacion timestamp DEFAULT CURRENT_TIMESTAMP`);
      console.log('  ✅ Columna fecha_creacion agregada a categorias_gastos');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('  ℹ️  Columna fecha_creacion ya existe en categorias_gastos');
      } else {
        console.log(`  ⚠️  Error agregando fecha_creacion: ${error.message}`);
      }
    }
    
    try {
      await connection.execute(`ALTER TABLE categorias_gastos ADD COLUMN fecha_actualizacion timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`);
      console.log('  ✅ Columna fecha_actualizacion agregada a categorias_gastos');
    } catch (error) {
      if (error.message.includes('Duplicate column name')) {
        console.log('  ℹ️  Columna fecha_actualizacion ya existe en categorias_gastos');
      } else {
        console.log(`  ⚠️  Error agregando fecha_actualizacion: ${error.message}`);
      }
    }
    
    // 2. Crear tablas nuevas sin foreign keys problemáticas
    console.log('\\n📋 Creando tablas faltantes...');
    
    // Tabla adeudos_empleados (sin foreign keys por ahora)
    try {
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
          KEY autorizado_por (autorizado_por)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('  ✅ Tabla adeudos_empleados creada');
    } catch (error) {
      console.log(`  ⚠️  Error creando adeudos_empleados: ${error.message}`);
    }
    
    // Tabla user_shortcuts
    try {
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
          KEY usuario_id (usuario_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('  ✅ Tabla user_shortcuts creada');
    } catch (error) {
      console.log(`  ⚠️  Error creando user_shortcuts: ${error.message}`);
    }
    
    // Tabla ubicaciones_especificas
    try {
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
          KEY ubicacion_padre_id (ubicacion_padre_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('  ✅ Tabla ubicaciones_especificas creada');
    } catch (error) {
      console.log(`  ⚠️  Error creando ubicaciones_especificas: ${error.message}`);
    }
    
    // Tabla precios_unitarios
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS precios_unitarios (
          id int NOT NULL AUTO_INCREMENT,
          concepto_obra_id int NOT NULL,
          catalogo_id int NOT NULL,
          precio decimal(12,4) NOT NULL,
          factor_ajuste decimal(8,4) DEFAULT '1.0000',
          precio_ajustado decimal(12,4) DEFAULT NULL,
          fecha_vigencia_inicio date NOT NULL,
          fecha_vigencia_fin date DEFAULT NULL,
          observaciones text,
          activo tinyint(1) DEFAULT '1',
          createdAt datetime NOT NULL,
          updatedAt datetime NOT NULL,
          PRIMARY KEY (id),
          KEY concepto_obra_id (concepto_obra_id),
          KEY catalogo_id (catalogo_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
      `);
      console.log('  ✅ Tabla precios_unitarios creada');
    } catch (error) {
      console.log(`  ⚠️  Error creando precios_unitarios: ${error.message}`);
    }
    
    // 3. Actualizar stock_inicial en herramientas existentes
    console.log('\\n📊 Actualizando datos...');
    try {
      const [result] = await connection.execute(`
        UPDATE herramientas 
        SET stock_inicial = stock 
        WHERE stock_inicial IS NULL OR stock_inicial = 0
      `);
      console.log(`  ✅ Stock inicial actualizado en ${result.affectedRows} herramientas`);
    } catch (error) {
      console.log(`  ⚠️  Error actualizando stock inicial: ${error.message}`);
    }
    
    console.log('\\n🎉 Sincronización segura completada!');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error.message);
    throw error;
  } finally {
    if (connection) await connection.end();
  }
}

// Ejecutar sincronización
syncRailwayDatabaseSafe()
  .then(() => {
    console.log('\\n✅ Proceso de sincronización terminado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\\n❌ Error en la sincronización:', error.message);
    process.exit(1);
  });