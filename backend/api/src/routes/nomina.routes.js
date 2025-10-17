const express = require('express');
const router = express.Router();
const nominaController = require('../controllers/nomina.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todas las nóminas - Solo administradores
router.get('/', verifyRole([1]), nominaController.getAllNominas);

// Obtener nóminas por semana
router.get('/semana/:id_semana', nominaController.getNominasPorSemana);

// Obtener nóminas por empleado
router.get('/empleado/:id_empleado', nominaController.getNominasPorEmpleado);

// Verificar duplicados de nómina (DEBE ir antes de /:id)
router.get('/verificar-duplicados', verifyRole([1]), nominaController.verificarDuplicados);

// Obtener una nómina por ID
router.get('/:id', nominaController.getNominaById);

// Crear nueva nómina - Solo administradores
router.post('/', verifyRole([1]), nominaController.createNomina);

// Actualizar nómina - Solo administradores
router.put('/:id', verifyRole([1]), nominaController.updateNomina);

// Registrar pago de nómina - Solo administradores
router.post('/:id_nomina/pago', verifyRole([1]), nominaController.registrarPagoNomina);

// Generar recibo PDF
router.get('/:id_nomina/recibo', nominaController.generarReciboPDF);

// Obtener historial de pagos
router.get('/pagos/historial', nominaController.getHistorialPagos);

// Cambiar estado de nómina
router.put('/:id_nomina/estado', verifyRole([1]), nominaController.cambiarEstadoNomina);

// Liquidar adeudo pendiente
router.post('/:id/liquidar-adeudo', verifyRole([1]), nominaController.liquidarAdeudo);

// Obtener estadísticas de nómina
router.get('/estadisticas', verifyRole([1]), nominaController.getNominaStats);

// Obtener información para generar nóminas (proyectos, empleados, semanas)
router.get('/info-para-nomina', verifyRole([1]), nominaController.getInfoParaNomina);

// Obtener historial de cambios de una nómina
router.get('/:id_nomina/historial', verifyToken, require('../controllers/nominaHistorial.controller').getHistorialNomina);

// Gestión de semanas de nómina
router.post('/semanas', verifyRole([1]), nominaController.crearSemanaNomina);
router.put('/semanas/:id_semana/estado', verifyRole([1]), nominaController.actualizarEstadoSemana);

module.exports = router;
