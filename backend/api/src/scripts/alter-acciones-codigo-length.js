// Script para ampliar la longitud de acciones_permisos.codigo a VARCHAR(64)
// Uso: node src/scripts/alter-acciones-codigo-length.js

const models = require('../models');
const { DataTypes } = require('sequelize');

async function main() {
  const qi = models.sequelize.getQueryInterface();
  try {
    console.log('🔧 Alterando columna acciones_permisos.codigo -> VARCHAR(64)...');
    await qi.changeColumn('acciones_permisos', 'codigo', {
      type: DataTypes.STRING(64),
      allowNull: false,
    });
    console.log('✔ Columna actualizada correctamente.');
  } catch (err) {
    console.error('❌ Error alterando columna:', err);
    process.exitCode = 1;
  } finally {
    await models.sequelize.close();
  }
}

main();
