const sequelize = require('../config/db');
const models = require('../models');

// Obtener referencias a los modelos
const Contrato = models.Contratos;
const Oficio = models.Oficios;

/**
 * Crear datos iniciales para el módulo de nómina
 */
const initNominaData = async () => {
    try {
        console.log('🌱 Inicializando datos del módulo de nómina...');

        // Verificar conexión a la base de datos
        try {
            await sequelize.authenticate();
            console.log('✅ Conexión a la BD exitosa');
        } catch (error) {
            console.error('❌ Error al conectar con la base de datos:', error.message);
            return;
        }

        // 1. Crear contratos básicos
        const contratosFijos = [
            { 
                tipo_contrato: 'Fijo', 
                salario_diario: 350.00, 
                fecha_inicio: '2023-01-01'
            },
            { 
                tipo_contrato: 'Temporal', 
                salario_diario: 300.00, 
                fecha_inicio: '2023-01-01',
                fecha_fin: '2023-12-31'
            },
            { 
                tipo_contrato: 'Honorarios', 
                salario_diario: 400.00, 
                fecha_inicio: '2023-01-01' 
            },
            { 
                tipo_contrato: 'Por_Proyecto', 
                salario_diario: 450.00, 
                fecha_inicio: '2023-01-01',
                fecha_fin: '2023-06-30'
            }
        ];

        for (const contratoData of contratosFijos) {
            await Contrato.findOrCreate({
                where: { 
                    tipo_contrato: contratoData.tipo_contrato,
                    salario_diario: contratoData.salario_diario
                },
                defaults: contratoData
            });
        }
        
        console.log('✅ Contratos básicos creados o verificados');

        // 2. Crear oficios básicos
        const oficiosBasicos = [
            { nombre: 'Albañil', descripcion: 'Construcción general' },
            { nombre: 'Electricista', descripcion: 'Instalaciones eléctricas' },
            { nombre: 'Plomero', descripcion: 'Instalaciones hidráulicas' },
            { nombre: 'Carpintero', descripcion: 'Trabajo en madera' },
            { nombre: 'Pintor', descripcion: 'Acabados en pintura' },
            { nombre: 'Soldador', descripcion: 'Trabajos de soldadura' },
            { nombre: 'Técnico HVAC', descripcion: 'Aire acondicionado y ventilación' }
        ];

        for (const oficioData of oficiosBasicos) {
            await Oficio.findOrCreate({
                where: { nombre: oficioData.nombre },
                defaults: oficioData
            });
        }

        console.log('✅ Oficios básicos creados o verificados');
        
        console.log('✅ Inicialización del módulo de nómina completada');
    } catch (error) {
        console.error('❌ Error al inicializar datos de nómina:', error);
    }
};

module.exports = initNominaData;
