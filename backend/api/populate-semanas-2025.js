/**
 * Script para poblar la tabla semanas_nominas con todas las semanas del año 2025
 * Se conecta a la base de datos de Railway usando las credenciales del .env
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);
const { generarInfoSemana } = require('./src/utils/weekCalculator');

async function populateSemanas2025() {
    try {
        console.log('🚀 POBLANDO SEMANAS DEL AÑO 2025\n');
        console.log(`📡 Conectando a: ${process.env.DB_HOST || 'localhost'}\n`);
        
        // Verificar conexión
        await sequelize.authenticate();
        console.log('✅ Conexión a la base de datos establecida\n');
        
        const semanas = [];
        const año = 2025;
        
        // Generar todas las semanas del año 2025
        // Empezamos desde el 1 de enero y vamos generando semanas
        let fecha = new Date(año, 0, 1); // 1 de enero de 2025
        const finAño = new Date(año, 11, 31); // 31 de diciembre de 2025
        
        const semanasGeneradas = new Set();
        
        while (fecha <= finAño) {
            const infoSemana = generarInfoSemana(fecha);
            
            // Crear una clave única para evitar duplicados
            const clave = `${infoSemana.año}-${infoSemana.semanaISO}`;
            
            if (!semanasGeneradas.has(clave)) {
                semanasGeneradas.add(clave);
                
                semanas.push({
                    anio: infoSemana.año,
                    semana_iso: infoSemana.semanaISO,
                    etiqueta: infoSemana.etiqueta,
                    fecha_inicio: infoSemana.fechaInicio.toISOString().split('T')[0],
                    fecha_fin: infoSemana.fechaFin.toISOString().split('T')[0],
                    estado: 'Borrador'
                });
            }
            
            // Avanzar 7 días
            fecha.setDate(fecha.getDate() + 7);
        }
        
        console.log(`📊 Total de semanas a insertar: ${semanas.length}\n`);
        
        // Eliminar todas las semanas existentes del 2025 para evitar conflictos
        console.log('🗑️  Eliminando semanas existentes del 2025...');
        const deleted = await SemanaNomina.destroy({
            where: {
                anio: 2025
            }
        });
        console.log(`   ✅ Eliminadas ${deleted} semanas\n`);
        
        // Insertar las nuevas semanas
        console.log('➕ Insertando nuevas semanas...\n');
        
        let insertadas = 0;
        for (const semana of semanas) {
            try {
                await SemanaNomina.create(semana);
                insertadas++;
                
                if (insertadas % 10 === 0) {
                    console.log(`   ✅ ${insertadas}/${semanas.length} semanas insertadas...`);
                }
            } catch (error) {
                console.error(`   ❌ Error insertando semana ${semana.semana_iso}:`, error.message);
            }
        }
        
        console.log(`\n✅ ${insertadas} semanas insertadas exitosamente\n`);
        
        // Mostrar resumen de semanas de octubre
        console.log('📅 SEMANAS DE OCTUBRE 2025:\n');
        const semanasOctubre = await SemanaNomina.findAll({
            where: {
                anio: 2025
            },
            order: [['semana_iso', 'ASC']]
        });
        
        semanasOctubre.forEach(semana => {
            const fechaInicio = new Date(semana.fecha_inicio);
            const fechaFin = new Date(semana.fecha_fin);
            if ((fechaInicio.getMonth() === 9 || fechaFin.getMonth() === 9)) {
                console.log(`   ID: ${semana.id_semana} | Semana ISO: ${semana.semana_iso}`);
                console.log(`   ${semana.etiqueta}`);
                console.log(`   Período: ${semana.fecha_inicio} al ${semana.fecha_fin}\n`);
            }
        });
        
        // Mostrar semana actual
        const hoy = new Date();
        const infoSemanaActual = generarInfoSemana(hoy);
        console.log('🎯 SEMANA ACTUAL DEL SISTEMA:');
        console.log(`   Año: ${infoSemanaActual.año}`);
        console.log(`   Semana ISO: ${infoSemanaActual.semanaISO}`);
        console.log(`   ${infoSemanaActual.etiqueta}`);
        console.log(`   Período: ${infoSemanaActual.fechaInicio.toISOString().split('T')[0]} al ${infoSemanaActual.fechaFin.toISOString().split('T')[0]}\n`);
        
        console.log('✅ PROCESO COMPLETADO\n');
        console.log('💡 Ahora reinicia el backend para que use las semanas actualizadas\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

populateSemanas2025();
