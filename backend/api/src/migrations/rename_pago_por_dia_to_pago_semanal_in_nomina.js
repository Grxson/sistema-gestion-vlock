'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Renombrar la columna pago_por_dia a pago_semanal en la tabla nomina_empleados
    await queryInterface.renameColumn('nomina_empleados', 'pago_por_dia', 'pago_semanal');
  },

  down: async (queryInterface, Sequelize) => {
    // Revertir el cambio: renombrar pago_semanal de vuelta a pago_por_dia
    await queryInterface.renameColumn('nomina_empleados', 'pago_semanal', 'pago_por_dia');
  }
};
