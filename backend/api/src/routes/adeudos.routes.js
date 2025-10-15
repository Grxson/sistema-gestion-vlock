const express = require('express');
const router = express.Router();
const adeudosController = require('../controllers/adeudos.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para adeudos de empleados
router.get('/empleado/:idEmpleado', adeudosController.getAdeudosEmpleado);
router.get('/empleado/:idEmpleado/total-pendientes', adeudosController.getTotalAdeudosPendientes);

// Rutas para reportes y estadísticas (accesibles para todos los usuarios autenticados)
router.get('/pendientes', adeudosController.getAllAdeudosPendientes);
router.get('/estadisticas', adeudosController.getEstadisticasAdeudos);

// Rutas para gestión de adeudos (solo admin y gerente)
router.post('/', verifyRole(['admin', 'gerente']), adeudosController.crearAdeudo);
router.put('/:idAdeudo', verifyRole(['admin', 'gerente']), adeudosController.actualizarAdeudo);
router.put('/:idAdeudo/liquidar', verifyRole(['admin', 'gerente']), adeudosController.liquidarAdeudo);

module.exports = router;
