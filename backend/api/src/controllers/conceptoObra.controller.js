const { ConceptoObra, PrecioUnitario, AnalisisCosto } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');

class ConceptoObraController {
  // GET /api/conceptos - Listar conceptos con filtros
  static async index(req, res) {
    try {
      const {
        page = 1,
        limit = 25,
        categoria,
        tipo_concepto,
        estado = 'activo',
        search,
        incluir_hijos = false
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Aplicar filtros
      if (categoria) where.categoria = categoria;
      if (tipo_concepto) where.tipo_concepto = tipo_concepto;
      if (estado) where.estado = estado;
      
      if (search) {
        where[Op.or] = [
          { codigo: { [Op.like]: `%${search}%` } },
          { nombre: { [Op.like]: `%${search}%` } },
          { descripcion: { [Op.like]: `%${search}%` } }
        ];
      }

      const include = [];
      
      if (incluir_hijos === 'true') {
        include.push({
          model: ConceptoObra,
          as: 'ConceptosHijos',
          required: false
        });
      }

      const { count, rows } = await ConceptoObra.findAndCountAll({
        where,
        include,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['categoria', 'ASC'], ['nombre', 'ASC']],
        distinct: true
      });

      res.json({
        success: true,
        data: {
          conceptos: rows,
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
        message: 'Error al obtener conceptos',
        error: error.message
      });
    }
  }

  // GET /api/conceptos/categorias - Obtener categorías únicas
  static async categorias(req, res) {
    try {
      const categorias = await ConceptoObra.findAll({
        attributes: [
          'categoria',
          [ConceptoObra.sequelize.fn('COUNT', ConceptoObra.sequelize.col('id_concepto')), 'total']
        ],
        where: { estado: 'activo' },
        group: ['categoria'],
        order: [['categoria', 'ASC']]
      });

      res.json({
        success: true,
        data: categorias
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener categorías',
        error: error.message
      });
    }
  }

  // GET /api/conceptos/:id - Obtener concepto específico
  static async show(req, res) {
    try {
      const { id } = req.params;
      const { incluir_precios = false, incluir_analisis = false } = req.query;

      const include = [
        {
          model: ConceptoObra,
          as: 'ConceptoPadre',
          required: false
        },
        {
          model: ConceptoObra,
          as: 'ConceptosHijos',
          required: false
        }
      ];

      if (incluir_precios === 'true') {
        include.push({
          model: PrecioUnitario,
          as: 'PreciosUnitarios',
          where: { estado: 'aprobado' },
          required: false,
          order: [['vigente_desde', 'DESC']]
        });
      }

      if (incluir_analisis === 'true') {
        include.push({
          model: AnalisisCosto,
          as: 'AnalisisCostos',
          where: { estado: 'aprobado' },
          required: false,
          order: [['fecha_analisis', 'DESC']]
        });
      }

      const concepto = await ConceptoObra.findByPk(id, { include });

      if (!concepto) {
        throw new NotFoundError('Concepto no encontrado');
      }

      res.json({
        success: true,
        data: concepto
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
          message: 'Error al obtener concepto',
          error: error.message
        });
      }
    }
  }

  // POST /api/conceptos - Crear nuevo concepto
  static async store(req, res) {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        unidad,
        categoria,
        subcategoria,
        precio_referencial,
        tipo_concepto,
        es_compuesto,
        concepto_padre_id,
        especificaciones_tecnicas,
        rendimiento_referencial,
        observaciones
      } = req.body;

      // Validaciones básicas
      if (!codigo || !nombre || !unidad || !categoria || !tipo_concepto) {
        throw new ValidationError('Campos obligatorios: código, nombre, unidad, categoría, tipo_concepto');
      }

      // Verificar que el código sea único
      const existeConcepto = await ConceptoObra.findOne({ where: { codigo } });
      if (existeConcepto) {
        throw new ValidationError('El código del concepto ya existe');
      }

      // Verificar concepto padre si se especifica
      if (concepto_padre_id) {
        const conceptoPadre = await ConceptoObra.findByPk(concepto_padre_id);
        if (!conceptoPadre) {
          throw new ValidationError('El concepto padre no existe');
        }
      }

