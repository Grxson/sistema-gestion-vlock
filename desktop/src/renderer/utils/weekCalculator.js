/**
 * Utilidades para el cálculo dinámico de semanas
 */

/**
 * Calcula cuántas semanas tiene un mes basado en el calendario visual
 * @param {number} año - Año
 * @param {number} mes - Mes (0-11)
 * @returns {number} Número de semanas en el mes
 */
function calcularSemanasEnElMes(año, mes) {
  const primerDiaDelMes = new Date(año, mes, 1);
  const ultimoDiaDelMes = new Date(año, mes + 1, 0);
  
  // Contar las filas del calendario visual
  // Cada fila representa una semana, incluso si tiene días del mes anterior/siguiente
  
  // Calcular cuántas filas necesita el calendario
  const diaPrimerDia = primerDiaDelMes.getDay(); // 0 = domingo, 1 = lunes, etc.
  const diasEnElMes = ultimoDiaDelMes.getDate();
  
  // Calcular el número de filas necesarias
  // Primera fila: días del mes anterior + días del mes actual
  const diasEnPrimeraFila = 7 - diaPrimerDia; // Días del mes en la primera fila
  const diasRestantes = diasEnElMes - diasEnPrimeraFila;
  const filasAdicionales = Math.ceil(diasRestantes / 7);
  
  const totalFilas = 1 + filasAdicionales;
  
  return totalFilas;
}

/**
 * Calcula el número de semana del mes para una fecha dada basado en el calendario visual
 * @param {Date} fecha - Fecha para calcular la semana
 * @returns {number} Número de semana del mes (1-6)
 */
export function calcularSemanaDelMes(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  const año = fechaTemp.getFullYear();
  const mes = fechaTemp.getMonth();
  const dia = fechaTemp.getDate();
  
  // Obtener el primer día del mes
  const primerDiaDelMes = new Date(año, mes, 1);
  const diaPrimerDia = primerDiaDelMes.getDay(); // 0 = domingo, 1 = lunes, etc.
  
  // Calcular en qué fila del calendario está la fecha
  // Primera fila: días del mes anterior + días del mes actual
  const diasEnPrimeraFila = 7 - diaPrimerDia; // Días del mes en la primera fila
  
  if (dia <= diasEnPrimeraFila) {
    // La fecha está en la primera fila
    return 1;
  } else {
    // La fecha está en una fila posterior
    const diasRestantes = dia - diasEnPrimeraFila;
    const semanaDelMes = 1 + Math.ceil(diasRestantes / 7);
    
    // Obtener el número real de semanas en el mes
    const semanasEnElMes = calcularSemanasEnElMes(año, mes);
    
    // Limitar al número real de semanas del mes
    return Math.max(1, Math.min(semanaDelMes, semanasEnElMes));
  }
}

/**
 * Calcula la semana ISO para una fecha dada (estándar ISO 8601)
 * @param {Date} fecha - Fecha para calcular la semana ISO
 * @returns {number} Número de semana ISO (1-53)
 */
export function calcularSemanaISO(fecha) {
  // Crear una copia de la fecha para no modificar la original
  const fechaTemp = new Date(fecha.getTime());
  
  // Ajustar al lunes de la semana (ISO 8601: lunes = día 1)
  const dia = fechaTemp.getDay();
  const diff = fechaTemp.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(fechaTemp.setDate(diff));
  
  // Obtener el año de la semana (puede ser diferente al año de la fecha)
  const añoSemana = lunes.getFullYear();
  
  // Calcular el primer lunes del año
  const primerEnero = new Date(añoSemana, 0, 1);
  const diaPrimerEnero = primerEnero.getDay();
  const diasHastaPrimerLunes = diaPrimerEnero === 0 ? 1 : 8 - diaPrimerEnero;
  const primerLunesAño = new Date(añoSemana, 0, diasHastaPrimerLunes);
  
  // Si el primer lunes está en el año anterior, ajustar
  if (primerLunesAño.getFullYear() < añoSemana) {
    primerLunesAño.setFullYear(añoSemana - 1);
    primerLunesAño.setMonth(11, 31 - (7 - diasHastaPrimerLunes));
  }
  
  // Calcular la diferencia en días y convertir a semanas
  const diasTranscurridos = Math.floor((lunes - primerLunesAño) / (1000 * 60 * 60 * 24));
  const semanaISO = Math.floor(diasTranscurridos / 7) + 1;
  
  // Asegurar que esté en el rango correcto (1-53)
  return Math.max(1, Math.min(53, semanaISO));
}

/**
 * Genera información de semana ISO para una fecha dada
 * @param {Date} fecha - Fecha para generar la información de semana
 * @returns {Object} Información de la semana ISO
 */
