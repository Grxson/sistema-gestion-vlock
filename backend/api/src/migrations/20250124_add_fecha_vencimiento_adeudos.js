'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('adeudos_generales', 'fecha_vencimiento', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Fecha de vencimiento del adeudo para alertas'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('adeudos_generales', 'fecha_vencimiento');
  }
};
