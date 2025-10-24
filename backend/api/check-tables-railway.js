/**
 * Script para verificar qué tablas de semanas existen en Railway
 */

const fs = require('fs');
const path = require('path');

// Leer variables de entorno manualmente desde src/.env
const envPath = path.join(__dirname, 'src', '.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim();
                process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
            }
        }
    });
}

const sequelize = require('./src/config/db');

async function checkTables() {
    try {
        console.log('🔍 VERIFICANDO TABLAS DE SEMANAS EN RAILWAY\n');
        
        await sequelize.authenticate();
        console.log('✅ Conectado a Railway\n');
        
        // Consultar todas las tablas
        const [tables] = await sequelize.query("SHOW TABLES");
        
        console.log('📋 TODAS LAS TABLAS EN LA BASE DE DATOS:\n');
        const tableNames = tables.map(t => Object.values(t)[0]);
        tableNames.forEach(table => {
            console.log(`   - ${table}`);
        });
        
        console.log('\n🔍 BUSCANDO TABLAS DE SEMANAS:\n');
        
        const semanaTables = tableNames.filter(t => t.toLowerCase().includes('semana'));
        
        if (semanaTables.length === 0) {
            console.log('   ❌ No se encontraron tablas de semanas\n');
        } else {
            for (const tableName of semanaTables) {
                console.log(`\n📊 Tabla: ${tableName}`);
                
                // Contar registros
                const [countResult] = await sequelize.query(`SELECT COUNT(*) as total FROM \`${tableName}\``);
                const total = countResult[0].total;
                console.log(`   Total de registros: ${total}`);
                
                if (total > 0) {
                    // Mostrar estructura
                    const [columns] = await sequelize.query(`DESCRIBE \`${tableName}\``);
                    console.log('   Columnas:');
                    columns.forEach(col => {
                        console.log(`      - ${col.Field} (${col.Type})`);
                    });
                    
                    // Mostrar algunos registros de ejemplo
                    const [rows] = await sequelize.query(`SELECT * FROM \`${tableName}\` LIMIT 5`);
                    console.log('\n   Primeros 5 registros:');
                    rows.forEach((row, i) => {
                        console.log(`      ${i + 1}. ID: ${row.id_semana} | Año: ${row.anio} | Semana ISO: ${row.semana_iso}`);
                    });
                }
            }
        }
        
        // Verificar qué tabla usa el modelo de nóminas
        console.log('\n\n🔍 VERIFICANDO FOREIGN KEYS EN nomina_empleados:\n');
        const [fks] = await sequelize.query(`
            SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
            FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
            WHERE TABLE_NAME = 'nomina_empleados'
            AND REFERENCED_TABLE_NAME IS NOT NULL
            AND TABLE_SCHEMA = DATABASE()
        `);
        
        fks.forEach(fk => {
            console.log(`   ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
        });
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkTables();
