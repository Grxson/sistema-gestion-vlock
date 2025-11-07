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

    // Calcular resumen extendido y capital por proyecto
    const filtrosResumen = {
      fechaInicio: drStart || undefined,
      fechaFin: drEnd || undefined,
      id_proyecto: proyectoId || undefined,
      tipo: tipo || undefined,
      fuente: fuente || undefined
    };

    const resumen = await models.ingresos_movimientos.calcularResumen(filtrosResumen);
    const capitalPorProyecto = await models.ingresos_movimientos.obtenerCapitalPorProyecto(filtrosResumen);

    // Formatear movimientos para el frontend
    const movimientosFormateados = movimientos.map(mov => ({
      id_mov: mov.id_movimiento,
      fecha: mov.fecha,
      proyecto_id: mov.id_proyecto,
      proyecto_nombre: proyectosMap[mov.id_proyecto] || null,
      tipo: mov.tipo,
      fuente: mov.fuente,
      monto: parseFloat(mov.monto),
      saldo_after: mov.saldo_after != null ? parseFloat(mov.saldo_after) : null,
      descripcion: mov.descripcion,
      ref_tipo: mov.ref_tipo,
      ref_id: mov.ref_id
    }));
    
    res.json({ 
      success: true, 
      data: movimientosFormateados,
      resumen,
      capitalPorProyecto
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
 * Obtener resumen global de capital
 * GET /api/movimientos-ingresos/resumen/global
 */
exports.obtenerResumenGlobal = async (req, res) => {
  try {
    const { drStart, drEnd, proyectoId, tipo, fuente } = req.query;

    const filtros = {
      fechaInicio: drStart || undefined,
      fechaFin: drEnd || undefined,
      id_proyecto: proyectoId || undefined,
      tipo: tipo || undefined,
      fuente: fuente || undefined
    };

    const { resumen, porProyecto } = await models.ingresos_movimientos.obtenerResumenGlobal(filtros);

    // Obtener nombres de proyectos para el resumen agrupado
    const ids = Array.from(new Set(
      porProyecto
        .map(item => item.id_proyecto)
        .filter(id => id != null)
    ));

    let proyectosMap = {};
    if (ids.length > 0) {
      const ProyectoModel = models.Proyectos || models.proyectos || models.Proyecto;
      if (ProyectoModel) {
        const proyectos = await ProyectoModel.findAll({
          where: { id_proyecto: ids },
          attributes: ['id_proyecto', 'nombre'],
          raw: true
        });

        proyectos.forEach(p => {
          proyectosMap[p.id_proyecto] = p.nombre;
        });
      }
    }

    const detalle = porProyecto.map(item => ({
      ...item,
      proyecto_nombre: proyectosMap[item.id_proyecto] || null
    }));

    res.json({
      success: true,
      data: {
        resumen,
        porProyecto: detalle
      }
    });
  } catch (error) {
    console.error('Error obteniendo resumen global:', error);
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
    
    let movimiento;

    if (tipo === 'gasto') {
      movimiento = await models.ingresos_movimientos.registrarGasto({
        id_ingreso,
        id_proyecto,
        monto: parseFloat(monto),
        fecha: fecha || new Date(),
        descripcion,
        ref_tipo,
        ref_id,
        fuente
      });
    } else {
      const payload = {
        id_ingreso,
        id_proyecto,
        tipo,
        fuente,
        ref_tipo,
        ref_id,
        fecha: fecha || new Date(),
        monto: Math.abs(parseFloat(monto)),
        descripcion
      };

      if (tipo === 'ingreso') {
        const resumen = await models.ingresos_movimientos.obtenerResumen(id_ingreso);
        payload.saldo_after = resumen.saldoActual + Math.abs(parseFloat(monto));
      }

      if (tipo === 'ajuste') {
        const resumen = await models.ingresos_movimientos.obtenerResumen(id_ingreso);
        payload.saldo_after = resumen.saldoActual + parseFloat(monto);
      }

      movimiento = await models.ingresos_movimientos.create(payload);
    }
    
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
