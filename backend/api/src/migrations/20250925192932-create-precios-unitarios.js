'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('precios_unitarios', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      precio: {
        type: Sequelize.DECIMAL(15, 4),
        allowNull: false
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      fecha_vigencia_inicio: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fecha_vigencia_fin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      proveedor_referencia: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      factor_sobrecosto: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 1.0000
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
    await queryInterface.addIndex('precios_unitarios', ['concepto_id']);
    await queryInterface.addIndex('precios_unitarios', ['region']);
    await queryInterface.addIndex('precios_unitarios', ['fecha_vigencia_inicio']);
    await queryInterface.addIndex('precios_unitarios', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('precios_unitarios');
  }
};
