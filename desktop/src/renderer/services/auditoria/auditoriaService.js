import api from '../api';

/**
 * Servicio para gestionar las operaciones de auditoría
 */
class AuditoriaService {
  /**
   * Obtener registros de auditoría con filtros y paginación
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con los registros de auditoría
   */
  async getRegistros(params = {}) {
    try {
      const response = await api.get('/auditoria', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener registros de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtener un registro de auditoría específico
   * @param {number} id - ID del registro
   * @returns {Promise} Promesa con el registro de auditoría
   */
  async getRegistro(id) {
    try {
      const response = await api.get(`/auditoria/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener registro de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de auditoría
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con las estadísticas
   */
  async getEstadisticas(params = {}) {
    try {
      const response = await api.get('/auditoria/estadisticas', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener estadísticas de auditoría:', error);
      throw error;
    }
  }

  /**
   * Obtener actividad por usuario
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con la actividad por usuario
   */
  async getActividadPorUsuario(params = {}) {
    try {
      const response = await api.get('/auditoria/actividad-usuario', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad por usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener actividad por tabla
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con la actividad por tabla
   */
  async getActividadPorTabla(params = {}) {
    try {
      const response = await api.get('/auditoria/actividad-tabla', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener actividad por tabla:', error);
      throw error;
    }
  }

  /**
   * Exportar registros de auditoría a Excel
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con el archivo
   */
  async exportarExcel(params = {}) {
    try {
      const response = await api.get('/auditoria/exportar/excel', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      throw error;
    }
  }

  /**
   * Exportar registros de auditoría a PDF
   * @param {Object} params - Parámetros de búsqueda
   * @returns {Promise} Promesa con el archivo
   */
  async exportarPDF(params = {}) {
    try {
      const response = await api.get('/auditoria/exportar/pdf', {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Error al exportar a PDF:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de usuarios para filtros
   * @returns {Promise} Promesa con la lista de usuarios
   */
  async getUsuarios() {
    try {
      const response = await api.get('/usuarios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }

  /**
   * Obtener lista de tablas disponibles
   * @returns {Promise} Promesa con la lista de tablas
   */
  async getTablas() {
    try {
      const response = await api.get('/auditoria/tablas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener tablas:', error);
      throw error;
    }
  }
}

export default new AuditoriaService();
