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
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'id_proveedor'
      },
      comment: 'ID del proveedor (relación con tabla proveedores)'
    },
    proveedor: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: 'Nombre del proveedor (campo temporal para compatibilidad)'
    },
    folio: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Folio interno del sistema'
    },
    folio_proveedor: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Folio del proveedor que aparece en el recibo físico'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tipo_suministro: {
      type: DataTypes.ENUM('Material', 'Servicio', 'Equipo', 'Herramienta', 'Maquinaria'),
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
    
    // Campos específicos para materiales
    m3_perdidos: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0
    },
    m3_entregados: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0
    },
    m3_por_entregar: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0
    },
    
    // Campos de logística
    vehiculo_transporte: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Placas o identificador del vehículo de transporte'
    },
    operador_responsable: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del operador responsable'
    },
    hora_salida: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de salida de la planta'
    },
    hora_llegada: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de llegada a la obra'
    },
    hora_inicio_descarga: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de inicio de descarga'
    },
    hora_fin_descarga: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de finalización de descarga'
    },
    hora_salida_obra: {
      type: DataTypes.TIME,
      allowNull: true,
      comment: 'Hora de salida de la obra'
    },
    total_horas: {
      type: DataTypes.DECIMAL(4,2),
      allowNull: true,
      comment: 'Total de horas calculadas automáticamente'
    },
    
    // Campos financieros (para futuro)
    precio_unitario: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Precio por unidad de medida'
    },
    costo_total: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Costo total del suministro'
    },
    
    // Campos adicionales
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observaciones adicionales'
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
        fields: ['proveedor']
      },
      {
        fields: ['fecha']
      },
      {
        fields: ['tipo_suministro']
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
      as: 'proveedorInfo'
    });
  };

  return Suministro;
};