      const nuevoConcepto = await ConceptoObra.create({
        codigo,
        nombre,
        descripcion,
        unidad,
        categoria,
        subcategoria,
        precio_referencial,
        tipo_concepto,
        es_compuesto: es_compuesto || false,
        concepto_padre_id,
        especificaciones_tecnicas,
        rendimiento_referencial,
        observaciones,
        creado_por: req.user.id_usuario
      });

      res.status(201).json({
        success: true,
        message: 'Concepto creado exitosamente',
        data: nuevoConcepto
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
          message: 'Error al crear concepto',
          error: error.message
        });
      }
    }
  }

  // PUT /api/conceptos/:id - Actualizar concepto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };
      updateData.actualizado_por = req.user.id_usuario;

      const concepto = await ConceptoObra.findByPk(id);
      if (!concepto) {
        throw new NotFoundError('Concepto no encontrado');
      }

      // Verificar código único si se está cambiando
      if (updateData.codigo && updateData.codigo !== concepto.codigo) {
        const existeConcepto = await ConceptoObra.findOne({ 
          where: { 
            codigo: updateData.codigo,
            id_concepto: { [Op.ne]: id }
          } 
        });
        if (existeConcepto) {
          throw new ValidationError('El código del concepto ya existe');
        }
      }

      await concepto.update(updateData);

      res.json({
        success: true,
        message: 'Concepto actualizado exitosamente',
        data: concepto
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
          message: 'Error al actualizar concepto',
          error: error.message
        });
      }
    }
  }

  // DELETE /api/conceptos/:id - Eliminar concepto (soft delete)
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      const concepto = await ConceptoObra.findByPk(id);
      if (!concepto) {
        throw new NotFoundError('Concepto no encontrado');
      }

      // Verificar si tiene conceptos hijos
      const tieneHijos = await ConceptoObra.count({ where: { concepto_padre_id: id } });
      if (tieneHijos > 0) {
        throw new ValidationError('No se puede eliminar un concepto que tiene conceptos hijos');
      }

      // Cambiar estado a inactivo en lugar de eliminar
      await concepto.update({ estado: 'obsoleto' });

      res.json({
        success: true,
        message: 'Concepto marcado como obsoleto exitosamente'
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
          message: 'Error al eliminar concepto',
          error: error.message
        });
      }
    }
  }

  // POST /api/conceptos/import - Importar conceptos masivamente
  static async importBatch(req, res) {
    try {
      const { conceptos } = req.body;

      if (!Array.isArray(conceptos) || conceptos.length === 0) {
        throw new ValidationError('Debe proporcionar un array de conceptos');
      }

      const transaction = await ConceptoObra.sequelize.transaction();
      const resultados = {
        exitosos: [],
        errores: []
      };

      try {
        for (const [index, conceptoData] of conceptos.entries()) {
          try {
            // Verificar campos obligatorios
            if (!conceptoData.codigo || !conceptoData.nombre) {
              throw new Error('Código y nombre son obligatorios');
            }

            // Verificar que el código sea único
            const existeConcepto = await ConceptoObra.findOne({ 
              where: { codigo: conceptoData.codigo },
              transaction
            });
            
            if (existeConcepto) {
              throw new Error('El código ya existe');
            }

            const nuevoConcepto = await ConceptoObra.create({
              ...conceptoData,
              creado_por: req.user.id_usuario
            }, { transaction });

            resultados.exitosos.push({
              index,
              concepto: nuevoConcepto,
              codigo: conceptoData.codigo
            });
          } catch (error) {
            resultados.errores.push({
              index,
              codigo: conceptoData.codigo,
              error: error.message
            });
          }
        }

        await transaction.commit();

        res.json({
          success: true,
          message: `Importación completada. ${resultados.exitosos.length} exitosos, ${resultados.errores.length} errores`,
          data: resultados
        });
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Error en la importación masiva',
          error: error.message
        });
      }
    }
  }
}

module.exports = ConceptoObraController;