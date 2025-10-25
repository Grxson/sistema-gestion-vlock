/**
 * Script para limpiar todas las tablas relacionadas con nóminas
 * ADVERTENCIA: Este script eliminará TODOS los datos de nóminas
 * Ejecutar solo si estás seguro de querer empezar de cero
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
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function truncateNominas() {
  try {
    console.log('\n⚠️  ADVERTENCIA: Este script eliminará TODOS los datos de nóminas');
    console.log('📋 Tablas que serán limpiadas:');
    console.log('   - nomina_historials');
    console.log('   - pagos_nominas');
    console.log('   - adeudos_empleados');
    console.log('   - nomina_empleados');
    console.log('   - semanas_nominas');
    console.log('\n');

    rl.question('¿Estás seguro de que quieres continuar? (escribe "SI" para confirmar): ', async (answer) => {
      if (answer.toUpperCase() !== 'SI') {
        console.log('❌ Operación cancelada');
        rl.close();
        process.exit(0);
      }

      try {
        console.log('\n🔄 Iniciando limpieza de tablas...\n');

        // Deshabilitar verificación de claves foráneas
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
        console.log('✓ Claves foráneas deshabilitadas temporalmente');

        // Limpiar tabla de historial de nóminas (nombre correcto: nomina_historials)
        await sequelize.query('TRUNCATE TABLE nomina_historials');
        console.log('✓ Tabla nomina_historials limpiada');

        // Limpiar tabla de pagos de nóminas (nombre correcto: pagos_nominas)
        await sequelize.query('TRUNCATE TABLE pagos_nominas');
        console.log('✓ Tabla pagos_nominas limpiada');

        // Limpiar tabla de adeudos de empleados
        await sequelize.query('TRUNCATE TABLE adeudos_empleados');
        console.log('✓ Tabla adeudos_empleados limpiada');

        // Limpiar tabla principal de nóminas
        await sequelize.query('TRUNCATE TABLE nomina_empleados');
        console.log('✓ Tabla nomina_empleados limpiada');

        // Limpiar tabla de semanas de nómina
        await sequelize.query('TRUNCATE TABLE semanas_nominas');
        console.log('✓ Tabla semanas_nominas limpiada');

        // Rehabilitar verificación de claves foráneas
        await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('✓ Claves foráneas rehabilitadas');

        console.log('\n✅ Todas las tablas de nóminas han sido limpiadas exitosamente');
        console.log('⚠️  Ahora puedes empezar a crear nóminas con el algoritmo corregido\n');

        rl.close();
        process.exit(0);
      } catch (error) {
        console.error('\n❌ Error al limpiar las tablas:', error);
        
        // Intentar rehabilitar claves foráneas en caso de error
        try {
          await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
        } catch (e) {
          console.error('Error al rehabilitar claves foráneas:', e);
        }
        
        rl.close();
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
    rl.close();
    process.exit(1);
  }
}

// Ejecutar el script
truncateNominas();
