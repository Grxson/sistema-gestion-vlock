const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CatalogoPrecioDetalle = sequelize.define('CatalogoPrecioDetalle', {
    id_detalle: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    id_catalogo: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'catalogos_precios',
        key: 'id_catalogo'
      }
    },
    id_concepto: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conceptos_obra',
        key: 'id_concepto'
      }
    },
    precio_unitario: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    precio_minimo: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    precio_maximo: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    costo_material: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    costo_mano_obra: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    costo_equipo: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    costo_subcontrato: {
      type: DataTypes.DECIMAL(15, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    factor_sobrecosto: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: false,
      defaultValue: 1.0000,
      validate: {
        min: 0.0001
      }
    },
    margen_utilidad_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    descuento_volumen_porcentaje: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 100
      }
    },
    rendimiento_promedio: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    rendimiento_minimo: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    rendimiento_maximo: {
      type: DataTypes.DECIMAL(8, 4),
      allowNull: true,
      validate: {
        min: 0
      }
    },
    vigente_desde: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    vigente_hasta: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    proveedor_referencia: {
      type: DataTypes.STRING(200),
      allowNull: true
    },
    fuente_precio: {
      type: DataTypes.ENUM('cotizacion', 'mercado', 'historico', 'estimado', 'ajustado'),
      allowNull: false,
      defaultValue: 'cotizacion'
    },
    confiabilidad: {
      type: DataTypes.ENUM('alta', 'media', 'baja'),
      allowNull: false,
      defaultValue: 'media'
    },
    numero_cotizaciones: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 0
      }
    },
    fecha_ultima_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    actualizado_por: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    observaciones: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadatos: {
      type: DataTypes.JSON,
      allowNull: true
    },
    es_precio_referencial: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    requiere_aprobacion: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'catalogos_precios_detalle',
    timestamps: true,
    indexes: [
      {
        fields: ['id_catalogo']
      },
      {
        fields: ['id_concepto']
      },
      {
        fields: ['fuente_precio']
      },
      {
        fields: ['confiabilidad']
      },
      {
        fields: ['vigente_desde']
      },
      {
        unique: true,
        fields: ['id_catalogo', 'id_concepto']
      }
    ],
    hooks: {
      beforeValidate: (detalle, options) => {
        // Validar que precio_minimo <= precio_unitario <= precio_maximo
        if (detalle.precio_minimo && detalle.precio_unitario < detalle.precio_minimo) {
          throw new Error('El precio unitario no puede ser menor al precio mínimo');
        }
        if (detalle.precio_maximo && detalle.precio_unitario > detalle.precio_maximo) {
          throw new Error('El precio unitario no puede ser mayor al precio máximo');
        }
        
        // Validar fechas de vigencia
        if (detalle.vigente_hasta && detalle.vigente_desde) {
          if (new Date(detalle.vigente_hasta) <= new Date(detalle.vigente_desde)) {
            throw new Error('La fecha hasta debe ser posterior a la fecha desde');
          }
        }
      },
      beforeSave: (detalle, options) => {
        // Actualizar fecha de última actualización
        detalle.fecha_ultima_actualizacion = new Date();
      }
    }
  });

  // Métodos de instancia
  CatalogoPrecioDetalle.prototype.isVigente = function(date = new Date()) {
    const checkDate = new Date(date);
    const desde = new Date(this.vigente_desde);
    const hasta = this.vigente_hasta ? new Date(this.vigente_hasta) : null;
    
    return checkDate >= desde && (!hasta || checkDate <= hasta);
  };

  CatalogoPrecioDetalle.prototype.getCostoBreakdown = function() {
    const material = parseFloat(this.costo_material) || 0;
    const manoObra = parseFloat(this.costo_mano_obra) || 0;
    const equipo = parseFloat(this.costo_equipo) || 0;
    const subcontrato = parseFloat(this.costo_subcontrato) || 0;
    const total = material + manoObra + equipo + subcontrato;

    return {
      material: {
        valor: material,
        porcentaje: total > 0 ? (material / total * 100).toFixed(2) : 0
      },
      manoObra: {
        valor: manoObra,
        porcentaje: total > 0 ? (manoObra / total * 100).toFixed(2) : 0
      },
      equipo: {
        valor: equipo,
        porcentaje: total > 0 ? (equipo / total * 100).toFixed(2) : 0
      },
      subcontrato: {
        valor: subcontrato,
        porcentaje: total > 0 ? (subcontrato / total * 100).toFixed(2) : 0
      },
      total
    };
  };

  CatalogoPrecioDetalle.prototype.getPrecioConDescuento = function(volumen = 0) {
    let precio = parseFloat(this.precio_unitario);
    
    if (this.descuento_volumen_porcentaje && volumen > 0) {
      // Aplicar descuento por volumen (lógica básica, se puede personalizar)
      const descuento = precio * (this.descuento_volumen_porcentaje / 100);
      precio -= descuento;
    }
    
    return precio;
  };

  CatalogoPrecioDetalle.prototype.getIndicadorConfiabilidad = function() {
    const niveles = {
      'alta': { valor: 3, color: 'green' },
      'media': { valor: 2, color: 'yellow' },
      'baja': { valor: 1, color: 'red' }
    };
    
    return niveles[this.confiabilidad] || niveles['media'];
  };

  CatalogoPrecioDetalle.prototype.actualizarPrecio = async function(nuevoPrecio, usuario, observaciones = null) {
    const precioAnterior = this.precio_unitario;
    
    this.precio_unitario = nuevoPrecio;
    this.actualizado_por = usuario;
    this.fecha_ultima_actualizacion = new Date();
    
    if (observaciones) {
      this.observaciones = observaciones;
    }
    
    // Registrar en metadatos el cambio
    const cambio = {
      fecha: new Date(),
      usuario,
      precio_anterior: precioAnterior,
      precio_nuevo: nuevoPrecio,
      observaciones
    };
    
    if (!this.metadatos) {
      this.metadatos = {};
    }
    
    if (!this.metadatos.historial_cambios) {
      this.metadatos.historial_cambios = [];
    }
    
    this.metadatos.historial_cambios.push(cambio);
    
    await this.save();
    return this;
  };

  // Métodos de clase
  CatalogoPrecioDetalle.findVigentes = function(catalogoId) {
    return this.findAll({
      where: {
        id_catalogo: catalogoId,
        vigente_desde: {
          [this.sequelize.Sequelize.Op.lte]: new Date()
        },
        [this.sequelize.Sequelize.Op.or]: [
          { vigente_hasta: null },
          { vigente_hasta: { [this.sequelize.Sequelize.Op.gte]: new Date() } }
        ]
      },
      include: [{
        model: this.sequelize.models.ConceptoObra,
        as: 'Concepto'
      }],
      order: [['Concepto', 'nombre', 'ASC']]
    });
  };

  CatalogoPrecioDetalle.findByConcepto = function(conceptoId) {
    return this.findAll({
      where: { id_concepto: conceptoId },
      include: [{
        model: this.sequelize.models.CatalogoPrecio,
        as: 'Catalogo',
        where: { estado: 'activo' }
      }],
      order: [['vigente_desde', 'DESC']]
    });
  };

  CatalogoPrecioDetalle.compararPrecios = function(conceptoId, catalogoIds) {
    return this.findAll({
      where: {
        id_concepto: conceptoId,
        id_catalogo: {
          [this.sequelize.Sequelize.Op.in]: catalogoIds
        }
      },
      include: [{
        model: this.sequelize.models.CatalogoPrecio,
        as: 'Catalogo'
      }, {
        model: this.sequelize.models.ConceptoObra,
        as: 'Concepto'
      }],
      order: [['precio_unitario', 'ASC']]
    });
  };

  // Asociaciones
  CatalogoPrecioDetalle.associate = function(models) {
    CatalogoPrecioDetalle.belongsTo(models.CatalogoPrecio, {
      foreignKey: 'id_catalogo',
      as: 'Catalogo'
    });

    CatalogoPrecioDetalle.belongsTo(models.ConceptoObra, {
      foreignKey: 'id_concepto',
      as: 'Concepto'
    });
  };

  return CatalogoPrecioDetalle;
};