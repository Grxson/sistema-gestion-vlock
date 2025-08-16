export default (sequelize, DataTypes) => {
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
      type: DataTypes.ENUM('LOGIN', 'INSERT', 'UPDATE', 'DELETE'),
      allowNull: false
    },
    tabla: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    id_registro: {
      type: DataTypes.INTEGER
    },
    fecha_hora: {
      type: DataTypes.DATE,
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(45)
    },
    datos_antes: {
      type: DataTypes.JSON
    },
    datos_despues: {
      type: DataTypes.JSON
    }
  });

  Auditoria.associate = models => {
    Auditoria.belongsTo(models.Usuario, { foreignKey: 'id_usuario' });
  };

  return Auditoria;
};