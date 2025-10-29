'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe antes de agregarla
    const table = 'ingresos';
    const [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'descripcion';`);
    const exists = Array.isArray(results) && results.length > 0;

    if (!exists) {
      await queryInterface.addColumn(table, 'descripcion', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descripción del ingreso'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'ingresos';
    // Solo intentar eliminar si existe
    const [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'descripcion';`);
    const exists = Array.isArray(results) && results.length > 0;

    if (exists) {
      await queryInterface.removeColumn(table, 'descripcion');
    }
  }
};
