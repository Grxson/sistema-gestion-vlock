const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const ingresosController = require('../controllers/ingresos.controller');

// Proteger todas las rutas
router.use(verifyToken);

// Listar ingresos con filtros
router.get('/', ingresosController.getIngresos);

// Estadísticas
router.get('/estadisticas', ingresosController.getEstadisticasIngresos);

// Obtener por ID
router.get('/:id', ingresosController.getIngresoById);

// Crear
router.post('/', ingresosController.createIngreso);

// Actualizar
router.put('/:id', ingresosController.updateIngreso);

// Eliminar
router.delete('/:id', ingresosController.deleteIngreso);

module.exports = router;
