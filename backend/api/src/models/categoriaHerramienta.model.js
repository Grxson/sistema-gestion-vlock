const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CategoriaHerramienta = sequelize.define('categorias_herramienta', {
    id_categoria_herr: {
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
  });

  CategoriaHerramienta.associate = models => {
    CategoriaHerramienta.hasMany(models.Herramienta, { foreignKey: 'id_categoria_herr' });
  };

  return CategoriaHerramienta;
};