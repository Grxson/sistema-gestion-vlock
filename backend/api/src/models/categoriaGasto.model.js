const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CategoriaGasto = sequelize.define('categorias_gasto', {
    id_categoria: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(80),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(255)
    }
  });
  CategoriaGasto.associate = models => {
    CategoriaGasto.hasMany(models.Gastos, {
      foreignKey: 'id_categoria',
      as: 'gastos'
    });
    CategoriaGasto.hasMany(models.Presupuestos, {
      foreignKey: 'id_categoria',
      as: 'presupuestos'
    });
  };
  return CategoriaGasto;
};