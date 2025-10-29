'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'ingresos';
    const [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'fuente';`);
    const exists = Array.isArray(results) && results.length > 0;

    if (!exists) {
      await queryInterface.addColumn(table, 'fuente', {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Fuente del ingreso (cliente/razón)'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'ingresos';
    const [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'fuente';`);
    const exists = Array.isArray(results) && results.length > 0;

    if (exists) {
      await queryInterface.removeColumn(table, 'fuente');
    }
  }
};
