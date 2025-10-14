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

      // Debug: Log de los datos que se devuelven
      console.log('🔍 Datos de herramienta devueltos:', {
        id: herramienta.id_herramienta,
        nombre: herramienta.nombre,
        stock: herramienta.stock,
        stock_inicial: herramienta.stock_inicial,
        rawData: herramienta.dataValues
      });

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

      // Debug: Log de los datos recibidos
      console.log('🔍 Datos recibidos para actualizar herramienta:', {
        id,
        herramientaData,
        stock_inicial: herramientaData.stock_inicial,
        stock: herramientaData.stock
      });

      const herramienta = await models.herramientas.findByPk(id);
      
      if (!herramienta) {
        return res.status(404).json({
          success: false,
          message: 'Herramienta no encontrada'
        });
      }

      // Debug: Log de los datos antes de actualizar
      console.log('🔍 Datos actuales de la herramienta:', {
        id_herramienta: herramienta.id_herramienta,
        stock_inicial_actual: herramienta.stock_inicial,
        stock_actual: herramienta.stock
      });

      await herramienta.update(herramientaData);

      // Debug: Log de los datos después de actualizar
      await herramienta.reload();
      console.log('🔍 Datos después de actualizar:', {
        id_herramienta: herramienta.id_herramienta,
        stock_inicial_nuevo: herramienta.stock_inicial,
        stock_nuevo: herramienta.stock
      });
      
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
      const movimientos = await models.movimientos_herramienta.count({
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

      const movimientos = await models.movimientos_herramienta.findAndCountAll({
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

      // Crear el movimiento con campos detallados
      const nuevoMovimiento = await models.movimientos_herramienta.create({
        ...movimientoData,
        fecha_movimiento: new Date(),
        // Campos adicionales para información detallada
        razon_movimiento: movimientoData.razon_movimiento || null,
        detalle_adicional: movimientoData.detalle_adicional || null,
        usuario_receptor: movimientoData.usuario_receptor || null,
        fecha_devolucion_esperada: movimientoData.fecha_devolucion_esperada || null,
        estado_movimiento: movimientoData.estado_movimiento || 'activo'
      });

      // Actualizar stock según el tipo de movimiento
      const cantidad = parseInt(movimientoData.cantidad);
      let nuevoStock = herramienta.stock;

      switch (movimientoData.tipo_movimiento) {
        case 'Entrada':
          nuevoStock += cantidad;
          // Para entradas, también actualizar el stock inicial
          const nuevoStockInicial = herramienta.stock_inicial + cantidad;
          await herramienta.update({ 
            stock: nuevoStock,
            stock_inicial: nuevoStockInicial
          });
          break;
        case 'Salida':
          if (nuevoStock < cantidad) {
            return res.status(400).json({
              success: false,
              message: 'Stock insuficiente para realizar la salida'
            });
          }
          nuevoStock -= cantidad;
          // Al hacer una salida, asignar la herramienta al proyecto
          const updateData = { stock: nuevoStock };
          if (movimientoData.id_proyecto) {
            updateData.id_proyecto = movimientoData.id_proyecto;
            updateData.estado = 2; // Cambiar estado a "En uso"
          }
          await herramienta.update(updateData);
          break;
        case 'Devolucion':
          // Devolver herramienta de un proyecto
          nuevoStock += cantidad;
          await herramienta.update({ 
            stock: nuevoStock,
            id_proyecto: null, // Quitar asignación de proyecto
            estado: 1 // Cambiar estado a "Disponible"
          });
          break;
        case 'Baja':
          if (nuevoStock < cantidad) {
            return res.status(400).json({
              success: false,
              message: 'Stock insuficiente para dar de baja'
            });
          }
          nuevoStock -= cantidad;
          await herramienta.update({ stock: nuevoStock });
          break;
      }

      // Obtener el movimiento creado con relaciones
      const movimientoCompleto = await models.movimientos_herramienta.findByPk(nuevoMovimiento.id_movimiento, {
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
        where: require('sequelize').literal('stock <= 5'),
        include: [
          {
            model: models.Categorias_herramienta,
            foreignKey: 'id_categoria_herr',
            attributes: ['id_categoria_herr', 'nombre', 'descripcion']
          }
        ],
        order: [['stock', 'ASC']]
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
      
      // Debug logs detallados
      console.log('🔍 Upload image request - inicio:', {
        id,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        method: req.method,
        url: req.url,
        hasBody: !!req.body,
        bodySize: req.body ? Object.keys(req.body).length : 0,
        hasFile: !!req.file,
        hasFiles: !!req.files,
        fileInfo: req.file ? {
          fieldname: req.file.fieldname,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        } : null
      });
      
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
        console.log('❌ No file received - detalle completo:', {
          reqFile: req.file,
          reqFiles: req.files,
          bodyKeys: req.body ? Object.keys(req.body) : [],
          contentType: req.headers['content-type'],
          contentLength: req.headers['content-length'],
          allHeaders: req.headers
        });
        return res.status(400).json({
          success: false,
          message: 'No se proporcionó ningún archivo'
        });
      }

      console.log('✅ File received successfully:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      });

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
  },

  // Eliminar historial de movimientos de una herramienta
  async deleteHistorialMovimientos(req, res) {
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

      // Eliminar todos los movimientos de la herramienta
      const movimientosEliminados = await models.movimientos_herramienta.destroy({
        where: {
          id_herramienta: id
        }
      });

      res.json({
        success: true,
        message: `Historial de movimientos eliminado exitosamente. ${movimientosEliminados} registros eliminados.`,
        data: {
          herramienta_id: id,
          movimientos_eliminados: movimientosEliminados
        }
      });
    } catch (error) {
      console.error('Error al eliminar historial de movimientos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  },

  // Actualizar estado de un movimiento específico
  async updateEstadoMovimiento(req, res) {
    try {
      const { id } = req.params;
      const { estado_movimiento } = req.body;

      if (!['activo', 'completado', 'cancelado'].includes(estado_movimiento)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de movimiento inválido. Debe ser: activo, completado o cancelado'
        });
      }

      const movimiento = await models.movimientos_herramienta.findByPk(id);
      if (!movimiento) {
        return res.status(404).json({
          success: false,
          message: 'Movimiento no encontrado'
        });
      }

      await movimiento.update({ estado_movimiento });

      res.json({
        success: true,
        message: 'Estado del movimiento actualizado exitosamente',
        data: movimiento
      });
    } catch (error) {
      console.error('Error al actualizar estado del movimiento:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
};

module.exports = herramientasController;