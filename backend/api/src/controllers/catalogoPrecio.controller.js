const { CatalogoPrecio, CatalogoPrecioDetalle, ConceptoObra } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { Op } = require('sequelize');

class CatalogoPrecioController {
  // GET /api/catalogos - Listar catálogos con filtros
  static async index(req, res) {
    try {
      const {
        page = 1,
        limit = 25,
        tipo_catalogo,
        region,
        estado = 'activo',
        es_publico,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Aplicar filtros
      if (tipo_catalogo) where.tipo_catalogo = tipo_catalogo;
      if (region) where.region = region;
      if (estado) where.estado = estado;
      if (es_publico !== undefined) where.es_publico = es_publico === 'true';

      if (search) {
        where[Op.or] = [
          { nombre_catalogo: { [Op.like]: `%${search}%` } },
          { descripcion: { [Op.like]: `%${search}%` } },
          { region: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows } = await CatalogoPrecio.findAndCountAll({
        where,
        include: [
          {
            model: CatalogoPrecioDetalle,
            as: 'Detalles',
            attributes: ['id_detalle'],
            required: false
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['nombre_catalogo', 'ASC']],
        distinct: true
      });

      // Agregar conteo de precios y estadísticas a cada catálogo
      const catalogosConEstadisticas = await Promise.all(
        rows.map(async (catalogo) => {
          const catalogoJson = catalogo.toJSON();
          catalogoJson.total_precios = catalogo.Detalles ? catalogo.Detalles.length : 0;
          
          if (catalogoJson.total_precios > 0) {
            const estadisticas = await catalogo.getEstadisticas();
            catalogoJson.estadisticas = estadisticas;
          }
          
          delete catalogoJson.Detalles;
          return catalogoJson;
        })
      );

      res.json({
        success: true,
        data: {
          catalogos: catalogosConEstadisticas,
          pagination: {
            total: count,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(count / limit)
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener catálogos',
        error: error.message
      });
    }
  }

  // GET /api/catalogos/vigentes - Obtener catálogos vigentes
  static async vigentes(req, res) {
    try {
      const { region } = req.query;

      const catalogos = await CatalogoPrecio.findVigentes(region);

      res.json({
        success: true,
        data: catalogos
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener catálogos vigentes',
        error: error.message
      });
    }
  }

  // GET /api/catalogos/regiones - Obtener regiones disponibles
  static async regiones(req, res) {
    try {
      const regiones = await CatalogoPrecio.findAll({
        attributes: [
          'region',
          [CatalogoPrecio.sequelize.fn('COUNT', CatalogoPrecio.sequelize.col('id_catalogo')), 'total_catalogos']
        ],
        where: {
          region: { [Op.ne]: null },
          estado: 'activo'
        },
        group: ['region'],
        order: [['region', 'ASC']]
      });

      res.json({
        success: true,
        data: regiones
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener regiones',
        error: error.message
      });
    }
  }

  // GET /api/catalogos/:id - Obtener catálogo específico
  static async show(req, res) {
    try {
      const { id } = req.params;
      const { incluir_precios = false, solo_vigentes = false } = req.query;

      const include = [];

      if (incluir_precios === 'true') {
        const detalleWhere = {};
        
        if (solo_vigentes === 'true') {
          detalleWhere.vigente_desde = { [Op.lte]: new Date() };
          detalleWhere[Op.or] = [
            { vigente_hasta: null },
            { vigente_hasta: { [Op.gte]: new Date() } }
          ];
        }

        include.push({
          model: CatalogoPrecioDetalle,
          as: 'Detalles',
          where: detalleWhere,
          include: [{
            model: ConceptoObra,
            as: 'Concepto',
            attributes: ['codigo', 'nombre', 'descripcion', 'unidad', 'categoria']
          }],
          required: false,
          order: [['Concepto', 'categoria', 'ASC'], ['Concepto', 'nombre', 'ASC']]
        });
      }

      const catalogo = await CatalogoPrecio.findByPk(id, { include });

      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      // Agregar estadísticas
      const estadisticas = await catalogo.getEstadisticas();

      res.json({
        success: true,
        data: {
          ...catalogo.toJSON(),
          estadisticas
        }
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al obtener catálogo',
          error: error.message
        });
      }
    }
  }

  // POST /api/catalogos - Crear nuevo catálogo
  static async store(req, res) {
    try {
      const {
        nombre_catalogo,
        descripcion,
        tipo_catalogo,
        region,
        ciudad,
        fecha_inicio_vigencia,
        fecha_fin_vigencia,
        base_calculo,
        incluye_indirectos,
        porcentaje_indirectos,
        incluye_utilidad,
        porcentaje_utilidad,
        es_publico,
        cliente_id,
        observaciones,
        configuracion
      } = req.body;

      // Validaciones básicas
      if (!nombre_catalogo || !fecha_inicio_vigencia) {
        throw new ValidationError('Campos obligatorios: nombre del catálogo, fecha de inicio de vigencia');
      }

      const nuevoCatalogo = await CatalogoPrecio.create({
        nombre_catalogo,
        descripcion,
        tipo_catalogo: tipo_catalogo || 'general',
        region,
        ciudad,
        fecha_inicio_vigencia,
        fecha_fin_vigencia,
        base_calculo: base_calculo || 'precios_mercado',
        incluye_indirectos: incluye_indirectos || false,
        porcentaje_indirectos,
        incluye_utilidad: incluye_utilidad || false,
        porcentaje_utilidad,
        es_publico: es_publico !== undefined ? es_publico : true,
        cliente_id,
        observaciones,
        configuracion,
        creado_por: req.user.id_usuario
      });

      res.status(201).json({
        success: true,
        message: 'Catálogo creado exitosamente',
        data: nuevoCatalogo
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al crear catálogo',
          error: error.message
        });
      }
    }
  }

  // PUT /api/catalogos/:id - Actualizar catálogo
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const catalogo = await CatalogoPrecio.findByPk(id);
      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      if (!catalogo.puedeEditar()) {
        throw new ValidationError('El catálogo no puede editarse en su estado actual');
      }

      await catalogo.update(updateData);

      res.json({
        success: true,
        message: 'Catálogo actualizado exitosamente',
        data: catalogo
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al actualizar catálogo',
          error: error.message
        });
      }
    }
  }

  // POST /api/catalogos/:id/duplicar - Duplicar catálogo
  static async duplicar(req, res) {
    try {
      const { id } = req.params;
      const { nuevo_nombre, copiar_precios = true } = req.body;

      const catalogo = await CatalogoPrecio.findByPk(id, {
        include: [{
          model: CatalogoPrecioDetalle,
          as: 'Detalles'
        }]
      });

      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      const transaction = await CatalogoPrecio.sequelize.transaction();

      try {
        // Duplicar catálogo
        const nuevoCatalogo = await catalogo.duplicar(nuevo_nombre);
        nuevoCatalogo.creado_por = req.user.id_usuario;
        await nuevoCatalogo.save({ transaction });

        // Duplicar precios si se solicita
        if (copiar_precios && catalogo.Detalles.length > 0) {
          for (const detalle of catalogo.Detalles) {
            const nuevoDetalle = {
              ...detalle.toJSON(),
              id_detalle: undefined,
              id_catalogo: nuevoCatalogo.id_catalogo,
              actualizado_por: req.user.id_usuario,
              createdAt: undefined,
              updatedAt: undefined
            };
            
            await CatalogoPrecioDetalle.create(nuevoDetalle, { transaction });
          }
        }

        await transaction.commit();

        res.status(201).json({
          success: true,
          message: 'Catálogo duplicado exitosamente',
          data: nuevoCatalogo
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al duplicar catálogo',
          error: error.message
        });
      }
    }
  }

  // POST /api/catalogos/:id/actualizar-factor - Aplicar factor de actualización
  static async actualizarFactor(req, res) {
    try {
      const { id } = req.params;
      const { factor_actualizacion } = req.body;

      if (!factor_actualizacion || factor_actualizacion <= 0) {
        throw new ValidationError('El factor de actualización debe ser mayor a 0');
      }

      const catalogo = await CatalogoPrecio.findByPk(id);
      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      if (!catalogo.puedeEditar()) {
        throw new ValidationError('El catálogo no puede editarse en su estado actual');
      }

      await catalogo.aplicarFactorActualizacion(factor_actualizacion);

      res.json({
        success: true,
        message: `Factor de actualización ${factor_actualizacion} aplicado exitosamente`,
        data: catalogo
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al aplicar factor de actualización',
          error: error.message
        });
      }
    }
  }

