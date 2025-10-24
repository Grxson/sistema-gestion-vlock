/**
 * Utilidades para el cálculo de semanas ISO en el backend
 */

/**
 * Calcula la semana ISO para una fecha dada (estándar ISO 8601)
 * Algoritmo corregido según ISO 8601
 * @param {Date} fecha - Fecha para calcular la semana ISO
 * @returns {number} Número de semana ISO (1-53)
 */
function calcularSemanaISO(fecha) {
  // Crear una copia de la fecha para no modificar la original
  const fechaTemp = new Date(fecha.getTime());
  
  // Establecer a las 12:00 para evitar problemas con cambios de horario
  fechaTemp.setHours(12, 0, 0, 0);
  
  // Encontrar el jueves de esta semana (ISO 8601 define la semana por su jueves)
  const dia = fechaTemp.getDay();
  const jueves = new Date(fechaTemp);
  jueves.setDate(fechaTemp.getDate() - dia + (dia === 0 ? -3 : 4));
  
  // Obtener el año del jueves (este es el año ISO de la semana)
  const añoISO = jueves.getFullYear();
  
  // Encontrar el primer jueves del año ISO
  const primerEnero = new Date(añoISO, 0, 1);
  const diaPrimerEnero = primerEnero.getDay();
  
  // Calcular días hasta el primer jueves
  const diasHastaPrimerJueves = (11 - diaPrimerEnero) % 7;
  const primerJueves = new Date(añoISO, 0, 1 + diasHastaPrimerJueves);
  
  // Calcular la diferencia en semanas
  const diferenciaMilisegundos = jueves - primerJueves;
  const diferenciaDias = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60 * 24));
  const semanaISO = Math.floor(diferenciaDias / 7) + 1;
  
  return semanaISO;
}

/**
 * Genera información de semana ISO para una fecha dada
 * @param {Date} fecha - Fecha para generar la información de semana
 * @returns {Object} Información de la semana ISO
 */
function generarInfoSemana(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  
  // Calcular semana ISO
  const semanaISO = calcularSemanaISO(fechaTemp);
  
  // Encontrar el lunes de la semana ISO (lunes a domingo)
  const dia = fechaTemp.getDay();
  const diff = fechaTemp.getDate() - dia + (dia === 0 ? -6 : 1);
  const lunes = new Date(fechaTemp.getFullYear(), fechaTemp.getMonth(), diff);
  
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
    etiqueta = `Semana ISO ${semanaISO} - ${mesInicio} ${añoSemana}`;
  } else {
    etiqueta = `Semana ISO ${semanaISO} - ${mesInicio}/${mesFin} ${añoSemana}`;
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
 * Detecta automáticamente la semana ISO actual
 * @returns {number} Número de semana ISO (1-53)
 */
function detectarSemanaActual() {
  const hoy = new Date();
  return calcularSemanaISO(hoy);
}

/**
 * Valida si un número de semana ISO es válido
 * @param {number} semanaISO - Número de semana ISO
 * @returns {boolean} True si es válido
 */
function validarSemana(semanaISO) {
  if (!semanaISO) return false;
  if (semanaISO < 1 || semanaISO > 53) return false;
  
  return true;
}

module.exports = {
  calcularSemanaISO,
  generarInfoSemana,
  detectarSemanaActual,
  validarSemana
};
