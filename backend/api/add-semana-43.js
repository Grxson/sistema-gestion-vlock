/**
 * Script para agregar la Semana ISO 43 (semana actual)
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);
const { generarInfoSemana } = require('./src/utils/weekCalculator');

async function addSemana43() {
    try {
        console.log('➕ AGREGANDO SEMANA ISO 43 (SEMANA ACTUAL)\n');
        
        // Generar info para el 24 de octubre (hoy, viernes)
        const hoy = new Date(2025, 9, 24); // 24 octubre 2025
        const infoSemana43 = generarInfoSemana(hoy);
        
        console.log('📅 Información de la semana actual:');
        console.log(`   Año: ${infoSemana43.año}`);
        console.log(`   Semana ISO: ${infoSemana43.semanaISO}`);
        console.log(`   Etiqueta: ${infoSemana43.etiqueta}`);
        console.log(`   Período: ${infoSemana43.fechaInicio.toISOString().split('T')[0]} al ${infoSemana43.fechaFin.toISOString().split('T')[0]}\n`);
        
        // Verificar si ya existe
        const existe = await SemanaNomina.findOne({
            where: {
                anio: infoSemana43.año,
                semana_iso: infoSemana43.semanaISO
            }
        });
        
        if (existe) {
            console.log(`⚠️  La Semana ISO ${infoSemana43.semanaISO} ya existe (ID: ${existe.id_semana})\n`);
        } else {
            // Crear la semana
            const nuevaSemana = await SemanaNomina.create({
                anio: infoSemana43.año,
                semana_iso: infoSemana43.semanaISO,
                etiqueta: infoSemana43.etiqueta,
                fecha_inicio: infoSemana43.fechaInicio.toISOString().split('T')[0],
                fecha_fin: infoSemana43.fechaFin.toISOString().split('T')[0],
                estado: 'Borrador'
            });
            
            console.log(`✅ Semana ISO ${infoSemana43.semanaISO} creada exitosamente (ID: ${nuevaSemana.id_semana})\n`);
        }
        
        // Mostrar todas las semanas de octubre
        console.log('📊 SEMANAS DE OCTUBRE 2025:\n');
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
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

addSemana43();
