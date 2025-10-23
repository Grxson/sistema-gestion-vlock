const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación y ser administrador
router.use(verifyToken);
router.use(verifyRole([1]));

// Obtener estadísticas de auditoría
router.get('/estadisticas', auditoriaController.getEstadisticas);

// Obtener lista de tablas disponibles
router.get('/tablas', auditoriaController.getTablas);

// Exportar registros a Excel
router.get('/exportar/excel', auditoriaController.exportarExcel);

// Exportar registros a PDF
router.get('/exportar/pdf', auditoriaController.exportarPDF);

// Obtener registros de auditoría (con filtros y paginación)
router.get('/', auditoriaController.getRegistrosAuditoria);

// Obtener un registro de auditoría específico
router.get('/:id', auditoriaController.getRegistroAuditoria);

module.exports = router;