  // PUT /api/catalogos/:id/estado - Cambiar estado del catálogo
  static async cambiarEstado(req, res) {
    try {
      const { id } = req.params;
      const { nuevo_estado } = req.body;

      if (!nuevo_estado) {
        throw new ValidationError('El nuevo estado es obligatorio');
      }

      const catalogo = await CatalogoPrecio.findByPk(id);
      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      const estadosValidos = ['borrador', 'activo', 'suspendido', 'obsoleto'];
      if (!estadosValidos.includes(nuevo_estado)) {
        throw new ValidationError('Estado no válido');
      }

      const updateData = { estado: nuevo_estado };

      // Si se activa, registrar usuario y fecha de aprobación
      if (nuevo_estado === 'activo') {
        updateData.aprobado_por = req.user.id_usuario;
        updateData.fecha_aprobacion = new Date();
      }

      await catalogo.update(updateData);

      res.json({
        success: true,
        message: `Catálogo ${nuevo_estado} exitosamente`,
        data: catalogo
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al cambiar estado',
          error: error.message
        });
      }
    }
  }

  // DELETE /api/catalogos/:id - Eliminar catálogo
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      const catalogo = await CatalogoPrecio.findByPk(id);
      if (!catalogo) {
        throw new NotFoundError('Catálogo no encontrado');
      }

      // Solo se pueden eliminar catálogos en borrador
      if (catalogo.estado !== 'borrador') {
        throw new ValidationError('Solo se pueden eliminar catálogos en borrador');
      }

      await catalogo.destroy();

      res.json({
        success: true,
        message: 'Catálogo eliminado exitosamente'
      });
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof ValidationError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error al eliminar catálogo',
          error: error.message
        });
      }
    }
  }
}

module.exports = CatalogoPrecioController;