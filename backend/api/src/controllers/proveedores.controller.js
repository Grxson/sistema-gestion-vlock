const models = require('../models');

// Obtener todos los proveedores
const getProveedores = async (req, res) => {
    try {
        const { activo, tipo_proveedor, search } = req.query;
        
        let whereClause = {};
        
        if (activo !== undefined) {
            whereClause.activo = activo === 'true';
        }
        
        if (tipo_proveedor) {
            whereClause.tipo_proveedor = tipo_proveedor;
        }
        
        if (search) {
            whereClause[models.sequelize.Sequelize.Op.or] = [
                {
                    nombre: {
                        [models.sequelize.Sequelize.Op.like]: `%${search}%`
                    }
                },
                {
                    razon_social: {
                        [models.sequelize.Sequelize.Op.like]: `%${search}%`
                    }
                }
            ];
        }
        
        const proveedores = await models.Proveedores.findAll({
            where: whereClause,
            order: [['nombre', 'ASC']]
        });

        res.json({
            success: true,
            data: proveedores
        });
    } catch (error) {
        console.error('Error al obtener proveedores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener un proveedor por ID
const getProveedorById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proveedor = await models.Proveedores.findByPk(id, {
            include: [
                {
                    model: models.Suministros,
                    as: 'suministros',
                    limit: 10,
                    order: [['fecha', 'DESC']]
                }
            ]
        });
        
        if (!proveedor) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        res.json({
            success: true,
            data: proveedor
        });
    } catch (error) {
        console.error('Error al obtener proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear un nuevo proveedor
const createProveedor = async (req, res) => {
    try {
        const {
            nombre,
            rfc,
            razon_social,
            telefono,
            email,
            direccion,
            contacto_principal,
            tipo_proveedor,
            observaciones
        } = req.body;

        // Validación básica
        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del proveedor es obligatorio'
            });
        }

        // Verificar si ya existe un proveedor con ese nombre
        const proveedorExistente = await models.Proveedores.findOne({
            where: { nombre }
        });

        if (proveedorExistente) {
            return res.status(400).json({
                success: false,
                message: 'Ya existe un proveedor con ese nombre'
            });
        }

        const nuevoProveedor = await models.Proveedores.create({
            nombre,
            rfc,
            razon_social,
            telefono,
            email,
            direccion,
            contacto_principal,
            tipo_proveedor: tipo_proveedor || 'Material',
            observaciones
        });

        res.status(201).json({
            success: true,
            message: 'Proveedor creado exitosamente',
            data: nuevoProveedor
        });
    } catch (error) {
        console.error('Error al crear proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Actualizar un proveedor
const updateProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const proveedor = await models.Proveedores.findByPk(id);
        
        if (!proveedor) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        // Verificar nombre único si se está actualizando
        if (updateData.nombre && updateData.nombre !== proveedor.nombre) {
            const proveedorExistente = await models.Proveedores.findOne({
                where: { 
                    nombre: updateData.nombre,
                    id_proveedor: { [models.sequelize.Sequelize.Op.ne]: id }
                }
            });

            if (proveedorExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'Ya existe un proveedor con ese nombre'
                });
            }
        }

        await proveedor.update(updateData);

        res.json({
            success: true,
            message: 'Proveedor actualizado exitosamente',
            data: proveedor
        });
    } catch (error) {
        console.error('Error al actualizar proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Desactivar un proveedor (soft delete)
const deleteProveedor = async (req, res) => {
    try {
        const { id } = req.params;
        
        const proveedor = await models.Proveedores.findByPk(id);
        
        if (!proveedor) {
            return res.status(404).json({
                success: false,
                message: 'Proveedor no encontrado'
            });
        }

        // Soft delete - solo desactivar
        await proveedor.update({ activo: false });

        res.json({
            success: true,
            message: 'Proveedor desactivado exitosamente'
        });
    } catch (error) {
        console.error('Error al desactivar proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Buscar proveedores (para autocomplete)
const searchProveedores = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.json({
                success: true,
                data: []
            });
        }

        const proveedores = await models.Proveedores.findAll({
            where: {
                // Temporalmente removemos el filtro activo para debug
                // activo: true,
                [models.sequelize.Sequelize.Op.or]: [
                    {
                        nombre: {
                            [models.sequelize.Sequelize.Op.like]: `%${q}%`
                        }
                    },
                    {
                        razon_social: {
                            [models.sequelize.Sequelize.Op.like]: `%${q}%`
                        }
                    }
                ]
            },
            attributes: ['id_proveedor', 'nombre', 'razon_social', 'tipo_proveedor', 'rfc', 'activo'],
            limit: 10,
            order: [['nombre', 'ASC']]
        });

        res.json({
            success: true,
            data: proveedores
        });
    } catch (error) {
        console.error('Error al buscar proveedores:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Crear proveedor automáticamente si no existe
const createOrGetProveedor = async (req, res) => {
    try {
        const { nombre, tipo_proveedor } = req.body;

        if (!nombre) {
            return res.status(400).json({
                success: false,
                message: 'El nombre del proveedor es obligatorio'
            });
        }

        // Buscar si ya existe
        let proveedor = await models.Proveedores.findOne({
            where: { nombre }
        });

        // Si no existe, crearlo
        if (!proveedor) {
            proveedor = await models.Proveedores.create({
                nombre,
                tipo_proveedor: tipo_proveedor || 'Material',
                activo: true
            });
        }

        res.json({
            success: true,
            data: proveedor,
            created: !proveedor.id_proveedor
        });
    } catch (error) {
        console.error('Error al crear/obtener proveedor:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    getProveedores,
    getProveedorById,
    createProveedor,
    updateProveedor,
    deleteProveedor,
    searchProveedores,
    createOrGetProveedor
};
