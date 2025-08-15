export default (sequelize, DataTypes) => {
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
    CategoriaGasto.hasMany(models.Gasto, { foreignKey: 'id_categoria' });
    CategoriaGasto.hasMany(models.Presupuesto, { foreignKey: 'id_categoria' });
  };
  return CategoriaGasto;
};