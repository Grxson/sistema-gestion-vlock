export default (sequelize, DataTypes) => {
  const NominaEmpleado = sequelize.define('nomina_empleado', {
    id_nomina: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_semana: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    dias_laborados: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pago_por_dia: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    horas_extra: {
      type: DataTypes.DECIMAL(10,2)
    },
    deducciones: {
      type: DataTypes.DECIMAL(10,2)
    },
    bonos: {
      type: DataTypes.DECIMAL(10,2)
    },
    monto_total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Pagado'),
      defaultValue: 'Pendiente'
    },
    recibo_pdf: {
      type: DataTypes.STRING(255)
    }
  });

  NominaEmpleado.associate = models => {
    NominaEmpleado.belongsTo(models.Empleado, { foreignKey: 'id_empleado' });
    NominaEmpleado.belongsTo(models.SemanaNomina, { foreignKey: 'id_semana' });
    NominaEmpleado.hasMany(models.PagoNomina, { foreignKey: 'id_nomina' });
  };

  return NominaEmpleado;
};