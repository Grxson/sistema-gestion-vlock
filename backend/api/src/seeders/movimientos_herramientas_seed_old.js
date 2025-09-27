const { Op } = require('sequelize');

/**
 * Inicializar movimientos de herramientas de ejemplo
 */
const initMovimientosHerramientas = async (models) => {
    console.log('📦 Inicializando movimientos de herramientas...');

    const MovimientoHerramienta = models.Movimientos_herramienta;

    const movimientosBasicos = [
        // Entradas iniciales de inventario
        {
            id_movimiento: 1,
            id_herramienta: 1,
            tipo_movimiento: 'Entrada',
            cantidad: 15,
            fecha_movimiento: '2024-01-15 08:00:00',
            id_proyecto: 1,
            id_usuario: 1,
            notas: 'Compra inicial de inventario - Martillos de carpintero'
        },
        {
            id_movimiento: 2,
            id_herramienta: 2,
            tipo_movimiento: 'Entrada',
            cantidad: 8,
            fecha_movimiento: '2024-01-15 09:00:00',
            id_proyecto: 1,
            id_usuario: 1,
            notas: 'Compra inicial de inventario - Juegos de destornilladores'
        },
        {
            id_movimiento: 3,
            id_herramienta: 1,
            tipo_movimiento: 'Salida',
            cantidad: 3,
            fecha_movimiento: '2024-02-01 10:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Asignación de martillos para inicio de obra'
        },
        {
            id_movimiento: 4,
            id_herramienta: 2,
            tipo_movimiento: 'Salida',
            cantidad: 2,
            fecha_movimiento: '2024-02-01 11:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Entrega de destornilladores para instalaciones eléctricas'
        },
        {
            id_movimiento: 5,
            id_herramienta: 1,
            tipo_movimiento: 'Baja',
            cantidad: 1,
            fecha_movimiento: '2024-03-15 14:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Martillo dañado por uso excesivo - reemplazo necesario'
        }
    ];
        {
            id_movimiento: 3,
            id_herramienta: 3,
            tipo_movimiento: 'Entrada',
            cantidad: 10,
            fecha: '2024-01-16',
            id_proyecto: 1,
            motivo: 'Compra inicial de inventario - Llaves inglesas'
        },
        {
            id_movimiento: 4,
            id_herramienta: 4,
            tipo_movimiento: 'Entrada',
            cantidad: 5,
            fecha: '2024-01-20',
            id_proyecto: 1,
            motivo: 'Adquisición de taladros percutores para proyecto'
        },
        {
            id_movimiento: 5,
            id_herramienta: 5,
            tipo_movimiento: 'Entrada',
            cantidad: 3,
            fecha: '2024-01-22',
            id_proyecto: 1,
            motivo: 'Compra de sierras circulares para cortes de precisión'
        },

        // Salidas para proyectos
        {
            id_movimiento: 6,
            id_herramienta: 1,
            tipo_movimiento: 'Salida',
            cantidad: 3,
            fecha: '2024-02-01',
            id_proyecto: 2, // Complejo Residencial Norte
            motivo: 'Asignación de martillos para inicio de obra'
        },
        {
            id_movimiento: 7,
            id_herramienta: 2,
            tipo_movimiento: 'Salida',
            cantidad: 2,
            fecha: '2024-02-01',
            id_proyecto: 2,
            motivo: 'Entrega de destornilladores para instalaciones eléctricas'
        },
        {
            id_movimiento: 8,
            id_herramienta: 4,
            tipo_movimiento: 'Salida',
            cantidad: 2,
            fecha: '2024-02-05',
            id_proyecto: 2,
            motivo: 'Asignación de taladros para perforación en concreto'
        },
        {
            id_movimiento: 9,
            id_herramienta: 5,
            tipo_movimiento: 'Salida',
            cantidad: 1,
            fecha: '2024-02-10',
            id_proyecto: 3, // Centro Comercial Sur
            motivo: 'Sierra circular para cortes estructurales'
        },
        {
            id_movimiento: 10,
            id_herramienta: 6,
            tipo_movimiento: 'Entrada',
            cantidad: 6,
            fecha: '2024-02-15',
            id_proyecto: 1,
            motivo: 'Compra adicional de esmerilodoras angulares'
        },

        // Más movimientos para EPP
        {
            id_movimiento: 11,
            id_herramienta: 12,
            tipo_movimiento: 'Entrada',
            cantidad: 25,
            fecha: '2024-01-10',
            id_proyecto: 1,
            motivo: 'Adquisición inicial de cascos de seguridad'
        },
        {
            id_movimiento: 12,
            id_herramienta: 12,
            tipo_movimiento: 'Salida',
            cantidad: 7,
            fecha: '2024-02-01',
            id_proyecto: 2,
            motivo: 'Distribución de cascos para nuevo equipo de trabajo'
        },
        {
            id_movimiento: 13,
            id_herramienta: 13,
            tipo_movimiento: 'Entrada',
            cantidad: 30,
            fecha: '2024-01-12',
            id_proyecto: 1,
            motivo: 'Compra de lentes de seguridad para todo el personal'
        },
        {
            id_movimiento: 14,
            id_herramienta: 13,
            tipo_movimiento: 'Salida',
            cantidad: 8,
            fecha: '2024-02-03',
            id_proyecto: 2,
            motivo: 'Entrega de lentes de seguridad al equipo de soldadura'
        },
        {
            id_movimiento: 15,
            id_herramienta: 14,
            tipo_movimiento: 'Entrada',
            cantidad: 40,
            fecha: '2024-01-18',
            id_proyecto: 1,
            motivo: 'Stock inicial de guantes de trabajo'
        },
        {
            id_movimiento: 16,
            id_herramienta: 14,
            tipo_movimiento: 'Salida',
            cantidad: 12,
            fecha: '2024-02-01',
            id_proyecto: 2,
            motivo: 'Distribución de guantes para trabajos de construcción'
        },

        // Movimientos de maquinaria pesada
        {
            id_movimiento: 17,
            id_herramienta: 15,
            tipo_movimiento: 'Entrada',
            cantidad: 1,
            fecha: '2024-01-25',
            id_proyecto: 1,
            motivo: 'Adquisición de compresor de aire para herramientas neumáticas'
        },
        {
            id_movimiento: 18,
            id_herramienta: 16,
            tipo_movimiento: 'Entrada',
            cantidad: 2,
            fecha: '2024-01-28',
            id_proyecto: 1,
            motivo: 'Compra de mezcladoras para preparación de concreto'
        },
        {
            id_movimiento: 19,
            id_herramienta: 16,
            tipo_movimiento: 'Salida',
            cantidad: 1,
            fecha: '2024-03-01',
            id_proyecto: 3,
            motivo: 'Asignación de mezcladora para Centro Comercial Sur'
        },

        // Movimientos de herramientas especializadas
        {
            id_movimiento: 20,
            id_herramienta: 17,
            tipo_movimiento: 'Entrada',
            cantidad: 2,
            fecha: '2024-02-10',
            id_proyecto: 1,
            motivo: 'Adquisición de soldadoras para trabajos estructurales'
        },
        {
            id_movimiento: 21,
            id_herramienta: 17,
            tipo_movimiento: 'Salida',
            cantidad: 1,
            fecha: '2024-02-20',
            id_proyecto: 2,
            motivo: 'Traslado de soldadora para trabajos en Complejo Norte'
        },
        {
            id_movimiento: 22,
            id_herramienta: 18,
            tipo_movimiento: 'Entrada',
            cantidad: 3,
            fecha: '2024-02-12',
            id_proyecto: 1,
            motivo: 'Compra de caretas automáticas para soldadores'
        },
        {
            id_movimiento: 23,
            id_herramienta: 18,
            tipo_movimiento: 'Salida',
            cantidad: 1,
            fecha: '2024-02-22',
            id_proyecto: 2,
            motivo: 'Asignación de careta para soldador del equipo Norte'
        },

        // Bajas por desgaste o daños
        {
            id_movimiento: 24,
            id_herramienta: 8,
            tipo_movimiento: 'Entrada',
            cantidad: 20,
            fecha: '2024-01-08',
            id_proyecto: 1,
            motivo: 'Stock inicial de flexómetros'
        },
        {
            id_movimiento: 25,
            id_herramienta: 8,
            tipo_movimiento: 'Salida',
            cantidad: 5,
            fecha: '2024-02-15',
            id_proyecto: 2,
            motivo: 'Distribución de flexómetros para mediciones'
        },
        {
            id_movimiento: 26,
            id_herramienta: 19,
            tipo_movimiento: 'Entrada',
            cantidad: 4,
            fecha: '2024-03-01',
            id_proyecto: 1,
            motivo: 'Adquisición de pistolas para pintar'
        },
        {
            id_movimiento: 27,
            id_herramienta: 19,
            tipo_movimiento: 'Salida',
            cantidad: 1,
            fecha: '2024-03-10',
            id_proyecto: 3,
            motivo: 'Asignación para trabajos de acabados'
        },
        {
            id_movimiento: 28,
            id_herramienta: 20,
            tipo_movimiento: 'Entrada',
            cantidad: 15,
            fecha: '2024-03-05',
            id_proyecto: 1,
            motivo: 'Compra de rodillos para pintura'
        },
        {
            id_movimiento: 29,
            id_herramienta: 20,
            tipo_movimiento: 'Salida',
            cantidad: 4,
            fecha: '2024-03-15',
            id_proyecto: 3,
            motivo: 'Entrega de rodillos para acabados interiores'
        },
        {
            id_movimiento: 30,
            id_herramienta: 3,
            tipo_movimiento: 'Baja',
            cantidad: 2,
            fecha: '2024-03-20',
            id_proyecto: 2,
            motivo: 'Llave inglesa dañada por uso excesivo - reemplazo necesario'
        }
    ];

    try {
        for (const movimiento of movimientosBasicos) {
            await MovimientoHerramienta.findOrCreate({
                where: { id_movimiento: movimiento.id_movimiento },
                defaults: movimiento
            });
        }

        console.log('✅ Movimientos de herramientas creados o verificados');
        return true;
    } catch (error) {
        console.error('❌ Error al crear movimientos de herramientas:', error);
        return false;
    }
};

module.exports = { initMovimientosHerramientas };