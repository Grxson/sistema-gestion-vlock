/**
 * Servicio para validaciones de nóminas
 * Maneja todas las validaciones de negocio relacionadas con nóminas
 */
export class ValidacionesNominaService {

  /**
   * Valida los datos de una nómina antes del procesamiento
   * @param {Object} datosNomina - Datos de la nómina a validar
   * @returns {Promise<Object>} Resultado de la validación
   */
  static async validarDatosNomina(datosNomina) {
    const errores = [];
    const advertencias = [];

    try {
      // Validaciones obligatorias
      this.validarCamposRequeridos(datosNomina, errores);
      
      // Validaciones de formato
      this.validarFormatos(datosNomina, errores, advertencias);
      
      // Validaciones de negocio
      await this.validarReglasNegocio(datosNomina, errores, advertencias);
      
      // Validaciones fiscales
      this.validarReglasFiscales(datosNomina, errores, advertencias);

      return {
        esValida: errores.length === 0,
        errores,
        advertencias,
        nivelRiesgo: this.calcularNivelRiesgo(errores, advertencias)
      };
    } catch (error) {
      console.error('Error validating nomina data:', error);
      return {
        esValida: false,
        errores: ['Error interno de validación'],
        advertencias: [],
        nivelRiesgo: 'alto'
      };
    }
  }

  /**
   * Valida que todos los campos requeridos estén presentes
   * @param {Object} datos - Datos a validar
   * @param {Array} errores - Array de errores
   */
  static validarCamposRequeridos(datos, errores) {
    const camposRequeridos = [
      { campo: 'id_empleado', nombre: 'ID de empleado' },
      { campo: 'id_semana', nombre: 'ID de semana' },
      { campo: 'id_proyecto', nombre: 'ID de proyecto' },
      { campo: 'dias_laborados', nombre: 'Días laborados' },
      { campo: 'pago_por_dia', nombre: 'Pago por día' }
    ];

    camposRequeridos.forEach(({ campo, nombre }) => {
      if (datos[campo] === undefined || datos[campo] === null || datos[campo] === '') {
        errores.push(`${nombre} es requerido`);
      }
    });
  }

  /**
   * Valida los formatos de los datos
   * @param {Object} datos - Datos a validar
   * @param {Array} errores - Array de errores
   * @param {Array} advertencias - Array de advertencias
   */
  static validarFormatos(datos, errores, advertencias) {
    // Validar tipos de datos
    if (datos.id_empleado && (!Number.isInteger(datos.id_empleado) || datos.id_empleado <= 0)) {
      errores.push('ID de empleado debe ser un número entero positivo');
    }

    if (datos.id_semana && (!Number.isInteger(datos.id_semana) || datos.id_semana < 1 || datos.id_semana > 4)) {
      errores.push('ID de semana debe ser un número entre 1 y 4');
    }

    if (datos.id_proyecto && (!Number.isInteger(datos.id_proyecto) || datos.id_proyecto <= 0)) {
      errores.push('ID de proyecto debe ser un número entero positivo');
    }

    if (datos.dias_laborados !== undefined) {
      if (!Number.isInteger(datos.dias_laborados) || datos.dias_laborados < 1 || datos.dias_laborados > 31) {
        errores.push('Días laborados debe ser un número entre 1 y 31');
      }
    }

    if (datos.pago_por_dia !== undefined) {
      const pago = parseFloat(datos.pago_por_dia);
      if (isNaN(pago) || pago <= 0) {
        errores.push('Pago por día debe ser un número positivo');
      } else if (pago > 10000) {
        advertencias.push('Pago por día parece muy alto (>$10,000)');
      } else if (pago < 100) {
        advertencias.push('Pago por día parece muy bajo (<$100)');
      }
    }

    if (datos.horas_extra !== undefined) {
      const horas = parseFloat(datos.horas_extra);
      if (isNaN(horas) || horas < 0) {
        errores.push('Horas extra debe ser un número positivo o cero');
      } else if (horas > 40) {
        advertencias.push('Horas extra muy altas (>40 horas)');
      }
    }

    if (datos.bonos !== undefined) {
      const bonos = parseFloat(datos.bonos);
      if (isNaN(bonos) || bonos < 0) {
        errores.push('Bonos debe ser un número positivo o cero');
      } else if (bonos > 5000) {
        advertencias.push('Bonos muy altos (>$5,000)');
      }
    }

    if (datos.deducciones_adicionales !== undefined) {
      const deducciones = parseFloat(datos.deducciones_adicionales);
      if (isNaN(deducciones) || deducciones < 0) {
        errores.push('Deducciones adicionales debe ser un número positivo o cero');
      } else if (deducciones > 2000) {
        advertencias.push('Deducciones adicionales muy altas (>$2,000)');
      }
    }
  }

