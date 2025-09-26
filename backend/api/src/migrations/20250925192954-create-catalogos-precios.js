'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('catalogos_precios', {
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
      nombre: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      descripcion: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tipo: {
        type: Sequelize.ENUM('GENERAL', 'ESPECIALIZADO', 'REGIONAL', 'TEMPORAL'),
        allowNull: false,
        defaultValue: 'GENERAL'
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
      moneda_base: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
      },
      factor_actualizacion: {
        type: Sequelize.DECIMAL(5, 4),
        allowNull: false,
        defaultValue: 1.0000
      },
      activo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      catalogo_padre_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'catalogos_precios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      usuario_elabora: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
    await queryInterface.addIndex('catalogos_precios', ['codigo']);
    await queryInterface.addIndex('catalogos_precios', ['tipo']);
    await queryInterface.addIndex('catalogos_precios', ['region']);
    await queryInterface.addIndex('catalogos_precios', ['activo']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('catalogos_precios');
  }
};
