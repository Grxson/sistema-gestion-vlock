/**
 * Utilidades para formateo de fechas
 */

/**
 * Formatea una fecha para mostrar al usuario
 * @param {string|Date} date - Fecha a formatear
 * @param {object} options - Opciones de formateo
 * @returns {string} - Fecha formateada
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options
  };
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('es-MX', defaultOptions);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return '';
  }
};

/**
 * Formatea una fecha y hora para mostrar al usuario
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha y hora formateadas
 */
export const formatDateTime = (date) => {
  return formatDate(date, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Convierte una fecha a formato ISO para inputs
 * @param {string|Date} date - Fecha a convertir
 * @returns {string} - Fecha en formato YYYY-MM-DD
 */
export const dateToInputValue = (date) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error al convertir fecha:', error);
    return '';
  }
};

/**
 * Calcula la diferencia en días entre dos fechas
 * @param {string|Date} startDate - Fecha inicial
 * @param {string|Date} endDate - Fecha final
 * @returns {number} - Diferencia en días
 */
export const daysBetween = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
    
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch (error) {
    console.error('Error al calcular diferencia de días:', error);
    return 0;
  }
};
