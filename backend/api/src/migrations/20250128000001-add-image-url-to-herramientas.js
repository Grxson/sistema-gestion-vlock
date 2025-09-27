'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('herramientas', 'image_url', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL de la imagen de la herramienta almacenada en el servidor'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('herramientas', 'image_url');
  }
};