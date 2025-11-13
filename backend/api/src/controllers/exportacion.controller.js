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
 * Obtiene todas las tablas relacionadas a un proyecto específico
 * @param {number} idProyecto - ID del proyecto
 * @returns {Array} - Lista de objetos {tabla, fk, orden} ordenados por dependencias
 */
const obtenerTablasProyecto = (idProyecto) => {
  // Orden de eliminación (respetando FKs): primero hijos, luego padres
  return [
    // 1. Tablas que dependen de otras entidades del proyecto
    { tabla: 'pagos_nomina', fk: 'id_nomina', referencia: 'nomina_empleado' },
    { tabla: 'deducciones_nomina', fk: 'id_nomina', referencia: 'nomina_empleado' },
    
    // 2. Tablas principales con id_proyecto directo
    { tabla: 'nomina_empleado', fk: 'id_proyecto', referencia: null },
    { tabla: 'suministros', fk: 'id_proyecto', referencia: null },
    { tabla: 'gastos', fk: 'id_proyecto', referencia: null },
    { tabla: 'ingresos', fk: 'id_proyecto', referencia: null },
    { tabla: 'ingresos_movimientos', fk: 'id_proyecto', referencia: null },
    { tabla: 'movimientos_herramienta', fk: 'id_proyecto', referencia: null },
    { tabla: 'presupuestos', fk: 'id_proyecto', referencia: null },
    { tabla: 'estados_cuenta', fk: 'id_proyecto', referencia: null },
    
    // 3. Tablas donde id_proyecto puede ser indirecto (empleados, herramientas)
    { tabla: 'empleados', fk: 'id_proyecto', referencia: null },
    { tabla: 'herramientas', fk: 'id_proyecto', referencia: null },
  ];
};

/**
 * Exporta un backup completo de un proyecto específico
 * Incluye todas las tablas relacionadas al proyecto
 */
const backupProyecto = async (req, res) => {
  try {
    const { id } = req.params; // id del proyecto
    const { formato = 'sql' } = req.body; // sql, excel, json

    // Verificar que el proyecto exista
    const proyecto = await models.Proyectos.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ 
        success: false, 
        message: `Proyecto con ID ${id} no encontrado` 
      });
    }

    const tablasRelacionadas = obtenerTablasProyecto(id);
    const nombreProyecto = proyecto.nombre.replace(/[^a-zA-Z0-9]/g, '_');
    const fecha = new Date().toISOString().split('T')[0];

    console.log(`📦 Iniciando backup del proyecto ${id} (${proyecto.nombre})`);
    console.log(`📋 Tablas a exportar: ${tablasRelacionadas.length}`);

    // Según el formato, delegar a la función correspondiente
    if (formato === 'sql') {
      return await exportarProyectoSQL(req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha);
    } else if (formato === 'excel') {
      return await exportarProyectoExcel(req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha);
    } else if (formato === 'json') {
      return await exportarProyectoJSON(req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha);
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Formato no soportado. Usa: sql, excel, json' 
      });
    }
  } catch (error) {
    console.error('❌ Error en backup de proyecto:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error al generar backup del proyecto', 
      error: error.message 
    });
  }
};

/**
 * Exporta proyecto en formato SQL
 */
