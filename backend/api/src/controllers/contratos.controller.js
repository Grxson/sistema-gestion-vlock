const models = require('../models');
const Contrato = models.Contratos;
const { Op } = require('sequelize');

/**
 * Obtener todos los contratos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllContratos = async (req, res) => {
    try {
        const contratos = await Contrato.findAll();

        res.status(200).json({
            message: 'Contratos obtenidos exitosamente',
            contratos
        });
    } catch (error) {
        console.error('Error al obtener contratos:', error);
        res.status(500).json({
            message: 'Error al obtener contratos',
            error: error.message
        });
    }
};

/**
 * Obtener un contrato por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getContratoById = async (req, res) => {
    try {
        const { id } = req.params;

        const contrato = await Contrato.findByPk(id);

        if (!contrato) {
            return res.status(404).json({
                message: 'Contrato no encontrado'
            });
        }

        res.status(200).json({
            message: 'Contrato obtenido exitosamente',
            contrato
        });
    } catch (error) {
        console.error('Error al obtener contrato:', error);
        res.status(500).json({
            message: 'Error al obtener contrato',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo contrato
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createContrato = async (req, res) => {
    try {
        const { tipo_contrato, salario_diario, fecha_inicio, fecha_fin } = req.body;

        // Validaciones básicas
        if (!tipo_contrato || !salario_diario || !fecha_inicio) {
            return res.status(400).json({
                message: 'Los campos tipo_contrato, salario_diario y fecha_inicio son obligatorios'
            });
        }

        // Validar que el tipo de contrato sea válido
        if (!['Fijo', 'Temporal', 'Honorarios', 'Por_Proyecto'].includes(tipo_contrato)) {
            return res.status(400).json({
                message: 'Tipo de contrato inválido. Debe ser Fijo, Temporal, Honorarios o Por_Proyecto'
            });
        }

        // Crear el nuevo contrato
        const nuevoContrato = await Contrato.create({
            tipo_contrato,
            salario_diario,
            fecha_inicio,
            fecha_fin
        });

        res.status(201).json({
            message: 'Contrato creado exitosamente',
            contrato: nuevoContrato
        });
    } catch (error) {
        console.error('Error al crear contrato:', error);
        res.status(500).json({
            message: 'Error al crear contrato',
            error: error.message
        });
    }
};

/**
 * Actualizar un contrato existente
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_contrato, salario_diario, fecha_inicio, fecha_fin } = req.body;

        // Verificar si existe el contrato
        const contrato = await Contrato.findByPk(id);
        if (!contrato) {
            return res.status(404).json({
                message: 'Contrato no encontrado'
            });
        }

        // Validar que el tipo de contrato sea válido si se proporciona
        if (tipo_contrato && !['Fijo', 'Temporal', 'Honorarios', 'Por_Proyecto'].includes(tipo_contrato)) {
            return res.status(400).json({
                message: 'Tipo de contrato inválido. Debe ser Fijo, Temporal, Honorarios o Por_Proyecto'
            });
        }

        // Actualizar los datos del contrato
        await contrato.update({
            tipo_contrato: tipo_contrato || contrato.tipo_contrato,
            salario_diario: salario_diario !== undefined ? salario_diario : contrato.salario_diario,
            fecha_inicio: fecha_inicio || contrato.fecha_inicio,
            fecha_fin: fecha_fin !== undefined ? fecha_fin : contrato.fecha_fin
        });

        res.status(200).json({
            message: 'Contrato actualizado exitosamente',
            contrato
        });
    } catch (error) {
        console.error('Error al actualizar contrato:', error);
        res.status(500).json({
            message: 'Error al actualizar contrato',
            error: error.message
        });
    }
};

/**
 * Eliminar un contrato
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteContrato = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe el contrato
        const contrato = await Contrato.findByPk(id);
        if (!contrato) {
            return res.status(404).json({
                message: 'Contrato no encontrado'
            });
        }

        // Verificar si hay empleados asociados a este contrato
        const empleadosAsociados = await models.Empleados.count({
            where: { id_contrato: id }
        });

        if (empleadosAsociados > 0) {
            return res.status(400).json({
                message: `No se puede eliminar el contrato porque tiene ${empleadosAsociados} empleados asociados`
            });
        }

        // Eliminar el contrato
        await contrato.destroy();

        res.status(200).json({
            message: 'Contrato eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar contrato:', error);
        res.status(500).json({
            message: 'Error al eliminar contrato',
            error: error.message
        });
    }
};

module.exports = {
    getAllContratos,
    getContratoById,
    createContrato,
    updateContrato,
    deleteContrato
};
