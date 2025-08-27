const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UnidadesMedida = sequelize.define('unidades_medida', {
    id_unidad: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    codigo: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 10]
      }
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 50]
      }
    },
    simbolo: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    es_decimal: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Indica si la unidad permite valores decimales'
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'unidades_medida',
    timestamps: true
  });

  UnidadesMedida.associate = function(models) {
    UnidadesMedida.hasMany(models.Suministros, {
      foreignKey: 'id_unidad_medida',
      as: 'suministros'
    });
  };

  return UnidadesMedida;
};
