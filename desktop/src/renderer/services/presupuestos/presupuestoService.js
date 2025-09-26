import apiService from '../api.js';

/**
 * Servicio para gestión de presupuestos
 */
export class PresupuestoService {
  static baseUrl = '/api/presupuestos';

  /**
   * Obtener todos los presupuestos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Respuesta con presupuestos y metadatos
   */
  static async getAll(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const response = await apiService.get(`${this.baseUrl}?${queryParams.toString()}`);
      return {
        success: true,
        data: response.data || [],
        pagination: response.pagination || {},
        total: response.pagination?.total || 0
      };
    } catch (error) {
      console.error('Error fetching presupuestos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener presupuesto por ID con detalles
   * @param {number} id - ID del presupuesto
   * @param {boolean} includeDetails - Si incluir detalles
   * @returns {Promise<Object>} Presupuesto encontrado
   */
  static async getById(id, includeDetails = true) {
    try {
      const params = includeDetails ? '?include_details=true' : '';
      const response = await apiService.get(`${this.baseUrl}/${id}${params}`);
      return {
        success: true,
        data: response.data || response
      };
    } catch (error) {
      console.error(`Error fetching presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nuevo presupuesto
   * @param {Object} presupuestoData - Datos del presupuesto
   * @returns {Promise<Object>} Presupuesto creado
   */
  static async create(presupuestoData) {
    try {
      this.validatePresupuestoData(presupuestoData);

      const response = await apiService.post(this.baseUrl, presupuestoData);
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Presupuesto creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating presupuesto:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar presupuesto existente
   * @param {number} id - ID del presupuesto
   * @param {Object} presupuestoData - Datos actualizados
   * @returns {Promise<Object>} Presupuesto actualizado
   */
  static async update(id, presupuestoData) {
    try {
      this.validatePresupuestoData(presupuestoData, false);

      const response = await apiService.put(`${this.baseUrl}/${id}`, presupuestoData);
      return {
        success: true,
        data: response.data || response,
        message: response.message || 'Presupuesto actualizado exitosamente'
      };
    } catch (error) {
      console.error(`Error updating presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar presupuesto
   * @param {number} id - ID del presupuesto
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  static async delete(id) {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
      return {
        success: true,
        message: 'Presupuesto eliminado exitosamente'
      };
    } catch (error) {
      console.error(`Error deleting presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplicar presupuesto
   * @param {number} id - ID del presupuesto a duplicar
   * @param {Object} newData - Datos para el duplicado
   * @returns {Promise<Object>} Presupuesto duplicado
   */
  static async duplicate(id, newData = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${id}/duplicate`, newData);
      return {
        success: true,
        data: response.data,
        message: 'Presupuesto duplicado exitosamente'
      };
    } catch (error) {
      console.error(`Error duplicating presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado del presupuesto
   * @param {number} id - ID del presupuesto
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} observaciones - Observaciones del cambio
   * @returns {Promise<Object>} Presupuesto actualizado
   */
  static async changeState(id, nuevoEstado, observaciones = '') {
    try {
      const response = await apiService.put(`${this.baseUrl}/${id}/state`, {
        estado: nuevoEstado,
        observaciones
      });
      
      return {
        success: true,
        data: response.data,
        message: `Estado cambiado a ${nuevoEstado} exitosamente`
      };
    } catch (error) {
      console.error(`Error changing presupuesto ${id} state:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nueva versión del presupuesto
   * @param {number} id - ID del presupuesto
   * @param {Object} changes - Cambios para la nueva versión
   * @returns {Promise<Object>} Nueva versión creada
   */
  static async createVersion(id, changes = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${id}/version`, changes);
      return {
        success: true,
        data: response.data,
        message: 'Nueva versión creada exitosamente'
      };
    } catch (error) {
      console.error(`Error creating version for presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener historial de versiones
   * @param {number} id - ID del presupuesto
   * @returns {Promise<Object>} Historial de versiones
   */
  static async getVersionHistory(id) {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}/versions`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching version history for presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Recalcular totales del presupuesto
   * @param {number} id - ID del presupuesto
   * @param {Object} options - Opciones de recálculo
   * @returns {Promise<Object>} Presupuesto recalculado
   */
  static async recalculate(id, options = {}) {
    try {
      const response = await apiService.put(`${this.baseUrl}/${id}/recalculate`, options);
      return {
        success: true,
        data: response.data,
        message: 'Presupuesto recalculado exitosamente'
      };
    } catch (error) {
      console.error(`Error recalculating presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar presupuesto a PDF
   * @param {number} id - ID del presupuesto
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Blob>} Archivo PDF
   */
  static async exportToPDF(id, options = {}) {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const response = await apiService.get(
        `${this.baseUrl}/${id}/export/pdf?${queryParams}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error exporting presupuesto ${id} to PDF:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar presupuesto a Excel
   * @param {number} id - ID del presupuesto
   * @param {Object} options - Opciones de exportación
   * @returns {Promise<Blob>} Archivo Excel
   */
  static async exportToExcel(id, options = {}) {
    try {
      const queryParams = new URLSearchParams(options).toString();
      const response = await apiService.get(
        `${this.baseUrl}/${id}/export/excel?${queryParams}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error exporting presupuesto ${id} to Excel:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener dashboard de presupuestos
   * @param {Object} filters - Filtros para el dashboard
   * @returns {Promise<Object>} Datos del dashboard
   */
  static async getDashboard(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiService.get(`${this.baseUrl}/dashboard?${queryParams}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching presupuestos dashboard:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener análisis de rentabilidad
   * @param {number} id - ID del presupuesto
   * @returns {Promise<Object>} Análisis de rentabilidad
   */
  static async getProfitabilityAnalysis(id) {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}/analysis/profitability`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching profitability analysis for presupuesto ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Comparar presupuestos
   * @param {Array} ids - IDs de presupuestos a comparar
   * @returns {Promise<Object>} Comparativa de presupuestos
   */
  static async compare(ids) {
    try {
      const response = await apiService.post(`${this.baseUrl}/compare`, { ids });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error comparing presupuestos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar presupuestos
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Presupuestos encontrados
   */
  static async search(query, filters = {}) {
    try {
      const params = {
        search: query,
        limit: 20,
        ...filters
      };

      return await this.getAll(params);
    } catch (error) {
      console.error('Error searching presupuestos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validar datos del presupuesto
   * @param {Object} data - Datos a validar
   * @param {boolean} isCreation - Si es creación
   */
  static validatePresupuestoData(data, isCreation = true) {
    const errors = [];

    if (isCreation || data.codigo !== undefined) {
      if (!data.codigo || data.codigo.trim() === '') {
        errors.push('El código es requerido');
      }
    }

    if (isCreation || data.nombre !== undefined) {
      if (!data.nombre || data.nombre.trim() === '') {
        errors.push('El nombre es requerido');
      }
    }

    if (isCreation || data.cliente !== undefined) {
      if (!data.cliente || data.cliente.trim() === '') {
        errors.push('El cliente es requerido');
      }
    }

    if (data.fecha_elaboracion !== undefined) {
      if (!data.fecha_elaboracion) {
        errors.push('La fecha de elaboración es requerida');
      }
    }

    if (data.fecha_vigencia !== undefined) {
      if (!data.fecha_vigencia) {
        errors.push('La fecha de vigencia es requerida');
      }
    }

    if (data.fecha_elaboracion && data.fecha_vigencia) {
      if (new Date(data.fecha_elaboracion) >= new Date(data.fecha_vigencia)) {
        errors.push('La fecha de elaboración debe ser menor a la fecha de vigencia');
      }
    }

    if (data.detalles && Array.isArray(data.detalles)) {
      if (data.detalles.length === 0) {
        errors.push('Debe incluir al menos un concepto en el presupuesto');
      }

      data.detalles.forEach((detalle, index) => {
        if (!detalle.concepto_id) {
          errors.push(`Detalle ${index + 1}: Concepto es requerido`);
        }
        if (!detalle.cantidad || detalle.cantidad <= 0) {
          errors.push(`Detalle ${index + 1}: Cantidad debe ser mayor a 0`);
        }
        if (!detalle.precio_unitario || detalle.precio_unitario <= 0) {
          errors.push(`Detalle ${index + 1}: Precio unitario debe ser mayor a 0`);
        }
      });
    }

    if (errors.length > 0) {
      throw new Error(errors.join(', '));
    }
  }

  /**
   * Manejar errores de la API
   */
  static handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return new Error(data.message || 'Datos inválidos proporcionados');
        case 401:
          return new Error('No autorizado. Por favor, inicie sesión nuevamente');
        case 403:
          return new Error('No tiene permisos para realizar esta acción');
        case 404:
          return new Error('Presupuesto no encontrado');
        case 409:
          return new Error('El código del presupuesto ya existe');
        case 422:
          return new Error(data.message || 'Error de validación de datos');
        case 500:
          return new Error('Error interno del servidor. Intente más tarde');
        default:
          return new Error(data.message || 'Error desconocido');
      }
    }
    
    if (error.request) {
      return new Error('No se pudo conectar con el servidor');
    }
    
    return error;
  }

  /**
   * Transformar datos para la UI
   */
  static transformForUI(presupuesto) {
    return {
      ...presupuesto,
      monto_total_formatted: presupuesto.monto_total?.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }),
      fecha_elaboracion_formatted: presupuesto.fecha_elaboracion ? 
        new Date(presupuesto.fecha_elaboracion).toLocaleDateString('es-MX') : null,
      fecha_vigencia_formatted: presupuesto.fecha_vigencia ? 
        new Date(presupuesto.fecha_vigencia).toLocaleDateString('es-MX') : null,
      created_at_formatted: presupuesto.created_at ? 
        new Date(presupuesto.created_at).toLocaleDateString('es-MX') : null,
      estado_color: this.getEstadoColor(presupuesto.estado)
    };
  }

  /**
   * Obtener color del estado
   */
  static getEstadoColor(estado) {
    const colors = {
      'borrador': 'gray',
      'revision': 'yellow',
      'aprobado': 'green',
      'rechazado': 'red',
      'vigente': 'blue',
      'vencido': 'red',
      'ejecutado': 'purple'
    };
    
    return colors[estado] || 'gray';
  }

  /**
   * Preparar datos para envío a la API
   */
  static transformForAPI(presupuesto) {
    const cleanData = { ...presupuesto };
    
    // Remover campos calculados/formateados
    delete cleanData.monto_total_formatted;
    delete cleanData.fecha_elaboracion_formatted;
    delete cleanData.fecha_vigencia_formatted;
    delete cleanData.created_at_formatted;
    delete cleanData.estado_color;
    
    // Convertir montos a números
    if (cleanData.monto_total) {
      cleanData.monto_total = parseFloat(cleanData.monto_total);
    }
    
    // Procesar detalles
    if (cleanData.detalles && Array.isArray(cleanData.detalles)) {
      cleanData.detalles = cleanData.detalles.map(detalle => ({
        ...detalle,
        cantidad: parseFloat(detalle.cantidad) || 0,
        precio_unitario: parseFloat(detalle.precio_unitario) || 0,
        subtotal: parseFloat(detalle.subtotal) || 0
      }));
    }
    
    return cleanData;
  }

  /**
   * Calcular totales del presupuesto
   */
  static calculateTotals(detalles, iva = 0.16) {
    const subtotal = detalles.reduce((sum, detalle) => {
      return sum + (detalle.cantidad * detalle.precio_unitario);
    }, 0);
    
    const ivaAmount = subtotal * iva;
    const total = subtotal + ivaAmount;
    
    return {
      subtotal,
      iva: ivaAmount,
      total
    };
  }
}

export default PresupuestoService;