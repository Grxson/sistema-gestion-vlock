const express = require('express');
const router = express.Router();
const { verifyToken: auth } = require('../middlewares/auth');

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
  try {
    router.get('/categorias', auth, categoriasController.getCategorias);
    console.log('✅ Ruta GET /categorias registrada');
    
    router.get('/categorias/all', auth, categoriasController.getAllCategorias);
    console.log('✅ Ruta GET /categorias/all registrada');
    
    router.get('/categorias/tipo/:tipo', auth, categoriasController.getCategoriasByTipo);
    console.log('✅ Ruta GET /categorias/tipo/:tipo registrada');
    
    router.post('/categorias', auth, categoriasController.createCategoria);
    console.log('✅ Ruta POST /categorias registrada');
    
    router.put('/categorias/:id', auth, categoriasController.updateCategoria);
    console.log('✅ Ruta PUT /categorias/:id registrada');
    
    router.delete('/categorias/:id', auth, categoriasController.deleteCategoria);
    console.log('✅ Ruta DELETE /categorias/:id registrada');
    
    router.put('/categorias/reorder', auth, categoriasController.reorderCategorias);
    console.log('✅ Ruta PUT /categorias/reorder registrada');
    
    console.log('✅ Rutas de categorías registradas correctamente');
  } catch (error) {
    console.error('❌ Error registrando rutas de categorías:', error.message);
  }
} else {
  console.error('❌ No se pudieron registrar las rutas de categorías');
}

// Rutas para Unidades de Medida (solo si el controlador se cargó correctamente)
if (unidadesController && typeof unidadesController.getUnidades === 'function') {
  try {
    router.get('/unidades', auth, unidadesController.getUnidades);
    console.log('✅ Ruta GET /unidades registrada');
    
    router.get('/unidades/all', auth, unidadesController.getAllUnidades);
    console.log('✅ Ruta GET /unidades/all registrada');
    
    router.post('/unidades', auth, unidadesController.createUnidad);
    console.log('✅ Ruta POST /unidades registrada');
    
    router.put('/unidades/:id', auth, unidadesController.updateUnidad);
    console.log('✅ Ruta PUT /unidades/:id registrada');
    
    router.delete('/unidades/:id', auth, unidadesController.deleteUnidad);
    console.log('✅ Ruta DELETE /unidades/:id registrada');
    
    router.put('/unidades/reorder', auth, unidadesController.reorderUnidades);
    console.log('✅ Ruta PUT /unidades/reorder registrada');
    
    console.log('✅ Rutas de unidades registradas correctamente');
  } catch (error) {
    console.error('❌ Error registrando rutas de unidades:', error.message);
  }
} else {
  console.error('❌ No se pudieron registrar las rutas de unidades');
}

// Rutas para Configuraciones de Usuario (solo si el controlador se cargó correctamente)
if (userConfigController && typeof userConfigController.getUserSettings === 'function') {
  try {
    router.get('/user-settings', auth, userConfigController.getUserSettings);
    console.log('✅ Ruta GET /user-settings registrada');
    
    router.put('/user-settings', auth, userConfigController.updateUserSettings);
    console.log('✅ Ruta PUT /user-settings registrada');
    
    router.post('/user-settings/reset', auth, userConfigController.resetUserSettings);
    console.log('✅ Ruta POST /user-settings/reset registrada');
    
    console.log('✅ Rutas de configuración de usuario registradas correctamente');
  } catch (error) {
    console.error('❌ Error registrando rutas de configuración de usuario:', error.message);
  }
} else {
  console.error('❌ No se pudieron registrar las rutas de configuración de usuario');
}

module.exports = router;