/**
 * Utilidades para el cálculo de nómina
 */

// Tablas fiscales (deben actualizarse según las vigentes)
const TABLAS_FISCALES = {
    ISR: {
        // Tabla de ISR mensual 2024 (igual que el frontend)
        mensual: [
            { desde: 0.01, hasta: 644.58, cuotaFija: 0, porcentaje: 1.92 },
            { desde: 644.59, hasta: 5470.92, cuotaFija: 12.38, porcentaje: 6.40 },
            { desde: 5470.93, hasta: 9614.66, cuotaFija: 321.26, porcentaje: 10.88 },
            { desde: 9614.67, hasta: 11176.62, cuotaFija: 772.10, porcentaje: 16.00 },
            { desde: 11176.63, hasta: 13381.47, cuotaFija: 1022.01, porcentaje: 17.92 },
            { desde: 13381.48, hasta: 26988.50, cuotaFija: 1417.12, porcentaje: 21.36 },
            { desde: 26988.51, hasta: 42537.58, cuotaFija: 4323.58, porcentaje: 23.52 },
            { desde: 42537.59, hasta: 81211.25, cuotaFija: 7980.73, porcentaje: 30.00 },
            { desde: 81211.26, hasta: 108281.67, cuotaFija: 19582.83, porcentaje: 32.00 },
            { desde: 108281.68, hasta: 324845.01, cuotaFija: 28245.36, porcentaje: 34.00 },
            { desde: 324845.02, hasta: 999999999, cuotaFija: 101876.90, porcentaje: 35.00 }
        ]
    },
    SUA: {
        maxSalarioBase: 25 * 365.25, // 25 UMA anual (igual que el frontend)
        umaDiaria: 108.57 // UMA diaria 2024 (igual que el frontend)
    },
    IMSS: {
        empleado: {
            enfermedadYMaternidad: 0.004, // 0.40%
            invalidezYVida: 0.00625, // 0.625%
            guarderias: 0.001, // 0.10% (igual que frontend)
            retiro: 0.00 // 0%
        }
    }
};

/**
 * Calcula el ISR basado en las tablas fiscales vigentes
 * @param {Number} montoBase - El monto base para cálculo (antes de impuestos)
 * @returns {Number} - El monto de ISR a retener
 */
const calcularISR = (montoBase) => {
    if (montoBase <= 0) return 0;

    const tabla = TABLAS_FISCALES.ISR.mensual;
    
    for (const tramo of tabla) {
        if (montoBase >= tramo.desde && montoBase <= tramo.hasta) {
            const excedente = montoBase - tramo.desde;
            const impuestoMarginal = excedente * (tramo.porcentaje / 100);
            return tramo.cuotaFija + impuestoMarginal;
        }
    }
    
    // Si no encuentra tramo, aplicar el último (mayor)
    const ultimoTramo = tabla[tabla.length - 1];
    const excedente = montoBase - ultimoTramo.desde;
    const impuestoMarginal = excedente * (ultimoTramo.porcentaje / 100);
    return ultimoTramo.cuotaFija + impuestoMarginal;
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
    const maxSalarioBase = umaDiaria * 25; // 25 UMA diarias (igual que frontend)
    
    // Limitar salario base a 25 UMA diarias
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    const imssEmpleado = 
      salarioCotizable * cuotas.enfermedadYMaternidad +
      salarioCotizable * cuotas.invalidezYVida +
      salarioCotizable * cuotas.guarderias +
      salarioCotizable * cuotas.retiro;
    
    return imssEmpleado; // Sin redondeo, igual que el frontend
};

/**
 * Calcula las cuotas de Infonavit del empleado
 * @param {Number} salarioBase - El salario base para el cálculo
 * @returns {Number} - El monto de Infonavit a retener
 */
const calcularInfonavit = (salarioBase) => {
    if (salarioBase <= 0) return 0;

    const umaDiaria = TABLAS_FISCALES.SUA.umaDiaria;
    const maxSalarioBase = umaDiaria * 25; // 25 UMA diarias (igual que frontend)
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    return salarioCotizable * 0.05; // 5% del salario cotizable, sin redondeo
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
