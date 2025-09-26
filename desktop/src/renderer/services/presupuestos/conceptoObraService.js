import ApiService from '../api.js';

/**
 * Servicio para gestionar operaciones CRUD de Conceptos de Obra
 * Maneja los diferentes tipos de conceptos: materiales, mano de obra, equipos, subcontratos
 */
class ConceptoObraServiceClass {
  constructor() {
    this.endpoint = '/conceptos-obra';
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Obtiene todos los conceptos con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de conceptos
   */
  async getAll(filtros = {}) {
    const cacheKey = `conceptos_${JSON.stringify(filtros)}`;
    
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
      if (filtros.busqueda) queryParams.append('busqueda', filtros.busqueda);
      if (filtros.categoria) queryParams.append('categoria', filtros.categoria);
      if (filtros.tipo_concepto) queryParams.append('tipo_concepto', filtros.tipo_concepto);
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.moneda) queryParams.append('moneda', filtros.moneda);
      if (filtros.precio_min) queryParams.append('precio_min', filtros.precio_min);
      if (filtros.precio_max) queryParams.append('precio_max', filtros.precio_max);
      if (filtros.vigente_desde) queryParams.append('vigente_desde', filtros.vigente_desde);
      if (filtros.vigente_hasta) queryParams.append('vigente_hasta', filtros.vigente_hasta);
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
      console.error('Error al obtener conceptos de obra:', error);
      throw new Error(`Error al cargar conceptos: ${error.message}`);
    }
  }

  /**
   * Obtiene un concepto específico por ID
   * @param {number|string} id - ID del concepto
   * @returns {Promise<Object>} Concepto encontrado
   */
  async getById(id) {
    const cacheKey = `concepto_${id}`;
    
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
      console.error(`Error al obtener concepto ${id}:`, error);
      throw new Error(`Error al cargar concepto: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo concepto de obra
   * @param {Object} conceptoData - Datos del concepto
   * @returns {Promise<Object>} Concepto creado
   */
  async create(conceptoData) {
    try {
      // Validaciones básicas
      this._validateConceptoData(conceptoData);

      // Preparar datos para envío
      const dataToSend = this._prepareConceptoData(conceptoData);

      const response = await ApiService.post(this.endpoint, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al crear concepto:', error);
      throw new Error(`Error al crear concepto: ${error.message}`);
    }
  }

  /**
   * Actualiza un concepto existente
   * @param {number|string} id - ID del concepto
   * @param {Object} conceptoData - Datos actualizados
   * @returns {Promise<Object>} Concepto actualizado
   */
  async update(id, conceptoData) {
    try {
      // Validaciones básicas
      this._validateConceptoData(conceptoData, id);

      // Preparar datos para envío
      const dataToSend = this._prepareConceptoData(conceptoData);
      dataToSend.fecha_actualizacion = new Date().toISOString();

      const response = await ApiService.put(`${this.endpoint}/${id}`, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`concepto_${id}`);

      return response.data;
    } catch (error) {
      console.error(`Error al actualizar concepto ${id}:`, error);
      throw new Error(`Error al actualizar concepto: ${error.message}`);
    }
  }

  /**
   * Elimina un concepto
   * @param {number|string} id - ID del concepto
   * @returns {Promise<boolean>} Resultado de la operación
   */
  async delete(id) {
    try {
      await ApiService.delete(`${this.endpoint}/${id}`);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`concepto_${id}`);

      return true;
    } catch (error) {
      console.error(`Error al eliminar concepto ${id}:`, error);
      throw new Error(`Error al eliminar concepto: ${error.message}`);
    }
  }

  /**
   * Valida los datos de un concepto
   * @private
   */
  _validateConceptoData(data, id = null) {
    const errores = [];

    // Validaciones obligatorias
    if (!data.codigo?.trim()) errores.push('El código es obligatorio');
    if (!data.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!data.unidad?.trim()) errores.push('La unidad es obligatoria');
    if (!data.categoria?.trim()) errores.push('La categoría es obligatoria');

    // Validaciones de formato
    if (data.codigo && !/^[A-Z0-9_-]+$/i.test(data.codigo)) {
      errores.push('El código solo puede contener letras, números, guiones y guiones bajos');
    }

    if (data.precio_referencial && (isNaN(data.precio_referencial) || data.precio_referencial < 0)) {
      errores.push('El precio referencial debe ser un número positivo');
    }

    if (data.rendimiento_referencial && (isNaN(data.rendimiento_referencial) || data.rendimiento_referencial < 0)) {
      errores.push('El rendimiento referencial debe ser un número positivo');
    }

    // Validar tipos permitidos
    const tiposPermitidos = ['material', 'mano_obra', 'equipo', 'subcontrato', 'mixto'];
    if (data.tipo_concepto && !tiposPermitidos.includes(data.tipo_concepto)) {
      errores.push('Tipo de concepto no válido');
    }

    // Validar estados permitidos
    const estadosPermitidos = ['activo', 'inactivo', 'obsoleto'];
    if (data.estado && !estadosPermitidos.includes(data.estado)) {
      errores.push('Estado no válido');
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación:\n${errores.join('\n')}`);
    }
  }

  /**
   * Prepara los datos del concepto para envío al servidor
   * @private
   */
  _prepareConceptoData(data) {
    return {
      codigo: data.codigo?.trim().toUpperCase(),
      nombre: data.nombre?.trim(),
      descripcion: data.descripcion?.trim() || null,
      unidad: data.unidad?.trim(),
      categoria: data.categoria?.trim(),
      subcategoria: data.subcategoria?.trim() || null,
      tipo_concepto: data.tipo_concepto || 'material',
      precio_referencial: data.precio_referencial ? parseFloat(data.precio_referencial) : null,
      moneda: data.moneda || 'MXN',
      estado: data.estado || 'activo',
      rendimiento_referencial: data.rendimiento_referencial ? parseFloat(data.rendimiento_referencial) : null,
      observaciones: data.observaciones?.trim() || null,
      vigente_desde: data.vigente_desde || new Date().toISOString().split('T')[0],
      vigente_hasta: data.vigente_hasta || null,
      creado_por: data.creado_por || 1, // TODO: obtener del contexto de usuario
      fecha_creacion: data.fecha_creacion || new Date().toISOString(),
      metadatos: data.metadatos || null
    };
  }

  /**
   * Limpia el caché relacionado con conceptos
   * @private
   */
  _clearRelatedCache() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('conceptos_') || key === 'categorias_conceptos') {
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
export const ConceptoObraService = new ConceptoObraServiceClass();
export default ConceptoObraService;