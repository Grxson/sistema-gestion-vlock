'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('herramientas', {
      id_herramienta: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      id_categoria_herr: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categorias_herramienta',
          key: 'id_categoria_herr'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      nombre: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      marca: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      serial: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      costo: {
        type: Sequelize.DECIMAL(10,2),
        allowNull: true
      },
      vida_util_meses: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      stock_total: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      stock_disponible: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      stock_minimo: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      ubicacion: {
        type: Sequelize.STRING(100),
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
    await queryInterface.dropTable('herramientas');
  }
};