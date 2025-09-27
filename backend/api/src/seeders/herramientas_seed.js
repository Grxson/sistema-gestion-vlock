const { Op } = require('sequelize');

/**
 * Inicializar herramientas básicas de ejemplo
 */
const initHerramientas = async (models) => {
    console.log('🔨 Inicializando herramientas de ejemplo...');

    const Herramienta = models.Herramientas;

    const herramientasBasicas = [
        // Herramientas Manuales (Categoría 1)
        {
            id_herramienta: 1,
            id_categoria_herr: 1,
            nombre: 'Martillo de Carpintero',
            marca: 'Stanley',
            serial: 'ST-H16-001',
            costo: 450.00,
            vida_util_meses: 60,
            stock_total: 15,
            stock_disponible: 12,
            stock_minimo: 3,
            ubicacion: 'Almacén A - Estante 1'
        },
        {
            id_herramienta: 2,
            id_categoria_herr: 1,
            nombre: 'Juego de Destornilladores',
            marca: 'Truper',
            serial: 'TR-JD-002',
            costo: 280.00,
            vida_util_meses: 48,
            stock_total: 8,
            stock_disponible: 6,
            stock_minimo: 2,
            ubicacion: 'Almacén A - Estante 2'
        },
        {
            id_herramienta: 3,
            id_categoria_herr: 1,
            nombre: 'Llave Inglesa 12"',
            marca: 'Pretul',
            serial: 'PT-LI12-003',
            costo: 320.00,
            vida_util_meses: 72,
            stock_total: 10,
            stock_disponible: 8,
            stock_minimo: 2,
            ubicacion: 'Almacén A - Estante 1'
        },

        // Herramientas Eléctricas (Categoría 2)
        {
            id_herramienta: 4,
            id_categoria_herr: 2,
            nombre: 'Taladro Percutor 1/2"',
            marca: 'DeWalt',
            serial: 'DW-TP500-004',
            costo: 2850.00,
            vida_util_meses: 84,
            stock_total: 5,
            stock_disponible: 3,
            stock_minimo: 1,
            ubicacion: 'Almacén B - Estante 3'
        },
        {
            id_herramienta: 5,
            id_categoria_herr: 2,
            nombre: 'Sierra Circular 7 1/4"',
            marca: 'Makita',
            serial: 'MK-SC714-005',
            costo: 3200.00,
            vida_util_meses: 96,
            stock_total: 3,
            stock_disponible: 2,
            stock_minimo: 1,
            ubicacion: 'Almacén B - Estante 4'
        },
        {
            id_herramienta: 6,
            id_categoria_herr: 2,
            nombre: 'Esmeriladora Angular 4 1/2"',
            marca: 'Bosch',
            serial: 'BS-EA45-006',
            costo: 1890.00,
            vida_util_meses: 60,
            stock_total: 6,
            stock_disponible: 4,
            stock_minimo: 2,
            ubicacion: 'Almacén B - Estante 3'
        },

        // Equipo de Medición (Categoría 3)
        {
            id_herramienta: 7,
            id_categoria_herr: 3,
            nombre: 'Nivel de Burbuja 60cm',
            marca: 'Stanley',
            serial: 'ST-NB60-007',
            costo: 650.00,
            vida_util_meses: 120,
            stock_total: 8,
            stock_disponible: 6,
            stock_minimo: 2,
            ubicacion: 'Almacén A - Estante 5'
        },
        {
            id_herramienta: 8,
            id_categoria_herr: 3,
            nombre: 'Flexómetro 8m',
            marca: 'Truper',
            serial: 'TR-FL8M-008',
            costo: 180.00,
            vida_util_meses: 36,
            stock_total: 20,
            stock_disponible: 15,
            stock_minimo: 5,
            ubicacion: 'Almacén A - Estante 5'
        },
        {
            id_herramienta: 9,
            id_categoria_herr: 3,
            nombre: 'Escuadra Metálica 30cm',
            marca: 'Pretul',
            serial: 'PT-EM30-009',
            costo: 85.00,
            vida_util_meses: 60,
            stock_total: 12,
            stock_disponible: 10,
            stock_minimo: 3,
            ubicacion: 'Almacén A - Estante 5'
        },

        // Herramientas de Corte (Categoría 4)
        {
            id_herramienta: 10,
            id_categoria_herr: 4,
            nombre: 'Sierra de Mano 22"',
            marca: 'Irwin',
            serial: 'IR-SM22-010',
            costo: 420.00,
            vida_util_meses: 48,
            stock_total: 7,
            stock_disponible: 5,
            stock_minimo: 2,
            ubicacion: 'Almacén A - Estante 3'
        },
        {
            id_herramienta: 11,
            id_categoria_herr: 4,
            nombre: 'Cortadora de Azulejo',
            marca: 'Rubi',
            serial: 'RB-CA600-011',
            costo: 4200.00,
            vida_util_meses: 120,
            stock_total: 2,
            stock_disponible: 1,
            stock_minimo: 1,
            ubicacion: 'Almacén C - Área Especial'
        },

        // Equipo de Seguridad (Categoría 5)
        {
            id_herramienta: 12,
            id_categoria_herr: 5,
            nombre: 'Casco de Seguridad',
            marca: '3M',
            serial: '3M-CS-012',
            costo: 180.00,
            vida_util_meses: 24,
            stock_total: 25,
            stock_disponible: 18,
            stock_minimo: 10,
            ubicacion: 'Almacén D - EPP'
        },
        {
            id_herramienta: 13,
            id_categoria_herr: 5,
            nombre: 'Lentes de Seguridad',
            marca: 'Uvex',
            serial: 'UV-LS-013',
            costo: 95.00,
            vida_util_meses: 12,
            stock_total: 30,
            stock_disponible: 22,
            stock_minimo: 15,
            ubicacion: 'Almacén D - EPP'
        },
        {
            id_herramienta: 14,
            id_categoria_herr: 5,
            nombre: 'Guantes de Trabajo',
            marca: 'HexArmor',
            serial: 'HA-GT-014',
            costo: 120.00,
            vida_util_meses: 6,
            stock_total: 40,
            stock_disponible: 28,
            stock_minimo: 20,
            ubicacion: 'Almacén D - EPP'
        },

        // Maquinaria Pesada (Categoría 6)
        {
            id_herramienta: 15,
            id_categoria_herr: 6,
            nombre: 'Compresor de Aire 25 HP',
            marca: 'Ingersoll Rand',
            serial: 'IR-CA25-015',
            costo: 85000.00,
            vida_util_meses: 240,
            stock_total: 1,
            stock_disponible: 1,
            stock_minimo: 1,
            ubicacion: 'Patio de Maquinaria'
        },
        {
            id_herramienta: 16,
            id_categoria_herr: 6,
            nombre: 'Mezcladora de Concreto 1 Saco',
            marca: 'CIPSA',
            serial: 'CP-MC1S-016',
            costo: 12000.00,
            vida_util_meses: 120,
            stock_total: 2,
            stock_disponible: 1,
            stock_minimo: 1,
            ubicacion: 'Patio de Maquinaria'
        },

        // Herramientas de Soldadura (Categoría 7)
        {
            id_herramienta: 17,
            id_categoria_herr: 7,
            nombre: 'Soldadora Eléctrica 200A',
            marca: 'Lincoln Electric',
            serial: 'LE-SE200-017',
            costo: 8500.00,
            vida_util_meses: 120,
            stock_total: 2,
            stock_disponible: 1,
            stock_minimo: 1,
            ubicacion: 'Taller de Soldadura'
        },
        {
            id_herramienta: 18,
            id_categoria_herr: 7,
            nombre: 'Careta para Soldar Automática',
            marca: '3M Speedglas',
            serial: '3M-CSA-018',
            costo: 2200.00,
            vida_util_meses: 60,
            stock_total: 3,
            stock_disponible: 2,
            stock_minimo: 1,
            ubicacion: 'Taller de Soldadura'
        },

        // Herramientas de Pintura (Categoría 8)
        {
            id_herramienta: 19,
            id_categoria_herr: 8,
            nombre: 'Pistola para Pintar',
            marca: 'Wagner',
            serial: 'WG-PP-019',
            costo: 1800.00,
            vida_util_meses: 72,
            stock_total: 4,
            stock_disponible: 3,
            stock_minimo: 1,
            ubicacion: 'Almacén B - Estante 6'
        },
        {
            id_herramienta: 20,
            id_categoria_herr: 8,
            nombre: 'Rodillo para Pintura Grande',
            marca: 'Purdy',
            serial: 'PD-RPG-020',
            costo: 180.00,
            vida_util_meses: 24,
            stock_total: 15,
            stock_disponible: 11,
            stock_minimo: 5,
            ubicacion: 'Almacén B - Estante 6'
        }
    ];

    try {
        for (const herramienta of herramientasBasicas) {
            await Herramienta.findOrCreate({
                where: { id_herramienta: herramienta.id_herramienta },
                defaults: herramienta
            });
        }

        console.log('✅ Herramientas de ejemplo creadas o verificadas');
        return true;
    } catch (error) {
        console.error('❌ Error al crear herramientas:', error);
        return false;
    }
};

module.exports = { initHerramientas };