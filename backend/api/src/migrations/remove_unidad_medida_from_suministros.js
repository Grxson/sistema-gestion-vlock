'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Eliminar la columna unidad_medida ya que ahora usamos id_unidad_medida
    await queryInterface.removeColumn('suministros', 'unidad_medida');
    
    console.log('✅ Migración completada: columna unidad_medida eliminada de suministros');
  },

  async down(queryInterface, Sequelize) {
    // Restaurar la columna unidad_medida en caso de rollback
    await queryInterface.addColumn('suministros', 'unidad_medida', {
      type: Sequelize.STRING(20),
      defaultValue: 'pz',
      comment: 'Unidad de medida del suministro (pz, kg, m, m2, m3, ton, etc.)'
    });

    // Restaurar datos basándose en la relación con unidades_medida
    await queryInterface.sequelize.query(`
      UPDATE suministros s
      INNER JOIN unidades_medida u ON s.id_unidad_medida = u.id_unidad
      SET s.unidad_medida = u.simbolo
    `);

    console.log('✅ Rollback completado: columna unidad_medida restaurada en suministros');
  }
};

