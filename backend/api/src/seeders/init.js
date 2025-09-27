const sequelize = require('../config/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const models = require('../models');
const initNominaData = require('./nomina_seed');
const { initCategoriasHerramientas } = require('./categorias_herramientas_seed');
const { initHerramientas } = require('./herramientas_seed');
const { initMovimientosHerramientas } = require('./movimientos_herramientas_seed');

// Obtener referencias a los modelos usando los nombres actualizados
const Usuario = models.Usuarios;
const Rol = models.Roles;
const AccionesPermiso = models.Acciones_permiso;
const PermisosRol = models.Permisos_rol;

/**
 * Inicializar proyectos básicos
 */
const initProyectosBasicos = async () => {
    console.log('🏗️ Inicializando proyectos básicos...');
    
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión a la BD exitosa');
    } catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error.message);
        return;
    }

    const proyectosBasicos = [
        {
            id_proyecto: 1,
            nombre: 'Flex Park',
            descripcion: 'Desarrollo de complejo residencial con áreas verdes y estacionamiento',
            fecha_inicio: '2024-01-15',
            fecha_fin: '2025-12-30',
            estado: 'Activo',
            responsable: 'Ing. Juan Pérez',
            ubicacion: 'Ciudad de México, CDMX'
        },
        {
            id_proyecto: 2,
            nombre: 'Complejo Residencial Norte',
            descripcion: 'Construcción de 150 unidades habitacionales con amenidades',
            fecha_inicio: '2024-03-01',
            fecha_fin: '2026-02-28',
            estado: 'Activo',
            responsable: 'Arq. María González',
            ubicacion: 'Monterrey, Nuevo León'
        },
        {
            id_proyecto: 3,
            nombre: 'Centro Comercial Sur',
            descripcion: 'Desarrollo de centro comercial de 3 niveles con 80 locales',
            fecha_inicio: '2024-06-01',
            fecha_fin: '2025-11-30',
            estado: 'Pausado',
            responsable: 'Ing. Carlos Rodríguez',
            ubicacion: 'Guadalajara, Jalisco'
        },
        {
            id_proyecto: 4,
            nombre: 'Torre Corporativa Centro',
            descripcion: 'Edificio de oficinas de 25 pisos con estacionamiento subterráneo',
            fecha_inicio: '2024-08-15',
            fecha_fin: '2027-03-15',
            estado: 'Activo',
            responsable: 'Ing. Ana Martínez',
            ubicacion: 'Puebla, Puebla'
        },
        {
            id_proyecto: 5,
            nombre: 'Fraccionamiento Las Palmas',
            descripcion: 'Desarrollo habitacional de 80 casas con clubhouse',
            fecha_inicio: '2024-10-01',
            estado: 'Activo',
            responsable: 'Arq. Roberto Sánchez',
            ubicacion: 'Querétaro, Querétaro'
        }
    ];

    for (const proyectoData of proyectosBasicos) {
        await models.Proyectos.findOrCreate({
            where: { id_proyecto: proyectoData.id_proyecto },
            defaults: proyectoData
        });
    }

    console.log('✅ Proyectos básicos creados o verificados');
};

/**
 * Inicializar la base de datos con datos básicos
 */
