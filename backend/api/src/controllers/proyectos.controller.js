const models = require('../models');
const { verifyToken } = require('../middlewares/auth');

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

        // Validar fechas si se proporcionan
        if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }

        const nuevoProyecto = await models.Proyectos.create({
            nombre: nombre.trim(),
            descripcion: descripcion?.trim(),
            fecha_inicio,
            fecha_fin,
            estado: estado || 'Activo',
            responsable: responsable?.trim(),
            ubicacion: ubicacion?.trim()
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

        // Validar fechas si se proporcionan
        if (fecha_inicio && fecha_fin && new Date(fecha_inicio) > new Date(fecha_fin)) {
            return res.status(400).json({
                success: false,
                message: 'La fecha de inicio no puede ser posterior a la fecha de fin'
            });
        }

        await proyecto.update({
            nombre: nombre?.trim() || proyecto.nombre,
            descripcion: descripcion?.trim() || proyecto.descripcion,
            fecha_inicio: fecha_inicio || proyecto.fecha_inicio,
            fecha_fin: fecha_fin || proyecto.fecha_fin,
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
        
        console.log('Gastos relacionados:', gastosRelacionados);
        console.log('Presupuestos relacionados:', presupuestosRelacionados);
        console.log('Empleados relacionados:', empleadosRelacionados);
        
        if (gastosRelacionados > 0 || presupuestosRelacionados > 0 || empleadosRelacionados > 0) {
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
    getEstadisticasProyecto
};
