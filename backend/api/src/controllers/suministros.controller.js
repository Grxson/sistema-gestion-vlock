const models = require('../models');
const { verifyToken } = require('../middlewares/auth');

// Obtener todos los suministros
const getSuministros = async (req, res) => {
    try {
        const { id_proyecto, fecha_inicio, fecha_fin, proveedor, nombre } = req.query;
        
        let whereClause = {};
        
        if (id_proyecto) {
            whereClause.id_proyecto = id_proyecto;
        }
        
        if (proveedor) {
            whereClause.proveedor = {
                [models.sequelize.Sequelize.Op.like]: `%${proveedor}%`
            };
        }
        
        if (nombre) {
            whereClause.nombre = {
                [models.sequelize.Sequelize.Op.like]: `%${nombre}%`
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
                },
                {
                    model: models.Proveedores,
                    as: 'proveedorInfo',
                    attributes: ['id_proveedor', 'nombre', 'tipo_proveedor', 'telefono']
                }
            ],
            order: [['fecha', 'DESC'], ['folio', 'DESC']]
        });

        // Convertir decimales a números para evitar problemas de formateo
        const suministrosFormateados = suministros.map(suministro => {
            const data = suministro.toJSON();
            if (data.cantidad) {
                data.cantidad = Math.round(parseFloat(data.cantidad) * 100) / 100;
            }
            if (data.precio_unitario) {
                data.precio_unitario = Math.round(parseFloat(data.precio_unitario) * 100) / 100;
            }
            if (data.m3_perdidos) {
                data.m3_perdidos = Math.round(parseFloat(data.m3_perdidos) * 100) / 100;
            }
            return data;
        });

        res.json({
            success: true,
            data: suministrosFormateados
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
                },
                {
                    model: models.Proveedores,
                    as: 'proveedorInfo',
                    attributes: ['id_proveedor', 'nombre', 'tipo_proveedor', 'telefono']
                }
            ]
        });
        
        if (!suministro) {
            return res.status(404).json({
                success: false,
                message: 'Suministro no encontrado'
            });
        }

        // Convertir decimales a números para evitar problemas de formateo
        const data = suministro.toJSON();
        if (data.cantidad) {
            data.cantidad = parseFloat(data.cantidad);
        }
        if (data.precio_unitario) {
            data.precio_unitario = parseFloat(data.precio_unitario);
        }
        if (data.m3_perdidos) {
            data.m3_perdidos = parseFloat(data.m3_perdidos);
        }

        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        console.error('Error al obtener suministro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Función auxiliar para verificar duplicados
const checkForDuplicates = async (data, excludeId = null) => {
    console.log('🔍 Verificando duplicados para:', data);
    
    // Solo verificar duplicados por folio_proveedor
    if (data.folio_proveedor && data.folio_proveedor.trim() !== '') {
        const whereConditionFolio = {
            folio_proveedor: data.folio_proveedor.trim()
        };
        
        if (excludeId) {
            whereConditionFolio.id = { [Op.ne]: excludeId };
        }

        const duplicateByFolio = await Suministros.findOne({
            where: whereConditionFolio
        });

        if (duplicateByFolio) {
            return {
                isDuplicate: true,
                type: 'folio',
                existing: duplicateByFolio,
                message: `Ya existe un suministro con el folio "${data.folio_proveedor}"`
            };
        }
    }

    // Si no hay folio o no hay duplicados, permitir el registro
    return { isDuplicate: false };
};

const createSuministro = async (req, res) => {
    try {
        const {
            proveedor,
            id_proveedor,
            folio,
            folio_proveedor,
            fecha,
            id_proyecto,
            tipo_suministro,
            nombre,
            codigo_producto,
            descripcion_detallada,
            cantidad,
            unidad_medida,
            m3_perdidos,
            m3_entregados,
            m3_por_entregar,
            vehiculo_transporte,
            operador_responsable,
            hora_salida,
            hora_llegada,
            hora_inicio_descarga,
            hora_fin_descarga,
            observaciones,
            precio_unitario,
            costo_total,
            estado
        } = req.body;

        // Validaciones básicas
        if (!proveedor || !fecha || !id_proyecto || !nombre) {
            return res.status(400).json({
                success: false,
                message: 'Los campos proveedor, fecha, proyecto y nombre son obligatorios'
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

        // Verificar duplicados
        const duplicates = await checkForDuplicates({
            nombre,
            codigo_producto,
            folio_proveedor,
            id_proyecto,
            tipo_suministro,
            id_proveedor,
            proveedor
        });

        if (duplicates.length > 0) {
            const duplicateInfo = duplicates.map(dup => ({
                id: dup.id_suministro,
                nombre: dup.nombre,
                proyecto: dup.proyecto?.nombre || 'Sin proyecto',
                proveedor: dup.proveedor || dup.proveedorInfo?.nombre || 'Sin proveedor',
                codigo_producto: dup.codigo_producto,
                folio_proveedor: dup.folio_proveedor
            }));

            return res.status(409).json({
                success: false,
                message: 'Posible duplicado detectado',
                duplicates: duplicateInfo,
                suggestion: 'Verifica si alguno de estos suministros coincide con el que intentas crear'
            });
        }

        const nuevoSuministro = await models.Suministros.create({
            proveedor,
            id_proveedor,
            folio,
            folio_proveedor,
            fecha,
            id_proyecto,
            tipo_suministro: tipo_suministro || 'Material',
            nombre,
            codigo_producto,
            descripcion_detallada,
            cantidad: cantidad ? parseFloat(cantidad) : null,
            unidad_medida: unidad_medida || 'pz',
            m3_perdidos: m3_perdidos ? parseFloat(m3_perdidos) : null,
            m3_entregados: m3_entregados ? parseFloat(m3_entregados) : null,
            m3_por_entregar: m3_por_entregar ? parseFloat(m3_por_entregar) : null,
            vehiculo_transporte,
            operador_responsable,
            hora_salida,
            hora_llegada,
            hora_inicio_descarga,
            hora_fin_descarga,
            observaciones,
            precio_unitario: precio_unitario ? Math.round(parseFloat(precio_unitario) * 100) / 100 : null,
            costo_total: costo_total ? parseFloat(costo_total) : null,
            estado: estado || 'Pendiente'
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

        // Verificar duplicados si se están actualizando campos clave
        if (updateData.nombre || updateData.codigo_producto || updateData.folio_proveedor) {
            const dataToCheck = {
                nombre: updateData.nombre || suministro.nombre,
                codigo_producto: updateData.codigo_producto || suministro.codigo_producto,
                folio_proveedor: updateData.folio_proveedor || suministro.folio_proveedor,
                id_proyecto: updateData.id_proyecto || suministro.id_proyecto,
                tipo_suministro: updateData.tipo_suministro || suministro.tipo_suministro,
                id_proveedor: updateData.id_proveedor || suministro.id_proveedor,
                proveedor: updateData.proveedor || suministro.proveedor
            };

            const duplicates = await checkForDuplicates(dataToCheck, id);

            if (duplicates.length > 0) {
                const duplicateInfo = duplicates.map(dup => ({
                    id: dup.id_suministro,
                    nombre: dup.nombre,
                    proyecto: dup.proyecto?.nombre || 'Sin proyecto',
                    proveedor: dup.proveedor || dup.proveedorInfo?.nombre || 'Sin proveedor',
                    codigo_producto: dup.codigo_producto,
                    folio_proveedor: dup.folio_proveedor
                }));

                return res.status(409).json({
                    success: false,
                    message: 'Posible duplicado detectado',
                    duplicates: duplicateInfo,
                    suggestion: 'Verifica si alguno de estos suministros coincide con los cambios que intentas hacer'
                });
            }
        }

        // Procesar campos numéricos
        if (updateData.cantidad) updateData.cantidad = parseFloat(updateData.cantidad);
        if (updateData.m3_perdidos) updateData.m3_perdidos = parseFloat(updateData.m3_perdidos);
        if (updateData.m3_entregados) updateData.m3_entregados = parseFloat(updateData.m3_entregados);
        if (updateData.m3_por_entregar) updateData.m3_por_entregar = parseFloat(updateData.m3_por_entregar);
        if (updateData.precio_unitario) updateData.precio_unitario = Math.round(parseFloat(updateData.precio_unitario) * 100) / 100;
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
