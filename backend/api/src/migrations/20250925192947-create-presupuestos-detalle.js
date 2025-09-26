'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presupuestos_detalle', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      presupuesto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'presupuestos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      concepto_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'conceptos_obra',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      precio_unitario_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'precios_unitarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cantidad: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      factor_desperdicio: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 1.0000
      },
      descuento_porcentaje: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      agrupacion: {
        type: Sequelize.STRING(100),
        allowNull: true
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
    await queryInterface.addIndex('presupuestos_detalle', ['presupuesto_id']);
    await queryInterface.addIndex('presupuestos_detalle', ['concepto_id']);
    await queryInterface.addIndex('presupuestos_detalle', ['agrupacion']);
    await queryInterface.addIndex('presupuestos_detalle', ['orden']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presupuestos_detalle');
  }
};
