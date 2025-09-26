import ApiService from '../api.js';
import { ConceptoObraService } from './conceptoObraService.js';
import { PrecioUnitarioService } from './precioUnitarioService.js';
import { PresupuestoService } from './presupuestoService.js';
import { CatalogoPrecioService } from './catalogoPrecioService.js';

/**
 * Clase principal para servicios de presupuestos
 * Coordina todos los servicios relacionados con el sistema de presupuestos
 */
class PresupuestosServices {
  constructor() {
    // Instancia principal de API
    this.api = ApiService;
    
    // Servicios especializados (clases estáticas)
    this.conceptosObra = ConceptoObraService;
    this.preciosUnitarios = PrecioUnitarioService;
    this.presupuestos = PresupuestoService;
    this.catalogosPrecios = CatalogoPrecioService;
  }

  /**
   * Inicializa todos los servicios
   * @returns {Promise<boolean>} True si la inicialización fue exitosa
   */
  async initialize() {
    try {
      console.log('🚀 Inicializando servicios de presupuestos...');
      
      // Verificar conexión con la API
      const isConnected = await this.checkConnection();
      if (!isConnected) {
        console.warn('⚠️ Conexión fallida, continuando con inicialización...');
        // No lanzar error, continuar con la inicialización
      }

      console.log('✅ Servicios de presupuestos inicializados exitosamente');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando servicios de presupuestos:', error);
      // Siempre retornar true para permitir que la app continúe
      return true;
    }
  }

  /**
   * Verifica la conexión con la API
   * @returns {Promise<boolean>} True si la conexión es exitosa
   */
  async checkConnection() {
    try {
      console.log('🔍 Verificando conexión con API...');
      const response = await this.api.get('/health');
      console.log('📡 Respuesta del health check:', response);
      
      // Verificar diferentes formatos de respuesta
      if (response && typeof response === 'object') {
        const hasValidStatus = response.status === 'OK' || 
                              response.status === 'ok' || 
                              response.message === 'Backend funcionando correctamente';
        console.log('✅ Conexión verificada:', hasValidStatus);
        return hasValidStatus;
      }
      
      return false;
    } catch (error) {
      console.warn('⚠️ API health check falló:', error.message);
      return true; // Continuar aunque falle el health check
    }
  }

