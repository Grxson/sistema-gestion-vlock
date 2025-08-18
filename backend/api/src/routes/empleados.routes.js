const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleados.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los empleados
router.get('/', empleadosController.getAllEmpleados);

// Buscar empleados con filtros avanzados
router.get('/search', empleadosController.searchEmpleados);

// Obtener estadísticas de empleados
router.get('/stats', empleadosController.getEmpleadosStats);

// Obtener un empleado específico
router.get('/:id', empleadosController.getEmpleadoById);

// Crear nuevo empleado
router.post('/', verifyRole([1]), empleadosController.createEmpleado);

// Actualizar empleado
router.put('/:id', verifyRole([1]), empleadosController.updateEmpleado);

// Eliminar empleado (baja lógica)
router.delete('/:id', verifyRole([1]), empleadosController.deleteEmpleado);

module.exports = router;
