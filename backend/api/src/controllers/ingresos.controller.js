const models = require('../models');

const getEstadisticasIngresos = async (req, res) => {
  try {
    const { id_proyecto, fecha_inicio, fecha_fin } = req.query;
    const { Op } = models.sequelize.Sequelize;
    const whereBase = {};
    if (id_proyecto) whereBase.id_proyecto = id_proyecto;
    if (fecha_inicio && fecha_fin) whereBase.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    else if (fecha_inicio) whereBase.fecha = { [Op.gte]: fecha_inicio };
    else if (fecha_fin) whereBase.fecha = { [Op.lte]: fecha_fin };

    const totalRows = await models.Ingresos.findAll({ where: whereBase, attributes: ['monto'] });
    const total_ingresos = totalRows.reduce((acc, r) => acc + Number(r.monto || 0), 0);

    const today = new Date();
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth() + 1; // 1-12
    const pad = n => String(n).padStart(2, '0');

    const startMonth = `${year}-${pad(month)}-01`;
    const startMonthDate = new Date(`${startMonth}T00:00:00Z`);
    const nextMonthDate = new Date(Date.UTC(startMonthDate.getUTCFullYear(), startMonthDate.getUTCMonth() + 1, 1));
    const startNextMonth = nextMonthDate.toISOString().slice(0,10);

    const prevMonthDate = new Date(Date.UTC(startMonthDate.getUTCFullYear(), startMonthDate.getUTCMonth() - 1, 1));
    const startPrevMonth = prevMonthDate.toISOString().slice(0,10);
    const startThisMonth = startMonth;

    const whereMesActual = { ...(id_proyecto ? { id_proyecto } : {}), fecha: { [Op.gte]: startThisMonth, [Op.lt]: startNextMonth } };
    const whereMesAnterior = { ...(id_proyecto ? { id_proyecto } : {}), fecha: { [Op.gte]: startPrevMonth, [Op.lt]: startThisMonth } };

    const [rowsMesActual, rowsMesAnterior] = await Promise.all([
      models.Ingresos.findAll({ where: whereMesActual, attributes: ['monto'] }),
      models.Ingresos.findAll({ where: whereMesAnterior, attributes: ['monto'] })
    ]);

    const ingresos_mes_actual = rowsMesActual.reduce((a, r) => a + Number(r.monto || 0), 0);
    const ingresos_mes_anterior = rowsMesAnterior.reduce((a, r) => a + Number(r.monto || 0), 0);
    const variacion_mes = ingresos_mes_anterior === 0 ? (ingresos_mes_actual > 0 ? 100 : 0) : ((ingresos_mes_actual - ingresos_mes_anterior) / ingresos_mes_anterior) * 100;

    const promedio_ticket = totalRows.length > 0 ? total_ingresos / totalRows.length : 0;

    return res.json({
      success: true,
      data: {
        total_ingresos: Number(total_ingresos.toFixed(2)),
        ingresos_mes_actual: Number(ingresos_mes_actual.toFixed(2)),
        ingresos_mes_anterior: Number(ingresos_mes_anterior.toFixed(2)),
        variacion_mes: Number(variacion_mes.toFixed(2)),
        promedio_ticket: Number(promedio_ticket.toFixed(2))
      }
    });
  } catch (err) {
    console.error('Error getEstadisticasIngresos:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getIngresos = async (req, res) => {
  try {
    const { id_proyecto, q, fecha_inicio, fecha_fin, min_monto, max_monto, page, limit } = req.query;

    const where = {};
    const { Op } = models.sequelize.Sequelize;

    if (id_proyecto) where.id_proyecto = id_proyecto;

    if (q) {
      where[Op.or] = [
        { fuente: { [Op.like]: `%${q}%` } },
        { descripcion: { [Op.like]: `%${q}%` } },
      ];
    }

    if (fecha_inicio && fecha_fin) where.fecha = { [Op.between]: [fecha_inicio, fecha_fin] };
    else if (fecha_inicio) where.fecha = { [Op.gte]: fecha_inicio };
    else if (fecha_fin) where.fecha = { [Op.lte]: fecha_fin };

    if (min_monto || max_monto) {
      where.monto = {};
      if (min_monto) where.monto[Op.gte] = min_monto;
      if (max_monto) where.monto[Op.lte] = max_monto;
    }

    const usePagination = page && limit;
    let rows, count;
    if (usePagination) {
      const pageNum = Math.max(parseInt(page, 10) || 1, 1);
      const pageSize = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      const result = await models.Ingresos.findAndCountAll({
        where,
        include: [{ model: models.Proyectos, as: 'proyecto', attributes: ['id_proyecto', 'nombre'] }],
        order: [['fecha', 'DESC'], ['id_ingreso', 'DESC']],
        offset: (pageNum - 1) * pageSize,
        limit: pageSize,
      });
      rows = result.rows;
      count = result.count;
      const data = rows.map((i) => {
        const row = i.toJSON();
        row.monto = row.monto != null ? Number(row.monto) : null;
        return row;
      });
      return res.json({ success: true, data, total: count, page: pageNum, limit: pageSize });
    } else {
      const ingresos = await models.Ingresos.findAll({
        where,
        include: [{ model: models.Proyectos, as: 'proyecto', attributes: ['id_proyecto', 'nombre'] }],
        order: [['fecha', 'DESC'], ['id_ingreso', 'DESC']],
      });
      const data = ingresos.map((i) => {
        const row = i.toJSON();
        row.monto = row.monto != null ? Number(row.monto) : null;
        return row;
      });
      return res.json({ success: true, data });
    }
  } catch (err) {
    console.error('Error getIngresos:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getIngresoById = async (req, res) => {
  try {
    const { id } = req.params;
    const ingreso = await models.Ingresos.findByPk(id, {
      include: [{ model: models.Proyectos, as: 'proyecto', attributes: ['id_proyecto', 'nombre'] }],
    });
    if (!ingreso) return res.status(404).json({ success: false, message: 'Ingreso no encontrado' });
    const data = ingreso.toJSON();
    data.monto = data.monto != null ? Number(data.monto) : null;
    res.json({ success: true, data });
  } catch (err) {
    console.error('Error getIngresoById:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const createIngreso = async (req, res) => {
  try {
    const { fecha, id_proyecto, monto, fuente, descripcion } = req.body;
    if (!fecha || !id_proyecto || monto == null) {
      return res.status(400).json({ success: false, message: 'fecha, id_proyecto y monto son obligatorios' });
    }
    // validar proyecto
    const proyecto = await models.Proyectos.findByPk(id_proyecto);
    if (!proyecto) return res.status(400).json({ success: false, message: 'Proyecto no existe' });

    const nuevo = await models.Ingresos.create({
      fecha,
      id_proyecto,
      monto: Number(monto),
      fuente: fuente || null,
      descripcion: descripcion || null,
    });

    const created = await models.Ingresos.findByPk(nuevo.id_ingreso, {
      include: [{ model: models.Proyectos, as: 'proyecto', attributes: ['id_proyecto', 'nombre'] }],
    });

    res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error('Error createIngreso:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const updateIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const ingreso = await models.Ingresos.findByPk(id);
    if (!ingreso) return res.status(404).json({ success: false, message: 'Ingreso no encontrado' });

    const payload = { ...req.body };
    if (payload.monto != null) payload.monto = Number(payload.monto);

    if (payload.id_proyecto) {
      const proyecto = await models.Proyectos.findByPk(payload.id_proyecto);
      if (!proyecto) return res.status(400).json({ success: false, message: 'Proyecto no existe' });
    }

    await ingreso.update(payload);
    const updated = await models.Ingresos.findByPk(id, {
      include: [{ model: models.Proyectos, as: 'proyecto', attributes: ['id_proyecto', 'nombre'] }],
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error updateIngreso:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const deleteIngreso = async (req, res) => {
  try {
    const { id } = req.params;
    const ingreso = await models.Ingresos.findByPk(id);
    if (!ingreso) return res.status(404).json({ success: false, message: 'Ingreso no encontrado' });
    await ingreso.destroy();
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleteIngreso:', err);
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = {
  getIngresos,
  getIngresoById,
  createIngreso,
  updateIngreso,
  deleteIngreso,
  getEstadisticasIngresos,
};
