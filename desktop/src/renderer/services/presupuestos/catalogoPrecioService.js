import apiService from '../api.js';

/**
 * Servicio para gestión de catálogos de precios
 */
export class CatalogoPrecioService {
  static baseUrl = '/api/catalogos';

  /**
   * Obtener todos los catálogos con filtros y paginación
   * @param {Object} params - Parámetros de consulta
   * @returns {Promise<Object>} Respuesta con catálogos y metadatos
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
        data: response.data.catalogos || [],
        pagination: response.data.pagination || {},
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Error fetching catalogos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener catálogo por ID con detalles
   * @param {number} id - ID del catálogo
   * @param {boolean} includeDetails - Si incluir detalles
   * @returns {Promise<Object>} Catálogo encontrado
   */
  static async getById(id, includeDetails = true) {
    try {
      const params = includeDetails ? '?include_details=true' : '';
      const response = await apiService.get(`${this.baseUrl}/${id}${params}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Crear nuevo catálogo
   * @param {Object} catalogoData - Datos del catálogo
   * @returns {Promise<Object>} Catálogo creado
   */
  static async create(catalogoData) {
    try {
      this.validateCatalogoData(catalogoData);

      const response = await apiService.post(this.baseUrl, catalogoData);
      return {
        success: true,
        data: response.data,
        message: 'Catálogo creado exitosamente'
      };
    } catch (error) {
      console.error('Error creating catalogo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar catálogo existente
   * @param {number} id - ID del catálogo
   * @param {Object} catalogoData - Datos actualizados
   * @returns {Promise<Object>} Catálogo actualizado
   */
  static async update(id, catalogoData) {
    try {
      this.validateCatalogoData(catalogoData, false);

      const response = await apiService.put(`${this.baseUrl}/${id}`, catalogoData);
      return {
        success: true,
        data: response.data,
        message: 'Catálogo actualizado exitosamente'
      };
    } catch (error) {
      console.error(`Error updating catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar catálogo
   * @param {number} id - ID del catálogo
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  static async delete(id) {
    try {
      await apiService.delete(`${this.baseUrl}/${id}`);
      return {
        success: true,
        message: 'Catálogo eliminado exitosamente'
      };
    } catch (error) {
      console.error(`Error deleting catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Duplicar catálogo
   * @param {number} id - ID del catálogo a duplicar
   * @param {Object} newData - Datos para el duplicado
   * @returns {Promise<Object>} Catálogo duplicado
   */
  static async duplicate(id, newData = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${id}/duplicate`, newData);
      return {
        success: true,
        data: response.data,
        message: 'Catálogo duplicado exitosamente'
      };
    } catch (error) {
      console.error(`Error duplicating catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Cambiar estado del catálogo
   * @param {number} id - ID del catálogo
   * @param {string} nuevoEstado - Nuevo estado
   * @param {string} observaciones - Observaciones del cambio
   * @returns {Promise<Object>} Catálogo actualizado
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
      console.error(`Error changing catalogo ${id} state:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener detalles del catálogo (conceptos incluidos)
   * @param {number} id - ID del catálogo
   * @param {Object} params - Filtros para los detalles
   * @returns {Promise<Object>} Detalles del catálogo
   */
  static async getDetails(id, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await apiService.get(`${this.baseUrl}/${id}/details?${queryParams}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching catalogo ${id} details:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Agregar concepto al catálogo
   * @param {number} catalogoId - ID del catálogo
   * @param {Object} detalleData - Datos del detalle
   * @returns {Promise<Object>} Detalle agregado
   */
  static async addConcepto(catalogoId, detalleData) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${catalogoId}/conceptos`, detalleData);
      return {
        success: true,
        data: response.data,
        message: 'Concepto agregado al catálogo exitosamente'
      };
    } catch (error) {
      console.error(`Error adding concepto to catalogo ${catalogoId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar concepto del catálogo
   * @param {number} catalogoId - ID del catálogo
   * @param {number} detalleId - ID del detalle
   * @param {Object} detalleData - Datos actualizados
   * @returns {Promise<Object>} Detalle actualizado
   */
  static async updateConcepto(catalogoId, detalleId, detalleData) {
    try {
      const response = await apiService.put(
        `${this.baseUrl}/${catalogoId}/conceptos/${detalleId}`,
        detalleData
      );
      return {
        success: true,
        data: response.data,
        message: 'Concepto actualizado exitosamente'
      };
    } catch (error) {
      console.error(`Error updating concepto ${detalleId} in catalogo ${catalogoId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Eliminar concepto del catálogo
   * @param {number} catalogoId - ID del catálogo
   * @param {number} detalleId - ID del detalle
   * @returns {Promise<Object>} Confirmación
   */
  static async removeConcepto(catalogoId, detalleId) {
    try {
      await apiService.delete(`${this.baseUrl}/${catalogoId}/conceptos/${detalleId}`);
      return {
        success: true,
        message: 'Concepto eliminado del catálogo exitosamente'
      };
    } catch (error) {
      console.error(`Error removing concepto ${detalleId} from catalogo ${catalogoId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Agregar conceptos en lote al catálogo
   * @param {number} catalogoId - ID del catálogo
   * @param {Array} conceptosIds - IDs de conceptos a agregar
   * @param {Object} defaultData - Datos por defecto para todos los conceptos
   * @returns {Promise<Object>} Resultado del lote
   */
  static async addConceptosBulk(catalogoId, conceptosIds, defaultData = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${catalogoId}/conceptos/bulk`, {
        conceptos_ids: conceptosIds,
        ...defaultData
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Conceptos agregados en lote exitosamente'
      };
    } catch (error) {
      console.error(`Error adding conceptos bulk to catalogo ${catalogoId}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar precios del catálogo con factor
   * @param {number} id - ID del catálogo
   * @param {number} factor - Factor de ajuste
   * @param {Object} filters - Filtros para conceptos a actualizar
   * @returns {Promise<Object>} Resultado de la actualización
   */
  static async updatePricesWithFactor(id, factor, filters = {}) {
    try {
      const response = await apiService.put(`${this.baseUrl}/${id}/prices/factor`, {
        factor,
        filters
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Precios actualizados exitosamente'
      };
    } catch (error) {
      console.error(`Error updating prices for catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Sincronizar con catálogo oficial
   * @param {number} id - ID del catálogo
   * @param {number} catalogoOficialId - ID del catálogo oficial
   * @param {Object} options - Opciones de sincronización
   * @returns {Promise<Object>} Resultado de sincronización
   */
  static async syncWithOfficial(id, catalogoOficialId, options = {}) {
    try {
      const response = await apiService.post(`${this.baseUrl}/${id}/sync`, {
        catalogo_oficial_id: catalogoOficialId,
        ...options
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Sincronización completada exitosamente'
      };
    } catch (error) {
      console.error(`Error syncing catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Exportar catálogo a Excel
   * @param {number} id - ID del catálogo
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
      console.error(`Error exporting catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Importar catálogo desde Excel
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
        message: 'Catálogo importado exitosamente'
      };
    } catch (error) {
      console.error('Error importing catalogo:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas del catálogo
   * @param {number} id - ID del catálogo
   * @returns {Promise<Object>} Estadísticas
   */
  static async getStatistics(id) {
    try {
      const response = await apiService.get(`${this.baseUrl}/${id}/statistics`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error(`Error fetching statistics for catalogo ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Comparar catálogos
   * @param {Array} ids - IDs de catálogos a comparar
   * @returns {Promise<Object>} Comparativa
   */
  static async compare(ids) {
    try {
      const response = await apiService.post(`${this.baseUrl}/compare`, { ids });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Error comparing catalogos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar en catálogos
   * @param {string} query - Término de búsqueda
   * @param {Object} filters - Filtros adicionales
   * @returns {Promise<Object>} Catálogos encontrados
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
      console.error('Error searching catalogos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Validar datos del catálogo
   */
  static validateCatalogoData(data, isCreation = true) {
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

    if (isCreation || data.tipo !== undefined) {
      if (!data.tipo || data.tipo.trim() === '') {
        errors.push('El tipo es requerido');
      }
    }

    if (data.fecha_vigencia_inicio !== undefined) {
      if (!data.fecha_vigencia_inicio) {
        errors.push('La fecha de inicio de vigencia es requerida');
      }
    }

    if (data.fecha_vigencia_fin !== undefined) {
      if (!data.fecha_vigencia_fin) {
        errors.push('La fecha de fin de vigencia es requerida');
      }
    }

    if (data.fecha_vigencia_inicio && data.fecha_vigencia_fin) {
      if (new Date(data.fecha_vigencia_inicio) >= new Date(data.fecha_vigencia_fin)) {
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
          return new Error('Catálogo no encontrado');
        case 409:
          return new Error('El código del catálogo ya existe');
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
  static transformForUI(catalogo) {
    return {
      ...catalogo,
      fecha_publicacion_formatted: catalogo.fecha_publicacion ? 
        new Date(catalogo.fecha_publicacion).toLocaleDateString('es-MX') : null,
      fecha_vigencia_inicio_formatted: catalogo.fecha_vigencia_inicio ? 
        new Date(catalogo.fecha_vigencia_inicio).toLocaleDateString('es-MX') : null,
      fecha_vigencia_fin_formatted: catalogo.fecha_vigencia_fin ? 
        new Date(catalogo.fecha_vigencia_fin).toLocaleDateString('es-MX') : null,
      created_at_formatted: catalogo.created_at ? 
        new Date(catalogo.created_at).toLocaleDateString('es-MX') : null,
      total_conceptos_formatted: catalogo.total_conceptos?.toLocaleString('es-MX'),
      estado_color: this.getEstadoColor(catalogo.estado)
    };
  }

  /**
   * Obtener color del estado
   */
  static getEstadoColor(estado) {
    const colors = {
      'activo': 'green',
      'inactivo': 'gray',
      'en_revision': 'yellow',
      'archivado': 'purple'
    };
    
    return colors[estado] || 'gray';
  }

  /**
   * Preparar datos para envío a la API
   */
  static transformForAPI(catalogo) {
    const cleanData = { ...catalogo };
    
    // Remover campos calculados/formateados
    delete cleanData.fecha_publicacion_formatted;
    delete cleanData.fecha_vigencia_inicio_formatted;
    delete cleanData.fecha_vigencia_fin_formatted;
    delete cleanData.created_at_formatted;
    delete cleanData.total_conceptos_formatted;
    delete cleanData.estado_color;
    
    return cleanData;
  }
}

export default CatalogoPrecioService;