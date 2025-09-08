const fs = require('fs');
const path = require('path');
const sequelize = require('../config/db');
const { DataTypes } = require('sequelize');

// Objeto que contendrá todos los modelos
const models = {};

// Cargar todos los modelos primero
fs.readdirSync(__dirname)
    .filter(file => file !== 'index.js' && file.endsWith('.model.js'))
    .forEach(file => {
        const modelPath = path.join(__dirname, file);
        const model = require(modelPath)(sequelize);

        // Registrar el modelo usando el nombre exacto que tiene en su definición
        const modelName = model.name.charAt(0).toUpperCase() + model.name.slice(1);

        // Registrar el modelo bajo un nombre estándar
        models[modelName] = model;

    });

// Crear una función segura para establecer las asociaciones
function safeAssociate(model, modelName) {
    if (!model || typeof model.associate !== 'function') return;

    try {
        // Antes de establecer asociaciones, verificamos cada modelo referenciado
        const originalAssociate = model.associate;

        model.associate = function (allModels) {
            try {
                originalAssociate.call(this, allModels);
            } catch (error) {
                console.error(`Error en asociación de ${modelName}: ${error.message}`);
                // Opcional: implementar corrección específica según el error
            }
        };
    } catch (error) {
        console.error(`No se pudo configurar asociaciones para ${modelName}: ${error.message}`);
    }
}

// Configurar los métodos associate seguros
Object.keys(models).forEach(modelName => {
    safeAssociate(models[modelName], modelName);
});

// Establecer todas las asociaciones
Object.keys(models).forEach(modelName => {
    const model = models[modelName];
    if (model && typeof model.associate === 'function') {
        try {
            model.associate(models);
        } catch (error) {
            console.error(`Error al establecer asociaciones para ${modelName}:`, error.message);
        }
    }
});

// Exportar modelos y conexión
models.sequelize = sequelize;

module.exports = models;
