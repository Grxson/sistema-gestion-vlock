const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/auth');
const proveedoresController = require('../controllers/proveedores.controller');

// Rutas protegidas con autenticación
router.use(verifyToken);

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

module.exports = router;
