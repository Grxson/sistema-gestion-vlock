const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class Presupuesto extends Model {
    static associate(models) {
      // Relación con PresupuestoDetalle
      Presupuesto.hasMany(models.PresupuestoDetalle, {
        foreignKey: 'id_presupuesto',
        as: 'detalles'
      });
    }
  }

  Presupuesto.init({
    id_presupuesto: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_categoria: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    mes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Presupuesto',
    tableName: 'presupuestos',
    timestamps: false
  });

  return Presupuesto;
};
