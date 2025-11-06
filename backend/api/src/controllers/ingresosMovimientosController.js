const models = require('../models');
const { Op } = require('sequelize');

/**
 * Listar movimientos con filtros
 * GET /api/movimientos-ingresos?drStart=&drEnd=&proyectoId=&tipo=&fuente=
 */
exports.listarMovimientos = async (req, res) => {
  try {
    const { drStart, drEnd, proyectoId, tipo, fuente } = req.query;
    
    const where = {};
    
    // Filtro por rango de fechas
    if (drStart && drEnd) {
      where.fecha = { [Op.between]: [drStart, drEnd] };
    } else if (drStart) {
      where.fecha = { [Op.gte]: drStart };
    } else if (drEnd) {
      where.fecha = { [Op.lte]: drEnd };
    }
    
    // Filtro por proyecto
    if (proyectoId) {
      where.id_proyecto = proyectoId;
    }
    
    // Filtro por tipo
    if (tipo) {
      where.tipo = tipo;
    }
    
    // Filtro por fuente
    if (fuente) {
      where.fuente = fuente;
    }
    
    // Obtener movimientos sin includes (más simple y seguro)
    const movimientos = await models.ingresos_movimientos.findAll({
      where,
      order: [['fecha', 'DESC'], ['id_movimiento', 'DESC']],
      raw: true
    });

    // Obtener proyectos únicos si hay movimientos
    let proyectosMap = {};
    if (movimientos.length > 0) {
      const proyectoIds = [...new Set(movimientos.map(m => m.id_proyecto).filter(Boolean))];
      
      if (proyectoIds.length > 0) {
        const ProyectoModel = models.Proyectos || models.proyectos || models.Proyecto;
        if (ProyectoModel) {
          const proyectos = await ProyectoModel.findAll({
            where: { id_proyecto: proyectoIds },
            attributes: ['id_proyecto', 'nombre'],
            raw: true
          });
          
          proyectos.forEach(p => {
            proyectosMap[p.id_proyecto] = p.nombre;
          });
        }
      }
    }

    // Calcular resumen
    const resumen = movimientos.reduce((acc, mov) => {
      const monto = parseFloat(mov.monto) || 0;
      
      if (mov.tipo === 'ingreso') {
        acc.totalIngresos += monto;
      } else if (mov.tipo === 'gasto') {
        acc.totalGastos += monto;
      } else if (mov.tipo === 'ajuste') {
        acc.totalAjustes += monto;
      }
      
      return acc;
    }, { 
      montoInicial: 0, 
      totalIngresos: 0, 
      totalGastos: 0, 
      totalAjustes: 0 
    });

    // El primer ingreso es el monto inicial
    const primerIngreso = movimientos.find(m => m.tipo === 'ingreso');
    if (primerIngreso) {
      resumen.montoInicial = parseFloat(primerIngreso.monto) || 0;
    }

    // Formatear movimientos para el frontend
    const movimientosFormateados = movimientos.map(mov => ({
      id_mov: mov.id_movimiento,
      fecha: mov.fecha,
      proyecto_id: mov.id_proyecto,
      proyecto_nombre: proyectosMap[mov.id_proyecto] || null,
      tipo: mov.tipo,
      fuente: mov.fuente,
      monto: parseFloat(mov.monto),
      descripcion: mov.descripcion,
      ref_tipo: mov.ref_tipo,
      ref_id: mov.ref_id
    }));
    
    res.json({ 
      success: true, 
      data: movimientosFormateados,
      resumen 
    });
  } catch (error) {
    console.error('Error listando movimientos:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Obtener resumen de movimientos por ingreso
 * GET /api/ingresos/:id/movimientos/resumen
 */
exports.obtenerResumenPorIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const resumen = await models.ingresos_movimientos.obtenerResumen(parseInt(id));
    
    res.json({ 
      success: true, 
      data: resumen 
    });
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Registrar un movimiento manualmente
 * POST /api/movimientos-ingresos
 */
exports.crearMovimiento = async (req, res) => {
  try {
    const { 
      id_ingreso, 
      id_proyecto, 
      tipo, 
      fuente, 
      monto, 
      fecha, 
      descripcion, 
      ref_tipo, 
      ref_id 
    } = req.body;
    
    // Validaciones básicas
    if (!id_ingreso) {
      return res.status(400).json({ 
        success: false, 
        error: 'id_ingreso es requerido' 
      });
    }
    
    if (!tipo || !['ingreso', 'gasto', 'ajuste'].includes(tipo)) {
      return res.status(400).json({ 
        success: false, 
        error: 'tipo debe ser: ingreso, gasto o ajuste' 
      });
    }
    
    if (!fuente || !['nomina', 'suministro', 'manual', 'otros'].includes(fuente)) {
      return res.status(400).json({ 
        success: false, 
        error: 'fuente debe ser: nomina, suministro, manual u otros' 
      });
    }
    
    if (!monto || isNaN(monto)) {
      return res.status(400).json({ 
        success: false, 
        error: 'monto es requerido y debe ser numérico' 
      });
    }
    
    // Crear el movimiento
    const movimiento = await models.ingresos_movimientos.create({
      id_ingreso,
      id_proyecto,
      tipo,
      fuente,
      ref_tipo,
      ref_id,
      fecha: fecha || new Date(),
      monto: Math.abs(parseFloat(monto)),
      descripcion
    });
    
    res.json({ 
      success: true, 
      data: movimiento 
    });
  } catch (error) {
    console.error('Error creando movimiento:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = exports;
