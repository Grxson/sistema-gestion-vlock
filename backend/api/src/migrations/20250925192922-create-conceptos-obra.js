'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('conceptos_obra', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      codigo: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      unidad: {
        type: Sequelize.STRING(10),
        allowNull: false
      },
      categoria: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('MATERIAL', 'MANO_OBRA', 'EQUIPO', 'SUBCONTRATO', 'OTROS'),
        allowNull: false,
        defaultValue: 'MATERIAL'
      },
      precio_base: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: true,
        defaultValue: 0
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      observaciones: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Índices para optimización
    await queryInterface.addIndex('conceptos_obra', ['codigo']);
    await queryInterface.addIndex('conceptos_obra', ['categoria']);
    await queryInterface.addIndex('conceptos_obra', ['tipo']);
    await queryInterface.addIndex('conceptos_obra', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('conceptos_obra');
  }
};
