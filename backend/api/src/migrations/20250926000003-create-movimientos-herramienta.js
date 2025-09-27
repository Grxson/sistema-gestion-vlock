'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('movimientos_herramienta', {
      id_movimiento: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_herramienta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'herramientas',
          key: 'id_herramienta'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tipo_movimiento: {
        type: Sequelize.ENUM('Entrada', 'Salida', 'Baja'),
        allowNull: false
      },
      cantidad: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      fecha: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      id_proyecto: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'proyectos',
          key: 'id_proyecto'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      motivo: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('movimientos_herramienta');
  }
};