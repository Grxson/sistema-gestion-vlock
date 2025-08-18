const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const rolesRoutes = require('./roles.routes');
const auditoriaRoutes = require('./auditoria.routes');

// Ruta base para verificar que la API está funcionando
router.get('/', (req, res) => {
  res.send('API funcionando');
});

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);
router.use('/auditoria', auditoriaRoutes);

module.exports = router;
