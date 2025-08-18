const models = require('../models');
const sequelize = require('../config/db');
const Empleado = models.Empleados;
const Contrato = models.Contratos;
const Oficio = models.Oficios;
const { Op } = require('sequelize');

/**
 * Obtener todos los empleados
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllEmpleados = async (req, res) => {
    try {
        const empleados = await Empleado.findAll({
            include: [
                { 
                    model: Contrato, 
                    as: 'contrato',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Oficio, 
                    as: 'oficio',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        res.status(200).json({
            message: 'Empleados obtenidos exitosamente',
            empleados
        });
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        res.status(500).json({
            message: 'Error al obtener empleados',
            error: error.message
        });
    }
};

/**
 * Obtener un empleado por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getEmpleadoById = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByPk(id, {
            include: [
                { 
                    model: Contrato, 
                    as: 'contrato',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Oficio, 
                    as: 'oficio',
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        if (!empleado) {
            return res.status(404).json({
                message: 'Empleado no encontrado'
            });
        }

        res.status(200).json({
            message: 'Empleado obtenido exitosamente',
            empleado
        });
    } catch (error) {
        console.error('Error al obtener empleado:', error);
        res.status(500).json({
            message: 'Error al obtener empleado',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo empleado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createEmpleado = async (req, res) => {
    try {
        const { 
            nombre, apellido, nss, telefono, contacto_emergencia, 
            telefono_emergencia, banco, cuenta_bancaria, id_contrato, 
            id_oficio, fecha_alta
        } = req.body;

        // Validación básica
        if (!nombre || !apellido || !fecha_alta) {
            return res.status(400).json({
                message: 'Nombre, apellido y fecha de alta son campos obligatorios'
            });
        }

        // Verificar si el contrato existe (si se proporciona id_contrato)
        if (id_contrato) {
            const contratoExiste = await Contrato.findByPk(id_contrato);
            if (!contratoExiste) {
                return res.status(400).json({
                    message: `El contrato con ID ${id_contrato} no existe`
                });
            }
        }

        // Verificar si el oficio existe (si se proporciona id_oficio)
        if (id_oficio) {
            const oficioExiste = await Oficio.findByPk(id_oficio);
            if (!oficioExiste) {
                return res.status(400).json({
                    message: `El oficio con ID ${id_oficio} no existe`
                });
            }
        }

        // Crear el nuevo empleado
        const nuevoEmpleado = await Empleado.create({
            nombre,
            apellido,
            nss,
            telefono,
            contacto_emergencia,
            telefono_emergencia,
            banco,
            cuenta_bancaria,
            id_contrato: id_contrato || null,
            id_oficio: id_oficio || null,
            fecha_alta
        });

        res.status(201).json({
            message: 'Empleado creado exitosamente',
            empleado: nuevoEmpleado
        });
    } catch (error) {
        console.error('Error al crear empleado:', error);
        res.status(500).json({
            message: 'Error al crear empleado',
            error: error.message
        });
    }
};

/**
 * Actualizar un empleado existente
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre, apellido, nss, telefono, contacto_emergencia, 
            telefono_emergencia, banco, cuenta_bancaria, id_contrato, 
            id_oficio, fecha_alta, fecha_baja
        } = req.body;

        // Verificar si existe el empleado
        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                message: 'Empleado no encontrado'
            });
        }

        // Actualizar los datos del empleado
        await empleado.update({
            nombre: nombre || empleado.nombre,
            apellido: apellido || empleado.apellido,
            nss: nss !== undefined ? nss : empleado.nss,
            telefono: telefono !== undefined ? telefono : empleado.telefono,
            contacto_emergencia: contacto_emergencia !== undefined ? contacto_emergencia : empleado.contacto_emergencia,
            telefono_emergencia: telefono_emergencia !== undefined ? telefono_emergencia : empleado.telefono_emergencia,
            banco: banco !== undefined ? banco : empleado.banco,
            cuenta_bancaria: cuenta_bancaria !== undefined ? cuenta_bancaria : empleado.cuenta_bancaria,
            id_contrato: id_contrato !== undefined ? id_contrato : empleado.id_contrato,
            id_oficio: id_oficio !== undefined ? id_oficio : empleado.id_oficio,
            fecha_alta: fecha_alta || empleado.fecha_alta,
            fecha_baja: fecha_baja !== undefined ? fecha_baja : empleado.fecha_baja
        });

        res.status(200).json({
            message: 'Empleado actualizado exitosamente',
            empleado
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({
            message: 'Error al actualizar empleado',
            error: error.message
        });
    }
};

/**
 * Eliminar un empleado (baja lógica)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe el empleado
        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                message: 'Empleado no encontrado'
            });
        }

        // Realizar una baja lógica (establecer fecha de baja)
        await empleado.update({
            fecha_baja: new Date()
        });

        res.status(200).json({
            message: 'Empleado dado de baja exitosamente'
        });
    } catch (error) {
        console.error('Error al dar de baja empleado:', error);
        res.status(500).json({
            message: 'Error al dar de baja empleado',
            error: error.message
        });
    }
};

/**
 * Buscar empleados por criterios avanzados
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const searchEmpleados = async (req, res) => {
    try {
        const { 
            query, // Búsqueda general por nombre/apellido
            id_oficio, 
            id_contrato, 
            activo, // Opción para filtrar solo activos, inactivos o todos
            fecha_alta_desde, 
            fecha_alta_hasta
        } = req.query;
        
        // Construir condiciones de búsqueda
        const whereConditions = {};
        
        // Filtro por nombre o apellido
        if (query) {
            whereConditions[Op.or] = [
                { nombre: { [Op.like]: `%${query}%` } },
                { apellido: { [Op.like]: `%${query}%` } }
            ];
        }
        
        // Filtro por oficio
        if (id_oficio) {
            whereConditions.id_oficio = id_oficio;
        }
        
        // Filtro por tipo de contrato
        if (id_contrato) {
            whereConditions.id_contrato = id_contrato;
        }
        
        // Filtro por estado activo/inactivo
        if (activo !== undefined) {
            if (activo === 'true' || activo === true) {
                whereConditions.fecha_baja = null; // Empleados activos (sin fecha de baja)
            } else if (activo === 'false' || activo === false) {
                whereConditions.fecha_baja = { [Op.ne]: null }; // Empleados inactivos (con fecha de baja)
            }
        }
        
        // Filtro por rango de fechas de alta
        if (fecha_alta_desde || fecha_alta_hasta) {
            const fechaCondition = {};
            
            if (fecha_alta_desde) {
                fechaCondition[Op.gte] = fecha_alta_desde;
            }
            
            if (fecha_alta_hasta) {
                fechaCondition[Op.lte] = fecha_alta_hasta;
            }
            
            whereConditions.fecha_alta = fechaCondition;
        }

        // Realizar la búsqueda
        const empleados = await Empleado.findAll({
            where: whereConditions,
            include: [
                { model: Contrato, as: 'contrato' },
                { model: Oficio, as: 'oficio' }
            ]
        });

        res.status(200).json({
            message: 'Búsqueda completada',
            empleados,
            totalEmpleados: empleados.length,
            filtros: req.query
        });
    } catch (error) {
        console.error('Error en la búsqueda de empleados:', error);
        res.status(500).json({
            message: 'Error en la búsqueda de empleados',
            error: error.message
        });
    }
};

/**
 * Obtener estadísticas de empleados
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getEmpleadosStats = async (req, res) => {
    try {
        // Total de empleados activos
        const totalActivos = await Empleado.count({
            where: {
                fecha_baja: null
            }
        });
        
        // Total de empleados inactivos
        const totalInactivos = await Empleado.count({
            where: {
                fecha_baja: { [Op.ne]: null }
            }
        });
        
        // Empleados por oficio
        const porOficio = await Empleado.findAll({
            attributes: [
                'id_oficio',
                [sequelize.fn('COUNT', sequelize.col('id_empleado')), 'total']
            ],
            include: [
                { 
                    model: Oficio, 
                    as: 'oficio', 
                    attributes: ['nombre'],
                    required: false
                }
            ],
            where: {
                fecha_baja: null // Solo activos
            },
            group: ['id_oficio', 'oficio.id_oficio']
        });
        
        // Empleados por tipo de contrato
        const porContrato = await Empleado.findAll({
            attributes: [
                'id_contrato',
                [sequelize.fn('COUNT', sequelize.col('id_empleado')), 'total']
            ],
            include: [
                { 
                    model: Contrato, 
                    as: 'contrato', 
                    attributes: ['tipo_contrato'],
                    required: false
                }
            ],
            where: {
                fecha_baja: null // Solo activos
            },
            group: ['id_contrato', 'contrato.id_contrato']
        });
        
        // Nuevos empleados en el último mes
        const unMesAtras = new Date();
        unMesAtras.setMonth(unMesAtras.getMonth() - 1);
        
        const nuevosUltimoMes = await Empleado.count({
            where: {
                fecha_alta: { [Op.gte]: unMesAtras }
            }
        });

        res.status(200).json({
            message: 'Estadísticas obtenidas exitosamente',
            empleados: {
                activos: totalActivos,
                inactivos: totalInactivos,
                total: totalActivos + totalInactivos,
                nuevosUltimoMes
            },
            distribucion: {
                porOficio,
                porContrato
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de empleados:', error);
        res.status(500).json({
            message: 'Error al obtener estadísticas de empleados',
            error: error.message
        });
    }
};

module.exports = {
    getAllEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    searchEmpleados,
    getEmpleadosStats
};
