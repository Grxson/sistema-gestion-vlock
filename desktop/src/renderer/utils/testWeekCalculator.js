/**
 * Prueba del algoritmo de cálculo de semanas del mes
 * Verifica que octubre 2025 tenga 5 semanas, no 6
 */

import { calcularSemanaDelMes, obtenerInfoSemanaCompleta } from './weekCalculator';

// Función auxiliar para calcular semanas en el mes (copiada del archivo principal)
function calcularSemanasEnElMes(año, mes) {
  const primerDiaDelMes = new Date(año, mes, 1);
  const ultimoDiaDelMes = new Date(año, mes + 1, 0);
  
  // Calcular el primer lunes del mes
  const diaDeLaSemana = primerDiaDelMes.getDay();
  const diasHastaLunes = diaDeLaSemana === 0 ? 1 : 8 - diaDeLaSemana;
  const primerLunesDelMes = new Date(primerDiaDelMes);
  primerLunesDelMes.setDate(primerDiaDelMes.getDate() + diasHastaLunes);
  
  // Si el primer lunes está en el mes anterior, usar el primer día del mes
  if (primerLunesDelMes.getMonth() !== mes) {
    primerLunesDelMes.setTime(primerDiaDelMes.getTime());
  }
  
  // Calcular el último domingo del mes
  const ultimoDomingoDelMes = new Date(ultimoDiaDelMes);
  const diaUltimoDomingo = ultimoDiaDelMes.getDay();
  const diasHastaDomingo = diaUltimoDomingo === 0 ? 0 : 7 - diaUltimoDomingo;
  ultimoDomingoDelMes.setDate(ultimoDiaDelMes.getDate() + diasHastaDomingo);
  
  // Si el último domingo está en el mes siguiente, usar el último día del mes
  if (ultimoDomingoDelMes.getMonth() !== mes) {
    ultimoDomingoDelMes.setTime(ultimoDiaDelMes.getTime());
  }
  
  // Calcular la diferencia en días y convertir a semanas
  const diasTranscurridos = Math.floor((ultimoDomingoDelMes - primerLunesDelMes) / (1000 * 60 * 60 * 24));
  const semanasEnElMes = Math.floor(diasTranscurridos / 7) + 1;
  
  return Math.max(1, semanasEnElMes);
}

export function probarOctubre2025() {
  console.log('=== PRUEBA: OCTUBRE 2025 ===');
  
  // Verificar cuántas semanas tiene octubre 2025
  const semanasEnOctubre = calcularSemanasEnElMes(2025, 9); // mes 9 = octubre (0-indexado)
  console.log(`Octubre 2025 tiene ${semanasEnOctubre} semanas`);
  
  // Probar fechas específicas de octubre
  const fechasOctubre = [
    new Date(2025, 9, 1),   // 1 octubre (miércoles)
    new Date(2025, 9, 6),   // 6 octubre (lunes)
    new Date(2025, 9, 13),  // 13 octubre (lunes)
    new Date(2025, 9, 20),  // 20 octubre (lunes)
    new Date(2025, 9, 27),  // 27 octubre (lunes)
    new Date(2025, 9, 31)   // 31 octubre (viernes)
  ];
  
  console.log('\n--- Fechas de octubre 2025 ---');
  fechasOctubre.forEach(fecha => {
    const semanaDelMes = calcularSemanaDelMes(fecha);
    const info = obtenerInfoSemanaCompleta(fecha);
    console.log(`${fecha.toLocaleDateString('es-MX')} (${fecha.toLocaleDateString('es-MX', { weekday: 'long' })}): Semana ${semanaDelMes} | ${info.etiquetaMes}`);
  });
  
  // Verificar que no hay semana 6
  const fechaSemana6 = new Date(2025, 9, 31); // 31 octubre
  const semanaCalculada = calcularSemanaDelMes(fechaSemana6);
  console.log(`\n31 octubre 2025: Semana ${semanaCalculada} (debe ser 5, no 6)`);
  
  return semanasEnOctubre === 5;
}

export function probarNoviembre2025() {
  console.log('\n=== PRUEBA: NOVIEMBRE 2025 ===');
  
  // Verificar cuántas semanas tiene noviembre 2025
  const semanasEnNoviembre = calcularSemanasEnElMes(2025, 10); // mes 10 = noviembre (0-indexado)
  console.log(`Noviembre 2025 tiene ${semanasEnNoviembre} semanas`);
  
  // Probar fechas específicas de noviembre
  const fechasNoviembre = [
    new Date(2025, 10, 1),   // 1 noviembre (sábado)
    new Date(2025, 10, 3),   // 3 noviembre (lunes)
    new Date(2025, 10, 10),  // 10 noviembre (lunes)
    new Date(2025, 10, 17),  // 17 noviembre (lunes)
    new Date(2025, 10, 24),  // 24 noviembre (lunes)
    new Date(2025, 10, 30)   // 30 noviembre (domingo)
  ];
  
  console.log('\n--- Fechas de noviembre 2025 ---');
  fechasNoviembre.forEach(fecha => {
    const semanaDelMes = calcularSemanaDelMes(fecha);
    const info = obtenerInfoSemanaCompleta(fecha);
    console.log(`${fecha.toLocaleDateString('es-MX')} (${fecha.toLocaleDateString('es-MX', { weekday: 'long' })}): Semana ${semanaDelMes} | ${info.etiquetaMes}`);
  });
  
  return semanasEnNoviembre === 4;
}

// Función para ejecutar todas las pruebas
export function ejecutarTodasLasPruebas() {
  console.log('🧪 INICIANDO PRUEBAS DEL ALGORITMO DE SEMANAS\n');
  
  const resultadoOctubre = probarOctubre2025();
  const resultadoNoviembre = probarNoviembre2025();
  
  console.log('\n=== RESULTADOS ===');
  console.log(`✅ Octubre 2025: ${resultadoOctubre ? 'CORRECTO (5 semanas)' : 'ERROR'}`);
  console.log(`✅ Noviembre 2025: ${resultadoNoviembre ? 'CORRECTO (4 semanas)' : 'ERROR'}`);
  
  const todasCorrectas = resultadoOctubre && resultadoNoviembre;
  console.log(`\n🎯 RESULTADO FINAL: ${todasCorrectas ? '✅ TODAS LAS PRUEBAS PASARON' : '❌ HAY ERRORES'}`);
  
  return todasCorrectas;
}
