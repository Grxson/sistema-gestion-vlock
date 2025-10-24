/**
 * Utilidades para calcular alertas de vencimiento de adeudos
 */

/**
 * Calcula la fecha de inicio de alertas considerando fines de semana
 * Si el vencimiento cae en fin de semana o lunes, recorre el inicio hasta el miércoles anterior
 * @param {Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @param {number} diasAnticipacion - Días de anticipación mínimos (default: 3)
 * @returns {Date} Fecha de inicio de alertas
 */
const calcularFechaInicioAlertas = (fechaVencimiento, diasAnticipacion = 3) => {
  if (!fechaVencimiento) return null;

  const vencimiento = new Date(fechaVencimiento);
  const diaSemana = vencimiento.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado

  let diasARestar = diasAnticipacion;

  // Si vence en fin de semana o lunes, ajustar días
  if (diaSemana === 0) {
    // Domingo: restar 4 días adicionales (llegar al miércoles)
    diasARestar += 4;
  } else if (diaSemana === 6) {
    // Sábado: restar 3 días adicionales (llegar al miércoles)
    diasARestar += 3;
  } else if (diaSemana === 1) {
    // Lunes: restar 5 días adicionales (llegar al miércoles anterior)
    diasARestar += 5;
  }

  const fechaInicio = new Date(vencimiento);
  fechaInicio.setDate(fechaInicio.getDate() - diasARestar);
  
  return fechaInicio;
};

/**
 * Verifica si un adeudo debe mostrar alerta hoy
 * @param {Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @param {string} estado - Estado del adeudo (pendiente, parcial, pagado)
 * @returns {boolean} True si debe mostrar alerta
 */
const debeAlertarHoy = (fechaVencimiento, estado) => {
  // No alertar si está pagado o no tiene fecha de vencimiento
  if (!fechaVencimiento || estado === 'pagado') {
    return false;
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  // No alertar si ya venció
  if (vencimiento < hoy) {
    return false;
  }

  const fechaInicio = calcularFechaInicioAlertas(vencimiento);
  fechaInicio.setHours(0, 0, 0, 0);

  // Alertar si hoy está entre la fecha de inicio y el vencimiento
  return hoy >= fechaInicio && hoy <= vencimiento;
};

/**
 * Calcula los días restantes hasta el vencimiento
 * @param {Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @returns {number} Días restantes (negativo si ya venció)
 */
const calcularDiasRestantes = (fechaVencimiento) => {
  if (!fechaVencimiento) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const vencimiento = new Date(fechaVencimiento);
  vencimiento.setHours(0, 0, 0, 0);

  const diferencia = vencimiento - hoy;
  return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
};

/**
 * Obtiene el nivel de urgencia de un adeudo
 * @param {Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @param {string} estado - Estado del adeudo
 * @returns {string} Nivel de urgencia: 'critico', 'alto', 'medio', 'bajo', null
 */
const obtenerNivelUrgencia = (fechaVencimiento, estado) => {
  if (!fechaVencimiento || estado === 'pagado') {
    return null;
  }

  const diasRestantes = calcularDiasRestantes(fechaVencimiento);

  if (diasRestantes === null) return null;
  if (diasRestantes < 0) return 'vencido';
  if (diasRestantes === 0) return 'critico'; // Vence hoy
  if (diasRestantes <= 2) return 'alto'; // 1-2 días
  if (diasRestantes <= 5) return 'medio'; // 3-5 días
  if (diasRestantes <= 7) return 'bajo'; // 6-7 días

  return null;
};

/**
 * Obtiene el mensaje de alerta según los días restantes
 * @param {number} diasRestantes - Días restantes hasta el vencimiento
 * @returns {string} Mensaje de alerta
 */
const obtenerMensajeAlerta = (diasRestantes) => {
  if (diasRestantes === null) return '';
  if (diasRestantes < 0) return `Venció hace ${Math.abs(diasRestantes)} día(s)`;
  if (diasRestantes === 0) return 'Vence hoy';
  if (diasRestantes === 1) return 'Vence mañana';
  return `Vence en ${diasRestantes} días`;
};

module.exports = {
  calcularFechaInicioAlertas,
  debeAlertarHoy,
  calcularDiasRestantes,
  obtenerNivelUrgencia,
  obtenerMensajeAlerta
};
