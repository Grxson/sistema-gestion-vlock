const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdeudoGeneral = sequelize.define('Adeudo_general', {
    id_adeudo_general: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_entidad: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre de la persona o empresa'
    },
    tipo_adeudo: {
      type: DataTypes.ENUM('nos_deben', 'debemos'),
      allowNull: false,
      comment: 'Tipo de adeudo: nos_deben (dinero que nos deben) o debemos (dinero que debemos)'
    },
    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      comment: 'Cantidad del adeudo'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'pagado'),
      allowNull: false,
      defaultValue: 'pendiente',
      comment: 'Estado del adeudo'
    },
    fecha_registro: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha de registro del adeudo'
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se liquidó el adeudo'
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Comentarios o notas adicionales'
    },
    id_usuario_registro: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id_usuario'
      },
      comment: 'Usuario que registró el adeudo'
    }
  }, {
    tableName: 'adeudos_generales',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  // Definir asociaciones
  AdeudoGeneral.associate = (models) => {
    // Un adeudo general pertenece a un usuario (quien lo registró)
    AdeudoGeneral.belongsTo(models.Usuarios, {
      foreignKey: 'id_usuario_registro',
      as: 'usuario_registro'
    });
  };

  return AdeudoGeneral;
};
