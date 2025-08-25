/**
 * Utilidades para formateo de moneda estandarizado
 * Sistema: Peso Mexicano (MXN)
 * Locale: es-MX
 */

/**
 * Formatea un monto en Pesos Mexicanos
 * @param {number|string} amount - Monto a formatear
 * @returns {string} Monto formateado en MXN
 */
export const formatCurrency = (amount) => {
  // Asegurar que el monto sea un número válido
  const numericAmount = parseFloat(amount) || 0;
  
  // Redondear a 2 decimales exactos para evitar problemas de precisión
  const roundedAmount = Math.round(numericAmount * 100) / 100;
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedAmount);
};

/**
 * Formatea un monto para mostrar solo el número sin símbolo de moneda
 * @param {number|string} amount - Monto a formatear
 * @returns {string} Monto formateado sin símbolo
 */
export const formatCurrencyValue = (amount) => {
  const numericAmount = parseFloat(amount) || 0;
  const roundedAmount = Math.round(numericAmount * 100) / 100;
  
  return new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(roundedAmount);
};

/**
 * Convierte un string de moneda a número
 * @param {string} currencyString - String con formato de moneda
 * @returns {number} Valor numérico
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remover símbolos de moneda y espacios
  const cleanString = currencyString
    .replace(/[$\s,]/g, '')
    .replace(/MXN/g, '');
    
  return parseFloat(cleanString) || 0;
};

/**
 * Constantes de moneda para el sistema
 */
export const CURRENCY_CONFIG = {
  code: 'MXN',
  symbol: '$',
  locale: 'es-MX',
  name: 'Peso Mexicano'
};
