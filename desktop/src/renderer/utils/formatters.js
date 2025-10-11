/**
 * Utilidades para formatear y mostrar información de proveedores
 */

/**
 * Trunca texto largo y proporciona el texto completo para tooltip
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima antes de truncar
 * @returns {object} - Objeto con texto truncado y texto completo
 */
export const truncateText = (text, maxLength = 30) => {
  if (!text || text.length <= maxLength) {
    return {
      truncated: text || '',
      full: text || '',
      isTruncated: false
    };
  }
  
  return {
    truncated: text.substring(0, maxLength) + '...',
    full: text,
    isTruncated: true
  };
};

/**
 * Formatea nombres de proveedores para display
 * @param {object} proveedor - Objeto proveedor
 * @param {number} maxLength - Longitud máxima del nombre
 * @returns {object} - Información formateada del proveedor
 */
export const formatProveedorName = (proveedor, maxLength = 30) => {
  if (!proveedor) {
    return {
      nombre: { truncated: 'Sin nombre', full: 'Sin nombre', isTruncated: false },
      razonSocial: { truncated: '', full: '', isTruncated: false }
    };
  }

  const nombre = (proveedor.nombre && proveedor.nombre.trim()) 
    ? proveedor.nombre.trim() 
    : 'Proveedor sin nombre';
    
  const razonSocial = proveedor.razon_social && 
    proveedor.razon_social !== proveedor.nombre 
    ? proveedor.razon_social.trim() 
    : '';

  return {
    nombre: truncateText(nombre, maxLength),
    razonSocial: truncateText(razonSocial, maxLength)
  };
};

/**
 * Formatea números telefónicos para display en formato (xx) xxxx-xxxx
 * @param {string} telefono - Número telefónico
 * @returns {string} - Número formateado
 */
export const formatTelefono = (telefono) => {
  if (!telefono) return 'Sin información';
  
  // Limpiar el número de caracteres no numéricos
  const cleaned = telefono.replace(/\D/g, '');
  
  // Si no hay números, retornar sin información
  if (cleaned.length === 0) return 'Sin información';
  
  // Formatear según la longitud con el formato solicitado (xx) xxxx-xxxx
  if (cleaned.length === 10) {
    // Formato para números de 10 dígitos: (xx) xxxx-xxxx
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 6)}-${cleaned.substring(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    // Formato para números de 11 dígitos que empiezan con 1: +1 (xx) xxxx-xxxx
    const number = cleaned.substring(1);
    return `+1 (${number.substring(0, 2)}) ${number.substring(2, 6)}-${number.substring(6)}`;
  } else if (cleaned.length >= 8) {
    // Para números de 8 o más dígitos, intentar formato (xx) xxxx-xxxx
    const lastFour = cleaned.substring(cleaned.length - 4);
    const middleFour = cleaned.substring(cleaned.length - 8, cleaned.length - 4);
    const firstTwo = cleaned.substring(cleaned.length - 10, cleaned.length - 8);
    const rest = cleaned.substring(0, cleaned.length - 10);
    
    if (rest.length > 0) {
      return `+${rest} (${firstTwo}) ${middleFour}-${lastFour}`;
    } else if (firstTwo.length === 2) {
      return `(${firstTwo}) ${middleFour}-${lastFour}`;
    } else {
      return `${middleFour}-${lastFour}`;
    }
  } else if (cleaned.length >= 4) {
    // Para números de 4-7 dígitos, formato básico xxxx-xxx
    const lastPart = cleaned.substring(4);
    const firstPart = cleaned.substring(0, 4);
    return `${firstPart}-${lastPart}`;
  } else {
    // Para números muy cortos, mostrar tal como están
    return cleaned;
  }
};

/**
 * Formatea unidades de medida para display
 * @param {string|object} unidad - Unidad de medida (string legacy o objeto con estructura nueva)
 * @returns {string} - Unidad formateada
 */
