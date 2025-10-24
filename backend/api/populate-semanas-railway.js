/**
 * Script para poblar la tabla semanas_nominas con todas las semanas del año 2025
 * Específico para la base de datos de Railway
 */

const fs = require('fs');
const path = require('path');
const { generarInfoSemana } = require('./src/utils/weekCalculator');

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
    console.log('✅ Variables de entorno cargadas desde src/.env\n');
} else {
    console.error('❌ No se encontró el archivo src/.env');
    process.exit(1);
}

// Usar la configuración de sequelize existente del proyecto
const sequelize = require('./src/config/db');
const { DataTypes } = require('sequelize');

// Definir modelo SemanaNomina
const SemanaNomina = sequelize.define('semanas_nomina', {
    id_semana: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    anio: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    semana_iso: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    etiqueta: {
        type: DataTypes.STRING(50)
    },
    fecha_inicio: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    fecha_fin: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    estado: {
        type: DataTypes.ENUM('Borrador', 'En_Proceso', 'Cerrada'),
        defaultValue: 'Borrador'
    }
}, {
    tableName: 'semanas_nominas',
    timestamps: true
});

async function populateSemanasRailway() {
    try {
        console.log('🚀 POBLANDO SEMANAS DEL AÑO 2025 EN RAILWAY\n');
        
        // Verificar que DATABASE_URL existe
        if (!process.env.DATABASE_URL) {
            console.error('❌ ERROR: DATABASE_URL no encontrada en src/.env');
            console.error('   Verifica que el archivo src/.env existe y contiene DATABASE_URL\n');
            process.exit(1);
        }
        
        // Extraer host de la URL para mostrar
        const urlMatch = process.env.DATABASE_URL.match(/@([^:\/]+)/);
        const host = urlMatch ? urlMatch[1] : 'Railway';
        console.log(`📡 Conectando a Railway: ${host}\n`);
        
        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a Railway establecida correctamente\n');
        
        const semanas = [];
        const año = 2025;
        
        // Generar todas las semanas del año 2025
        console.log('📅 Generando semanas del año 2025...\n');
        let fecha = new Date(año, 0, 1); // 1 de enero de 2025
        const finAño = new Date(año, 11, 31); // 31 de diciembre de 2025
        
        const semanasGeneradas = new Set();
        
        while (fecha <= finAño) {
            const infoSemana = generarInfoSemana(fecha);
            
            // Crear una clave única para evitar duplicados
            const clave = `${infoSemana.año}-${infoSemana.semanaISO}`;
            
            if (!semanasGeneradas.has(clave)) {
                semanasGeneradas.add(clave);
                
                semanas.push({
                    anio: infoSemana.año,
                    semana_iso: infoSemana.semanaISO,
                    etiqueta: infoSemana.etiqueta,
                    fecha_inicio: infoSemana.fechaInicio.toISOString().split('T')[0],
                    fecha_fin: infoSemana.fechaFin.toISOString().split('T')[0],
                    estado: 'Borrador'
                });
            }
            
            // Avanzar 7 días
            fecha.setDate(fecha.getDate() + 7);
        }
        
        console.log(`📊 Total de semanas a insertar: ${semanas.length}\n`);
        
        // Eliminar todas las semanas existentes del 2025 para evitar conflictos
        console.log('🗑️  Eliminando semanas existentes del 2025 en Railway...');
        const deleted = await SemanaNomina.destroy({
            where: {
                anio: 2025
            }
        });
        console.log(`   ✅ Eliminadas ${deleted} semanas\n`);
        
        // Insertar las nuevas semanas
        console.log('➕ Insertando nuevas semanas en Railway...\n');
        
        let insertadas = 0;
        for (const semana of semanas) {
            try {
                await SemanaNomina.create(semana);
                insertadas++;
                
                if (insertadas % 10 === 0) {
                    console.log(`   ✅ ${insertadas}/${semanas.length} semanas insertadas...`);
                }
            } catch (error) {
                console.error(`   ❌ Error insertando semana ${semana.semana_iso}:`, error.message);
            }
        }
        
        console.log(`\n✅ ${insertadas} semanas insertadas exitosamente en Railway\n`);
        
        // Mostrar resumen de semanas de octubre
        console.log('📅 SEMANAS DE OCTUBRE 2025 EN RAILWAY:\n');
        const semanasOctubre = await SemanaNomina.findAll({
            where: {
                anio: 2025
            },
            order: [['semana_iso', 'ASC']]
        });
        
        let semanasOctubreMostradas = 0;
        semanasOctubre.forEach(semana => {
            const fechaInicio = new Date(semana.fecha_inicio);
            const fechaFin = new Date(semana.fecha_fin);
            if ((fechaInicio.getMonth() === 9 || fechaFin.getMonth() === 9)) {
                console.log(`   ID: ${semana.id_semana} | Semana ISO: ${semana.semana_iso}`);
                console.log(`   ${semana.etiqueta}`);
                console.log(`   Período: ${semana.fecha_inicio} al ${semana.fecha_fin}\n`);
                semanasOctubreMostradas++;
            }
        });
        
        // Mostrar semana actual
        const hoy = new Date();
        const infoSemanaActual = generarInfoSemana(hoy);
        console.log('🎯 SEMANA ACTUAL DEL SISTEMA:');
        console.log(`   Año: ${infoSemanaActual.año}`);
        console.log(`   Semana ISO: ${infoSemanaActual.semanaISO}`);
        console.log(`   ${infoSemanaActual.etiqueta}`);
        console.log(`   Período: ${infoSemanaActual.fechaInicio.toISOString().split('T')[0]} al ${infoSemanaActual.fechaFin.toISOString().split('T')[0]}\n`);
        
        console.log('✅ PROCESO COMPLETADO EN RAILWAY\n');
        console.log('💡 Próximos pasos:');
        console.log('   1. Reinicia el backend');
        console.log('   2. Recarga el frontend (F5)');
        console.log('   3. Crea nóminas para la Semana ISO 43 (semana actual)\n');
        
        await sequelize.close();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        console.error('\n💡 Verifica:');
        console.error('   1. Que DATABASE_URL esté correcta en src/.env');
        console.error('   2. Que tengas conexión a internet');
        console.error('   3. Que Railway esté accesible\n');
        process.exit(1);
    }
}

populateSemanasRailway();
