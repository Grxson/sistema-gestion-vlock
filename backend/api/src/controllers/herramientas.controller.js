const models = require('../models');
const { Op } = require('sequelize');

const herramientasController = {
  // Obtener todas las categorías de herramientas
  async getCategorias(req, res) {
    try {
      const categorias = await models.Categorias_herramienta.findAll({
        order: [['nombre', 'ASC']]
      });
      
      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      console.error('Error al obtener categorías de herramientas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener todas las herramientas con paginación y filtros
  async getHerramientas(req, res) {
    try {
      const { page = 1, limit = 10, categoria, search, stock_bajo, estado, proyecto } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = {};
      
      // Filtro por categoría
      if (categoria) {
        whereClause.id_categoria_herr = categoria;
      }

      // Filtro por estado
      if (estado) {
        whereClause.estado = estado;
      }

      // Filtro por proyecto
      if (proyecto) {
        whereClause.id_proyecto = proyecto;
      }

      // Filtro por búsqueda en nombre, marca o serial
      if (search) {
        whereClause[Op.or] = [
          { nombre: { [Op.like]: `%${search}%` } },
          { marca: { [Op.like]: `%${search}%` } },
          { serial: { [Op.like]: `%${search}%` } }
        ];
      }

      // Filtro por stock bajo  
      if (stock_bajo === 'true') {
        whereClause = {
          ...whereClause,
          stock: {
            [Op.lte]: 5 // Stock bajo si tiene 5 o menos
          }
        };
      }

      const herramientas = await models.herramientas.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          },
          {
            model: models.proyectos,
            foreignKey: 'id_proyecto',
            attributes: ['id_proyecto', 'nombre'],
            required: false // LEFT JOIN para proyectos opcionales
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre', 'ASC']]
      });

      res.json({
        success: true,
        data: herramientas.rows,
        pagination: {
          total: herramientas.count,
          totalPages: Math.ceil(herramientas.count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener herramientas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener herramienta por ID
  async getHerramientaById(req, res) {
    try {
      const { id } = req.params;
      
      const herramienta = await models.herramientas.findByPk(id, {
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          }
        ]
      });

      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      res.json({
        success: true,
        data: herramienta
      });
    } catch (error) {
      console.error('Error al obtener herramienta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear nueva herramienta
  async createHerramienta(req, res) {
    try {
      const herramientaData = req.body;
      
      // Validaciones básicas
      if (!herramientaData.nombre || !herramientaData.id_categoria_herr) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y categoría son requeridos'
        });
      }

      const nuevaHerramienta = await models.herramientas.create(herramientaData);
      
      // Obtener la herramienta creada con su categoría
      const herramientaCompleta = await models.herramientas.findByPk(nuevaHerramienta.id_herramienta, {
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Herramienta creada exitosamente',
        data: herramientaCompleta
      });
    } catch (error) {
      console.error('Error al crear herramienta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar herramienta
  async updateHerramienta(req, res) {
    try {
      const { id } = req.params;
      const herramientaData = req.body;

      const herramienta = await models.herramientas.findByPk(id);
      
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      await herramienta.update(herramientaData);
      
      // Obtener la herramienta actualizada con su categoría
      const herramientaActualizada = await models.herramientas.findByPk(id, {
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          }
        ]
      });

      res.json({
        success: true,
        message: 'Herramienta actualizada exitosamente',
        data: herramientaActualizada
      });
    } catch (error) {
      console.error('Error al actualizar herramienta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Eliminar herramienta
  async deleteHerramienta(req, res) {
    try {
      const { id } = req.params;

      const herramienta = await models.herramientas.findByPk(id);
      
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      // Verificar si tiene movimientos asociados
      const movimientos = await models.Movimientos_herramienta.count({
        where: { id_herramienta: id }
      });

      if (movimientos > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede eliminar la herramienta porque tiene movimientos asociados'
        });
      }

      await herramienta.destroy();

      res.json({
        success: true,
        message: 'Herramienta eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar herramienta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener movimientos de una herramienta
  async getMovimientosHerramienta(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const movimientos = await models.Movimientos_herramienta.findAndCountAll({
        where: { id_herramienta: id },
        include: [
          {
            model: models.herramientas,
            foreignKey: 'id_herramienta',
            attributes: ['nombre']
          },
          {
            model: models.proyectos,
            foreignKey: 'id_proyecto',
            attributes: ['nombre']
          },
          {
            model: models.usuarios,
            foreignKey: 'id_usuario',
            attributes: ['nombre_usuario']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['fecha_movimiento', 'DESC']]
      });

      res.json({
        success: true,
        data: movimientos.rows,
        pagination: {
          total: movimientos.count,
          totalPages: Math.ceil(movimientos.count / limit),
          currentPage: parseInt(page),
          perPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error al obtener movimientos de herramienta:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Crear movimiento de herramienta
  async createMovimiento(req, res) {
    try {
      const movimientoData = req.body;
      
      // Validaciones
      if (!movimientoData.id_herramienta || !movimientoData.tipo_movimiento || !movimientoData.cantidad) {
        return res.status(400).json({
          success: false,
          message: 'Herramienta, tipo de movimiento y cantidad son requeridos'
        });
      }

      // Verificar que la herramienta existe
      const herramienta = await models.herramientas.findByPk(movimientoData.id_herramienta);
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      // Crear el movimiento
      const nuevoMovimiento = await models.Movimientos_herramienta.create({
        ...movimientoData,
        fecha_movimiento: new Date()
      });

      // Actualizar stock según el tipo de movimiento
      const cantidad = parseInt(movimientoData.cantidad);
      let nuevoStock = herramienta.stock_disponible;

      switch (movimientoData.tipo_movimiento) {
        case 'entrada':
          nuevoStock += cantidad;
          await herramienta.update({ 
            stock_disponible: nuevoStock,
            stock_total: herramienta.stock_total + cantidad
          });
          break;
        case 'salida':
          if (nuevoStock < cantidad) {
            return res.status(400).json({
              success: false,
              message: 'Stock insuficiente para realizar la salida'
            });
          }
          nuevoStock -= cantidad;
          await herramienta.update({ stock_disponible: nuevoStock });
          break;
        case 'baja':
          if (nuevoStock < cantidad) {
            return res.status(400).json({
              success: false,
              message: 'Stock insuficiente para dar de baja'
            });
          }
          nuevoStock -= cantidad;
          await herramienta.update({ 
            stock_disponible: nuevoStock,
            stock_total: herramienta.stock_total - cantidad
          });
          break;
      }

      // Obtener el movimiento creado con relaciones
      const movimientoCompleto = await models.Movimientos_herramienta.findByPk(nuevoMovimiento.id_movimiento, {
        include: [
          {
            model: models.herramientas,
            foreignKey: 'id_herramienta',
            attributes: ['nombre']
          },
          {
            model: models.proyectos,
            foreignKey: 'id_proyecto',
            attributes: ['nombre']
          },
          {
            model: models.usuarios,
            foreignKey: 'id_usuario',
            attributes: ['nombre_usuario']
          }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Movimiento registrado exitosamente',
        data: movimientoCompleto
      });
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Obtener herramientas con stock bajo
  async getStockBajo(req, res) {
    try {
      const herramientas = await models.herramientas.findAll({
        where: require('sequelize').literal('stock_disponible <= stock_minimo'),
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          }
        ],
        order: [['stock_disponible', 'ASC']]
      });

      res.json({
        success: true,
        data: herramientas
      });
    } catch (error) {
      console.error('Error al obtener herramientas con stock bajo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Subir imagen para herramienta
  async uploadImage(req, res) {
    try {
      const { id } = req.params;
      
      // Verificar que la herramienta existe
      const herramienta = await models.herramientas.findByPk(id);
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      // Verificar que se subió un archivo
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      // Construir la URL de la imagen
      const imageUrl = `/uploads/herramientas/${req.file.filename}`;
      
      // Eliminar imagen anterior si existe
      if (herramienta.image_url) {
        const fs = require('fs-extra');
        const path = require('path');
        const oldImagePath = path.join(__dirname, '../public', herramienta.image_url);
        try {
          await fs.remove(oldImagePath);
        } catch (error) {
          console.log('No se pudo eliminar la imagen anterior:', error.message);
        }
      }

      // Actualizar la herramienta con la nueva URL de imagen
      await herramienta.update({ image_url: imageUrl });

      res.json({
        success: true,
        message: 'Imagen subida exitosamente',
        data: {
          image_url: imageUrl,
          filename: req.file.filename
        }
      });
    } catch (error) {
      console.error('Error al subir imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Eliminar imagen de herramienta
  async deleteImage(req, res) {
    try {
      const { id } = req.params;
      
      const herramienta = await models.herramientas.findByPk(id);
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      if (!herramienta.image_url) {
        return res.status(400).json({
          success: false,
          message: 'La herramienta no tiene imagen para eliminar'
        });
      }

      // Eliminar archivo físico
      const fs = require('fs-extra');
      const path = require('path');
      const imagePath = path.join(__dirname, '../public', herramienta.image_url);
      
      try {
        await fs.remove(imagePath);
      } catch (error) {
        console.log('No se pudo eliminar el archivo físico:', error.message);
      }

      // Actualizar la herramienta para quitar la URL de imagen
      await herramienta.update({ image_url: null });

      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente'
      });
    } catch (error) {
      console.error('Error al eliminar imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = herramientasController;