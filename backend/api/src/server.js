const app = require('./app');
const dotenv = require('dotenv');
const { initDB } = require('./seeders/init');
dotenv.config();

const PORT = process.env.PORT || 4000;
const sequelize = require('./config/db');

const startServer = async () => {
  try {
    // Autenticar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la BD exitosa');

    // Inicializar datos básicos
    const dbInit = await initDB();
    if (!dbInit) {
      console.warn('⚠️ Algunos datos iniciales no pudieron ser creados');
    }

    // Iniciar servidor
    app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
  } catch (err) {
    console.error('❌ Error al iniciar el servidor:', err);
    process.exit(1);
  }
};

startServer();
