export default (sequelize, DataTypes) => {
  const Gasto = sequelize.define('gastos', {
    id_gasto: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_proyecto: { 
        type: DataTypes.INTEGER 
    },
    id_categoria: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    proveedor: { 
        type: DataTypes.STRING(120), 
        allowNull: false 
    },
    descripcion: {
         type: DataTypes.STRING(255) 
        },
    fecha: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    monto: { 
        type: DataTypes.DECIMAL(12,2), 
        allowNull: false 
    },
    tiene_recibo: {
         type: DataTypes.BOOLEAN, 
         allowNull: false, 
         defaultValue: false
         }
  });
  Gasto.associate = models => {
    Gasto.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
    Gasto.belongsTo(models.CategoriaGasto, { foreignKey: 'id_categoria' });
  };
  return Gasto;
};