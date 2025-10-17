/**
 * Utilidades para el cálculo dinámico de semanas
 */

/**
 * Calcula el número de semana del mes para una fecha dada
 * @param {Date} fecha - Fecha para calcular la semana
 * @returns {number} Número de semana del mes (1-4)
 */
export function calcularSemanaDelMes(fecha) {
  const primerDiaDelMes = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
  const primerLunesDelMes = new Date(primerDiaDelMes);
  
  // Ajustar al primer lunes del mes
  const diaDeLaSemana = primerDiaDelMes.getDay();
  const diasHastaLunes = diaDeLaSemana === 0 ? 1 : 8 - diaDeLaSemana;
  primerLunesDelMes.setDate(primerDiaDelMes.getDate() + diasHastaLunes);
  
  // Si el primer lunes está en el mes anterior, usar el primer día del mes
  if (primerLunesDelMes.getMonth() !== fecha.getMonth()) {
    primerLunesDelMes.setTime(primerDiaDelMes.getTime());
  }
  
  const diasTranscurridos = Math.floor((fecha - primerLunesDelMes) / (1000 * 60 * 60 * 24));
  const semanaDelMes = Math.floor(diasTranscurridos / 7) + 1;
  
  // Limitar entre 1 y 4
  return Math.max(1, Math.min(4, semanaDelMes));
}

/**
 * Calcula la semana ISO para una fecha dada
 * @param {Date} fecha - Fecha para calcular la semana ISO
 * @returns {number} Número de semana ISO
 */
export function calcularSemanaISO(fecha) {
  const fechaTemp = new Date(fecha);
  const dia = fechaTemp.getDay();
  const diff = fechaTemp.getDate() - dia + (dia === 0 ? -6 : 1); // Ajustar al lunes
  const lunes = new Date(fechaTemp.setDate(diff));
  
  const año = lunes.getFullYear();
  const primerEnero = new Date(año, 0, 1);
  const diasTranscurridos = Math.floor((lunes - primerEnero) / (1000 * 60 * 60 * 24));
  const semanaISO = Math.ceil((diasTranscurridos + primerEnero.getDay() + 1) / 7);
  
  return semanaISO;
}

/**
 * Genera información de semana para un período y número de semana
 * @param {string} periodo - Período en formato YYYY-MM
 * @param {number} semanaNum - Número de semana del mes (1-4)
 * @returns {Object} Información de la semana
 */
export function generarInfoSemana(periodo, semanaNum) {
  const [año, mes] = periodo.split('-').map(Number);
  const mesIndex = mes - 1; // Los meses en JavaScript son 0-indexados
  
  // Calcular fechas de inicio y fin de la semana
  const primerDiaDelMes = new Date(año, mesIndex, 1);
  const primerLunesDelMes = new Date(primerDiaDelMes);
  
  // Ajustar al primer lunes del mes
  const diaDeLaSemana = primerDiaDelMes.getDay();
  const diasHastaLunes = diaDeLaSemana === 0 ? 1 : 8 - diaDeLaSemana;
  primerLunesDelMes.setDate(primerDiaDelMes.getDate() + diasHastaLunes);
  
  // Si el primer lunes está en el mes anterior, usar el primer día del mes
  if (primerLunesDelMes.getMonth() !== mesIndex) {
    primerLunesDelMes.setTime(primerDiaDelMes.getTime());
  }
  
  // Calcular inicio de la semana solicitada
  const inicioSemana = new Date(primerLunesDelMes);
  inicioSemana.setDate(primerLunesDelMes.getDate() + (semanaNum - 1) * 7);
  
  // Calcular fin de la semana (domingo)
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  
  // Calcular semana ISO
  const semanaISO = calcularSemanaISO(inicioSemana);
  
  // Generar etiqueta
  const nombreMes = inicioSemana.toLocaleDateString('es-MX', { month: 'long' });
  const etiqueta = `Semana ${semanaNum} - ${nombreMes} ${año}`;
  
  return {
    año,
    mes,
    semanaNum,
    semanaISO,
    etiqueta,
    fechaInicio: inicioSemana,
    fechaFin: finSemana,
    periodo
  };
}

/**
 * Detecta automáticamente la semana actual del mes
 * @returns {number} Número de semana del mes (1-4)
 */
export function detectarSemanaActual() {
  const hoy = new Date();
  return calcularSemanaDelMes(hoy);
}

/**
 * Genera el período actual en formato YYYY-MM
 * @returns {string} Período actual
 */
export function generarPeriodoActual() {
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = hoy.getMonth() + 1;
  return `${año}-${String(mes).padStart(2, '0')}`;
}

/**
 * Valida si un número de semana es válido para un período
 * @param {string} periodo - Período en formato YYYY-MM
 * @param {number} semanaNum - Número de semana del mes
 * @returns {boolean} True si es válido
 */
export function validarSemana(periodo, semanaNum) {
  if (!periodo || !semanaNum) return false;
  if (semanaNum < 1 || semanaNum > 4) return false;
  
  const [año, mes] = periodo.split('-').map(Number);
  if (año < 2020 || año > 2030) return false;
  if (mes < 1 || mes > 12) return false;
  
  return true;
}
