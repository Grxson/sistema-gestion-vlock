export default (sequelize, DataTypes) => {
  const Usuario = sequelize.define('usuarios', {
    id_usuario: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre_usuario: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  });

  Usuario.associate = models => {
    Usuario.belongsTo(models.Rol, { foreignKey: 'id_rol' });
    Usuario.hasMany(models.Adjunto, { foreignKey: 'id_usuario' });
    Usuario.hasMany(models.ReporteGenerado, { foreignKey: 'id_usuario' });
    Usuario.hasMany(models.IntegracionLog, { foreignKey: 'id_usuario' });
    Usuario.hasMany(models.Auditoria, { foreignKey: 'id_usuario' });
  };

  return Usuario;
};