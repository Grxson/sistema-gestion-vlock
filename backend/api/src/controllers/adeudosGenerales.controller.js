const models = require('../models');
const { Op } = require('sequelize');

/**
 * Obtener todos los adeudos generales con filtros opcionales
 */
const getAdeudosGenerales = async (req, res) => {
  try {
    const { tipo, estado } = req.query;
    
    const whereClause = {};
    
    // Filtrar por tipo si se proporciona
    if (tipo && ['nos_deben', 'debemos'].includes(tipo)) {
      whereClause.tipo_adeudo = tipo;
    }
    
    // Filtrar por estado si se proporciona
    if (estado && ['pendiente', 'pagado'].includes(estado)) {
      whereClause.estado = estado;
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
    const { nombre_entidad, tipo_adeudo, monto, notas } = req.body;
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

    const nuevoAdeudo = await models.Adeudo_general.create({
      nombre_entidad: nombre_entidad.trim(),
      tipo_adeudo,
      monto: parseFloat(monto),
      estado: 'pendiente',
      fecha_registro: new Date(),
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
    const { nombre_entidad, tipo_adeudo, monto, notas } = req.body;

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
 * Marcar un adeudo como pagado/liquidado
 */
const marcarComoPagado = async (req, res) => {
  try {
    const { id } = req.params;

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
        message: 'Este adeudo ya está marcado como pagado'
      });
    }

    await adeudo.update({
      estado: 'pagado',
      fecha_pago: new Date()
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
      message: 'Adeudo marcado como pagado exitosamente'
    });
  } catch (error) {
    console.error('Error marcando adeudo como pagado:', error);
    res.status(500).json({
      success: false,
      message: 'Error al marcar adeudo como pagado',
      error: error.message
    });
  }
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

    // Calcular montos totales pendientes
    const adeudosPendientes = await models.Adeudo_general.findAll({
      where: { estado: 'pendiente' },
      attributes: ['tipo_adeudo', 'monto']
    });

    const montoNosDeben = adeudosPendientes
      .filter(a => a.tipo_adeudo === 'nos_deben')
      .reduce((sum, a) => sum + parseFloat(a.monto), 0);

    const montoDebemos = adeudosPendientes
      .filter(a => a.tipo_adeudo === 'debemos')
      .reduce((sum, a) => sum + parseFloat(a.monto), 0);

    res.json({
      success: true,
      data: {
        conteo: {
          totalNosDeben,
          totalDebemos,
          totalPendientes,
          totalPagados,
          total: totalNosDeben + totalDebemos
        },
        montos: {
          montoNosDeben,
          montoDebemos,
          balance: montoNosDeben - montoDebemos
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

module.exports = {
  getAdeudosGenerales,
  getAdeudoGeneralById,
  crearAdeudoGeneral,
  actualizarAdeudoGeneral,
  marcarComoPagado,
  eliminarAdeudoGeneral,
  getEstadisticas
};
