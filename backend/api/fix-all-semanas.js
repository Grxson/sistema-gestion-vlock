/**
 * Script para corregir TODAS las semanas incorrectas en la BD
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);
const { generarInfoSemana } = require('./src/utils/weekCalculator');

async function fixAllSemanas() {
    try {
        console.log('🔧 CORRIGIENDO TODAS LAS SEMANAS INCORRECTAS\n');
        
        const todasLasSemanas = await SemanaNomina.findAll({
            order: [['anio', 'ASC'], ['semana_iso', 'ASC']]
        });
        
        let corregidas = 0;
        
        for (const semana of todasLasSemanas) {
            // Calcular qué semana ISO debería ser según la fecha_inicio
            const fechaInicio = new Date(semana.fecha_inicio);
            const infoCalculada = generarInfoSemana(fechaInicio);
            
            const esCorrecta = semana.semana_iso === infoCalculada.semanaISO && 
                              semana.anio === infoCalculada.año;
            
            if (!esCorrecta) {
                console.log(`📝 Corrigiendo Semana ID: ${semana.id_semana}`);
                console.log(`   Antes: Año ${semana.anio}, Semana ISO ${semana.semana_iso}`);
                console.log(`   Después: Año ${infoCalculada.año}, Semana ISO ${infoCalculada.semanaISO}`);
                
                // Actualizar la semana
                await semana.update({
                    anio: infoCalculada.año,
                    semana_iso: infoCalculada.semanaISO,
                    etiqueta: infoCalculada.etiqueta,
                    fecha_inicio: infoCalculada.fechaInicio.toISOString().split('T')[0],
                    fecha_fin: infoCalculada.fechaFin.toISOString().split('T')[0]
                });
                
                console.log(`   ✅ Corregida\n`);
                corregidas++;
            }
        }
        
        if (corregidas === 0) {
            console.log('✅ No había semanas que corregir\n');
        } else {
            console.log(`✅ ${corregidas} semanas corregidas exitosamente\n`);
        }
        
        // Mostrar resumen final
        console.log('📊 RESUMEN FINAL DE SEMANAS DE OCTUBRE 2025:\n');
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
                console.log(`   ✅ ID: ${semana.id_semana} | Semana ISO: ${semana.semana_iso}`);
                console.log(`      ${semana.etiqueta}`);
                console.log(`      Período: ${semana.fecha_inicio} al ${semana.fecha_fin}\n`);
            }
        });
        
        console.log('💡 IMPORTANTE: Ahora reinicia el backend para que use los datos corregidos\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixAllSemanas();
