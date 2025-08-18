const express = require('express');
const router = express.Router();
const oficiosController = require('../controllers/oficios.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los oficios
router.get('/', oficiosController.getAllOficios);

// Obtener un oficio específico
router.get('/:id', oficiosController.getOficioById);

// Crear nuevo oficio - Solo administradores
router.post('/', verifyRole([1]), oficiosController.createOficio);

// Actualizar oficio - Solo administradores
router.put('/:id', verifyRole([1]), oficiosController.updateOficio);

// Eliminar oficio - Solo administradores
router.delete('/:id', verifyRole([1]), oficiosController.deleteOficio);

module.exports = router;