  /**
   * Valida reglas de negocio
   * @param {Object} datos - Datos a validar
   * @param {Array} errores - Array de errores
   * @param {Array} advertencias - Array de advertencias
   */
  static async validarReglasNegocio(datos, errores, advertencias) {
    // Validar que el empleado esté activo
    try {
      // Aquí se podría hacer una llamada al servicio de empleados para validar
      // Por ahora, asumimos que se valida en el servicio de empleados
    } catch (error) {
      errores.push('No se pudo validar el estado del empleado');
    }

    // Validar límites de días laborados por semana
    if (datos.dias_laborados && datos.id_semana) {
      const diasPorSemana = this.getDiasMaximosPorSemana(datos.id_semana);
      if (datos.dias_laborados > diasPorSemana) {
        advertencias.push(`Días laborados (${datos.dias_laborados}) excede los días típicos de la semana ${datos.id_semana} (${diasPorSemana})`);
      }
    }

    // Validar coherencia entre días laborados y horas extra
    if (datos.dias_laborados && datos.horas_extra) {
      const horasPorDia = datos.horas_extra / datos.dias_laborados;
      if (horasPorDia > 12) {
        advertencias.push('Promedio de horas extra por día muy alto (>12 horas)');
      }
    }
  }

  /**
   * Valida reglas fiscales
   * @param {Object} datos - Datos a validar
   * @param {Array} errores - Array de errores
   * @param {Array} advertencias - Array de advertencias
   */
  static validarReglasFiscales(datos, errores, advertencias) {
    // Validar límites de salario para IMSS
    if (datos.pago_por_dia) {
      const salarioDiario = parseFloat(datos.pago_por_dia);
      const umaDiaria = 108.57; // UMA diaria 2024
      const maxSalarioIMSS = umaDiaria * 25; // 25 UMA
      
      if (salarioDiario > maxSalarioIMSS) {
        advertencias.push(`Salario diario ($${salarioDiario}) excede el tope de cotización IMSS ($${maxSalarioIMSS})`);
      }
    }

    // Validar aplicación de ISR
    if (datos.aplicar_isr !== undefined && typeof datos.aplicar_isr !== 'boolean') {
      errores.push('aplicar_isr debe ser un valor booleano');
    }

    // Validar límites de deducciones
    if (datos.deducciones_adicionales) {
      const deducciones = parseFloat(datos.deducciones_adicionales);
      const salarioBase = (datos.dias_laborados || 0) * (datos.pago_por_dia || 0);
      
      if (deducciones > salarioBase * 0.3) {
        advertencias.push('Deducciones adicionales exceden el 30% del salario base');
      }
    }
  }

  /**
   * Valida un período de nómina
   * @param {string} periodo - Período en formato YYYY-MM
   * @returns {Object} Resultado de la validación
   */
  static validarPeriodo(periodo) {
    const errores = [];
    
    if (!periodo || typeof periodo !== 'string') {
      errores.push('Período es requerido');
      return { esValido: false, errores };
    }

    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(periodo)) {
      errores.push('Período debe tener el formato YYYY-MM');
      return { esValido: false, errores };
    }

    const [año, mes] = periodo.split('-').map(Number);
    const añoActual = new Date().getFullYear();
    
    if (año < 2020 || año > añoActual + 1) {
      errores.push(`Año debe estar entre 2020 y ${añoActual + 1}`);
    }

    if (mes < 1 || mes > 12) {
      errores.push('Mes debe estar entre 1 y 12');
    }

    // Validar que no sea un período futuro muy lejano
    const ahora = new Date();
    const fechaPeriodo = new Date(año, mes - 1, 1);
    const mesesDiferencia = (fechaPeriodo.getFullYear() - ahora.getFullYear()) * 12 + 
                           (fechaPeriodo.getMonth() - ahora.getMonth());
    
