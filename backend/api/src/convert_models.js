/**
 * Script para convertir los modelos de ES Modules a CommonJS
 */
const fs = require('fs');
const path = require('path');

// Carpeta de modelos
const modelsDir = path.join(__dirname, 'models');

// Lee todos los archivos del directorio
const files = fs.readdirSync(modelsDir);

// Filtra solo los archivos model.js
const modelFiles = files.filter(file => file.endsWith('.model.js'));

let convertedCount = 0;

// Procesa cada archivo
modelFiles.forEach(file => {
    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Verifica si el archivo usa export default
    if (content.includes('export default')) {
        console.log(`Convirtiendo ${file} a CommonJS...`);

        // Reemplaza el patrón export default con la sintaxis de CommonJS
        const newContent = content.replace(
            /export default \(sequelize, DataTypes\) => {/,
            'const { DataTypes } = require(\'sequelize\');\n\nmodule.exports = (sequelize) => {'
        );

        // Guarda el archivo modificado
        fs.writeFileSync(filePath, newContent);
        convertedCount++;
    }
});

console.log(`Conversión completada. ${convertedCount} archivos convertidos a CommonJS.`);
