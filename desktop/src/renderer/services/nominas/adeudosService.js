import ApiService from '../api';

/**
 * Servicio para manejar adeudos de empleados
 */
class AdeudosService {
  /**
   * Obtener todos los adeudos de un empleado
   * @param {number} idEmpleado - ID del empleado
   * @returns {Promise<Array>} Lista de adeudos
   */
  static async getAdeudosEmpleado(idEmpleado) {
    try {
      const response = await ApiService.get(`/adeudos/empleado/${idEmpleado}`);
      return response.data || response || [];
    } catch (error) {
      console.error('Error getting employee debts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener el total de adeudos pendientes de un empleado
   * @param {number} idEmpleado - ID del empleado
   * @returns {Promise<number>} Total de adeudos pendientes
   */
  static async getTotalAdeudosPendientes(idEmpleado) {
    try {
      const adeudos = await this.getAdeudosEmpleado(idEmpleado);
      return adeudos
        .filter(adeudo => adeudo.estado === 'Pendiente' || adeudo.estado === 'Parcial')
        .reduce((total, adeudo) => total + parseFloat(adeudo.monto_pendiente || 0), 0);
    } catch (error) {
      console.error('Error getting total pending debts:', error);
      return 0;
    }
  }

  /**
   * Crear un nuevo adeudo
   * @param {Object} adeudoData - Datos del adeudo
   * @returns {Promise<Object>} Adeudo creado
   */
  static async crearAdeudo(adeudoData) {
    try {
      const response = await ApiService.post('/adeudos', adeudoData);
      return response.data || response;
    } catch (error) {
      console.error('Error creating debt:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar un adeudo (pago parcial)
   * @param {number} idAdeudo - ID del adeudo
   * @param {Object} updateData - Datos a actualizar
   * @returns {Promise<Object>} Adeudo actualizado
   */
  static async actualizarAdeudo(idAdeudo, updateData) {
    try {
      const response = await ApiService.put(`/adeudos/${idAdeudo}`, updateData);
      return response.data || response;
    } catch (error) {
      console.error('Error updating debt:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Liquidar un adeudo completamente
   * @param {number} idAdeudo - ID del adeudo
   * @returns {Promise<Object>} Adeudo liquidado
   */
  static async liquidarAdeudo(idAdeudo) {
    try {
      const response = await ApiService.put(`/adeudos/${idAdeudo}/liquidar`);
      return response.data || response;
    } catch (error) {
      console.error('Error liquidating debt:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener todos los adeudos pendientes (para reportes)
   * @returns {Promise<Array>} Lista de todos los adeudos pendientes
   */
  static async getAllAdeudosPendientes() {
    try {
      const response = await ApiService.get('/adeudos/pendientes');
      return response.data || response || [];
    } catch (error) {
      console.error('Error getting all pending debts:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener estadísticas de adeudos
   * @returns {Promise<Object>} Estadísticas de adeudos
   */
  static async getEstadisticasAdeudos() {
    try {
      const response = await ApiService.get('/adeudos/estadisticas');
      return response.data || response || {};
    } catch (error) {
      console.error('Error getting debt statistics:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Manejar errores del servicio
   * @param {Error} error - Error capturado
   * @returns {Error} Error procesado
   */
  static handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const message = error.response.data?.message || error.response.data?.error || 'Error del servidor';
      return new Error(message);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión. Verifica tu conexión a internet.');
    } else {
      // Error de configuración
      return new Error('Error inesperado: ' + error.message);
    }
  }
}

export default AdeudosService;
