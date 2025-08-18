const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const NominaHistorial = sequelize.define('nomina_historial', {
    id_historial: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_nomina: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_cambio: {
      type: DataTypes.ENUM('creacion', 'actualizacion', 'cambio_estado', 'pago'),
      allowNull: false
    },
    estado_anterior: {
      type: DataTypes.STRING(20)
    },
    estado_nuevo: {
      type: DataTypes.STRING(20)
    },
    detalles: {
      type: DataTypes.JSON
    },
    fecha_cambio: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  NominaHistorial.associate = models => {
    NominaHistorial.belongsTo(models.Nomina_empleado, { foreignKey: 'id_nomina', as: 'nomina' });
    NominaHistorial.belongsTo(models.Usuarios, { foreignKey: 'id_usuario', as: 'usuario' });
  };

  return NominaHistorial;
};
