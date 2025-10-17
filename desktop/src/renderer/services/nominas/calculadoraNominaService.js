import ApiService from '../api.js';

/**
 * Servicio para cálculos de nómina
 * Maneja todos los cálculos fiscales y de prestaciones
 */
export class CalculadoraNominaService {
  
  /**
   * Tablas fiscales actualizadas (deben mantenerse actualizadas)
   */
  static TABLAS_FISCALES = {
    ISR: {
      // Tabla de ISR mensual 2024 (ejemplo - debe actualizarse anualmente)
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
        { desde: 324845.02, hasta: Infinity, cuotaFija: 101876.90, porcentaje: 35.00 }
      ]
    },
    IMSS: {
      // Cuotas IMSS 2024 (ejemplo - debe actualizarse anualmente)
      empleado: {
        enfermedadYMaternidad: 0.004, // 0.40%
        invalidezYVida: 0.00625, // 0.625%
        guarderias: 0.001, // 0.10%
        retiro: 0.0000 // 0.00%
      },
      patron: {
        enfermedadYMaternidad: 0.0105, // 1.05%
        invalidezYVida: 0.0175, // 1.75%
        guarderias: 0.001, // 0.10%
        retiro: 0.0200, // 2.00%
        riesgosTrabajo: 0.0050, // 0.50%
        infonavit: 0.05 // 5.00%
      }
    },
    SUA: {
      // Sistema Único de Autodeterminación
      maxSalarioBase: 25 * 365.25, // 25 UMA anual
      umaDiaria: 108.57 // UMA diaria 2024
    }
  };

  /**
   * Calcula una nómina completa
   * @param {Object} datosNomina - Datos de la nómina
   * @returns {Promise<Object>} Cálculo completo de la nómina
   */
  static async calcularNomina(datosNomina) {
    try {
      const {
        diasLaborados,
        pagoPorDia,
        horasExtra = 0,
        bonos = 0,
        deduccionesAdicionales = 0,
        aplicarISR = true,
        aplicarIMSS = true,
        aplicarInfonavit = true,
        esPagoSemanal = false
      } = datosNomina;

      // Validar datos básicos
      if (!diasLaborados || diasLaborados <= 0) {
        throw new Error('Los días laborados deben ser mayor a 0');
      }
      if (!pagoPorDia || pagoPorDia <= 0) {
        throw new Error('El pago por día debe ser mayor a 0');
      }

      // Para pago semanal: el salario base ES el pago semanal directamente
      const salarioBase = pagoPorDia; // pagoPorDia contiene el pago semanal completo
      
      // Cálculo de horas extra (basándose en pago semanal)
      const pagoParaHorasExtra = pagoPorDia / 6; // Convertir pago semanal a diario para horas extra (semana de 6 días)
      const montoHorasExtra = this.calcularHorasExtra(horasExtra, pagoParaHorasExtra);
      
      // Subtotal antes de deducciones
      const subtotal = salarioBase + montoHorasExtra + bonos;
      
      // Cálculo de deducciones
      const deducciones = {
        isr: aplicarISR ? this.calcularISR(subtotal) : 0,
        imss: aplicarIMSS ? this.calcularIMSS(subtotal) : 0,
        infonavit: aplicarInfonavit ? this.calcularInfonavit(subtotal) : 0,
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
        montoTotal,
        totalAPagar: montoTotal, // Alias para compatibilidad con NominaWizard
        desglose: this.generarDesglose(datosNomina, {
          salarioBase,
          montoHorasExtra,
          bonos,
          subtotal,
          deducciones,
          montoTotal
        })
      };
    } catch (error) {
      console.error('Error calculating nomina:', error);
      throw error;
    }
  }

  /**
   * Calcula el ISR según las tablas fiscales
   * @param {number} montoBase - Monto base para el cálculo
   * @returns {number} Monto de ISR a retener
   */
  static calcularISR(montoBase) {
    if (montoBase <= 0) return 0;

    const tabla = this.TABLAS_FISCALES.ISR.mensual;
    
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
  }

  /**
   * Calcula las cuotas de IMSS del empleado
   * @param {number} salarioBase - Salario base del empleado
   * @returns {number} Monto de IMSS del empleado
   */
  static calcularIMSS(salarioBase) {
    if (salarioBase <= 0) return 0;

    const cuotas = this.TABLAS_FISCALES.IMSS.empleado;
    const umaDiaria = this.TABLAS_FISCALES.SUA.umaDiaria;
    const maxSalarioBase = umaDiaria * 25; // 25 UMA
    
    // Limitar salario base a 25 UMA
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    const imssEmpleado = 
      salarioCotizable * cuotas.enfermedadYMaternidad +
      salarioCotizable * cuotas.invalidezYVida +
      salarioCotizable * cuotas.guarderias +
      salarioCotizable * cuotas.retiro;
    
    return imssEmpleado;
  }

  /**
   * Calcula la aportación a Infonavit
   * @param {number} salarioBase - Salario base del empleado
   * @returns {number} Monto de Infonavit
   */
  static calcularInfonavit(salarioBase) {
    if (salarioBase <= 0) return 0;

    const umaDiaria = this.TABLAS_FISCALES.SUA.umaDiaria;
    const maxSalarioBase = umaDiaria * 25; // 25 UMA
    const salarioCotizable = Math.min(salarioBase, maxSalarioBase);
    
    return salarioCotizable * 0.05; // 5% del salario cotizable
  }

  /**
   * Calcula el pago de horas extra
   * @param {number} horasExtra - Cantidad de horas extra trabajadas
   * @param {number} pagoPorDia - Pago diario del empleado (calculado desde pago semanal)
   * @returns {number} El monto a pagar por horas extra
   */
  static calcularHorasExtra(horasExtra, pagoPorDia) {
    if (horasExtra <= 0) return 0;

    const pagoPorHora = pagoPorDia / 8; // Asumiendo jornada de 8 horas
    const pagoHorasExtra = pagoPorHora * 2; // Doble pago por horas extra
    return horasExtra * pagoHorasExtra;
  }

  /**
   * Calcula prestaciones de ley
   * @param {Object} datosEmpleado - Datos del empleado
   * @param {number} salarioBase - Salario base
   * @returns {Object} Prestaciones calculadas
   */
  static calcularPrestaciones(datosEmpleado, salarioBase) {
    const diasTrabajados = datosEmpleado.diasTrabajados || 365;
    const antiguedadAnios = datosEmpleado.antiguedadAnios || 1;
    
    return {
      vacaciones: this.calcularVacaciones(salarioBase, antiguedadAnios),
      aguinaldo: this.calcularAguinaldo(salarioBase, diasTrabajados),
      primaVacacional: this.calcularPrimaVacacional(salarioBase, antiguedadAnios)
    };
  }

  /**
   * Calcula días de vacaciones según antigüedad
   * @param {number} antiguedadAnios - Antigüedad en años
   * @returns {number} Días de vacaciones
   */
  static calcularDiasVacaciones(antiguedadAnios) {
    if (antiguedadAnios < 1) return 6;
    if (antiguedadAnios < 2) return 8;
    if (antiguedadAnios < 3) return 10;
    if (antiguedadAnios < 4) return 12;
    if (antiguedadAnios < 5) return 14;
    if (antiguedadAnios < 10) return 16;
    if (antiguedadAnios < 15) return 18;
    if (antiguedadAnios < 20) return 20;
    return 22; // 20+ años
  }

  /**
   * Calcula el monto de vacaciones
   * @param {number} salarioBase - Salario base
   * @param {number} antiguedadAnios - Antigüedad en años
   * @returns {number} Monto de vacaciones
   */
  static calcularVacaciones(salarioBase, antiguedadAnios) {
    const diasVacaciones = this.calcularDiasVacaciones(antiguedadAnios);
    return (salarioBase / 30) * diasVacaciones;
  }

  /**
   * Calcula el aguinaldo
   * @param {number} salarioBase - Salario base
   * @param {number} diasTrabajados - Días trabajados en el año
   * @returns {number} Monto del aguinaldo
   */
  static calcularAguinaldo(salarioBase, diasTrabajados) {
    const aguinaldoAnual = salarioBase * 15; // 15 días de salario
    return (aguinaldoAnual / 365) * diasTrabajados;
  }

  /**
   * Calcula la prima vacacional
   * @param {number} salarioBase - Salario base
   * @param {number} antiguedadAnios - Antigüedad en años
   * @returns {number} Monto de prima vacacional
   */
  static calcularPrimaVacacional(salarioBase, antiguedadAnios) {
    const diasVacaciones = this.calcularDiasVacaciones(antiguedadAnios);
    const primaVacacional = (salarioBase / 30) * diasVacaciones * 0.25; // 25% de prima
    return primaVacacional;
  }

  /**
   * Obtiene el total de salarios mensuales de empleados activos
   * @returns {Promise<number>} Total de salarios mensuales
   */
  static async getTotalSalariosMensuales() {
    try {
      // Obtener empleados activos desde la API
      const response = await ApiService.get('/empleados?activo=true');
      const empleados = response.empleados || response.data || [];
      
      // Calcular total mensual (asumiendo 6 días por semana, 4 semanas por mes = 24 días)
      const diasPorMes = 24;
      const totalMensual = empleados.reduce((total, empleado) => {
        const salarioDiario = empleado.pago_semanal ? empleado.pago_semanal / 6 : empleado.contrato?.salario_diario || 0;
        return total + (salarioDiario * diasPorMes);
      }, 0);
      
      console.log('💰 [CALCULADORA] Total salarios mensuales calculado:', totalMensual);
      return totalMensual;
    } catch (error) {
      console.error('Error calculating total monthly salaries:', error);
      return 0;
    }
  }

  /**
   * Genera un desglose detallado del cálculo
   * @param {Object} datosNomina - Datos originales
   * @param {Object} calculo - Resultado del cálculo
   * @returns {Object} Desglose detallado
   */
  static generarDesglose(datosNomina, calculo) {
    return {
      periodo: datosNomina.periodo || 'N/A',
      empleado: datosNomina.empleado || {},
      diasLaborados: datosNomina.diasLaborados,
      pagoPorDia: datosNomina.pagoPorDia,
      esPagoSemanal: datosNomina.esPagoSemanal || false,
      horasExtra: datosNomina.horasExtra || 0,
      bonos: datosNomina.bonos || 0,
      deduccionesAdicionales: datosNomina.deduccionesAdicionales || 0,
      aplicaciones: {
        isr: datosNomina.aplicarISR || false,
        imss: datosNomina.aplicarIMSS || false,
        infonavit: datosNomina.aplicarInfonavit || false
      },
      calculos: calculo,
      fechaCalculo: new Date().toISOString()
    };
  }

  /**
   * Valida que los cálculos sean correctos
   * @param {Object} calculo - Resultado del cálculo
   * @returns {Object} Resultado de la validación
   */
  static validarCalculo(calculo) {
    const errores = [];
    
    if (calculo.montoTotal < 0) {
      errores.push('El monto total no puede ser negativo');
    }
    
    if (calculo.deducciones.total > calculo.subtotal) {
      errores.push('Las deducciones no pueden ser mayores al subtotal');
    }
    
    if (calculo.deducciones.isr < 0 || calculo.deducciones.imss < 0) {
      errores.push('Las deducciones fiscales no pueden ser negativas');
    }
    
    return {
      esValida: errores.length === 0,
      errores
    };
  }
}
