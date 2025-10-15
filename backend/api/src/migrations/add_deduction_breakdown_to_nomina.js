'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('nomina_empleados', 'deducciones_isr', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });

    await queryInterface.addColumn('nomina_empleados', 'deducciones_imss', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });

    await queryInterface.addColumn('nomina_empleados', 'deducciones_infonavit', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });

    await queryInterface.addColumn('nomina_empleados', 'deducciones_adicionales', {
      type: Sequelize.DECIMAL(10,2),
      allowNull: true
    });

    await queryInterface.addColumn('nomina_empleados', 'aplicar_isr', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.addColumn('nomina_empleados', 'aplicar_imss', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    await queryInterface.addColumn('nomina_empleados', 'aplicar_infonavit', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('nomina_empleados', 'deducciones_isr');
    await queryInterface.removeColumn('nomina_empleados', 'deducciones_imss');
    await queryInterface.removeColumn('nomina_empleados', 'deducciones_infonavit');
    await queryInterface.removeColumn('nomina_empleados', 'deducciones_adicionales');
    await queryInterface.removeColumn('nomina_empleados', 'aplicar_isr');
    await queryInterface.removeColumn('nomina_empleados', 'aplicar_imss');
    await queryInterface.removeColumn('nomina_empleados', 'aplicar_infonavit');
  }
};
