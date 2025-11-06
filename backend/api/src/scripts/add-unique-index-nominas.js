#!/usr/bin/env node
/*
  Script: add-unique-index-nominas.js
  Purpose: Ensure unique composite index on (id_empleado, id_semana) in nomina_empleados
  Safe steps:
    1) Delete duplicates keeping the oldest (lowest id_nomina)
    2) Create unique index if missing
*/

require('dotenv').config();
const sequelize = require('../config/db');

(async () => {
  const qi = sequelize.getQueryInterface();
  const table = 'nomina_empleados';
  const indexName = 'idx_nomina_unica_empleado_semana';

  try {
    console.log('🔧 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    // 1) Deduplicar filas (conserva id_nomina más bajo por pareja id_empleado+id_semana)
    console.log('🧹 Eliminando posibles duplicados previos (si existiesen)...');
    const [deleteResult] = await sequelize.query(`
      DELETE t1 FROM ${table} t1
      INNER JOIN ${table} t2 
        ON t1.id_empleado = t2.id_empleado 
       AND t1.id_semana = t2.id_semana 
       AND t1.id_nomina > t2.id_nomina;
    `);
    console.log('✅ Duplicados eliminados (si había).');

    // 2) Verificar si el índice ya existe
    console.log('🔎 Verificando índice único existente...');
    let indexes = [];
    try {
      indexes = await qi.showIndex(table);
    } catch (e) {
      // Fallback para algunos entornos
      const [rows] = await sequelize.query(`SHOW INDEX FROM ${table}`);
      indexes = rows || [];
    }

    const hasIndex = indexes.some((idx) => {
      // Sequelize's showIndex returns objects with fields: name, fields[], unique
      if (idx.name) {
        return idx.name === indexName && (idx.unique === true || idx.Unique === 1);
      }
      // Fallback for SHOW INDEX raw rows: Key_name and Non_unique
      if (idx.Key_name) {
        return idx.Key_name === indexName && Number(idx.Non_unique) === 0;
      }
      return false;
    });

    if (hasIndex) {
      console.log(`✅ El índice único '${indexName}' ya existe. Nada que hacer.`);
    } else {
      console.log(`➕ Creando índice único '${indexName}' en (${table}.id_empleado, ${table}.id_semana)...`);
      await qi.addIndex(table, ['id_empleado', 'id_semana'], {
        name: indexName,
        unique: true,
      });
      console.log('✅ Índice único creado correctamente.');
    }

    console.log('🎉 Proceso completado.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error asegurando índice único de nóminas:', err);
    process.exit(1);
  } finally {
    try { await sequelize.close(); } catch {}
  }
})();
