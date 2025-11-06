const { DataTypes } = require('sequelize');

/**
 * Modelo: Movimientos de Ingresos
 * 
 * Registra todos los movimientos financieros asociados a un ingreso:
 * - Ingreso inicial o adicional
 * - Gastos (nómina, suministros, otros)
 * - Ajustes (correcciones, devoluciones)
 * 
 * Permite rastrear el flujo completo de recursos y calcular saldos.
 */
module.exports = (sequelize) => {
  const IngresosMovimientos = sequelize.define('ingresos_movimientos', {
    id_movimiento: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'ID único del movimiento'
    },
    id_ingreso: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'ingresos',
        key: 'id_ingreso'
      },
      comment: 'ID del ingreso al que pertenece este movimiento'
    },
    id_proyecto: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proyectos',
        key: 'id_proyecto'
      },
      comment: 'ID del proyecto asociado (heredado o específico)'
    },
    tipo: {
      type: DataTypes.ENUM('ingreso', 'gasto', 'ajuste'),
      allowNull: false,
      defaultValue: 'gasto',
      comment: 'Tipo de movimiento: ingreso (inicial o adicional), gasto (consumo), ajuste (corrección)'
    },
    fuente: {
      type: DataTypes.ENUM('nomina', 'suministro', 'manual', 'otros'),
      allowNull: false,
      defaultValue: 'manual',
      comment: 'Fuente del movimiento'
    },
    ref_tipo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tipo de referencia: nomina, suministro, etc. (para referencias polimórficas)'
    },
    ref_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: 'ID de la referencia externa (id_nomina, id_suministro, etc.)'
    },
    fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Fecha del movimiento'
    },
    monto: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Monto del movimiento (positivo para ingresos/ajustes positivos, positivo también para gastos)'
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Descripción detallada del movimiento'
    },
    saldo_after: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      comment: 'Saldo del ingreso después de aplicar este movimiento'
    }
  }, {
    tableName: 'ingresos_movimientos',
    timestamps: true,
    indexes: [
      {
        fields: ['id_ingreso'],
        name: 'idx_movimientos_ingreso'
      },
      {
        fields: ['id_proyecto'],
        name: 'idx_movimientos_proyecto'
      },
      {
        fields: ['tipo', 'fuente'],
        name: 'idx_movimientos_tipo_fuente'
      },
      {
        fields: ['fecha'],
        name: 'idx_movimientos_fecha'
      },
      {
        fields: ['ref_tipo', 'ref_id'],
        name: 'idx_movimientos_referencia'
      }
    ]
  });

  /**
   * Relaciones del modelo
   */
  IngresosMovimientos.associate = models => {
    // Pertenece a un ingreso (probar ambos nombres posibles)
    const IngresoModel = models.Ingreso || models.ingresos || models.Ingresos;
    if (IngresoModel) {
      IngresosMovimientos.belongsTo(IngresoModel, {
        foreignKey: 'id_ingreso',
        as: 'ingreso'
      });
    }

    // Pertenece a un proyecto (probar ambos nombres posibles)
    const ProyectoModel = models.Proyectos || models.proyectos || models.Proyecto;
    if (ProyectoModel) {
      IngresosMovimientos.belongsTo(ProyectoModel, {
        foreignKey: 'id_proyecto',
        as: 'proyecto'
      });
    }

    // Referencias polimórficas - no usar belongsTo directo
    // En su lugar, resolver manualmente en controladores/servicios
    // basándose en ref_tipo y ref_id
  };

  /**
   * Métodos de instancia
   */
  
  /**
   * Calcula el impacto del movimiento en el saldo
   * @returns {number} - Monto con signo según el tipo
   */
  IngresosMovimientos.prototype.calcularImpacto = function() {
    const monto = parseFloat(this.monto) || 0;
    
    switch (this.tipo) {
      case 'ingreso':
        return monto; // Suma al saldo
      case 'gasto':
        return -monto; // Resta del saldo
      case 'ajuste':
        return monto; // Puede ser positivo o negativo
      default:
        return 0;
    }
  };

  /**
   * Obtiene información de la referencia externa
   * @param {Object} models - Modelos de Sequelize
   * @returns {Promise<Object|null>} - Objeto referenciado
   */
  IngresosMovimientos.prototype.obtenerReferencia = async function(models) {
    if (!this.ref_tipo || !this.ref_id) return null;

    try {
      switch (this.ref_tipo) {
        case 'nomina':
          return await models.Nomina_empleado.findByPk(this.ref_id, {
            include: [
              { model: models.Empleados, as: 'empleado' },
              { model: models.Semanas_nomina, as: 'semana' }
            ]
          });
        
        case 'suministro':
          return await models.Suministros.findByPk(this.ref_id, {
            include: [
              { model: models.Proveedores, as: 'proveedor' },
              { model: models.Categorias_suministro, as: 'categoria' }
            ]
          });
        
        default:
          return null;
      }
    } catch (error) {
      console.error('Error obteniendo referencia:', error);
      return null;
    }
  };

  /**
   * Métodos estáticos
   */

  /**
   * Calcula el resumen de movimientos para un ingreso
   * @param {number} idIngreso - ID del ingreso
   * @returns {Promise<Object>} - Resumen con totales
   */
  IngresosMovimientos.obtenerResumen = async function(idIngreso) {
    const movimientos = await this.findAll({
      where: { id_ingreso: idIngreso },
      order: [['fecha', 'ASC'], ['id_movimiento', 'ASC']]
    });

    const resumen = {
      montoInicial: 0,
      totalIngresos: 0,
      totalGastos: 0,
      totalAjustes: 0,
      saldoActual: 0,
      cantidadMovimientos: movimientos.length
    };

    movimientos.forEach(mov => {
      const monto = parseFloat(mov.monto) || 0;
      
      switch (mov.tipo) {
        case 'ingreso':
          resumen.totalIngresos += monto;
          resumen.saldoActual += monto;
          break;
        case 'gasto':
          resumen.totalGastos += monto;
          resumen.saldoActual -= monto;
          break;
        case 'ajuste':
          resumen.totalAjustes += monto;
          resumen.saldoActual += monto;
          break;
      }
    });

    // El primer movimiento de tipo ingreso es el monto inicial
    const primerIngreso = movimientos.find(m => m.tipo === 'ingreso');
    if (primerIngreso) {
      resumen.montoInicial = parseFloat(primerIngreso.monto) || 0;
    }

    return resumen;
  };

  /**
   * Crea un movimiento de ingreso inicial
   * @param {Object} data - Datos del ingreso
   * @returns {Promise<IngresosMovimientos>}
   */
  IngresosMovimientos.crearMovimientoInicial = async function(data) {
    return await this.create({
      id_ingreso: data.id_ingreso,
      id_proyecto: data.id_proyecto,
      tipo: 'ingreso',
      fuente: 'manual',
      fecha: data.fecha,
      monto: data.monto,
      descripcion: data.descripcion || 'Ingreso inicial',
      saldo_after: data.monto
    });
  };

  /**
   * Registra un gasto (nómina o suministro)
   * @param {Object} data - Datos del gasto
   * @returns {Promise<IngresosMovimientos>}
   */
  IngresosMovimientos.registrarGasto = async function(data) {
    const { id_ingreso, monto, fecha, descripcion, ref_tipo, ref_id, id_proyecto } = data;
    
    // Obtener saldo actual
    const resumen = await this.obtenerResumen(id_ingreso);
    const nuevoSaldo = resumen.saldoActual - parseFloat(monto);

    return await this.create({
      id_ingreso,
      id_proyecto,
      tipo: 'gasto',
      fuente: ref_tipo || 'manual',
      ref_tipo,
      ref_id,
      fecha,
      monto: Math.abs(monto),
      descripcion,
      saldo_after: nuevoSaldo
    });
  };

  return IngresosMovimientos;
};
