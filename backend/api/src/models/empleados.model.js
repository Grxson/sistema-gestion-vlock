export default (sequelize, DataTypes) => {
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
  });

  Empleado.associate = models => {
    Empleado.belongsTo(models.Contrato, { foreignKey: 'id_contrato' });
    Empleado.belongsTo(models.Oficio, { foreignKey: 'id_oficio' });
    Empleado.hasMany(models.NominaEmpleado, { foreignKey: 'id_empleado' });
  };

  return Empleado;
};