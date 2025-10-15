const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración para la base de datos local
const localConfig = {
  host: 'localhost',
  user: 'root',
  password: 'grxson_18',
  database: 'sistema_gestion',
  port: 3306
};

// Configuración para Railway
const railwayConfig = {
  host: 'crossover.proxy.rlwy.net',
  user: 'root',
  password: 'nArkIEmlZXJfvffITuStuiuiVIvCmbri',
  database: 'railway',
  port: 15395
};

async function compareStructures() {
  let localConnection, railwayConnection;
  
  try {
    console.log('🔗 Conectando a las bases de datos...');
    
    // Conectar a ambas bases de datos
    localConnection = await mysql.createConnection(localConfig);
    railwayConnection = await mysql.createConnection(railwayConfig);
    
    console.log('✅ Conexiones establecidas');
    
    // Obtener tablas de ambas bases
    const [localTables] = await localConnection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [localConfig.database]
    );
    
    const [railwayTables] = await railwayConnection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? ORDER BY TABLE_NAME",
      [railwayConfig.database]
    );
    
    const localTableNames = localTables.map(t => t.TABLE_NAME);
    const railwayTableNames = railwayTables.map(t => t.TABLE_NAME);
    
    console.log('\\n📊 COMPARACIÓN DE ESTRUCTURAS DE BASE DE DATOS');
    console.log('=' .repeat(60));
    console.log(`📍 Local (${localConfig.database}): ${localTableNames.length} tablas`);
    console.log(`🚂 Railway (${railwayConfig.database}): ${railwayTableNames.length} tablas`);
    
    // Tablas que están en local pero no en Railway
    const missingInRailway = localTableNames.filter(table => !railwayTableNames.includes(table));
    if (missingInRailway.length > 0) {
      console.log('\\n🔴 Tablas faltantes en Railway:');
      missingInRailway.forEach(table => console.log(`  - ${table}`));
    }
    
    // Tablas que están en Railway pero no en local
    const extraInRailway = railwayTableNames.filter(table => !localTableNames.includes(table));
    if (extraInRailway.length > 0) {
      console.log('\\n🟡 Tablas extras en Railway:');
      extraInRailway.forEach(table => console.log(`  - ${table}`));
    }
    
    // Tablas comunes
    const commonTables = localTableNames.filter(table => railwayTableNames.includes(table));
    console.log(`\\n✅ Tablas comunes: ${commonTables.length}`);
    
    // Verificar estructura de tablas comunes
    console.log('\\n🔍 Verificando estructuras de tablas comunes...');
    
    const structureDifferences = [];
    
    for (const tableName of commonTables) {
      try {
        // Obtener estructura de la tabla local
        const [localColumns] = await localConnection.execute(
          `DESCRIBE ${tableName}`
        );
        
        // Obtener estructura de la tabla Railway
        const [railwayColumns] = await railwayConnection.execute(
          `DESCRIBE ${tableName}`
        );
        
        // Comparar columnas
        const localColNames = localColumns.map(c => c.Field);
        const railwayColNames = railwayColumns.map(c => c.Field);
        
        const missingCols = localColNames.filter(col => !railwayColNames.includes(col));
        const extraCols = railwayColNames.filter(col => !localColNames.includes(col));
        
        if (missingCols.length > 0 || extraCols.length > 0) {
          structureDifferences.push({
            table: tableName,
            missingInRailway: missingCols,
            extraInRailway: extraCols
          });
        }
        
        // Verificar conteo de registros
        const [localCount] = await localConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        const [railwayCount] = await railwayConnection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
        
        if (localCount[0].count !== railwayCount[0].count) {
          console.log(`  📊 ${tableName}: Local(${localCount[0].count}) vs Railway(${railwayCount[0].count})`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error verificando ${tableName}: ${error.message}`);
      }
    }
    
    if (structureDifferences.length > 0) {
      console.log('\\n🔴 DIFERENCIAS EN ESTRUCTURA:');
      structureDifferences.forEach(diff => {
        console.log(`\\n  Tabla: ${diff.table}`);
        if (diff.missingInRailway.length > 0) {
          console.log(`    ❌ Columnas faltantes en Railway: ${diff.missingInRailway.join(', ')}`);
        }
        if (diff.extraInRailway.length > 0) {
          console.log(`    ➕ Columnas extras en Railway: ${diff.extraInRailway.join(', ')}`);
        }
      });
    } else {
      console.log('\\n✅ Las estructuras de tablas comunes son idénticas');
    }
    
    // Resumen final
    console.log('\\n' + '=' .repeat(60));
    console.log('📋 RESUMEN:');
    console.log(`  • Tablas faltantes en Railway: ${missingInRailway.length}`);
    console.log(`  • Tablas extras en Railway: ${extraInRailway.length}`);
    console.log(`  • Diferencias de estructura: ${structureDifferences.length}`);
    
    if (missingInRailway.length === 0 && structureDifferences.length === 0) {
      console.log('\\n🎉 Railway está sincronizado con la estructura local!');
      return true;
    } else {
      console.log('\\n⚠️  Se requiere sincronización');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    if (localConnection) await localConnection.end();
    if (railwayConnection) await railwayConnection.end();
  }
}

compareStructures();