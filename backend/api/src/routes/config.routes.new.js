const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

// Cargar controladores con manejo de errores
let categoriasController, unidadesController, userConfigController;

try {
  categoriasController = require('../controllers/categoriasSuministro.controller');
  console.log('✅ Categorías controller cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando categorías controller:', error.message);
}

try {
  unidadesController = require('../controllers/unidadesMedida.controller');
  console.log('✅ Unidades controller cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando unidades controller:', error.message);
}

try {
  userConfigController = require('../controllers/userConfig.controller');
  console.log('✅ UserConfig controller cargado correctamente');
} catch (error) {
  console.error('❌ Error cargando userConfig controller:', error.message);
}

// Rutas para Categorías de Suministros (solo si el controlador se cargó correctamente)
if (categoriasController && typeof categoriasController.getCategorias === 'function') {
  router.get('/categorias', auth, categoriasController.getCategorias);
  router.get('/categorias/all', auth, categoriasController.getAllCategorias);
  router.get('/categorias/tipo/:tipo', auth, categoriasController.getCategoriasByTipo);
  router.post('/categorias', auth, categoriasController.createCategoria);
  router.put('/categorias/:id', auth, categoriasController.updateCategoria);
  router.delete('/categorias/:id', auth, categoriasController.deleteCategoria);
  router.put('/categorias/reorder', auth, categoriasController.reorderCategorias);
  console.log('✅ Rutas de categorías registradas correctamente');
} else {
  console.error('❌ No se pudieron registrar las rutas de categorías');
}

// Rutas para Unidades de Medida (solo si el controlador se cargó correctamente)
if (unidadesController && typeof unidadesController.getUnidades === 'function') {
  router.get('/unidades', auth, unidadesController.getUnidades);
  router.get('/unidades/all', auth, unidadesController.getAllUnidades);
  router.post('/unidades', auth, unidadesController.createUnidad);
  router.put('/unidades/:id', auth, unidadesController.updateUnidad);
  router.delete('/unidades/:id', auth, unidadesController.deleteUnidad);
  router.put('/unidades/reorder', auth, unidadesController.reorderUnidades);
  console.log('✅ Rutas de unidades registradas correctamente');
} else {
  console.error('❌ No se pudieron registrar las rutas de unidades');
}

// Rutas para Configuraciones de Usuario (solo si el controlador se cargó correctamente)
if (userConfigController && typeof userConfigController.getUserSettings === 'function') {
  router.get('/user-settings', auth, userConfigController.getUserSettings);
  router.put('/user-settings', auth, userConfigController.updateUserSettings);
  router.post('/user-settings/reset', auth, userConfigController.resetUserSettings);
  console.log('✅ Rutas de configuración de usuario registradas correctamente');
} else {
  console.error('❌ No se pudieron registrar las rutas de configuración de usuario');
}

module.exports = router;