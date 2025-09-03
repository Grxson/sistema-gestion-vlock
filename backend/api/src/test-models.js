// Script para probar la carga de modelos
const models = require('./models');

async function testDatabaseConnection() {
    try {
        await models.sequelize.authenticate();

        // Mostrar todos los modelos cargados
        Object.keys(models).forEach(modelName => {
            if (modelName !== 'sequelize') {
            }
        });

        // Cerrar la conexión
        await models.sequelize.close();
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

// Ejecutar la función de prueba
testDatabaseConnection();
