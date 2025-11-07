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
        const originalName = model.name;

        // Registrar el modelo bajo ambos nombres para compatibilidad
        models[modelName] = model;
        models[originalName] = model;

        console.log(`Modelo registrado: ${modelName} y ${originalName}`);

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

// --- AUTO FIX ESQUEMA NOMINA (periodo, semana) ---
// En producción se observó error "Unknown column 'nomina_empleado.periodo'".
// Este bloque verifica si las columnas existen y las crea en caliente si faltan.
(async () => {
    try {
        const qi = sequelize.getQueryInterface();
        const table = 'nomina_empleados';
        const desc = await qi.describeTable(table).catch(() => null);
        if (!desc) {
            console.warn(`⚠️ No se pudo describir la tabla ${table}; omitiendo auto-fix de columnas periodo/semana.`);
            return;
        }
        const faltaPeriodo = !desc.periodo;
        const faltaSemana = !desc.semana;
        if (!faltaPeriodo && !faltaSemana) {
            return; // Nada que hacer
        }
        console.log('🔧 Auto-fix nomina_empleados: columnas faltantes detectadas', { faltaPeriodo, faltaSemana });
        // Ejecutar alters de manera independiente para minimizar riesgo
        if (faltaPeriodo) {
            try {
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN periodo VARCHAR(7) NULL COMMENT 'Periodo en formato YYYY-MM' AFTER monto_pagado`);
                console.log('✅ Columna periodo creada');
            } catch (e) {
                if (!/Duplicate column|exists/i.test(e.message)) console.error('❌ Error creando columna periodo:', e.message);
            }
        }
        if (faltaSemana) {
            try {
                // Colocar después de periodo si existe, sino después de monto_pagado
                const afterRef = faltaPeriodo ? 'monto_pagado' : 'periodo';
                await sequelize.query(`ALTER TABLE ${table} ADD COLUMN semana INT NULL COMMENT 'Número de semana del mes (1-5)' AFTER ${afterRef}`);
                console.log('✅ Columna semana creada');
            } catch (e) {
                if (!/Duplicate column|exists/i.test(e.message)) console.error('❌ Error creando columna semana:', e.message);
            }
        }
    } catch (err) {
        console.error('⚠️ Auto-fix columnas periodo/semana falló:', err.message);
    }
})();

// Exportar modelos y conexión
models.sequelize = sequelize;

module.exports = models;
