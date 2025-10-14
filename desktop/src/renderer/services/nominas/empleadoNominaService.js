import ApiService from '../api.js';

/**
 * Servicio para gestión de empleados en el contexto de nóminas
 * Maneja operaciones específicas relacionadas con empleados para nóminas
 */
export class EmpleadoNominaService {
  static cache = new Map();
  static cacheTimeout = 10 * 60 * 1000; // 10 minutos (más tiempo que nóminas)

  /**
   * Obtiene todos los empleados activos
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Lista de empleados activos
   */
  static async getEmpleadosActivos(filtros = {}) {
    const cacheKey = `empleados_activos_${JSON.stringify(filtros)}`;
    
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const params = new URLSearchParams();
      params.append('activo', 'true');
      
      // Agregar filtros adicionales
      if (filtros.proyecto_id) params.append('proyecto', filtros.proyecto_id);
      if (filtros.oficio_id) params.append('oficio', filtros.oficio_id);
      if (filtros.tiene_pago) params.append('tiene_pago', filtros.tiene_pago);

      const response = await ApiService.get(`/empleados?${params.toString()}`);
      const empleados = response.empleados || response.data || [];
      
      // Filtrar solo empleados activos y con datos completos
      const empleadosActivos = empleados.filter(emp => 
        emp.activo === true || emp.activo === 1
      );

      // Guardar en caché
      this.cache.set(cacheKey, {
        data: empleadosActivos,
        timestamp: Date.now()
      });

      return empleadosActivos;
    } catch (error) {
      console.error('Error fetching active employees:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene empleados por proyecto
   * @param {number} proyectoId - ID del proyecto
   * @returns {Promise<Array>} Lista de empleados del proyecto
   */
  static async getEmpleadosPorProyecto(proyectoId) {
    return this.getEmpleadosActivos({ proyecto_id: proyectoId });
  }

  /**
   * Obtiene empleados con pago configurado
   * @returns {Promise<Array>} Lista de empleados con pago
   */
  static async getEmpleadosConPago() {
    const empleados = await this.getEmpleadosActivos();
    return empleados.filter(emp => 
      emp.pago_diario > 0 || 
      emp.contrato?.salario_diario > 0 ||
      emp.salario_diario > 0 ||
      emp.salario_base_personal > 0
    );
  }

  /**
   * Obtiene empleados sin pago configurado
   * @returns {Promise<Array>} Lista de empleados sin pago
   */
  static async getEmpleadosSinPago() {
    const empleados = await this.getEmpleadosActivos();
    return empleados.filter(emp => 
      !emp.pago_diario && 
      !emp.contrato?.salario_diario &&
      !emp.salario_diario &&
      !emp.salario_base_personal
    );
  }

  /**
   * Obtiene un empleado por ID con información completa para nómina
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<Object>} Empleado con información completa
   */
  static async getEmpleadoParaNomina(empleadoId) {
    try {
      const response = await ApiService.get(`/empleados/${empleadoId}?include=contrato,oficio,proyecto`);
      const empleado = response.empleado || response.data;
      
      if (!empleado) {
        throw new Error('Empleado no encontrado');
      }

      // Validar que el empleado esté activo
      if (!empleado.activo) {
        throw new Error('El empleado no está activo');
      }

      // Obtener pago diario de diferentes fuentes
      const pagoDiario = empleado.pago_diario || 
                        empleado.contrato?.salario_diario || 
                        empleado.salario_diario || 
                        empleado.salario_base_personal || 0;

      return {
        ...empleado,
        pago_diario_efectivo: pagoDiario,
        tiene_pago_configurado: pagoDiario > 0
      };
    } catch (error) {
      console.error('Error fetching employee for payroll:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Valida que un empleado pueda recibir nómina
   * @param {number} empleadoId - ID del empleado
   * @returns {Promise<Object>} Resultado de la validación
   */
  static async validarEmpleadoParaNomina(empleadoId) {
    try {
      const empleado = await this.getEmpleadoParaNomina(empleadoId);
      const errores = [];
      const advertencias = [];

      // Validaciones obligatorias
      if (!empleado.nombre || !empleado.apellido) {
        errores.push('Faltan datos personales básicos');
      }

      if (!empleado.nss) {
        advertencias.push('NSS no registrado');
      }

      if (!empleado.rfc) {
        advertencias.push('RFC no registrado');
      }

      if (!empleado.tiene_pago_configurado) {
        errores.push('No tiene pago diario configurado');
      }

      if (!empleado.id_oficio) {
        advertencias.push('No tiene oficio asignado');
      }

      if (!empleado.id_proyecto) {
        advertencias.push('No tiene proyecto asignado');
      }

      return {
        esValido: errores.length === 0,
        errores,
        advertencias,
        empleado
      };
    } catch (error) {
      return {
        esValido: false,
        errores: [error.message],
        advertencias: [],
        empleado: null
      };
    }
  }

  /**
   * Obtiene empleados elegibles para nómina en un período
   * @param {string} periodo - Período en formato YYYY-MM
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Lista de empleados elegibles
   */
  static async getEmpleadosElegiblesParaNomina(periodo, filtros = {}) {
    try {
      const empleados = await this.getEmpleadosActivos(filtros);
      const empleadosElegibles = [];

      for (const empleado of empleados) {
        const validacion = await this.validarEmpleadoParaNomina(empleado.id_empleado);
        if (validacion.esValido) {
          empleadosElegibles.push({
            ...validacion.empleado,
            validacion,
            elegible: true
          });
        } else {
          // Incluir empleados no elegibles con información de por qué
          empleadosElegibles.push({
            ...empleado,
            validacion,
            elegible: false
          });
        }
      }

      return empleadosElegibles;
    } catch (error) {
      console.error('Error getting eligible employees for payroll:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de empleados
   * @returns {Promise<Object>} Estadísticas de empleados
   */
  static async getEstadisticasEmpleados() {
    try {
      const [empleadosActivos, empleadosConPago, empleadosSinPago] = await Promise.all([
        this.getEmpleadosActivos(),
        this.getEmpleadosConPago(),
        this.getEmpleadosSinPago()
      ]);

      const totalSalariosMensuales = empleadosConPago.reduce((sum, emp) => {
        const pagoDiario = emp.pago_diario || 
                          emp.contrato?.salario_diario || 
                          emp.salario_diario || 
                          emp.salario_base_personal || 0;
        return sum + (pagoDiario * 30); // 30 días por mes
      }, 0);

      return {
        totalActivos: empleadosActivos.length,
        conPagoConfigurado: empleadosConPago.length,
        sinPagoConfigurado: empleadosSinPago.length,
        totalSalariosMensuales,
        promedioSalarioMensual: empleadosConPago.length > 0 ? 
          totalSalariosMensuales / empleadosConPago.length : 0
      };
    } catch (error) {
      console.error('Error getting employee statistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene empleados por oficio
   * @param {number} oficioId - ID del oficio
   * @returns {Promise<Array>} Lista de empleados del oficio
   */
  static async getEmpleadosPorOficio(oficioId) {
    return this.getEmpleadosActivos({ oficio_id: oficioId });
  }

  /**
   * Busca empleados por término
   * @param {string} termino - Término de búsqueda
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Lista de empleados encontrados
   */
  static async buscarEmpleados(termino, filtros = {}) {
    try {
      const empleados = await this.getEmpleadosActivos(filtros);
      
      if (!termino || termino.trim() === '') {
        return empleados;
      }

      const terminoLower = termino.toLowerCase();
      return empleados.filter(emp => 
        emp.nombre?.toLowerCase().includes(terminoLower) ||
        emp.apellido?.toLowerCase().includes(terminoLower) ||
        emp.nss?.includes(termino) ||
        emp.rfc?.toLowerCase().includes(terminoLower) ||
        emp.oficio?.nombre?.toLowerCase().includes(terminoLower) ||
        emp.proyecto?.nombre?.toLowerCase().includes(terminoLower)
      );
    } catch (error) {
      console.error('Error searching employees:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza el pago diario de un empleado
   * @param {number} empleadoId - ID del empleado
   * @param {number} pagoDiario - Nuevo pago diario
   * @returns {Promise<Object>} Resultado de la actualización
   */
  static async actualizarPagoDiario(empleadoId, pagoDiario) {
    try {
      const response = await ApiService.updateEmpleado(empleadoId, { pago_diario: pagoDiario });
      
      // Limpiar caché
      this.clearCache();
      
      return {
        success: true,
        data: response.data || response,
        message: 'Pago diario actualizado exitosamente'
      };
    } catch (error) {
      console.error('Error updating daily payment:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Limpia el caché
   */
  static clearCache() {
    this.cache.clear();
  }

  /**
   * Maneja errores de manera consistente
   * @param {Error} error - Error capturado
   * @returns {Error} Error formateado
   */
  static handleError(error) {
    console.error('EmpleadoNominaService Error:', error);
    
    if (error.response) {
      const message = error.response.data?.message || error.response.statusText || 'Error del servidor';
      return new Error(`Error ${error.response.status}: ${message}`);
    } else if (error.request) {
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      return new Error(error.message || 'Error inesperado');
    }
  }
}
