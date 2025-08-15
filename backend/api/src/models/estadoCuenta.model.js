export default (sequelize, DataTypes) => {
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
        type: DataTypes.DATE, 
        allowNull: false
    },
    periodo_fin: { 
        type: DataTypes.DATE, 
        allowNull: false 
    },
    ingresos_total: { 
        type: DataTypes.DECIMAL(12,2), 
        allowNull: false 
    },
    gastos_total: {
        type: DataTypes.DECIMAL(12,2), 
        allowNull: false 
    },
    saldo: { 
        type: DataTypes.DECIMAL(12,2), 
        allowNull: false 
    },
    utilidad_neta: { 
        type: DataTypes.DECIMAL(12,2), 
        allowNull: false 
    }
  });
  EstadoCuenta.associate = models => {
    EstadoCuenta.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
  };
  return EstadoCuenta;
};