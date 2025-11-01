import ApiService from '../api.js';

/**
 * Servicio para gestión de nóminas
 * Maneja todas las operaciones CRUD relacionadas con nóminas
 */
export class NominaService {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene todas las nóminas con filtros avanzados
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Respuesta con nóminas y metadatos
   */
  static async getAll(filtros = {}) {
    const cacheKey = `nominas_${JSON.stringify(filtros)}`;
    
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const params = new URLSearchParams();
      
      // Filtros básicos
      if (filtros.empleado_id) params.append('empleado_id', filtros.empleado_id);
      if (filtros.proyecto_id) params.append('proyecto_id', filtros.proyecto_id);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.semana) params.append('semana', filtros.semana);
      
      // Filtros de fechas
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      
      // Filtros financieros
      if (filtros.monto_minimo) params.append('monto_minimo', filtros.monto_minimo);
      if (filtros.monto_maximo) params.append('monto_maximo', filtros.monto_maximo);
      
      // Paginación y ordenamiento
      if (filtros.pagina) params.append('pagina', filtros.pagina);
      if (filtros.limite) params.append('limite', filtros.limite);
      if (filtros.orden) params.append('orden', filtros.orden);

      const response = await ApiService.get(`/nomina?${params.toString()}`);
      
      const result = {
        success: true,
        data: response.nominas || response.data || [],
        pagination: response.pagination || {},
        total: response.pagination?.total || (response.nominas || response.data || []).length
      };

      // Guardar en caché
      this.cache.set(cacheKey, {
        data: result,
        timestamp: Date.now()
      });

