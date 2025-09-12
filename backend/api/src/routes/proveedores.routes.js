const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const proveedoresController = require('../controllers/proveedores.controller');

// Rutas protegidas con autenticación
router.use(verifyToken);

// Obtener estadísticas de proveedores
router.get('/stats', proveedoresController.getProveedoresStats);

// Obtener solo proveedores activos (para desplegables)
router.get('/active', proveedoresController.getActiveProveedores);

// Buscar proveedores (para autocomplete)
router.get('/search', proveedoresController.searchProveedores);

// Crear o obtener proveedor
router.post('/create-or-get', proveedoresController.createOrGetProveedor);

// Obtener todos los proveedores
router.get('/', proveedoresController.getProveedores);

// Obtener un proveedor por ID
router.get('/:id', proveedoresController.getProveedorById);

// Crear un nuevo proveedor
router.post('/', proveedoresController.createProveedor);

// Actualizar un proveedor
router.put('/:id', proveedoresController.updateProveedor);

// Desactivar un proveedor
router.delete('/:id', proveedoresController.deleteProveedor);

// Eliminar permanentemente un proveedor
router.delete('/:id/permanent', proveedoresController.deletePermanentProveedor);

module.exports = router;
