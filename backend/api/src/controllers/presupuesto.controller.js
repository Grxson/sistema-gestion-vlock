const { Presupuesto, PresupuestoDetalle } = require('../models');
const { Op } = require('sequelize');

class PresupuestoController {
  // GET /api/presupuestos - Listar presupuestos
  static async index(req, res) {
    try {
      const {
        page = 1,
        limit = 25,
        id_proyecto,
        anio,
        mes,
        search
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      if (id_proyecto) where.id_proyecto = id_proyecto;
      if (anio) where.anio = anio;
      if (mes) where.mes = mes;
      
      if (search) {
        where[Op.or] = [
          { descripcion: { [Op.like]: `%${search}%` } }
        ];
      }

      const presupuestos = await Presupuesto.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [['anio', 'DESC'], ['mes', 'DESC']]
      });

      res.json({
        success: true,
        data: presupuestos.rows,
        pagination: {
          total: presupuestos.count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(presupuestos.count / limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/presupuestos/:id - Obtener presupuesto específico
  static async show(req, res) {
    try {
      const { id } = req.params;
      const presupuesto = await Presupuesto.findByPk(id);

      if (!presupuesto) {
        return res.status(404).json({
          success: false,
          message: 'Presupuesto no encontrado'
        });
      }

      res.json({
        success: true,
        data: presupuesto
      });

    } catch (error) {
      console.error('Error al obtener presupuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // POST /api/presupuestos - Crear nuevo presupuesto
  static async store(req, res) {
    try {
      const { id_proyecto, id_categoria, monto, mes, anio, descripcion } = req.body;

      if (!id_proyecto || !id_categoria || !monto) {
        return res.status(400).json({
          success: false,
          message: 'Los campos id_proyecto, id_categoria y monto son obligatorios'
        });
      }

      const presupuesto = await Presupuesto.create({
        id_proyecto,
        id_categoria,
        monto,
        mes,
        anio,
        descripcion
      });

      res.status(201).json({
        success: true,
        message: 'Presupuesto creado exitosamente',
        data: presupuesto
      });

    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // PUT /api/presupuestos/:id - Actualizar presupuesto
  static async update(req, res) {
    try {
      const { id } = req.params;
      const { id_proyecto, id_categoria, monto, mes, anio, descripcion } = req.body;

      const presupuesto = await Presupuesto.findByPk(id);

      if (!presupuesto) {
        return res.status(404).json({
          success: false,
          message: 'Presupuesto no encontrado'
        });
      }

      await presupuesto.update({
        id_proyecto: id_proyecto || presupuesto.id_proyecto,
        id_categoria: id_categoria || presupuesto.id_categoria,
        monto: monto || presupuesto.monto,
        mes: mes !== undefined ? mes : presupuesto.mes,
        anio: anio !== undefined ? anio : presupuesto.anio,
        descripcion: descripcion !== undefined ? descripcion : presupuesto.descripcion
      });

      res.json({
        success: true,
        message: 'Presupuesto actualizado exitosamente',
        data: presupuesto
      });

    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // DELETE /api/presupuestos/:id - Eliminar presupuesto
  static async destroy(req, res) {
    try {
      const { id } = req.params;
      const presupuesto = await Presupuesto.findByPk(id);

      if (!presupuesto) {
        return res.status(404).json({
          success: false,
          message: 'Presupuesto no encontrado'
        });
      }

      await presupuesto.destroy();

      res.json({
        success: true,
        message: 'Presupuesto eliminado exitosamente'
      });

    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }

  // GET /api/presupuestos/estadisticas - Obtener estadísticas
  static async estadisticas(req, res) {
    try {
      const { anio = new Date().getFullYear() } = req.query;
      
      const totalGeneral = await Presupuesto.sum('monto', { where: { anio } });
      const cantidadTotal = await Presupuesto.count({ where: { anio } });

      res.json({
        success: true,
        data: {
          totalGeneral: totalGeneral || 0,
          cantidadTotal,
          anio
        }
      });

    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: error.message
      });
    }
  }
}

module.exports = PresupuestoController;
