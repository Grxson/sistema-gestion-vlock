const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Contrato = sequelize.define('contratos', {
    id_contrato: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tipo_contrato: {
      type: DataTypes.ENUM('Fijo', 'Temporal', 'Honorarios', 'Por_Proyecto'),
      allowNull: false
    },
    salario_diario: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    fecha_inicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    fecha_fin: {
      type: DataTypes.DATEONLY
    }
  }, {
    timestamps: false // Desactivamos createdAt y updatedAt
  });

  Contrato.associate = models => {
    // ❌ ELIMINADO: Contrato.hasMany(models.Empleados) - causaba circular reference
  };

  return Contrato;
};