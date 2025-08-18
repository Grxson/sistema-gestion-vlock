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

module.exports = {
    register,
    login,
    verifyAuth,
    changePassword
};
