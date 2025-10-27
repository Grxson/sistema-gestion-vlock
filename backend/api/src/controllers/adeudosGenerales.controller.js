const models = require('../models');
const { Op } = require('sequelize');
const {
  debeAlertarHoy,
  calcularDiasRestantes,
  obtenerNivelUrgencia,
  obtenerMensajeAlerta
} = require('../utils/alertasVencimiento');

/**
 * Obtener todos los adeudos generales con filtros opcionales
 */
const getAdeudosGenerales = async (req, res) => {
  try {
    const { tipo, estado, fecha_inicio, fecha_fin } = req.query;
    
    const whereClause = {};
    
    // Filtrar por tipo si se proporciona
    if (tipo && ['nos_deben', 'debemos'].includes(tipo)) {
      whereClause.tipo_adeudo = tipo;
    }
    
    // Filtrar por estado si se proporciona
    // "pendiente" incluye tanto pendiente como parcial (adeudos no liquidados)
    if (estado && ['pendiente', 'parcial', 'pagado'].includes(estado)) {
      if (estado === 'pendiente') {
        whereClause.estado = {
          [Op.in]: ['pendiente', 'parcial']
        };
      } else {
        whereClause.estado = estado;
      }
    }

    // Filtrar por rango de fechas si se proporcionan
    // Filtra por fecha de registro o fecha de actualización
    if (fecha_inicio && fecha_fin) {
      whereClause[Op.or] = [
        {
          fecha_registro: {
            [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin + 'T23:59:59.999Z')]
          }
        },
        {
          updatedAt: {
            [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin + 'T23:59:59.999Z')]
          }
        }
      ];
    }

    const adeudos = await models.Adeudo_general.findAll({
      where: whereClause,
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ],
      order: [['fecha_registro', 'DESC']]
    });

    res.json({
      success: true,
      data: adeudos
    });
  } catch (error) {
    console.error('Error obteniendo adeudos generales:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudos generales',
      error: error.message
    });
  }
};

/**
 * Obtener un adeudo general por ID
 */
const getAdeudoGeneralById = async (req, res) => {
  try {
    const { id } = req.params;

    const adeudo = await models.Adeudo_general.findByPk(id, {
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ]
    });

    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    res.json({
      success: true,
      data: adeudo
    });
  } catch (error) {
    console.error('Error obteniendo adeudo general:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudo general',
      error: error.message
    });
  }
};

/**
 * Crear un nuevo adeudo general
 */
const crearAdeudoGeneral = async (req, res) => {
  try {
    const { nombre_entidad, tipo_adeudo, monto, fecha_vencimiento, notas } = req.body;
    const id_usuario_registro = req.user?.id_usuario;

    // Validaciones
    if (!nombre_entidad || !nombre_entidad.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la persona o empresa es requerido'
      });
    }

    if (!tipo_adeudo || !['nos_deben', 'debemos'].includes(tipo_adeudo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de adeudo debe ser "nos_deben" o "debemos"'
      });
    }

    if (!monto || isNaN(monto) || parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número mayor a 0'
      });
    }

    const montoNumerico = parseFloat(monto);
    
    const nuevoAdeudo = await models.Adeudo_general.create({
      nombre_entidad: nombre_entidad.trim(),
      tipo_adeudo,
      monto: montoNumerico,
      monto_original: montoNumerico,
      monto_pagado: 0,
      monto_pendiente: montoNumerico,
      estado: 'pendiente',
      fecha_registro: new Date(),
      fecha_vencimiento: fecha_vencimiento || null,
      notas: notas?.trim() || null,
      id_usuario_registro
    });

    // Obtener el adeudo con las relaciones
    const adeudoCompleto = await models.Adeudo_general.findByPk(nuevoAdeudo.id_adeudo_general, {
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: adeudoCompleto,
      message: 'Adeudo creado exitosamente'
    });
  } catch (error) {
    console.error('Error creando adeudo general:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear adeudo general',
      error: error.message
    });
  }
};

/**
 * Actualizar un adeudo general
 */
