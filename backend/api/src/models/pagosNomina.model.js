export default (sequelize, DataTypes) => {
  const PagoNomina = sequelize.define('pagos_nomina', {
    id_pago: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_nomina: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    metodo_pago: {
      type: DataTypes.ENUM('Efectivo', 'Transferencia'),
      allowNull: false
    },
    referencia: {
      type: DataTypes.STRING(100)
    }
  });

  PagoNomina.associate = models => {
    PagoNomina.belongsTo(models.NominaEmpleado, { foreignKey: 'id_nomina' });
  };

  return PagoNomina;
};