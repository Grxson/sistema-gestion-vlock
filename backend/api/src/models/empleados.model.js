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
    fecha_alta: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_baja: {
      type: DataTypes.DATEONLY
    }
  }, {
    timestamps: false // Desactivamos createdAt y updatedAt
  });

  Empleado.associate = models => {
    Empleado.belongsTo(models.Contratos, { foreignKey: 'id_contrato', as: 'contrato' });
    Empleado.belongsTo(models.Oficios, { foreignKey: 'id_oficio', as: 'oficio' });
    Empleado.hasMany(models.NominaEmpleados, { foreignKey: 'id_empleado' });
  };

  return Empleado;
};