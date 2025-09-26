const express = require('express');
const router = express.Router();
const PresupuestoController = require('../controllers/presupuesto.controller');
const { verifyToken } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Rutas principales de presupuestos
router.get('/', PresupuestoController.index);
router.get('/estadisticas', PresupuestoController.estadisticas);
router.get('/:id', PresupuestoController.show);
router.post('/', PresupuestoController.store);
router.put('/:id', PresupuestoController.update);
router.delete('/:id', PresupuestoController.destroy);

module.exports = router;