const exportarProyectoSQL = async (req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha) => {
  try {
    const dbName = getDatabaseName();
    let output = `-- ============================================\n`;
    output += `-- Backup de Proyecto: ${proyecto.nombre}\n`;
    output += `-- ID Proyecto: ${proyecto.id_proyecto}\n`;
    output += `-- Fecha: ${fecha}\n`;
    output += `-- Base de datos: ${dbName}\n`;
    output += `-- ============================================\n\n`;
    output += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // 1. Exportar datos del proyecto mismo
    output += `-- ============================================\n`;
    output += `-- DATOS DEL PROYECTO\n`;
    output += `-- ============================================\n\n`;
    
    const proyectoData = await sequelize.query(
      `SELECT * FROM proyectos WHERE id_proyecto = ?`,
      { replacements: [proyecto.id_proyecto], type: sequelize.QueryTypes.SELECT }
    );
    
    if (proyectoData.length > 0) {
      output += generarInsertSQL('proyectos', proyectoData);
    }

    // 2. Exportar todas las tablas relacionadas
    for (const { tabla, fk } of tablasRelacionadas) {
      try {
        output += `\n-- ============================================\n`;
        output += `-- Tabla: ${tabla}\n`;
        output += `-- ============================================\n\n`;

        // Obtener datos con la FK correspondiente
        const datos = await sequelize.query(
          `SELECT * FROM ${tabla} WHERE ${fk} = ?`,
          { replacements: [proyecto.id_proyecto], type: sequelize.QueryTypes.SELECT }
        );

        if (datos.length > 0) {
          output += generarInsertSQL(tabla, datos);
          console.log(`✅ ${tabla}: ${datos.length} registros exportados`);
        } else {
          output += `-- Sin registros en ${tabla}\n`;
        }
      } catch (error) {
        console.error(`❌ Error exportando ${tabla}:`, error.message);
        output += `-- Error al exportar ${tabla}: ${error.message}\n`;
      }
    }

    output += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
    output += `-- Fin del backup\n`;

    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="backup_proyecto_${nombreProyecto}_${fecha}.sql"`);
    return res.send(output);
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta proyecto en formato Excel
 */
const exportarProyectoExcel = async (req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha) => {
  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Sistema VLOCK';
    workbook.created = new Date();

    // Hoja de información del proyecto
    const infoSheet = workbook.addWorksheet('Proyecto');
    infoSheet.columns = [
      { header: 'Campo', key: 'campo', width: 25 },
      { header: 'Valor', key: 'valor', width: 50 }
    ];
    infoSheet.addRow({ campo: 'ID', valor: proyecto.id_proyecto });
    infoSheet.addRow({ campo: 'Nombre', valor: proyecto.nombre });
    infoSheet.addRow({ campo: 'Descripción', valor: proyecto.descripcion || '' });
    infoSheet.addRow({ campo: 'Ubicación', valor: proyecto.ubicacion || '' });
    infoSheet.addRow({ campo: 'Estado', valor: proyecto.estado || '' });
    infoSheet.addRow({ campo: 'Fecha Backup', valor: fecha });

    // Una hoja por cada tabla relacionada
    for (const { tabla, fk } of tablasRelacionadas) {
      try {
        const datos = await sequelize.query(
          `SELECT * FROM ${tabla} WHERE ${fk} = ?`,
          { replacements: [proyecto.id_proyecto], type: sequelize.QueryTypes.SELECT }
        );

        if (datos.length === 0) continue;

        // Resolver FKs para valores legibles
        const datosResueltos = await resolverValoresFK(tabla, datos);

        const sheet = workbook.addWorksheet(tabla.substring(0, 31)); // Excel limit
        const columnas = Object.keys(datosResueltos[0]);
        sheet.columns = columnas.map(col => ({ 
          header: col, 
          key: col, 
          width: 15 
        }));
        datosResueltos.forEach(row => sheet.addRow(row));

        console.log(`✅ ${tabla}: ${datos.length} registros en Excel`);
      } catch (error) {
        console.error(`❌ Error en Excel para ${tabla}:`, error.message);
      }
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="backup_proyecto_${nombreProyecto}_${fecha}.xlsx"`);
    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    throw error;
  }
};

/**
 * Exporta proyecto en formato JSON
 */
