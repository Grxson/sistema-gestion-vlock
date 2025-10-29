/**
 * Ejecuta migraciones específicas para el módulo de Ingresos
 * - Agrega columnas faltantes: descripcion, fuente
 * Uso: node src/scripts/run-ingresos-migrations.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const sequelize = require('../config/db');

async function runIngresosMigrations() {
  try {
    console.log('🚀 Iniciando migraciones de Ingresos...\n');
    await sequelize.authenticate();
    console.log('✅ Conexión OK');

    const qi = sequelize.getQueryInterface();
    const { Sequelize } = sequelize;

    // Ejecutar migración: descripcion
    console.log('📝 Verificando/Agregando columna descripcion en ingresos...');
    const addDescripcion = require('../migrations/20251029_add_descripcion_to_ingresos');
    await addDescripcion.up(qi, Sequelize);
    console.log('✅ descripcion OK');

    // Ejecutar migración: fuente
    console.log('📝 Verificando/Agregando columna fuente en ingresos...');
    const addFuente = require('../migrations/20251029_add_fuente_to_ingresos');
    await addFuente.up(qi, Sequelize);
    console.log('✅ fuente OK');

    // Ejecutar migración: timestamps
    console.log('📝 Verificando/Agregando columnas createdAt/updatedAt en ingresos...');
    const addTimestamps = require('../migrations/20251029_add_timestamps_to_ingresos');
    await addTimestamps.up(qi, Sequelize);
    console.log('✅ timestamps OK');

    console.log('\n🎉 Migraciones de Ingresos finalizadas');
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Error ejecutando migraciones de Ingresos:', err);
    process.exit(1);
  }
}

runIngresosMigrations();
