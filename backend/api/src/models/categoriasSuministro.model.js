const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CategoriasSuministro = sequelize.define('categorias_suministro', {
    id_categoria: {
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
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    color: {
      type: DataTypes.STRING(7),
      defaultValue: '#3B82F6',
      validate: {
        is: /^#[0-9A-F]{6}$/i
      }
    },
    orden: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'categorias_suministro',
    timestamps: true
  });

  CategoriasSuministro.associate = function(models) {
    CategoriasSuministro.hasMany(models.Suministros, {
      foreignKey: 'id_categoria_suministro',
      as: 'suministros'
    });
  };

  return CategoriasSuministro;
};
