const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Crear directorio para imágenes si no existe
const uploadsDir = path.join(__dirname, '../public/uploads/herramientas');
fs.ensureDirSync(uploadsDir);

// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📁 Multer storage destination called');
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    console.log('📝 Multer storage filename called:', {
      originalname: file.originalname,
      mimetype: file.mimetype
    });
    // Generar nombre único para evitar conflictos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `herramienta-${uniqueSuffix}${extension}`;
    console.log('📝 Generated filename:', filename);
    cb(null, filename);
  }
});

// Filtro para validar tipos de archivo
const fileFilter = (req, file, cb) => {
  console.log('🔍 File filter - checking file:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    fieldname: file.fieldname,
    size: file.size
  });

  // Extensiones permitidas
  const allowedExtensions = /\.(jpeg|jpg|png|gif|webp)$/i;
  const extname = allowedExtensions.test(file.originalname);
  
  // MIME types permitidos
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp'
  ];
  
  const mimetype = allowedMimeTypes.includes(file.mimetype);

  console.log('🔍 File filter - validation:', {
    extname,
    mimetype,
    allowed: extname && mimetype
  });

  if (mimetype && extname) {
    console.log('✅ File filter - accepted');
    return cb(null, true);
  } else {
    const error = `Tipo de archivo no permitido. Extensión: ${extname}, MIME: ${mimetype}. Solo se permiten: jpeg, jpg, png, gif, webp`;
    console.log('❌ File filter - rejected:', error);
    cb(new Error(error));
  }
};

// Configuración de multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB límite
  },
  fileFilter: fileFilter
});

// Middleware wrapper para manejar errores de multer
const uploadWrapper = (req, res, next) => {
  console.log('🔍 Upload wrapper - Request info:', {
    method: req.method,
    url: req.url,
    contentType: req.headers['content-type'],
    contentLength: req.headers['content-length'],
    hasBody: !!req.body
  });

  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: `Error en upload: ${err.message}`
      });
    }
    
    console.log('✅ Multer processing completed:', {
      hasFile: !!req.file,
      fileInfo: req.file ? {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype
      } : null
    });
    
    next();
  });
};

module.exports = { upload, uploadWrapper };