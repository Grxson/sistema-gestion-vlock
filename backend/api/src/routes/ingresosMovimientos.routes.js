const express = require('express');
const router = express.Router();
const controller = require('../controllers/ingresosMovimientosController');

// GET /api/movimientos-ingresos - Listar todos los movimientos con filtros
router.get('/', controller.listarMovimientos);

// GET /api/ingresos/:id/movimientos/resumen - Resumen por ingreso específico
router.get('/ingresos/:id/resumen', controller.obtenerResumenPorIngreso);

// POST /api/movimientos-ingresos - Crear movimiento manual
router.post('/', controller.crearMovimiento);

module.exports = router;
