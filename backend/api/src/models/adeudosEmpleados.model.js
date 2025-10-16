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
      comment: 'Monto total del adeudo'
    },
    monto_pagado: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00,
      comment: 'Monto pagado del adeudo'
    },
    monto_pendiente: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Monto que aún se debe'
    },
    fecha_adeudo: {
      type: DataTypes.DATE,
      allowNull: false,
      comment: 'Fecha en que se creó el adeudo'
    },
    fecha_liquidacion: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fecha de liquidación del adeudo'
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
        // Solo calcular monto_pendiente si no está establecido explícitamente
        if (adeudo.monto_pendiente === null || adeudo.monto_pendiente === undefined) {
          // Para el sistema de nóminas, inicialmente el monto pendiente es igual al total
          adeudo.monto_pendiente = parseFloat(adeudo.monto_adeudo || 0);
        }
        
        // Establecer valores por defecto si no están definidos
        if (!adeudo.estado || adeudo.estado === null || adeudo.estado === undefined) {
          adeudo.estado = 'Pendiente';
        }
        
        // Establecer fecha_adeudo si no está definida
        if (!adeudo.fecha_adeudo || adeudo.fecha_adeudo === null || adeudo.fecha_adeudo === undefined) {
          adeudo.fecha_adeudo = new Date();
        }
      },
      beforeUpdate: (adeudo) => {
        // Actualizar estado basado en monto pendiente
        if (adeudo.monto_pendiente !== null && adeudo.monto_pendiente !== undefined) {
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
    
    // Un adeudo puede pertenecer a una nómina
    AdeudoEmpleado.belongsTo(models.Nomina_empleado, {
      foreignKey: 'id_nomina',
      as: 'nomina'
    });
  };

  return AdeudoEmpleado;
};
