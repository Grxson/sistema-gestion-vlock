export default (sequelize, DataTypes) => {
  const Oficio = sequelize.define('oficios', {
    id_oficio: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    descripcion: {
      type: DataTypes.TEXT
    }
  });

  Oficio.associate = models => {
    Oficio.hasMany(models.Empleado, { foreignKey: 'id_oficio' });
  };

  return Oficio;
};