const express = require('express');
const router = express.Router();
const herramientasController = require('../controllers/herramientas.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Aplicar autenticación a todas las rutas
router.use(verifyToken);

// Rutas para categorías de herramientas
router.get('/categorias', herramientasController.getCategorias);

// Rutas para herramientas
router.get('/', herramientasController.getHerramientas);

router.get('/stock-bajo', herramientasController.getStockBajo);

router.get('/:id', herramientasController.getHerramientaById);

router.post('/', herramientasController.createHerramienta);

router.put('/:id', herramientasController.updateHerramienta);

router.delete('/:id', herramientasController.deleteHerramienta);

// Rutas para imágenes de herramientas
router.post('/:id/upload-image', upload.single('image'), herramientasController.uploadImage);

router.delete('/:id/delete-image', herramientasController.deleteImage);

// Rutas para movimientos de herramientas
router.get('/:id/movimientos', herramientasController.getMovimientosHerramienta);

router.post('/movimientos', herramientasController.createMovimiento);

module.exports = router;