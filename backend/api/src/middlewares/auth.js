const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware para verificar el token JWT
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la ejecución
 */
const verifyToken = (req, res, next) => {
    try {
        // Obtener el token del encabezado de autorización
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Se requiere token de autorización',
                code: 'NO_TOKEN'
            });
        }

        // Extraer el token de la cadena "Bearer [token]"
        const token = authHeader.split(' ')[1];

        // Verificar y decodificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar la información del usuario en el objeto req para usarla en otros controladores
        req.usuario = decoded;

        // Continuar con la siguiente función
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expirado, inicie sesión nuevamente',
                code: 'TOKEN_EXPIRED',
                timestamp: new Date().toISOString()
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                message: 'Token inválido',
                code: 'INVALID_TOKEN'
            });
        }

        return res.status(401).json({
            message: 'Error de autenticación',
            code: 'AUTH_ERROR',
            details: error.message
        });
    }
};

/**
 * Middleware para verificar permisos según rol
 * @param {Array} rolesPermitidos - Array de roles que tienen permiso
 */
const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        // Se asume que el middleware verifyToken ya se ejecutó y agregó req.usuario
        if (!req.usuario) {
            return res.status(403).json({
                message: 'No autorizado'
            });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (rolesPermitidos.includes(req.usuario.id_rol)) {
            next();
        } else {
            res.status(403).json({
                message: 'No tiene permiso para realizar esta acción'
            });
        }
    };
};

module.exports = { verifyToken, verifyRole };
