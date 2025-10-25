/**
 * Script para poblar la tabla semanas_nominas con las 53 semanas ISO del año 2025
 * Versión corregida con algoritmo ISO 8601 correcto
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

async function populateSemanas2025() {
  try {
    console.log('🔄 Iniciando población de semanas ISO 2025 (algoritmo corregido)...\n');

    // Generar todas las semanas del 2025
    const semanas = [];
    const año = 2025;

    // Empezar desde el 1 de enero de 2025
    let fechaActual = new Date(2025, 0, 1); // 1 de enero de 2025
    const fechaFinal = new Date(2025, 11, 31); // 31 de diciembre de 2025

    const semanasVistas = new Set();

    while (fechaActual <= fechaFinal) {
      const infoSemana = generarInfoSemana(fechaActual);
      
      // Crear clave única para evitar duplicados
      const clave = `${infoSemana.año}-${infoSemana.semanaISO}`;
      
      if (!semanasVistas.has(clave)) {
        semanasVistas.add(clave);
        
        // Solo agregar si el año es 2025 o si es una semana que toca 2025
        if (infoSemana.año === 2025 || 
            infoSemana.fechaInicio.getFullYear() === 2025 || 
            infoSemana.fechaFin.getFullYear() === 2025) {
          
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
        }
      }
      
      // Avanzar 7 días
      fechaActual.setDate(fechaActual.getDate() + 7);
    }

    console.log(`\n📊 Total de semanas generadas: ${semanas.length}`);
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
    console.log(`📋 Total de registros: ${semanas.length} semanas\n`);

    // Mostrar resumen
    console.log('📊 Resumen de semanas por año:');
    const semanasPorAño = {};
    semanas.forEach(s => {
      semanasPorAño[s.anio] = (semanasPorAño[s.anio] || 0) + 1;
    });
    Object.entries(semanasPorAño).forEach(([año, cantidad]) => {
      console.log(`   ${año}: ${cantidad} semanas`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar semanas:', error);
    process.exit(1);
  }
}

// Ejecutar el script
populateSemanas2025();
