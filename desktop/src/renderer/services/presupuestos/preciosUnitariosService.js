import ApiService from '../api.js';

/**
 * Servicio para gestionar operaciones CRUD de Precios Unitarios
 * Maneja precios por región, fecha y tipo de concepto
 */
class PreciosUnitariosServiceClass {
  constructor() {
    this.endpoint = '/precios-unitarios';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene todos los precios con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de precios
   */
  async getAll(filtros = {}) {
    const cacheKey = `precios_${JSON.stringify(filtros)}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryParams = new URLSearchParams();
      
      // Aplicar filtros
      if (filtros.id_concepto_obra) queryParams.append('id_concepto_obra', filtros.id_concepto_obra);
      if (filtros.codigo_concepto) queryParams.append('codigo_concepto', filtros.codigo_concepto);
      if (filtros.tipo_precio) queryParams.append('tipo_precio', filtros.tipo_precio);
      if (filtros.region) queryParams.append('region', filtros.region);
      if (filtros.moneda) queryParams.append('moneda', filtros.moneda);
      if (filtros.fecha_desde) queryParams.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) queryParams.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.precio_min) queryParams.append('precio_min', filtros.precio_min);
      if (filtros.precio_max) queryParams.append('precio_max', filtros.precio_max);
      if (filtros.vigente) queryParams.append('vigente', filtros.vigente);
      if (filtros.proveedor) queryParams.append('proveedor', filtros.proveedor);
      if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
      if (filtros.page) queryParams.append('page', filtros.page);
      if (filtros.limit) queryParams.append('limit', filtros.limit);

      const url = queryParams.toString() ? 
        `${this.endpoint}?${queryParams.toString()}` : 
        this.endpoint;

      const response = await ApiService.get(url);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener precios unitarios:', error);
      throw new Error(`Error al cargar precios: ${error.message}`);
    }
  }

  /**
   * Obtiene un precio específico por ID
   * @param {number|string} id - ID del precio
   * @returns {Promise<Object>} Precio encontrado
   */
  async getById(id) {
    const cacheKey = `precio_${id}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await ApiService.get(`${this.endpoint}/${id}`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener precio ${id}:`, error);
      throw new Error(`Error al cargar precio: ${error.message}`);
    }
  }

  /**
   * Obtiene precios por concepto de obra
   * @param {number|string} idConcepto - ID del concepto de obra
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Precios del concepto
   */
  async getByConcepto(idConcepto, filtros = {}) {
    try {
      const filtrosCompletos = {
        ...filtros,
        id_concepto_obra: idConcepto
      };

      return await this.getAll(filtrosCompletos);
    } catch (error) {
      console.error(`Error al obtener precios del concepto ${idConcepto}:`, error);
      throw new Error(`Error al cargar precios del concepto: ${error.message}`);
    }
  }

  /**
   * Obtiene el precio vigente de un concepto
   * @param {number|string} idConcepto - ID del concepto de obra
   * @param {Object} opciones - Opciones de búsqueda
   * @returns {Promise<Object>} Precio vigente
   */
  async getPrecioVigente(idConcepto, opciones = {}) {
    const cacheKey = `precio_vigente_${idConcepto}_${JSON.stringify(opciones)}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryParams = new URLSearchParams({
        id_concepto_obra: idConcepto,
        vigente: 'true',
        ...opciones
      });

      const response = await ApiService.get(`${this.endpoint}/vigente?${queryParams.toString()}`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener precio vigente del concepto ${idConcepto}:`, error);
      throw new Error(`Error al cargar precio vigente: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo precio unitario
   * @param {Object} precioData - Datos del precio
   * @returns {Promise<Object>} Precio creado
   */
  async create(precioData) {
    try {
      // Validaciones básicas
      this._validatePrecioData(precioData);

      // Preparar datos para envío
      const dataToSend = this._preparePrecioData(precioData);

      const response = await ApiService.post(this.endpoint, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al crear precio:', error);
      throw new Error(`Error al crear precio: ${error.message}`);
    }
  }

  /**
   * Actualiza un precio existente
   * @param {number|string} id - ID del precio
   * @param {Object} precioData - Datos actualizados
   * @returns {Promise<Object>} Precio actualizado
   */
  async update(id, precioData) {
    try {
      // Validaciones básicas
      this._validatePrecioData(precioData, id);

      // Preparar datos para envío
      const dataToSend = this._preparePrecioData(precioData);
      dataToSend.fecha_actualizacion = new Date().toISOString();

      const response = await ApiService.put(`${this.endpoint}/${id}`, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`precio_${id}`);

      return response.data;
    } catch (error) {
      console.error(`Error al actualizar precio ${id}:`, error);
      throw new Error(`Error al actualizar precio: ${error.message}`);
    }
  }

  /**
   * Elimina un precio
   * @param {number|string} id - ID del precio
   * @returns {Promise<boolean>} Resultado de la operación
   */
  async delete(id) {
    try {
      await ApiService.delete(`${this.endpoint}/${id}`);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`precio_${id}`);

      return true;
    } catch (error) {
      console.error(`Error al eliminar precio ${id}:`, error);
      throw new Error(`Error al eliminar precio: ${error.message}`);
    }
  }

  /**
   * Actualiza múltiples precios con escalamiento
   * @param {Array} precios - Lista de IDs de precios
   * @param {Object} parametros - Parámetros de escalamiento
   * @returns {Promise<Object>} Resultado de la operación
   */
  async escalarPrecios(precios, parametros) {
    try {
      const dataToSend = {
        precios_ids: precios,
        factor_escalamiento: parametros.factor,
        fecha_vigencia: parametros.fecha_vigencia,
        region: parametros.region,
        observaciones: parametros.observaciones,
        actualizado_por: parametros.actualizado_por || 1 // TODO: obtener del contexto
      };

      const response = await ApiService.post(`${this.endpoint}/escalar`, dataToSend);
      
      // Limpiar caché tras operación masiva
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al escalar precios:', error);
      throw new Error(`Error al escalar precios: ${error.message}`);
    }
  }

  /**
   * Importa precios desde archivo CSV o Excel
   * @param {File} archivo - Archivo a importar
   * @param {Object} opciones - Opciones de importación
   * @returns {Promise<Object>} Resultado de la importación
   */
  async importar(archivo, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('opciones', JSON.stringify(opciones));

      const response = await ApiService.post(`${this.endpoint}/importar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Limpiar caché tras importación
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al importar precios:', error);
      throw new Error(`Error en importación: ${error.message}`);
    }
  }

  /**
   * Exporta precios a archivo
   * @param {string} formato - Formato de exportación (csv, excel, pdf)
   * @param {Object} filtros - Filtros para exportación
   * @returns {Promise<Blob>} Archivo generado
   */
  async exportar(formato = 'excel', filtros = {}) {
    try {
      const queryParams = new URLSearchParams({
        formato,
        ...filtros
      });

      const response = await ApiService.get(`${this.endpoint}/exportar?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      return response.data;
    } catch (error) {
      console.error('Error al exportar precios:', error);
      throw new Error(`Error en exportación: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de precios de un concepto
   * @param {number|string} idConcepto - ID del concepto de obra
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Historial de precios
   */
  async getHistorial(idConcepto, filtros = {}) {
    const cacheKey = `historial_${idConcepto}_${JSON.stringify(filtros)}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryParams = new URLSearchParams({
        ...filtros
      });

      const response = await ApiService.get(`${this.endpoint}/${idConcepto}/historial?${queryParams.toString()}`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener historial del concepto ${idConcepto}:`, error);
      throw new Error(`Error al cargar historial: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de precios
   * @param {Object} filtros - Filtros para estadísticas
   * @returns {Promise<Object>} Estadísticas
   */
  async getEstadisticas(filtros = {}) {
    const cacheKey = `estadisticas_precios_${JSON.stringify(filtros)}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryParams = new URLSearchParams(filtros);
      const response = await ApiService.get(`${this.endpoint}/estadisticas?${queryParams.toString()}`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de precios:', error);
      throw new Error(`Error al cargar estadísticas: ${error.message}`);
    }
  }

  /**
   * Compara precios entre regiones o fechas
   * @param {Object} parametros - Parámetros de comparación
   * @returns {Promise<Object>} Comparación de precios
   */
  async compararPrecios(parametros) {
    try {
      const response = await ApiService.post(`${this.endpoint}/comparar`, parametros);
      return response.data;
    } catch (error) {
      console.error('Error al comparar precios:', error);
      throw new Error(`Error en comparación: ${error.message}`);
    }
  }

  /**
   * Valida los datos de un precio
   * @private
   */
  _validatePrecioData(data, id = null) {
    const errores = [];

    // Validaciones obligatorias
    if (!data.id_concepto_obra) errores.push('El concepto de obra es obligatorio');
    if (!data.precio_unitario || data.precio_unitario <= 0) errores.push('El precio unitario debe ser mayor a 0');
    if (!data.fecha_base) errores.push('La fecha base es obligatoria');
    if (!data.vigente_desde) errores.push('La fecha de vigencia es obligatoria');

    // Validaciones de formato
    if (data.precio_unitario && (isNaN(data.precio_unitario) || data.precio_unitario <= 0)) {
      errores.push('El precio unitario debe ser un número positivo');
    }

    if (data.factor_sobrecosto && (isNaN(data.factor_sobrecosto) || data.factor_sobrecosto < 0)) {
      errores.push('El factor de sobrecosto debe ser un número positivo o cero');
    }

    // Validar fechas
    if (data.vigente_desde && data.vigente_hasta) {
      if (new Date(data.vigente_desde) > new Date(data.vigente_hasta)) {
        errores.push('La fecha de vigencia inicial debe ser anterior a la final');
      }
    }

    // Validar tipos permitidos
    const tiposPermitidos = ['base', 'actual', 'contrato', 'referencial'];
    if (data.tipo_precio && !tiposPermitidos.includes(data.tipo_precio)) {
      errores.push('Tipo de precio no válido');
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación:\n${errores.join('\n')}`);
    }
  }

  /**
   * Prepara los datos del precio para envío al servidor
   * @private
   */
  _preparePrecioData(data) {
    return {
      id_concepto_obra: data.id_concepto_obra,
      precio_unitario: parseFloat(data.precio_unitario),
      moneda: data.moneda || 'MXN',
      tipo_precio: data.tipo_precio || 'actual',
      region: data.region || null,
      fecha_base: data.fecha_base,
      vigente_desde: data.vigente_desde,
      vigente_hasta: data.vigente_hasta || null,
      factor_sobrecosto: data.factor_sobrecosto ? parseFloat(data.factor_sobrecosto) : null,
      proveedor: data.proveedor?.trim() || null,
      observaciones: data.observaciones?.trim() || null,
      creado_por: data.creado_por || 1, // TODO: obtener del contexto de usuario
      fecha_creacion: data.fecha_creacion || new Date().toISOString(),
      metadatos: data.metadatos || null
    };
  }

  /**
   * Limpia el caché relacionado con precios
   * @private
   */
  _clearRelatedCache() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('precios_') || 
          key.startsWith('precio_vigente_') || 
          key.startsWith('historial_') || 
          key.startsWith('estadisticas_precios_')) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Limpia todo el caché del servicio
   */
  clearCache() {
    this.cache.clear();
  }
}

// Instancia singleton del servicio
export const PreciosUnitariosService = new PreciosUnitariosServiceClass();
export default PreciosUnitariosService;