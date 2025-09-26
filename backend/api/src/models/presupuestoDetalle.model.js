const { DataTypes, Model } = require('sequelize');

module.exports = (sequelize) => {
  class PresupuestoDetalle extends Model {
    static associate(models) {
      // Relación con Presupuesto
      PresupuestoDetalle.belongsTo(models.Presupuesto, {
        foreignKey: 'id_presupuesto',
        as: 'presupuesto'
      });
    }
  }

  PresupuestoDetalle.init({
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_presupuesto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_concepto: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    numero_partida: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    codigo_partida: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    descripcion_personalizada: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    unidad: {
      type: DataTypes.STRING(20),
      allowNull: false
    },
    cantidad: {
      type: DataTypes.DECIMAL(12, 4),
      allowNull: false
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false
    },
    factor_rendimiento: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      defaultValue: 1.0000
    },
    importe_subtotal: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false
    },
    descuento_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    importe_descuento: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      defaultValue: 0.0000
    },
    importe_neto: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false
    },
    notas: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    incluir_en_cotizacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    es_opcional: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    grupo_partida: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    orden_visualizacion: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    estado_partida: {
      type: DataTypes.ENUM('activa', 'pausada', 'completada', 'cancelada'),
      allowNull: false,
      defaultValue: 'activa'
    },
    metadatos: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'PresupuestoDetalle',
    tableName: 'presupuestos_detalle',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  });

  return PresupuestoDetalle;
};
