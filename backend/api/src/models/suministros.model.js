const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Suministro = sequelize.define('suministros', {
    id_suministro: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proyectos',
        key: 'id_proyecto'
      }
    },
    id_proveedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'id_proveedor'
      },
      comment: 'ID del proveedor (relación con tabla proveedores)'
    },
    folio: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Folio del suministro que aparece en el recibo'
    },
    metodo_pago: {
      type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta', 'Cuenta Fiscal'),
      defaultValue: 'Efectivo',
      comment: 'Método de pago utilizado'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    id_categoria_suministro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias_suministro',
        key: 'id_categoria'
      },
      comment: 'ID de la categoría del suministro (FK a categorias_suministro)'
    },
    nombre: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nombre del suministro'
    },
    codigo_producto: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'SKU o código interno del producto'
    },
    descripcion_detallada: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del suministro'
    },
    cantidad: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0,
      comment: 'Cantidad del suministro'
    },
    id_unidad_medida: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      references: {
        model: 'unidades_medida',
        key: 'id_unidad'
      },
      comment: 'ID de la unidad de medida desde la tabla unidades_medida'
    },
    
    // Campos financieros
    precio_unitario: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Precio por unidad de medida'
    },
    subtotal: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Subtotal del suministro (antes de IVA)'
    },
    costo_total: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Costo total del suministro'
    },
    include_iva: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Indica si el costo_total incluye IVA'
    },
    
    // Campos adicionales
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales del suministro'
    },
    observaciones_finales: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones finales después de la entrega'
    },
    estado: {
      type: DataTypes.ENUM('Solicitado', 'Aprobado', 'Pedido', 'En_Transito', 'Entregado', 'Cancelado'),
      defaultValue: 'Solicitado'
    }
  }, {
    timestamps: true,
    tableName: 'suministros',
    indexes: [
      {
        fields: ['id_proyecto']
      },
      {
        fields: ['id_proveedor']
      },
      {
        fields: ['fecha']
      },
      {
        fields: ['id_categoria_suministro']
      },
      {
        fields: ['folio']
      }
    ]
  });

  Suministro.associate = models => {
    Suministro.belongsTo(models.Proyectos, { 
      foreignKey: 'id_proyecto',
      as: 'proyecto'
    });
    
    // Relación con proveedores
    Suministro.belongsTo(models.Proveedores, {
      foreignKey: 'id_proveedor',
      as: 'proveedor'
    });

    // Relación con categorías de suministro
    Suministro.belongsTo(models.Categorias_suministro, {
      foreignKey: 'id_categoria_suministro',
      as: 'categoria'
    });

    // Relación con unidades de medida
    Suministro.belongsTo(models.Unidades_medida, {
      foreignKey: 'id_unidad_medida',
      as: 'unidadMedida'
    });
  };

  return Suministro;
};
