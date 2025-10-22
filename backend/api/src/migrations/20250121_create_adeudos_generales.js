module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('adeudos_generales', {
      id_adeudo_general: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_entidad: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Nombre de la persona o empresa'
      },
      tipo_adeudo: {
        type: Sequelize.ENUM('nos_deben', 'debemos'),
        allowNull: false,
        comment: 'Tipo de adeudo: nos_deben o debemos'
      },
      monto: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        comment: 'Cantidad del adeudo'
      },
      estado: {
        type: Sequelize.ENUM('pendiente', 'pagado'),
        allowNull: false,
        defaultValue: 'pendiente',
        comment: 'Estado del adeudo'
      },
      fecha_registro: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Fecha de registro del adeudo'
      },
      fecha_pago: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fecha en que se liquidó el adeudo'
      },
      notas: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comentarios o notas adicionales'
      },
      id_usuario_registro: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'id_usuario'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuario que registró el adeudo'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para mejorar el rendimiento
    await queryInterface.addIndex('adeudos_generales', ['tipo_adeudo']);
    await queryInterface.addIndex('adeudos_generales', ['estado']);
    await queryInterface.addIndex('adeudos_generales', ['fecha_registro']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('adeudos_generales');
  }
};
