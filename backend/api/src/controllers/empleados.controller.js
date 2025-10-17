const models = require('../models');
const sequelize = require('../config/db');
const Empleado = models.Empleados;
const Contrato = models.Contratos;
const Oficio = models.Oficios;
const Proyecto = models.Proyectos;
const { Op } = require('sequelize');

/**
 * Obtener todos los empleados
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllEmpleados = async (req, res) => {
    try {
        const { proyecto, oficio, activo } = req.query;
        
        // Construir filtros dinámicos
        const whereClause = {};
        if (proyecto) whereClause.id_proyecto = proyecto;
        if (oficio) whereClause.id_oficio = oficio;
        if (activo !== undefined && activo !== 'all') whereClause.activo = activo === 'true';

        const empleados = await Empleado.findAll({
            where: whereClause,
            include: [
                { 
                    model: Contrato, 
                    as: 'contrato',
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Oficio, 
                    as: 'oficio',
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Proyecto, 
                    as: 'proyecto',
                    required: false,
                    attributes: ['id_proyecto', 'nombre', 'descripcion']
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
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Oficio, 
                    as: 'oficio',
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Proyecto, 
                    as: 'proyecto',
                    required: false,
                    attributes: ['id_proyecto', 'nombre', 'descripcion']
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
        console.log('Datos recibidos para crear empleado:', req.body);
        
        const {
            nombre,
            apellido,
            nss,
            telefono,
            contacto_emergencia,
            telefono_emergencia,
            banco,
            cuenta_bancaria,
            id_oficio,
            id_proyecto,
            pago_semanal,
            rfc
        } = req.body;

        // Validaciones básicas
        if (!nombre || !apellido || !nss || !id_oficio || !pago_semanal) {
            return res.status(400).json({
                success: false,
                message: 'Los campos nombre, apellido, NSS, oficio y pago semanal son obligatorios'
            });
        }

        // Validar que el pago semanal sea un número positivo
        if (isNaN(pago_semanal) || pago_semanal <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El pago semanal debe ser un número mayor a 0'
            });
        }

        // Validar RFC si se proporciona
        if (rfc && rfc.length > 0 && (rfc.length < 10 || rfc.length > 13)) {
            return res.status(400).json({
                success: false,
                message: 'El RFC debe tener entre 10 y 13 caracteres'
            });
        }

        // Verificar que el NSS no esté duplicado
        const empleadoExistente = await Empleado.findOne({
            where: { nss }
        });

        if (empleadoExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un empleado con este NSS'
            });
        }

        const nuevoEmpleado = await Empleado.create({
            nombre,
            apellido,
            nss,
            telefono,
            contacto_emergencia,
            telefono_emergencia,
            banco,
            cuenta_bancaria,
            id_contrato: null, // Siempre sin contrato
            id_oficio,
            id_proyecto: id_proyecto || null,
            pago_semanal: pago_semanal,
            activo: true, // Siempre activo
            fecha_alta: new Date(),
            rfc
        });

        res.status(201).json({
            success: true,
            message: 'Empleado creado exitosamente',
            data: nuevoEmpleado
        });
    } catch (error) {
        console.error('Error al crear empleado:', error);
        
        // Manejar errores de validación de Sequelize
        if (error.name === 'SequelizeValidationError') {
            const errorMessages = error.errors.map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors: errorMessages
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al crear el empleado'
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
            id_oficio, id_proyecto, pago_semanal, activo, fecha_alta, fecha_baja, 
            rfc
        } = req.body;

        // Verificar si existe el empleado
        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                success: false,
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
            id_contrato: id_contrato === '' ? null : (id_contrato !== undefined ? id_contrato : empleado.id_contrato),
            id_oficio: id_oficio === '' ? null : (id_oficio !== undefined ? id_oficio : empleado.id_oficio),
            id_proyecto: id_proyecto === '' ? null : (id_proyecto !== undefined ? id_proyecto : empleado.id_proyecto),
            pago_semanal: pago_semanal === '' ? null : (pago_semanal !== undefined ? pago_semanal : empleado.pago_semanal),
            activo: activo !== undefined ? activo : empleado.activo,
            fecha_alta: fecha_alta || empleado.fecha_alta,
            fecha_baja: fecha_baja === '' ? null : (fecha_baja !== undefined ? fecha_baja : empleado.fecha_baja),
            rfc: rfc !== undefined ? rfc : empleado.rfc
        });

        // Obtener el empleado actualizado con todas las relaciones
        const empleadoActualizado = await Empleado.findByPk(id, {
            include: [
                { 
                    model: Contrato, 
                    as: 'contrato',
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Oficio, 
                    as: 'oficio',
                    required: false,
                    attributes: { exclude: ['createdAt', 'updatedAt'] }
                },
                { 
                    model: Proyecto, 
                    as: 'proyecto',
                    required: false,
                    attributes: ['id_proyecto', 'nombre', 'descripcion']
                }
            ],
            attributes: { exclude: ['createdAt', 'updatedAt'] }
        });

        res.status(200).json({
            success: true,
            message: 'Empleado actualizado exitosamente',
            data: empleadoActualizado
        });
    } catch (error) {
        console.error('Error al actualizar empleado:', error);
        res.status(500).json({
            success: false,
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
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        // Verificar si ya está dado de baja
        if (empleado.fecha_baja) {
            return res.status(400).json({
                success: false,
                message: 'El empleado ya se encuentra dado de baja'
            });
        }

        // Realizar una baja lógica (establecer fecha de baja y desactivar)
        await empleado.update({
            fecha_baja: new Date(),
            activo: false
        });

        res.status(200).json({
            success: true,
            message: 'Empleado eliminado exitosamente',
            data: empleado
        });
    } catch (error) {
        console.error('Error al dar de baja empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar el empleado'
        });
    }
};

/**
 * Eliminar un empleado permanentemente (eliminación física)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteEmpleadoPermanente = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si existe el empleado
        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        // Eliminar permanentemente de la base de datos
        await empleado.destroy();

        res.status(200).json({
            success: true,
            message: 'Empleado eliminado permanentemente del sistema',
            data: { id: parseInt(id) }
        });
    } catch (error) {
        console.error('Error al eliminar empleado permanentemente:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al eliminar el empleado permanentemente'
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

/**
 * Activar un empleado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const activarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        if (empleado.activo) {
            return res.status(400).json({
                success: false,
                message: 'El empleado ya se encuentra activo'
            });
        }

        await empleado.update({ 
            activo: true,
            fecha_baja: null
        });

        res.status(200).json({
            success: true,
            message: 'Empleado activado exitosamente',
            data: empleado
        });
    } catch (error) {
        console.error('Error al activar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al activar el empleado'
        });
    }
};

/**
 * Desactivar un empleado
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const desactivarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;

        const empleado = await Empleado.findByPk(id);
        if (!empleado) {
            return res.status(404).json({
                success: false,
                message: 'Empleado no encontrado'
            });
        }

        if (!empleado.activo) {
            return res.status(400).json({
                success: false,
                message: 'El empleado ya se encuentra inactivo'
            });
        }

        await empleado.update({ 
            activo: false,
            fecha_baja: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Empleado desactivado exitosamente',
            data: empleado
        });
    } catch (error) {
        console.error('Error al desactivar empleado:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor al desactivar el empleado'
        });
    }
};

module.exports = {
    getAllEmpleados,
    getEmpleadoById,
    createEmpleado,
    updateEmpleado,
    deleteEmpleado,
    deleteEmpleadoPermanente,
    searchEmpleados,
    getEmpleadosStats,
    activarEmpleado,
    desactivarEmpleado
};
