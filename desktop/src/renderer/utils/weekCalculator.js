/**
 * Utilidades para el cálculo dinámico de semanas
 */

/**
 * (LEGACY) Calcula cuántas "filas de calendario" tiene un mes.
 * Ya no se usa para lógica de nómina; se mantiene solo por compatibilidad.
 */
function calcularSemanasEnElMes(año, mes) {
  const primerDiaDelMes = new Date(año, mes, 1);
  const ultimoDiaDelMes = new Date(año, mes + 1, 0);
  const diaPrimerDia = primerDiaDelMes.getDay();
  const diasEnElMes = ultimoDiaDelMes.getDate();
  const diasEnPrimeraFila = 7 - diaPrimerDia;
  const diasRestantes = diasEnElMes - diasEnPrimeraFila;
  const filasAdicionales = Math.ceil(diasRestantes / 7);
  return 1 + filasAdicionales;
}

/**
 * Calcula el número de semana del mes para una fecha dada basado en el calendario visual
 * @param {Date} fecha - Fecha para calcular la semana
 * @returns {number} Número de semana del mes (1-6)
 */
export function calcularSemanaDelMes(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  fechaTemp.setHours(12, 0, 0, 0);
  const info = generarInfoSemana(fechaTemp);
  // Periodo del MES por mayoría de días (semana cuenta al mes que contiene >=4 días)
  const majority = getMajorityMonth(info);
  const periodo = `${majority.year}-${String(majority.month0 + 1).padStart(2, '0')}`;
  const idx = semanaDelMesDesdeISO(periodo, info.año, info.semanaISO);
  return idx;
}

/**
 * Calcula la semana ISO para una fecha dada (estándar ISO 8601)
 * Algoritmo corregido según ISO 8601
 * @param {Date} fecha - Fecha para calcular la semana ISO
 * @returns {number} Número de semana ISO (1-53)
 */
