const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UnidadesMedida = sequelize.define('unidades_medida', {
    id_unidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    simbolo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 10]
      }
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    tableName: 'unidades_medida',
    timestamps: true,
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  });

  UnidadesMedida.associate = function(models) {
    // Relación con suministros
    UnidadesMedida.hasMany(models.Suministros, {
      foreignKey: 'id_unidad_medida',
      as: 'suministros'
    });
  };

  return UnidadesMedida;
};
