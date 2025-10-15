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
const reportesRoutes = require('./reportes.routes');
const proyectosRoutes = require('./proyectos.routes');
const suministrosRoutes = require('./suministros.routes');
const proveedoresRoutes = require('./proveedores.routes');
const herramientasRoutes = require('./herramientas.routes');
const configRoutes = require('./config.routes');
const healthRoutes = require('./health.routes');
const adeudosRoutes = require('./adeudos.routes');

// Rutas del sistema de presupuestos
const presupuestosRoutes = require('./presupuestos.routes');
const detallesRoutes = require('./detalles.routes');

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
router.use('/reportes', reportesRoutes);
router.use('/proyectos', proyectosRoutes);
router.use('/suministros', suministrosRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/herramientas', herramientasRoutes);
router.use('/config', configRoutes);
router.use('/health', healthRoutes);
router.use('/adeudos', adeudosRoutes);

// Registrar rutas del sistema de presupuestos
router.use('/presupuestos', presupuestosRoutes);
router.use('/detalles', detallesRoutes);

// Rutas de health y monitoreo (sin autenticación para permitir health checks)
router.use('/', healthRoutes);

module.exports = router;
