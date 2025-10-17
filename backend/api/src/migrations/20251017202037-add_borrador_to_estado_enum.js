'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar 'Borrador' al ENUM de la columna estado
    await queryInterface.changeColumn('nomina_empleados', 'estado', {
      type: Sequelize.ENUM('Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada', 'Borrador'),
      allowNull: false,
      defaultValue: 'Pendiente'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover 'Borrador' del ENUM de la columna estado
    await queryInterface.changeColumn('nomina_empleados', 'estado', {
      type: Sequelize.ENUM('Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'),
      allowNull: false,
      defaultValue: 'Pendiente'
    });
  }
};
