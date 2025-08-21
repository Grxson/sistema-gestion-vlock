const express = require('express');
const router = express.Router();
const db = require('../config/db');

/**
 * Health check endpoints para monitoreo del sistema
 */

// Endpoint para verificar salud general del backend
router.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
    status: 'OK',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(healthCheck);
});

// Endpoint para verificar conexión a la base de datos
router.get('/db/health', async (req, res) => {
  try {
    // Intentar ejecutar una query simple
    await db.query('SELECT 1 as test');
    
    const dbHealth = {
      status: 'OK',
      message: 'Conexión a base de datos funcionando',
      timestamp: new Date().toISOString(),
      database: 'MySQL/MariaDB'
    };
    
    res.status(200).json(dbHealth);
  } catch (error) {
    console.error('Error en health check de DB:', error);
    
    const dbHealth = {
      status: 'ERROR',
      message: 'Error en conexión a base de datos',
      timestamp: new Date().toISOString(),
      error: error.message,
      database: 'MySQL/MariaDB'
    };
    
    res.status(503).json(dbHealth);
  }
});

// Endpoint para obtener métricas del sistema
router.get('/metrics', (req, res) => {
  const metrics = {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    timestamp: new Date().toISOString(),
    platform: process.platform,
    version: process.version,
    pid: process.pid
  };
  
  res.status(200).json(metrics);
});

// Endpoint para verificar servicios específicos
router.get('/services', async (req, res) => {
  const services = {
    database: 'unknown',
    auth: 'unknown',
    permissions: 'unknown'
  };
  
  try {
    // Verificar base de datos
    await db.query('SELECT 1');
    services.database = 'healthy';
  } catch (error) {
    services.database = 'error';
  }
  
  try {
    // Verificar sistema de auth (verificar tabla usuarios)
    await db.query('SELECT COUNT(*) as count FROM usuarios LIMIT 1');
    services.auth = 'healthy';
  } catch (error) {
    services.auth = 'error';
  }
  
  try {
    // Verificar sistema de permisos
    await db.query('SELECT COUNT(*) as count FROM permisos_rol LIMIT 1');
    services.permissions = 'healthy';
  } catch (error) {
    services.permissions = 'error';
  }
  
  const allHealthy = Object.values(services).every(status => status === 'healthy');
  
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'OK' : 'DEGRADED',
    services: services,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
