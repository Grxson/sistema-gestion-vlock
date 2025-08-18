const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      type: DataTypes.TEXT
    }
  }, {
    // Opciones del modelo
    timestamps: true, // Crear created_at y updated_at
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Rol.associate = models => {
    // Verificamos si los modelos existen antes de establecer asociaciones
    if (models.Usuarios) {
      Rol.hasMany(models.Usuarios, {
        foreignKey: 'id_rol',
        as: 'usuarios'
      });
    }

    if (models.Permisos_rol) {
      Rol.hasMany(models.Permisos_rol, {
        foreignKey: 'id_rol',
        as: 'permisos'
      });
    }
  };

  return Rol;
};