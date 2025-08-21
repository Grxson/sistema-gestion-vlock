const models = require('../models');
const { verifyToken } = require('../middlewares/auth');

// Obtener todos los suministros
const getSuministros = async (req, res) => {
    try {
        const { id_proyecto, fecha_inicio, fecha_fin, proveedor, descripcion } = req.query;
        
        let whereClause = {};
        
        if (id_proyecto) {
            whereClause.id_proyecto = id_proyecto;
        }
        
        if (proveedor) {
            whereClause.proveedor = {
                [models.sequelize.Sequelize.Op.like]: `%${proveedor}%`
            };
        }
        
        if (descripcion) {
            whereClause.descripcion = {
                [models.sequelize.Sequelize.Op.like]: `%${descripcion}%`
            };
        }
        
        if (fecha_inicio && fecha_fin) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.between]: [fecha_inicio, fecha_fin]
            };
        } else if (fecha_inicio) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.gte]: fecha_inicio
            };
        } else if (fecha_fin) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.lte]: fecha_fin
            };
        }
        
        const suministros = await models.Suministros.findAll({
            where: whereClause,
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                }
            ],
            order: [['fecha', 'DESC'], ['folio', 'DESC']]
        });

        res.json({
            success: true,
            data: suministros
        });
    } catch (error) {
        console.error('Error al obtener suministros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener un suministro por ID
const getSuministroById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const suministro = await models.Suministros.findByPk(id, {
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                }
            ]
        });
        
        if (!suministro) {
            return res.status(404).json({
                success: false,
                message: 'Suministro no encontrado'
            });
        }

        res.json({
            success: true,
            data: suministro
        });
    } catch (error) {
        console.error('Error al obtener suministro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear un nuevo suministro
const createSuministro = async (req, res) => {
    try {
        const {
            proveedor,
            folio,
            fecha,
            id_proyecto,
            descripcion,
            cantidad,
            unidad_medida,
            m3_perdidos,
            m3_entregados,
            m3_por_entregar,
            camion,
            salida_planta,
            llegada_obra,
            inicio_descarga,
            termina_descarga,
            salida_obra,
            operador,
            observaciones,
            precio_unitario,
            costo_total,
            estado
        } = req.body;

        // Validaciones básicas
        if (!proveedor || !fecha || !id_proyecto || !descripcion) {
            return res.status(400).json({
                success: false,
                message: 'Los campos proveedor, fecha, proyecto y descripción son obligatorios'
            });
        }

        // Verificar que el proyecto existe
        const proyecto = await models.Proyectos.findByPk(id_proyecto);
        if (!proyecto) {
            return res.status(400).json({
                success: false,
                message: 'El proyecto especificado no existe'
            });
        }

        const nuevoSuministro = await models.Suministros.create({
            proveedor,
            folio,
            fecha,
            id_proyecto,
            descripcion,
            cantidad: cantidad ? parseFloat(cantidad) : null,
            unidad_medida: unidad_medida || 'm³',
            m3_perdidos: m3_perdidos ? parseFloat(m3_perdidos) : null,
            m3_entregados: m3_entregados ? parseFloat(m3_entregados) : null,
            m3_por_entregar: m3_por_entregar ? parseFloat(m3_por_entregar) : null,
            camion,
            salida_planta,
            llegada_obra,
            inicio_descarga,
            termina_descarga,
            salida_obra,
            operador,
            observaciones,
            precio_unitario: precio_unitario ? parseFloat(precio_unitario) : null,
            costo_total: costo_total ? parseFloat(costo_total) : null,
            estado: estado || 'Entregado'
        });

        // Obtener el suministro creado con relaciones
        const suministroCompleto = await models.Suministros.findByPk(nuevoSuministro.id_suministro, {
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'Suministro creado exitosamente',
            data: suministroCompleto
        });
    } catch (error) {
        console.error('Error al crear suministro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar un suministro
const updateSuministro = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const suministro = await models.Suministros.findByPk(id);
        
        if (!suministro) {
            return res.status(404).json({
                success: false,
                message: 'Suministro no encontrado'
            });
        }

        // Verificar que el proyecto existe si se está actualizando
        if (updateData.id_proyecto) {
            const proyecto = await models.Proyectos.findByPk(updateData.id_proyecto);
            if (!proyecto) {
                return res.status(400).json({
                    success: false,
                    message: 'El proyecto especificado no existe'
                });
            }
        }

        // Procesar campos numéricos
        if (updateData.cantidad) updateData.cantidad = parseFloat(updateData.cantidad);
        if (updateData.m3_perdidos) updateData.m3_perdidos = parseFloat(updateData.m3_perdidos);
        if (updateData.m3_entregados) updateData.m3_entregados = parseFloat(updateData.m3_entregados);
        if (updateData.m3_por_entregar) updateData.m3_por_entregar = parseFloat(updateData.m3_por_entregar);
        if (updateData.precio_unitario) updateData.precio_unitario = parseFloat(updateData.precio_unitario);
        if (updateData.costo_total) updateData.costo_total = parseFloat(updateData.costo_total);

        await suministro.update(updateData);

        // Obtener el suministro actualizado con relaciones
        const suministroActualizado = await models.Suministros.findByPk(id, {
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                }
            ]
        });

        res.json({
            success: true,
            message: 'Suministro actualizado exitosamente',
            data: suministroActualizado
        });
    } catch (error) {
        console.error('Error al actualizar suministro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar un suministro
const deleteSuministro = async (req, res) => {
    try {
        const { id } = req.params;
        
        const suministro = await models.Suministros.findByPk(id);
        
        if (!suministro) {
            return res.status(404).json({
                success: false,
                message: 'Suministro no encontrado'
            });
        }

        await suministro.destroy();

        res.json({
            success: true,
            message: 'Suministro eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar suministro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener suministros por proyecto
const getSuministrosByProyecto = async (req, res) => {
    try {
        const { id_proyecto } = req.params;
        
        const suministros = await models.Suministros.findAll({
            where: { id_proyecto },
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                }
            ],
            order: [['fecha', 'DESC'], ['folio', 'DESC']]
        });

        res.json({
            success: true,
            data: suministros
        });
    } catch (error) {
        console.error('Error al obtener suministros del proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de suministros
const getEstadisticasSuministros = async (req, res) => {
    try {
        const { id_proyecto, fecha_inicio, fecha_fin } = req.query;
        
        let whereClause = {};
        
        if (id_proyecto) {
            whereClause.id_proyecto = id_proyecto;
        }
        
        if (fecha_inicio && fecha_fin) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.between]: [fecha_inicio, fecha_fin]
            };
        }

        // Estadísticas por descripción/material
        const estadisticasMateriales = await models.Suministros.findAll({
            where: whereClause,
            attributes: [
                'descripcion',
                [models.sequelize.fn('COUNT', models.sequelize.col('id_suministro')), 'total_registros'],
                [models.sequelize.fn('SUM', models.sequelize.col('cantidad')), 'total_cantidad'],
                [models.sequelize.fn('SUM', models.sequelize.col('m3_entregados')), 'total_entregados'],
                [models.sequelize.fn('SUM', models.sequelize.col('m3_perdidos')), 'total_perdidos']
            ],
            group: ['descripcion'],
            order: [[models.sequelize.fn('COUNT', models.sequelize.col('id_suministro')), 'DESC']],
            raw: true
        });

        // Estadísticas por proveedor
        const estadisticasProveedores = await models.Suministros.findAll({
            where: whereClause,
            attributes: [
                'proveedor',
                [models.sequelize.fn('COUNT', models.sequelize.col('id_suministro')), 'total_registros'],
                [models.sequelize.fn('SUM', models.sequelize.col('cantidad')), 'total_cantidad']
            ],
            group: ['proveedor'],
            order: [[models.sequelize.fn('COUNT', models.sequelize.col('id_suministro')), 'DESC']],
            raw: true
        });

        res.json({
            success: true,
            data: {
                materiales: estadisticasMateriales,
                proveedores: estadisticasProveedores
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas de suministros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getSuministros,
    getSuministroById,
    createSuministro,
    updateSuministro,
    deleteSuministro,
    getSuministrosByProyecto,
    getEstadisticasSuministros
};
