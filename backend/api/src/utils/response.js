/**
 * Utilidad para estandarizar respuestas HTTP
 */

/**
 * Enviar respuesta de éxito
 * @param {Object} res - Objeto de respuesta Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de éxito
 * @param {Object} data - Datos a enviar
 * @param {Object} meta - Metadatos adicionales (paginación, etc)
 */
const success = (res, statusCode = 200, message = 'Operación exitosa', data = null, meta = null) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    if (meta !== null) {
        response.meta = meta;
    }

    return res.status(statusCode).json(response);
};

/**
 * Enviar respuesta de error
 * @param {Object} res - Objeto de respuesta Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de error
 * @param {Object} error - Objeto de error
 * @param {boolean} includeDetails - Si se debe incluir detalles del error
 */
const error = (res, statusCode = 500, message = 'Error interno del servidor', error = null, includeDetails = false) => {
    const response = {
        success: false,
        message
    };

    // En entornos de desarrollo incluir detalles del error
    if (error && (process.env.NODE_ENV === 'development' || includeDetails)) {
        response.error = {
            name: error.name,
            message: error.message,
            stack: error.stack
        };
    }

    return res.status(statusCode).json(response);
};

module.exports = {
    success,
    error
};
