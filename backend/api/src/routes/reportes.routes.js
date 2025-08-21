const express = require('express');
const router = express.Router();
const { getDashboardSuministros, getReporteComparativo } = require('../controllers/reportes.controller');
const { verifyToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para reportes de suministros
router.get('/dashboard-suministros', getDashboardSuministros);
router.post('/comparativo-obras', getReporteComparativo);

module.exports = router;
