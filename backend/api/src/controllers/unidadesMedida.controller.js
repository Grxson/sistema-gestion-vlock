const { Unidades_medida } = require('../models');

// Obtener todas las unidades de medida
const getUnidades = async (req, res) => {
  try {
    const unidades = await Unidades_medida.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: unidades
    });
  } catch (error) {
    console.error('Error al obtener unidades de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las unidades de medida'
    });
  }
};

// Obtener todas las unidades (incluyendo inactivas) - para administración
const getAllUnidades = async (req, res) => {
  try {
    const unidades = await Unidades_medida.findAll({
      order: [['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: unidades
    });
  } catch (error) {
    console.error('Error al obtener todas las unidades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las unidades de medida'
    });
  }
};

// Crear nueva unidad de medida
const createUnidad = async (req, res) => {
  try {
    const { nombre, simbolo, descripcion } = req.body;

    if (!nombre || !simbolo) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y símbolo de la unidad son requeridos'
      });
    }

    const unidad = await Unidades_medida.create({
      nombre,
      simbolo,
      descripcion
    });

    res.status(201).json({
      success: true,
      data: unidad,
      message: 'Unidad de medida creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear unidad de medida:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una unidad con ese nombre o símbolo'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear la unidad de medida'
    });
  }
};

// Actualizar unidad de medida
const updateUnidad = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, simbolo, descripcion, activo } = req.body;

    const unidad = await Unidades_medida.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
    }

    await unidad.update({
      nombre,
      simbolo,
      descripcion,
      activo
    });

    res.json({
      success: true,
      data: unidad,
      message: 'Unidad de medida actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar unidad de medida:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una unidad con ese nombre o símbolo'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar la unidad de medida'
    });
  }
};

// Eliminar (desactivar) unidad de medida
const deleteUnidad = async (req, res) => {
  try {
    const { id } = req.params;

    const unidad = await Unidades_medida.findByPk(id);
    if (!unidad) {
      return res.status(404).json({
        success: false,
        message: 'Unidad de medida no encontrada'
      });
    }

    // Verificar si hay suministros usando esta unidad
    const { Suministros } = require('../models');
    const suministrosCount = await Suministros.count({
      where: { unidad_medida: unidad.simbolo }
    });

    if (suministrosCount > 0) {
      // Solo desactivar, no eliminar
      await unidad.update({ activo: false });
      return res.json({
        success: true,
        message: `Unidad desactivada. Hay ${suministrosCount} suministros usando esta unidad.`
      });
    }

    // Si no hay suministros, eliminar completamente
    await unidad.destroy();
    res.json({
      success: true,
      message: 'Unidad de medida eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar unidad de medida:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la unidad de medida'
    });
  }
};

module.exports = {
  getUnidades,
  getAllUnidades,
  createUnidad,
  updateUnidad,
  deleteUnidad
};
