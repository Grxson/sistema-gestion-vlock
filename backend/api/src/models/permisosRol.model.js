export default (sequelize, DataTypes) => {
  const Permiso = sequelize.define('permisos', {
    id_permiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  });

  Permiso.associate = models => {
    Permiso.hasMany(models.AccionPermiso, { foreignKey: 'id_permiso' });
  };

  return Permiso;
};