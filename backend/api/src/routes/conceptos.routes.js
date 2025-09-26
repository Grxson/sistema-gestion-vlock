const express = require('express');
const router = express.Router();
const ConceptoObraController = require('../controllers/conceptoObra.controller');
const { verifyToken } = require('../middlewares/auth');

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// Rutas principales
router.get('/', ConceptoObraController.index);                    // GET /api/conceptos
router.get('/categorias', ConceptoObraController.categorias);      // GET /api/conceptos/categorias
router.get('/:id', ConceptoObraController.show);                  // GET /api/conceptos/:id
router.post('/', ConceptoObraController.store);                   // POST /api/conceptos
router.put('/:id', ConceptoObraController.update);               // PUT /api/conceptos/:id
router.delete('/:id', ConceptoObraController.destroy);           // DELETE /api/conceptos/:id

// Rutas especiales
router.post('/import', ConceptoObraController.importBatch);       // POST /api/conceptos/import

module.exports = router;