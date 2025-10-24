/**
 * Script para validar TODAS las semanas en la BD y detectar inconsistencias
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);
const { generarInfoSemana } = require('./src/utils/weekCalculator');

async function validateAllSemanas() {
    try {
        console.log('🔍 VALIDANDO TODAS LAS SEMANAS EN LA BASE DE DATOS\n');
        
        const todasLasSemanas = await SemanaNomina.findAll({
            order: [['anio', 'ASC'], ['semana_iso', 'ASC']]
        });
        
        console.log(`📊 Total de semanas en BD: ${todasLasSemanas.length}\n`);
        
        const problemas = [];
        
        for (const semana of todasLasSemanas) {
            // Calcular qué semana ISO debería ser según la fecha_inicio
            const fechaInicio = new Date(semana.fecha_inicio);
            const infoCalculada = generarInfoSemana(fechaInicio);
            
            const esCorrecta = semana.semana_iso === infoCalculada.semanaISO && 
                              semana.anio === infoCalculada.año;
            
            if (!esCorrecta) {
                problemas.push({
                    id: semana.id_semana,
                    actual: {
                        anio: semana.anio,
                        semana_iso: semana.semana_iso,
                        etiqueta: semana.etiqueta,
                        fecha_inicio: semana.fecha_inicio,
                        fecha_fin: semana.fecha_fin
                    },
                    deberia_ser: {
                        anio: infoCalculada.año,
                        semana_iso: infoCalculada.semanaISO,
                        etiqueta: infoCalculada.etiqueta,
                        fecha_inicio: infoCalculada.fechaInicio.toISOString().split('T')[0],
                        fecha_fin: infoCalculada.fechaFin.toISOString().split('T')[0]
                    }
                });
            }
        }
        
        if (problemas.length === 0) {
            console.log('✅ TODAS LAS SEMANAS SON CORRECTAS\n');
        } else {
            console.log(`❌ ENCONTRADOS ${problemas.length} PROBLEMAS:\n`);
            
            problemas.forEach((problema, index) => {
                console.log(`${index + 1}. Semana ID: ${problema.id}`);
                console.log(`   ❌ Actual: Año ${problema.actual.anio}, Semana ISO ${problema.actual.semana_iso}`);
                console.log(`      Período: ${problema.actual.fecha_inicio} al ${problema.actual.fecha_fin}`);
                console.log(`   ✅ Debería ser: Año ${problema.deberia_ser.anio}, Semana ISO ${problema.deberia_ser.semana_iso}`);
                console.log(`      Período: ${problema.deberia_ser.fecha_inicio} al ${problema.deberia_ser.fecha_fin}`);
                console.log('');
            });
            
            console.log('\n💡 ¿Deseas corregir estas semanas automáticamente?');
            console.log('   Ejecuta: node fix-all-semanas.js\n');
        }
        
        // Mostrar todas las semanas correctas
        console.log('📋 LISTADO COMPLETO DE SEMANAS:\n');
        todasLasSemanas.forEach(semana => {
            const fechaInicio = new Date(semana.fecha_inicio);
            const infoCalculada = generarInfoSemana(fechaInicio);
            const esCorrecta = semana.semana_iso === infoCalculada.semanaISO;
            const icono = esCorrecta ? '✅' : '❌';
            
            console.log(`${icono} ID: ${semana.id_semana} | Año: ${semana.anio} | Semana ISO: ${semana.semana_iso}`);
            console.log(`   ${semana.etiqueta || 'Sin etiqueta'}`);
            console.log(`   Período: ${semana.fecha_inicio} al ${semana.fecha_fin}\n`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

validateAllSemanas();
