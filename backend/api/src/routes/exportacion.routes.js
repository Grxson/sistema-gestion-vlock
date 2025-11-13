const express = require('express');
const router = express.Router();
const exportacionController = require('../controllers/exportacion.controller');
// Usar los middlewares existentes del proyecto
const { verifyToken, verifyRole } = require('../middlewares/auth');

/**
 * Rutas para exportación e importación de datos
 * Todas las rutas requieren autenticación y permisos de admin
 */

// Obtener listado de tablas disponibles
router.get('/tablas', 
  verifyToken,
  // Solo admin por ahora (id_rol = 1). Ajustar si se agregan permisos finos.
  verifyRole([1]),
  exportacionController.obtenerTablas
);

// Exportar datos en JSON
router.post('/json',
  verifyToken,
  verifyRole([1]),
  exportacionController.exportarJSON
);

// Exportar datos en CSV
router.post('/csv',
  verifyToken,
  verifyRole([1]),
  exportacionController.exportarCSV
);

// Exportar datos en Excel
router.post('/excel',
  verifyToken,
  verifyRole([1]),
  exportacionController.exportarExcel
);

// Exportar datos en SQL
router.post('/sql',
  verifyToken,
  verifyRole([1]),
  exportacionController.exportarSQL
);

// Importar datos desde JSON
router.post('/importar',
  verifyToken,
  verifyRole([1]),
  exportacionController.importarJSON
);

// Importar datos desde SQL
router.post('/importar/sql',
  verifyToken,
  verifyRole([1]),
  exportacionController.importarSQL
);

// Vaciar tablas seleccionadas
router.post('/vaciar',
  verifyToken,
  verifyRole([1]),
  exportacionController.vaciarTablas
);

// ==========================================
// RUTAS PARA BACKUP POR PROYECTO
// ==========================================

// Backup completo de un proyecto específico
router.post('/proyecto/:id/backup',
  verifyToken,
  verifyRole([1]),
  exportacionController.backupProyecto
);

// Vaciar todos los datos de un proyecto
router.delete('/proyecto/:id',
  verifyToken,
  verifyRole([1]),
  exportacionController.vaciarProyecto
);

module.exports = router;
