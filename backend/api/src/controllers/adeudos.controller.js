const models = require('../models');

/**
 * Obtener todos los adeudos de un empleado
 */
const getAdeudosEmpleado = async (req, res) => {
  try {
    const { idEmpleado } = req.params;

    const adeudos = await models.Adeudo_empleado.findAll({
      where: { id_empleado: idEmpleado },
      include: [
        {
          model: models.Empleados,
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_adeudo', 'DESC']]
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
        id_empleado: idEmpleado,
        estado: ['Pendiente', 'Parcial']
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
      id_empleado,
      monto_adeudo,
      observaciones
    } = req.body;

    // Validar datos requeridos
    if (!id_empleado || !monto_adeudo) {
      return res.status(400).json({
        success: false,
        message: 'ID del empleado y monto del adeudo son requeridos'
      });
    }

    const nuevoAdeudo = await models.Adeudo_empleado.create({
      id_empleado,
      monto_adeudo: parseFloat(monto_adeudo),
      monto_pendiente: parseFloat(monto_adeudo), // Inicialmente el pendiente es igual al total
      monto_pagado: 0.00,
      fecha_adeudo: new Date(),
      estado: 'Pendiente',
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

    // Calcular nuevo monto pendiente
    const nuevoMontoPendiente = parseFloat(adeudo.monto_adeudo) - nuevoMontoPagado;

    await adeudo.update({
      monto_pagado: nuevoMontoPagado,
      monto_pendiente: nuevoMontoPendiente,
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
      id_adeudo: adeudo.id_adeudo,
      estado_actual: adeudo.estado,
      monto_adeudo: adeudo.monto_adeudo,
      monto_pendiente: adeudo.monto_pendiente
    });

    await adeudo.update({
      monto_pagado: adeudo.monto_adeudo,
      monto_pendiente: 0,
      estado: 'Liquidado',
      fecha_liquidacion: new Date()
    });

    console.log('✅ [BACKEND] Adeudo liquidado exitosamente:', {
      id_adeudo: adeudo.id_adeudo,
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
        estado: ['Pendiente', 'Parcial']
      },
      include: [
        {
          model: models.Empleados,
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_adeudo', 'ASC']]
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
 * Obtener todos los adeudos (pendientes y liquidados)
 */
const getAllAdeudos = async (req, res) => {
  try {
    const adeudos = await models.Adeudo_empleado.findAll({
      include: [
        {
          model: models.Empleados,
          as: 'empleado',
          attributes: ['id_empleado', 'nombre', 'apellido']
        }
      ],
      order: [['fecha_adeudo', 'DESC']]
    });

    res.json({
      success: true,
      data: adeudos
    });
  } catch (error) {
    console.error('Error getting all debts:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener todos los adeudos',
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
      models.Adeudo_empleado.count({ where: { estado: 'Pendiente' } }),
      models.Adeudo_empleado.count({ where: { estado: 'Parcial' } }),
      models.Adeudo_empleado.count({ where: { estado: 'Liquidado' } })
    ]);

    // Calcular montos totales
    const adeudosPendientesData = await models.Adeudo_empleado.findAll({
      where: { estado: ['Pendiente', 'Parcial'] },
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
  getAllAdeudos,
  getEstadisticasAdeudos
};
