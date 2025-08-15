const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();

const PORT = process.env.PORT || 4000; 
const sequelize = require('./config/db');

sequelize.authenticate()
  .then(() => {
    console.log('✅ Conexión a la BD exitosa');
    app.listen(PORT, () => console.log(`🚀 Servidor escuchando en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error al conectar a la BD:', err));
