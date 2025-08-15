export default (sequelize, DataTypes) => {
  const PermisoRol = sequelize.define('permisos_rol', {
    id_permiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    permiso: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    puede_ver: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    puede_crear: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    puede_editar: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    puede_eliminar: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    indexes: [{
      unique: true,
      fields: ['id_rol', 'permiso']
    }]
  });

  PermisoRol.associate = models => {
    PermisoRol.belongsTo(models.Rol, {
      foreignKey: 'id_rol',
      as: 'rol'
    });
  };

  return PermisoRol;
};