    if (mesesDiferencia > 3) {
      errores.push('No se puede procesar nómina para períodos futuros mayores a 3 meses');
    }

    return {
      esValido: errores.length === 0,
      errores
    };
  }

  /**
   * Valida un empleado para nómina
   * @param {Object} empleado - Datos del empleado
   * @returns {Object} Resultado de la validación
   */
  static validarEmpleado(empleado) {
    const errores = [];
    const advertencias = [];

    if (!empleado) {
      errores.push('Empleado es requerido');
      return { esValido: false, errores, advertencias };
    }

    if (!empleado.activo) {
      errores.push('El empleado debe estar activo');
    }

    if (!empleado.nombre || !empleado.apellido) {
      errores.push('Nombre y apellido son requeridos');
    }

    if (!empleado.nss) {
      advertencias.push('NSS no registrado');
    }

    if (!empleado.rfc) {
      advertencias.push('RFC no registrado');
    }

    const pagoDiario = empleado.pago_diario || 
                      empleado.contrato?.salario_diario || 
                      empleado.salario_diario || 
                      empleado.salario_base_personal || 0;

    if (pagoDiario <= 0) {
      errores.push('Pago diario no configurado o inválido');
    }

    if (!empleado.id_proyecto) {
      advertencias.push('No tiene proyecto asignado');
    }

    if (!empleado.id_oficio) {
      advertencias.push('No tiene oficio asignado');
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias
    };
  }

  /**
   * Obtiene los días máximos por semana
   * @param {number} semana - Número de semana (1-4)
   * @returns {number} Días máximos
   */
  static getDiasMaximosPorSemana(semana) {
    const diasPorSemana = {
      1: 7, // Primera semana: hasta 7 días
      2: 7, // Segunda semana: hasta 7 días
      3: 7, // Tercera semana: hasta 7 días
      4: 9  // Cuarta semana: puede tener hasta 9 días (mes de 31 días)
    };
    
    return diasPorSemana[semana] || 7;
  }

  /**
   * Calcula el nivel de riesgo basado en errores y advertencias
   * @param {Array} errores - Lista de errores
   * @param {Array} advertencias - Lista de advertencias
   * @returns {string} Nivel de riesgo (bajo, medio, alto)
   */
  static calcularNivelRiesgo(errores, advertencias) {
    if (errores.length > 0) {
      return 'alto';
    }
    
    if (advertencias.length > 3) {
      return 'alto';
    }
    
    if (advertencias.length > 1) {
      return 'medio';
    }
    
    return 'bajo';
  }

  /**
   * Valida un cálculo de nómina
   * @param {Object} calculo - Resultado del cálculo
   * @returns {Object} Resultado de la validación
   */
  static validarCalculo(calculo) {
    const errores = [];
    const advertencias = [];

    if (!calculo) {
      errores.push('Cálculo es requerido');
      return { esValido: false, errores, advertencias };
    }

    // Validar que el monto total no sea negativo
    if (calculo.montoTotal < 0) {
      errores.push('El monto total no puede ser negativo');
    }

    // Validar que las deducciones no excedan el subtotal
    if (calculo.deducciones && calculo.deducciones.total > calculo.subtotal) {
      errores.push('Las deducciones no pueden exceder el subtotal');
    }

    // Validar ISR
    if (calculo.deducciones && calculo.deducciones.isr < 0) {
      errores.push('El ISR no puede ser negativo');
    }

    // Validar IMSS
    if (calculo.deducciones && calculo.deducciones.imss < 0) {
      errores.push('El IMSS no puede ser negativo');
    }

    // Advertencias por montos altos
    if (calculo.montoTotal > 50000) {
      advertencias.push('Monto total muy alto (>$50,000)');
    }

    if (calculo.deducciones && calculo.deducciones.total > calculo.subtotal * 0.4) {
      advertencias.push('Deducciones exceden el 40% del subtotal');
    }

    return {
      esValido: errores.length === 0,
      errores,
      advertencias,
      nivelRiesgo: this.calcularNivelRiesgo(errores, advertencias)
    };
  }
}
