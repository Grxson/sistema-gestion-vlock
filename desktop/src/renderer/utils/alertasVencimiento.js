/**
 * Utilidades para calcular alertas de vencimiento de adeudos (frontend)
 */

/**
 * Calcula los días restantes hasta el vencimiento
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @returns {number|null} Días restantes (negativo si ya venció)
 */
export const calcularDiasRestantes = (fechaVencimiento) => {
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
 * @param {string|Date} fechaVencimiento - Fecha de vencimiento del adeudo
 * @param {string} estado - Estado del adeudo
 * @returns {string|null} Nivel de urgencia: 'vencido', 'critico', 'alto', 'medio', 'bajo', null
 */
export const obtenerNivelUrgencia = (fechaVencimiento, estado) => {
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
export const obtenerMensajeAlerta = (diasRestantes) => {
  if (diasRestantes === null) return '';
  if (diasRestantes < 0) return `Venció hace ${Math.abs(diasRestantes)} día(s)`;
  if (diasRestantes === 0) return 'Vence hoy';
  if (diasRestantes === 1) return 'Vence mañana';
  return `Vence en ${diasRestantes} días`;
};

/**
 * Obtiene los colores según el nivel de urgencia
 * @param {string} nivel - Nivel de urgencia
 * @returns {object} Objeto con clases de Tailwind para badge y border
 */
export const obtenerColoresUrgencia = (nivel) => {
  switch (nivel) {
    case 'vencido':
      return {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border border-red-300 dark:border-red-700',
        border: 'border-l-4 border-l-red-500',
        icon: '🚨'
      };
    case 'critico':
      return {
        badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        border: 'border-l-4 border-l-red-500',
        icon: '⚠️'
      };
    case 'alto':
      return {
        badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        border: 'border-l-4 border-l-orange-500',
        icon: '⏰'
      };
    case 'medio':
      return {
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        border: 'border-l-4 border-l-yellow-500',
        icon: '⏳'
      };
    case 'bajo':
      return {
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        border: 'border-l-4 border-l-blue-500',
        icon: '📅'
      };
    default:
      return {
        badge: '',
        border: '',
        icon: ''
      };
  }
};

/**
 * Formatea una fecha para mostrar
 * @param {string|Date} fecha - Fecha a formatear
 * @returns {string} Fecha formateada
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
