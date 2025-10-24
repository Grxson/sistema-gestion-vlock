const express = require('express');
const router = express.Router();
const adeudosGeneralesController = require('../controllers/adeudosGenerales.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para consulta (accesibles para todos los usuarios autenticados)
router.get('/', adeudosGeneralesController.getAdeudosGenerales);
router.get('/estadisticas', adeudosGeneralesController.getEstadisticas);
router.get('/alertas', adeudosGeneralesController.getAdeudosConAlertas);
router.get('/proximos-vencer', adeudosGeneralesController.getAdeudosProximosVencer);
router.get('/:id', adeudosGeneralesController.getAdeudoGeneralById);

// Rutas para gestión (crear, actualizar, eliminar)
router.post('/', adeudosGeneralesController.crearAdeudoGeneral);
router.put('/:id', adeudosGeneralesController.actualizarAdeudoGeneral);
router.put('/:id/pago-parcial', adeudosGeneralesController.registrarPagoParcial);
router.put('/:id/liquidar', adeudosGeneralesController.liquidarAdeudo);
router.put('/:id/pagar', adeudosGeneralesController.marcarComoPagado); // Legacy - mantener compatibilidad
router.delete('/:id', adeudosGeneralesController.eliminarAdeudoGeneral);

module.exports = router;
