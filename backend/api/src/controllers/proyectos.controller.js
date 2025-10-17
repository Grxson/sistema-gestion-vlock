const models = require('../models');
const { verifyToken } = require('../middlewares/auth');
const { Op } = require('sequelize');

// Obtener todos los proyectos
const getProyectos = async (req, res) => {
    try {
        const proyectos = await models.Proyectos.findAll({
            order: [['nombre', 'ASC']]
        });

        res.json({
            success: true,
            data: proyectos
        });
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener un proyecto por ID
const getProyectoById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proyecto = await models.Proyectos.findByPk(id);
        
        if (!proyecto) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        res.json({
            success: true,
            data: proyecto
        });
    } catch (error) {
        console.error('Error al obtener proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear un nuevo proyecto
const createProyecto = async (req, res) => {
    try {
        const { 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin, 
            estado, 
            responsable, 
            ubicacion 
        } = req.body;

        // Validaciones básicas
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del proyecto es obligatorio'
            });
        }

        // Validar y limpiar fechas
        let fechaInicioLimpia = null;
        let fechaFinLimpia = null;
        
        if (fecha_inicio && fecha_inicio.trim() !== '') {
            const fechaInicio = new Date(fecha_inicio);
            if (!isNaN(fechaInicio.getTime())) {
                fechaInicioLimpia = fecha_inicio;
            }
        }
        
        if (fecha_fin && fecha_fin.trim() !== '') {
            const fechaFin = new Date(fecha_fin);
            if (!isNaN(fechaFin.getTime())) {
                fechaFinLimpia = fecha_fin;
            }
        }

        // Validar fechas si ambas se proporcionan
        if (fechaInicioLimpia && fechaFinLimpia && new Date(fechaInicioLimpia) > new Date(fechaFinLimpia)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }

        const nuevoProyecto = await models.Proyectos.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim() || null,
            fecha_inicio: fechaInicioLimpia,
            fecha_fin: fechaFinLimpia,
            estado: estado || 'Activo',
            responsable: responsable?.trim() || null,
            ubicacion: ubicacion?.trim() || null
        });

        res.status(201).json({
            success: true,
            message: 'Proyecto creado exitosamente',
            data: nuevoProyecto
        });
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar un proyecto
const updateProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            nombre, 
            descripcion, 
            fecha_inicio, 
            fecha_fin, 
            estado, 
            responsable, 
            ubicacion 
        } = req.body;

        const proyecto = await models.Proyectos.findByPk(id);
        
        if (!proyecto) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        // Validar y limpiar fechas
        let fechaInicioLimpia = proyecto.fecha_inicio;
        let fechaFinLimpia = proyecto.fecha_fin;
        
        if (fecha_inicio !== undefined) {
            if (fecha_inicio && fecha_inicio.trim() !== '') {
                const fechaInicio = new Date(fecha_inicio);
                if (!isNaN(fechaInicio.getTime())) {
                    fechaInicioLimpia = fecha_inicio;
                }
            } else {
                fechaInicioLimpia = null;
            }
        }
        
        if (fecha_fin !== undefined) {
            if (fecha_fin && fecha_fin.trim() !== '') {
                const fechaFin = new Date(fecha_fin);
                if (!isNaN(fechaFin.getTime())) {
                    fechaFinLimpia = fecha_fin;
                }
            } else {
                fechaFinLimpia = null;
            }
        }

        // Validar fechas si ambas se proporcionan
        if (fechaInicioLimpia && fechaFinLimpia && new Date(fechaInicioLimpia) > new Date(fechaFinLimpia)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }

        await proyecto.update({
            nombre: nombre?.trim() || proyecto.nombre,
            descripcion: descripcion?.trim() || proyecto.descripcion,
            fecha_inicio: fechaInicioLimpia,
            fecha_fin: fechaFinLimpia,
            estado: estado || proyecto.estado,
            responsable: responsable?.trim() || proyecto.responsable,
            ubicacion: ubicacion?.trim() || proyecto.ubicacion
        });

        res.json({
            success: true,
            message: 'Proyecto actualizado exitosamente',
            data: proyecto
        });
    } catch (error) {
        console.error('Error al actualizar proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Eliminar un proyecto
const deleteProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proyecto = await models.Proyectos.findByPk(id);
        
        if (!proyecto) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        // Verificar si el proyecto tiene registros relacionados
        let gastosRelacionados = 0;
        let presupuestosRelacionados = 0;
        let empleadosRelacionados = 0;
        let suministrosRelacionados = 0;
        
        try {
            // Verificar si tiene gastos relacionados
            if (models.Gasto) {
                gastosRelacionados = await models.Gasto.count({ where: { id_proyecto: id } });
            }
        } catch (error) {
            console.log('No se pudo verificar gastos:', error.message);
        }
        
        try {
            // Verificar si tiene presupuestos relacionados
            if (models.Presupuesto) {
                presupuestosRelacionados = await models.Presupuesto.count({ where: { id_proyecto: id } });
            }
        } catch (error) {
            console.log('No se pudo verificar presupuestos:', error.message);
        }

        try {
            // Verificar si tiene empleados relacionados
            if (models.Empleados || models.empleados) {
                const EmpleadoModel = models.Empleados || models.empleados;
                empleadosRelacionados = await EmpleadoModel.count({ where: { id_proyecto: id } });
            }
        } catch (error) {
            console.log('No se pudo verificar empleados:', error.message);
        }

        try {
            // Verificar si tiene suministros relacionados
            if (models.Suministros) {
                suministrosRelacionados = await models.Suministros.count({ where: { id_proyecto: id } });
            }
        } catch (error) {
            console.log('No se pudo verificar suministros:', error.message);
        }
        
        console.log('Gastos relacionados:', gastosRelacionados);
        console.log('Presupuestos relacionados:', presupuestosRelacionados);
        console.log('Empleados relacionados:', empleadosRelacionados);
        console.log('Suministros relacionados:', suministrosRelacionados);
        
        if (gastosRelacionados > 0 || presupuestosRelacionados > 0 || empleadosRelacionados > 0 || suministrosRelacionados > 0) {
            let mensaje = 'No se puede eliminar el proyecto porque tiene los siguientes registros asociados: ';
            let asociados = [];
            
            if (gastosRelacionados > 0) {
                asociados.push(`${gastosRelacionados} gasto(s)`);
            }
            if (presupuestosRelacionados > 0) {
                asociados.push(`${presupuestosRelacionados} presupuesto(s)`);
            }
            if (empleadosRelacionados > 0) {
                asociados.push(`${empleadosRelacionados} empleado(s)`);
            }
            if (suministrosRelacionados > 0) {
                asociados.push(`${suministrosRelacionados} suministro(s)`);
            }
            
            mensaje += asociados.join(', ');
            
            return res.status(400).json({
                success: false,
                message: mensaje
            });
        }

        await proyecto.destroy();

        res.json({
            success: true,
            message: 'Proyecto eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener proyectos activos (para selectores)
const getProyectosActivos = async (req, res) => {
    try {
        
        const proyectos = await models.Proyectos.findAll({
            where: {
                estado: 'Activo'
            },
            attributes: ['id_proyecto', 'nombre', 'ubicacion'],
            order: [['nombre', 'ASC']]
        });


        res.json({
            success: true,
            data: proyectos
        });
    } catch (error) {
        console.error('❌ Error al obtener proyectos activos:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
};

// Buscar proyectos por nombre
const searchProyectos = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'El parámetro de búsqueda es requerido'
            });
        }

        const searchQuery = q.trim();

        const proyectos = await models.Proyectos.findAll({
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
                    },
                    {
                        responsable: {
                            [Op.like]: `%${searchQuery}%`
                        }
                    }
                ]
            },
            order: [['nombre', 'ASC']],
            limit: 20
        });

        res.json({
            success: true,
            message: 'Búsqueda de proyectos completada',
            data: proyectos
        });
    } catch (error) {
        console.error('Error al buscar proyectos:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener estadísticas de un proyecto
const getEstadisticasProyecto = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proyecto = await models.Proyectos.findByPk(id);
        
        if (!proyecto) {
            return res.status(404).json({
                success: false,
                message: 'Proyecto no encontrado'
            });
        }

        // Obtener estadísticas del proyecto
        const [gastos, ingresos, suministros] = await Promise.all([
            models.Gastos.findAll({
                where: { id_proyecto: id },
                attributes: [
                    [models.sequelize.fn('COUNT', models.sequelize.col('id_gasto')), 'total_gastos'],
                    [models.sequelize.fn('SUM', models.sequelize.col('monto')), 'total_monto_gastos']
                ],
                raw: true
            }),
            models.Ingresos.findAll({
                where: { id_proyecto: id },
                attributes: [
                    [models.sequelize.fn('COUNT', models.sequelize.col('id_ingreso')), 'total_ingresos'],
                    [models.sequelize.fn('SUM', models.sequelize.col('monto')), 'total_monto_ingresos']
                ],
                raw: true
            }),
            models.Suministros.findAll({
                where: { id_proyecto: id },
                attributes: [
                    [models.sequelize.fn('COUNT', models.sequelize.col('id_suministro')), 'total_suministros']
                ],
                raw: true
            })
        ]);

        const estadisticas = {
            proyecto,
            gastos: {
                total: gastos[0]?.total_gastos || 0,
                monto_total: parseFloat(gastos[0]?.total_monto_gastos) || 0
            },
            ingresos: {
                total: ingresos[0]?.total_ingresos || 0,
                monto_total: parseFloat(ingresos[0]?.total_monto_ingresos) || 0
            },
            suministros: {
                total: suministros[0]?.total_suministros || 0
            }
        };

        res.json({
            success: true,
            data: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas del proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getProyectos,
    getProyectoById,
    createProyecto,
    updateProyecto,
    deleteProyecto,
    getProyectosActivos,
    searchProyectos,
    getEstadisticasProyecto
};
