import apiService from '../api.js';

/**
 * Servicio para gestión de precios unitarios
 */
export class PrecioUnitarioService {
  static baseUrl = '/api/precios';

  /**
   * Obtener todos los precios con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Respuesta con precios y metadatos
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
        data: response.data.precios || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error fetching precios:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener precio por ID
   * @param {number} id - ID del precio
   * @returns {Promise<Object>} Precio encontrado
   */
  static async getById(id) {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching precio ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener precios por concepto
   * @param {number} conceptoId - ID del concepto
   * @param {Object} params - Filtros adicionales
   * @returns {Promise<Object>} Precios del concepto
   */
  static async getByConcepto(conceptoId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiService.get(
        `${this.baseUrl}/concepto/${conceptoId}?${queryParams}`
      );
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching precios for concepto ${conceptoId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener precios por región
   * @param {string} region - Región
   * @param {Object} params - Filtros adicionales
   * @returns {Promise<Object>} Precios de la región
   */
  static async getByRegion(region, params = {}) {
    try {
      const queryParams = new URLSearchParams({
        region,
        ...params
      }).toString();
      
      const response = await apiService.get(`${this.baseUrl}?${queryParams}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching precios for region ${region}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nuevo precio
   * @param {Object} precioData - Datos del precio
   * @returns {Promise<Object>} Precio creado
   */
  static async create(precioData) {
    try {
      this.validatePrecioData(precioData);

      const response = await apiService.post(this.baseUrl, precioData);
      return {
        success: true,
        data: response.data,
        message: 'Precio creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating precio:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar precio existente
   * @param {number} id - ID del precio
   * @param {Object} precioData - Datos actualizados
   * @returns {Promise<Object>} Precio actualizado
   */
  static async update(id, precioData) {
    try {
      this.validatePrecioData(precioData, false);

      const response = await apiService.put(`${this.baseUrl}/${id}`, precioData);
      return {
        success: true,
        data: response.data,
        message: 'Precio actualizado exitosamente'
      };
    } catch (error) {
      console.error(`Error updating precio ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar precio
   * @param {number} id - ID del precio
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  static async delete(id) {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
      return {
        success: true,
        message: 'Precio eliminado exitosamente'
      };
    } catch (error) {
      console.error(`Error deleting precio ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplicar precio para otra región
   * @param {number} id - ID del precio a duplicar
   * @param {string} nuevaRegion - Nueva región
   * @param {Object} additionalData - Datos adicionales
   * @returns {Promise<Object>} Precio duplicado
   */
  static async duplicateToRegion(id, nuevaRegion, additionalData = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${id}/duplicate`, {
        region: nuevaRegion,
        ...additionalData
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Precio duplicado exitosamente'
      };
    } catch (error) {
      console.error(`Error duplicating precio ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear precios masivos para múltiples conceptos
   * @param {Array} conceptosIds - IDs de conceptos
   * @param {Object} precioData - Datos del precio base
   * @returns {Promise<Object>} Precios creados
   */
  static async createBulk(conceptosIds, precioData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/bulk`, {
        conceptos_ids: conceptosIds,
        ...precioData
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Precios creados exitosamente'
      };
    } catch (error) {
      console.error('Error creating bulk precios:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar precios por región aplicando factor
   * @param {string} region - Región a actualizar
   * @param {number} factor - Factor de ajuste (ej: 1.1 para 10% de aumento)
   * @param {Object} filters - Filtros para los precios a actualizar
   * @returns {Promise<Object>} Resultado de la actualización
   */
  static async updateByRegionWithFactor(region, factor, filters = {}) {
    try {
      const response = await apiService.put(`${this.baseUrl}/bulk/region/${region}`, {
        factor,
        filters
      });
      
      return {
        success: true,
        data: response.data,
        message: `Precios de ${region} actualizados exitosamente`
      };
    } catch (error) {
      console.error(`Error updating precios for region ${region}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener regiones disponibles
   * @returns {Promise<Array>} Lista de regiones
   */
  static async getRegiones() {
    try {
      const response = await apiService.get(`${this.baseUrl}/regiones`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching regiones:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener precios vigentes por concepto y región
   * @param {number} conceptoId - ID del concepto
   * @param {string} region - Región
   * @param {string} fecha - Fecha de consulta (opcional, por defecto hoy)
   * @returns {Promise<Object>} Precio vigente
   */
  static async getVigente(conceptoId, region, fecha = null) {
    try {
      const params = new URLSearchParams({
        concepto_id: conceptoId,
        region
      });
      
      if (fecha) {
        params.append('fecha', fecha);
      }
      
      const response = await apiService.get(`${this.baseUrl}/vigente?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching precio vigente:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar precios a Excel
   * @param {Object} filters - Filtros para la exportación
   * @returns {Promise<Blob>} Archivo Excel
   */
  static async exportToExcel(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await apiService.get(
        `${this.baseUrl}/export/excel?${queryParams}`,
        { responseType: 'blob' }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error exporting precios:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Importar precios desde Excel
   * @param {File} file - Archivo Excel
   * @param {Object} options - Opciones de importación
   * @returns {Promise<Object>} Resultado de la importación
   */
  static async importFromExcel(file, options = {}) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value);
      });

      const response = await apiService.post(
        `${this.baseUrl}/import/excel`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return {
        success: true,
        data: response.data,
        message: 'Precios importados exitosamente'
      };
    } catch (error) {
      console.error('Error importing precios:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Generar análisis comparativo de precios por región
   * @param {number} conceptoId - ID del concepto
   * @param {Array} regiones - Regiones a comparar
   * @returns {Promise<Object>} Análisis comparativo
   */
  static async getAnalisisComparativo(conceptoId, regiones = []) {
    try {
      const params = new URLSearchParams({ concepto_id: conceptoId });
      regiones.forEach(region => params.append('regiones[]', region));
      
      const response = await apiService.get(`${this.baseUrl}/analisis/comparativo?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error fetching análisis comparativo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validar datos del precio
   * @param {Object} data - Datos a validar
   * @param {boolean} isCreation - Si es creación
   */
  static validatePrecioData(data, isCreation = true) {
    const errors = [];

    if (isCreation || data.concepto_id !== undefined) {
      if (!data.concepto_id) {
        errors.push('El concepto es requerido');
      }
    }

    if (isCreation || data.region !== undefined) {
      if (!data.region || data.region.trim() === '') {
        errors.push('La región es requerida');
      }
    }

    if (isCreation || data.precio !== undefined) {
      if (isNaN(data.precio) || data.precio <= 0) {
        errors.push('El precio debe ser un número válido mayor a 0');
      }
    }

    if (data.vigencia_desde !== undefined) {
      if (!data.vigencia_desde) {
        errors.push('La fecha de inicio de vigencia es requerida');
      }
    }

    if (data.vigencia_hasta !== undefined) {
      if (!data.vigencia_hasta) {
        errors.push('La fecha de fin de vigencia es requerida');
      }
    }

    if (data.vigencia_desde && data.vigencia_hasta) {
      if (new Date(data.vigencia_desde) >= new Date(data.vigencia_hasta)) {
        errors.push('La fecha de inicio debe ser menor a la fecha de fin');
      }
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
          return new Error('Precio no encontrado');
        case 409:
          return new Error('Ya existe un precio para este concepto, región y período');
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
  static transformForUI(precio) {
    return {
      ...precio,
      precio_formatted: precio.precio?.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN'
      }),
      vigencia_desde_formatted: precio.vigencia_desde ? 
        new Date(precio.vigencia_desde).toLocaleDateString('es-MX') : null,
      vigencia_hasta_formatted: precio.vigencia_hasta ? 
        new Date(precio.vigencia_hasta).toLocaleDateString('es-MX') : null,
      created_at_formatted: precio.created_at ? 
        new Date(precio.created_at).toLocaleDateString('es-MX') : null
    };
  }

  /**
   * Preparar datos para envío a la API
   */
  static transformForAPI(precio) {
    const cleanData = { ...precio };
    
    // Remover campos calculados/formateados
    delete cleanData.precio_formatted;
    delete cleanData.vigencia_desde_formatted;
    delete cleanData.vigencia_hasta_formatted;
    delete cleanData.created_at_formatted;
    
    // Convertir precio a número
    if (cleanData.precio) {
      cleanData.precio = parseFloat(cleanData.precio);
    }
    
    return cleanData;
  }
}

export default PrecioUnitarioService;