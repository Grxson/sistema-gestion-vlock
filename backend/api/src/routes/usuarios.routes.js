const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/usuarios.controller');
const { verifyToken, verifyRole } = require('../middlewares/auth');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// Rutas para administradores (asumiendo que el ID de rol de administrador es 1)
router.get('/', verifyRole([1]), usuariosController.getAllUsuarios);
router.get('/:id', verifyRole([1]), usuariosController.getUsuarioById);
router.post('/', verifyRole([1]), usuariosController.createUsuario);
router.put('/:id', verifyRole([1]), usuariosController.updateUsuario);
router.post('/:id/reset-password', verifyRole([1]), usuariosController.resetPassword);
router.delete('/:id', verifyRole([1]), usuariosController.deleteUsuario);

module.exports = router;
