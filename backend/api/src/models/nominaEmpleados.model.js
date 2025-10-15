const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    deducciones_isr: {
      type: DataTypes.DECIMAL(10,2)
    },
    deducciones_imss: {
      type: DataTypes.DECIMAL(10,2)
    },
    deducciones_infonavit: {
      type: DataTypes.DECIMAL(10,2)
    },
    deducciones_adicionales: {
      type: DataTypes.DECIMAL(10,2)
    },
    aplicar_isr: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    aplicar_imss: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    aplicar_infonavit: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    bonos: {
      type: DataTypes.DECIMAL(10,2)
    },
    monto_total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'),
      defaultValue: 'Pendiente'
    },
    recibo_pdf: {
      type: DataTypes.STRING(255)
    }
  }, {
    timestamps: true
  });

  NominaEmpleado.associate = models => {
    NominaEmpleado.belongsTo(models.Empleados, { foreignKey: 'id_empleado', as: 'empleado' });
    NominaEmpleado.belongsTo(models.Semanas_nomina, { foreignKey: 'id_semana', as: 'semana' });
    NominaEmpleado.hasMany(models.Pagos_nomina, { foreignKey: 'id_nomina', as: 'pagos_nominas' });
    NominaEmpleado.belongsTo(models.Proyectos, { foreignKey: 'id_proyecto', as: 'proyecto' });
  };

  return NominaEmpleado;
};