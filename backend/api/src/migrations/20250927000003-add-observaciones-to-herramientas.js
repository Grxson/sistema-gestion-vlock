'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('herramientas', 'observaciones', {
      type: Sequelize.TEXT,
      allowNull: true,
      after: 'ubicacion'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('herramientas', 'observaciones');
  }
};