const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AccionesPermiso = sequelize.define('acciones_permiso', {
    id_accion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    codigo: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    modulo: {
      type: DataTypes.STRING(30),
      allowNull: false
    }
  }, {
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  AccionesPermiso.associate = models => {
    AccionesPermiso.hasMany(models.PermisosRol, {
      foreignKey: 'id_accion',
      as: 'permisos'
    });
  };

  return AccionesPermiso;
};