const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdeudoEmpleado = sequelize.define('Adeudo_empleado', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    empleado_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleados',
        key: 'id_empleado'
      }
    },
    concepto: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Concepto del adeudo (ej: Pago parcial de nómina)'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del adeudo'
    },
    monto_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto total del adeudo'
    },
    monto_pendiente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto que aún se debe'
    },
    fecha_creacion: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se creó el adeudo'
    },
    fecha_vencimiento: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha de vencimiento del adeudo'
    },
    tipo_adeudo: {
      type: DataTypes.ENUM('prestamo', 'anticipo', 'descuento', 'multa', 'otros'),
      allowNull: false,
      defaultValue: 'prestamo'
    },
    estado: {
      type: DataTypes.ENUM('pendiente', 'en_proceso', 'liquidado', 'cancelado'),
      allowNull: false,
      defaultValue: 'pendiente'
    },
    numero_cuotas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'Número total de cuotas para pagos a plazos'
    },
    cuotas_pagadas: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
      comment: 'Número de cuotas pagadas'
    },
    monto_cuota: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Monto de cada cuota'
    },
    tasa_interes: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      defaultValue: 0.00,
      comment: 'Tasa de interés aplicada'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales sobre el adeudo'
    },
    autorizado_por: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID del usuario que autorizó el adeudo'
    },
    fecha_autorizacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de autorización del adeudo'
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
      comment: 'Indica si el adeudo está activo'
    }
  }, {
    tableName: 'adeudos_empleados',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: (adeudo) => {
        // Solo calcular monto_pendiente si no está establecido explícitamente
        if (adeudo.monto_pendiente === null || adeudo.monto_pendiente === undefined) {
          // Para el sistema de nóminas, inicialmente el monto pendiente es igual al total
          adeudo.monto_pendiente = parseFloat(adeudo.monto_total || 0);
        }
        
        // Establecer valores por defecto si no están definidos
        if (!adeudo.estado || adeudo.estado === null || adeudo.estado === undefined) {
          adeudo.estado = 'pendiente';
        }
        
        if (!adeudo.tipo_adeudo || adeudo.tipo_adeudo === null || adeudo.tipo_adeudo === undefined) {
          adeudo.tipo_adeudo = 'prestamo';
        }
        
        if (!adeudo.concepto || adeudo.concepto === null || adeudo.concepto === undefined) {
          adeudo.concepto = 'Pago parcial de nómina';
        }
      },
      beforeUpdate: (adeudo) => {
        // Actualizar estado basado en monto pendiente
        if (adeudo.monto_pendiente !== null && adeudo.monto_pendiente !== undefined) {
          if (adeudo.monto_pendiente <= 0) {
            adeudo.estado = 'liquidado';
          } else if (adeudo.cuotas_pagadas > 0) {
            adeudo.estado = 'en_proceso';
          } else {
            adeudo.estado = 'pendiente';
          }
        }
      }
    }
  });

  // Definir asociaciones
  AdeudoEmpleado.associate = (models) => {
    // Un adeudo pertenece a un empleado
    AdeudoEmpleado.belongsTo(models.Empleados, {
      foreignKey: 'empleado_id',
      as: 'empleado'
    });
  };

  return AdeudoEmpleado;
};