const actualizarAdeudoGeneral = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_entidad, tipo_adeudo, monto, fecha_vencimiento, notas } = req.body;

    const adeudo = await models.Adeudo_general.findByPk(id);

    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    // No permitir editar adeudos ya pagados
    if (adeudo.estado === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'No se puede editar un adeudo que ya ha sido pagado'
      });
    }

    // Validaciones
    if (nombre_entidad !== undefined && !nombre_entidad.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la persona o empresa no puede estar vacío'
      });
    }

    if (tipo_adeudo !== undefined && !['nos_deben', 'debemos'].includes(tipo_adeudo)) {
      return res.status(400).json({
        success: false,
        message: 'El tipo de adeudo debe ser "nos_deben" o "debemos"'
      });
    }

    if (monto !== undefined && (isNaN(monto) || parseFloat(monto) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número mayor a 0'
      });
    }

    // Actualizar campos
    const camposActualizar = {};
    if (nombre_entidad !== undefined) camposActualizar.nombre_entidad = nombre_entidad.trim();
    if (tipo_adeudo !== undefined) camposActualizar.tipo_adeudo = tipo_adeudo;
    if (monto !== undefined) camposActualizar.monto = parseFloat(monto);
    if (fecha_vencimiento !== undefined) camposActualizar.fecha_vencimiento = fecha_vencimiento || null;
    if (notas !== undefined) camposActualizar.notas = notas?.trim() || null;

    await adeudo.update(camposActualizar);

    // Obtener el adeudo actualizado con las relaciones
    const adeudoActualizado = await models.Adeudo_general.findByPk(id, {
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: adeudoActualizado,
      message: 'Adeudo actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando adeudo general:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar adeudo general',
      error: error.message
    });
  }
};

/**
 * Registrar un pago parcial
 */
const registrarPagoParcial = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto_pago, notas_pago } = req.body;

    const adeudo = await models.Adeudo_general.findByPk(id);

    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    if (adeudo.estado === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'Este adeudo ya está completamente pagado'
      });
    }

    // Validar monto del pago
    const montoPago = parseFloat(monto_pago);
    if (isNaN(montoPago) || montoPago <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto del pago debe ser mayor a 0'
      });
    }

    // Calcular nuevo monto pagado
    const nuevoMontoPagado = parseFloat(adeudo.monto_pagado) + montoPago;
    const montoOriginal = parseFloat(adeudo.monto_original || adeudo.monto);

    // Validar que no se pague más del adeudo
    if (nuevoMontoPagado > montoOriginal) {
      return res.status(400).json({
        success: false,
        message: `El pago excede el monto pendiente. Monto pendiente: $${(montoOriginal - parseFloat(adeudo.monto_pagado)).toFixed(2)}`
      });
    }

    // Calcular nuevo monto pendiente
    const nuevoMontoPendiente = montoOriginal - nuevoMontoPagado;

    // Determinar nuevo estado
    let nuevoEstado = 'parcial';
    let fechaPago = null;
    
    if (nuevoMontoPendiente === 0) {
      nuevoEstado = 'pagado';
      fechaPago = new Date();
    }

    // Actualizar notas si se proporcionan
    let notasActualizadas = adeudo.notas || '';
    if (notas_pago) {
      const fechaActual = new Date().toLocaleDateString('es-MX');
      const nuevaNota = `\n[${fechaActual}] Pago parcial: $${montoPago.toFixed(2)} - ${notas_pago}`;
      notasActualizadas += nuevaNota;
    }

    // Actualizar adeudo
    await adeudo.update({
      monto_pagado: nuevoMontoPagado,
      monto_pendiente: nuevoMontoPendiente,
      monto: nuevoMontoPendiente, // Actualizar monto actual
      estado: nuevoEstado,
      fecha_pago: fechaPago,
      notas: notasActualizadas
    });

    // Obtener el adeudo actualizado con las relaciones
    const adeudoActualizado = await models.Adeudo_general.findByPk(id, {
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: adeudoActualizado,
      message: nuevoEstado === 'pagado' 
        ? 'Adeudo liquidado completamente' 
        : `Pago parcial registrado. Pendiente: $${nuevoMontoPendiente.toFixed(2)}`
    });
  } catch (error) {
    console.error('Error registrando pago parcial:', error);
    res.status(500).json({
      success: false,
      message: 'Error al registrar pago parcial',
      error: error.message
    });
  }
};

/**
 * Liquidar un adeudo completamente (pagar el monto pendiente)
 */
