const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Auditoria = sequelize.define('auditoria', {
    id_auditoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    accion: {
      type: DataTypes.ENUM('LOGIN', 'LOGOUT', 'CREATE', 'READ', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    tabla: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.STRING(255)
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(45)
    },
    datos_antiguos: {
      type: DataTypes.JSON
    },
    datos_nuevos: {
      type: DataTypes.JSON
    }
  }, {
    timestamps: false
  });

  Auditoria.associate = models => {
    if (models.Usuarios) {
      Auditoria.belongsTo(models.Usuarios, {
        foreignKey: 'id_usuario',
        as: 'usuario'
      });
    }
  };

  return Auditoria;
};