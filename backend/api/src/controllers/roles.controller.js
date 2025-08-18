const models = require('../models');
const Rol = models.Roles;
const PermisosRol = models.Permisos_rol;
const AccionesPermiso = models.Acciones_permiso;

/**
 * Obtener todos los roles
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllRoles = async (req, res) => {
    try {
        const roles = await Rol.findAll();

        res.status(200).json({
            message: 'Roles obtenidos exitosamente',
            roles
        });
    } catch (error) {
        console.error('Error al obtener roles:', error);
        res.status(500).json({
            message: 'Error al obtener roles',
            error: error.message
        });
    }
};

/**
 * Obtener un rol por ID con sus permisos
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getRolById = async (req, res) => {
    try {
        const { id } = req.params;

        const rol = await Rol.findByPk(id, {
            include: [{
                model: PermisosRol,
                as: 'permisos',
                include: [{
                    model: AccionesPermiso,
                    as: 'accion'
                }]
            }]
        });

        if (!rol) {
            return res.status(404).json({
                message: 'Rol no encontrado'
            });
        }

        res.status(200).json({
            message: 'Rol obtenido exitosamente',
            rol
        });
    } catch (error) {
        console.error('Error al obtener rol:', error);
        res.status(500).json({
            message: 'Error al obtener rol',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo rol
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createRol = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        // Validación de campos requeridos
        if (!nombre) {
            return res.status(400).json({
                message: 'El nombre del rol es requerido'
            });
        }

        // Verificar si el rol ya existe
        const rolExistente = await Rol.findOne({
            where: { nombre }
        });

        if (rolExistente) {
            return res.status(400).json({
                message: 'El rol ya existe'
            });
        }

        // Crear el nuevo rol
        const nuevoRol = await Rol.create({
            nombre,
            descripcion
        });

        res.status(201).json({
            message: 'Rol creado exitosamente',
            rol: nuevoRol
        });
    } catch (error) {
        console.error('Error al crear rol:', error);
        res.status(500).json({
            message: 'Error al crear rol',
            error: error.message
        });
    }
};

/**
 * Actualizar un rol
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion } = req.body;

        // Buscar el rol a actualizar
        const rol = await Rol.findByPk(id);

        if (!rol) {
            return res.status(404).json({
                message: 'Rol no encontrado'
            });
        }

        // Verificar si el nuevo nombre ya existe en otro rol
        if (nombre && nombre !== rol.nombre) {
            const rolExistente = await Rol.findOne({
                where: { nombre }
            });

            if (rolExistente) {
                return res.status(400).json({
                    message: 'El nombre del rol ya está en uso'
                });
            }
        }

        // Preparar datos a actualizar
        const datosActualizados = {};
        if (nombre) datosActualizados.nombre = nombre;
        if (descripcion !== undefined) datosActualizados.descripcion = descripcion;

        // Actualizar el rol
        await rol.update(datosActualizados);

        // Obtener el rol actualizado
        const rolActualizado = await Rol.findByPk(id);

        res.status(200).json({
            message: 'Rol actualizado exitosamente',
            rol: rolActualizado
        });
    } catch (error) {
        console.error('Error al actualizar rol:', error);
        res.status(500).json({
            message: 'Error al actualizar rol',
            error: error.message
        });
    }
};

/**
 * Eliminar un rol
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteRol = async (req, res) => {
    try {
        const { id } = req.params;

        // Evitar eliminar roles críticos del sistema (como Admin)
        if (parseInt(id) === 1) {
            return res.status(400).json({
                message: 'No se puede eliminar el rol de Administrador'
            });
        }

        // Buscar el rol
        const rol = await Rol.findByPk(id);

        if (!rol) {
            return res.status(404).json({
                message: 'Rol no encontrado'
            });
        }

        // Verificar si hay usuarios con este rol antes de eliminar
        const usuariosConRol = await models.Usuarios.count({
            where: { id_rol: id }
        });

        if (usuariosConRol > 0) {
            return res.status(400).json({
                message: `No se puede eliminar el rol porque hay ${usuariosConRol} usuario(s) asignado(s) a este rol`
            });
        }

        // Eliminar el rol
        await rol.destroy();

        res.status(200).json({
            message: 'Rol eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar rol:', error);
        res.status(500).json({
            message: 'Error al eliminar rol',
            error: error.message
        });
    }
};

/**
 * Asignar permisos a un rol
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const asignarPermisosRol = async (req, res) => {
    try {
        const { id_rol } = req.params;
        const { permisos } = req.body;

        // Validaciones
        if (!permisos || !Array.isArray(permisos)) {
            return res.status(400).json({
                message: 'Se debe proporcionar un array de permisos'
            });
        }

        // Verificar que el rol existe
        const rol = await Rol.findByPk(id_rol);
        if (!rol) {
            return res.status(404).json({
                message: 'Rol no encontrado'
            });
        }

        // Eliminar permisos existentes
        await PermisosRol.destroy({
            where: { id_rol }
        });

        // Crear nuevos permisos
        const permisosCreados = await Promise.all(
            permisos.map(async (permiso) => {
                return await PermisosRol.create({
                    id_rol,
                    id_accion: permiso.id_accion,
                    permitido: permiso.permitido || true
                });
            })
        );

        res.status(200).json({
            message: 'Permisos asignados exitosamente',
            permisos: permisosCreados
        });
    } catch (error) {
        console.error('Error al asignar permisos:', error);
        res.status(500).json({
            message: 'Error al asignar permisos',
            error: error.message
        });
    }
};

/**
 * Obtener acciones/permisos disponibles
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAccionesPermiso = async (req, res) => {
    try {
        const acciones = await AccionesPermiso.findAll();

        res.status(200).json({
            message: 'Acciones obtenidas exitosamente',
            acciones
        });
    } catch (error) {
        console.error('Error al obtener acciones:', error);
        res.status(500).json({
            message: 'Error al obtener acciones',
            error: error.message
        });
    }
};

/**
 * Verificar si un usuario tiene un permiso específico
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const verificarPermiso = async (req, res) => {
    try {
        const { id_usuario, codigo_accion } = req.body;

        // Obtener el rol del usuario
        const usuario = await models.Usuarios.findByPk(id_usuario);
        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Obtener la acción por código
        const accion = await AccionesPermiso.findOne({
            where: { codigo: codigo_accion }
        });

        if (!accion) {
            return res.status(404).json({
                message: 'Acción no encontrada'
            });
        }

        // Verificar si tiene el permiso
        const permiso = await PermisosRol.findOne({
            where: {
                id_rol: usuario.id_rol,
                id_accion: accion.id_accion,
                permitido: true
            }
        });

        res.status(200).json({
            message: 'Verificación de permiso completada',
            tienePermiso: !!permiso
        });
    } catch (error) {
        console.error('Error al verificar permiso:', error);
        res.status(500).json({
            message: 'Error al verificar permiso',
            error: error.message
        });
    }
};

module.exports = {
    getAllRoles,
    getRolById,
    createRol,
    updateRol,
    deleteRol,
    asignarPermisosRol,
    getAccionesPermiso,
    verificarPermiso
};
