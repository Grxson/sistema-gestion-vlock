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
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true // Según la BD real
    },
    tipo_movimiento: {
      type: DataTypes.ENUM('Entrada', 'Salida', 'Baja'),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fecha_movimiento: { // Nombre real en la BD
      type: DataTypes.DATE, // DATETIME en la BD real
      allowNull: false
    },
    id_usuario: {
      type: DataTypes.INTEGER,
      allowNull: true // Campo adicional en la BD real
    },
    notas: { // Nombre real en la BD en lugar de 'motivo'
      type: DataTypes.STRING(255) // VARCHAR(255) en la BD real
    }
  }, {
    timestamps: false // No tiene createdAt ni updatedAt
  });

  MovimientoHerramienta.associate = models => {
    MovimientoHerramienta.belongsTo(models.Herramientas, { foreignKey: 'id_herramienta' });
    MovimientoHerramienta.belongsTo(models.Proyectos, { foreignKey: 'id_proyecto' });
    MovimientoHerramienta.belongsTo(models.Usuarios, { foreignKey: 'id_usuario' });
  };

  return MovimientoHerramienta;
};