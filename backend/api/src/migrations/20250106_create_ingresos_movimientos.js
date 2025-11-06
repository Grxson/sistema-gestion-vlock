/**
 * Migración: Crear tabla ingresos_movimientos
 * 
 * Esta tabla registra todos los movimientos (ingresos, gastos, ajustes) 
 * asociados a un ingreso específico, permitiendo rastrear el flujo de 
 * recursos y calcular el saldo disponible.
 * 
 * Características:
 * - Rastrea cada ingreso inicial y gastos relacionados
 * - Soporta múltiples tipos: ingreso, gasto, ajuste
 * - Múltiples fuentes: nomina, suministro, manual, otros
 * - Referencias polimórficas (ref_tipo + ref_id) para vincular con nóminas/suministros
 * - Mantiene saldo actualizado después de cada movimiento
 * 
 * Ejecución: node backend/api/src/migrations/20250106_create_ingresos_movimientos.js
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🔄 Iniciando migración: crear tabla ingresos_movimientos');

    try {
      // Verificar si la tabla ya existe
      const tables = await queryInterface.showAllTables();
      
      if (tables.includes('ingresos_movimientos')) {
        console.log('⚠️  La tabla ingresos_movimientos ya existe, omitiendo creación...');
        return;
      }

      // Crear tabla ingresos_movimientos
      await queryInterface.createTable('ingresos_movimientos', {
        id_movimiento: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          comment: 'ID único del movimiento'
        },
        id_ingreso: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'ingresos',
            key: 'id_ingreso'
          },
          onUpdate: 'CASCADE',
          onDelete: 'RESTRICT',
          comment: 'ID del ingreso al que pertenece este movimiento'
        },
        id_proyecto: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'proyectos',
            key: 'id_proyecto'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'ID del proyecto asociado (heredado o específico)'
        },
        tipo: {
          type: Sequelize.ENUM('ingreso', 'gasto', 'ajuste'),
          allowNull: false,
          defaultValue: 'gasto',
          comment: 'Tipo de movimiento: ingreso (inicial o adicional), gasto (consumo), ajuste (corrección)'
        },
        fuente: {
          type: Sequelize.ENUM('nomina', 'suministro', 'manual', 'otros'),
          allowNull: false,
          defaultValue: 'manual',
          comment: 'Fuente del movimiento'
        },
        ref_tipo: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Tipo de referencia: nomina, suministro, etc. (para referencias polimórficas)'
        },
        ref_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'ID de la referencia externa (id_nomina, id_suministro, etc.)'
        },
        fecha: {
          type: Sequelize.DATEONLY,
          allowNull: false,
          comment: 'Fecha del movimiento'
        },
        monto: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: false,
          defaultValue: 0,
          comment: 'Monto del movimiento (positivo para ingresos/ajustes positivos, positivo también para gastos)'
        },
        descripcion: {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Descripción detallada del movimiento'
        },
        saldo_after: {
          type: Sequelize.DECIMAL(12, 2),
          allowNull: true,
          comment: 'Saldo del ingreso después de aplicar este movimiento'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          comment: 'Fecha de creación del registro'
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          comment: 'Fecha de última actualización'
        }
      }, {
        comment: 'Tabla de movimientos de ingresos - Registra todos los ingresos, gastos y ajustes asociados a un ingreso'
      });

      console.log('✅ Tabla ingresos_movimientos creada exitosamente');

      // Crear índices para optimizar consultas
      console.log('🔄 Creando índices...');
      
      await queryInterface.addIndex('ingresos_movimientos', ['id_ingreso'], {
        name: 'idx_movimientos_ingreso',
        comment: 'Índice para consultas por ingreso'
      });

      await queryInterface.addIndex('ingresos_movimientos', ['id_proyecto'], {
        name: 'idx_movimientos_proyecto',
        comment: 'Índice para consultas por proyecto'
      });

      await queryInterface.addIndex('ingresos_movimientos', ['tipo', 'fuente'], {
        name: 'idx_movimientos_tipo_fuente',
        comment: 'Índice compuesto para filtros de tipo y fuente'
      });

      await queryInterface.addIndex('ingresos_movimientos', ['fecha'], {
        name: 'idx_movimientos_fecha',
        comment: 'Índice para consultas por rango de fechas'
      });

      await queryInterface.addIndex('ingresos_movimientos', ['ref_tipo', 'ref_id'], {
        name: 'idx_movimientos_referencia',
        comment: 'Índice compuesto para referencias polimórficas'
      });

      console.log('✅ Índices creados exitosamente');
      console.log('✅ Migración completada con éxito');

    } catch (error) {
      console.error('❌ Error en la migración:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    console.log('🔄 Revertiendo migración: eliminar tabla ingresos_movimientos');

    try {
      // Verificar si la tabla existe antes de intentar eliminarla
      const tables = await queryInterface.showAllTables();
      
      if (!tables.includes('ingresos_movimientos')) {
        console.log('⚠️  La tabla ingresos_movimientos no existe, omitiendo eliminación...');
        return;
      }

      // Eliminar la tabla
      await queryInterface.dropTable('ingresos_movimientos');
      console.log('✅ Tabla ingresos_movimientos eliminada exitosamente');
      console.log('✅ Reversión completada con éxito');

    } catch (error) {
      console.error('❌ Error al revertir la migración:', error);
      throw error;
    }
  }
};

// Si se ejecuta directamente (no a través de sequelize-cli)
if (require.main === module) {
  (async () => {
    try {
      console.log('📦 Cargando configuración de base de datos...');
      
      const { Sequelize } = require('sequelize');
      const path = require('path');
      
      // Cargar variables de entorno
      require('dotenv').config({ path: path.join(__dirname, '../.env') });
      
      // Configurar Sequelize - Usar DATABASE_URL si está disponible
      let sequelize;
      if (process.env.DATABASE_URL) {
        sequelize = new Sequelize(process.env.DATABASE_URL, {
          dialect: 'mysql',
          logging: false,
          dialectOptions: {
            connectTimeout: 60000
          }
        });
      } else {
        sequelize = new Sequelize(
          process.env.DB_NAME || 'sistema_gestion',
          process.env.DB_USER || 'root',
          process.env.DB_PASSWORD || '',
          {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            dialect: 'mysql',
            logging: false,
            dialectOptions: {
              connectTimeout: 60000
            }
          }
        );
      }

      console.log('🔌 Conectando a la base de datos...');
      await sequelize.authenticate();
      console.log('✅ Conexión establecida correctamente');

      // Ejecutar migración UP
      const queryInterface = sequelize.getQueryInterface();
      await module.exports.up(queryInterface, Sequelize);

      await sequelize.close();
      console.log('');
      console.log('═══════════════════════════════════════════════');
      console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
      console.log('═══════════════════════════════════════════════');
      console.log('');
      console.log('📋 Siguiente paso: Crear el modelo Sequelize');
      console.log('   Archivo: backend/api/src/models/ingresosMovimientos.model.js');
      console.log('');
      
      process.exit(0);
    } catch (error) {
      console.error('');
      console.error('═══════════════════════════════════════════════');
      console.error('❌ ERROR AL EJECUTAR LA MIGRACIÓN');
      console.error('═══════════════════════════════════════════════');
      console.error('');
      console.error(error);
      console.error('');
      process.exit(1);
    }
  })();
}
