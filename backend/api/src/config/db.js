const { Sequelize } = require('sequelize');
require('dotenv').config();

// Usar DATABASE_URL si está disponible, sino usar variables individuales
const { DATABASE_URL, DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT } = process.env;

let sequelize;

if (DATABASE_URL) {
  sequelize = new Sequelize(DATABASE_URL, {
    dialect: 'mysql',
    logging: false, // Desactiva logs SQL **Activarlo si queremos debuggear**
    timezone: '+00:00', // Evita problemas con fechas
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // Fallback a configuración individual
  console.log('🔧 Conectando usando configuración individual...');
  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
    host: DB_HOST,
    port: DB_PORT || 3306,
    dialect: 'mysql',
    logging: false, // Desactiva logs SQL **Activarlo si queremos debuggear**
    timezone: '+00:00', // Evita problemas con fechas
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
}

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente.');
  } catch (error) {
    console.error('❌ No se pudo conectar a la base de datos:', error.message);
  }
};

// Probar conexión al importar el módulo
testConnection();

module.exports = sequelize;
