require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mysql = require('mysql2/promise');

async function diagnosticoSuministros() {
    console.log('\n╔══════════════════════════════════════════════════════════════╗');
    console.log('║     DIAGNÓSTICO COMPLETO DE SUMINISTROS Y CÁLCULOS          ║');
    console.log('╚══════════════════════════════════════════════════════════════╝\n');

    let connection;
    
    try {
        // Parsear DATABASE_URL
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            throw new Error('DATABASE_URL no encontrada en .env');
        }

        // Formato: mysql://user:pass@host:port/database
        const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
            throw new Error('Formato de DATABASE_URL inválido');
        }

        const [, user, password, host, port, database] = match;

        console.log('📡 Conectando a:', host);
        console.log('🗄️  Base de datos:', database);
        console.log('');

        connection = await mysql.createConnection({
            host,
            port: parseInt(port),
            user,
            password,
            database
        });

        console.log('✅ Conexión establecida\n');
        console.log('═'.repeat(70));
        console.log('PARTE 1: ANÁLISIS DE CATEGORÍAS');
        console.log('═'.repeat(70));

        // 1. Verificar categorías
        const [categorias] = await connection.query(`
            SELECT 
                id_categoria,
                nombre,
                tipo,
                descripcion
            FROM categorias_suministro
            ORDER BY tipo, nombre
        `);

        console.log('\n📋 Categorías en la base de datos:\n');
        console.log('┌─────┬────────────────────────────┬──────────────────┐');
        console.log('│ ID  │ Nombre                     │ Tipo             │');
        console.log('├─────┼────────────────────────────┼──────────────────┤');
        categorias.forEach(cat => {
            const nombre = cat.nombre.padEnd(26);
            const tipo = (cat.tipo || 'Sin tipo').padEnd(16);
            console.log(`│ ${cat.id_categoria.toString().padEnd(3)} │ ${nombre} │ ${tipo} │`);
        });
        console.log('└─────┴────────────────────────────┴──────────────────┘');

        // Contar por tipo
        const adminCats = categorias.filter(c => c.tipo === 'Administrativo').length;
        const proyectoCats = categorias.filter(c => c.tipo === 'Proyecto').length;
        const sinTipo = categorias.filter(c => !c.tipo).length;

        console.log(`\n📊 Total categorías: ${categorias.length}`);
        console.log(`   • Administrativas: ${adminCats}`);
        console.log(`   • Proyectos: ${proyectoCats}`);
        console.log(`   • Sin tipo: ${sinTipo}`);

        console.log('\n' + '═'.repeat(70));
        console.log('PARTE 2: ANÁLISIS DE SUMINISTROS');
        console.log('═'.repeat(70));

        // 2. Verificar suministros
        const [suministros] = await connection.query(`
            SELECT 
                s.id_suministro,
                s.id_categoria_suministro,
                s.nombre,
                s.descripcion_detallada,
                s.costo_total,
                s.fecha,
                c.nombre as categoria_nombre,
                c.tipo as categoria_tipo,
                p.nombre as proyecto_nombre
            FROM suministros s
            LEFT JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            LEFT JOIN proyectos p ON s.id_proyecto = p.id_proyecto
            WHERE s.costo_total IS NOT NULL
            ORDER BY s.fecha DESC
        `);

        console.log(`\n📦 Total suministros: ${suministros.length}`);

        // Agrupar por tipo de categoría
        let gastosAdmin = 0;
        let gastosProyecto = 0;
        let sinCategoria = 0;
        let suministrosSinTipo = [];

        suministros.forEach(s => {
            const precio = parseFloat(s.costo_total) || 0;
            if (!s.categoria_tipo) {
                sinCategoria += precio;
                suministrosSinTipo.push({
                    id: s.id_suministro,
                    desc: s.nombre,
                    precio: precio,
                    cat_id: s.id_categoria_suministro
                });
            } else if (s.categoria_tipo === 'Administrativo') {
                gastosAdmin += precio;
            } else if (s.categoria_tipo === 'Proyecto') {
                gastosProyecto += precio;
            }
        });

        console.log('\n💰 TOTALES POR TIPO (Solo Suministros):');
        console.log(`   • Gastos Administrativos: $${gastosAdmin.toFixed(2)}`);
        console.log(`   • Gastos de Proyectos: $${gastosProyecto.toFixed(2)}`);
        console.log(`   • Sin categoría/tipo: $${sinCategoria.toFixed(2)}`);
        console.log(`   • TOTAL: $${(gastosAdmin + gastosProyecto + sinCategoria).toFixed(2)}`);

        if (suministrosSinTipo.length > 0) {
            console.log(`\n⚠️  ${suministrosSinTipo.length} suministros sin tipo de categoría:`);
            suministrosSinTipo.slice(0, 10).forEach(s => {
                console.log(`   • ID: ${s.id}, Cat: ${s.cat_id}, Precio: $${s.precio.toFixed(2)}, Desc: ${s.desc.substring(0, 40)}`);
            });
            if (suministrosSinTipo.length > 10) {
                console.log(`   ... y ${suministrosSinTipo.length - 10} más`);
            }
        }

        console.log('\n' + '═'.repeat(70));
        console.log('PARTE 3: ANÁLISIS DE NÓMINAS');
        console.log('═'.repeat(70));

        // 3. Verificar nóminas
        const [nominas] = await connection.query(`
            SELECT 
                id_nomina,
                monto_total,
                fecha_pago,
                id_semana,
                id_empleado
            FROM nomina_empleados
            WHERE monto_total IS NOT NULL
            ORDER BY fecha_pago DESC
        `);

        const totalNominas = nominas.reduce((sum, n) => sum + (parseFloat(n.monto_total) || 0), 0);

        console.log(`\n💼 Total nóminas: ${nominas.length}`);
        console.log(`💰 Total en nóminas: $${totalNominas.toFixed(2)}`);

        console.log('\n' + '═'.repeat(70));
        console.log('PARTE 4: TOTALES GENERALES');
        console.log('═'.repeat(70));

        const totalGeneral = gastosAdmin + gastosProyecto + sinCategoria + totalNominas;

        console.log('\n📊 RESUMEN FINAL:\n');
        console.log('┌────────────────────────────────┬──────────────────┐');
        console.log('│ Concepto                       │ Monto            │');
        console.log('├────────────────────────────────┼──────────────────┤');
        console.log(`│ Gastos Administrativos         │ $${gastosAdmin.toFixed(2).padStart(15)} │`);
        console.log(`│ Gastos de Proyectos            │ $${gastosProyecto.toFixed(2).padStart(15)} │`);
        console.log(`│ Nóminas                        │ $${totalNominas.toFixed(2).padStart(15)} │`);
        if (sinCategoria > 0) {
            console.log(`│ Sin categoría asignada ⚠️      │ $${sinCategoria.toFixed(2).padStart(15)} │`);
        }
        console.log('├────────────────────────────────┼──────────────────┤');
        console.log(`│ TOTAL GENERAL                  │ $${totalGeneral.toFixed(2).padStart(15)} │`);
        console.log('└────────────────────────────────┴──────────────────┘');

        console.log('\n' + '═'.repeat(70));
        console.log('PARTE 5: COMPARACIÓN CON VALORES ESPERADOS');
        console.log('═'.repeat(70));

        console.log('\n📱 Valores mostrados en la aplicación:');
        console.log('   • Total General: $3,340,772.46');
        console.log('   • Gastos Administrativos: $101,873.00');
        console.log('   • Gastos de Proyectos: $3,209,786.79');
        console.log('   • Nóminas: $29,112.67');

        console.log('\n🔍 Diferencias encontradas:');
        const diffAdmin = Math.abs(gastosAdmin - 101873.00);
        const diffProyecto = Math.abs(gastosProyecto - 3209786.79);
        const diffNominas = Math.abs(totalNominas - 29112.67);
        const diffGeneral = Math.abs(totalGeneral - 3340772.46);

        console.log(`   • Administrativos: $${diffAdmin.toFixed(2)} de diferencia`);
        console.log(`   • Proyectos: $${diffProyecto.toFixed(2)} de diferencia`);
        console.log(`   • Nóminas: $${diffNominas.toFixed(2)} de diferencia`);
        console.log(`   • Total General: $${diffGeneral.toFixed(2)} de diferencia`);

        console.log('\n' + '═'.repeat(70));
        console.log('PARTE 6: VERIFICACIÓN DE FILTROS DE FECHA');
        console.log('═'.repeat(70));

        // Verificar si hay filtros de fecha aplicados
        const [suministrosPorFecha] = await connection.query(`
            SELECT 
                DATE_FORMAT(fecha, '%Y-%m') as mes,
                COUNT(*) as cantidad,
                SUM(costo_total) as total
            FROM suministros
            WHERE costo_total IS NOT NULL
            GROUP BY DATE_FORMAT(fecha, '%Y-%m')
            ORDER BY mes DESC
            LIMIT 6
        `);

        console.log('\n📅 Distribución por mes (últimos 6 meses):\n');
        console.log('┌──────────┬──────────┬──────────────────┐');
        console.log('│ Mes      │ Cantidad │ Total            │');
        console.log('├──────────┼──────────┼──────────────────┤');
        suministrosPorFecha.forEach(m => {
            console.log(`│ ${m.mes}    │ ${m.cantidad.toString().padStart(8)} │ $${parseFloat(m.total).toFixed(2).padStart(15)} │`);
        });
        console.log('└──────────┴──────────┴──────────────────┘');

        console.log('\n' + '═'.repeat(70));
        console.log('DIAGNÓSTICO COMPLETADO');
        console.log('═'.repeat(70));

        console.log('\n💡 POSIBLES CAUSAS DE DISCREPANCIA:\n');
        if (sinCategoria > 0) {
            console.log(`   ⚠️  Hay $${sinCategoria.toFixed(2)} en suministros sin tipo de categoría`);
        }
        if (diffGeneral > 1) {
            console.log('   ⚠️  Los cálculos en el frontend pueden estar usando filtros diferentes');
            console.log('   ⚠️  Verificar si hay filtros de fecha activos (01/01/2025)');
            console.log('   ⚠️  Revisar la función calculateGeneralStats en Suministros.jsx');
        }
        console.log('');

    } catch (error) {
        console.error('\n❌ Error durante el diagnóstico:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Conexión cerrada\n');
        }
    }
}

// Ejecutar diagnóstico
diagnosticoSuministros();
