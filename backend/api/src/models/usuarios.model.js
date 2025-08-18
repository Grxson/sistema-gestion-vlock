const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
  }, {
    // Opciones del modelo
    timestamps: true, // Crear created_at y updated_at
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  Usuario.associate = models => {
    if (models.Roles) {
      Usuario.belongsTo(models.Roles, {
        foreignKey: 'id_rol',
        as: 'rol'
      });
    }
    if (models.Adjuntos) {
      Usuario.hasMany(models.Adjuntos, { foreignKey: 'id_usuario' });
    }
    if (models.Reportes_generados) {
      Usuario.hasMany(models.Reportes_generados, { foreignKey: 'id_usuario' });
    }
    if (models.IntegracionLog) {
      Usuario.hasMany(models.IntegracionLog, { foreignKey: 'id_usuario' });
    }
    if (models.Auditoria) {
      Usuario.hasMany(models.Auditoria, { foreignKey: 'id_usuario' });
    }
  };

  return Usuario;
};