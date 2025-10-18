/**
 * Prueba específica para octubre 2025 basada en el calendario visual
 * Verifica que el 18 de octubre esté en la semana 3 y que octubre tenga 5 semanas
 */

import { calcularSemanaDelMes, obtenerInfoSemanaCompleta } from './weekCalculator';

// Función auxiliar para calcular semanas en el mes (copiada del archivo principal)
function calcularSemanasEnElMes(año, mes) {
  const primerDiaDelMes = new Date(año, mes, 1);
  const ultimoDiaDelMes = new Date(año, mes + 1, 0);
  
  // Contar las filas del calendario visual
  const diaPrimerDia = primerDiaDelMes.getDay(); // 0 = domingo, 1 = lunes, etc.
  const diasEnElMes = ultimoDiaDelMes.getDate();
  
  // Calcular el número de filas necesarias
  const diasEnPrimeraFila = 7 - diaPrimerDia; // Días del mes en la primera fila
  const diasRestantes = diasEnElMes - diasEnPrimeraFila;
  const filasAdicionales = Math.ceil(diasRestantes / 7);
  
  const totalFilas = 1 + filasAdicionales;
  
  return totalFilas;
}

export function probarOctubre2025Calendario() {
  console.log('=== PRUEBA: OCTUBRE 2025 BASADO EN CALENDARIO VISUAL ===');
  
  // Verificar cuántas semanas tiene octubre 2025
  const semanasEnOctubre = calcularSemanasEnElMes(2025, 9); // mes 9 = octubre (0-indexado)
  console.log(`Octubre 2025 tiene ${semanasEnOctubre} semanas`);
  
  // Verificar el 18 de octubre (debe estar en semana 3)
  const fecha18Octubre = new Date(2025, 9, 18); // 18 octubre 2025
  const semana18Octubre = calcularSemanaDelMes(fecha18Octubre);
  console.log(`18 octubre 2025: Semana ${semana18Octubre} (debe ser 3)`);
  
  // Probar todas las fechas de octubre según el calendario visual
  const fechasOctubre = [
    // Fila 1: 29, 30 (septiembre) + 1, 2, 3, 4, 5 (octubre)
    new Date(2025, 9, 1),   // 1 octubre - Semana 1
    new Date(2025, 9, 2),   // 2 octubre - Semana 1
    new Date(2025, 9, 3),   // 3 octubre - Semana 1
    new Date(2025, 9, 4),   // 4 octubre - Semana 1
    new Date(2025, 9, 5),   // 5 octubre - Semana 1
    
    // Fila 2: 6, 7, 8, 9, 10, 11, 12 (octubre)
    new Date(2025, 9, 6),   // 6 octubre - Semana 2
    new Date(2025, 9, 7),   // 7 octubre - Semana 2
    new Date(2025, 9, 8),   // 8 octubre - Semana 2
    new Date(2025, 9, 9),   // 9 octubre - Semana 2
    new Date(2025, 9, 10),  // 10 octubre - Semana 2
    new Date(2025, 9, 11),  // 11 octubre - Semana 2
    new Date(2025, 9, 12),  // 12 octubre - Semana 2
    
    // Fila 3: 13, 14, 15, 16, 17, 18, 19 (octubre)
    new Date(2025, 9, 13),  // 13 octubre - Semana 3
    new Date(2025, 9, 14),  // 14 octubre - Semana 3
    new Date(2025, 9, 15),  // 15 octubre - Semana 3
    new Date(2025, 9, 16),  // 16 octubre - Semana 3
    new Date(2025, 9, 17),  // 17 octubre - Semana 3
    new Date(2025, 9, 18),  // 18 octubre - Semana 3 ⭐
    new Date(2025, 9, 19),  // 19 octubre - Semana 3
    
    // Fila 4: 20, 21, 22, 23, 24, 25, 26 (octubre)
    new Date(2025, 9, 20),  // 20 octubre - Semana 4
    new Date(2025, 9, 21),  // 21 octubre - Semana 4
    new Date(2025, 9, 22),  // 22 octubre - Semana 4
    new Date(2025, 9, 23),  // 23 octubre - Semana 4
    new Date(2025, 9, 24),  // 24 octubre - Semana 4
    new Date(2025, 9, 25),  // 25 octubre - Semana 4
    new Date(2025, 9, 26),  // 26 octubre - Semana 4
    
    // Fila 5: 27, 28, 29, 30, 31 (octubre) + 1, 2 (noviembre)
    new Date(2025, 9, 27),  // 27 octubre - Semana 5
    new Date(2025, 9, 28),  // 28 octubre - Semana 5
    new Date(2025, 9, 29),  // 29 octubre - Semana 5
    new Date(2025, 9, 30),  // 30 octubre - Semana 5
    new Date(2025, 9, 31)   // 31 octubre - Semana 5
  ];
  
  console.log('\n--- Verificación de todas las fechas de octubre 2025 ---');
  let errores = 0;
  
  fechasOctubre.forEach((fecha, index) => {
    const semanaCalculada = calcularSemanaDelMes(fecha);
    const dia = fecha.getDate();
    const diaSemana = fecha.toLocaleDateString('es-MX', { weekday: 'short' });
    
    // Determinar la semana esperada basada en el calendario visual
    let semanaEsperada;
    if (dia <= 5) {
      semanaEsperada = 1; // Fila 1
    } else if (dia <= 12) {
      semanaEsperada = 2; // Fila 2
    } else if (dia <= 19) {
      semanaEsperada = 3; // Fila 3
    } else if (dia <= 26) {
      semanaEsperada = 4; // Fila 4
    } else {
      semanaEsperada = 5; // Fila 5
    }
    
    const esCorrecto = semanaCalculada === semanaEsperada;
    const icono = esCorrecto ? '✅' : '❌';
    
    if (!esCorrecto) {
      errores++;
    }
    
    console.log(`${icono} ${dia} oct (${diaSemana}): Semana ${semanaCalculada} (esperada: ${semanaEsperada})`);
  });
  
  console.log(`\n=== RESULTADOS ===`);
  console.log(`✅ Octubre 2025 tiene ${semanasEnOctubre} semanas (esperado: 5)`);
  console.log(`✅ 18 octubre está en semana ${semana18Octubre} (esperado: 3)`);
  console.log(`✅ Errores en fechas: ${errores} de ${fechasOctubre.length}`);
  
  const todasCorrectas = semanasEnOctubre === 5 && semana18Octubre === 3 && errores === 0;
  console.log(`\n🎯 RESULTADO FINAL: ${todasCorrectas ? '✅ ALGORITMO CORRECTO' : '❌ HAY ERRORES'}`);
  
  return todasCorrectas;
}
