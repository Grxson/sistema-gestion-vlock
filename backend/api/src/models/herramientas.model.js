const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Herramienta = sequelize.define('herramientas', {
    id_herramienta: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_categoria_herr: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    marca: {
      type: DataTypes.STRING(50)
    },
    serial: {
      type: DataTypes.STRING(100)
    },
    costo: {
      type: DataTypes.DECIMAL(10,2)
    },
    vida_util_meses: {
      type: DataTypes.INTEGER
    },
    stock_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    stock_disponible: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    stock_minimo: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    ubicacion: {
      type: DataTypes.STRING(100)
    }
  });

  Herramienta.associate = models => {
    Herramienta.belongsTo(models.CategoriaHerramienta, { foreignKey: 'id_categoria_herr' });
    Herramienta.hasMany(models.MovimientoHerramienta, { foreignKey: 'id_herramienta' });
  };

  return Herramienta;
};