const { PresupuestoDetalle, Presupuesto } = require('../models');
const { Op } = require('sequelize');

class DetalleController {
  // GET /api/detalles - Listar detalles
  static async index(req, res) {
    try {
      const {
        page = 1,
        limit = 25,
        id_presupuesto,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (id_presupuesto) where.id_presupuesto = id_presupuesto;
      
      if (search) {
        where[Op.or] = [
          { descripcion_personalizada: { [Op.like]: `%${search}%` } },
          { codigo_partida: { [Op.like]: `%${search}%` } }
        ];
      }

      const detalles = await PresupuestoDetalle.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['numero_partida', 'ASC']]
      });

      res.json({
        success: true,
        data: detalles.rows,
        pagination: {
          total: detalles.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(detalles.count / limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener detalles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/detalles/:id - Obtener detalle específico
  static async show(req, res) {
    try {
      const { id } = req.params;
      const detalle = await PresupuestoDetalle.findByPk(id);

      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle no encontrado'
        });
      }

      res.json({
        success: true,
        data: detalle
      });

    } catch (error) {
      console.error('Error al obtener detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/detalles - Crear nuevo detalle
  static async store(req, res) {
    try {
      const {
        id_presupuesto,
        id_concepto,
        numero_partida,
        codigo_partida,
        descripcion_personalizada,
        unidad,
        cantidad,
        precio_unitario,
        descuento_porcentaje = 0,
        orden_visualizacion = 1
      } = req.body;

      if (!id_presupuesto || !id_concepto || !cantidad || !precio_unitario) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios'
        });
      }

      const importe_subtotal = parseFloat(cantidad) * parseFloat(precio_unitario);
      const importe_descuento = (importe_subtotal * parseFloat(descuento_porcentaje)) / 100;
      const importe_neto = importe_subtotal - importe_descuento;

      const detalle = await PresupuestoDetalle.create({
        id_presupuesto,
        id_concepto,
        numero_partida,
        codigo_partida,
        descripcion_personalizada,
        unidad,
        cantidad,
        precio_unitario,
        importe_subtotal,
        descuento_porcentaje,
        importe_descuento,
        importe_neto,
        orden_visualizacion
      });

      res.status(201).json({
        success: true,
        message: 'Detalle creado exitosamente',
        data: detalle
      });

    } catch (error) {
      console.error('Error al crear detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/detalles/:id - Actualizar detalle
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { cantidad, precio_unitario, descuento_porcentaje } = req.body;

      const detalle = await PresupuestoDetalle.findByPk(id);

      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle no encontrado'
        });
      }

      const nuevaCantidad = cantidad || detalle.cantidad;
      const nuevoPrecio = precio_unitario || detalle.precio_unitario;
      const nuevoDescuento = descuento_porcentaje !== undefined ? descuento_porcentaje : detalle.descuento_porcentaje;

      const importe_subtotal = parseFloat(nuevaCantidad) * parseFloat(nuevoPrecio);
      const importe_descuento = (importe_subtotal * parseFloat(nuevoDescuento)) / 100;
      const importe_neto = importe_subtotal - importe_descuento;

      await detalle.update({
        cantidad: nuevaCantidad,
        precio_unitario: nuevoPrecio,
        importe_subtotal,
        descuento_porcentaje: nuevoDescuento,
        importe_descuento,
        importe_neto
      });

      res.json({
        success: true,
        message: 'Detalle actualizado exitosamente',
        data: detalle
      });

    } catch (error) {
      console.error('Error al actualizar detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/detalles/:id - Eliminar detalle
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const detalle = await PresupuestoDetalle.findByPk(id);

      if (!detalle) {
        return res.status(404).json({
          success: false,
          message: 'Detalle no encontrado'
        });
      }

      await detalle.destroy();

      res.json({
        success: true,
        message: 'Detalle eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = DetalleController;
