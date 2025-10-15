const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const AdeudoEmpleado = sequelize.define('Adeudo_empleado', {
    id_adeudo: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_empleado: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empleados',
        key: 'id_empleado'
      }
    },
    id_nomina: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'nomina_empleados',
        key: 'id_nomina'
      }
    },
    monto_adeudo: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto que se debe al empleado'
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Monto que se pagó parcialmente'
    },
    monto_pendiente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto que aún se debe (monto_adeudo - monto_pagado)'
    },
    fecha_adeudo: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha en que se generó el adeudo'
    },
    fecha_liquidacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha en que se liquidó completamente el adeudo'
    },
    estado: {
      type: DataTypes.ENUM('Pendiente', 'Parcial', 'Liquidado'),
      allowNull: false,
      defaultValue: 'Pendiente'
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionales sobre el adeudo'
    }
  }, {
    tableName: 'adeudos_empleados',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    hooks: {
      beforeCreate: (adeudo) => {
        // Solo calcular si no está establecido explícitamente
        if (adeudo.monto_pendiente === null || adeudo.monto_pendiente === undefined) {
          adeudo.monto_pendiente = parseFloat(adeudo.monto_adeudo) - parseFloat(adeudo.monto_pagado || 0);
        }
        
        // Solo determinar estado si no está establecido explícitamente
        if (!adeudo.estado || adeudo.estado === null || adeudo.estado === undefined) {
          if (adeudo.monto_pendiente <= 0) {
            adeudo.estado = 'Liquidado';
            adeudo.fecha_liquidacion = new Date();
          } else if (adeudo.monto_pagado > 0) {
            adeudo.estado = 'Parcial';
          } else {
            adeudo.estado = 'Pendiente';
          }
        }
      },
      beforeUpdate: (adeudo) => {
        // Solo recalcular si no está establecido explícitamente
        if (adeudo.monto_pendiente === null || adeudo.monto_pendiente === undefined) {
          adeudo.monto_pendiente = parseFloat(adeudo.monto_adeudo) - parseFloat(adeudo.monto_pagado || 0);
        }
        
        // Solo actualizar estado si no está establecido explícitamente
        if (!adeudo.estado || adeudo.estado === null || adeudo.estado === undefined) {
          if (adeudo.monto_pendiente <= 0) {
            adeudo.estado = 'Liquidado';
            adeudo.fecha_liquidacion = new Date();
          } else if (adeudo.monto_pagado > 0) {
            adeudo.estado = 'Parcial';
          } else {
            adeudo.estado = 'Pendiente';
          }
        }
      }
    }
  });

  // Definir asociaciones
  AdeudoEmpleado.associate = (models) => {
    // Un adeudo pertenece a un empleado
    AdeudoEmpleado.belongsTo(models.Empleados, {
      foreignKey: 'id_empleado',
      as: 'empleado'
    });

    // Un adeudo puede estar relacionado con una nómina
    AdeudoEmpleado.belongsTo(models.Nomina_empleado, {
      foreignKey: 'id_nomina',
      as: 'nomina'
    });
  };

  return AdeudoEmpleado;
};
