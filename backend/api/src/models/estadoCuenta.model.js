const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const EstadoCuenta = sequelize.define('estados_cuenta', {
    id_estado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER
    },
    periodo_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    periodo_fin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    ingresos_total: {
      type: DataTypes.DECIMAL(10,2)
    },
    gastos_total: {
      type: DataTypes.DECIMAL(10,2)
    },
    saldo: {
      type: DataTypes.DECIMAL(10,2)
    },
    utilidad_neta: {
      type: DataTypes.DECIMAL(10,2)
    }
  });

  EstadoCuenta.associate = models => {
    EstadoCuenta.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
  };

  return EstadoCuenta;
};