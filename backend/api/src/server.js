const app = require('./app');
const dotenv = require('dotenv');
const { initDB } = require('./seeders/init');
dotenv.config();

const PORT = process.env.PORT || 4000;
const sequelize = require('./config/db');

const startServer = async () => {
  try {
    console.log('🚀 Iniciando servidor...');
    
    // Intentar conexión a la base de datos con reintentos
    let dbConnected = false;
    const maxRetries = 5;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la BD exitosa');
        dbConnected = true;
        break;
      } catch (err) {
        console.error(`❌ Intento ${i + 1}/${maxRetries} - Error conectando a BD:`, err.message);
        if (i === maxRetries - 1) {
          console.error('❌ No se pudo establecer conexión con la base de datos después de varios intentos');
          // En producción, continuar sin BD para que el healthcheck funcione
          if (process.env.NODE_ENV === 'production') {
            console.log('⚠️ Continuando sin BD en producción para healthcheck...');
            break;
          } else {
            process.exit(1);
          }
        }
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    // Solo inicializar datos si la BD está conectada
    if (dbConnected) {
      try {
        const dbInit = await initDB();
        if (!dbInit) {
          console.warn('⚠️ Algunos datos iniciales no pudieron ser creados');
        } else {
          console.log('✅ Datos iniciales verificados/creados correctamente');
        }
      } catch (err) {
        console.warn('⚠️ Error inicializando datos:', err.message);
      }
    }

    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor escuchando en puerto ${PORT}`);
      console.log(`🌐 Entorno: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 Base de datos: ${dbConnected ? 'Conectada' : 'Desconectada'}`);
    });

    // Manejar cierre graceful
    process.on('SIGTERM', () => {
      console.log('🛑 Recibida señal SIGTERM, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('🛑 Recibida señal SIGINT, cerrando servidor...');
      server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

startServer();
