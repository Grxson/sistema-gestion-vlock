import ApiService from '../api.js';
import { NominaService } from './nominaService.js';
import { CalculadoraNominaService } from './calculadoraNominaService.js';
import { EmpleadoNominaService } from './empleadoNominaService.js';
import { ReportesNominaService } from './reportesNominaService.js';
import { ValidacionesNominaService } from './validacionesNominaService.js';
import AdeudosService from './adeudosService.js';

/**
 * Clase principal para servicios de nóminas
 * Coordina todos los servicios relacionados con el sistema de nóminas
 */
class NominasServices {
  constructor() {
    // Instancia principal de API
    this.api = ApiService;
    
    // Servicios especializados (clases estáticas)
    this.nominas = NominaService;
    this.calculadora = CalculadoraNominaService;
    this.empleados = EmpleadoNominaService;
    this.reportes = ReportesNominaService;
    this.validaciones = ValidacionesNominaService;
    this.adeudos = AdeudosService;
  }

  /**
   * Inicializa todos los servicios
   * @returns {Promise<boolean>} True si la inicialización fue exitosa
   */
  async inicializar() {
    try {
      console.log('Inicializando servicios de nóminas...');
      
      // Aquí se pueden hacer validaciones iniciales o configuraciones
      // Por ejemplo, verificar que las tablas fiscales estén actualizadas
      
      console.log('Servicios de nóminas inicializados correctamente');
      return true;
    } catch (error) {
      console.error('Error al inicializar servicios de nóminas:', error);
      return false;
    }
  }

  /**
   * Obtiene estadísticas generales del módulo de nóminas
   * @returns {Promise<Object>} Estadísticas del módulo
   */
  async getEstadisticas() {
    try {
      const [empleadosActivos, nominasPeriodo, totalSalarios] = await Promise.all([
        this.empleados.getEmpleadosActivos(),
        this.nominas.getNominasPeriodoActual(),
        this.calculadora.getTotalSalariosMensuales()
      ]);

      return {
        empleadosActivos: empleadosActivos.length,
        nominasPeriodo: nominasPeriodo.length,
        totalSalariosMensuales: totalSalarios,
        periodoActual: this.getPeriodoActual()
      };
    } catch (error) {
      console.error('Error al obtener estadísticas de nóminas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el período actual en formato YYYY-MM
   * @returns {string} Período actual
   */
  getPeriodoActual() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Procesa múltiples nóminas en lote
   * @param {Array} datosNominas - Array de datos de nóminas a procesar
   * @returns {Promise<Object>} Resultado del procesamiento masivo
   */
  async procesarNominasMasivas(datosNominas) {
    try {
      const resultados = {
        exitosas: [],
        fallidas: [],
        total: datosNominas.length
      };

      for (const datosNomina of datosNominas) {
        try {
          // Validar datos antes de procesar
          const validacion = await this.validaciones.validarDatosNomina(datosNomina);
          if (!validacion.esValida) {
            resultados.fallidas.push({
              empleado: datosNomina.id_empleado,
              error: validacion.errores.join(', ')
            });
            continue;
          }

          // Calcular nómina
          const calculo = await this.calculadora.calcularNomina(datosNomina);
          
          // Procesar nómina
          const resultado = await this.nominas.procesarNomina({
            ...datosNomina,
            calculo
          });

          resultados.exitosas.push(resultado);
        } catch (error) {
          resultados.fallidas.push({
            empleado: datosNomina.id_empleado,
            error: error.message
          });
        }
      }

      return resultados;
    } catch (error) {
      console.error('Error en procesamiento masivo de nóminas:', error);
      throw error;
    }
  }

  /**
   * Exporta datos de nóminas en diferentes formatos
   * @param {Object} filtros - Filtros para la exportación
   * @param {string} formato - Formato de exportación (excel, csv, pdf)
   * @returns {Promise<Blob>} Archivo generado
   */
  async exportarNominas(filtros = {}, formato = 'excel') {
    try {
      const datos = await this.nominas.getNominasConFiltros(filtros);
      return await this.reportes.exportarNominas(datos, formato);
    } catch (error) {
      console.error('Error al exportar nóminas:', error);
      throw error;
    }
  }
}

// Instancia singleton
const nominasServices = new NominasServices();

export default nominasServices;
