import ApiService from '../api.js';

/**
 * Servicio para gestionar operaciones CRUD de Catálogos de Precios
 * Maneja versiones, importación/exportación y gestión completa de catálogos
 */
class CatalogosServiceClass {
  constructor() {
    this.endpoint = '/catalogos-precios';
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutos (más duradero por ser catálogos)
  }

  /**
   * Obtiene todos los catálogos con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Array>} Lista de catálogos
   */
  async getAll(filtros = {}) {
    const cacheKey = `catalogos_${JSON.stringify(filtros)}`;
    
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
      if (filtros.tipo) queryParams.append('tipo', filtros.tipo);
      if (filtros.estado) queryParams.append('estado', filtros.estado);
      if (filtros.region) queryParams.append('region', filtros.region);
      if (filtros.organizacion) queryParams.append('organizacion', filtros.organizacion);
      if (filtros.fecha_desde) queryParams.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) queryParams.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.vigente) queryParams.append('vigente', filtros.vigente);
      if (filtros.con_precios) queryParams.append('con_precios', filtros.con_precios);
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
      console.error('Error al obtener catálogos:', error);
      throw new Error(`Error al cargar catálogos: ${error.message}`);
    }
  }

  /**
   * Obtiene un catálogo específico por ID
   * @param {number|string} id - ID del catálogo
   * @returns {Promise<Object>} Catálogo encontrado
   */
  async getById(id) {
    const cacheKey = `catalogo_${id}`;
    
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
      console.error(`Error al obtener catálogo ${id}:`, error);
      throw new Error(`Error al cargar catálogo: ${error.message}`);
    }
  }

  /**
   * Obtiene catálogos vigentes
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Array>} Catálogos vigentes
   */
  async getVigentes(filtros = {}) {
    try {
      const filtrosCompletos = {
        ...filtros,
        vigente: true,
        estado: 'activo'
      };

      return await this.getAll(filtrosCompletos);
    } catch (error) {
      console.error('Error al obtener catálogos vigentes:', error);
      throw new Error(`Error al cargar catálogos vigentes: ${error.message}`);
    }
  }

  /**
   * Crea un nuevo catálogo de precios
   * @param {Object} catalogoData - Datos del catálogo
   * @returns {Promise<Object>} Catálogo creado
   */
  async create(catalogoData) {
    try {
      // Validaciones básicas
      this._validateCatalogoData(catalogoData);

      // Preparar datos para envío
      const dataToSend = this._prepareCatalogoData(catalogoData);

      const response = await ApiService.post(this.endpoint, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al crear catálogo:', error);
      throw new Error(`Error al crear catálogo: ${error.message}`);
    }
  }

  /**
   * Actualiza un catálogo existente
   * @param {number|string} id - ID del catálogo
   * @param {Object} catalogoData - Datos actualizados
   * @returns {Promise<Object>} Catálogo actualizado
   */
  async update(id, catalogoData) {
    try {
      // Validaciones básicas
      this._validateCatalogoData(catalogoData, id);

      // Preparar datos para envío
      const dataToSend = this._prepareCatalogoData(catalogoData);
      dataToSend.fecha_actualizacion = new Date().toISOString();

      const response = await ApiService.put(`${this.endpoint}/${id}`, dataToSend);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`catalogo_${id}`);

      return response.data;
    } catch (error) {
      console.error(`Error al actualizar catálogo ${id}:`, error);
      throw new Error(`Error al actualizar catálogo: ${error.message}`);
    }
  }

  /**
   * Elimina un catálogo
   * @param {number|string} id - ID del catálogo
   * @returns {Promise<boolean>} Resultado de la operación
   */
  async delete(id) {
    try {
      await ApiService.delete(`${this.endpoint}/${id}`);
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`catalogo_${id}`);

      return true;
    } catch (error) {
      console.error(`Error al eliminar catálogo ${id}:`, error);
      throw new Error(`Error al eliminar catálogo: ${error.message}`);
    }
  }

  /**
   * Duplica un catálogo existente
   * @param {number|string} id - ID del catálogo a duplicar
   * @param {Object} nuevosDatos - Datos a modificar en la copia
   * @returns {Promise<Object>} Catálogo duplicado
   */
  async duplicar(id, nuevosDatos = {}) {
    try {
      const dataToSend = {
        nuevo_codigo: nuevosDatos.codigo || `${id}_COPIA`,
        nuevo_nombre: nuevosDatos.nombre || 'Copia de catálogo',
        nueva_version: nuevosDatos.version || '1.0',
        incluir_precios: nuevosDatos.incluir_precios !== false,
        incluir_conceptos: nuevosDatos.incluir_conceptos !== false,
        ...nuevosDatos
      };

      const response = await ApiService.post(`${this.endpoint}/${id}/duplicar`, dataToSend);
      
      // Limpiar caché tras operación
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error(`Error al duplicar catálogo ${id}:`, error);
      throw new Error(`Error al duplicar catálogo: ${error.message}`);
    }
  }

  /**
   * Cambia el estado de un catálogo
   * @param {number|string} id - ID del catálogo
   * @param {string} nuevoEstado - Nuevo estado
   * @returns {Promise<Object>} Catálogo actualizado
   */
  async cambiarEstado(id, nuevoEstado) {
    try {
      const response = await ApiService.patch(`${this.endpoint}/${id}/estado`, { 
        estado: nuevoEstado,
        fecha_cambio: new Date().toISOString()
      });
      
      // Limpiar caché relacionado
      this._clearRelatedCache();
      this.cache.delete(`catalogo_${id}`);

      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del catálogo ${id}:`, error);
      throw new Error(`Error al cambiar estado: ${error.message}`);
    }
  }

  /**
   * Publica un catálogo (cambia estado a activo)
   * @param {number|string} id - ID del catálogo
   * @param {Object} parametros - Parámetros de publicación
   * @returns {Promise<Object>} Catálogo publicado
   */
  async publicar(id, parametros = {}) {
    try {
      const dataToSend = {
        fecha_publicacion: parametros.fecha_publicacion || new Date().toISOString(),
        vigente_desde: parametros.vigente_desde,
        vigente_hasta: parametros.vigente_hasta,
        observaciones_publicacion: parametros.observaciones
      };

      const response = await ApiService.post(`${this.endpoint}/${id}/publicar`, dataToSend);
      
      // Limpiar caché tras publicación
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error(`Error al publicar catálogo ${id}:`, error);
      throw new Error(`Error al publicar catálogo: ${error.message}`);
    }
  }

  /**
   * Obtiene el contenido detallado de un catálogo
   * @param {number|string} id - ID del catálogo
   * @param {Object} filtros - Filtros para el contenido
   * @returns {Promise<Object>} Contenido del catálogo
   */
  async getContenido(id, filtros = {}) {
    const cacheKey = `contenido_${id}_${JSON.stringify(filtros)}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const queryParams = new URLSearchParams(filtros);
      const response = await ApiService.get(`${this.endpoint}/${id}/contenido?${queryParams.toString()}`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener contenido del catálogo ${id}:`, error);
      throw new Error(`Error al cargar contenido: ${error.message}`);
    }
  }

  /**
   * Importa un catálogo desde archivo
   * @param {File} archivo - Archivo a importar
   * @param {Object} opciones - Opciones de importación
   * @returns {Promise<Object>} Resultado de la importación
   */
  async importar(archivo, opciones = {}) {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      formData.append('opciones', JSON.stringify({
        sobrescribir_existentes: opciones.sobrescribir_existentes || false,
        crear_nuevo_catalogo: opciones.crear_nuevo_catalogo !== false,
        incluir_precios: opciones.incluir_precios !== false,
        incluir_conceptos: opciones.incluir_conceptos !== false,
        incluir_metadatos: opciones.incluir_metadatos !== false,
        region_destino: opciones.region_destino,
        prefijo_codigos: opciones.prefijo_codigos,
        ...opciones
      }));

      const response = await ApiService.post(`${this.endpoint}/importar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 120000 // 2 minutos para importaciones grandes
      });

      // Limpiar caché tras importación
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error('Error al importar catálogo:', error);
      throw new Error(`Error en importación: ${error.message}`);
    }
  }

  /**
   * Exporta un catálogo a archivo
   * @param {number|string} id - ID del catálogo (opcional, si no se proporciona exporta todos)
   * @param {Object} opciones - Opciones de exportación
   * @returns {Promise<Blob>} Archivo generado
   */
  async exportar(id = null, opciones = {}) {
    try {
      const params = {
        formato: opciones.formato || 'excel',
        incluir_precios: opciones.incluir_precios !== false,
        incluir_conceptos: opciones.incluir_conceptos !== false,
        incluir_metadatos: opciones.incluir_metadatos !== false,
        incluir_estadisticas: opciones.incluir_estadisticas || false,
        solo_vigentes: opciones.solo_vigentes || false,
        region: opciones.region,
        ...opciones
      };

      const queryParams = new URLSearchParams(params);
      const endpoint = id ? `${this.endpoint}/${id}/exportar` : `${this.endpoint}/exportar`;
      
      const response = await ApiService.get(`${endpoint}?${queryParams.toString()}`, {
        responseType: 'blob',
        timeout: 300000 // 5 minutos para exportaciones grandes
      });

      return response.data;
    } catch (error) {
      console.error('Error al exportar catálogo:', error);
      throw new Error(`Error en exportación: ${error.message}`);
    }
  }

  /**
   * Sincroniza un catálogo con fuente externa
   * @param {number|string} id - ID del catálogo
   * @param {Object} configuracion - Configuración de sincronización
   * @returns {Promise<Object>} Resultado de la sincronización
   */
  async sincronizar(id, configuracion = {}) {
    try {
      const dataToSend = {
        fuente_url: configuracion.fuente_url,
        tipo_fuente: configuracion.tipo_fuente || 'api',
        credenciales: configuracion.credenciales,
        mapeo_campos: configuracion.mapeo_campos,
        filtros_fuente: configuracion.filtros_fuente,
        actualizar_existentes: configuracion.actualizar_existentes !== false,
        crear_nuevos: configuracion.crear_nuevos !== false
      };

      const response = await ApiService.post(`${this.endpoint}/${id}/sincronizar`, dataToSend);
      
      // Limpiar caché tras sincronización
      this._clearRelatedCache();

      return response.data;
    } catch (error) {
      console.error(`Error al sincronizar catálogo ${id}:`, error);
      throw new Error(`Error en sincronización: ${error.message}`);
    }
  }

  /**
   * Obtiene estadísticas de un catálogo
   * @param {number|string} id - ID del catálogo
   * @returns {Promise<Object>} Estadísticas del catálogo
   */
  async getEstadisticas(id) {
    const cacheKey = `estadisticas_${id}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await ApiService.get(`${this.endpoint}/${id}/estadisticas`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener estadísticas del catálogo ${id}:`, error);
      throw new Error(`Error al cargar estadísticas: ${error.message}`);
    }
  }

  /**
   * Compara dos catálogos
   * @param {number|string} catalogoId1 - ID del primer catálogo
   * @param {number|string} catalogoId2 - ID del segundo catálogo
   * @param {Object} opciones - Opciones de comparación
   * @returns {Promise<Object>} Resultado de la comparación
   */
  async comparar(catalogoId1, catalogoId2, opciones = {}) {
    try {
      const dataToSend = {
        catalogo_base: catalogoId1,
        catalogo_comparacion: catalogoId2,
        comparar_precios: opciones.comparar_precios !== false,
        comparar_conceptos: opciones.comparar_conceptos !== false,
        mostrar_diferencias_precio: opciones.mostrar_diferencias_precio !== false,
        umbral_diferencia: opciones.umbral_diferencia || 0.05, // 5% por defecto
        ...opciones
      };

      const response = await ApiService.post(`${this.endpoint}/comparar`, dataToSend);
      return response.data;
    } catch (error) {
      console.error('Error al comparar catálogos:', error);
      throw new Error(`Error en comparación: ${error.message}`);
    }
  }

  /**
   * Obtiene el historial de versiones de un catálogo
   * @param {number|string} id - ID del catálogo
   * @returns {Promise<Array>} Historial de versiones
   */
  async getHistorialVersiones(id) {
    const cacheKey = `historial_${id}`;
    
    // Verificar caché
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    try {
      const response = await ApiService.get(`${this.endpoint}/${id}/historial`);
      
      // Cachear resultado
      this.cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });

      return response.data;
    } catch (error) {
      console.error(`Error al obtener historial del catálogo ${id}:`, error);
      throw new Error(`Error al cargar historial: ${error.message}`);
    }
  }

  /**
   * Valida los datos de un catálogo
   * @private
   */
  _validateCatalogoData(data, id = null) {
    const errores = [];

    // Validaciones obligatorias
    if (!data.codigo?.trim()) errores.push('El código es obligatorio');
    if (!data.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!data.version?.trim()) errores.push('La versión es obligatoria');

    // Validaciones de formato
    if (data.codigo && !/^[A-Z0-9_-]+$/i.test(data.codigo)) {
      errores.push('El código solo puede contener letras, números, guiones y guiones bajos');
    }

    // Validar fechas
    if (data.vigente_desde && data.vigente_hasta) {
      if (new Date(data.vigente_desde) > new Date(data.vigente_hasta)) {
        errores.push('La fecha de vigencia inicial debe ser anterior a la final');
      }
    }

    // Validar tipos permitidos
    const tiposPermitidos = ['oficial', 'regional', 'empresa', 'proyecto'];
    if (data.tipo && !tiposPermitidos.includes(data.tipo)) {
      errores.push('Tipo de catálogo no válido');
    }

    // Validar estados permitidos
    const estadosPermitidos = ['borrador', 'revision', 'activo', 'archivado', 'obsoleto'];
    if (data.estado && !estadosPermitidos.includes(data.estado)) {
      errores.push('Estado no válido');
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación:\n${errores.join('\n')}`);
    }
  }

  /**
   * Prepara los datos del catálogo para envío al servidor
   * @private
   */
  _prepareCatalogoData(data) {
    return {
      codigo: data.codigo?.trim().toUpperCase(),
      nombre: data.nombre?.trim(),
      descripcion: data.descripcion?.trim() || null,
      version: data.version?.trim(),
      tipo: data.tipo || 'empresa',
      estado: data.estado || 'borrador',
      region: data.region?.trim() || null,
      organizacion: data.organizacion?.trim() || null,
      fuente_datos: data.fuente_datos?.trim() || null,
      fecha_publicacion: data.fecha_publicacion || null,
      vigente_desde: data.vigente_desde || null,
      vigente_hasta: data.vigente_hasta || null,
      observaciones: data.observaciones?.trim() || null,
      creado_por: data.creado_por || 1, // TODO: obtener del contexto de usuario
      fecha_creacion: data.fecha_creacion || new Date().toISOString(),
      metadatos: data.metadatos || null,
      configuracion_sync: data.configuracion_sync || null
    };
  }

  /**
   * Limpia el caché relacionado con catálogos
   * @private
   */
  _clearRelatedCache() {
    const keysToDelete = [];
    for (const key of this.cache.keys()) {
      if (key.startsWith('catalogos_') || 
          key.startsWith('contenido_') || 
          key.startsWith('estadisticas_') ||
          key.startsWith('historial_')) {
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
export const CatalogosService = new CatalogosServiceClass();
export default CatalogosService;