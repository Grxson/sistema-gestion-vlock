const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Empleado = sequelize.define('empleados', {
    id_empleado: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    nss: {
      type: DataTypes.STRING(20)
    },
    rfc: {
      type: DataTypes.STRING(13),
      allowNull: true,
      validate: {
        len: [10, 13] // RFC puede ser de 10 o 13 caracteres
      }
    },
    telefono: {
      type: DataTypes.STRING(20)
    },
    contacto_emergencia: {
      type: DataTypes.STRING(100)
    },
    telefono_emergencia: {
      type: DataTypes.STRING(20)
    },
    banco: {
      type: DataTypes.STRING(50)
    },
    cuenta_bancaria: {
      type: DataTypes.STRING(50)
    },
    id_contrato: {
      type: DataTypes.INTEGER
    },
    id_oficio: {
      type: DataTypes.INTEGER
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proyectos',
        key: 'id_proyecto'
      }
    },
    pago_diario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    fecha_alta: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    fecha_baja: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    timestamps: false // Desactivamos createdAt y updatedAt
  });

  Empleado.associate = models => {
    Empleado.belongsTo(models.Contratos, { foreignKey: 'id_contrato', as: 'contrato' });
    Empleado.belongsTo(models.Oficios, { foreignKey: 'id_oficio', as: 'oficio' });
    Empleado.belongsTo(models.Proyectos, { foreignKey: 'id_proyecto', as: 'proyecto' });
    Empleado.hasMany(models.NominaEmpleados, { foreignKey: 'id_empleado' });
  };

  return Empleado;
};