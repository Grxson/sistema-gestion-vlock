/**
 * Script de prueba rápida para verificar el algoritmo de semanas ISO
 */

const { generarInfoSemana } = require('./src/utils/weekCalculator');

console.log('🧪 PRUEBA DEL ALGORITMO DE SEMANAS ISO\n');

// Probar con 19 de octubre de 2025 (fecha que usa el backend para semana 4)
const fecha19Oct = new Date(2025, 9, 19); // 19 octubre 2025
const info19Oct = generarInfoSemana(fecha19Oct);

console.log('📅 Fecha de prueba: 19 de octubre de 2025');
console.log('📊 Resultado:');
console.log('   - Semana ISO:', info19Oct.semanaISO);
console.log('   - Año:', info19Oct.año);
console.log('   - Etiqueta:', info19Oct.etiqueta);
console.log('   - Fecha inicio:', info19Oct.fechaInicio.toLocaleDateString('es-MX'));
console.log('   - Fecha fin:', info19Oct.fechaFin.toLocaleDateString('es-MX'));

console.log('\n✅ Si la Semana ISO es 43, el algoritmo está correcto.');
console.log('❌ Si la Semana ISO es 42, el algoritmo NO se actualizó.\n');
