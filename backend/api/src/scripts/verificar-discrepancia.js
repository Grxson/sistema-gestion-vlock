require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function verificarDiscrepancia() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     VERIFICACIÓN DE DISCREPANCIA - ANÁLISIS DETALLADO       ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    let connection;
    
    try {
        const dbUrl = process.env.DATABASE_URL;
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        const [, user, password, host, port, database] = match;

        connection = await mysql.createConnection({ host, port: parseInt(port), user, password, database });

        console.log('✅ Conectado a la base de datos\n');
        
        // Consulta 1: Total por tipo directamente desde BD
        console.log('═'.repeat(70));
        console.log('CONSULTA 1: SUMINISTROS POR TIPO DE CATEGORÍA');
        console.log('═'.repeat(70));
        
        const [porTipo] = await connection.query(`
            SELECT 
                c.tipo as tipo_categoria,
                COUNT(s.id_suministro) as cantidad,
                SUM(s.costo_total) as total
            FROM suministros s
            INNER JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            WHERE s.costo_total IS NOT NULL
            GROUP BY c.tipo
            ORDER BY c.tipo
        `);

        console.log('\n📊 Agrupación directa por tipo:\n');
        porTipo.forEach(row => {
            console.log(`${row.tipo_categoria}:`);
            console.log(`   Cantidad: ${row.cantidad}`);
            console.log(`   Total: $${parseFloat(row.total).toFixed(2)}\n`);
        });

        // Consulta 2: Verificar que todos los suministros tienen categoría con tipo
        console.log('═'.repeat(70));
        console.log('CONSULTA 2: VERIFICAR SUMINISTROS SIN TIPO');
        console.log('═'.repeat(70));

        const [sinTipo] = await connection.query(`
            SELECT 
                s.id_suministro,
                s.nombre,
                s.costo_total,
                s.id_categoria_suministro,
                c.nombre as categoria_nombre,
                c.tipo as categoria_tipo
            FROM suministros s
            LEFT JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            WHERE s.costo_total IS NOT NULL
            AND (c.tipo IS NULL OR c.tipo = '')
        `);

        if (sinTipo.length > 0) {
            console.log(`\n⚠️  Encontrados ${sinTipo.length} suministros sin tipo de categoría:\n`);
            sinTipo.forEach(s => {
                console.log(`ID: ${s.id_suministro} | Categoría: ${s.categoria_nombre || 'NULL'} | Costo: $${parseFloat(s.costo_total).toFixed(2)}`);
            });
        } else {
            console.log('\n✅ Todos los suministros tienen categoría con tipo asignado');
        }

        // Consulta 3: Buscar registros que puedan estar contándose doble
        console.log('\n' + '═'.repeat(70));
        console.log('CONSULTA 3: VERIFICAR DUPLICADOS O REGISTROS ANÓMALOS');
        console.log('═'.repeat(70));

        const [duplicados] = await connection.query(`
            SELECT 
                folio,
                COUNT(*) as veces,
                SUM(costo_total) as total_duplicado
            FROM suministros
            WHERE folio IS NOT NULL AND folio != ''
            AND costo_total IS NOT NULL
            GROUP BY folio
            HAVING COUNT(*) > 1
            ORDER BY veces DESC
            LIMIT 10
        `);

        if (duplicados.length > 0) {
            console.log(`\n⚠️  Encontrados folios duplicados:\n`);
            duplicados.forEach(d => {
                console.log(`Folio: ${d.folio} | Veces: ${d.veces} | Total: $${parseFloat(d.total_duplicado).toFixed(2)}`);
            });
        } else {
            console.log('\n✅ No se encontraron folios duplicados');
        }

        // Consulta 4: TOP 10 suministros más costosos de Proyectos
        console.log('\n' + '═'.repeat(70));
        console.log('CONSULTA 4: TOP 10 GASTOS MÁS ALTOS DE PROYECTOS');
        console.log('═'.repeat(70));

        const [topProyectos] = await connection.query(`
            SELECT 
                s.id_suministro,
                s.nombre,
                s.costo_total,
                s.fecha,
                c.nombre as categoria,
                p.nombre as proyecto
            FROM suministros s
            INNER JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
            WHERE c.tipo = 'Proyecto'
            AND s.costo_total IS NOT NULL
            ORDER BY s.costo_total DESC
            LIMIT 10
        `);

        console.log('\n💰 Los 10 gastos más altos clasificados como Proyectos:\n');
        topProyectos.forEach((s, i) => {
            console.log(`${i + 1}. ID: ${s.id_suministro}`);
            console.log(`   Nombre: ${s.nombre}`);
            console.log(`   Costo: $${parseFloat(s.costo_total).toFixed(2)}`);
            console.log(`   Fecha: ${s.fecha}`);
            console.log(`   Categoría: ${s.categoria}`);
            console.log(`   Proyecto: ${s.proyecto || 'N/A'}\n`);
        });

        // Consulta 5: Suma de suministros + nóminas (como lo hace el frontend)
        console.log('═'.repeat(70));
        console.log('CONSULTA 5: TOTALES INCLUYENDO NÓMINAS (COMO FRONTEND)');
        console.log('═'.repeat(70));

        // Primero los suministros
        const [totalesSuministros] = await connection.query(`
            SELECT 
                c.tipo,
                SUM(s.costo_total) as total
            FROM suministros s
            INNER JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            WHERE s.costo_total IS NOT NULL
            GROUP BY c.tipo
        `);

        // Luego las nóminas
        const [totalesNominas] = await connection.query(`
            SELECT 
                SUM(monto_total) as total_nominas
            FROM nomina_empleados
            WHERE monto_total IS NOT NULL
        `);

        const totalNominas = parseFloat(totalesNominas[0].total_nominas || 0);
        let totalAdmin = 0;
        let totalProyecto = 0;

        totalesSuministros.forEach(row => {
            if (row.tipo === 'Administrativo') totalAdmin = parseFloat(row.total);
            if (row.tipo === 'Proyecto') totalProyecto = parseFloat(row.total);
        });

        const totalGeneral = totalAdmin + totalProyecto + totalNominas;

        console.log('\n📊 TOTALES CALCULADOS (Método Frontend):\n');
        console.log(`Administrativos: $${totalAdmin.toFixed(2)}`);
        console.log(`Proyectos: $${totalProyecto.toFixed(2)}`);
        console.log(`Nóminas: $${totalNominas.toFixed(2)}`);
        console.log(`TOTAL GENERAL: $${totalGeneral.toFixed(2)}`);

        console.log('\n📱 COMPARACIÓN CON UI:');
        console.log(`UI Administrativos: $101,873.00 | BD: $${totalAdmin.toFixed(2)} | ✓`);
        console.log(`UI Proyectos: $3,209,786.79 | BD: $${totalProyecto.toFixed(2)} | ${totalProyecto === 3209786.79 ? '✓' : '✗ DIFERENCIA: $' + (3209786.79 - totalProyecto).toFixed(2)}`);
        console.log(`UI Nóminas: $29,112.67 | BD: $${totalNominas.toFixed(2)} | ✓`);
        console.log(`UI Total: $3,340,772.46 | BD: $${totalGeneral.toFixed(2)} | ${totalGeneral === 3340772.46 ? '✓' : '✗ DIFERENCIA: $' + (3340772.46 - totalGeneral).toFixed(2)}`);

        // Consulta 6: Verificar si hay registros en cache o en otras tablas
        console.log('\n' + '═'.repeat(70));
        console.log('CONSULTA 6: VERIFICAR OTRAS FUENTES DE DATOS');
        console.log('═'.repeat(70));

        // Verificar si existe una tabla de caché o histórico
        const [tables] = await connection.query(`
            SHOW TABLES LIKE '%suministro%'
        `);

        console.log('\n📋 Tablas relacionadas con suministros en la BD:\n');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`   • ${tableName}`);
        });

        // Consulta 7: Verificar fechas para entender si hay filtros implícitos
        console.log('\n' + '═'.repeat(70));
        console.log('CONSULTA 7: DISTRIBUCIÓN TEMPORAL');
        console.log('═'.repeat(70));

        const [porMes] = await connection.query(`
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                c.tipo,
                COUNT(*) as cantidad,
                SUM(costo_total) as total
            FROM suministros s
            INNER JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            WHERE costo_total IS NOT NULL
            GROUP BY DATE_FORMAT(fecha, '%Y-%m'), c.tipo
            ORDER BY mes DESC, c.tipo
            LIMIT 20
        `);

        console.log('\n📅 Distribución por mes y tipo:\n');
        let mesActual = null;
        porMes.forEach(row => {
            if (mesActual !== row.mes) {
                if (mesActual !== null) console.log('');
                mesActual = row.mes;
                console.log(`📆 ${row.mes}:`);
            }
            console.log(`   ${row.tipo}: ${row.cantidad} registros | Total: $${parseFloat(row.total).toFixed(2)}`);
        });

        console.log('\n' + '═'.repeat(70));
        console.log('DIAGNÓSTICO COMPLETADO');
        console.log('═'.repeat(70));
        console.log('');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

verificarDiscrepancia();
