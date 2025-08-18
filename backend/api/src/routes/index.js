const express = require('express');
const router = express.Router();

// Importar rutas
const authRoutes = require('./auth.routes');
const usuariosRoutes = require('./usuarios.routes');
const rolesRoutes = require('./roles.routes');
const auditoriaRoutes = require('./auditoria.routes');
const empleadosRoutes = require('./empleados.routes');
const nominaRoutes = require('./nomina.routes');
const oficiosRoutes = require('./oficios.routes');
const contratosRoutes = require('./contratos.routes');

// Ruta base para verificar que la API está funcionando
router.get('/', (req, res) => {
  res.send('API funcionando');
});

// Registrar rutas
router.use('/auth', authRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/roles', rolesRoutes);
router.use('/auditoria', auditoriaRoutes);
router.use('/empleados', empleadosRoutes);
router.use('/nomina', nominaRoutes);
router.use('/oficios', oficiosRoutes);
router.use('/contratos', contratosRoutes);

module.exports = router;
