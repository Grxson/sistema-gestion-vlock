const express = require('express');
const router = express.Router();
const DetalleController = require('../controllers/detalle.controller');
const { verifyToken } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Rutas de detalles
router.get('/', DetalleController.index);           // GET /api/detalles
router.get('/:id', DetalleController.show);         // GET /api/detalles/:id
router.post('/', DetalleController.store);          // POST /api/detalles
router.put('/:id', DetalleController.update);       // PUT /api/detalles/:id
router.delete('/:id', DetalleController.destroy);   // DELETE /api/detalles/:id

module.exports = router;