/**
 * Script para limpiar y corregir la tabla semanas_nominas
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);

async function fixSemanasDB() {
    try {
        console.log('🔧 LIMPIANDO Y CORRIGIENDO TABLA semanas_nominas\n');
        
        // 1. Eliminar la semana ISO 40 corrupta (tiene el mismo período que la 42)
        console.log('1️⃣ Eliminando semana ISO 40 corrupta...');
        const deleted = await SemanaNomina.destroy({
            where: {
                id_semana: 7,
                semana_iso: 40
            }
        });
        console.log(`   ✅ Eliminadas ${deleted} filas\n`);
        
        // 2. Verificar semanas restantes
        console.log('2️⃣ Verificando semanas restantes de octubre 2025:\n');
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
                console.log(`   ID: ${semana.id_semana} | Semana ISO: ${semana.semana_iso} | ${semana.etiqueta}`);
                console.log(`   Período: ${semana.fecha_inicio} al ${semana.fecha_fin}\n`);
            }
        });
        
        console.log('✅ Limpieza completada\n');
        
        // 3. Mostrar resumen
        console.log('📊 RESUMEN DE SEMANAS DE OCTUBRE 2025:');
        console.log('   - Semana ISO 42: 13-19 octubre (6 nóminas pagadas)');
        console.log('   - Semana ISO 43: 20-26 octubre (1 nómina en borrador)');
        console.log('\n💡 Para crear nóminas de la semana actual (ISO 43), selecciona "Semana 5" en el wizard\n');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixSemanasDB();
