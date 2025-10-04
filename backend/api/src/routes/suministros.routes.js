const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const suministrosController = require('../controllers/suministros.controller');

// Rutas protegidas con autenticación
router.use(verifyToken);

// Obtener todas las estadísticas de suministros
router.get('/estadisticas', suministrosController.getEstadisticasSuministros);

// Obtener estadísticas por tipo de categoría
router.get('/estadisticas/tipo', suministrosController.getEstadisticasPorTipo);

// Obtener todos los suministros (con filtros opcionales)
router.get('/', suministrosController.getSuministros);

// Obtener suministros por proyecto
router.get('/proyecto/:id_proyecto', suministrosController.getSuministrosByProyecto);

// Obtener un suministro por ID
router.get('/:id', suministrosController.getSuministroById);

// Crear un nuevo suministro
router.post('/', suministrosController.createSuministro);

// Crear múltiples suministros en un recibo
router.post('/multiple', suministrosController.createMultipleSuministros);

// Actualizar un suministro
router.put('/:id', suministrosController.updateSuministro);

// Eliminar un suministro
router.delete('/:id', suministrosController.deleteSuministro);

module.exports = router;
