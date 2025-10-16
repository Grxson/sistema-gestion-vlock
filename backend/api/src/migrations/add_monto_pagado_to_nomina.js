'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nomina_empleados', 'monto_pagado', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true,
      comment: 'Monto realmente pagado al empleado (puede ser menor al monto_total en caso de pago parcial)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('nomina_empleados', 'monto_pagado');
  }
};