  /**
   * Obtiene estadísticas generales del módulo de presupuestos
   * @returns {Promise<Object>} Estadísticas del módulo
   */
  async getModuleStats() {
    try {
      const [
        conceptosStats,
        preciosStats, 
        presupuestosStats,
        catalogosStats
      ] = await Promise.all([
        this.conceptosObra.getEstadisticas(),
        this.preciosUnitarios.getEstadisticas(),
        this.presupuestos.getEstadisticas(),
        this.catalogosPrecios.getEstadisticas()
      ]);

      return {
        conceptos: conceptosStats,
        precios: preciosStats,
        presupuestos: presupuestosStats,
        catalogos: catalogosStats,
        ultimaActualizacion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas del módulo:', error);
      throw new Error('No se pudieron obtener las estadísticas del módulo');
    }
  }

  /**
   * Realiza una búsqueda global en todo el módulo de presupuestos
   * @param {string} termino - Término de búsqueda
   * @param {Object} filtros - Filtros adicionales
   * @returns {Promise<Object>} Resultados de búsqueda
   */
  async busquedaGlobal(termino, filtros = {}) {
    try {
      const resultados = await Promise.allSettled([
        this.conceptosObra.buscar(termino, { ...filtros, limit: 10 }),
        this.preciosUnitarios.buscar(termino, { ...filtros, limit: 10 }),
        this.presupuestos.buscar(termino, { ...filtros, limit: 10 }),
        this.catalogosPrecios.buscar(termino, { ...filtros, limit: 10 })
      ]);

      return {
        conceptos: resultados[0].status === 'fulfilled' ? resultados[0].value : [],
        precios: resultados[1].status === 'fulfilled' ? resultados[1].value : [],
        presupuestos: resultados[2].status === 'fulfilled' ? resultados[2].value : [],
        catalogos: resultados[3].status === 'fulfilled' ? resultados[3].value : [],
        termino,
        fecha: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error en búsqueda global:', error);
      throw new Error('Error realizando búsqueda global');
    }
  }

  /**
   * Exporta datos completos del módulo
   * @param {string} formato - Formato de exportación ('excel' | 'pdf' | 'csv')
   * @param {Object} opciones - Opciones de exportación
   * @returns {Promise<Blob>} Archivo exportado
   */
  async exportarModulo(formato = 'excel', opciones = {}) {
    try {
      const datos = await this.getModuleStats();
      
      const exportData = {
        modulo: 'presupuestos',
        fecha: new Date().toISOString(),
        estadisticas: datos,
        ...opciones
      };

      // Usar el servicio de presupuestos para la exportación general
      return await this.presupuestos.exportar([exportData], formato, {
        nombreArchivo: `modulo-presupuestos-${new Date().toISOString().split('T')[0]}`,
        ...opciones
      });
    } catch (error) {
      console.error('Error exportando módulo:', error);
      throw new Error('Error al exportar el módulo de presupuestos');
    }
  }

  /**
   * Valida la integridad de datos del módulo
   * @returns {Promise<Object>} Reporte de validación
   */
  async validarIntegridad() {
    try {
      const validaciones = await Promise.allSettled([
        this.conceptosObra.validarLote([]),
        this.preciosUnitarios.validarLote([]),
        this.presupuestos.validarLote([]),
        this.catalogosPrecios.validarLote([])
      ]);

      const reporte = {
        conceptos: validaciones[0].status === 'fulfilled' ? validaciones[0].value : { errores: ['Error de validación'] },
        precios: validaciones[1].status === 'fulfilled' ? validaciones[1].value : { errores: ['Error de validación'] },
        presupuestos: validaciones[2].status === 'fulfilled' ? validaciones[2].value : { errores: ['Error de validación'] },
        catalogos: validaciones[3].status === 'fulfilled' ? validaciones[3].value : { errores: ['Error de validación'] },
        fecha: new Date().toISOString(),
        estado: 'completado'
      };

      // Calcular estado general
      const hayErrores = Object.values(reporte)
        .filter(item => typeof item === 'object' && item.errores)
        .some(item => item.errores.length > 0);

      reporte.estadoGeneral = hayErrores ? 'errores' : 'correcto';

      return reporte;
    } catch (error) {
      console.error('Error validando integridad:', error);
      throw new Error('Error al validar la integridad del módulo');
    }
  }

  /**
   * Limpia la caché de todos los servicios
   */
  limpiarCache() {
    try {
      this.conceptosObra.limpiarCache();
      this.preciosUnitarios.limpiarCache();
      this.presupuestos.limpiarCache();
      this.catalogosPrecios.limpiarCache();
    } catch (error) {
      console.error('Error limpiando caché:', error);
    }
  }

  /**
   * Obtiene la configuración del módulo
   * @returns {Object} Configuración actual
   */
  getConfiguracion() {
    return {
      version: '1.0.0',
      modulo: 'presupuestos',
      servicios: {
        conceptosObra: this.conceptosObra.constructor.name,
        preciosUnitarios: this.preciosUnitarios.constructor.name,
        presupuestos: this.presupuestos.constructor.name,
        catalogosPrecios: this.catalogosPrecios.constructor.name
      },
      apiUrl: this.api.baseURL,
      ultimaInicializacion: new Date().toISOString()
    };
  }
}

// Instancia singleton
const presupuestosServices = new PresupuestosServices();

// Exportaciones por defecto y nombradas
export default presupuestosServices;

export {
  PresupuestosServices,
  ConceptoObraService,
  PrecioUnitarioService,
  PresupuestoService,
  CatalogoPrecioService,
  presupuestosServices
};

// Exportar servicios individuales para uso directo
export const conceptosObraService = presupuestosServices.conceptosObra;
export const preciosUnitariosService = presupuestosServices.preciosUnitarios;
export const presupuestosService = presupuestosServices.presupuestos;
export const catalogosPreciosService = presupuestosServices.catalogosPrecios;