const models = require('../models');

/**
 * Obtener todos los adeudos de un empleado
 */
const getAdeudosEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;

    const adeudos = await models.Adeudo_empleado.findAll({
      where: { empleado_id: idEmpleado },
      include: [
        {
          model: models.Empleados,
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });

    res.json({
      success: true,
      data: adeudos
    });
  } catch (error) {
    console.error('Error getting employee debts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudos del empleado',
      error: error.message
    });
  }
};

/**
 * Obtener el total de adeudos pendientes de un empleado
 */
const getTotalAdeudosPendientes = async (req, res) => {
  try {
    const { idEmpleado } = req.params;

    const adeudos = await models.Adeudo_empleado.findAll({
      where: { 
        empleado_id: idEmpleado,
        estado: ['pendiente', 'en_proceso']
      }
    });

    const total = adeudos.reduce((sum, adeudo) => {
      return sum + parseFloat(adeudo.monto_pendiente || 0);
    }, 0);

    res.json({
      success: true,
      total: total
    });
  } catch (error) {
    console.error('Error getting total pending debts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener total de adeudos pendientes',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo adeudo
 */
const crearAdeudo = async (req, res) => {
  try {
    const {
      empleado_id,
      concepto,
      descripcion,
      monto_total,
      tipo_adeudo = 'prestamo',
      observaciones
    } = req.body;

    // Validar datos requeridos
    if (!empleado_id || !monto_total) {
      return res.status(400).json({
        success: false,
        message: 'ID del empleado y monto total son requeridos'
      });
    }

    const nuevoAdeudo = await models.Adeudo_empleado.create({
      empleado_id,
      concepto: concepto || 'Adeudo de empleado',
      descripcion,
      monto_total: parseFloat(monto_total),
      monto_pendiente: parseFloat(monto_total), // Inicialmente el pendiente es igual al total
      tipo_adeudo,
      fecha_creacion: new Date(),
      estado: 'pendiente',
      observaciones
    });

    res.status(201).json({
      success: true,
      data: nuevoAdeudo,
      message: 'Adeudo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear adeudo',
      error: error.message
    });
  }
};

/**
 * Actualizar un adeudo (pago parcial)
 */
const actualizarAdeudo = async (req, res) => {
  try {
    const { idAdeudo } = req.params;
    const { monto_pagado, observaciones } = req.body;

    const adeudo = await models.Adeudo_empleado.findByPk(idAdeudo);
    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    // Calcular nuevo monto pagado
    const nuevoMontoPagado = parseFloat(adeudo.monto_pagado) + parseFloat(monto_pagado || 0);
    
    // Verificar que no se pague más de lo debido
    if (nuevoMontoPagado > parseFloat(adeudo.monto_adeudo)) {
      return res.status(400).json({
        success: false,
        message: 'El monto a pagar excede el adeudo total'
      });
    }

    await adeudo.update({
      monto_pagado: nuevoMontoPagado,
      observaciones: observaciones || adeudo.observaciones
    });

    res.json({
      success: true,
      data: adeudo,
      message: 'Adeudo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error updating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar adeudo',
      error: error.message
    });
  }
};

/**
 * Liquidar un adeudo completamente
 */
const liquidarAdeudo = async (req, res) => {
  try {
    const { idAdeudo } = req.params;
    console.log('🔄 [BACKEND] Liquidando adeudo con ID:', idAdeudo);

    const adeudo = await models.Adeudo_empleado.findByPk(idAdeudo);
    if (!adeudo) {
      console.log('❌ [BACKEND] Adeudo no encontrado con ID:', idAdeudo);
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    console.log('🔍 [BACKEND] Adeudo encontrado:', {
      id: adeudo.id,
      estado_actual: adeudo.estado,
      monto_total: adeudo.monto_total,
      monto_pendiente: adeudo.monto_pendiente
    });

    await adeudo.update({
      monto_pagado: adeudo.monto_total,
      monto_pendiente: 0,
      estado: 'Liquidado',
      fecha_liquidacion: new Date()
    });

    console.log('✅ [BACKEND] Adeudo liquidado exitosamente:', {
      id: adeudo.id,
      nuevo_estado: adeudo.estado,
      monto_pagado: adeudo.monto_pagado,
      monto_pendiente: adeudo.monto_pendiente
    });

    res.json({
      success: true,
      data: adeudo,
      message: 'Adeudo liquidado exitosamente'
    });
  } catch (error) {
    console.error('❌ [BACKEND] Error liquidating debt:', error);
    res.status(500).json({
      success: false,
      message: 'Error al liquidar adeudo',
      error: error.message
    });
  }
};

/**
 * Obtener todos los adeudos pendientes
 */
const getAllAdeudosPendientes = async (req, res) => {
  try {
    const adeudos = await models.Adeudo_empleado.findAll({
      where: {
        estado: ['pendiente', 'en_proceso'],
        activo: true
      },
      include: [
        {
          model: models.Empleados,
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_creacion', 'ASC']]
    });

    res.json({
      success: true,
      data: adeudos
    });
  } catch (error) {
    console.error('Error getting all pending debts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudos pendientes',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de adeudos
 */
const getEstadisticasAdeudos = async (req, res) => {
  try {
    const [totalAdeudos, adeudosPendientes, adeudosParciales, adeudosLiquidados] = await Promise.all([
      models.Adeudo_empleado.count(),
      models.Adeudo_empleado.count({ where: { estado: 'pendiente' } }),
      models.Adeudo_empleado.count({ where: { estado: 'en_proceso' } }),
      models.Adeudo_empleado.count({ where: { estado: 'liquidado' } })
    ]);

    // Calcular montos totales
    const adeudosPendientesData = await models.Adeudo_empleado.findAll({
      where: { estado: ['pendiente', 'en_proceso'] },
      attributes: ['monto_pendiente']
    });

    const montoTotalPendiente = adeudosPendientesData.reduce((sum, adeudo) => {
      return sum + parseFloat(adeudo.monto_pendiente || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalAdeudos,
        adeudosPendientes,
        adeudosParciales,
        adeudosLiquidados,
        montoTotalPendiente
      }
    });
  } catch (error) {
    console.error('Error getting debt statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas de adeudos',
      error: error.message
    });
  }
};

module.exports = {
  getAdeudosEmpleado,
  getTotalAdeudosPendientes,
  crearAdeudo,
  actualizarAdeudo,
  liquidarAdeudo,
  getAllAdeudosPendientes,
  getEstadisticasAdeudos
};
