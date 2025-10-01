const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PermisosRol = sequelize.define('permisos_rol', {
    id_permiso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_rol: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_accion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    permitido: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  PermisosRol.associate = models => {
    if (models.Roles) {
      PermisosRol.belongsTo(models.Roles, {
        foreignKey: 'id_rol',
        as: 'rolePermisos'
      });
    }
    if (models.Acciones_permiso) {
      PermisosRol.belongsTo(models.Acciones_permiso, {
        foreignKey: 'id_accion',
        as: 'accion'
      });
    }
  };

  return PermisosRol;
};