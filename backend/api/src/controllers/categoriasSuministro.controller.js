const { Categorias_suministro } = require('../models');

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const categorias = await Categorias_suministro.findAll({
      where: { activo: true },
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías de suministros'
    });
  }
};

// Obtener todas las categorías (incluyendo inactivas) - para administración
const getAllCategorias = async (req, res) => {
  try {
    const categorias = await Categorias_suministro.findAll({
      order: [['orden', 'ASC'], ['nombre', 'ASC']]
    });

    res.json({
      success: true,
      data: categorias
    });
  } catch (error) {
    console.error('Error al obtener todas las categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las categorías de suministros'
    });
  }
};

// Crear nueva categoría
const createCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, color, orden } = req.body;

    if (!nombre) {
      return res.status(400).json({
        success: false,
        message: 'El nombre de la categoría es requerido'
      });
    }

    const categoria = await Categorias_suministro.create({
      nombre,
      descripcion,
      color,
      orden
    });

    res.status(201).json({
      success: true,
      data: categoria,
      message: 'Categoría creada exitosamente'
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al crear la categoría'
    });
  }
};

// Actualizar categoría
const updateCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, color, orden, activo } = req.body;

    const categoria = await Categorias_suministro.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    await categoria.update({
      nombre,
      descripcion,
      color,
      orden,
      activo
    });

    res.json({
      success: true,
      data: categoria,
      message: 'Categoría actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe una categoría con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error al actualizar la categoría'
    });
  }
};

// Eliminar (desactivar) categoría
const deleteCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    const categoria = await Categorias_suministro.findByPk(id);
    if (!categoria) {
      return res.status(404).json({
        success: false,
        message: 'Categoría no encontrada'
      });
    }

    // Verificar si hay suministros usando esta categoría
    const { Suministros } = require('../models');
    const suministrosCount = await Suministros.count({
      where: { id_categoria_suministro: id }
    });

    if (suministrosCount > 0) {
      // Solo desactivar, no eliminar
      await categoria.update({ activo: false });
      return res.json({
        success: true,
        message: `Categoría desactivada. Hay ${suministrosCount} suministros usando esta categoría.`
      });
    }

    // Si no hay suministros, eliminar completamente
    await categoria.destroy();
    res.json({
      success: true,
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la categoría'
    });
  }
};

// Reordenar categorías
const reorderCategorias = async (req, res) => {
  try {
    const { categorias } = req.body; // Array de { id, orden }

    if (!Array.isArray(categorias)) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de categorías con sus nuevos órdenes'
      });
    }

    // Actualizar el orden de cada categoría
    for (const item of categorias) {
      await Categorias_suministro.update(
        { orden: item.orden },
        { where: { id_categoria: item.id } }
      );
    }

    res.json({
      success: true,
      message: 'Orden de categorías actualizado exitosamente'
    });
  } catch (error) {
    console.error('Error al reordenar categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error al reordenar las categorías'
    });
  }
};

module.exports = {
  getCategorias,
  getAllCategorias,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  reorderCategorias
};