export const formatUnidadMedida = (unidad) => {
  if (!unidad) return 'N/A';
  
  // Si es un objeto con la nueva estructura (unidadMedida)
  if (typeof unidad === 'object' && unidad !== null) {
    // Priorizar el símbolo si está disponible, sino el nombre
    return unidad.simbolo || unidad.nombre || 'N/A';
  }
  
  // Si es un string (estructura legacy)
  if (typeof unidad === 'string') {
    // Diccionario de abreviaciones comunes
    const unidadesMap = {
      // Peso
      'kg': 'Kilogramos',
      'g': 'Gramos',
      'ton': 'Toneladas',
      'lb': 'Libras',
      
      // Longitud
      'm': 'Metros',
      'cm': 'Centímetros',
      'mm': 'Milímetros',
      'km': 'Kilómetros',
      'ft': 'Pies',
      'in': 'Pulgadas',
      
      // Volumen
      'l': 'Litros',
      'lt': 'Litros',
      'ml': 'Mililitros',
      'gal': 'Galones',
      'gl': 'Galones',
      
      // Área
      'm2': 'Metros cuadrados',
      'm²': 'Metros cuadrados',
      'cm2': 'Centímetros cuadrados',
      'ft2': 'Pies cuadrados',
      
      // Volumen cúbico
      'm3': 'Metros cúbicos',
      'm³': 'Metros cúbicos',
      
      // Cantidad
      'pz': 'Piezas',
      'pza': 'Piezas',
      'und': 'Unidades',
      'unidad': 'Unidades',
      'caja': 'Cajas',
      'paquete': 'Paquetes',
      'rollo': 'Rollos',
      'saco': 'Sacos',
      'bolsa': 'Bolsas',
      'bote': 'Botes',
      'jgo': 'Juegos',
      
      // Tiempo
      'hr': 'Horas',
      'min': 'Minutos',
      'dia': 'Días',
      'día': 'Días',
      'mes': 'Meses',
      
      // Otros
      '%': 'Porcentaje',
      'set': 'Conjunto'
    };
    
    const unidadLower = unidad.toLowerCase().trim();
    const unidadFormateada = unidadesMap[unidadLower];
    
    if (unidadFormateada) {
      return unidadFormateada;
    }
    
    // Si no se encuentra en el diccionario, capitalizar la primera letra
    return unidad.charAt(0).toUpperCase() + unidad.slice(1).toLowerCase();
  }
  
  return 'N/A';
};

/**
 * Formatea números con separadores de miles y decimales controlados
 * @param {number} number - Número a formatear
 * @param {number} decimals - Número de decimales máximos (default: 2)
 * @returns {string} - Número formateado
 */
export const formatNumber = (number, decimals = 2) => {
  if (isNaN(number) || number === null || number === undefined) {
    return '0';
  }
  
  const num = parseFloat(number);
  
  // Formatear con separadores de miles y decimales controlados
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea números para gráficas con formato apropiado según la escala
 * @param {number} number - Número a formatear
 * @param {number} decimals - Número de decimales máximos (default: 2)
 * @returns {string} - Número formateado para gráficas
 */
export const formatNumberForChart = (number, decimals = 2) => {
  if (isNaN(number) || number === null || number === undefined) {
    return '0';
  }
  
  const num = parseFloat(number);
  
  // Si es mayor a 1 millón
  if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }) + 'M';
  }
  
  // Si es mayor a 1000
  if (Math.abs(num) >= 1000) {
    return (num / 1000).toLocaleString('es-MX', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals
    }) + 'K';
  }
  
  // Para números menores a 1000
  return num.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  });
};

/**
 * Formatea percentajes con formato estándar
 * @param {number} percentage - Porcentaje a formatear
 * @param {number} decimals - Número de decimales (default: 1)
 * @returns {string} - Porcentaje formateado
 */
export const formatPercentage = (percentage, decimals = 1) => {
  if (isNaN(percentage) || percentage === null || percentage === undefined) {
    return '0%';
  }
  
  return percentage.toLocaleString('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }) + '%';
};

/**
 * Formatea moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (default: 'MXN')
 * @returns {string} - Cantidad formateada como moneda
 */
export const formatCurrency = (amount, currency = 'MXN') => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '$0.00';
  }
  
  const num = parseFloat(amount);
  
  return num.toLocaleString('es-MX', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
