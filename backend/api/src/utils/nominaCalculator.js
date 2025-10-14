/**
 * Utilidades para el cálculo de nómina
 */

// Tablas fiscales (deben actualizarse según las vigentes)
const TABLAS_FISCALES = {
    SUA: {
        umaDiaria: 96.22 // UMA diaria 2024
    },
    IMSS: {
        empleado: {
            enfermedadYMaternidad: 0.004, // 0.40%
            invalidezYVida: 0.00625, // 0.625%
            guarderias: 0.01, // 1%
            retiro: 0.00 // 0%
        }
    }
};

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
 * Calcula las cuotas de IMSS del empleado
 * @param {Number} salarioBase - El salario base para el cálculo
 * @returns {Number} - El monto de IMSS a retener
 */
const calcularIMSS = (salarioBase) => {
    if (salarioBase <= 0) return 0;

    const cuotas = TABLAS_FISCALES.IMSS.empleado;
    const umaDiaria = TABLAS_FISCALES.SUA.umaDiaria;
    const maxSalarioBase = umaDiaria * 25; // 25 UMA
    
    // Limitar salario base a 25 UMA
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    const imssEmpleado = 
      salarioCotizable * cuotas.enfermedadYMaternidad +
      salarioCotizable * cuotas.invalidezYVida +
      salarioCotizable * cuotas.guarderias +
      salarioCotizable * cuotas.retiro;
    
    return Math.round(imssEmpleado * 100) / 100; // Redondear a 2 decimales
};

/**
 * Calcula las cuotas de Infonavit del empleado
 * @param {Number} salarioBase - El salario base para el cálculo
 * @returns {Number} - El monto de Infonavit a retener
 */
const calcularInfonavit = (salarioBase) => {
    if (salarioBase <= 0) return 0;

    const umaDiaria = TABLAS_FISCALES.SUA.umaDiaria;
    const maxSalarioBase = umaDiaria * 25; // 25 UMA
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    return Math.round(salarioCotizable * 0.05 * 100) / 100; // 5% del salario cotizable
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
 * @param {Boolean} aplicarIMSS - Si se debe aplicar IMSS (opcional, default true)
 * @param {Boolean} aplicarInfonavit - Si se debe aplicar Infonavit (opcional, default true)
 * @param {Number} deduccionesAdicionales - Otras deducciones (opcional)
 * @returns {Object} - Desglose del cálculo y monto total
 */
const calcularNomina = (
    diasLaborados, 
    pagoPorDia, 
    horasExtra = 0, 
    bonos = 0, 
    aplicarISR = true,
    aplicarIMSS = true,
    aplicarInfonavit = true,
    deduccionesAdicionales = 0
) => {
    // Cálculo de salario base
    const salarioBase = diasLaborados * pagoPorDia;
    
    // Cálculo de horas extra
    const montoHorasExtra = calcularHorasExtra(horasExtra, pagoPorDia);
    
    // Subtotal antes de deducciones
    const subtotal = salarioBase + montoHorasExtra + bonos;
    
    // Cálculo de deducciones
    const deducciones = {
        isr: aplicarISR ? calcularISR(subtotal) : 0,
        imss: aplicarIMSS ? calcularIMSS(subtotal) : 0,
        infonavit: aplicarInfonavit ? calcularInfonavit(subtotal) : 0,
        adicionales: parseFloat(deduccionesAdicionales) || 0
    };
    
    deducciones.total = deducciones.isr + deducciones.imss + deducciones.infonavit + deducciones.adicionales;
    
    // Monto final
    const montoTotal = subtotal - deducciones.total;
    
    return {
        salarioBase,
        montoHorasExtra,
        bonos,
        subtotal,
        deducciones,
        montoTotal
    };
};

module.exports = {
    calcularISR,
    calcularIMSS,
    calcularInfonavit,
    calcularHorasExtra,
    calcularNomina
};
