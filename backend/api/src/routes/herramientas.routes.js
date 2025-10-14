const express = require('express');
const router = express.Router();
const herramientasController = require('../controllers/herramientas.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const { upload, uploadWrapper } = require('../middlewares/upload');

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

// Middleware de debug para upload
const debugUpload = (req, res, next) => {
  console.log('🔍 Debug upload middleware:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    hasBody: !!req.body,
    bodyKeys: req.body ? Object.keys(req.body) : [],
    hasFile: !!req.file,
    hasFiles: !!req.files
  });
  next();
};

// Rutas para imágenes de herramientas
router.post('/:id/upload-image', debugUpload, uploadWrapper, herramientasController.uploadImage);

router.delete('/:id/delete-image', herramientasController.deleteImage);

// Rutas para movimientos de herramientas
router.get('/:id/movimientos', herramientasController.getMovimientosHerramienta);

router.post('/movimientos', herramientasController.createMovimiento);

// Rutas para gestión de historial de movimientos
router.delete('/:id/movimientos', herramientasController.deleteHistorialMovimientos);

router.put('/movimientos/:id/estado', herramientasController.updateEstadoMovimiento);

module.exports = router;