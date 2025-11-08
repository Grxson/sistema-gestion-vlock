const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
  }, {
    timestamps: false // Desactivamos createdAt y updatedAt
  });

  Oficio.associate = models => {
    // ❌ ELIMINADO: Oficio.hasMany(models.Empleados) - causaba circular reference
  };

  return Oficio;
};