const liquidarAdeudo = async (req, res) => {
  try {
    const { id } = req.params;
    const { notas_pago } = req.body;

    const adeudo = await models.Adeudo_general.findByPk(id);

    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    if (adeudo.estado === 'pagado') {
      return res.status(400).json({
        success: false,
        message: 'Este adeudo ya está completamente pagado'
      });
    }

    const montoOriginal = parseFloat(adeudo.monto_original || adeudo.monto);
    const montoPendiente = montoOriginal - parseFloat(adeudo.monto_pagado);

    // Actualizar notas
    let notasActualizadas = adeudo.notas || '';
    const fechaActual = new Date().toLocaleDateString('es-MX');
    const nuevaNota = `\n[${fechaActual}] Liquidación completa: $${montoPendiente.toFixed(2)}${notas_pago ? ' - ' + notas_pago : ''}`;
    notasActualizadas += nuevaNota;

    // Liquidar completamente
    await adeudo.update({
      monto_pagado: montoOriginal,
      monto_pendiente: 0,
      monto: 0,
      estado: 'pagado',
      fecha_pago: new Date(),
      notas: notasActualizadas
    });

    // Obtener el adeudo actualizado con las relaciones
    const adeudoActualizado = await models.Adeudo_general.findByPk(id, {
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: adeudoActualizado,
      message: 'Adeudo liquidado completamente'
    });
  } catch (error) {
    console.error('Error liquidando adeudo:', error);
    res.status(500).json({
      success: false,
      message: 'Error al liquidar adeudo',
      error: error.message
    });
  }
};

/**
 * Marcar un adeudo como pagado/liquidado (legacy - mantener compatibilidad)
 */
const marcarComoPagado = async (req, res) => {
  // Redirigir a liquidarAdeudo
  return liquidarAdeudo(req, res);
};

/**
 * Eliminar un adeudo general
 */
const eliminarAdeudoGeneral = async (req, res) => {
  try {
    const { id } = req.params;

    const adeudo = await models.Adeudo_general.findByPk(id);

    if (!adeudo) {
      return res.status(404).json({
        success: false,
        message: 'Adeudo no encontrado'
      });
    }

    await adeudo.destroy();

    res.json({
      success: true,
      message: 'Adeudo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando adeudo general:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar adeudo general',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de adeudos generales
 */
const getEstadisticas = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Contar adeudos por tipo y estado
    const [
      totalNosDeben,
      totalDebemos,
      totalPendientes,
      totalPagados
    ] = await Promise.all([
      models.Adeudo_general.count({ where: { tipo_adeudo: 'nos_deben' } }),
      models.Adeudo_general.count({ where: { tipo_adeudo: 'debemos' } }),
      models.Adeudo_general.count({ where: { estado: 'pendiente' } }),
      models.Adeudo_general.count({ where: { estado: 'pagado' } })
    ]);

    // Calcular montos totales pendientes (incluye parciales)
    const adeudosPendientes = await models.Adeudo_general.findAll({
      where: { 
        estado: {
          [Op.in]: ['pendiente', 'parcial']
        }
      },
      attributes: ['tipo_adeudo', 'monto_pendiente', 'monto']
    });

    const montoNosDeben = adeudosPendientes
      .filter(a => a.tipo_adeudo === 'nos_deben')
      .reduce((sum, a) => sum + parseFloat(a.monto_pendiente || a.monto), 0);

    const montoDebemos = adeudosPendientes
      .filter(a => a.tipo_adeudo === 'debemos')
      .reduce((sum, a) => sum + parseFloat(a.monto_pendiente || a.monto), 0);

    // Contar adeudos parciales
    const totalParciales = await models.Adeudo_general.count({ where: { estado: 'parcial' } });

    // Calcular total pagado con filtro de fechas
    const whereClausePagado = {
      monto_pagado: {
        [Op.gt]: 0
      }
    };

    // Aplicar filtro de fechas si se proporcionan
    if (fecha_inicio && fecha_fin) {
      whereClausePagado.updatedAt = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin + 'T23:59:59.999Z')]
      };
    }

    const adeudosConPagos = await models.Adeudo_general.findAll({
      where: whereClausePagado,
      attributes: ['monto_pagado', 'updatedAt']
    });

    const totalPagado = adeudosConPagos.reduce((sum, a) => sum + parseFloat(a.monto_pagado || 0), 0);

    res.json({
      success: true,
      data: {
        conteo: {
          totalNosDeben,
          totalDebemos,
          totalPendientes,
          totalParciales,
          totalPagados,
          total: totalNosDeben + totalDebemos
        },
        montos: {
          montoNosDeben,
          montoDebemos,
          totalPagado
        },
        filtros: {
          fecha_inicio: fecha_inicio || null,
          fecha_fin: fecha_fin || null
        }
      }
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Obtener adeudos próximos a vencer (con alertas activas)
 */
const getAdeudosConAlertas = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // Calcular fecha límite (3 días atrás para incluir vencidos recientes)
    const hace3Dias = new Date(hoy);
    hace3Dias.setDate(hoy.getDate() - 3);

    // Obtener adeudos no pagados con fecha de vencimiento
    const adeudos = await models.Adeudo_general.findAll({
      where: {
        estado: {
          [Op.in]: ['pendiente', 'parcial']
        },
        fecha_vencimiento: {
          [Op.not]: null,
          [Op.gte]: hace3Dias // Incluye vencidos hasta 3 días atrás
        }
      },
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ],
      order: [['fecha_vencimiento', 'ASC']]
    });

    // Filtrar solo los que deben alertar hoy y agregar información de alerta
    const adeudosConAlertas = adeudos
      .filter(adeudo => debeAlertarHoy(adeudo.fecha_vencimiento, adeudo.estado))
      .map(adeudo => {
        const diasRestantes = calcularDiasRestantes(adeudo.fecha_vencimiento);
        const nivelUrgencia = obtenerNivelUrgencia(adeudo.fecha_vencimiento, adeudo.estado);
        const mensajeAlerta = obtenerMensajeAlerta(diasRestantes);

        // Calcular monto_pendiente si es null o undefined
        const adeudoJSON = adeudo.toJSON();
        const montoPendiente = adeudoJSON.monto_pendiente !== null && adeudoJSON.monto_pendiente !== undefined
          ? parseFloat(adeudoJSON.monto_pendiente)
          : parseFloat(adeudoJSON.monto_original || adeudoJSON.monto || 0) - parseFloat(adeudoJSON.monto_pagado || 0);

        return {
          ...adeudoJSON,
          monto_pendiente: montoPendiente,
          alerta: {
            diasRestantes,
            nivelUrgencia,
            mensaje: mensajeAlerta
          }
        };
      });

    res.json({
      success: true,
      data: adeudosConAlertas,
      count: adeudosConAlertas.length
    });
  } catch (error) {
    console.error('Error obteniendo adeudos con alertas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudos con alertas',
      error: error.message
    });
  }
};

