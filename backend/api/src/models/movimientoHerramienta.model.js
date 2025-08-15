export default (sequelize, DataTypes) => {
  const MovimientoHerramienta = sequelize.define('movimientos_herramienta', {
    id_movimiento: { 
        type: DataTypes.INTEGER, 
        primaryKey: true, 
        autoIncrement: true 
    },
    id_herramienta: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    tipo_movimiento: { 
        type: DataTypes.ENUM('Entrada','Salida','Baja'), 
        allowNull: false 
    },
    cantidad: { 
        type: DataTypes.INTEGER, 
        allowNull: false 
    },
    fecha: {
        type: DataTypes.DATE, 
        allowNull: false, 
        defaultValue: DataTypes.NOW 
    },
    id_proyecto: {
        type: DataTypes.INTEGER 
    },
    id_empleado_responsable: { 
        type: DataTypes.INTEGER 
    },
    motivo: { 
        type: DataTypes.STRING(255) 
    }
  });
  MovimientoHerramienta.associate = models => {
    MovimientoHerramienta.belongsTo(models.Herramienta, { foreignKey: 'id_herramienta' });
    MovimientoHerramienta.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
    MovimientoHerramienta.belongsTo(models.Empleado, { foreignKey: 'id_empleado_responsable' });
  };
  return MovimientoHerramienta;
};