const exportarProyectoJSON = async (req, res, proyecto, tablasRelacionadas, nombreProyecto, fecha) => {
  try {
    const backup = {
      metadata: {
        proyecto: proyecto.nombre,
        id_proyecto: proyecto.id_proyecto,
        fecha_backup: fecha,
        version: '1.0'
      },
      proyecto: proyecto.toJSON(),
      tablas: {}
    };

    for (const { tabla, fk } of tablasRelacionadas) {
      try {
        const datos = await sequelize.query(
          `SELECT * FROM ${tabla} WHERE ${fk} = ?`,
          { replacements: [proyecto.id_proyecto], type: sequelize.QueryTypes.SELECT }
        );
        backup.tablas[tabla] = datos;
        console.log(`✅ ${tabla}: ${datos.length} registros en JSON`);
      } catch (error) {
        console.error(`❌ Error en JSON para ${tabla}:`, error.message);
        backup.tablas[tabla] = { error: error.message };
      }
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="backup_proyecto_${nombreProyecto}_${fecha}.json"`);
    return res.json(backup);
  } catch (error) {
    throw error;
  }
};

/**
 * Vacía todos los datos de un proyecto específico
 * CUIDADO: Esta operación es irreversible
 */
const vaciarProyecto = async (req, res) => {
  try {
    const { id } = req.params;
    const { confirmar } = req.body;

    if (confirmar !== 'CONFIRMAR') {
      return res.status(400).json({ 
        success: false, 
        message: 'Debes confirmar la operación enviando {"confirmar": "CONFIRMAR"}' 
      });
    }

    // Verificar que el proyecto exista
    const proyecto = await models.Proyectos.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ 
        success: false, 
        message: `Proyecto con ID ${id} no encontrado` 
      });
    }

    const tablasRelacionadas = obtenerTablasProyecto(id);
    const resultado = {
      proyecto: proyecto.nombre,
      tablas_vaciadas: [],
      errores: []
    };

    console.log(`🗑️  Iniciando limpieza del proyecto ${id} (${proyecto.nombre})`);

    // Deshabilitar FK checks temporalmente
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Eliminar registros de cada tabla (en orden inverso para respetar FKs)
    for (const { tabla, fk } of tablasRelacionadas) {
      try {
        const [results] = await sequelize.query(
          `DELETE FROM ${tabla} WHERE ${fk} = ?`,
          { replacements: [id] }
        );
        
        const registrosEliminados = results.affectedRows || 0;
        resultado.tablas_vaciadas.push({ 
          tabla, 
          registros_eliminados: registrosEliminados 
        });
        
        if (registrosEliminados > 0) {
          console.log(`✅ ${tabla}: ${registrosEliminados} registros eliminados`);
        }
      } catch (error) {
        console.error(`❌ Error vaciando ${tabla}:`, error.message);
        resultado.errores.push({ tabla, error: error.message });
      }
    }

    // Reactivar FK checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');

    const totalEliminados = resultado.tablas_vaciadas.reduce(
      (sum, t) => sum + t.registros_eliminados, 0
    );

    console.log(`✅ Limpieza completada: ${totalEliminados} registros eliminados en total`);

    return res.json({ 
      success: true, 
      message: `Proyecto ${proyecto.nombre} vaciado exitosamente`,
      total_registros_eliminados: totalEliminados,
      ...resultado
    });
  } catch (error) {
    console.error('❌ Error al vaciar proyecto:', error);
    // Asegurar que FK checks se reactiven incluso si hay error
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1').catch(() => {});
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error al vaciar proyecto', 
      error: error.message 
    });
  }
};

/**
 * Genera sentencias INSERT SQL a partir de datos
 */
const generarInsertSQL = (tabla, datos) => {
  if (!datos || datos.length === 0) return `-- Sin datos para ${tabla}\n`;
  
  let sql = '';
  const columnas = Object.keys(datos[0]);
  
  for (const row of datos) {
    const valores = columnas.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'number') return val;
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (val instanceof Date) return `'${val.toISOString().slice(0, 19).replace('T', ' ')}'`;
      // Escapar comillas simples
      return `'${String(val).replace(/'/g, "''")}'`;
    });
    
    sql += `INSERT INTO ${tabla} (${columnas.join(', ')}) VALUES (${valores.join(', ')});\n`;
  }
  
  return sql + '\n';
};

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
 * Utilidades de introspección de esquema y helpers de volcado
 */
const getDatabaseName = () => {
  try {
    return sequelize.config && sequelize.config.database
      ? sequelize.config.database
      : null;
  } catch (_) {
    return null;
  }
};

async function describeTableSafe(table) {
  const qi = sequelize.getQueryInterface();
  return await qi.describeTable(table);
}

async function listBaseTables() {
  const db = getDatabaseName();
  const [rows] = await sequelize.query('SHOW FULL TABLES');
  if (!rows || rows.length === 0) return [];
  // Determinar nombre de la columna Tables_in_<db>
  const tableKey = Object.keys(rows[0]).find((k) => k.toLowerCase().startsWith('tables_in')) || Object.keys(rows[0])[0];
  return rows.filter(r => (r.Table_type || r.TABLE_TYPE || r[Object.keys(r)[1]])?.toString().toUpperCase().includes('BASE')).map(r => r[tableKey]);
}

