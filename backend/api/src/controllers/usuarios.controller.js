const models = require('../models');
const Usuario = models.Usuarios;
const Roles = models.Roles;
const Auditoria = models.Auditoria;
const bcrypt = require('bcrypt');
const { Op } = require('sequelize');

/**
 * Obtener todos los usuarios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll({
            attributes: { exclude: ['password'] },
            include: [{
                model: Roles,
                attributes: ['id_rol', 'nombre'],
                as: 'rol'
            }]
        });

        res.status(200).json({
            message: 'Usuarios obtenidos exitosamente',
            usuarios
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            message: 'Error al obtener usuarios',
            error: error.message
        });
    }
};

/**
 * Obtener un usuario por ID
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getUsuarioById = async (req, res) => {
    try {
        const { id } = req.params;

        const usuario = await Usuario.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Roles,
                attributes: ['id_rol', 'nombre'],
                as: 'rol'
            }]
        });

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        res.status(200).json({
            message: 'Usuario obtenido exitosamente',
            usuario
        });
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        res.status(500).json({
            message: 'Error al obtener usuario',
            error: error.message
        });
    }
};

/**
 * Crear un nuevo usuario (admin)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const createUsuario = async (req, res) => {
    try {
        const { nombre_usuario, email, password, id_rol, activo } = req.body;

        // Validación de campos requeridos
        if (!nombre_usuario || !email || !password || !id_rol) {
            return res.status(400).json({
                message: 'Todos los campos son requeridos'
            });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({
            where: {
                [Op.or]: [
                    { nombre_usuario },
                    { email }
                ]
            }
        });

        if (usuarioExistente) {
            return res.status(400).json({
                message: 'El nombre de usuario o email ya está en uso'
            });
        }

        // Hash de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Crear el nuevo usuario
        const nuevoUsuario = await Usuario.create({
            nombre_usuario,
            email,
            password: hashedPassword,
            id_rol,
            activo: activo !== undefined ? activo : true
        });

        // No devolver el password en la respuesta
        const usuarioSinPassword = { ...nuevoUsuario.get() };
        delete usuarioSinPassword.password;

        res.status(201).json({
            message: 'Usuario creado exitosamente',
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error('Error al crear usuario:', error);
        res.status(500).json({
            message: 'Error al crear usuario',
            error: error.message
        });
    }
};

/**
 * Actualizar un usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre_usuario, email, id_rol, activo } = req.body;

        // Buscar el usuario a actualizar
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si el email o nombre de usuario ya existe en otro usuario
        if (nombre_usuario || email) {
            const usuarioExistente = await Usuario.findOne({
                where: {
                    [Op.and]: [
                        { id_usuario: { [Op.ne]: id } },
                        {
                            [Op.or]: [
                                nombre_usuario ? { nombre_usuario } : null,
                                email ? { email } : null
                            ].filter(Boolean)
                        }
                    ]
                }
            });

            if (usuarioExistente) {
                return res.status(400).json({
                    message: 'El nombre de usuario o email ya está en uso por otro usuario'
                });
            }
        }

        // Preparar datos a actualizar
        const datosActualizados = {};
        if (nombre_usuario) datosActualizados.nombre_usuario = nombre_usuario;
        if (email) datosActualizados.email = email;
        if (id_rol !== undefined) datosActualizados.id_rol = id_rol;
        if (activo !== undefined) datosActualizados.activo = activo;

        // Actualizar el usuario
        await usuario.update(datosActualizados);

        // Obtener el usuario actualizado
        const usuarioActualizado = await Usuario.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [{
                model: Roles,
                attributes: ['id_rol', 'nombre'],
                as: 'rol'
            }]
        });

        res.status(200).json({
            message: 'Usuario actualizado exitosamente',
            usuario: usuarioActualizado
        });
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        res.status(500).json({
            message: 'Error al actualizar usuario',
            error: error.message
        });
    }
};

/**
 * Cambiar contraseña de un usuario (admin)
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const resetPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                message: 'Se requiere nueva contraseña'
            });
        }

        // Buscar el usuario
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña
        await usuario.update({ password: hashedPassword });

        res.status(200).json({
            message: 'Contraseña restablecida exitosamente'
        });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        res.status(500).json({
            message: 'Error al restablecer contraseña',
            error: error.message
        });
    }
};

/**
 * Eliminar un usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar que no se elimine a sí mismo
        if (req.usuario.id_usuario === parseInt(id)) {
            return res.status(400).json({
                message: 'No puede eliminarse a sí mismo'
            });
        }

        // Buscar el usuario
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Eliminar registros relacionados antes de borrar el usuario
        const transaction = await models.sequelize.transaction();

        try {
            // Eliminar registros de auditoría asociados
            if (Auditoria) {
                await Auditoria.destroy({
                    where: { id_usuario: id },
                    transaction
                });
            }

            // Eliminar el usuario
            await usuario.destroy({ transaction });

            await transaction.commit();
        } catch (relatedError) {
            await transaction.rollback();
            throw relatedError;
        }

        res.status(200).json({
            message: 'Usuario eliminado exitosamente'
        });
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({
            message: 'Error al eliminar usuario',
            error: error.message
        });
    }
};

module.exports = {
    getAllUsuarios,
    getUsuarioById,
    createUsuario,
    updateUsuario,
    resetPassword,
    deleteUsuario
};
