const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CategoriaHerramienta = sequelize.define('categorias_herramienta', {
    id_categoria_herr: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(80), // Según la BD real
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.STRING(255) // Según la BD real
    }
  }, {
    timestamps: false // No tiene createdAt ni updatedAt
  });

  CategoriaHerramienta.associate = models => {
    // Usar los nombres tal como se registran en el índice de modelos
    if (models.herramientas) {
      CategoriaHerramienta.hasMany(models.herramientas, { foreignKey: 'id_categoria_herr' });
    }
  };

  return CategoriaHerramienta;
};