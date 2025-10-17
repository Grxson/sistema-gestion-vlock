const models = require('../models');
const Oficio = models.Oficios;
const Empleado = models.Empleados;
const { Op } = require('sequelize');

/**
 * Obtener todos los oficios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllOficios = async (req, res) => {
    try {
        const oficios = await Oficio.findAll({
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: ['id_empleado', 'nombre', 'apellido'],
                required: false
            }]
        });

        // Agregar conteo de empleados a cada oficio
        const oficiosConConteo = oficios.map(oficio => {
            const oficioData = oficio.toJSON();
            oficioData.empleados_count = oficioData.empleados ? oficioData.empleados.length : 0;
            return oficioData;
        });

        res.status(200).json({
            message: 'Oficios obtenidos exitosamente',
            oficios: oficiosConConteo
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

        const oficio = await Oficio.findByPk(id, {
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: ['id_empleado', 'nombre', 'apellido', 'nss', 'fecha_alta'],
                include: [{
                    model: models.Contratos,
                    as: 'contrato',
                    attributes: ['tipo_contrato', 'salario_diario']
                }]
            }]
        });

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

        // Validar longitud del nombre
        if (nombre.length > 50) {
            return res.status(400).json({
                message: 'El nombre del oficio no puede exceder 50 caracteres'
            });
        }

        // Verificar si el oficio ya existe (case insensitive)
        const oficioExistente = await Oficio.findOne({
            where: models.sequelize.where(
                models.sequelize.fn('LOWER', models.sequelize.col('nombre')),
                nombre.toLowerCase().trim()
            )
        });

        if (oficioExistente) {
            return res.status(400).json({
                message: 'Ya existe un oficio con ese nombre'
            });
        }

        // Crear el nuevo oficio
        const nuevoOficio = await Oficio.create({
            nombre: nombre.trim(),
            descripcion: descripcion ? descripcion.trim() : null
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

        // Validar longitud del nombre si se proporciona
        if (nombre && nombre.length > 50) {
            return res.status(400).json({
                message: 'El nombre del oficio no puede exceder 50 caracteres'
            });
        }

        // Verificar si el nuevo nombre ya existe (excluyendo el oficio actual)
        if (nombre && nombre.trim().toLowerCase() !== oficio.nombre.toLowerCase()) {
            const oficioExistente = await Oficio.findOne({
                where: {
                    id_oficio: { [Op.ne]: id },
                    [Op.where]: models.sequelize.where(
                        models.sequelize.fn('LOWER', models.sequelize.col('nombre')),
                        nombre.toLowerCase().trim()
                    )
                }
            });

            if (oficioExistente) {
                return res.status(400).json({
                    message: 'Ya existe un oficio con ese nombre'
                });
            }
        }

        // Actualizar los datos del oficio
        await oficio.update({
            nombre: nombre ? nombre.trim() : oficio.nombre,
            descripcion: descripcion !== undefined ? (descripcion ? descripcion.trim() : null) : oficio.descripcion
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

/**
 * Buscar oficios por nombre
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const searchOficios = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                message: 'El parámetro de búsqueda es requerido'
            });
        }

        const searchQuery = q.trim();

        const oficios = await Oficio.findAll({
            where: {
                [Op.or]: [
                    {
                        nombre: {
                            [Op.like]: `%${searchQuery}%`
                        }
                    },
                    {
                        descripcion: {
                            [Op.like]: `%${searchQuery}%`
                        }
                    }
                ]
            },
            order: [['nombre', 'ASC']],
            limit: 20
        });

        res.status(200).json({
            message: 'Búsqueda de oficios completada',
            data: oficios
        });
    } catch (error) {
        console.error('Error al buscar oficios:', error);
        res.status(500).json({
            message: 'Error al buscar oficios',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de oficios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getOficiosStats = async (req, res) => {
    try {
        // Conteo total de oficios
        const totalOficios = await Oficio.count();

        // Oficios con más empleados
        const oficiosConEmpleados = await Oficio.findAll({
            attributes: [
                'id_oficio',
                'nombre',
                [models.sequelize.fn('COUNT', models.sequelize.col('empleados.id_empleado')), 'empleados_count']
            ],
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: [],
                required: false
            }],
            group: ['oficios.id_oficio'],
            order: [[models.sequelize.literal('empleados_count'), 'DESC']]
        });

        // Oficios sin empleados asignados
        const oficiosSinEmpleados = await Oficio.findAll({
            attributes: ['id_oficio', 'nombre', 'descripcion'],
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: [],
                required: false
            }],
            having: models.sequelize.where(
                models.sequelize.fn('COUNT', models.sequelize.col('empleados.id_empleado')), 
                0
            ),
            group: ['oficios.id_oficio']
        });

        // Salarios promedio por oficio (de los empleados que tienen contrato)
        const salariosPorOficio = await Oficio.findAll({
            attributes: [
                'id_oficio',
                'nombre',
                [models.sequelize.fn('AVG', models.sequelize.col('empleados.contrato.salario_diario')), 'salario_promedio'],
                [models.sequelize.fn('COUNT', models.sequelize.col('empleados.id_empleado')), 'empleados_count']
            ],
            include: [{
                model: models.Empleados,
                as: 'empleados',
                attributes: [],
                include: [{
                    model: models.Contratos,
                    as: 'contrato',
                    attributes: [],
                    required: true
                }],
                required: false
            }],
            group: ['oficios.id_oficio'],
            having: models.sequelize.where(
                models.sequelize.fn('COUNT', models.sequelize.col('empleados.id_empleado')), 
                { [Op.gt]: 0 }
            )
        });

        res.status(200).json({
            message: 'Estadísticas de oficios obtenidas exitosamente',
            estadisticas: {
                total_oficios: totalOficios,
                oficios_con_empleados: oficiosConEmpleados,
                oficios_sin_empleados: oficiosSinEmpleados,
                salarios_por_oficio: salariosPorOficio
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de oficios:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de oficios',
            error: error.message
        });
    }
};

module.exports = {
    getAllOficios,
    getOficioById,
    createOficio,
    updateOficio,
    deleteOficio,
    searchOficios,
    getOficiosStats
};