const initDB = async () => {
    try {
        console.log('🌱 Inicializando base de datos con datos iniciales...');

        // Verificar conexión a la base de datos
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a la BD exitosa');
        } catch (error) {
            console.error('❌ Error al conectar con la base de datos:', error.message);
            return;
        }

        // Sincronizar modelos con la base de datos (crear tablas)
        await sequelize.sync({ force: false });

        // Crear roles básicos
        const [rolAdmin] = await Rol.findOrCreate({
            where: { id_rol: 1 },
            defaults: {
                nombre: 'Administrador',
                descripcion: 'Control total del sistema'
            }
        });

        const [rolUsuario] = await Rol.findOrCreate({
            where: { id_rol: 2 },
            defaults: {
                nombre: 'Usuario',
                descripcion: 'Usuario con acceso limitado'
            }
        });

        console.log('✅ Roles básicos creados o verificados');

        // Crear acciones de permisos básicas
        const accionesPredefinidas = [
            // Empleados
            {
                nombre: 'Ver empleados',
                codigo: 'empleados.ver',
                descripcion: 'Ver lista de empleados',
                modulo: 'empleados'
            },
            {
                nombre: 'Crear empleado',
                codigo: 'empleados.crear',
                descripcion: 'Crear nuevos empleados',
                modulo: 'empleados'
            },
            {
                nombre: 'Editar empleado',
                codigo: 'empleados.editar',
                descripcion: 'Modificar empleados existentes',
                modulo: 'empleados'
            },
            {
                nombre: 'Eliminar empleado',
                codigo: 'empleados.eliminar',
                descripcion: 'Eliminar empleados',
                modulo: 'empleados'
            },

            // Nómina
            {
                nombre: 'Ver nómina',
                codigo: 'nomina.ver',
                descripcion: 'Ver nómina de empleados',
                modulo: 'nomina'
            },
            {
                nombre: 'Crear nómina',
                codigo: 'nomina.crear',
                descripcion: 'Crear nueva nómina',
                modulo: 'nomina'
            },
            {
                nombre: 'Editar nómina',
                codigo: 'nomina.editar',
                descripcion: 'Modificar nómina existente',
                modulo: 'nomina'
            },
            {
                nombre: 'Procesar nómina',
                codigo: 'nomina.procesar',
                descripcion: 'Procesar pagos de nómina',
                modulo: 'nomina'
            },
            {
                nombre: 'Eliminar nómina',
                codigo: 'nomina.eliminar',
                descripcion: 'Eliminar registros de nómina',
                modulo: 'nomina'
            },

            // Contratos
            {
                nombre: 'Ver contratos',
                codigo: 'contratos.ver',
                descripcion: 'Ver lista de contratos',
                modulo: 'contratos'
            },
            {
                nombre: 'Crear contrato',
                codigo: 'contratos.crear',
                descripcion: 'Crear nuevos contratos',
                modulo: 'contratos'
            },
            {
                nombre: 'Editar contrato',
                codigo: 'contratos.editar',
                descripcion: 'Modificar contratos existentes',
                modulo: 'contratos'
            },
            {
                nombre: 'Eliminar contrato',
                codigo: 'contratos.eliminar',
                descripcion: 'Eliminar contratos',
                modulo: 'contratos'
            },

            // Oficios
            {
                nombre: 'Ver oficios',
                codigo: 'oficios.ver',
                descripcion: 'Ver lista de oficios',
                modulo: 'oficios'
            },
            {
                nombre: 'Crear oficio',
                codigo: 'oficios.crear',
                descripcion: 'Crear nuevos oficios',
                modulo: 'oficios'
            },
            {
                nombre: 'Editar oficio',
                codigo: 'oficios.editar',
                descripcion: 'Modificar oficios existentes',
                modulo: 'oficios'
            },
            {
                nombre: 'Eliminar oficio',
                codigo: 'oficios.eliminar',
                descripcion: 'Eliminar oficios',
                modulo: 'oficios'
            },

            // Auditoría
            {
                nombre: 'Ver auditoría',
                codigo: 'auditoria.ver',
                descripcion: 'Ver registros de auditoría',
                modulo: 'auditoria'
            },
            {
                nombre: 'Exportar auditoría',
                codigo: 'auditoria.exportar',
                descripcion: 'Exportar registros de auditoría',
                modulo: 'auditoria'
            },

            // Reportes
            {
                nombre: 'Ver reportes',
                codigo: 'reportes.ver',
                descripcion: 'Ver reportes',
                modulo: 'reportes'
            },
            {
                nombre: 'Generar reportes',
                codigo: 'reportes.generar',
                descripcion: 'Generar nuevos reportes',
                modulo: 'reportes'
            },
            {
                nombre: 'Exportar reportes',
                codigo: 'reportes.exportar',
                descripcion: 'Exportar reportes a diferentes formatos',
                modulo: 'reportes'
            },

            // Usuarios
            {
                nombre: 'Ver usuarios',
                codigo: 'usuarios.ver',
                descripcion: 'Ver lista de usuarios',
                modulo: 'usuarios'
            },
            {
                nombre: 'Crear usuario',
                codigo: 'usuarios.crear',
                descripcion: 'Crear nuevos usuarios',
                modulo: 'usuarios'
            },
            {
                nombre: 'Editar usuario',
                codigo: 'usuarios.editar',
                descripcion: 'Modificar usuarios existentes',
                modulo: 'usuarios'
            },
            {
                nombre: 'Eliminar usuario',
                codigo: 'usuarios.eliminar',
                descripcion: 'Eliminar usuarios',
                modulo: 'usuarios'
            },

            // Roles y Permisos
            {
                nombre: 'Ver roles',
                codigo: 'roles.ver',
                descripcion: 'Ver roles y sus permisos',
                modulo: 'roles'
            },
            {
                nombre: 'Crear rol',
                codigo: 'roles.crear',
                descripcion: 'Crear nuevos roles',
                modulo: 'roles'
            },
            {
                nombre: 'Editar rol',
                codigo: 'roles.editar',
                descripcion: 'Modificar roles existentes',
                modulo: 'roles'
            },
            {
                nombre: 'Eliminar rol',
                codigo: 'roles.eliminar',
                descripcion: 'Eliminar roles',
                modulo: 'roles'
            },
            {
                nombre: 'Asignar permisos',
                codigo: 'roles.permisos',
                descripcion: 'Gestionar permisos de roles',
                modulo: 'roles'
            },
            
            // Herramientas
            {
                nombre: 'Ver herramientas',
                codigo: 'herramientas.ver',
                descripcion: 'Ver inventario de herramientas',
                modulo: 'herramientas'
            },
            {
                nombre: 'Crear herramienta',
                codigo: 'herramientas.crear',
                descripcion: 'Agregar nuevas herramientas al inventario',
                modulo: 'herramientas'
            },
            {
                nombre: 'Editar herramienta',
                codigo: 'herramientas.editar',
                descripcion: 'Modificar información de herramientas',
                modulo: 'herramientas'
            },
            {
                nombre: 'Eliminar herramienta',
                codigo: 'herramientas.eliminar',
                descripcion: 'Eliminar herramientas del inventario',
                modulo: 'herramientas'
            },
            {
                nombre: 'Gestionar movimientos herramientas',
                codigo: 'herramientas.movimientos',
                descripcion: 'Registrar entradas, salidas y bajas de herramientas',
                modulo: 'herramientas'
            },
            {
                nombre: 'Ver reportes herramientas',
                codigo: 'herramientas.reportes',
                descripcion: 'Generar reportes de inventario de herramientas',
                modulo: 'herramientas'
            },

            // Configuración
            {
                nombre: 'Ver configuración',
                codigo: 'configuracion.ver',
                descripcion: 'Ver configuración del sistema',
                modulo: 'configuracion'
            },
            {
                nombre: 'Editar configuración',
                codigo: 'configuracion.editar',
                descripcion: 'Modificar configuración del sistema',
                modulo: 'configuracion'
            }
        ];

        for (const accion of accionesPredefinidas) {
            await AccionesPermiso.findOrCreate({
                where: { codigo: accion.codigo },
                defaults: accion
            });
        }

        console.log('✅ Acciones de permisos creadas o verificadas');

        // Asignar todos los permisos al rol de administrador
        const todasLasAcciones = await AccionesPermiso.findAll();

        for (const accion of todasLasAcciones) {
            await PermisosRol.findOrCreate({
                where: {
                    id_rol: rolAdmin.id_rol,
                    id_accion: accion.id_accion
                },
                defaults: {
                    id_rol: rolAdmin.id_rol,
                    id_accion: accion.id_accion,
                    permitido: true
                }
            });
        }

        // Asignar solo permisos de "ver" al rol de usuario
        const permisosBasicos = await AccionesPermiso.findAll({
            where: {
                codigo: {
                    [Op.in]: [
                        'empleados.ver',
                        'nomina.ver',
                        'contratos.ver',
                        'oficios.ver',
                        'auditoria.ver',
                        'reportes.ver',
                        'herramientas.ver',
                        'herramientas.reportes'
                        // NO incluimos usuarios, roles ni configuración para usuarios normales
                        // NO incluimos permisos de crear, editar o eliminar
                    ]
                }
            }
        });

        for (const accion of permisosBasicos) {
            await PermisosRol.findOrCreate({
                where: {
                    id_rol: rolUsuario.id_rol,
                    id_accion: accion.id_accion
                },
                defaults: {
                    id_rol: rolUsuario.id_rol,
                    id_accion: accion.id_accion,
                    permitido: true
                }
            });
        }

        console.log('✅ Permisos asignados a roles');

        // Crear usuario administrador por defecto
        const hashedPassword = await bcrypt.hash('admin123', 10);

        await Usuario.findOrCreate({
            where: { email: 'admin@vlock.com' },
            defaults: {
                nombre_usuario: 'admin',
                email: 'admin@vlock.com',
                password: hashedPassword,
                id_rol: rolAdmin.id_rol,
                activo: true
            }
        });

        console.log('✅ Usuario administrador creado o verificado');
        
        // Inicializar datos del módulo de nómina
        await initNominaData();
        
        // Inicializar proyectos básicos
        await initProyectosBasicos();
        
        // Inicializar datos de herramientas
        await initCategoriasHerramientas(models);
        await initHerramientas(models);
        await initMovimientosHerramientas(models);
        
        console.log('🚀 Inicialización completada');

        return true;
    } catch (error) {
        console.error('❌ Error durante la inicialización:', error);
        return false;
    }
};

module.exports = { initDB };

// Ejecutar directamente si se llama desde la línea de comandos
if (require.main === module) {
    (async () => {
        try {
            const result = await initDB();
            if (result) {
                console.log('✅ Seeder ejecutado exitosamente');
            } else {
                console.log('❌ Error al ejecutar el seeder');
            }
            process.exit(0);
        } catch (error) {
            console.error('❌ Error fatal en el seeder:', error);
            process.exit(1);
        }
    })();
}
