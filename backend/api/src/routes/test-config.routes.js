const express = require('express');
const router = express.Router();

// Intentar cargar el controlador de forma aislada
try {
  const categoriasController = require('../controllers/categoriasSuministro.controller');
  
  console.log('✅ Controller loaded successfully');
  console.log('getCategorias type:', typeof categoriasController.getCategorias);
  console.log('getAllCategorias type:', typeof categoriasController.getAllCategorias);
  
  // Verificar que el controlador esté correctamente estructurado
  if (typeof categoriasController.getCategorias === 'function') {
    router.get('/test-categorias', (req, res) => {
      res.json({ status: 'ok', message: 'Controller funciona correctamente' });
    });
  } else {
    console.error('❌ getCategorias no es una función:', categoriasController.getCategorias);
  }
  
} catch (error) {
  console.error('❌ Error al cargar el controlador:', error.message);
  console.error('Stack:', error.stack);
}

module.exports = router;