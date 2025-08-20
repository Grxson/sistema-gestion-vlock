const sequelize = require('../config/db');
const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const models = require('../models');
const initNominaData = require('./nomina_seed');

// Obtener referencias a los modelos usando los nombres actualizados
const Usuario = models.Usuarios;
const Rol = models.Roles;
const AccionesPermiso = models.Acciones_permiso;
const PermisosRol = models.Permisos_rol;

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
        // Para una nueva instalación es mejor usar { force: false } para evitar problemas con claves foráneas
        // Si necesitas recrear las tablas, usa alternativamente el script SQL
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

            // Proyectos
            {
                nombre: 'Ver proyectos',
                codigo: 'proyectos.ver',
                descripcion: 'Ver lista de proyectos',
                modulo: 'proyectos'
            },
            {
                nombre: 'Crear proyecto',
                codigo: 'proyectos.crear',
                descripcion: 'Crear nuevos proyectos',
                modulo: 'proyectos'
            },
            {
                nombre: 'Editar proyecto',
                codigo: 'proyectos.editar',
                descripcion: 'Modificar proyectos existentes',
                modulo: 'proyectos'
            },
            {
                nombre: 'Eliminar proyecto',
                codigo: 'proyectos.eliminar',
                descripcion: 'Eliminar proyectos',
                modulo: 'proyectos'
            },

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

            // Finanzas
            {
                nombre: 'Ver gastos',
                codigo: 'finanzas.gastos.ver',
                descripcion: 'Ver registro de gastos',
                modulo: 'finanzas'
            },
            {
                nombre: 'Crear gasto',
                codigo: 'finanzas.gastos.crear',
                descripcion: 'Registrar nuevos gastos',
                modulo: 'finanzas'
            },
            {
                nombre: 'Editar gasto',
                codigo: 'finanzas.gastos.editar',
                descripcion: 'Modificar gastos existentes',
                modulo: 'finanzas'
            },
            {
                nombre: 'Eliminar gasto',
                codigo: 'finanzas.gastos.eliminar',
                descripcion: 'Eliminar gastos',
                modulo: 'finanzas'
            },
            {
                nombre: 'Ver ingresos',
                codigo: 'finanzas.ingresos.ver',
                descripcion: 'Ver registro de ingresos',
                modulo: 'finanzas'
            },
            {
                nombre: 'Crear ingreso',
                codigo: 'finanzas.ingresos.crear',
                descripcion: 'Registrar nuevos ingresos',
                modulo: 'finanzas'
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

            // Roles
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

        // Asignar permisos básicos al rol de usuario
        const permisosBasicos = await AccionesPermiso.findAll({
            where: {
                codigo: {
                    [Op.in]: [
                        'proyectos.ver',
                        'empleados.ver',
                        'finanzas.gastos.ver',
                        'finanzas.ingresos.ver',
                        'reportes.ver',
                        'nomina.ver',
                        'contratos.ver',
                        'oficios.ver',
                        'auditoria.ver',
                        'configuracion.ver',
                        'roles.ver'
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
