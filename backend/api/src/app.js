const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const routes = require('./routes');

const app = express();

// Middleware específico para servir archivos estáticos con CORS (antes que CORS general)
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Serving static file: ${req.url}`);
  
  // Headers CORS más permisivos para archivos estáticos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Servir archivos estáticos desde public/uploads
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Configuración de CORS más flexible para producción
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : [
      'http://localhost:3000', 
      'http://localhost:3001',
      'https://localhost:3000', 
      'https://localhost:3001'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (aplicaciones móviles, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // En producción, ser más específico con dominios
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // En desarrollo, ser más permisivo con localhost
      if (origin.includes('localhost') || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'Content-Type']
}));

app.use(morgan('dev'));

// Middleware condicional para parsing
app.use((req, res, next) => {
  console.log('🔍 Middleware check:', {
    method: req.method,
    path: req.path,
    contentType: req.headers['content-type']
  });

  // Si es upload de imagen, NO aplicar ningún body parser
  if (req.path.includes('/upload-image')) {
    console.log('🔍 Skipping ALL body parsing for upload route');
    return next();
  }
  
  // Para el resto, aplicar los parsers
  express.urlencoded({ extended: true, limit: '10mb' })(req, res, () => {
    express.json({ limit: '10mb' })(req, res, next);
  });
});

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Ruta de salud para Railway
app.get('/', (req, res) => {
  res.json({
    message: 'Backend funcionando correctamente',
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Middleware específico para /api/uploads (antes del router de API)
app.use('/api/uploads', (req, res, next) => {
  console.log(`📁 Serving /api/uploads file: ${req.url}`);
  
  // Headers CORS más permisivos para archivos estáticos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Servir archivos estáticos desde public/uploads para /api/uploads
app.use('/api/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Rutas
app.use('/api', routes);

// Rutas específicas de movimientos de ingresos
const movimientosRoutes = require('./routes/ingresosMovimientos.routes');
app.use('/api/movimientos-ingresos', movimientosRoutes);

module.exports = app;