async function listViews() {
  const [rows] = await sequelize.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
  if (!rows || rows.length === 0) return [];
  const tableKey = Object.keys(rows[0]).find((k) => k.toLowerCase().startsWith('tables_in')) || Object.keys(rows[0])[0];
  return rows.map(r => r[tableKey]);
}

async function showCreateTable(table) {
  const [rows] = await sequelize.query(`SHOW CREATE TABLE \`${table}\``);
  const key = Object.keys(rows[0]).find(k => k.toLowerCase() === 'create table');
  return rows[0][key];
}

async function showCreateView(view) {
  const [rows] = await sequelize.query(`SHOW CREATE VIEW \`${view}\``);
  const key = Object.keys(rows[0]).find(k => k.toLowerCase() === 'create view');
  return rows[0][key];
}

async function listTriggers() {
  const [rows] = await sequelize.query('SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = DATABASE()');
  return rows.map(r => r.TRIGGER_NAME);
}

async function showCreateTrigger(name) {
  const [rows] = await sequelize.query(`SHOW CREATE TRIGGER \`${name}\``);
  const key = Object.keys(rows[0]).find(k => k.toLowerCase().includes('trigger')); // Create Trigger
  return rows[0][key];
}

async function listRoutines() {
  const [rows] = await sequelize.query('SELECT ROUTINE_NAME, ROUTINE_TYPE FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = DATABASE()');
  return rows.map(r => ({ name: r.ROUTINE_NAME, type: r.ROUTINE_TYPE }));
}

