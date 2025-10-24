/**
 * Script para verificar qué semanas hay en la base de datos
 */

const sequelize = require('./src/config/db');
const SemanaNomina = require('./src/models/semanaNomina.model')(sequelize, require('sequelize').DataTypes);

async function checkSemanasDB() {
    try {
        console.log('🔍 CONSULTANDO TABLA semanas_nomina\n');
        
        const semanas = await SemanaNomina.findAll({
            order: [['anio', 'ASC'], ['semana_iso', 'ASC']]
        });
        
        console.log(`📊 Total de semanas en BD: ${semanas.length}\n`);
        
        semanas.forEach(semana => {
            console.log(`ID: ${semana.id_semana} | Año: ${semana.anio} | Semana ISO: ${semana.semana_iso} | ${semana.etiqueta}`);
            console.log(`   Período: ${semana.fecha_inicio} al ${semana.fecha_fin}`);
            console.log('');
        });
        
        // Buscar específicamente semanas de octubre 2025
        console.log('🔍 SEMANAS DE OCTUBRE 2025:\n');
        const semanasOctubre = semanas.filter(s => {
            const fechaInicio = new Date(s.fecha_inicio);
            const fechaFin = new Date(s.fecha_fin);
            return (fechaInicio.getMonth() === 9 || fechaFin.getMonth() === 9) && fechaInicio.getFullYear() === 2025;
        });
        
        semanasOctubre.forEach(semana => {
            console.log(`✅ ID: ${semana.id_semana} | Semana ISO: ${semana.semana_iso} | ${semana.etiqueta}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

checkSemanasDB();
