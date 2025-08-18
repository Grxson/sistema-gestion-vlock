const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
      type: DataTypes.STRING(100)
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    fecha: { 
      type: DataTypes.DATEONLY, 
      allowNull: false 
    },
    monto: { 
      type: DataTypes.DECIMAL(10,2), 
      allowNull: false 
    },
    tiene_recibo: {
      type: DataTypes.BOOLEAN, 
      defaultValue: false
    }
  });

  Gasto.associate = models => {
    Gasto.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
    Gasto.belongsTo(models.CategoriaGasto, { foreignKey: 'id_categoria' });
  };

  return Gasto;
};