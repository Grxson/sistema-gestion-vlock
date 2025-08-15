const { Sequelize } = require('sequelize');
require('dotenv').config();
const { DB_HOST, DB_USER, DB_PASS, DB_NAME } = process.env;
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  dialect: 'mysql',
  logging: false, // Desactiva logs SQL **Activarlo si queremos debuggear**
  timezone: '+00:00', // Evita problemas con fechas
});

module.exports = sequelize;
