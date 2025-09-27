'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar stock_disponible y stock_minimo, renombrar stock_total a stock
    await queryInterface.removeColumn('herramientas', 'stock_disponible');
    await queryInterface.removeColumn('herramientas', 'stock_minimo');
    await queryInterface.renameColumn('herramientas', 'stock_total', 'stock');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar campos de stock
    await queryInterface.renameColumn('herramientas', 'stock', 'stock_total');
    await queryInterface.addColumn('herramientas', 'stock_disponible', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
    await queryInterface.addColumn('herramientas', 'stock_minimo', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    });
  }
};