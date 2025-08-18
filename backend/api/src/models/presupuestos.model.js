const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Presupuesto = sequelize.define('presupuestos', {
    id_presupuesto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monto_asignado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    porcentaje_alerta: {
      type: DataTypes.INTEGER,
      defaultValue: 90
    },
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  });

  Presupuesto.associate = models => {
    Presupuesto.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
    Presupuesto.belongsTo(models.CategoriaGasto, { foreignKey: 'id_categoria' });
  };

  return Presupuesto;
};