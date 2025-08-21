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
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    tipo_suministro: {
      type: DataTypes.ENUM('Material', 'Servicio', 'Equipo'),
      defaultValue: 'Material'
    },
    descripcion: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Descripción del material, servicio o equipo'
    },
    cantidad: {
      type: DataTypes.DECIMAL(10,3),
      allowNull: true,
      defaultValue: 0,
      comment: 'Cantidad del suministro'
    },
    unidad_medida: {
      type: DataTypes.ENUM('m³', 'unidad', 'hora', 'día', 'kg', 'ton', 'm²', 'm'),
      defaultValue: 'm³'
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
    camion: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Placas o identificador del camión'
    },
    operador: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'Nombre del operador'
    },
    salida_planta: {
      type: DataTypes.TIME,
      allowNull: true
    },
    llegada_obra: {
      type: DataTypes.TIME,
      allowNull: true
    },
    inicio_descarga: {
      type: DataTypes.TIME,
      allowNull: true
    },
    termina_descarga: {
      type: DataTypes.TIME,
      allowNull: true
    },
    salida_obra: {
      type: DataTypes.TIME,
      allowNull: true
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
      type: DataTypes.ENUM('Pendiente', 'En_Transito', 'Entregado', 'Cancelado'),
      defaultValue: 'Entregado'
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
