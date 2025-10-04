const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize'); // Importar Op de Sequelize
const models = require('../models');
const Usuario = models.Usuarios;
const Roles = models.Roles;
require('dotenv').config();

/**
 * Controlador para el registro de nuevos usuarios
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const register = async (req, res) => {
    try {
        const { nombre_usuario, email, password, id_rol } = req.body;

        // Validación de campos requeridos
        if (!nombre_usuario || !email || !password) {
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
            id_rol: id_rol || 2 // Por defecto asignar rol regular (asumiendo que 1 es admin, 2 es usuario regular)
        });

        // No devolver el password en la respuesta
        const usuarioSinPassword = { ...nuevoUsuario.get() };
        delete usuarioSinPassword.password;

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({
            message: 'Error al registrar usuario',
            error: error.message
        });
    }
};

/**
 * Controlador para el inicio de sesión
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación de campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son requeridos'
            });
        }

        // Buscar el usuario por email
        const usuario = await Usuario.findOne({
            where: { email },
            include: [{
                model: Roles,
                attributes: ['nombre'],
                as: 'rol'
            }]
        });

        // Verificar si el usuario existe
        if (!usuario) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            });
        }

        // Verificar si el usuario está activo
        if (!usuario.activo) {
            return res.status(401).json({
                message: 'Usuario desactivado, contacte al administrador'
            });
        }

        // Comparar la contraseña
        const passwordValido = await bcrypt.compare(password, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                message: 'Credenciales incorrectas'
            });
        }

        // Generar el token JWT
        const token = jwt.sign(
            {
                id_usuario: usuario.id_usuario,
                nombre_usuario: usuario.nombre_usuario,
                email: usuario.email,
                id_rol: usuario.id_rol,
                rol: usuario.rol ? usuario.rol.nombre : null
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES }
        );

        // No devolver el password en la respuesta
        const usuarioSinPassword = { ...usuario.get() };
        delete usuarioSinPassword.password;

        res.status(200).json({
            message: 'Inicio de sesión exitoso',
            token,
            usuario: usuarioSinPassword
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({
            message: 'Error al iniciar sesión',
            error: error.message
        });
    }
};

/**
 * Controlador para verificar el token
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const verifyAuth = (req, res) => {
    // Si llegó hasta aquí, el token es válido (pasó por el middleware)
    res.status(200).json({
        message: 'Token válido',
        usuario: req.usuario
    });
};

/**
 * Controlador para cambiar contraseña
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const id_usuario = req.usuario.id_usuario;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: 'Se requieren contraseña actual y nueva'
            });
        }

        // Buscar el usuario
        const usuario = await Usuario.findByPk(id_usuario);

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const passwordValido = await bcrypt.compare(currentPassword, usuario.password);

        if (!passwordValido) {
            return res.status(401).json({
                message: 'Contraseña actual incorrecta'
            });
        }

        // Hash de la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Actualizar la contraseña
        await usuario.update({ password: hashedPassword });

        res.status(200).json({
            message: 'Contraseña actualizada exitosamente'
        });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({
            message: 'Error al cambiar contraseña',
            error: error.message
        });
    }
};

/**
 * Controlador para cerrar sesión
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const logout = async (req, res) => {
    try {
        // En una API REST con JWT, el cierre de sesión es responsabilidad del cliente
        // ya que el servidor no mantiene estado de la sesión
        // Sin embargo, registramos el evento para auditoría
        
        const id_usuario = req.usuario?.id_usuario;
        
        if (id_usuario && models.Auditoria) {
            // Registrar evento de cierre de sesión en auditoría
            await models.Auditoria.create({
                id_usuario,
                accion: 'LOGOUT',
                tabla: 'usuarios',  // Tabla relacionada con la acción
                descripcion: 'Cierre de sesión exitoso',
                fecha_hora: new Date(),  // Campo requerido para la fecha y hora
                ip: req.ip || req.connection.remoteAddress // Opcional: registrar IP del cliente
            });
        }
        
        res.status(200).json({
            message: 'Sesión cerrada exitosamente'
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        res.status(500).json({
            message: 'Error al cerrar sesión',
            error: error.message
        });
    }
};

/**
 * Controlador para obtener los permisos del usuario actual
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const getUserPermissions = async (req, res) => {
    try {
        const id_usuario = req.usuario?.id_usuario;
        
        if (!id_usuario) {
            return res.status(401).json({
                message: 'Usuario no autenticado'
            });
        }

        // Obtener el usuario con su rol
        const usuario = await Usuario.findByPk(id_usuario, {
            include: [{
                model: Roles,
                as: 'rol'
            }]
        });

        if (!usuario) {
            return res.status(404).json({
                message: 'Usuario no encontrado'
            });
        }

        // Obtener los permisos del rol del usuario (solo los permitidos)
        const permisos = await models.Permisos_rol.findAll({
            where: { 
                id_rol: usuario.id_rol,
                permitido: 1  // Solo permisos permitidos
            },
            include: [{
                model: models.Acciones_permiso,
                as: 'accion'
            }]
        });

        // Extraer solo los nombres de las acciones
        const listaPermisos = permisos.map(permiso => permiso.accion.nombre);

        res.status(200).json({
            message: 'Permisos obtenidos exitosamente',
            permisos: listaPermisos,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_usuario,
                email: usuario.email,
                rol: usuario.rol ? usuario.rol.nombre : null,
                id_rol: usuario.id_rol
            }
        });
    } catch (error) {
        console.error('Error al obtener permisos:', error);
        res.status(500).json({
            message: 'Error al obtener permisos',
            error: error.message
        });
    }
};

/**
 * Controlador para actualizar el perfil del usuario
 * @param {Object} req - Objeto de solicitud
 * @param {Object} res - Objeto de respuesta
 */
const updateProfile = async (req, res) => {
    try {
        const userId = req.usuario.id_usuario;
        const { nombre, apellidos, email, telefono, fecha_nacimiento, cedula } = req.body;

        // Validar email único si se está cambiando
        if (email) {
            const usuarioExistente = await Usuario.findOne({
                where: {
                    email,
                    id_usuario: { [Op.not]: userId }
                }
            });

            if (usuarioExistente) {
                return res.status(400).json({
                    message: 'El email ya está en uso por otro usuario'
                });
            }
        }

        // Actualizar el usuario
        await Usuario.update({
            nombre,
            apellidos,
            email,
            telefono,
            fecha_nacimiento,
            cedula
        }, {
            where: { id_usuario: userId }
        });

        // Obtener el usuario actualizado
        const usuarioActualizado = await Usuario.findByPk(userId, {
            attributes: ['id_usuario', 'nombre_usuario', 'nombre', 'apellidos', 'email', 'telefono', 'fecha_nacimiento', 'cedula', 'id_rol'],
            include: [{
                model: Roles,
                as: 'rol',
                attributes: ['id', 'nombre']
            }]
        });

        res.json({
            message: 'Perfil actualizado correctamente',
            user: usuarioActualizado
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    register,
    login,
    logout,
    verifyAuth,
    getUserPermissions,
    updateProfile,
    changePassword
};
