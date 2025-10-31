module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Migración: agregar campos a tabla proyectos');
    const table = 'proyectos';
    const desc = await queryInterface.describeTable(table);

    const adds = [];

    if (!desc.cliente_nombre) {
      adds.push(queryInterface.addColumn(table, 'cliente_nombre', {
        type: Sequelize.STRING(150),
        allowNull: true
      }));
    }

    if (!desc.tipo) {
      adds.push(queryInterface.addColumn(table, 'tipo', {
        type: Sequelize.STRING(50),
        allowNull: true
      }));
    }

    if (!desc.categoria) {
      adds.push(queryInterface.addColumn(table, 'categoria', {
        type: Sequelize.STRING(100),
        allowNull: true
      }));
    }

    if (!desc.presupuesto) {
      adds.push(queryInterface.addColumn(table, 'presupuesto', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true
      }));
    }

    if (!desc.notas) {
      adds.push(queryInterface.addColumn(table, 'notas', {
        type: Sequelize.TEXT,
        allowNull: true
      }));
    }

    await Promise.all(adds);
    console.log('✅ Migración completada (proyectos)');
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revertir migración: quitar campos de tabla proyectos');
    const table = 'proyectos';
    const desc = await queryInterface.describeTable(table);

    const removes = [];

    if (desc.cliente_nombre) {
      removes.push(queryInterface.removeColumn(table, 'cliente_nombre'));
    }
    if (desc.tipo) {
      removes.push(queryInterface.removeColumn(table, 'tipo'));
    }
    if (desc.categoria) {
      removes.push(queryInterface.removeColumn(table, 'categoria'));
    }
    if (desc.presupuesto) {
      removes.push(queryInterface.removeColumn(table, 'presupuesto'));
    }
    if (desc.notas) {
      removes.push(queryInterface.removeColumn(table, 'notas'));
    }

    await Promise.all(removes);
    console.log('✅ Reversión completada (proyectos)');
  }
};
