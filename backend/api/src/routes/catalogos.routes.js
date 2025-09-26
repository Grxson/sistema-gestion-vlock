const express = require('express');
const router = express.Router();
const CatalogoPrecioController = require('../controllers/catalogoPrecio.controller');
const { verifyToken } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Rutas principales
router.get('/', CatalogoPrecioController.index);                      // GET /api/catalogos
router.get('/vigentes', CatalogoPrecioController.vigentes);           // GET /api/catalogos/vigentes
router.get('/regiones', CatalogoPrecioController.regiones);           // GET /api/catalogos/regiones
router.get('/:id', CatalogoPrecioController.show);                   // GET /api/catalogos/:id
router.post('/', CatalogoPrecioController.store);                    // POST /api/catalogos
router.put('/:id', CatalogoPrecioController.update);                // PUT /api/catalogos/:id
router.delete('/:id', CatalogoPrecioController.destroy);            // DELETE /api/catalogos/:id

// Rutas especiales
router.post('/:id/duplicar', CatalogoPrecioController.duplicar);     // POST /api/catalogos/:id/duplicar
router.post('/:id/actualizar-factor', CatalogoPrecioController.actualizarFactor); // POST /api/catalogos/:id/actualizar-factor
router.put('/:id/estado', CatalogoPrecioController.cambiarEstado);   // PUT /api/catalogos/:id/estado

module.exports = router;