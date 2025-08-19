const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Obtener todos los roles - Solo administradores
router.get('/', verifyRole([1]), rolesController.getAllRoles);

// Obtener un rol específico - Solo administradores
router.get('/:id', verifyRole([1]), rolesController.getRolById);

// Crear nuevo rol - Solo administradores
router.post('/', verifyRole([1]), rolesController.createRol);

// Actualizar rol - Solo administradores
router.put('/:id', verifyRole([1]), rolesController.updateRol);

// Eliminar rol - Solo administradores
router.delete('/:id', verifyRole([1]), rolesController.deleteRol);

// Obtener permisos de un rol específico - Solo administradores
router.get('/:id_rol/permisos', verifyRole([1]), rolesController.getPermisosRol);

// Actualizar permisos de un rol - Solo administradores
router.put('/:id_rol/permisos', verifyRole([1]), rolesController.asignarPermisosRol);

// Obtener todas las acciones disponibles - Solo administradores
router.get('/acciones-permiso/all', verifyRole([1]), rolesController.getAccionesPermiso);

// Verificar permiso específico - Autenticados
router.post('/verificar-permiso', rolesController.verificarPermiso);

module.exports = router;
