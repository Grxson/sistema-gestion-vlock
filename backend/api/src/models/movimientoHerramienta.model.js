const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MovimientoHerramienta = sequelize.define('movimientos_herramienta', {
    id_movimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_herramienta: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    tipo_movimiento: {
      type: DataTypes.ENUM('Entrada', 'Salida', 'Baja'),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    motivo: {
      type: DataTypes.TEXT
    }
  });

  MovimientoHerramienta.associate = models => {
    MovimientoHerramienta.belongsTo(models.Herramienta, { foreignKey: 'id_herramienta' });
    MovimientoHerramienta.belongsTo(models.Proyecto, { foreignKey: 'id_proyecto' });
  };

  return MovimientoHerramienta;
};