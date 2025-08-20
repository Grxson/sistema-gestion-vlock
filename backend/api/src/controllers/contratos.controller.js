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
        const contratos = await Contrato.findAll({
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: ['id_empleado', 'nombre', 'apellido'],
                required: false
            }]
        });

        // Agregar conteo de empleados a cada contrato
        const contratosConConteo = contratos.map(contrato => {
            const contratoData = contrato.toJSON();
            contratoData.empleados_count = contratoData.empleados ? contratoData.empleados.length : 0;
            return contratoData;
        });

        res.status(200).json({
            message: 'Contratos obtenidos exitosamente',
            contratos: contratosConConteo
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

        const contrato = await Contrato.findByPk(id, {
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: ['id_empleado', 'nombre', 'apellido', 'nss', 'fecha_alta']
            }]
        });

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

        // Validar y limpiar fecha_fin
        let fechaFinProcessed = null;
        if (fecha_fin && fecha_fin !== '' && fecha_fin !== 'Invalid date' && !isNaN(new Date(fecha_fin))) {
            fechaFinProcessed = fecha_fin;
        }

        // Crear el nuevo contrato
        const nuevoContrato = await Contrato.create({
            tipo_contrato,
            salario_diario,
            fecha_inicio,
            fecha_fin: fechaFinProcessed
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

        // Validar y limpiar fecha_fin
        let fechaFinProcessed = contrato.fecha_fin; // Mantener valor actual por defecto
        if (fecha_fin !== undefined) {
            if (fecha_fin === '' || fecha_fin === 'Invalid date' || isNaN(new Date(fecha_fin))) {
                fechaFinProcessed = null;
            } else {
                fechaFinProcessed = fecha_fin;
            }
        }

        // Actualizar los datos del contrato
        await contrato.update({
            tipo_contrato: tipo_contrato || contrato.tipo_contrato,
            salario_diario: salario_diario !== undefined ? salario_diario : contrato.salario_diario,
            fecha_inicio: fecha_inicio || contrato.fecha_inicio,
            fecha_fin: fechaFinProcessed
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

/**
 * Obtener estadísticas de contratos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getContratosStats = async (req, res) => {
    try {
        // Conteo total de contratos
        const totalContratos = await Contrato.count();

        // Conteo por tipo de contrato
        const contratosPorTipo = await Contrato.findAll({
            attributes: [
                'tipo_contrato',
                [models.sequelize.fn('COUNT', models.sequelize.col('id_contrato')), 'count']
            ],
            group: ['tipo_contrato']
        });

        // Conteo de empleados por contrato
        const empleadosPorContrato = await Contrato.findAll({
            attributes: [
                'id_contrato',
                'tipo_contrato',
                [models.sequelize.fn('COUNT', models.sequelize.col('empleados.id_empleado')), 'empleados_count']
            ],
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: [],
                required: false
            }],
            group: ['contratos.id_contrato']
        });

        // Salario promedio por tipo de contrato
        const salarioPromedioPorTipo = await Contrato.findAll({
            attributes: [
                'tipo_contrato',
                [models.sequelize.fn('AVG', models.sequelize.col('salario_diario')), 'salario_promedio'],
                [models.sequelize.fn('MIN', models.sequelize.col('salario_diario')), 'salario_minimo'],
                [models.sequelize.fn('MAX', models.sequelize.col('salario_diario')), 'salario_maximo']
            ],
            group: ['tipo_contrato']
        });

        res.status(200).json({
            message: 'Estadísticas de contratos obtenidas exitosamente',
            estadisticas: {
                total_contratos: totalContratos,
                contratos_por_tipo: contratosPorTipo,
                empleados_por_contrato: empleadosPorContrato,
                salarios_por_tipo: salarioPromedioPorTipo
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de contratos:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de contratos',
            error: error.message
        });
    }
};

module.exports = {
    getAllContratos,
    getContratoById,
    createContrato,
    updateContrato,
    deleteContrato,
    getContratosStats
};
