import { api } from '../api.js';

/**
 * Servicio para gestión completa de presupuestos de construcción
 * Proporciona funcionalidades profesionales similares a Opus
 */
export class PresupuestosService {
  static cache = new Map();
  static cacheTimeout = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene todos los presupuestos con filtros avanzados
   */
  static async getAll(filtros = {}) {
    const cacheKey = `presupuestos_${JSON.stringify(filtros)}`;
    
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const params = new URLSearchParams();
      
      // Filtros básicos
      if (filtros.busqueda) params.append('busqueda', filtros.busqueda);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
      if (filtros.proyecto_id) params.append('proyecto_id', filtros.proyecto_id);
      if (filtros.prioridad) params.append('prioridad', filtros.prioridad);
      if (filtros.region) params.append('region', filtros.region);
      
      // Filtros de fechas
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde);
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta);
      if (filtros.vigentes) params.append('vigentes', filtros.vigentes);
      
      // Filtros financieros
      if (filtros.monto_minimo) params.append('monto_minimo', filtros.monto_minimo);
      if (filtros.monto_maximo) params.append('monto_maximo', filtros.monto_maximo);
      if (filtros.moneda) params.append('moneda', filtros.moneda);
      
      // Paginación y ordenamiento
      if (filtros.pagina) params.append('pagina', filtros.pagina);
      if (filtros.limite) params.append('limite', filtros.limite);
      if (filtros.orden) params.append('orden', filtros.orden);

      const response = await api.get(`/presupuestos?${params.toString()}`);
      
      // Procesar datos para la interfaz
      const presupuestos = response.data.map(this.procesarPresupuesto);
      
      this.cache.set(cacheKey, {
        data: presupuestos,
        timestamp: Date.now()
      });

      return presupuestos;
    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      throw new Error('No se pudieron cargar los presupuestos');
    }
  }

  /**
   * Obtiene un presupuesto específico por ID con información completa
   */
  static async getById(id) {
    const cacheKey = `presupuesto_${id}`;
    
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (Date.now() - timestamp < this.cacheTimeout) {
        return data;
      }
    }

    try {
      const response = await api.get(`/presupuestos/${id}`);
      const presupuesto = this.procesarPresupuesto(response.data);
      
      this.cache.set(cacheKey, {
        data: presupuesto,
        timestamp: Date.now()
      });

      return presupuesto;
    } catch (error) {
      console.error('Error al obtener presupuesto:', error);
      throw new Error('No se pudo cargar el presupuesto');
    }
  }

  /**
   * Crea un nuevo presupuesto
   */
  static async create(datosPresupuesto) {
    try {
      // Validar datos antes de enviar
      const presupuestoValidado = this.validarDatosPresupuesto(datosPresupuesto);
      
      const response = await api.post('/presupuestos', {
        ...presupuestoValidado,
        estado: 'borrador',
        fecha_creacion: new Date().toISOString(),
        version: '1.0',
        numero_revision: 1
      });

      const nuevoPresupuesto = this.procesarPresupuesto(response.data);
      
      // Limpiar caché relacionado
      this.limpiarCacheRelacionado();
      
      return nuevoPresupuesto;
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      throw new Error(error.response?.data?.message || 'No se pudo crear el presupuesto');
    }
  }

  /**
   * Actualiza un presupuesto existente
   */
  static async update(id, datosActualizados) {
    try {
      const datosValidados = this.validarDatosPresupuesto(datosActualizados, false);
      
      const response = await api.put(`/presupuestos/${id}`, {
        ...datosValidados,
        fecha_actualizacion: new Date().toISOString()
      });

      const presupuestoActualizado = this.procesarPresupuesto(response.data);
      
      // Actualizar caché
      this.cache.set(`presupuesto_${id}`, {
        data: presupuestoActualizado,
        timestamp: Date.now()
      });
      
      // Limpiar caché de listas
      this.limpiarCacheRelacionado();
      
      return presupuestoActualizado;
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      throw new Error(error.response?.data?.message || 'No se pudo actualizar el presupuesto');
    }
  }

  /**
   * Elimina un presupuesto
   */
  static async delete(id) {
    try {
      await api.delete(`/presupuestos/${id}`);
      
      // Limpiar del caché
      this.cache.delete(`presupuesto_${id}`);
      this.limpiarCacheRelacionado();
      
      return true;
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      throw new Error(error.response?.data?.message || 'No se pudo eliminar el presupuesto');
    }
  }

  /**
   * Duplica un presupuesto con configuraciones específicas
   */
  static async duplicar(id, configuracion) {
    try {
      const response = await api.post(`/presupuestos/${id}/duplicar`, {
        ...configuracion,
        fecha_duplicacion: new Date().toISOString()
      });

      const presupuestoDuplicado = this.procesarPresupuesto(response.data);
      
      // Limpiar caché
      this.limpiarCacheRelacionado();
      
      return presupuestoDuplicado;
    } catch (error) {
      console.error('Error al duplicar presupuesto:', error);
      throw new Error(error.response?.data?.message || 'No se pudo duplicar el presupuesto');
    }
  }

  /**
   * Cambia el estado de un presupuesto
   */
  static async cambiarEstado(id, cambioEstado) {
    try {
      const response = await api.patch(`/presupuestos/${id}/estado`, cambioEstado);
      
      const presupuestoActualizado = this.procesarPresupuesto(response.data);
      
      // Actualizar caché
      this.cache.set(`presupuesto_${id}`, {
        data: presupuestoActualizado,
        timestamp: Date.now()
      });
      
      this.limpiarCacheRelacionado();
      
      return presupuestoActualizado;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw new Error(error.response?.data?.message || 'No se pudo cambiar el estado del presupuesto');
    }
  }

  /**
   * Obtiene las partidas de un presupuesto
   */
  static async getPartidas(id, filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.concepto) params.append('concepto', filtros.concepto);
      if (filtros.unidad) params.append('unidad', filtros.unidad);
      if (filtros.incluir_precios) params.append('incluir_precios', filtros.incluir_precios);

      const response = await api.get(`/presupuestos/${id}/partidas?${params.toString()}`);
      
      return response.data.map(partida => ({
        ...partida,
        importe_total: partida.cantidad * partida.precio_unitario,
        precio_formateado: this.formatearMoneda(partida.precio_unitario, partida.moneda),
        importe_formateado: this.formatearMoneda(partida.cantidad * partida.precio_unitario, partida.moneda)
      }));
    } catch (error) {
      console.error('Error al obtener partidas:', error);
      throw new Error('No se pudieron cargar las partidas del presupuesto');
    }
  }

  /**
   * Actualiza el cálculo automático de un presupuesto
   */
  static async recalcular(id, opciones = {}) {
    try {
      const response = await api.post(`/presupuestos/${id}/recalcular`, {
        incluir_utilidad: opciones.incluir_utilidad !== false,
        incluir_iva: opciones.incluir_iva !== false,
        aplicar_descuentos: opciones.aplicar_descuentos || false,
        actualizar_precios: opciones.actualizar_precios || false,
        fecha_calculo: new Date().toISOString()
      });

      const presupuestoActualizado = this.procesarPresupuesto(response.data);
      
      // Actualizar caché
      this.cache.set(`presupuesto_${id}`, {
        data: presupuestoActualizado,
        timestamp: Date.now()
      });
      
      return presupuestoActualizado;
    } catch (error) {
      console.error('Error al recalcular presupuesto:', error);
      throw new Error('No se pudo recalcular el presupuesto');
    }
  }

  /**
   * Exporta un presupuesto a diferentes formatos
   */
  static async exportar(id, formato, opciones = {}) {
    try {
      const response = await api.post(`/presupuestos/${id}/exportar`, {
        formato, // 'pdf', 'excel', 'word', 'xml'
        incluir_partidas: opciones.incluir_partidas !== false,
        incluir_analisis: opciones.incluir_analisis || false,
        incluir_graficos: opciones.incluir_graficos || false,
        plantilla: opciones.plantilla || 'estandar',
        configuracion_export: opciones.configuracion || {}
      }, {
        responseType: 'blob'
      });

      // Crear URL para descarga
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      return {
        url,
        nombre_archivo: response.headers['content-disposition']?.split('filename=')[1] || `presupuesto_${id}.${formato}`,
        tipo_contenido: response.headers['content-type']
      };
    } catch (error) {
      console.error('Error al exportar presupuesto:', error);
      throw new Error('No se pudo exportar el presupuesto');
    }
  }

  /**
   * Obtiene estadísticas y resúmenes de presupuestos
   */
  static async getEstadisticas(filtros = {}) {
    try {
      const params = new URLSearchParams();
      if (filtros.periodo) params.append('periodo', filtros.periodo);
      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id);
      if (filtros.region) params.append('region', filtros.region);

      const response = await api.get(`/presupuestos/estadisticas?${params.toString()}`);
      
      return {
        ...response.data,
        montos_formateados: {
          total_presupuestado: this.formatearMoneda(response.data.total_presupuestado),
          promedio_por_presupuesto: this.formatearMoneda(response.data.promedio_por_presupuesto),
          monto_aprobado: this.formatearMoneda(response.data.monto_aprobado),
          monto_en_ejecucion: this.formatearMoneda(response.data.monto_en_ejecucion)
        }
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw new Error('No se pudieron cargar las estadísticas');
    }
  }

  /**
   * Compara presupuestos para análisis
   */
  static async comparar(ids, criterios = {}) {
    try {
      const response = await api.post('/presupuestos/comparar', {
        presupuestos_ids: ids,
        criterios: {
          comparar_precios: criterios.comparar_precios !== false,
          comparar_partidas: criterios.comparar_partidas !== false,
          comparar_totales: criterios.comparar_totales !== false,
          incluir_graficos: criterios.incluir_graficos || false,
          ...criterios
        }
      });

      return {
        ...response.data,
        resumen_comparacion: response.data.presupuestos.map(p => ({
          ...p,
          total_formateado: this.formatearMoneda(p.total, p.moneda),
          diferencia_formateada: this.formatearMoneda(p.diferencia_promedio, p.moneda)
        }))
      };
    } catch (error) {
      console.error('Error al comparar presupuestos:', error);
      throw new Error('No se pudieron comparar los presupuestos');
    }
  }

  /**
   * Busca presupuestos con criterios avanzados
   */
  static async buscarAvanzado(criterios) {
    try {
      const response = await api.post('/presupuestos/buscar', criterios);
      return response.data.map(this.procesarPresupuesto);
    } catch (error) {
      console.error('Error en búsqueda avanzada:', error);
      throw new Error('Error en la búsqueda avanzada');
    }
  }

  // MÉTODOS AUXILIARES

  /**
   * Procesa y enriquece los datos de un presupuesto
   */
  static procesarPresupuesto(presupuesto) {
    return {
      ...presupuesto,
      // Formatear montos
      subtotal_formateado: this.formatearMoneda(presupuesto.subtotal, presupuesto.moneda),
      total_formateado: this.formatearMoneda(presupuesto.total, presupuesto.moneda),
      impuestos_formateado: this.formatearMoneda(presupuesto.total_impuestos, presupuesto.moneda),
      descuentos_formateado: this.formatearMoneda(presupuesto.descuentos, presupuesto.moneda),
      
      // Fechas formateadas
      fecha_creacion_formateada: this.formatearFecha(presupuesto.fecha_creacion),
      fecha_validez_formateada: this.formatearFecha(presupuesto.fecha_validez),
      fecha_limite_formateada: this.formatearFecha(presupuesto.fecha_limite),
      
      // Estados y flags calculados
      es_vigente: this.esVigente(presupuesto.fecha_validez, presupuesto.fecha_limite),
      dias_para_vencer: this.diasParaVencer(presupuesto.fecha_validez),
      puede_editarse: ['borrador', 'revision'].includes(presupuesto.estado),
      puede_ejecutarse: presupuesto.estado === 'aprobado',
      
      // Información de completitud
      porcentaje_completitud: this.calcularCompletitud(presupuesto),
      resumen_partidas: {
        total_partidas: presupuesto.total_partidas || 0,
        partidas_con_precio: presupuesto.partidas_con_precio || 0,
        partidas_sin_precio: presupuesto.partidas_sin_precio || 0,
        porcentaje_con_precio: presupuesto.total_partidas ? 
          ((presupuesto.partidas_con_precio || 0) / presupuesto.total_partidas * 100).toFixed(1) : '0'
      }
    };
  }

  /**
   * Valida los datos de un presupuesto antes de guardar
   */
  static validarDatosPresupuesto(datos, esNuevo = true) {
    const errores = [];

    // Validaciones básicas
    if (!datos.codigo?.trim()) errores.push('El código es obligatorio');
    if (!datos.nombre?.trim()) errores.push('El nombre es obligatorio');
    if (!datos.nombre_cliente?.trim()) errores.push('El cliente es obligatorio');

    // Validar fechas
    if (datos.fecha_validez && datos.fecha_limite) {
      if (new Date(datos.fecha_validez) > new Date(datos.fecha_limite)) {
        errores.push('La fecha límite debe ser posterior a la fecha de validez');
      }
    }

    // Validar valores numéricos
    if (datos.margen_utilidad < 0 || datos.margen_utilidad > 1) {
      errores.push('El margen de utilidad debe estar entre 0% y 100%');
    }
    if (datos.tasa_iva < 0 || datos.tasa_iva > 1) {
      errores.push('La tasa de IVA debe estar entre 0% y 100%');
    }
    if (datos.descuento_global < 0) {
      errores.push('El descuento no puede ser negativo');
    }

    if (errores.length > 0) {
      throw new Error(`Errores de validación: ${errores.join(', ')}`);
    }

    return {
      codigo: datos.codigo?.trim(),
      nombre: datos.nombre?.trim(),
      descripcion: datos.descripcion?.trim() || null,
      cliente_id: datos.cliente_id || null,
      nombre_cliente: datos.nombre_cliente?.trim(),
      proyecto_id: datos.proyecto_id || null,
      nombre_proyecto: datos.nombre_proyecto?.trim() || null,
      fecha_validez: datos.fecha_validez || null,
      fecha_limite: datos.fecha_limite || null,
      moneda: datos.moneda || 'MXN',
      margen_utilidad: parseFloat(datos.margen_utilidad) || 0,
      incluir_iva: datos.incluir_iva !== false,
      tasa_iva: parseFloat(datos.tasa_iva) || 0.16,
      aplicar_descuentos: datos.aplicar_descuentos || false,
      descuento_global: parseFloat(datos.descuento_global) || 0,
      tipo_descuento: datos.tipo_descuento || 'porcentaje',
      observaciones: datos.observaciones?.trim() || null,
      catalogo_id: datos.catalogo_id || null,
      region: datos.region || 'nacional',
      prioridad: datos.prioridad || 'media',
      confidencial: datos.confidencial || false,
      estado: datos.estado || 'borrador'
    };
  }

  /**
   * Formatea un monto en la moneda especificada
   */
  static formatearMoneda(monto, moneda = 'MXN') {
    if (!monto) return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda }).format(0);
    
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: moneda,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(monto);
  }

  /**
   * Formatea una fecha
   */
  static formatearFecha(fecha) {
    if (!fecha) return null;
    return new Date(fecha).toLocaleDateString('es-MX');
  }

  /**
   * Verifica si un presupuesto está vigente
   */
  static esVigente(fechaValidez, fechaLimite) {
    const ahora = new Date();
    const validez = fechaValidez ? new Date(fechaValidez) : null;
    const limite = fechaLimite ? new Date(fechaLimite) : null;

    if (validez && ahora < validez) return false;
    if (limite && ahora > limite) return false;
    return true;
  }

  /**
   * Calcula días restantes para vencimiento
   */
  static diasParaVencer(fechaValidez) {
    if (!fechaValidez) return null;
    
    const ahora = new Date();
    const validez = new Date(fechaValidez);
    const diferencia = validez.getTime() - ahora.getTime();
    
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  }

  /**
   * Calcula el porcentaje de completitud de un presupuesto
   */
  static calcularCompletitud(presupuesto) {
    let puntos = 0;
    const maxPuntos = 10;

    // Información básica (3 puntos)
    if (presupuesto.codigo) puntos += 1;
    if (presupuesto.nombre) puntos += 1;
    if (presupuesto.descripcion) puntos += 1;

    // Cliente y proyecto (2 puntos)
    if (presupuesto.nombre_cliente) puntos += 1;
    if (presupuesto.nombre_proyecto) puntos += 1;

    // Configuración financiera (2 puntos)
    if (presupuesto.margen_utilidad > 0) puntos += 1;
    if (presupuesto.catalogo_id) puntos += 1;

    // Fechas (2 puntos)
    if (presupuesto.fecha_validez) puntos += 1;
    if (presupuesto.fecha_limite) puntos += 1;

    // Partidas (1 punto)
    if (presupuesto.total_partidas > 0) puntos += 1;

    return Math.round((puntos / maxPuntos) * 100);
  }

  /**
   * Limpia el caché relacionado con presupuestos
   */
  static limpiarCacheRelacionado() {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.startsWith('presupuestos_')) {
        this.cache.delete(key);
      }
    });
  }

  /**
   * Limpia todo el caché del servicio
   */
  static limpiarCache() {
    this.cache.clear();
  }
}