export function calcularSemanaISO(fechaInicio) {
  // Crear una copia de la fecha para no modificar la original
  const fechaTemp = new Date(fechaInicio.getTime());
  
  // Establecer a las 12:00 para evitar problemas con cambios de horario
  fechaTemp.setHours(12, 0, 0, 0);
  
  // Encontrar el jueves de esta semana (ISO 8601 define la semana por su jueves)
  // En ISO 8601, la semana va de lunes a domingo
  // El domingo pertenece a la semana que termina ese día
  const dia = fechaTemp.getDay();
  const jueves = new Date(fechaTemp);
  
  // Calcular días hasta el jueves de la semana ISO
  // Domingo (0) -> jueves está 3 días atrás (jueves de la semana que termina el domingo)
  // Lunes (1) -> jueves está 3 días adelante
  // Martes (2) -> jueves está 2 días adelante
  // Miércoles (3) -> jueves está 1 día adelante
  // Jueves (4) -> es el mismo día (0 días)
  // Viernes (5) -> jueves está 1 día atrás
  // Sábado (6) -> jueves está 2 días atrás
  const diasHastaJueves = dia === 0 ? -3 : (4 - dia);
  jueves.setDate(fechaTemp.getDate() + diasHastaJueves);
  
  // Obtener el año del jueves (este es el año ISO de la semana)
  const añoISO = jueves.getFullYear();
  
  // Encontrar el primer jueves del año ISO
  const primerEnero = new Date(añoISO, 0, 1);
  const diaPrimerEnero = primerEnero.getDay();
  
  // Calcular días hasta el primer jueves
  // Si el 1 de enero es jueves (4), días = 0
  // Si es viernes (5), días = 6 (jueves anterior)
  // Si es sábado (6), días = 5
  // Si es domingo (0), días = 4
  // Si es lunes (1), días = 3
  // Si es martes (2), días = 2
  // Si es miércoles (3), días = 1
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
export function generarInfoSemana(fecha) {
  const fechaTemp = new Date(fecha.getTime());
  fechaTemp.setHours(12, 0, 0, 0);
  
  // Calcular semana ISO
  const semanaISO = calcularSemanaISO(fechaTemp);
  
  // Encontrar el jueves de esta semana para determinar el año ISO correcto
  const dia = fechaTemp.getDay();
  const diasHastaJueves = dia === 0 ? -3 : (4 - dia);
  const jueves = new Date(fechaTemp);
  jueves.setDate(fechaTemp.getDate() + diasHastaJueves);
  
  // El año ISO es el año del jueves de la semana (estándar ISO 8601)
  const añoISO = jueves.getFullYear();
  
  // Encontrar el lunes de la semana ISO (lunes a domingo)
  const diasHastaLunes = dia === 0 ? -6 : (1 - dia);
  const lunes = new Date(fechaTemp);
  lunes.setDate(fechaTemp.getDate() + diasHastaLunes);
  lunes.setHours(0, 0, 0, 0);
  
  // Calcular fin de la semana (domingo)
  const domingo = new Date(lunes);
  domingo.setDate(lunes.getDate() + 6);
  domingo.setHours(23, 59, 59, 999);
  
  // Generar etiqueta más descriptiva
  const mesInicio = lunes.toLocaleDateString('es-MX', { month: 'long' });
  const mesFin = domingo.toLocaleDateString('es-MX', { month: 'long' });
  
  let etiqueta;
  if (lunes.getMonth() === domingo.getMonth()) {
    etiqueta = `Semana ${semanaISO} - ${mesInicio} ${añoISO}`;
  } else {
    etiqueta = `Semana ${semanaISO} - ${mesInicio}/${mesFin} ${añoISO}`;
  }
  
  return {
    año: añoISO,
    semanaISO,
    etiqueta,
    fechaInicio: lunes,
    fechaFin: domingo,
    periodo: `${añoISO}-${String(lunes.getMonth() + 1).padStart(2, '0')}`
  };
}

// Determina el mes (0-11) por mayoría de días dentro de una semana ISO
function getMajorityMonth(infoSemana) {
  const start = new Date(infoSemana.fechaInicio);
  const counts = new Map(); // key `${year}-${month0}` -> count
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  let bestKey = null; let bestCount = -1;
  counts.forEach((cnt, key) => { if (cnt > bestCount) { bestCount = cnt; bestKey = key; } });
  if (!bestKey) return { year: start.getFullYear(), month0: start.getMonth() };
  const [yy, mm] = bestKey.split('-').map(Number);
  return { year: yy, month0: mm };
}

/**
 * Lista las semanas ISO que tocan un período (YYYY-MM), en orden.
 * @param {string} periodo - Formato YYYY-MM
 * @returns {Array<{anio:number, semana_iso:number}>}
 */
export function listarSemanasISODePeriodo(periodo) {
  const [yy, mm] = periodo.split('-');
  const year = parseInt(yy, 10);
  const month = parseInt(mm, 10) - 1;
  const first = new Date(year, month, 1, 12, 0, 0, 0);
  const last = new Date(year, month + 1, 0, 12, 0, 0, 0);
  // Calcular el lunes de la semana que contiene el primer día del mes
  const day = first.getDay();
  const diasHastaLunes = day === 0 ? -6 : (1 - day);
  const cursor = new Date(first);
  cursor.setDate(first.getDate() + diasHastaLunes);
  // Iterar de lunes a lunes hasta pasar una semana después del fin de mes
  const end = new Date(last);
  end.setDate(last.getDate() + 7);
  const seen = new Set();
  const list = [];
  for (let d = new Date(cursor); d <= end; d.setDate(d.getDate() + 7)) {
    const info = generarInfoSemana(d); // d es lunes ISO
    const key = `${info.año}-${info.semanaISO}`;
    const maj = getMajorityMonth(info);
    if (maj.month0 === month && !seen.has(key)) {
      seen.add(key);
      list.push({ anio: info.año, semana_iso: info.semanaISO });
    }
  }
  return list;
}

/**
 * Dado un período (YYYY-MM) y una semana ISO (anioISO, semanaISO),
 * retorna el índice 1-based de esa semana dentro del mes.
 * @returns {number} 1..N o NaN si no pertenece
 */
export function semanaDelMesDesdeISO(periodo, anioISO, semanaISO) {
  const weeks = listarSemanasISODePeriodo(periodo);
  const idx = weeks.findIndex(w => w.anio === anioISO && w.semana_iso === semanaISO);
  return idx >= 0 ? (idx + 1) : NaN;
}

/**
 * Detecta automáticamente la semana del mes actual
 * @returns {number} Número de semana del mes (1-6)
 */
export function detectarSemanaActual() {
  const hoy = new Date();
  const info = generarInfoSemana(hoy);
  const maj = getMajorityMonth(info);
  const periodo = `${maj.year}-${String(maj.month0 + 1).padStart(2, '0')}`;
  return semanaDelMesDesdeISO(periodo, info.año, info.semanaISO);
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
  const info = generarInfoSemana(hoy);
  const maj = getMajorityMonth(info);
  const año = maj.year;
  const mes = maj.month0 + 1;
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
  
  // Si se proporciona un período, validar contra el número real de semanas ISO que tocan el mes
  if (periodo) {
    const total = listarSemanasISODePeriodo(periodo).length;
    if (semanaDelMes > total) return false;
  } else {
    // Sin período, permitir hasta 6 como salvaguarda general
    if (semanaDelMes > 6) return false;
  }
  
  return true;
}
