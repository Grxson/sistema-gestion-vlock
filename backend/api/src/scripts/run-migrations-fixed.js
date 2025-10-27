/**
 * Script para ejecutar migraciones con path correcto al .env
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const sequelize = require('../config/db');

async function runMigrations() {
  try {
    console.log('🚀 Iniciando ejecución de migraciones...\n');
    console.log(`📁 DB_NAME: ${process.env.DB_NAME || 'NO DEFINIDO'}`);
    console.log(`📁 DB_USER: ${process.env.DB_USER || 'NO DEFINIDO'}`);
    console.log(`📁 DB_HOST: ${process.env.DB_HOST || 'NO DEFINIDO'}\n`);

    // Probar conexión
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    const queryInterface = sequelize.getQueryInterface();
    const Sequelize = sequelize.Sequelize;

    // ============================================
    // MIGRACIÓN 1: Agregar columna descuentos
    // ============================================
    console.log('📝 Migración 1: Agregar columna descuentos...');
    
    const tableDescription = await queryInterface.describeTable('nomina_empleados');
    
    if (!tableDescription.descuentos) {
      console.log('➕ Agregando columna descuentos...');
      await queryInterface.addColumn('nomina_empleados', 'descuentos', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
        comment: 'Descuentos adicionales (adelantos, préstamos, etc.)'
      });
      console.log('✅ Columna descuentos agregada\n');
    } else {
      console.log('ℹ️ La columna descuentos ya existe\n');
    }

    // ============================================
    // MIGRACIÓN 2: Eliminar campos redundantes
    // ============================================
    console.log('📝 Migración 2: Eliminar campos redundantes...');
    
    const tableDesc = await queryInterface.describeTable('nomina_empleados');
    
    // Eliminar checkboxes redundantes
    const fieldsToRemove = [
      'aplicar_isr',
      'aplicar_imss',
      'aplicar_infonavit',
      'deducciones',
      'archivo_pdf_path',
      'es_pago_semanal',
      'version',
      'creada_por',
      'revisada_por',
      'pagada_por',
      'fecha_revision',
      'motivo_ultimo_cambio'
    ];

    for (const field of fieldsToRemove) {
      if (tableDesc[field]) {
        console.log(`➖ Eliminando columna ${field}...`);
        await queryInterface.removeColumn('nomina_empleados', field);
      }
    }

    console.log('✅ Campos redundantes eliminados\n');

    // ============================================
    // MIGRACIÓN 3: Actualizar columnas de deducciones
    // ============================================
    console.log('📝 Migración 3: Actualizar columnas de deducciones...');
    
    await queryInterface.changeColumn('nomina_empleados', 'deducciones_isr', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de ISR (0 = no aplicado, >0 = monto aplicado)'
    });

    await queryInterface.changeColumn('nomina_empleados', 'deducciones_imss', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de IMSS (0 = no aplicado, >0 = monto aplicado)'
    });

    await queryInterface.changeColumn('nomina_empleados', 'deducciones_infonavit', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Monto de Infonavit (0 = no aplicado, >0 = monto aplicado)'
    });

    await queryInterface.changeColumn('nomina_empleados', 'deducciones_adicionales', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0,
      comment: 'Otras deducciones'
    });

    console.log('✅ Columnas de deducciones actualizadas\n');

    // ============================================
    // Verificación final
    // ============================================
    console.log('🎉 ¡Todas las migraciones ejecutadas exitosamente!\n');
    console.log('📋 Resumen de cambios:');
    console.log('   ✅ Columna "descuentos" agregada');
    console.log('   ✅ Eliminados campos redundantes (aplicar_isr, aplicar_imss, aplicar_infonavit)');
    console.log('   ✅ Eliminados campos innecesarios (deducciones, archivo_pdf_path, es_pago_semanal)');
    console.log('   ✅ Eliminados campos de auditoría (version, creada_por, etc.)');
    console.log('   ✅ Tabla optimizada y simplificada\n');
    console.log('💡 Ahora: 0 = no aplicado, >0 = monto manual\n');
    console.log('⚠️  IMPORTANTE: Reinicia el backend para cargar el modelo actualizado');

    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error ejecutando migraciones:', error);
    console.error('\nDetalles del error:', error.message);
    process.exit(1);
  }
}

runMigrations();
