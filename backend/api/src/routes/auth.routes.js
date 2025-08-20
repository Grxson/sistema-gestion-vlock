const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');

// Rutas públicas
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas
router.get('/verify', verifyToken, authController.verifyAuth);
router.get('/permissions', verifyToken, authController.getUserPermissions);
router.post('/change-password', verifyToken, authController.changePassword);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