async function showCreateRoutine(name, type) {
  const cmd = type && type.toUpperCase() === 'FUNCTION' ? 'FUNCTION' : 'PROCEDURE';
  const [rows] = await sequelize.query(`SHOW CREATE ${cmd} \`${name}\``);
  const key = Object.keys(rows[0]).find(k => k.toLowerCase().includes(cmd.toLowerCase()));
  return rows[0][key];
}

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
      try {
        const descripcion = await describeTableSafe(nombreTabla);
        const cols = Object.keys(descripcion);
        if (cols.length === 0) continue;
        const selectCols = cols.map(c => `\`${c}\``).join(', ');
        const [filas] = await sequelize.query(`SELECT ${selectCols} FROM \`${nombreTabla}\``);
        resultado.datos[nombreTabla] = filas;
      } catch (e) {
        console.error(`Error exportando JSON de ${nombreTabla}:`, e.message);
        resultado.datos[nombreTabla] = [];
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
 * Resuelve valores legibles para columnas FK (id_*)
 * Mapea id_proyecto → nombre, id_empleado → nombre completo, etc.
 */
async function resolverValoresFK(nombreTabla, datos) {
  if (!Array.isArray(datos) || datos.length === 0) return datos;

  // Mapeo de columnas FK a sus tablas y campos descriptivos
  const fkMapping = {
    id_proyecto: { tabla: 'proyectos', idCol: 'id_proyecto', campo: 'nombre', alias: 'proyecto_nombre' },
    id_empleado: { tabla: 'empleados', idCol: 'id_empleado', campoFn: (row) => `${row.nombre} ${row.apellido_paterno || ''} ${row.apellido_materno || ''}`.trim(), alias: 'empleado_nombre' },
    id_proveedor: { tabla: 'proveedores', idCol: 'id_proveedor', campo: 'nombre', alias: 'proveedor_nombre' },
    id_usuario: { tabla: 'usuarios', idCol: 'id_usuario', campo: 'nombre_usuario', alias: 'usuario_nombre' },
    id_categoria: { tabla: 'categorias_suministro', idCol: 'id_categoria', campo: 'nombre', alias: 'categoria_nombre' },
    id_categoria_suministro: { tabla: 'categorias_suministro', idCol: 'id_categoria', campo: 'nombre', alias: 'categoria_nombre' },
    id_categoria_herramienta: { tabla: 'categorias_herramienta', idCol: 'id_categoria', campo: 'nombre', alias: 'categoria_herramienta_nombre' },
    id_unidad: { tabla: 'unidades_medida', idCol: 'id_unidad', campo: 'nombre', alias: 'unidad_nombre' },
    id_unidad_medida: { tabla: 'unidades_medida', idCol: 'id_unidad', campo: 'nombre', alias: 'unidad_nombre' },
    id_rol: { tabla: 'roles', idCol: 'id_rol', campo: 'nombre_rol', alias: 'rol_nombre' },
    id_semana: { tabla: 'semanas_nomina', idCol: 'id_semana', campoFn: (row) => `Sem ${row.numero_semana} (${row.fecha_inicio || ''})`, alias: 'semana_descripcion' },
    id_contrato: { tabla: 'contratos', idCol: 'id_contrato', campo: 'nombre', alias: 'contrato_nombre' },
    id_oficio: { tabla: 'oficios', idCol: 'id_oficio', campo: 'nombre', alias: 'oficio_nombre' },
    id_herramienta: { tabla: 'herramientas', idCol: 'id_herramienta', campo: 'nombre', alias: 'herramienta_nombre' },
    id_nomina: { tabla: 'nomina_empleado', idCol: 'id_nomina', campoFn: (row) => `Nómina ${row.id_nomina}`, alias: 'nomina_descripcion' },
    id_adeudo: { tabla: 'adeudos_empleados', idCol: 'id_adeudo', campo: 'concepto', alias: 'adeudo_concepto' },
    id_ingreso: { tabla: 'ingresos', idCol: 'id_ingreso', campo: 'concepto', alias: 'ingreso_concepto' },
  };

  // Detectar qué FKs están presentes en estos datos
  const colsPresentes = Object.keys(datos[0] || {});
  const fksPresentes = colsPresentes.filter(col => fkMapping[col]);

  if (fksPresentes.length === 0) return datos; // sin FKs

  // Cachear lookups por FK
  const cacheFKs = {};
  for (const fkCol of fksPresentes) {
    const { tabla, idCol, campo, campoFn } = fkMapping[fkCol];
    try {
      const [filas] = await sequelize.query(`SELECT * FROM \`${tabla}\``);
      cacheFKs[fkCol] = filas.reduce((acc, row) => {
        const id = row[idCol];
        if (id != null) {
          let valor = campoFn ? campoFn(row) : row[campo];
          acc[id] = valor != null ? valor : `[${id}]`;
        }
        return acc;
      }, {});
    } catch (e) {
      console.error(`Error cargando FK ${fkCol} desde ${tabla}:`, e.message);
      cacheFKs[fkCol] = {};
    }
  }

  // Enriquecer cada fila con los valores legibles
  const datosEnriquecidos = datos.map(fila => {
    const nuevaFila = { ...fila };
    for (const fkCol of fksPresentes) {
      const idVal = fila[fkCol];
      if (idVal != null && cacheFKs[fkCol]) {
        const alias = fkMapping[fkCol].alias;
        nuevaFila[alias] = cacheFKs[fkCol][idVal] || `[${idVal}]`;
      }
    }
    return nuevaFila;
  });

  return datosEnriquecidos;
}

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
      try {
        const descripcion = await describeTableSafe(nombreTabla);
        const cols = Object.keys(descripcion);
        if (cols.length === 0) continue;
        const selectCols = cols.map(c => `\`${c}\``).join(', ');
        const [datos] = await sequelize.query(`SELECT ${selectCols} FROM \`${nombreTabla}\``);

        if (Array.isArray(datos) && datos.length > 0) {
          // Enriquecer datos con valores legibles para FKs
          const datosEnriquecidos = await resolverValoresFK(nombreTabla, datos);

          const worksheet = workbook.addWorksheet(nombreTabla);

          // Determinar columnas finales (originales + alias de FK)
          const colsFinales = Object.keys(datosEnriquecidos[0]);

          // Agregar encabezados
          worksheet.columns = colsFinales.map(col => ({
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
          datosEnriquecidos.forEach(fila => {
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
      } catch (e) {
        console.error(`Error exportando Excel de ${nombreTabla}:`, e.message);
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
    const { tablas, fullBackup, includeStructure = true, includeViews = true } = req.body;

    // Si es backup completo, ignorar tablas seleccionadas
    if (!fullBackup) {
      if (!tablas || !Array.isArray(tablas) || tablas.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe seleccionar al menos una tabla para exportar'
        });
      }
    }

    let sqlContent = `-- Exportación de base de datos\n`;
    sqlContent += `-- Generado: ${new Date().toISOString()}\n`;
    sqlContent += `-- Sistema de Gestión Vlock\n\n`;
    sqlContent += `SET FOREIGN_KEY_CHECKS = 0;\n\n`;

    // Determinar tablas a exportar
    const tablasAExportar = fullBackup ? await listBaseTables() : tablas;

    // Incluir estructura de tablas si se solicita o si es backup completo
    if (includeStructure || fullBackup) {
      for (const nombreTabla of tablasAExportar) {
        try {
          const createStmt = await showCreateTable(nombreTabla);
          sqlContent += `-- Estructura de tabla: ${nombreTabla}\n`;
          sqlContent += `DROP TABLE IF EXISTS \`${nombreTabla}\`;\n`;
          sqlContent += `${createStmt};\n\n`;
        } catch (e) {
          sqlContent += `-- Error obteniendo estructura de ${nombreTabla}: ${e.message}\n\n`;
        }
      }
    }

    // Datos de tablas
    for (const nombreTabla of tablasAExportar) {
      try {
        const descripcion = await describeTableSafe(nombreTabla);
        const columnasExistentes = Object.keys(descripcion);
        if (columnasExistentes.length === 0) continue;
        const selectCols = columnasExistentes.map(c => `\`${c}\``).join(', ');
        const [filas] = await sequelize.query(`SELECT ${selectCols} FROM \`${nombreTabla}\`;`);
        if (Array.isArray(filas) && filas.length > 0) {
          sqlContent += `-- Datos de tabla: ${nombreTabla}\n`;
          sqlContent += `TRUNCATE TABLE \`${nombreTabla}\`;\n`;
          for (const fila of filas) {
            const columnas = columnasExistentes;
            const valores = columnas.map(col => {
              const val = fila[col];
              if (val === null || typeof val === 'undefined') return 'NULL';
              if (val instanceof Date) return `'${val.toISOString()}'`;
              if (Buffer.isBuffer(val)) return `'${val.toString('base64')}'`;
              if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              return String(val);
            });
            sqlContent += `INSERT INTO \`${nombreTabla}\` (${columnas.map(c => `\`${c}\``).join(', ')}) VALUES (${valores.join(', ')});\n`;
          }
          sqlContent += `\n`;
        }
      } catch (e) {
        sqlContent += `-- Error exportando datos de ${nombreTabla}: ${e.message}\n\n`;
      }
    }

    // Vistas (solo en fullBackup o cuando se pide includeViews)
    if (includeViews || fullBackup) {
      try {
        const vistas = await listViews();
        for (const vista of vistas) {
          try {
            const createView = await showCreateView(vista);
            sqlContent += `-- Vista: ${vista}\n`;
            sqlContent += `DROP VIEW IF EXISTS \`${vista}\`;\n`;
            sqlContent += `${createView};\n\n`;
          } catch (ve) {
            sqlContent += `-- Error obteniendo CREATE VIEW de ${vista}: ${ve.message}\n\n`;
          }
        }
      } catch (e) {
        sqlContent += `-- Error listando vistas: ${e.message}\n\n`;
      }
    }

    // Triggers y rutinas: best-effort (puede requerir privilegios)
    if (fullBackup) {
      try {
        const triggers = await listTriggers();
        for (const trg of triggers) {
          try {
            const createTrig = await showCreateTrigger(trg);
            sqlContent += `-- Trigger: ${trg}\n`;
            sqlContent += `DROP TRIGGER IF EXISTS \`${trg}\`;\n`;
            sqlContent += `${createTrig};\n\n`;
          } catch (te) {
            sqlContent += `-- Error obteniendo CREATE TRIGGER ${trg}: ${te.message}\n\n`;
          }
        }
      } catch (e) {
        sqlContent += `-- Error listando triggers: ${e.message}\n\n`;
      }

      try {
        const routines = await listRoutines();
        for (const r of routines) {
          try {
            const createRt = await showCreateRoutine(r.name, r.type);
            sqlContent += `-- Rutina: ${r.type} ${r.name}\n`;
            sqlContent += `DROP ${r.type.toUpperCase()} IF EXISTS \`${r.name}\`;\n`;
            sqlContent += `${createRt};\n\n`;
          } catch (re) {
            sqlContent += `-- Error obteniendo CREATE ${r.type} ${r.name}: ${re.message}\n\n`;
          }
        }
      } catch (e) {
        sqlContent += `-- Error listando rutinas: ${e.message}\n\n`;
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
  vaciarTablas,
  backupProyecto,
  vaciarProyecto
};
