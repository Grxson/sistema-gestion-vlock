/**
 * Script de prueba para verificar el sistema de semanas corregido
 */

const { generarInfoSemana } = require('./weekCalculator');

function testWeekSystem() {
    console.log('🧪 PROBANDO SISTEMA DE SEMANAS CORREGIDO\n');
    
    // Probar con la fecha actual (18 octubre 2025)
    const fechaActual = new Date(2025, 9, 18); // 18 octubre 2025
    const infoSemana = generarInfoSemana(fechaActual);
    
    console.log('📅 Fecha de prueba:', fechaActual.toLocaleDateString('es-MX'));
    console.log('📊 Información de semana calculada:');
    console.log('   - Año:', infoSemana.año);
    console.log('   - Semana ISO:', infoSemana.semanaISO);
    console.log('   - Etiqueta:', infoSemana.etiqueta);
    console.log('   - Fecha inicio:', infoSemana.fechaInicio.toLocaleDateString('es-MX'));
    console.log('   - Fecha fin:', infoSemana.fechaFin.toLocaleDateString('es-MX'));
    
    console.log('\n✅ El sistema debería:');
    console.log('   1. Buscar semana con anio=2025, semana_iso=' + infoSemana.semanaISO);
    console.log('   2. Si no existe, crear nueva semana');
    console.log('   3. Usar el id_semana correcto para la nómina');
    
    return infoSemana;
}

// Ejecutar prueba si se llama directamente
if (require.main === module) {
    testWeekSystem();
}

module.exports = { testWeekSystem };
