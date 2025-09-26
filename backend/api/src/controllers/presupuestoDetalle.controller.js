const { PresupuestoDetalle, Presupuesto, ConceptoObra, PrecioUnitario } = require('../models');
const { ValidationError, NotFoundError } = require('../utils/errors');
const { Op } = require('sequelize');

class PresupuestoDetalleController {
  // GET /api/presupuestos/:presupuesto_id/detalles - Listar detalles del presupuesto
  static async index(req, res) {
    try {
      const { presupuesto_id } = req.params;
      const { grupo, incluir_inactivos = false } = req.query;

      // Verificar que el presupuesto existe
      const presupuesto = await Presupuesto.findByPk(presupuesto_id);
      if (!presupuesto) {
        throw new NotFoundError('Presupuesto no encontrado');
      }

      const where = { id_presupuesto: presupuesto_id };

      if (grupo) {
        where.grupo_partida = grupo;
      }

      if (incluir_inactivos !== 'true') {
        where.estado_partida = 'activa';
      }

      const detalles = await PresupuestoDetalle.findAll({
        where,
        include: [{
          model: ConceptoObra,
          as: 'Concepto',
          attributes: ['codigo', 'nombre', 'descripcion', 'unidad', 'categoria']
        }],
        order: [['orden_visualizacion', 'ASC']]
      });

      res.json({
        success: true,
        data: detalles
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
          message: 'Error al obtener detalles',
          error: error.message
        });
      }
    }
  }

  // GET /api/presupuestos/:presupuesto_id/detalles/grupos - Resumen por grupos
  static async resumenPorGrupos(req, res) {
    try {
      const { presupuesto_id } = req.params;

      const presupuesto = await Presupuesto.findByPk(presupuesto_id);
      if (!presupuesto) {
        throw new NotFoundError('Presupuesto no encontrado');
      }

      const resumen = await PresupuestoDetalle.getResumenPorGrupo(presupuesto_id);

      res.json({
        success: true,
        data: resumen
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
          message: 'Error al obtener resumen por grupos',
          error: error.message
        });
      }
    }
  }

  // GET /api/detalles/:id - Obtener detalle específico
  static async show(req, res) {
    try {
      const { id } = req.params;

      const detalle = await PresupuestoDetalle.findByPk(id, {
        include: [
          {
            model: Presupuesto,
            as: 'Presupuesto',
            attributes: ['numero_presupuesto', 'nombre_presupuesto', 'estado']
          },
          {
            model: ConceptoObra,
            as: 'Concepto'
          }
        ]
      });

      if (!detalle) {
        throw new NotFoundError('Detalle no encontrado');
      }

      // Agregar cálculos
      const importes = detalle.calcularImportes();

      res.json({
        success: true,
        data: {
          ...detalle.toJSON(),
          importes_calculados: importes
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
          message: 'Error al obtener detalle',
          error: error.message
        });
      }
    }
  }

  // POST /api/presupuestos/:presupuesto_id/detalles - Crear nuevo detalle
  static async store(req, res) {
    try {
      const { presupuesto_id } = req.params;
      const {
        id_concepto,
        numero_partida,
        codigo_partida,
        descripcion_personalizada,
        cantidad,
        precio_unitario,
        factor_rendimiento,
        descuento_porcentaje,
        notas,
        es_opcional,
        grupo_partida
      } = req.body;

      // Verificar que el presupuesto existe y puede editarse
      const presupuesto = await Presupuesto.findByPk(presupuesto_id);
      if (!presupuesto) {
        throw new NotFoundError('Presupuesto no encontrado');
      }

      if (!presupuesto.puedeEditar()) {
        throw new ValidationError('El presupuesto no puede editarse en su estado actual');
      }

      // Validaciones básicas
      if (!id_concepto || !cantidad || !precio_unitario) {
        throw new ValidationError('Campos obligatorios: concepto, cantidad, precio unitario');
      }

      // Verificar que el concepto existe
      const concepto = await ConceptoObra.findByPk(id_concepto);
      if (!concepto) {
        throw new NotFoundError('Concepto no encontrado');
      }

      // Determinar número de partida si no se proporciona
      let numeroPartida = numero_partida;
      if (!numeroPartida) {
        const ultimoNumero = await PresupuestoDetalle.max('numero_partida', {
          where: { id_presupuesto: presupuesto_id }
        });
        numeroPartida = (ultimoNumero || 0) + 1;
      }

      // Verificar que el número de partida no existe
      const existePartida = await PresupuestoDetalle.findOne({
        where: {
          id_presupuesto: presupuesto_id,
          numero_partida: numeroPartida
        }
      });

      if (existePartida) {
        throw new ValidationError('El número de partida ya existe');
      }

      // Determinar orden de visualización
      const ultimoOrden = await PresupuestoDetalle.max('orden_visualizacion', {
        where: { id_presupuesto: presupuesto_id }
      });
      const ordenVisualizacion = (ultimoOrden || 0) + 1;

      const nuevoDetalle = await PresupuestoDetalle.create({
        id_presupuesto: presupuesto_id,
        id_concepto,
        numero_partida: numeroPartida,
        codigo_partida,
        descripcion_personalizada,
        unidad: concepto.unidad,
        cantidad,
        precio_unitario,
        factor_rendimiento: factor_rendimiento || 1.0000,
        descuento_porcentaje: descuento_porcentaje || 0.00,
        notas,
        es_opcional: es_opcional || false,
        grupo_partida,
        orden_visualizacion: ordenVisualizacion
      });

      // Cargar el detalle completo para la respuesta
      const detalleCompleto = await PresupuestoDetalle.findByPk(nuevoDetalle.id_detalle, {
        include: [{
          model: ConceptoObra,
          as: 'Concepto'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Partida agregada exitosamente',
        data: detalleCompleto
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
          message: 'Error al crear partida',
          error: error.message
        });
      }
    }
  }

  // POST /api/presupuestos/:presupuesto_id/detalles/concepto/:concepto_id - Agregar concepto con precio sugerido
  static async agregarConcepto(req, res) {
    try {
      const { presupuesto_id, concepto_id } = req.params;
      const { cantidad, region = 'General' } = req.body;

      // Verificar presupuesto
      const presupuesto = await Presupuesto.findByPk(presupuesto_id);
      if (!presupuesto || !presupuesto.puedeEditar()) {
        throw new ValidationError('Presupuesto no válido o no editable');
      }

      // Verificar concepto
      const concepto = await ConceptoObra.findByPk(concepto_id);
      if (!concepto) {
        throw new NotFoundError('Concepto no encontrado');
      }

      // Buscar precio unitario más reciente para la región
      const precioUnitario = await PrecioUnitario.findCurrentPrice(concepto_id, region);
      const precio = precioUnitario ? precioUnitario.precio_unitario : concepto.precio_referencial || 0;

      // Generar número de partida
      const ultimoNumero = await PresupuestoDetalle.max('numero_partida', {
        where: { id_presupuesto: presupuesto_id }
      });
      const numeroPartida = (ultimoNumero || 0) + 1;

      // Determinar orden de visualización
      const ultimoOrden = await PresupuestoDetalle.max('orden_visualizacion', {
        where: { id_presupuesto: presupuesto_id }
      });
      const ordenVisualizacion = (ultimoOrden || 0) + 1;

      const nuevoDetalle = await PresupuestoDetalle.create({
        id_presupuesto: presupuesto_id,
        id_concepto: concepto_id,
        numero_partida: numeroPartida,
        unidad: concepto.unidad,
        cantidad: cantidad || 1,
        precio_unitario: precio,
        grupo_partida: concepto.categoria,
        orden_visualizacion: ordenVisualizacion
      });

      const detalleCompleto = await PresupuestoDetalle.findByPk(nuevoDetalle.id_detalle, {
        include: [{
          model: ConceptoObra,
          as: 'Concepto'
        }]
      });

      res.status(201).json({
        success: true,
        message: 'Concepto agregado exitosamente',
        data: {
          detalle: detalleCompleto,
          precio_sugerido: precio,
          fuente_precio: precioUnitario ? 'precio_unitario' : 'precio_referencial'
        }
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
          message: 'Error al agregar concepto',
          error: error.message
        });
      }
    }
  }

  // PUT /api/detalles/:id - Actualizar detalle
  static async update(req, res) {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      const detalle = await PresupuestoDetalle.findByPk(id, {
        include: [{
          model: Presupuesto,
          as: 'Presupuesto'
        }]
      });

      if (!detalle) {
        throw new NotFoundError('Detalle no encontrado');
      }

      if (!detalle.Presupuesto.puedeEditar()) {
        throw new ValidationError('El presupuesto no puede editarse en su estado actual');
      }

      await detalle.update(updateData);

      const detalleActualizado = await PresupuestoDetalle.findByPk(id, {
        include: [{
          model: ConceptoObra,
          as: 'Concepto'
        }]
      });

      res.json({
        success: true,
        message: 'Partida actualizada exitosamente',
        data: detalleActualizado
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
          message: 'Error al actualizar partida',
          error: error.message
        });
      }
    }
  }

  // POST /api/presupuestos/:presupuesto_id/detalles/reordenar - Reordenar partidas
  static async reordenar(req, res) {
    try {
      const { presupuesto_id } = req.params;
      const { nuevos_ordenes } = req.body;

      if (!Array.isArray(nuevos_ordenes)) {
        throw new ValidationError('Debe proporcionar un array de nuevos órdenes');
      }

      const presupuesto = await Presupuesto.findByPk(presupuesto_id);
      if (!presupuesto || !presupuesto.puedeEditar()) {
        throw new ValidationError('Presupuesto no válido o no editable');
      }

      await PresupuestoDetalle.reordenar(presupuesto_id, nuevos_ordenes);

      res.json({
        success: true,
        message: 'Partidas reordenadas exitosamente'
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
          message: 'Error al reordenar partidas',
          error: error.message
        });
      }
    }
  }

  // DELETE /api/detalles/:id - Eliminar detalle
  static async destroy(req, res) {
    try {
      const { id } = req.params;

      const detalle = await PresupuestoDetalle.findByPk(id, {
        include: [{
          model: Presupuesto,
          as: 'Presupuesto'
        }]
      });

      if (!detalle) {
        throw new NotFoundError('Detalle no encontrado');
      }

      if (!detalle.Presupuesto.puedeEditar()) {
        throw new ValidationError('El presupuesto no puede editarse en su estado actual');
      }

      await detalle.destroy();

      res.json({
        success: true,
        message: 'Partida eliminada exitosamente'
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
          message: 'Error al eliminar partida',
          error: error.message
        });
      }
    }
  }
}

module.exports = PresupuestoDetalleController;