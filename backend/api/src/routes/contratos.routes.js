const express = require('express');
const router = express.Router();
const contratosController = require('../controllers/contratos.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener estadísticas de contratos - Solo administradores
router.get('/stats', verifyRole([1]), contratosController.getContratosStats);

// Obtener todos los contratos
router.get('/', contratosController.getAllContratos);

// Obtener un contrato específico
router.get('/:id', contratosController.getContratoById);

// Crear nuevo contrato - Solo administradores
router.post('/', verifyRole([1]), contratosController.createContrato);

// Actualizar contrato - Solo administradores
router.put('/:id', verifyRole([1]), contratosController.updateContrato);

// Eliminar contrato - Solo administradores
router.delete('/:id', verifyRole([1]), contratosController.deleteContrato);

module.exports = router;
