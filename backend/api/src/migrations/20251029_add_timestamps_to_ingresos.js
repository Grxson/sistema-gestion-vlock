'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = 'ingresos';

    // createdAt
    let [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'createdAt';`);
    let exists = Array.isArray(results) && results.length > 0;
    if (!exists) {
      await queryInterface.addColumn(table, 'createdAt', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de creación (agregada por migración)'
      });
    }

    // updatedAt
    ;[results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'updatedAt';`);
    exists = Array.isArray(results) && results.length > 0;
    if (!exists) {
      await queryInterface.addColumn(table, 'updatedAt', {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha de actualización (agregada por migración)'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = 'ingresos';

    let [results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'createdAt';`);
    let exists = Array.isArray(results) && results.length > 0;
    if (exists) {
      await queryInterface.removeColumn(table, 'createdAt');
    }

    ;[results] = await queryInterface.sequelize.query(`SHOW COLUMNS FROM \`${table}\` LIKE 'updatedAt';`);
    exists = Array.isArray(results) && results.length > 0;
    if (exists) {
      await queryInterface.removeColumn(table, 'updatedAt');
    }
  }
};
