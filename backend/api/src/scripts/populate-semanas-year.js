/**
 * Script para poblar la tabla semanas_nominas con las semanas ISO de cualquier año
 * Uso: node src/scripts/populate-semanas-year.js [año]
 * Ejemplo: node src/scripts/populate-semanas-year.js 2026
 * Si no se especifica año, usa el año actual
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde src/.env
const envPath = path.join(__dirname, '..', '.env');
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
    console.log('✅ Variables de entorno cargadas desde .env\n');
} else {
    console.error('❌ No se encontró el archivo .env en:', envPath);
    process.exit(1);
}

const sequelize = require('../config/db');
const { generarInfoSemana } = require('../utils/weekCalculator');

async function populateSemanasYear(año) {
  try {
    console.log(`🔄 Iniciando población de semanas ISO ${año} (algoritmo ISO 8601)...\n`);

    // Generar todas las semanas del año especificado
    const semanas = [];

    // Empezar desde el 1 de enero del año
    let fechaActual = new Date(año, 0, 1);
    const fechaFinal = new Date(año, 11, 31);

    const semanasVistas = new Set();

    while (fechaActual <= fechaFinal) {
      const infoSemana = generarInfoSemana(fechaActual);
      
      // Crear clave única para evitar duplicados
      const clave = `${infoSemana.año}-${infoSemana.semanaISO}`;
      
      if (!semanasVistas.has(clave)) {
        semanasVistas.add(clave);
        
        // Solo agregar si el año coincide o si es una semana que toca el año solicitado
        if (infoSemana.año === año || 
            infoSemana.fechaInicio.getFullYear() === año || 
            infoSemana.fechaFin.getFullYear() === año) {
          
          // Verificar si ya existe en la base de datos
          const [existente] = await sequelize.query(
            `SELECT id_semana FROM semanas_nominas WHERE anio = ? AND semana_iso = ?`,
            {
              replacements: [infoSemana.año, infoSemana.semanaISO]
            }
          );

          if (existente.length === 0) {
            semanas.push({
              anio: infoSemana.año,
              semana_iso: infoSemana.semanaISO,
              etiqueta: infoSemana.etiqueta,
              fecha_inicio: infoSemana.fechaInicio,
              fecha_fin: infoSemana.fechaFin,
              estado: 'Borrador'
            });
            
            console.log(`✓ Semana ${infoSemana.semanaISO} de ${infoSemana.año}: ${infoSemana.etiqueta}`);
            console.log(`  Rango: ${infoSemana.fechaInicio.toLocaleDateString('es-MX')} - ${infoSemana.fechaFin.toLocaleDateString('es-MX')}`);
          } else {
            console.log(`⏭️  Semana ${infoSemana.semanaISO} de ${infoSemana.año} ya existe, omitiendo...`);
          }
        }
      }
      
      // Avanzar 7 días
      fechaActual.setDate(fechaActual.getDate() + 7);
    }

    if (semanas.length === 0) {
      console.log(`\n✅ Todas las semanas del año ${año} ya existen en la base de datos`);
      process.exit(0);
    }

    console.log(`\n📊 Total de semanas nuevas a insertar: ${semanas.length}`);
    console.log('💾 Insertando en la base de datos...\n');

    // Insertar todas las semanas en la base de datos
    for (const semana of semanas) {
      await sequelize.query(
        `INSERT INTO semanas_nominas (anio, semana_iso, etiqueta, fecha_inicio, fecha_fin, estado, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        {
          replacements: [
            semana.anio,
            semana.semana_iso,
            semana.etiqueta,
            semana.fecha_inicio,
            semana.fecha_fin,
            semana.estado
          ]
        }
      );
    }

    console.log('✅ Todas las semanas han sido insertadas exitosamente');
    console.log(`📋 Total de registros insertados: ${semanas.length} semanas\n`);

    // Mostrar resumen
    console.log('📊 Resumen de semanas insertadas por año:');
    const semanasPorAño = {};
    semanas.forEach(s => {
      semanasPorAño[s.anio] = (semanasPorAño[s.anio] || 0) + 1;
    });
    Object.entries(semanasPorAño).forEach(([año, cantidad]) => {
      console.log(`   ${año}: ${cantidad} semanas`);
    });

    console.log('\n💡 Tip: El sistema creará automáticamente las semanas que falten cuando se necesiten.');
    console.log('   Este script es opcional y solo sirve para pre-poblar la base de datos.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar semanas:', error);
    process.exit(1);
  }
}

// Obtener año de los argumentos o usar el año actual
const añoArgumento = process.argv[2];
const año = añoArgumento ? parseInt(añoArgumento) : new Date().getFullYear();

if (isNaN(año) || año < 2000 || año > 2100) {
  console.error('❌ Año inválido. Debe ser un número entre 2000 y 2100.');
  console.log('Uso: node src/scripts/populate-semanas-year.js [año]');
  console.log('Ejemplo: node src/scripts/populate-semanas-year.js 2026');
  process.exit(1);
}

// Ejecutar el script
populateSemanasYear(año);
