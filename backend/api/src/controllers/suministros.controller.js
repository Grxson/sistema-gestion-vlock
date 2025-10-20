const models = require('../models');
const { verifyToken } = require('../middlewares/auth');

// Obtener todos los suministros
const getSuministros = async (req, res) => {
    try {
        const { id_proyecto, proveedor, nombre, fecha_inicio, fecha_fin, tipo_categoria } = req.query;
        
        let whereClause = {};
        let includeClause = [
            {
                model: models.Proyectos,
                as: 'proyecto',
                attributes: ['nombre', 'ubicacion']
            },
            {
                model: models.Proveedores,
                as: 'proveedor',
                attributes: ['id_proveedor', 'nombre', 'tipo_proveedor', 'telefono']
            },
            {
                model: models.Categorias_suministro,
                as: 'categoria',
                attributes: ['id_categoria', 'nombre', 'tipo', 'color'],
                where: {} // Se llenará condicionalmente
            },
            {
                model: models.Unidades_medida,
                as: 'unidadMedida',
                attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
            }
        ];
        
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

        // Filtro por tipo de categoría
        if (tipo_categoria && ['Proyecto', 'Administrativo'].includes(tipo_categoria)) {
            includeClause[2].where.tipo = tipo_categoria;
        } else {
            // Si no hay filtro específico, eliminar el where vacío
            delete includeClause[2].where;
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
            include: includeClause,
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
                    as: 'proveedor',
                    attributes: ['id_proveedor', 'nombre', 'tipo_proveedor', 'telefono']
                },
                {
                    model: models.Categorias_suministro,
                    as: 'categoria',
                    attributes: ['id_categoria', 'nombre', 'tipo', 'color']
                },
                {
                    model: models.Unidades_medida,
                    as: 'unidadMedida',
                    attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
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
    
    // Solo verificar duplicados por folio
    if (data.folio && data.folio.trim() !== '') {
        const whereConditionFolio = {
            folio: data.folio.trim()
        };
        
        if (excludeId) {
            whereConditionFolio.id_suministro = { [models.sequelize.Sequelize.Op.ne]: excludeId };
        }

        const duplicateByFolio = await models.Suministros.findOne({
            where: whereConditionFolio
        });

        if (duplicateByFolio) {
            return {
                isDuplicate: true,
                type: 'folio',
                existing: duplicateByFolio,
                message: `Ya existe un suministro con el folio "${data.folio}"`
            };
        }
    }

    // Si no hay folio o no hay duplicados, permitir el registro
    return { isDuplicate: false };
};

const createSuministro = async (req, res) => {
    try {
        const {
            folio,
            fecha,
            id_proyecto,
            id_proveedor,
            metodo_pago,
            tipo_suministro,
            nombre,
            codigo_producto,
            descripcion_detallada,
            cantidad,
            id_unidad_medida,
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
        if (!id_proveedor || !fecha || !id_proyecto || !nombre) {
            return res.status(400).json({
                success: false,
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
            folio,
            id_proyecto,
            tipo_suministro,
            proveedor
        });

        if (duplicates.length > 0) {
            const duplicateInfo = duplicates.map(dup => ({
                id: dup.id_suministro,
                nombre: dup.nombre,
                proyecto: dup.proyecto?.nombre || 'Sin proyecto',
                proveedor: dup.proveedor?.nombre || 'Sin proveedor',
                codigo_producto: dup.codigo_producto,
                folio: dup.folio
            }));

            return res.status(409).json({
                success: false,
                message: 'Posible duplicado detectado',
                duplicates: duplicateInfo,
                suggestion: 'Verifica si alguno de estos suministros coincide con el que intentas crear'
            });
        }

        const nuevoSuministro = await models.Suministros.create({
            folio,
            fecha,
            id_proyecto,
            id_proveedor,
            metodo_pago: metodo_pago || 'Efectivo',
            tipo_suministro: tipo_suministro || 'Material',
            nombre,
            codigo_producto,
            descripcion_detallada,
            cantidad: cantidad ? parseFloat(cantidad) : null,
            id_unidad_medida: id_unidad_medida,
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
            subtotal: (cantidad && precio_unitario) ? parseFloat(cantidad) * Math.round(parseFloat(precio_unitario) * 100) / 100 : null,
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
                },
                {
                    model: models.Unidades_medida,
                    as: 'unidadMedida',
                    attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
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

// Crear múltiples suministros en una sola transacción
const createMultipleSuministros = async (req, res) => {
    try {
        const {
            // Información común del recibo
            info_recibo: {
                folio,
                fecha,
                id_proyecto,
                id_proveedor,
                metodo_pago,
                vehiculo_transporte,
                operador_responsable,
                hora_salida,
                hora_llegada,
                hora_inicio_descarga,
                hora_fin_descarga,
                observaciones_generales
            },
            // Array de suministros
            suministros,
            // Información del IVA y totales
            include_iva = true,
            totales = null
        } = req.body;

        // Función helper para calcular costo total con o sin IVA
        const calcularCostoTotal = (cantidad, precioUnitario, incluirIva = true) => {
            if (!cantidad || !precioUnitario) return null;
            const subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
            return incluirIva ? subtotal * 1.16 : subtotal;
        };

        // Validaciones básicas
        if (!id_proveedor || !fecha || !id_proyecto) {
            return res.status(400).json({
                success: false,
            });
        }

        if (!suministros || !Array.isArray(suministros) || suministros.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un suministro'
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

        // Validar cada suministro
        for (let i = 0; i < suministros.length; i++) {
            const suministro = suministros[i];
            if (!suministro.nombre || !suministro.cantidad || !suministro.id_unidad_medida || !suministro.precio_unitario) {
                return res.status(400).json({
                    success: false,
                    message: `Suministro ${i + 1}: Los campos nombre, cantidad, unidad de medida y precio son obligatorios`
                });
            }

            // Validar que la categoría existe (si se proporciona)
            if (suministro.id_categoria_suministro) {
                const categoriaExists = await models.Categorias_suministro.findByPk(suministro.id_categoria_suministro);
                if (!categoriaExists) {
                    return res.status(400).json({
                        success: false,
                        message: `Suministro ${i + 1}: La categoría especificada no existe`
                    });
                }
            }

            // Validar que la unidad de medida existe
            if (suministro.id_unidad_medida) {
                const unidadExists = await models.Unidades_medida.findByPk(suministro.id_unidad_medida);
                if (!unidadExists) {
                    return res.status(400).json({
                        success: false,
                        message: `Suministro ${i + 1}: La unidad de medida especificada no existe`
                    });
                }
            }
        }

        // Usar transacción para crear todos los suministros
        const transaction = await models.sequelize.transaction();
        
        try {
            const results = [];
            const createdIds = [];

            for (const suministroData of suministros) {
                // Si se proporciona id_suministro, intentamos actualizar; si no, creamos
                if (suministroData.id_suministro) {
                    const existente = await models.Suministros.findByPk(suministroData.id_suministro, { transaction });
                    if (existente) {
                        // Sanear entrada para evitar sobreescrituras con strings vacíos
                        const san = { ...suministroData };
                        Object.keys(san).forEach(key => {
                            const val = san[key];
                            if (typeof val === 'string' && val.trim() === '') {
                                delete san[key];
                            }
                        });

                        // Parsear valores numéricos solo si están presentes
                        if (Object.prototype.hasOwnProperty.call(san, 'cantidad')) {
                            san.cantidad = san.cantidad === null || san.cantidad === undefined ? null : parseFloat(san.cantidad);
                        }
                        if (Object.prototype.hasOwnProperty.call(san, 'm3_perdidos')) {
                            san.m3_perdidos = san.m3_perdidos === null || san.m3_perdidos === undefined ? null : parseFloat(san.m3_perdidos);
                        }
                        if (Object.prototype.hasOwnProperty.call(san, 'm3_entregados')) {
                            san.m3_entregados = san.m3_entregados === null || san.m3_entregados === undefined ? null : parseFloat(san.m3_entregados);
                        }
                        if (Object.prototype.hasOwnProperty.call(san, 'm3_por_entregar')) {
                            san.m3_por_entregar = san.m3_por_entregar === null || san.m3_por_entregar === undefined ? null : parseFloat(san.m3_por_entregar);
                        }
                        if (Object.prototype.hasOwnProperty.call(san, 'precio_unitario')) {
                            san.precio_unitario = san.precio_unitario === null || san.precio_unitario === undefined ? null : Math.round(parseFloat(san.precio_unitario) * 100) / 100;
                        }
                        if (Object.prototype.hasOwnProperty.call(san, 'costo_total')) {
                            san.costo_total = san.costo_total === null || san.costo_total === undefined ? null : parseFloat(san.costo_total);
                        }

                        const updatePayload = {
                            metodo_pago: metodo_pago || existente.metodo_pago,
                            tipo_suministro: san.tipo_suministro !== undefined ? san.tipo_suministro : existente.tipo_suministro,
                            id_categoria_suministro: san.id_categoria_suministro !== undefined ? san.id_categoria_suministro : existente.id_categoria_suministro,
                            nombre: san.nombre !== undefined ? san.nombre : existente.nombre,
                            codigo_producto: san.codigo_producto !== undefined ? san.codigo_producto : existente.codigo_producto,
                            descripcion_detallada: san.descripcion_detallada !== undefined ? san.descripcion_detallada : existente.descripcion_detallada,
                            cantidad: Object.prototype.hasOwnProperty.call(san, 'cantidad') ? san.cantidad : existente.cantidad,
                            id_unidad_medida: san.id_unidad_medida !== undefined ? san.id_unidad_medida : existente.id_unidad_medida,
                            m3_perdidos: Object.prototype.hasOwnProperty.call(san, 'm3_perdidos') ? san.m3_perdidos : existente.m3_perdidos,
                            m3_entregados: Object.prototype.hasOwnProperty.call(san, 'm3_entregados') ? san.m3_entregados : existente.m3_entregados,
                            m3_por_entregar: Object.prototype.hasOwnProperty.call(san, 'm3_por_entregar') ? san.m3_por_entregar : existente.m3_por_entregar,
                            precio_unitario: Object.prototype.hasOwnProperty.call(san, 'precio_unitario') ? san.precio_unitario : existente.precio_unitario,
                            subtotal: (Object.prototype.hasOwnProperty.call(san, 'cantidad') && Object.prototype.hasOwnProperty.call(san, 'precio_unitario')) ? 
                                san.cantidad * san.precio_unitario : 
                                ((Object.prototype.hasOwnProperty.call(san, 'cantidad') || Object.prototype.hasOwnProperty.call(san, 'precio_unitario')) ? 
                                    ((Object.prototype.hasOwnProperty.call(san, 'cantidad') ? san.cantidad : existente.cantidad) * 
                                     (Object.prototype.hasOwnProperty.call(san, 'precio_unitario') ? san.precio_unitario : existente.precio_unitario)) : 
                                    existente.subtotal
                                ),
                            costo_total: Object.prototype.hasOwnProperty.call(san, 'costo_total') ? san.costo_total : (
                                (Object.prototype.hasOwnProperty.call(san, 'cantidad') && Object.prototype.hasOwnProperty.call(san, 'precio_unitario')) ? 
                                calcularCostoTotal(san.cantidad, san.precio_unitario, include_iva) : existente.costo_total
                            ),
                            include_iva: include_iva, // Guardar estado del IVA
                            estado: san.estado !== undefined ? san.estado : existente.estado,
                            observaciones: Object.prototype.hasOwnProperty.call(san, 'observaciones') ? san.observaciones : existente.observaciones
                        };

                        await existente.update(updatePayload, { transaction });
                        results.push({ id_suministro: existente.id_suministro, action: 'updated', ok: true });
                    } else {
                        // No existe el id, crear nuevo
                        const creado = await models.Suministros.create({
                            folio,
                            fecha,
                            id_proyecto,
                            id_proveedor,
                            metodo_pago: metodo_pago || 'Efectivo',
                            vehiculo_transporte,
                            operador_responsable,
                            hora_salida,
                            hora_llegada,
                            hora_inicio_descarga,
                            hora_fin_descarga,
                            observaciones: observaciones_generales,
                            tipo_suministro: suministroData.tipo_suministro || 'Material',
                            id_categoria_suministro: suministroData.id_categoria_suministro, // Respetar selección del usuario
                            nombre: suministroData.nombre,
                            codigo_producto: suministroData.codigo_producto,
                            descripcion_detallada: suministroData.descripcion_detallada,
                            cantidad: parseFloat(suministroData.cantidad),
                            id_unidad_medida: suministroData.id_unidad_medida, // Respetar selección del usuario
                            m3_perdidos: suministroData.m3_perdidos ? parseFloat(suministroData.m3_perdidos) : null,
                            m3_entregados: suministroData.m3_entregados ? parseFloat(suministroData.m3_entregados) : null,
                            m3_por_entregar: suministroData.m3_por_entregar ? parseFloat(suministroData.m3_por_entregar) : null,
                            precio_unitario: suministroData.precio_unitario ? Math.round(parseFloat(suministroData.precio_unitario) * 100) / 100 : null,
                            subtotal: (suministroData.cantidad && suministroData.precio_unitario) ? parseFloat(suministroData.cantidad) * Math.round(parseFloat(suministroData.precio_unitario) * 100) / 100 : null,
                            costo_total: calcularCostoTotal(suministroData.cantidad, suministroData.precio_unitario, include_iva),
                            include_iva: include_iva, // Guardar estado del IVA
                            estado: suministroData.estado || 'Pendiente'
                        }, { transaction });

                        createdIds.push(creado.id_suministro);
                        results.push({ id_suministro: creado.id_suministro, action: 'created', ok: true });
                    }
                } else {
                    // Crear nuevo suministro
                    console.log('Datos para crear suministro:', {
                        suministroData,
                        id_categoria_procesado: suministroData.id_categoria_suministro,
                        tipo_suministro_procesado: suministroData.tipo_suministro || 'Material'
                    });
                    
                    // Debug: Log de la unidad de medida recibida (solo en desarrollo)
                    if (process.env.NODE_ENV === 'development') {
                        console.log('🔍 Backend Debug unidad_medida:', {
                            suministro: suministroData.nombre,
                            id_unidad_medida_recibida: suministroData.id_unidad_medida,
                            tipo: typeof suministroData.id_unidad_medida
                        });
                    }
                    
                    const datosCreacion = {
                        folio,
                        fecha,
                        id_proyecto,
                        id_proveedor,
                        metodo_pago: metodo_pago || 'Efectivo',
                        vehiculo_transporte,
                        operador_responsable,
                        hora_salida,
                        hora_llegada,
                        hora_inicio_descarga,
                        hora_fin_descarga,
                        observaciones: observaciones_generales,
                        tipo_suministro: suministroData.tipo_suministro || 'Material',
                        id_categoria_suministro: suministroData.id_categoria_suministro, // Respetar selección del usuario
                        nombre: suministroData.nombre,
                        codigo_producto: suministroData.codigo_producto,
                        descripcion_detallada: suministroData.descripcion_detallada,
                        cantidad: parseFloat(suministroData.cantidad),
                        id_unidad_medida: suministroData.id_unidad_medida, // Respetar selección del usuario
                        m3_perdidos: suministroData.m3_perdidos ? parseFloat(suministroData.m3_perdidos) : null,
                        m3_entregados: suministroData.m3_entregados ? parseFloat(suministroData.m3_entregados) : null,
                        m3_por_entregar: suministroData.m3_por_entregar ? parseFloat(suministroData.m3_por_entregar) : null,
                        precio_unitario: suministroData.precio_unitario ? Math.round(parseFloat(suministroData.precio_unitario) * 100) / 100 : null,
                        subtotal: (suministroData.cantidad && suministroData.precio_unitario) ? parseFloat(suministroData.cantidad) * Math.round(parseFloat(suministroData.precio_unitario) * 100) / 100 : null,
                        costo_total: calcularCostoTotal(suministroData.cantidad, suministroData.precio_unitario, include_iva),
                        include_iva: include_iva, // Guardar estado del IVA
                        estado: suministroData.estado || 'Pendiente'
                    };
                    
                    console.log('Datos completos para crear:', datosCreacion);
                    
                    const creado = await models.Suministros.create(datosCreacion, { transaction });

                    createdIds.push(creado.id_suministro);
                    results.push({ id_suministro: creado.id_suministro, action: 'created', ok: true });
                }
            }

            // Confirmar la transacción
            await transaction.commit();

            // Obtener los suministros involucrados con relaciones
            const suministrosCompletos = await models.Suministros.findAll({
                where: {
                    id_suministro: createdIds.length > 0 ? createdIds : []
                },
                include: [
                    {
                        model: models.Proyectos,
                        as: 'proyecto',
                        attributes: ['nombre', 'ubicacion']
                    },
                    {
                        model: models.Proveedores,
                        as: 'proveedor',
                        attributes: ['nombre', 'tipo_proveedor', 'telefono']
                    },
                    {
                        model: models.Unidades_medida,
                        as: 'unidadMedida',
                        attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
                    }
                ]
            });

            res.status(200).json({
                success: true,
                message: `Operación completada`,
                data: {
                    results,
                    created: suministrosCompletos,
                    folio
                }
            });

        } catch (error) {
            // Revertir la transacción en caso de error
            await transaction.rollback();
            throw error;
        }

    } catch (error) {
        console.error('Error al crear múltiples suministros:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Actualizar un suministro
const updateSuministro = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const { include_iva = true } = updateData; // Extraer include_iva del body
        
        // Función helper para calcular costo total con o sin IVA
        const calcularCostoTotal = (cantidad, precioUnitario, incluirIva = true) => {
            if (!cantidad || !precioUnitario) return null;
            const subtotal = parseFloat(cantidad) * parseFloat(precioUnitario);
            return incluirIva ? subtotal * 1.16 : subtotal;
        };

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
        if (updateData.nombre || updateData.codigo_producto || updateData.folio) {
            const dataToCheck = {
                nombre: updateData.nombre || suministro.nombre,
                codigo_producto: updateData.codigo_producto || suministro.codigo_producto,
                folio: updateData.folio || suministro.folio,
                id_proyecto: updateData.id_proyecto || suministro.id_proyecto,
                tipo_suministro: updateData.tipo_suministro || suministro.tipo_suministro,
                id_proveedor: updateData.id_proveedor || suministro.id_proveedor
            };

            const duplicates = await checkForDuplicates(dataToCheck, id);

            if (duplicates.length > 0) {
                const duplicateInfo = duplicates.map(dup => ({
                    id: dup.id_suministro,
                    nombre: dup.nombre,
                    proyecto: dup.proyecto?.nombre || 'Sin proyecto',
                    proveedor: dup.proveedor?.nombre || 'Sin proveedor',
                    codigo_producto: dup.codigo_producto,
                    folio: dup.folio
                }));

                return res.status(409).json({
                    success: false,
                    message: 'Posible duplicado detectado',
                    duplicates: duplicateInfo,
                    suggestion: 'Verifica si alguno de estos suministros coincide con los cambios que intentas hacer'
                });
            }
        }

        // Sanear datos: eliminar campos vacíos que puedan sobrescribir valores existentes
        Object.keys(updateData).forEach(key => {
            const val = updateData[key];
            if (typeof val === 'string' && val.trim() === '') {
                // eliminar campos enviados como cadena vacía
                delete updateData[key];
            }
        });
        
        // Eliminar include_iva del updateData ya que no es un campo de la tabla
        delete updateData.include_iva;

        // Procesar campos numéricos solo si están presentes
        if (Object.prototype.hasOwnProperty.call(updateData, 'cantidad')) {
            updateData.cantidad = updateData.cantidad === null || updateData.cantidad === undefined ? null : parseFloat(updateData.cantidad);
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'm3_perdidos')) {
            updateData.m3_perdidos = updateData.m3_perdidos === null || updateData.m3_perdidos === undefined ? null : parseFloat(updateData.m3_perdidos);
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'm3_entregados')) {
            updateData.m3_entregados = updateData.m3_entregados === null || updateData.m3_entregados === undefined ? null : parseFloat(updateData.m3_entregados);
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'm3_por_entregar')) {
            updateData.m3_por_entregar = updateData.m3_por_entregar === null || updateData.m3_por_entregar === undefined ? null : parseFloat(updateData.m3_por_entregar);
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'precio_unitario')) {
            updateData.precio_unitario = updateData.precio_unitario === null || updateData.precio_unitario === undefined ? null : Math.round(parseFloat(updateData.precio_unitario) * 100) / 100;
        }
        if (Object.prototype.hasOwnProperty.call(updateData, 'costo_total')) {
            updateData.costo_total = updateData.costo_total === null || updateData.costo_total === undefined ? null : parseFloat(updateData.costo_total);
        }

        // Calcular costo_total automáticamente si no viene en la petición pero se tienen cantidad y precio_unitario
        const cantidadFinal = updateData.cantidad !== undefined ? updateData.cantidad : suministro.cantidad;
        const precioFinal = updateData.precio_unitario !== undefined ? updateData.precio_unitario : suministro.precio_unitario;
        
        // Calcular subtotal automáticamente
        if (cantidadFinal && precioFinal) {
            updateData.subtotal = cantidadFinal * precioFinal;
        }
        
        if (!Object.prototype.hasOwnProperty.call(updateData, 'costo_total') && cantidadFinal && precioFinal) {
            updateData.costo_total = calcularCostoTotal(cantidadFinal, precioFinal, include_iva);
        } else if (Object.prototype.hasOwnProperty.call(updateData, 'cantidad') || Object.prototype.hasOwnProperty.call(updateData, 'precio_unitario')) {
            // Si se actualizan cantidad o precio_unitario, recalcular costo_total
            if (cantidadFinal && precioFinal) {
                updateData.costo_total = calcularCostoTotal(cantidadFinal, precioFinal, include_iva);
            }
        }
        
        // Guardar el estado del IVA
        updateData.include_iva = include_iva;

        await suministro.update(updateData);

        // Obtener el suministro actualizado con relaciones
        const suministroActualizado = await models.Suministros.findByPk(id, {
            include: [
                {
                    model: models.Proyectos,
                    as: 'proyecto',
                    attributes: ['nombre', 'ubicacion']
                },
                {
                    model: models.Unidades_medida,
                    as: 'unidadMedida',
                    attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
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
                },
                {
                    model: models.Unidades_medida,
                    as: 'unidadMedida',
                    attributes: ['id_unidad', 'nombre', 'simbolo', 'descripcion']
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

// Obtener estadísticas de suministros por tipo de categoría
const getEstadisticasPorTipo = async (req, res) => {
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
        } else if (fecha_inicio) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.gte]: fecha_inicio
            };
        } else if (fecha_fin) {
            whereClause.fecha = {
                [models.sequelize.Sequelize.Op.lte]: fecha_fin
            };
        }

        // Usar consulta SQL raw para mayor control
        const query = `
            SELECT 
                c.tipo as tipo_categoria,
                COUNT(s.id_suministro) as total_registros,
                COALESCE(SUM(s.costo_total), 0) as total_costo,
                COALESCE(AVG(s.costo_total), 0) as promedio_costo
            FROM suministros s
            LEFT JOIN categorias_suministro c ON s.id_categoria_suministro = c.id_categoria
            WHERE 1=1
            ${id_proyecto ? `AND s.id_proyecto = ${parseInt(id_proyecto)}` : ''}
            ${fecha_inicio ? `AND s.fecha >= '${fecha_inicio}'` : ''}
            ${fecha_fin ? `AND s.fecha <= '${fecha_fin}'` : ''}
            GROUP BY c.tipo
            ORDER BY total_costo DESC
        `;

        const [estadisticasTipo] = await models.sequelize.query(query, {
            type: models.sequelize.QueryTypes.SELECT
        });

        // Asegurar que siempre retornemos un array
        const estadisticasArray = Array.isArray(estadisticasTipo) ? estadisticasTipo : [estadisticasTipo].filter(Boolean);

        res.json({
            success: true,
            data: {
                por_tipo: estadisticasArray
            }
        });
    } catch (error) {
        console.error('Error al obtener estadísticas por tipo:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

module.exports = {
    getSuministros,
    getSuministroById,
    createSuministro,
    createMultipleSuministros,
    updateSuministro,
    deleteSuministro,
    getSuministrosByProyecto,
    getEstadisticasSuministros,
    getEstadisticasPorTipo
};
