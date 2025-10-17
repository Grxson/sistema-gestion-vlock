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
    es_pago_semanal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      comment: 'Indica si el empleado tiene pago semanal'
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
    version: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    creada_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    revisada_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pagada_por: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    fecha_revision: {
      type: DataTypes.DATE,
      allowNull: true
    },
    fecha_pago: {
      type: DataTypes.DATE,
      allowNull: true
    },
    motivo_ultimo_cambio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    archivo_pdf_path: {
      type: DataTypes.STRING(500),
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