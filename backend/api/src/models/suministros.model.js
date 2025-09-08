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
      type: DataTypes.ENUM('Efectivo', 'Transferencia', 'Cheque', 'Tarjeta'),
      defaultValue: 'Efectivo',
      comment: 'Método de pago utilizado'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tipo_suministro: {
      type: DataTypes.ENUM('Material', 'Herramienta', 'Equipo Ligero', 'Acero', 'Cimbra', 'Ferretería', 'Servicio', 'Consumible', 'Maquinaria', 'Concreto'),
      defaultValue: 'Material'
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
    unidad_medida: {
      type: DataTypes.STRING(20),
      defaultValue: 'pz',
      comment: 'Unidad de medida del suministro (pz, kg, m, m2, m3, ton, etc.)'
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
        fields: ['tipo_suministro']
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
  };

  return Suministro;
};