export function generarInfoSemana(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  
  // Calcular semana ISO
  const semanaISO = calcularSemanaISO(fechaTemp);
  
  // Ajustar al lunes de la semana
  const dia = fechaTemp.getDay();
  const diff = fechaTemp.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(fechaTemp.setDate(diff));
  
  // Calcular fin de la semana (domingo)
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  
  // Obtener año de la semana (puede ser diferente al año de la fecha)
  const añoSemana = lunes.getFullYear();
  
  // Generar etiqueta más descriptiva
  const mesInicio = lunes.toLocaleDateString('es-MX', { month: 'long' });
  const mesFin = domingo.toLocaleDateString('es-MX', { month: 'long' });
  
  let etiqueta;
  if (lunes.getMonth() === domingo.getMonth()) {
    etiqueta = `Semana ${semanaISO} - ${mesInicio} ${añoSemana}`;
  } else {
    etiqueta = `Semana ${semanaISO} - ${mesInicio}/${mesFin} ${añoSemana}`;
  }
  
  return {
    año: añoSemana,
    semanaISO,
    etiqueta,
    fechaInicio: lunes,
    fechaFin: domingo,
    periodo: `${añoSemana}-${String(lunes.getMonth() + 1).padStart(2, '0')}`
  };
}

/**
 * Detecta automáticamente la semana del mes actual
 * @returns {number} Número de semana del mes (1-6)
 */
export function detectarSemanaActual() {
  const hoy = new Date();
  return calcularSemanaDelMes(hoy);
}

/**
 * Obtiene información completa de semana (mes + ISO)
 * @param {Date} fecha - Fecha para calcular
 * @returns {Object} Información completa de la semana
 */
export function obtenerInfoSemanaCompleta(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  
  // Calcular ambos tipos de semana
  const semanaDelMes = calcularSemanaDelMes(fechaTemp);
  const semanaISO = calcularSemanaISO(fechaTemp);
  
  // Obtener información del mes
  const año = fechaTemp.getFullYear();
  const mes = fechaTemp.getMonth();
  const nombreMes = fechaTemp.toLocaleDateString('es-MX', { month: 'long' });
  
  // Calcular fechas de inicio y fin de la semana del mes
  const primerDiaDelMes = new Date(año, mes, 1);
  const diaDeLaSemana = primerDiaDelMes.getDay();
  const diasHastaLunes = diaDeLaSemana === 0 ? 1 : 8 - diaDeLaSemana;
  const primerLunesDelMes = new Date(primerDiaDelMes);
  primerLunesDelMes.setDate(primerDiaDelMes.getDate() + diasHastaLunes);
  
  if (primerLunesDelMes.getMonth() !== mes) {
    primerLunesDelMes.setTime(primerDiaDelMes.getTime());
  }
  
  // Calcular inicio de la semana solicitada
  const inicioSemana = new Date(primerLunesDelMes);
  inicioSemana.setDate(primerLunesDelMes.getDate() + (semanaDelMes - 1) * 7);
  
  // Calcular fin de la semana (domingo)
  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 6);
  
  // Generar etiquetas
  const etiquetaMes = `Semana ${semanaDelMes} - ${nombreMes} ${año}`;
  const etiquetaISO = `Semana ISO ${semanaISO} - ${año}`;
  
  return {
    // Información del mes
    año,
    mes: mes + 1, // Convertir a 1-12
    nombreMes,
    semanaDelMes,
    etiquetaMes,
    
    // Información ISO
    semanaISO,
    etiquetaISO,
    
    // Fechas
    fechaInicio: inicioSemana,
    fechaFin: finSemana,
    periodo: `${año}-${String(mes + 1).padStart(2, '0')}`,
    
    // Información adicional
    fechaOriginal: fechaTemp
  };
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
 * Valida si un número de semana del mes es válido para un período específico
 * @param {number} semanaDelMes - Número de semana del mes
 * @param {string} periodo - Período en formato YYYY-MM
 * @returns {boolean} True si es válido
 */
export function validarSemana(semanaDelMes, periodo) {
  if (!semanaDelMes) return false;
  if (semanaDelMes < 1) return false;
  
  // Si se proporciona un período, validar contra el número real de semanas
  if (periodo) {
    const [año, mes] = periodo.split('-').map(Number);
    const semanasEnElMes = calcularSemanasEnElMes(año, mes - 1); // mes - 1 porque es 0-indexado
    if (semanaDelMes > semanasEnElMes) return false;
  } else {
    // Sin período, permitir hasta 6 semanas (caso general)
    if (semanaDelMes > 6) return false;
  }
  
  return true;
}
