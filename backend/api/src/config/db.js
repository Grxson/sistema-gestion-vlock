const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usar DATABASE_URL si está disponible, sino usar variables individuales
const { DATABASE_URL, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;

let sequelize;

const commonOptions = {
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'production' ? false : console.log,
  timezone: '+00:00',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /ECONNREFUSED/,
      /ENOTFOUND/,
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 3
  }
};

if (DATABASE_URL) {
  console.log('🔧 Conectando usando DATABASE_URL...');
  sequelize = new Sequelize(DATABASE_URL, {
    ...commonOptions,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
} else {
  // Fallback a configuración individual
  console.log('🔧 Conectando usando configuración individual...');
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT || 3306,
    ...commonOptions,
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? {
        require: true,
        rejectUnauthorized: false
      } : false
    }
  });
}

// Función para probar la conexión con reintentos
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Conexión a la base de datos establecida correctamente.');
      return true;
    } catch (error) {
      console.error(`❌ Intento ${i + 1}/${retries} - No se pudo conectar a la base de datos:`, error.message);
      if (i === retries - 1) {
        console.error('❌ Se agotaron los reintentos de conexión a la BD');
        return false;
      }
      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

// Probar conexión al importar el módulo
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

module.exports = sequelize;
