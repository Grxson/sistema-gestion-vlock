const { Op } = require('sequelize');
const models = require('../models');
// Usar la instancia existente de Sequelize del proyecto
const sequelize = models.sequelize || require('../config/db');
const ExcelJS = require('exceljs');
const { parse } = require('json2csv');

/**
 * Controlador para exportación e importación de datos del sistema
 */

/**
 * Obtiene el listado de todas las tablas disponibles para exportar
 */
const obtenerTablas = async (req, res) => {
  try {
    // Construir lista de tablas a partir de los modelos definidos
    const vistos = new Set();
    const tablas = [];

    Object.keys(models)
      .filter((k) => typeof models[k] === 'function' || (models[k] && models[k].getTableName))
      .forEach((key) => {
        const mdl = models[key];
        if (!mdl || typeof mdl !== 'function' && !mdl.getTableName) return;
        // En Sequelize v6, el modelo tiene getTableName()
        try {
          const tableName = typeof mdl.getTableName === 'function' ? mdl.getTableName() : mdl.tableName || mdl.name;
          if (!tableName || typeof tableName !== 'string') return;
          const tn = tableName.toString();
          if (vistos.has(tn)) return;
          vistos.add(tn);
          tablas.push({ nombre: tn, descripcion: '', count: 0 });
        } catch (_) {
          // ignorar
        }
      });

    // Cargar conteos de forma segura
    for (const tabla of tablas) {
      try {
        const mdl = findModelByTable(tabla.nombre);
        if (mdl) {
          tabla.count = await mdl.count();
        }
      } catch (error) {
        console.error(`Error al contar registros de ${tabla.nombre}:`, error.message);
      }
    }

    // Orden alfabético para UI
    tablas.sort((a, b) => a.nombre.localeCompare(b.nombre));

    res.json({ success: true, tablas });
  } catch (error) {
    console.error('Error al obtener tablas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las tablas disponibles',
      error: error.message
    });
  }
};

/**
 * Exporta datos en formato JSON
 */
const exportarJSON = async (req, res) => {
  try {
    const { tablas, incluirRelaciones } = req.body;

    if (!tablas || !Array.isArray(tablas) || tablas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos una tabla para exportar'
      });
    }

    const resultado = {
      exportado_en: new Date().toISOString(),
      version: '1.0',
      datos: {}
    };

    for (const nombreTabla of tablas) {
      const mdl = findModelByTable(nombreTabla);
      if (mdl) {
        const opciones = {};
        if (incluirRelaciones && mdl.associations) {
          // Incluir todas las asociaciones definidas
          opciones.include = Object.values(mdl.associations);
        }
        resultado.datos[nombreTabla] = await mdl.findAll(opciones);
      }
    }

    res.json({
      success: true,
      data: resultado
    });
  } catch (error) {
    console.error('Error al exportar JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar datos en JSON',
      error: error.message
    });
  }
};

/**
 * Exporta datos en formato CSV
 */
const exportarCSV = async (req, res) => {
  try {
    const { tabla } = req.body;

    if (!tabla) {
      return res.status(400).json({
        success: false,
        message: 'Debe especificar una tabla para exportar en CSV'
      });
    }

    const mdl = findModelByTable(tabla);
    if (!mdl) {
      return res.status(404).json({
        success: false,
        message: 'Tabla no encontrada'
      });
    }

    const datos = await mdl.findAll({ raw: true });

    if (datos.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No hay datos para exportar'
      });
    }

    const csv = parse(datos);

    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="${tabla}_${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Error al exportar CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar datos en CSV',
      error: error.message
    });
  }
};

/**
 * Exporta datos en formato Excel
 */
const exportarExcel = async (req, res) => {
  try {
    const { tablas } = req.body;

    if (!tablas || !Array.isArray(tablas) || tablas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos una tabla para exportar'
      });
    }

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema de Gestión Vlock';
    workbook.created = new Date();

    for (const nombreTabla of tablas) {
      const mdl = findModelByTable(nombreTabla);
      if (mdl) {
        const datos = await mdl.findAll({ raw: true });

        if (datos.length > 0) {
          const worksheet = workbook.addWorksheet(nombreTabla);
          
          // Agregar encabezados
          const columnas = Object.keys(datos[0]);
          worksheet.columns = columnas.map(col => ({
            header: col,
            key: col,
            width: 15
          }));

          // Estilizar encabezados
          worksheet.getRow(1).font = { bold: true };
          worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF4472C4' }
          };

          // Agregar datos
          datos.forEach(fila => {
            worksheet.addRow(fila);
          });

          // Auto-ajustar columnas
          worksheet.columns.forEach(column => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: true }, cell => {
              const columnLength = cell.value ? cell.value.toString().length : 10;
              if (columnLength > maxLength) {
                maxLength = columnLength;
              }
            });
            column.width = maxLength < 10 ? 10 : maxLength + 2;
          });
        }
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="exportacion_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error al exportar Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar datos en Excel',
      error: error.message
    });
  }
};

