const express = require('express');
const router = express.Router();
const { 
  getDashboardSuministros, 
  getReporteComparativo,
  exportDashboardToPDF,
  exportDashboardToExcel,
  exportDashboardCustomToPDF,
  exportDashboardCustomToExcel
} = require('../controllers/reportes.controller');
const { verifyToken } = require('../middlewares/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para reportes de suministros
router.get('/dashboard-suministros', getDashboardSuministros);
router.post('/comparativo-obras', getReporteComparativo);

// Rutas para exportación de reportes básicos
router.get('/dashboard-suministros/export/pdf', exportDashboardToPDF);
router.get('/dashboard-suministros/export/excel', exportDashboardToExcel);

// Rutas para exportación personalizada de reportes
router.post('/dashboard-suministros/export/custom/pdf', exportDashboardCustomToPDF);
router.post('/dashboard-suministros/export/custom/excel', exportDashboardCustomToExcel);

module.exports = router;
