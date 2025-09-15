/**
 * Utilidades para validación de datos del sistema
 */

/**
 * Valida si existe un folio duplicado para el mismo proveedor
 * @param {string} folio - Folio a validar
 * @param {string} proveedorId - ID del proveedor
 * @param {Array} suministros - Array de suministros existentes
 * @param {string} suministroId - ID del suministro actual (para excluir en ediciones)
 * @returns {object} - Resultado de la validación
 */
export const validateFolioDuplicado = (folio, proveedorId, suministros = [], suministroId = null) => {
  // Si no hay folio, no hay duplicado que validar
  if (!folio || folio.trim() === '') {
    return {
      isValid: true,
      isDuplicate: false,
      message: '',
      duplicateItems: []
    };
  }

  const folioClean = folio.trim().toLowerCase();

  // Buscar duplicados solo para el mismo proveedor
  const duplicados = suministros.filter(suministro => {
    // Excluir el suministro actual si estamos editando
    if (suministroId && suministro.id_suministro === suministroId) {
      return false;
    }

    // Verificar que el folio coincida exactamente
    const suministroFolio = suministro.folio?.trim().toLowerCase();
    if (!suministroFolio || suministroFolio !== folioClean) {
      return false;
    }

    // Verificar que sea el mismo proveedor
    const suministroProveedorId = suministro.proveedor?.id_proveedor || 
                                  suministro.id_proveedor || 
                                  suministro.proveedor_id;

    return String(suministroProveedorId) === String(proveedorId);
  });

  const isDuplicate = duplicados.length > 0;

  if (isDuplicate) {
    const proveedorNombre = duplicados[0].proveedor?.nombre || 
                           duplicados[0].proveedor?.nombre_empresa || 
                           'el mismo proveedor';

    return {
      isValid: false,
      isDuplicate: true,
      message: `El folio "${folio}" ya existe para ${proveedorNombre}. Los folios deben ser únicos por proveedor.`,
      duplicateItems: duplicados
    };
  }

  return {
    isValid: true,
    isDuplicate: false,
    message: '',
    duplicateItems: []
  };
};

/**
 * Valida si existe un proveedor duplicado por nombre
 * @param {string} nombre - Nombre del proveedor
 * @param {Array} proveedores - Array de proveedores existentes
 * @param {string} proveedorId - ID del proveedor actual (para excluir en ediciones)
 * @returns {object} - Resultado de la validación
 */
export const validateProveedorDuplicado = (nombre, proveedores = [], proveedorId = null) => {
  if (!nombre || nombre.trim() === '') {
    return {
      isValid: true,
      isDuplicate: false,
      message: '',
      duplicateItems: []
    };
  }

  const nombreClean = nombre.trim().toLowerCase();

  const duplicados = proveedores.filter(proveedor => {
    // Excluir el proveedor actual si estamos editando
    if (proveedorId && proveedor.id_proveedor === proveedorId) {
      return false;
    }

    const proveedorNombre = proveedor.nombre?.trim().toLowerCase();
    return proveedorNombre === nombreClean;
  });

  const isDuplicate = duplicados.length > 0;

  if (isDuplicate) {
    return {
      isValid: false,
      isDuplicate: true,
      message: `Ya existe un proveedor con el nombre "${nombre}".`,
      duplicateItems: duplicados
    };
  }

  return {
    isValid: true,
    isDuplicate: false,
    message: '',
    duplicateItems: []
  };
};

/**
 * Muestra un mensaje de error o advertencia al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje ('error', 'warning', 'info')
 * @param {function} onClose - Función a ejecutar al cerrar
 * @returns {object} - Configuración del modal/alert
 */
export const showValidationMessage = (message, type = 'warning', onClose = null) => {
  const config = {
    error: {
      title: '❌ Error de Validación',
      icon: '🚫',
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
      textColor: 'text-red-800 dark:text-red-200'
    },
    warning: {
      title: '⚠️ Advertencia',
      icon: '⚠️',
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      textColor: 'text-yellow-800 dark:text-yellow-200'
    },
    info: {
      title: 'ℹ️ Información',
      icon: 'ℹ️',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      textColor: 'text-blue-800 dark:text-blue-200'
    }
  };

  return {
    ...config[type],
    message,
    onClose
  };
};

/**
 * Valida campos requeridos de un formulario
 * @param {object} data - Datos del formulario
 * @param {Array} requiredFields - Array de campos requeridos
 * @returns {object} - Resultado de la validación
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = [];

  requiredFields.forEach(field => {
    const value = data[field.name];
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field.label || field.name);
    }
  });

  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Los siguientes campos son obligatorios: ${missingFields.join(', ')}`
    };
  }

  return {
    isValid: true,
    message: ''
  };
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {object} - Resultado de la validación
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return { isValid: true, message: '' }; // Email opcional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email.trim());

  return {
    isValid,
    message: isValid ? '' : 'El formato del email no es válido'
  };
};

/**
 * Valida rango de fechas
 * @param {string} fechaInicio - Fecha de inicio
 * @param {string} fechaFin - Fecha de fin
 * @returns {object} - Resultado de la validación
 */
export const validateDateRange = (fechaInicio, fechaFin) => {
  if (!fechaInicio || !fechaFin) {
    return { isValid: true, message: '' }; // Fechas opcionales
  }

  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);

  if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
    return {
      isValid: false,
      message: 'Las fechas no tienen un formato válido'
    };
  }

  if (inicio > fin) {
    return {
      isValid: false,
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
    };
  }

  return {
    isValid: true,
    message: ''
  };
};
