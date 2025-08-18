const models = require('../models');
const Oficio = models.Oficios;
const Empleado = models.Empleados;

/**
 * Obtener todos los oficios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllOficios = async (req, res) => {
    try {
        const oficios = await Oficio.findAll();

        res.status(200).json({
            message: 'Oficios obtenidos exitosamente',
            oficios
        });
    } catch (error) {
        console.error('Error al obtener oficios:', error);
        res.status(500).json({
            message: 'Error al obtener oficios',
            error: error.message
        });
    }
};

/**
 * Obtener un oficio por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getOficioById = async (req, res) => {
    try {
        const { id } = req.params;

        const oficio = await Oficio.findByPk(id);

        if (!oficio) {
            return res.status(404).json({
                message: 'Oficio no encontrado'
            });
        }

        res.status(200).json({
            message: 'Oficio obtenido exitosamente',
            oficio
        });
    } catch (error) {
        console.error('Error al obtener oficio:', error);
        res.status(500).json({
            message: 'Error al obtener oficio',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo oficio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createOficio = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        // Validación de campos requeridos
        if (!nombre) {
            return res.status(400).json({
                message: 'El nombre del oficio es requerido'
            });
        }

        // Verificar si el oficio ya existe
        const oficioExistente = await Oficio.findOne({
            where: { nombre }
        });

        if (oficioExistente) {
            return res.status(400).json({
                message: 'El oficio ya existe'
            });
        }

        // Crear el nuevo oficio
        const nuevoOficio = await Oficio.create({
            nombre,
            descripcion
        });

        res.status(201).json({
            message: 'Oficio creado exitosamente',
            oficio: nuevoOficio
        });
    } catch (error) {
        console.error('Error al crear oficio:', error);
        res.status(500).json({
            message: 'Error al crear oficio',
            error: error.message
        });
    }
};

/**
 * Actualizar un oficio existente
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateOficio = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        // Verificar si existe el oficio
        const oficio = await Oficio.findByPk(id);
        if (!oficio) {
            return res.status(404).json({
                message: 'Oficio no encontrado'
            });
        }

        // Actualizar los datos del oficio
        await oficio.update({
            nombre: nombre || oficio.nombre,
            descripcion: descripcion !== undefined ? descripcion : oficio.descripcion
        });

        res.status(200).json({
            message: 'Oficio actualizado exitosamente',
            oficio
        });
    } catch (error) {
        console.error('Error al actualizar oficio:', error);
        res.status(500).json({
            message: 'Error al actualizar oficio',
            error: error.message
        });
    }
};

/**
 * Eliminar un oficio
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteOficio = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe el oficio
        const oficio = await Oficio.findByPk(id);
        if (!oficio) {
            return res.status(404).json({
                message: 'Oficio no encontrado'
            });
        }

        // Verificar si hay empleados que utilizan este oficio
        const empleadosConOficio = await Empleado.count({
            where: { id_oficio: id }
        });

        if (empleadosConOficio > 0) {
            return res.status(400).json({
                message: `No se puede eliminar el oficio porque está asignado a ${empleadosConOficio} empleado(s)`,
                empleadosAsociados: empleadosConOficio
            });
        }

        // Eliminar el oficio
        await oficio.destroy();

        res.status(200).json({
            message: 'Oficio eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar oficio:', error);
        res.status(500).json({
            message: 'Error al eliminar oficio',
            error: error.message
        });
    }
};

module.exports = {
    getAllOficios,
    getOficioById,
    createOficio,
    updateOficio,
    deleteOficio
};
