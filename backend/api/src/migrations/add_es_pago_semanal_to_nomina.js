'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando migración: agregar campo es_pago_semanal a nomina_empleado...');

    // Verificar si la columna ya existe
    const [results] = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nomina_empleados' AND COLUMN_NAME = 'es_pago_semanal';`
    );

    if (results.length === 0) {
      // Agregar la columna es_pago_semanal
      await queryInterface.addColumn('nomina_empleados', 'es_pago_semanal', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el empleado tiene pago semanal'
      });
      console.log('✅ Columna es_pago_semanal agregada');
    } else {
      console.log('⚠️ Columna es_pago_semanal ya existe, omitiendo adición.');
    }

    // Actualizar registros existentes basándose en el pago_por_dia
    // Si el pago_por_dia es múltiplo de 7 y mayor a 1000, probablemente es pago semanal
    await queryInterface.sequelize.query(
      `UPDATE nomina_empleados SET es_pago_semanal = true 
       WHERE pago_por_dia >= 1000 AND pago_por_dia % 7 = 0;`
    );
    console.log('✅ Registros existentes actualizados');

    console.log('🎉 Migración completada exitosamente');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando reversión de migración: eliminar campo es_pago_semanal...');

    // Verificar si la columna existe
    const [results] = await queryInterface.sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nomina_empleados' AND COLUMN_NAME = 'es_pago_semanal';`
    );

    if (results.length > 0) {
      // Eliminar la columna es_pago_semanal
      await queryInterface.removeColumn('nomina_empleados', 'es_pago_semanal');
      console.log('✅ Columna es_pago_semanal eliminada');
    } else {
      console.log('⚠️ Columna es_pago_semanal no existe, omitiendo eliminación.');
    }

    console.log('🎉 Reversión de migración completada exitosamente');
  }
};
