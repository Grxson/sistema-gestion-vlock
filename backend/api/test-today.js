const { generarInfoSemana } = require('./src/utils/weekCalculator');

const hoy = new Date(2025, 9, 24); // 24 octubre 2025
const info = generarInfoSemana(hoy);

console.log('📅 Hoy: 24 de octubre de 2025');
console.log('📊 Semana ISO:', info.semanaISO);
console.log('📊 Período:', `Semana ${info.semanaISO} (${info.fechaInicio.toLocaleDateString('es-MX')} - ${info.fechaFin.toLocaleDateString('es-MX')})`);
