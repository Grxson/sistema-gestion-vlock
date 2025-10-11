'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('herramientas', 'stock_inicial', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Stock inicial de la herramienta al momento de registro'
    });

    // Actualizar el stock_inicial con el valor actual del stock para registros existentes
    await queryInterface.sequelize.query(`
      UPDATE herramientas 
      SET stock_inicial = stock 
      WHERE stock_inicial = 0;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('herramientas', 'stock_inicial');
  }
};
