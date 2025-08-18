/**
 * Utilidades para el cálculo de nómina
 */

/**
 * Calcula el ISR simplificado basado en el monto
 * Esta es una implementación básica, debe ajustarse según las tablas fiscales vigentes
 * @param {Number} montoBase - El monto base para cálculo (antes de impuestos)
 * @returns {Number} - El monto de ISR a retener
 */
const calcularISR = (montoBase) => {
    // Implementación simplificada - debe ajustarse a las tablas fiscales vigentes
    if (montoBase <= 0) return 0;
    
    // Ejemplo simplificado de tabla de ISR
    if (montoBase <= 1000) {
        return montoBase * 0.01; // 1%
    } else if (montoBase <= 5000) {
        return 10 + (montoBase - 1000) * 0.06; // 6%
    } else if (montoBase <= 10000) {
        return 250 + (montoBase - 5000) * 0.10; // 10%
    } else {
        return 750 + (montoBase - 10000) * 0.16; // 16%
    }
};

/**
 * Calcula el pago de horas extra
 * @param {Number} horasExtra - Cantidad de horas extra trabajadas
 * @param {Number} pagoPorDia - Pago diario del empleado
 * @returns {Number} - El monto a pagar por horas extra
 */
const calcularHorasExtra = (horasExtra, pagoPorDia) => {
    const pagoPorHora = pagoPorDia / 8; // Asumiendo jornada de 8 horas
    return horasExtra * (pagoPorHora * 2); // Doble pago por horas extra
};

/**
 * Calcula el monto total de la nómina incluyendo deducciones y bonos
 * @param {Number} diasLaborados - Cantidad de días laborados
 * @param {Number} pagoPorDia - Pago por día del empleado
 * @param {Number} horasExtra - Horas extra trabajadas (opcional)
 * @param {Number} bonos - Monto de bonos (opcional)
 * @param {Boolean} aplicarISR - Si se debe aplicar ISR (opcional, default true)
 * @param {Number} deduccionesAdicionales - Otras deducciones (opcional)
 * @returns {Object} - Desglose del cálculo y monto total
 */
const calcularNomina = (
    diasLaborados, 
    pagoPorDia, 
    horasExtra = 0, 
    bonos = 0, 
    aplicarISR = true,
    deduccionesAdicionales = 0
) => {
    // Cálculo de salario base
    const salarioBase = diasLaborados * pagoPorDia;
    
    // Cálculo de horas extra
    const montoHorasExtra = calcularHorasExtra(horasExtra, pagoPorDia);
    
    // Subtotal antes de deducciones
    const subtotal = salarioBase + montoHorasExtra + bonos;
    
    // Cálculo de ISR
    const isr = aplicarISR ? calcularISR(subtotal) : 0;
    
    // Total de deducciones
    const totalDeducciones = isr + deduccionesAdicionales;
    
    // Monto final
    const montoTotal = subtotal - totalDeducciones;
    
    return {
        salarioBase,
        montoHorasExtra,
        bonos,
        subtotal,
        deducciones: {
            isr,
            adicionales: deduccionesAdicionales,
            total: totalDeducciones
        },
        montoTotal
    };
};

module.exports = {
    calcularISR,
    calcularHorasExtra,
    calcularNomina
};
