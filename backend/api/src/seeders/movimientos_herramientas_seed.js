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
            id_herramienta: 3,
            tipo_movimiento: 'Entrada',
            cantidad: 10,
            fecha_movimiento: '2024-01-16 08:00:00',
            id_proyecto: 1,
            id_usuario: 1,
            notas: 'Compra inicial de inventario - Llaves inglesas'
        },
        {
            id_movimiento: 4,
            id_herramienta: 4,
            tipo_movimiento: 'Entrada',
            cantidad: 5,
            fecha_movimiento: '2024-01-20 08:00:00',
            id_proyecto: 1,
            id_usuario: 1,
            notas: 'Adquisición de taladros percutores para proyecto'
        },
        {
            id_movimiento: 5,
            id_herramienta: 5,
            tipo_movimiento: 'Entrada',
            cantidad: 3,
            fecha_movimiento: '2024-01-22 08:00:00',
            id_proyecto: 1,
            id_usuario: 1,
            notas: 'Compra de sierras circulares para cortes de precisión'
        },
        // Salidas para proyectos
        {
            id_movimiento: 6,
            id_herramienta: 1,
            tipo_movimiento: 'Salida',
            cantidad: 3,
            fecha_movimiento: '2024-02-01 10:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Asignación de martillos para inicio de obra'
        },
        {
            id_movimiento: 7,
            id_herramienta: 2,
            tipo_movimiento: 'Salida',
            cantidad: 2,
            fecha_movimiento: '2024-02-01 11:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Entrega de destornilladores para instalaciones eléctricas'
        },
        {
            id_movimiento: 8,
            id_herramienta: 4,
            tipo_movimiento: 'Salida',
            cantidad: 2,
            fecha_movimiento: '2024-02-05 09:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Asignación de taladros para perforación en concreto'
        },
        // Algunas bajas por desgaste
        {
            id_movimiento: 9,
            id_herramienta: 1,
            tipo_movimiento: 'Baja',
            cantidad: 1,
            fecha_movimiento: '2024-03-15 14:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Martillo dañado por uso excesivo - reemplazo necesario'
        },
        {
            id_movimiento: 10,
            id_herramienta: 3,
            tipo_movimiento: 'Baja',
            cantidad: 2,
            fecha_movimiento: '2024-03-20 15:00:00',
            id_proyecto: 2,
            id_usuario: 1,
            notas: 'Llave inglesa dañada por uso excesivo - reemplazo necesario'
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