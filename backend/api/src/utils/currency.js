/**
 * Utilidades para formateo de moneda en el backend
 * Sistema: Peso Mexicano (MXN)
 * Locale: es-MX
 */

/**
 * Formatea un monto en Pesos Mexicanos
 * @param {number|string} amount - Monto a formatear
 * @returns {string} Monto formateado en MXN
 */
const formatCurrency = (amount) => {
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
 * Formatea un monto para usar en documentos PDF (solo número con símbolo $)
 * @param {number|string} amount - Monto a formatear
 * @returns {string} Monto formateado para PDF
 */
const formatCurrencyForPDF = (amount) => {
  const numericAmount = parseFloat(amount) || 0;
  const roundedAmount = Math.round(numericAmount * 100) / 100;
  return `$${roundedAmount.toFixed(2)}`;
};

/**
 * Formatea un monto para usar en documentos PDF con moneda especificada
 * @param {number|string} amount - Monto a formatear
 * @param {string} currencyCode - Código de moneda (default: MXN)
 * @returns {string} Monto formateado para PDF con moneda
 */
const formatCurrencyForPDFWithCode = (amount, currencyCode = 'MXN') => {
  const numericAmount = parseFloat(amount) || 0;
  const roundedAmount = Math.round(numericAmount * 100) / 100;
  return `$${roundedAmount.toFixed(2)} ${currencyCode}`;
};

/**
 * Convierte un string de moneda a número
 * @param {string} currencyString - String con formato de moneda
 * @returns {number} Valor numérico
 */
const parseCurrency = (currencyString) => {
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
const CURRENCY_CONFIG = {
  code: 'MXN',
  symbol: '$',
  locale: 'es-MX',
  name: 'Peso Mexicano'
};

module.exports = {
  formatCurrency,
  formatCurrencyForPDF,
  formatCurrencyForPDFWithCode,
  parseCurrency,
  CURRENCY_CONFIG
};
