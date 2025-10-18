/**
 * Script de prueba para verificar el cálculo correcto de semanas ISO
 */

const { calcularSemanaISO, generarInfoSemana } = require('./weekCalculator');

function testISOWeekCalculation() {
    console.log('🧪 PROBANDO CÁLCULO DE SEMANAS ISO\n');
    
    // Probar con fechas específicas de octubre 2025
    const fechasPrueba = [
        new Date(2025, 9, 1),   // 1 octubre 2025 (miércoles)
        new Date(2025, 9, 6),   // 6 octubre 2025 (lunes)
        new Date(2025, 9, 13),  // 13 octubre 2025 (lunes)
        new Date(2025, 9, 18),  // 18 octubre 2025 (sábado) ⭐
        new Date(2025, 9, 20),  // 20 octubre 2025 (lunes)
        new Date(2025, 9, 27),  // 27 octubre 2025 (lunes)
        new Date(2025, 9, 31)   // 31 octubre 2025 (viernes)
    ];
    
    console.log('📅 Fechas de prueba (octubre 2025):');
    fechasPrueba.forEach(fecha => {
        const semanaISO = calcularSemanaISO(fecha);
        const info = generarInfoSemana(fecha);
        const diaSemana = fecha.toLocaleDateString('es-MX', { weekday: 'long' });
        
        console.log(`${fecha.toLocaleDateString('es-MX')} (${diaSemana}): Semana ISO ${semanaISO}`);
        console.log(`   Fechas: ${info.fechaInicio.toLocaleDateString('es-MX')} - ${info.fechaFin.toLocaleDateString('es-MX')}`);
        console.log(`   Etiqueta: ${info.etiqueta}`);
        console.log('');
    });
    
    // Verificar específicamente el 18 de octubre
    const fecha18Octubre = new Date(2025, 9, 18);
    const semana18Octubre = calcularSemanaISO(fecha18Octubre);
    const info18Octubre = generarInfoSemana(fecha18Octubre);
    
    console.log('🎯 VERIFICACIÓN ESPECÍFICA - 18 OCTUBRE 2025:');
    console.log(`Fecha: ${fecha18Octubre.toLocaleDateString('es-MX')} (${fecha18Octubre.toLocaleDateString('es-MX', { weekday: 'long' })})`);
    console.log(`Semana ISO calculada: ${semana18Octubre}`);
    console.log(`Fechas de la semana: ${info18Octubre.fechaInicio.toLocaleDateString('es-MX')} - ${info18Octubre.fechaFin.toLocaleDateString('es-MX')}`);
    console.log(`Etiqueta: ${info18Octubre.etiqueta}`);
    
    // Verificar que sea la semana correcta
    const esCorrecta = semana18Octubre === 42;
    console.log(`\n✅ Resultado: ${esCorrecta ? 'CORRECTO (Semana ISO 42)' : 'INCORRECTO'}`);
    
    if (!esCorrecta) {
        console.log(`❌ Esperado: Semana ISO 42`);
        console.log(`❌ Obtenido: Semana ISO ${semana18Octubre}`);
    }
    
    return esCorrecta;
}

// Función para probar con fechas conocidas
function testKnownDates() {
    console.log('\n🔍 PROBANDO FECHAS CONOCIDAS:\n');
    
    // Fechas con semanas ISO conocidas
    const fechasConocidas = [
        { fecha: new Date(2025, 0, 1), esperada: 1, descripcion: '1 enero 2025' },
        { fecha: new Date(2025, 0, 6), esperada: 2, descripcion: '6 enero 2025' },
        { fecha: new Date(2025, 8, 30), esperada: 40, descripcion: '30 septiembre 2025' },
        { fecha: new Date(2025, 9, 7), esperada: 41, descripcion: '7 octubre 2025' },
        { fecha: new Date(2025, 9, 14), esperada: 42, descripcion: '14 octubre 2025' },
        { fecha: new Date(2025, 9, 18), esperada: 42, descripcion: '18 octubre 2025' },
        { fecha: new Date(2025, 9, 21), esperada: 43, descripcion: '21 octubre 2025' }
    ];
    
    let correctas = 0;
    let totales = fechasConocidas.length;
    
    fechasConocidas.forEach(({ fecha, esperada, descripcion }) => {
        const calculada = calcularSemanaISO(fecha);
        const esCorrecta = calculada === esperada;
        const icono = esCorrecta ? '✅' : '❌';
        
        console.log(`${icono} ${descripcion}: Esperada ${esperada}, Calculada ${calculada}`);
        
        if (esCorrecta) correctas++;
    });
    
    console.log(`\n📊 Resultado: ${correctas}/${totales} correctas`);
    return correctas === totales;
}

// Ejecutar todas las pruebas
function ejecutarTodasLasPruebas() {
    console.log('🚀 INICIANDO PRUEBAS DE SEMANAS ISO\n');
    
    const prueba1 = testISOWeekCalculation();
    const prueba2 = testKnownDates();
    
    console.log('\n=== RESULTADOS FINALES ===');
    console.log(`✅ Prueba 1 (Octubre 2025): ${prueba1 ? 'PASÓ' : 'FALLÓ'}`);
    console.log(`✅ Prueba 2 (Fechas conocidas): ${prueba2 ? 'PASÓ' : 'FALLÓ'}`);
    
    const todasCorrectas = prueba1 && prueba2;
    console.log(`\n🎯 RESULTADO FINAL: ${todasCorrectas ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ HAY ERRORES'}`);
    
    return todasCorrectas;
}

// Ejecutar si se llama directamente
if (require.main === module) {
    ejecutarTodasLasPruebas();
}

module.exports = { 
    testISOWeekCalculation, 
    testKnownDates, 
    ejecutarTodasLasPruebas 
};
