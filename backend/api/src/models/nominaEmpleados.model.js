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
    pago_semanal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false,
      comment: 'Pago semanal del empleado'
    },
    horas_extra: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0
    },
    deducciones_isr: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de ISR (0 = no aplicado, >0 = monto aplicado)'
    },
    deducciones_imss: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de IMSS (0 = no aplicado, >0 = monto aplicado)'
    },
    deducciones_infonavit: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de Infonavit (0 = no aplicado, >0 = monto aplicado)'
    },
    deducciones_adicionales: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Otras deducciones'
    },
    descuentos: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Descuentos adicionales (adelantos, préstamos, etc.)'
    },
    bonos: {
      type: DataTypes.DECIMAL(10,2)
    },
    monto_total: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'En_Proceso', 'Aprobada', 'Pagado', 'Cancelada'),
      defaultValue: 'Pendiente'
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: 'Monto realmente pagado al empleado (puede ser menor al monto_total en caso de pago parcial)'
    },
    pago_parcial: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si es un pago parcial'
    },
    monto_a_pagar: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: 'Monto específico a pagar en caso de pago parcial'
    },
    liquidar_adeudos: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si se deben liquidar adeudos pendientes'
    },
    recibo_pdf: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'nomina_empleados',
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