/**
 * Exporta la base de datos completa en formato SQL
 */
const exportarSQL = async (req, res) => {
  try {
    const { tablas } = req.body;

    if (!tablas || !Array.isArray(tablas) || tablas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos una tabla para exportar'
      });
    }

    let sqlContent = `-- Exportación de base de datos\n`;
    sqlContent += `-- Generado: ${new Date().toISOString()}\n`;
    sqlContent += `-- Sistema de Gestión Vlock\n\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    for (const nombreTabla of tablas) {
      const mdl = findModelByTable(nombreTabla);
      if (mdl) {
        const datos = await mdl.findAll({ raw: true });

        if (datos.length > 0) {
          sqlContent += `-- Tabla: ${nombreTabla}\n`;
          sqlContent += `TRUNCATE TABLE \`${nombreTabla}\`;\n`;

          datos.forEach(fila => {
            const columnas = Object.keys(fila);
            const valores = Object.values(fila).map(val => {
              if (val === null) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return val;
            });

            sqlContent += `INSERT INTO \`${nombreTabla}\` (${columnas.map(c => `\`${c}\``).join(', ')}) VALUES (${valores.join(', ')});\n`;
          });

          sqlContent += `\n`;
        }
      }
    }

    sqlContent += `SET FOREIGN_KEY_CHECKS = 1;\n`;

    res.header('Content-Type', 'application/sql');
    res.header('Content-Disposition', `attachment; filename="backup_${Date.now()}.sql"`);
    res.send(sqlContent);
  } catch (error) {
    console.error('Error al exportar SQL:', error);
    res.status(500).json({
      success: false,
      message: 'Error al exportar datos en SQL',
      error: error.message
    });
  }
};

/**
 * Importa datos desde JSON
 */
const importarJSON = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { datos, sobrescribir } = req.body;

    if (!datos || typeof datos !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Formato de datos inválido'
      });
    }

    const resultados = {
      importados: 0,
      errores: []
    };

    for (const [nombreTabla, registros] of Object.entries(datos.datos || datos)) {
      const mdl = findModelByTable(nombreTabla);
      if (!mdl) {
        resultados.errores.push(`Tabla ${nombreTabla} no encontrada`);
        continue;
      }

      try {
        if (sobrescribir) {
          await mdl.destroy({ where: {}, transaction });
        }

        for (const registro of registros) {
          await mdl.create(registro, { transaction });
          resultados.importados++;
        }
      } catch (error) {
        resultados.errores.push(`Error en tabla ${nombreTabla}: ${error.message}`);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: 'Importación completada',
      resultados
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al importar JSON:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar datos',
      error: error.message
    });
  }
};

/**
 * Vacía las tablas seleccionadas
 */
const vaciarTablas = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { tablas, confirmar } = req.body;

    if (!confirmar) {
      return res.status(400).json({
        success: false,
        message: 'Debe confirmar la operación de vaciado'
      });
    }

    if (!tablas || !Array.isArray(tablas) || tablas.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe seleccionar al menos una tabla para vaciar'
      });
    }

    const resultados = {
      vaciadas: [],
      errores: []
    };

    // Desactivar foreign key checks temporalmente
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });

    for (const nombreTabla of tablas) {
      const mdl = findModelByTable(nombreTabla);
      if (!mdl) {
        resultados.errores.push(`Tabla ${nombreTabla} no encontrada`);
        continue;
      }

      try {
        const count = await mdl.count({ transaction });
        await mdl.destroy({ where: {}, truncate: true, transaction });
        resultados.vaciadas.push({ tabla: nombreTabla, registros_eliminados: count });
      } catch (error) {
        resultados.errores.push(`Error al vaciar ${nombreTabla}: ${error.message}`);
      }
    }

    // Reactivar foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });

    await transaction.commit();

    res.json({
      success: true,
      message: 'Vaciado completado',
      resultados
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Error al vaciar tablas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al vaciar las tablas',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para obtener el nombre del modelo desde el nombre de la tabla
 */
function findModelByTable(tableName) {
  // Buscar por tableName real primero
  for (const key of Object.keys(models)) {
    const mdl = models[key];
    if (!mdl || typeof mdl !== 'function' && !mdl.getTableName) continue;
    try {
      const tn = typeof mdl.getTableName === 'function' ? mdl.getTableName() : mdl.tableName || mdl.name;
      if (tn && tn.toString() === tableName) return mdl;
    } catch (_) {}
  }
  // Intentar por nombre directo/capitalizado
  if (models[tableName]) return models[tableName];
  const cap = tableName.charAt(0).toUpperCase() + tableName.slice(1);
  if (models[cap]) return models[cap];
  return null;
}

/**
 * Función auxiliar para obtener las relaciones de un modelo
 */
// Relaciones: cuando se solicita, incluimos todas las asociaciones definidas en el modelo

module.exports = {
  obtenerTablas,
  exportarJSON,
  exportarCSV,
  exportarExcel,
  exportarSQL,
  importarJSON,
  vaciarTablas
};
