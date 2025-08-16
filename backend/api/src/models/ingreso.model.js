export default (sequelize, DataTypes) => {
  const Ingreso = sequelize.define('ingresos', {
    id_ingreso: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT
    },
    fuente: {
      type: DataTypes.STRING(100)
    }
  });

  Ingreso.associate = models => {
    Ingreso.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
  };

  return Ingreso;
};