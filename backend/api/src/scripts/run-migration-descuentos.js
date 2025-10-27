/**
 * Script para ejecutar la migración de descuentos
 * Uso: node src/scripts/run-migration-descuentos.js
 */

const sequelize = require('../config/db');
const migration = require('../migrations/20251027_add_descuentos_column');

async function runMigration() {
  try {
    console.log('🚀 Iniciando ejecución de migración de descuentos...\n');

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar migración
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);

    console.log('\n✅ Migración ejecutada exitosamente');
    console.log('\n📋 Resumen de cambios:');
    console.log('   - Columna "descuentos" agregada a tabla nomina_empleados');
    console.log('   - Tipo: DECIMAL(10,2)');
    console.log('   - Valor por defecto: 0');
    console.log('   - Permite NULL: Sí');
    console.log('\n💡 Ahora puedes usar el campo "descuentos" para registrar adelantos');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migración:', error);
    console.error('\nDetalles del error:', error.message);
    process.exit(1);
  }
}

runMigration();
