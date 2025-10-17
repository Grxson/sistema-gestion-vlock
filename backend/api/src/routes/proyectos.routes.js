const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const {
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    getProyectosActivos,
    searchProyectos,
    getEstadisticasProyecto
} = require('../controllers/proyectos.controller');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para proyectos
router.get('/', getProyectos);                           // GET /api/proyectos
router.get('/activos', getProyectosActivos);            // GET /api/proyectos/activos
router.get('/search', searchProyectos);                 // GET /api/proyectos/search
router.get('/:id', getProyectoById);                    // GET /api/proyectos/:id
router.get('/:id/estadisticas', getEstadisticasProyecto); // GET /api/proyectos/:id/estadisticas
router.post('/', createProyecto);                       // POST /api/proyectos
router.put('/:id', updateProyecto);                     // PUT /api/proyectos/:id
router.delete('/:id', deleteProyecto);                  // DELETE /api/proyectos/:id

module.exports = router;
