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
      type: DataTypes.ENUM('Entrada', 'Salida', 'Devolucion', 'Baja'),
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
    },
    razon_movimiento: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Razón específica: prestamo, perdida, dano, mantenimiento, transferencia, etc.'
    },
    detalle_adicional: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Información adicional detallada sobre el movimiento'
    },
    usuario_receptor: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Usuario que recibe la herramienta en caso de préstamo'
    },
    fecha_devolucion_esperada: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      comment: 'Fecha esperada de devolución para préstamos'
    },
    estado_movimiento: {
      type: DataTypes.ENUM('activo', 'completado', 'cancelado'),
      allowNull: false,
      defaultValue: 'activo',
      comment: 'Estado del movimiento'
    }
  }, {
    timestamps: false // No tiene createdAt ni updatedAt
  });

  MovimientoHerramienta.associate = models => {
    if (models.herramientas) {
      MovimientoHerramienta.belongsTo(models.herramientas, { foreignKey: 'id_herramienta' });
    }
    if (models.proyectos) {
      MovimientoHerramienta.belongsTo(models.proyectos, { foreignKey: 'id_proyecto' });
    }
    if (models.usuarios) {
      MovimientoHerramienta.belongsTo(models.usuarios, { foreignKey: 'id_usuario' });
    }
  };

  return MovimientoHerramienta;
};