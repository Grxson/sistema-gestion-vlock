'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('presupuestos', {
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
      proyecto_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'proyectos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      cliente: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      ubicacion: {
        type: Sequelize.STRING(300),
        allowNull: true
      },
      fecha_elaboracion: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      fecha_vigencia: {
        type: Sequelize.DATE,
        allowNull: true
      },
      moneda: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'GTQ'
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      impuestos: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      margen_utilidad: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 15.00
      },
      estado: {
        type: Sequelize.ENUM('BORRADOR', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'VIGENTE', 'VENCIDO'),
        allowNull: false,
        defaultValue: 'BORRADOR'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      presupuesto_padre_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'presupuestos',
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
      usuario_aprueba: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fecha_aprobacion: {
        type: Sequelize.DATE,
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
    await queryInterface.addIndex('presupuestos', ['codigo']);
    await queryInterface.addIndex('presupuestos', ['proyecto_id']);
    await queryInterface.addIndex('presupuestos', ['estado']);
    await queryInterface.addIndex('presupuestos', ['fecha_elaboracion']);
    await queryInterface.addIndex('presupuestos', ['usuario_elabora']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('presupuestos');
  }
};
