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
router.get('/all', adeudosController.getAllAdeudos);
router.get('/estadisticas', adeudosController.getEstadisticasAdeudos);

// Rutas para gestión de adeudos (accesibles para todos los usuarios autenticados)
router.put('/:idAdeudo', adeudosController.actualizarAdeudo);
router.put('/:idAdeudo/liquidar', adeudosController.liquidarAdeudo);

// Rutas para creación de adeudos (solo admin y gerente - creación manual)
router.post('/', verifyRole(['admin', 'gerente']), adeudosController.crearAdeudo);

module.exports = router;
