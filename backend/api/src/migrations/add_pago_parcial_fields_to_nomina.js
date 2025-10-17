'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nomina_empleados', 'pago_parcial', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si es un pago parcial'
    });

    await queryInterface.addColumn('nomina_empleados', 'monto_a_pagar', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true,
      comment: 'Monto específico a pagar en caso de pago parcial'
    });

    await queryInterface.addColumn('nomina_empleados', 'liquidar_adeudos', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si se deben liquidar adeudos pendientes'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('nomina_empleados', 'pago_parcial');
    await queryInterface.removeColumn('nomina_empleados', 'monto_a_pagar');
    await queryInterface.removeColumn('nomina_empleados', 'liquidar_adeudos');
  }
};
