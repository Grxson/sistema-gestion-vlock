const models = require('../models');
const NominaHistorial = models.Nomina_historial;

/**
 * Middleware/función para registrar cambios en la nómina
 * @param {Number} id_nomina - ID de la nómina 
 * @param {Number} id_usuario - ID del usuario que realiza el cambio
 * @param {String} tipo_cambio - Tipo de cambio ('creacion', 'actualizacion', 'cambio_estado', 'pago')
 * @param {String} estado_anterior - Estado anterior (opcional)
 * @param {String} estado_nuevo - Estado nuevo (opcional)
 * @param {Object} detalles - Detalles adicionales sobre el cambio (opcional)
 */
const registrarCambioNomina = async (
    id_nomina,
    id_usuario,
    tipo_cambio,
    estado_anterior = null,
    estado_nuevo = null,
    detalles = {}
) => {
    try {
        await NominaHistorial.create({
            id_nomina,
            id_usuario,
            tipo_cambio,
            estado_anterior,
            estado_nuevo,
            detalles,
            fecha_cambio: new Date()
        });
        return true;
    } catch (error) {
        console.error('Error al registrar historial de nómina:', error);
        return false;
    }
};

/**
 * Obtener historial de una nómina específica
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getHistorialNomina = async (req, res) => {
    try {
        const { id_nomina } = req.params;
        
        const historial = await NominaHistorial.findAll({
            where: { id_nomina },
            include: [
                { model: models.Usuarios, as: 'usuario', attributes: ['nombre_usuario', 'email'] }
            ],
            order: [['fecha_cambio', 'DESC']]
        });
        
        res.status(200).json({
            message: 'Historial obtenido exitosamente',
            historial
        });
    } catch (error) {
        console.error('Error al obtener historial:', error);
        res.status(500).json({
            message: 'Error al obtener historial',
            error: error.message
        });
    }
};

module.exports = {
    registrarCambioNomina,
    getHistorialNomina
};
