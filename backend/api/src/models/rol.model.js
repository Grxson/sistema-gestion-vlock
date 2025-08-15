export default (sequelize, DataTypes) => {
  const Rol = sequelize.define('roles', {
    id_rol: {
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
      type: DataTypes.STRING(255),
      allowNull: true
    }
  });

  Rol.associate = models => {
    Rol.hasMany(models.Usuario, {
      foreignKey: 'id_rol',
      as: 'usuarios'
    });
    
    Rol.hasMany(models.PermisoRol, {
      foreignKey: 'id_rol',
      as: 'permisos'
    });
  };

  return Rol;
};