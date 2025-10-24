/**
 * Script para verificar las foreign keys de nomina_empleados
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

async function checkForeignKeys() {
    try {
        console.log('🔍 VERIFICANDO FOREIGN KEYS EN RAILWAY\n');
        
        await sequelize.authenticate();
        console.log('✅ Conectado a Railway\n');
        
        // Verificar foreign keys de nomina_empleados
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
        
        console.log('📋 FOREIGN KEYS DE nomina_empleados:\n');
        fks.forEach(fk => {
            console.log(`   ${fk.COLUMN_NAME} → ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`);
            if (fk.COLUMN_NAME === 'id_semana') {
                console.log(`   ⭐ LA TABLA DE SEMANAS QUE USA ES: ${fk.REFERENCED_TABLE_NAME}\n`);
            }
        });
        
        // Verificar si hay nóminas y a qué tabla apuntan
        console.log('\n🔍 VERIFICANDO NÓMINAS EXISTENTES:\n');
        const [nominas] = await sequelize.query(`
            SELECT COUNT(*) as total FROM nomina_empleados
        `);
        console.log(`   Total de nóminas: ${nominas[0].total}\n`);
        
        if (nominas[0].total > 0) {
            // Ver algunas nóminas y sus id_semana
            const [nominasDetalle] = await sequelize.query(`
                SELECT id_nomina, id_empleado, id_semana, estado
                FROM nomina_empleados
                LIMIT 10
            `);
            
            console.log('   Primeras 10 nóminas:');
            nominasDetalle.forEach(n => {
                console.log(`      Nómina ${n.id_nomina} | Empleado: ${n.id_empleado} | id_semana: ${n.id_semana} | Estado: ${n.estado}`);
            });
            
            // Verificar si esos id_semana existen en alguna tabla
            const uniqueIdSemanas = [...new Set(nominasDetalle.map(n => n.id_semana))];
            console.log(`\n   IDs de semana únicos en nóminas: ${uniqueIdSemanas.join(', ')}\n`);
            
            for (const idSemana of uniqueIdSemanas) {
                // Buscar en semanas_nomina
                const [enSingular] = await sequelize.query(`
                    SELECT COUNT(*) as total FROM semanas_nomina WHERE id_semana = ${idSemana}
                `);
                
                // Buscar en semanas_nominas
                const [enPlural] = await sequelize.query(`
                    SELECT COUNT(*) as total FROM semanas_nominas WHERE id_semana = ${idSemana}
                `);
                
                console.log(`   ID ${idSemana}:`);
                console.log(`      - En semanas_nomina (singular): ${enSingular[0].total > 0 ? '✅ EXISTE' : '❌ NO EXISTE'}`);
                console.log(`      - En semanas_nominas (plural): ${enPlural[0].total > 0 ? '✅ EXISTE' : '❌ NO EXISTE'}`);
            }
        }
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkForeignKeys();
