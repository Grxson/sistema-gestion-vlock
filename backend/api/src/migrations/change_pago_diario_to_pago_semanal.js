const { QueryInterface, DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Iniciando migración: cambiar pago_diario a pago_semanal...');
      
      // 1. Agregar la nueva columna pago_semanal
      await queryInterface.addColumn('empleados', 'pago_semanal', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Pago semanal del empleado'
      });
      
      console.log('✅ Columna pago_semanal agregada');
      
      // 2. Migrar datos existentes: convertir pago diario a semanal (multiplicar por 7)
      await queryInterface.sequelize.query(`
        UPDATE empleados 
        SET pago_semanal = pago_diario * 7 
        WHERE pago_diario IS NOT NULL AND pago_diario > 0;
      `);
      
      console.log('✅ Datos migrados de pago_diario a pago_semanal');
      
      // 3. Eliminar la columna pago_diario
      await queryInterface.removeColumn('empleados', 'pago_diario');
      
      console.log('✅ Columna pago_diario eliminada');
      console.log('🎉 Migración completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('🔄 Revirtiendo migración: cambiar pago_semanal a pago_diario...');
      
      // 1. Agregar la columna pago_diario
      await queryInterface.addColumn('empleados', 'pago_diario', {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Pago diario del empleado'
      });
      
      console.log('✅ Columna pago_diario agregada');
      
      // 2. Migrar datos: convertir pago semanal a diario (dividir por 7)
      await queryInterface.sequelize.query(`
        UPDATE empleados 
        SET pago_diario = pago_semanal / 7 
        WHERE pago_semanal IS NOT NULL AND pago_semanal > 0;
      `);
      
      console.log('✅ Datos migrados de pago_semanal a pago_diario');
      
      // 3. Eliminar la columna pago_semanal
      await queryInterface.removeColumn('empleados', 'pago_semanal');
      
      console.log('✅ Columna pago_semanal eliminada');
      console.log('🎉 Reversión completada exitosamente');
      
    } catch (error) {
      console.error('❌ Error en la reversión:', error);
      throw error;
    }
  }
};
