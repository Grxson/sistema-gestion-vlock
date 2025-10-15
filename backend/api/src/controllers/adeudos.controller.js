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
        },
        {
          model: models.Nomina_empleado,
          as: 'nomina',
          attributes: ['id_nomina', 'createdAt']
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
      id_nomina,
      monto_adeudo,
      monto_pagado = 0,
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
      id_nomina,
      monto_adeudo: parseFloat(monto_adeudo),
      monto_pagado: parseFloat(monto_pagado),
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

    const adeudo = await models.Adeudo_empleado.findByPk(idAdeudo);
    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    await adeudo.update({
      monto_pagado: adeudo.monto_adeudo,
      estado: 'Liquidado',
      fecha_liquidacion: new Date()
    });

    res.json({
      success: true,
      data: adeudo,
      message: 'Adeudo liquidado exitosamente'
    });
  } catch (error) {
    console.error('Error liquidating debt:', error);
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
  getEstadisticasAdeudos
};
