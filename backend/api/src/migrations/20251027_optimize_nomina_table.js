/**
 * Migración: Optimizar tabla nomina_empleados
 * Fecha: 2025-10-27
 * 
 * Elimina campos redundantes e innecesarios:
 * - aplicar_isr, aplicar_imss, aplicar_infonavit (usar deducciones_* = 0 en su lugar)
 * - deducciones (es la suma de las otras, calcular en tiempo real)
 * - archivo_pdf_path (duplicado de recibo_pdf)
 * - es_pago_semanal (siempre true)
 * - Campos de auditoría innecesarios (version, creada_por, revisada_por, pagada_por, fecha_revision, motivo_ultimo_cambio)
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando optimización de tabla nomina_empleados...');

    try {
      const tableDescription = await queryInterface.describeTable('nomina_empleados');
      
      // Eliminar campos BOOLEAN redundantes
      if (tableDescription.aplicar_isr) {
        console.log('➖ Eliminando columna aplicar_isr...');
        await queryInterface.removeColumn('nomina_empleados', 'aplicar_isr');
      }
      
      if (tableDescription.aplicar_imss) {
        console.log('➖ Eliminando columna aplicar_imss...');
        await queryInterface.removeColumn('nomina_empleados', 'aplicar_imss');
      }
      
      if (tableDescription.aplicar_infonavit) {
        console.log('➖ Eliminando columna aplicar_infonavit...');
        await queryInterface.removeColumn('nomina_empleados', 'aplicar_infonavit');
      }

      // Eliminar campo deducciones (suma redundante)
      if (tableDescription.deducciones) {
        console.log('➖ Eliminando columna deducciones (se calculará en tiempo real)...');
        await queryInterface.removeColumn('nomina_empleados', 'deducciones');
      }

      // Eliminar archivo_pdf_path (duplicado)
      if (tableDescription.archivo_pdf_path) {
        console.log('➖ Eliminando columna archivo_pdf_path (duplicado de recibo_pdf)...');
        await queryInterface.removeColumn('nomina_empleados', 'archivo_pdf_path');
      }

      // Eliminar es_pago_semanal (siempre true)
      if (tableDescription.es_pago_semanal) {
        console.log('➖ Eliminando columna es_pago_semanal (siempre true)...');
        await queryInterface.removeColumn('nomina_empleados', 'es_pago_semanal');
      }

      // Eliminar campos de auditoría innecesarios
      const auditFields = ['version', 'creada_por', 'revisada_por', 'pagada_por', 'fecha_revision', 'motivo_ultimo_cambio'];
      
      for (const field of auditFields) {
        if (tableDescription[field]) {
          console.log(`➖ Eliminando columna ${field}...`);
          await queryInterface.removeColumn('nomina_empleados', field);
        }
      }

      // Asegurar que deducciones_isr, deducciones_imss, deducciones_infonavit permitan NULL y default 0
      console.log('✏️ Actualizando columnas de deducciones para permitir NULL con default 0...');
      
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

      console.log('✅ Optimización completada exitosamente');
      console.log('\n📋 Resumen de cambios:');
      console.log('   ➖ Eliminados: aplicar_isr, aplicar_imss, aplicar_infonavit');
      console.log('   ➖ Eliminados: deducciones, archivo_pdf_path, es_pago_semanal');
      console.log('   ➖ Eliminados: version, creada_por, revisada_por, pagada_por, fecha_revision, motivo_ultimo_cambio');
      console.log('   ✏️ Actualizados: deducciones_isr, deducciones_imss, deducciones_infonavit (NULL + default 0)');
      console.log('\n💡 Ahora: 0 = no aplicado, >0 = monto aplicado');
      
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revirtiendo optimización de tabla nomina_empleados...');

    try {
      // Restaurar campos BOOLEAN
      await queryInterface.addColumn('nomina_empleados', 'aplicar_isr', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });

      await queryInterface.addColumn('nomina_empleados', 'aplicar_imss', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });

      await queryInterface.addColumn('nomina_empleados', 'aplicar_infonavit', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });

      // Restaurar deducciones
      await queryInterface.addColumn('nomina_empleados', 'deducciones', {
        type: Sequelize.DECIMAL(10, 2)
      });

      // Restaurar archivo_pdf_path
      await queryInterface.addColumn('nomina_empleados', 'archivo_pdf_path', {
        type: Sequelize.STRING(500),
        allowNull: true
      });

      // Restaurar es_pago_semanal
      await queryInterface.addColumn('nomina_empleados', 'es_pago_semanal', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });

      // Restaurar campos de auditoría
      await queryInterface.addColumn('nomina_empleados', 'version', {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1
      });

      await queryInterface.addColumn('nomina_empleados', 'creada_por', {
        type: Sequelize.INTEGER,
        allowNull: true
      });

      await queryInterface.addColumn('nomina_empleados', 'revisada_por', {
        type: Sequelize.INTEGER,
        allowNull: true
      });

      await queryInterface.addColumn('nomina_empleados', 'pagada_por', {
        type: Sequelize.INTEGER,
        allowNull: true
      });

      await queryInterface.addColumn('nomina_empleados', 'fecha_revision', {
        type: Sequelize.DATE,
        allowNull: true
      });

      await queryInterface.addColumn('nomina_empleados', 'motivo_ultimo_cambio', {
        type: Sequelize.TEXT,
        allowNull: true
      });

      console.log('✅ Reversión completada');
    } catch (error) {
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};