/**
 * Obtener todos los adeudos próximos a vencer (7 días)
 */
const getAdeudosProximosVencer = async (req, res) => {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const en7Dias = new Date(hoy);
    en7Dias.setDate(en7Dias.getDate() + 7);

    const adeudos = await models.Adeudo_general.findAll({
      where: {
        estado: {
          [Op.in]: ['pendiente', 'parcial']
        },
        fecha_vencimiento: {
          [Op.not]: null,
          [Op.between]: [hoy, en7Dias]
        }
      },
      include: [
        {
          model: models.Usuarios,
          as: 'usuario_registro',
          attributes: ['id_usuario', ['nombre_usuario', 'nombre'], 'email']
        }
      ],
      order: [['fecha_vencimiento', 'ASC']]
    });

    // Agregar información de alerta a cada adeudo
    const adeudosConInfo = adeudos.map(adeudo => {
      const diasRestantes = calcularDiasRestantes(adeudo.fecha_vencimiento);
      const nivelUrgencia = obtenerNivelUrgencia(adeudo.fecha_vencimiento, adeudo.estado);
      const mensajeAlerta = obtenerMensajeAlerta(diasRestantes);

      return {
        ...adeudo.toJSON(),
        alerta: {
          diasRestantes,
          nivelUrgencia,
          mensaje: mensajeAlerta
        }
      };
    });

    res.json({
      success: true,
      data: adeudosConInfo,
      count: adeudosConInfo.length
    });
  } catch (error) {
    console.error('Error obteniendo adeudos próximos a vencer:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener adeudos próximos a vencer',
      error: error.message
    });
  }
};

module.exports = {
  getAdeudosGenerales,
  getAdeudoGeneralById,
  crearAdeudoGeneral,
  actualizarAdeudoGeneral,
  registrarPagoParcial,
  liquidarAdeudo,
  marcarComoPagado,
  eliminarAdeudoGeneral,
  getEstadisticas,
  getAdeudosConAlertas,
  getAdeudosProximosVencer
};
