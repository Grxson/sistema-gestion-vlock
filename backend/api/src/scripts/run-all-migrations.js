/**
 * Script para ejecutar todas las migraciones pendientes
 * Uso: node src/scripts/run-all-migrations.js
 */

const sequelize = require('../config/db');

async function runAllMigrations() {
  try {
    console.log('🚀 Iniciando ejecución de todas las migraciones...\n');

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Migración 1: Agregar columna descuentos
    console.log('📝 Ejecutando Migración 1: Agregar columna descuentos...');
    const migration1 = require('../migrations/20251027_add_descuentos_column');
    await migration1.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    console.log('✅ Migración 1 completada\n');

    // Migración 2: Optimizar tabla
    console.log('📝 Ejecutando Migración 2: Optimizar tabla nomina_empleados...');
    const migration2 = require('../migrations/20251027_optimize_nomina_table');
    await migration2.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    console.log('✅ Migración 2 completada\n');

    console.log('🎉 ¡Todas las migraciones ejecutadas exitosamente!\n');
    console.log('📋 Resumen de cambios:');
    console.log('   ✅ Columna "descuentos" agregada');
    console.log('   ✅ Eliminados campos redundantes (aplicar_isr, aplicar_imss, aplicar_infonavit)');
    console.log('   ✅ Eliminados campos innecesarios (deducciones, archivo_pdf_path, es_pago_semanal)');
    console.log('   ✅ Eliminados campos de auditoría (version, creada_por, etc.)');
    console.log('   ✅ Tabla optimizada y simplificada\n');
    console.log('💡 Ahora: 0 = no aplicado/cálculo automático, >0 = monto manual\n');
    console.log('⚠️  IMPORTANTE: Reinicia el backend para cargar el modelo actualizado');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error);
    console.error('\nDetalles del error:', error.message);
    process.exit(1);
  }
}

runAllMigrations();
