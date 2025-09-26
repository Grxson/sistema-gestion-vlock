'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('catalogos_precios_detalle', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      catalogo_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'catalogos_precios',
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
        onDelete: 'CASCADE'
      },
      precio_unitario: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
      },
      factor_sobrecosto: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 1.0000
      },
      disponible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      orden: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
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

    // Índice único compuesto para evitar duplicados
    await queryInterface.addIndex('catalogos_precios_detalle', ['catalogo_id', 'concepto_id'], {
      unique: true,
      name: 'unique_catalogo_concepto'
    });

    // Índices para optimización
    await queryInterface.addIndex('catalogos_precios_detalle', ['catalogo_id']);
    await queryInterface.addIndex('catalogos_precios_detalle', ['concepto_id']);
    await queryInterface.addIndex('catalogos_precios_detalle', ['disponible']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('catalogos_precios_detalle');
  }
};
