const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasSuministro.controller');
const unidadesController = require('../controllers/unidadesMedida.controller');
const userConfigController = require('../controllers/userConfig.controller');
const auth = require('../middlewares/auth');

// Rutas para Categorías de Suministros
router.get('/categorias', auth, categoriasController.getCategorias);
router.get('/categorias/all', auth, categoriasController.getAllCategorias);
router.get('/categorias/tipo/:tipo', auth, categoriasController.getCategoriasByTipo);
router.post('/categorias', auth, categoriasController.createCategoria);
router.put('/categorias/:id', auth, categoriasController.updateCategoria);
router.delete('/categorias/:id', auth, categoriasController.deleteCategoria);
router.put('/categorias/reorder', auth, categoriasController.reorderCategorias);

// Rutas para Unidades de Medida
router.get('/unidades', auth, unidadesController.getUnidades);
router.get('/unidades/all', auth, unidadesController.getAllUnidades);
router.post('/unidades', auth, unidadesController.createUnidad);
router.put('/unidades/:id', auth, unidadesController.updateUnidad);
router.delete('/unidades/:id', auth, unidadesController.deleteUnidad);
router.put('/unidades/reorder', auth, unidadesController.reorderUnidades);

// Rutas para Configuraciones de Usuario
router.get('/user-settings', auth, userConfigController.getUserSettings);
router.put('/user-settings', auth, userConfigController.updateUserSettings);
router.post('/user-settings/reset', auth, userConfigController.resetUserSettings);

module.exports = router;
