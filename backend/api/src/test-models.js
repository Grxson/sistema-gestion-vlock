// Script para probar la carga de modelos
const models = require('./models');

async function testDatabaseConnection() {
    try {
        console.log('Probando conexión a la base de datos...');
        await models.sequelize.authenticate();
        console.log('Conexión establecida correctamente.');

        // Mostrar todos los modelos cargados
        console.log('\nModelos cargados:');
        Object.keys(models).forEach(modelName => {
            if (modelName !== 'sequelize') {
                console.log(`- ${modelName}: ${models[modelName].name}`);
            }
        });

        // Cerrar la conexión
        await models.sequelize.close();
        console.log('\nConexión cerrada correctamente.');
    } catch (error) {
        console.error('Error al conectar con la base de datos:', error);
    }
}

// Ejecutar la función de prueba
testDatabaseConnection();