      return result;
    } catch (error) {
      console.error('Error fetching nominas:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene nómina por ID con detalles completos
   * @param {number} id - ID de la nómina
   * @param {boolean} includeDetails - Si incluir detalles
   * @returns {Promise<Object>} Nómina encontrada
   */
  static async getById(id, includeDetails = true) {
    try {
      const response = await ApiService.get(`/nomina/${id}`);
      
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      } else {
        throw new Error('Error al obtener nómina');
      }
    } catch (error) {
      console.error('Error fetching nomina by ID:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Procesa una nueva nómina
   * @param {Object} nominaData - Datos de la nómina
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  static async procesarNomina(nominaData) {
    try {
      console.log('🚀 [NOMINA_SERVICE] Iniciando procesamiento de nómina');
      console.log('🚀 [NOMINA_SERVICE] Datos recibidos:', nominaData);
      
      // Validar datos requeridos
      const camposRequeridos = ['id_empleado', 'id_proyecto', 'dias_laborados', 'pago_semanal'];
      const camposFaltantes = camposRequeridos.filter(campo => !nominaData[campo]);
      
      console.log('🔍 [NOMINA_SERVICE] Campos requeridos:', camposRequeridos);
      console.log('🔍 [NOMINA_SERVICE] Campos faltantes:', camposFaltantes);
      
      if (camposFaltantes.length > 0) {
        console.error('❌ [NOMINA_SERVICE] Campos faltantes:', camposFaltantes);
        throw new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`);
      }

      console.log('✅ [NOMINA_SERVICE] Validación exitosa, enviando a API...');
      const response = await ApiService.post('/nomina', nominaData);
      console.log('✅ [NOMINA_SERVICE] Respuesta de API:', response);
      
      // Limpiar caché
      this.clearCache();
      
      const result = {
        success: true,
        data: response, // Mantener la estructura completa de la respuesta
        message: response.message || 'Nómina procesada exitosamente'
      };
      
      console.log('✅ [NOMINA_SERVICE] Resultado final:', result);
      return result;
    } catch (error) {
      console.error('Error processing nomina:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza una nómina existente
   * @param {number} id - ID de la nómina
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Resultado de la actualización
   */
  static async update(id, updateData) {
    try {
      const response = await ApiService.put(`/nomina/${id}`, updateData);
      
      // Limpiar caché
      this.clearCache();
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Nómina actualizada exitosamente'
      };
    } catch (error) {
      console.error('Error updating nomina:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancela una nómina
   * @param {number} id - ID de la nómina
   * @param {string} motivo - Motivo de la cancelación
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  static async cancelar(id, motivo = '') {
    try {
      const response = await ApiService.put(`/nomina/${id}/cancelar`, { motivo });
      
      // Limpiar caché
      this.clearCache();
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Nómina cancelada exitosamente'
      };
    } catch (error) {
      console.error('Error canceling nomina:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Aprueba una nómina
   * @param {number} id - ID de la nómina
   * @param {Object} datosAprobacion - Datos de la aprobación
   * @returns {Promise<Object>} Resultado de la aprobación
   */
  static async aprobar(id, datosAprobacion = {}) {
    try {
      const response = await ApiService.put(`/nomina/${id}/aprobar`, datosAprobacion);
      
      // Limpiar caché
      this.clearCache();
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Nómina aprobada exitosamente'
      };
    } catch (error) {
      console.error('Error approving nomina:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Marca una nómina como pagada
   * @param {number} id - ID de la nómina
   * @param {Object} datosPago - Datos del pago
   * @returns {Promise<Object>} Resultado del pago
   */
  static async marcarComoPagada(id, datosPago = {}) {
    try {
      console.log('🔄 [SERVICE] Marcando nómina como pagada:', { id, estado: 'Pagado' });
      const response = await ApiService.put(`/nomina/${id}/estado`, { estado: 'Pagado' });
      
      // Limpiar caché
      this.clearCache();
      
      console.log('✅ [SERVICE] Nómina marcada como pagada exitosamente');
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Nómina marcada como pagada'
      };
    } catch (error) {
      console.error('❌ [SERVICE] Error marking nomina as paid:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Genera recibo PDF de una nómina
   * @param {number} id - ID de la nómina
   * @returns {Promise<Blob>} Archivo PDF
   */
  static async generarReciboPDF(id) {
    try {
      if (id == null) {
        throw new Error('ID de nómina inválido al generar PDF');
      }

      console.log('📄 [NominaService] Generando PDF para nómina ID:', id);

      const response = await ApiService.get(`/nomina/${id}/recibo`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Validar que sea un Blob PDF
      if (!(response instanceof Blob)) {
        throw new Error('La respuesta del servidor no es un archivo descargable');
      }
      const mime = response.type || '';
      if (!mime.includes('pdf')) {
        // Intentar extraer mensaje de error del blob
        try {
          const text = await response.text();
          let msg = text?.slice(0, 500) || 'Error desconocido al generar PDF';
          try {
            const json = JSON.parse(text);
            msg = json?.message || msg;
          } catch (_) {}
          throw new Error(`Error al generar PDF: ${msg}`);
        } catch (e) {
          throw new Error(e.message || 'No se pudo generar el PDF');
        }
      }
      return response;
    } catch (error) {
      console.error('❌ [NominaService] Error generating PDF:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene nóminas por período
   * @param {string} periodo - Período en formato YYYY-MM
   * @returns {Promise<Object>} Nóminas del período
   */
  static async getNominasPeriodo(periodo) {
    return this.getAll({ periodo });
  }

                                                                                                                                            /**
   * Obtiene nóminas del período actual
   * @returns {Promise<Object>} Nóminas del período actual
   */
  static async getNominasPeriodoActual() {
    const ahora = new Date();
    const periodo = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
    return this.getNominasPeriodo(periodo);
  }

  /**
   * Verifica si ya existe una nómina para un empleado en una semana específica del período
   * @param {Object} datos - Datos para verificar duplicados
   * @param {number} datos.id_empleado - ID del empleado
   * @param {string} datos.periodo - Período en formato YYYY-MM
   * @param {number} datos.semana - Número de semana (1-4)
   * @returns {Promise<Object>} Resultado de la verificación
   */
  static async verificarDuplicados(datos) {
    try {
      console.log('🔍 [NominaService] Verificando duplicados:', datos);
      
      const params = new URLSearchParams();
      params.append('id_empleado', datos.id_empleado);
      params.append('periodo', datos.periodo);
      params.append('semana', datos.semana);
      
      const response = await ApiService.get(`/nomina/verificar-duplicados?${params.toString()}`);
      
      console.log('🔍 [NominaService] Respuesta verificación:', response);
      
      return {
        success: true,
        existe: response.existe || false,
        nominaExistente: response.nominaExistente || null,
        message: response.message || (response.existe ? 'Nómina duplicada encontrada' : 'No hay duplicados')
      };
    } catch (error) {
      console.error('Error verificando duplicados:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene estadísticas de nóminas
   * @param {Object} filtros - Filtros para las estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  static async getEstadisticas(filtros = {}) {
    try {
      const response = await ApiService.get('/nomina/estadisticas', { params: filtros });
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error('Error fetching nomina statistics:', error);
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
   * Eliminar una nómina
   * @param {number} id - ID de la nómina
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  static async delete(id) {
    try {
      const response = await ApiService.delete(`/nomina/${id}`);
      
      // Limpiar caché
      this.clearCache();
      
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Nómina eliminada exitosamente'
      };
    } catch (error) {
      console.error('Error deleting nomina:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Maneja errores de manera consistente
   * @param {Error} error - Error capturado
   * @returns {Error} Error formateado
   */
  static handleError(error) {
    console.error('NominaService Error:', error);
    
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.message || error.response.statusText || 'Error del servidor';
      return new Error(`Error ${error.response.status}: ${message}`);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error de configuración o validación
      return new Error(error.message || 'Error inesperado');
    }
  }
}
