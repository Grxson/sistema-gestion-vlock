/**
 * Migración: Agregar columna 'descuentos' para adelantos
 * Fecha: 2025-10-27
 * 
 * Esta migración agrega una nueva columna 'descuentos' a la tabla nomina_empleados
 * para registrar descuentos adicionales (como adelantos solicitados por el empleado).
 * 
 * NOTA: Los campos aplicar_isr, aplicar_imss, aplicar_infonavit se mantienen como BOOLEAN
 * porque indican si se debe aplicar o no el descuento. Los montos específicos ya están
 * en las columnas deducciones_isr, deducciones_imss, deducciones_infonavit (DECIMAL).
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando migración: Agregar columna descuentos...');

    try {
      // Verificar si la columna ya existe
      const tableDescription = await queryInterface.describeTable('nomina_empleados');
      
      if (!tableDescription.descuentos) {
        console.log('➕ Agregando columna descuentos...');
        await queryInterface.addColumn('nomina_empleados', 'descuentos', {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0,
          comment: 'Descuentos adicionales (adelantos, préstamos, etc.)'
        });
        console.log('✅ Columna descuentos agregada exitosamente');
      } else {
        console.log('ℹ️ La columna descuentos ya existe, omitiendo...');
      }

      console.log('✅ Migración completada exitosamente');
    } catch (error) {
      console.error('❌ Error en migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revirtiendo migración: Eliminar columna descuentos...');

    try {
      const tableDescription = await queryInterface.describeTable('nomina_empleados');
      
      if (tableDescription.descuentos) {
        console.log('➖ Eliminando columna descuentos...');
        await queryInterface.removeColumn('nomina_empleados', 'descuentos');
        console.log('✅ Columna descuentos eliminada exitosamente');
      } else {
        console.log('ℹ️ La columna descuentos no existe, omitiendo...');
      }

      console.log('✅ Reversión completada exitosamente');
    } catch (error) {
      console.error('❌ Error al revertir migración:', error);
      throw error;
    }
  }
};
