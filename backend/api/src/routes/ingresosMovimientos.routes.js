const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const controller = require('../controllers/ingresosMovimientosController');

// Proteger todas las rutas
router.use(verifyToken);

// GET /api/movimientos-ingresos - Listar todos los movimientos con filtros
router.get('/', controller.listarMovimientos);

// GET /api/movimientos-ingresos/resumen/global - Resumen global
router.get('/resumen/global', controller.obtenerResumenGlobal);

// GET /api/ingresos/:id/movimientos/resumen - Resumen por ingreso específico
router.get('/ingresos/:id/resumen', controller.obtenerResumenPorIngreso);

// POST /api/movimientos-ingresos - Crear movimiento manual
router.post('/', controller.crearMovimiento);

module.exports = router;
