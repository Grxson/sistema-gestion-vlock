/**
 * Sistema de eventos simple para comunicación entre componentes
 * Usa CustomEvent del navegador para emitir y escuchar eventos
 */

class EventBus {
  /**
   * Emite un evento personalizado
   * @param {string} eventName - Nombre del evento
   * @param {*} data - Datos a enviar con el evento
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data });
    window.dispatchEvent(event);
    console.log(`📡 [EventBus] Evento emitido: ${eventName}`, data);
  }

  /**
   * Escucha un evento personalizado
   * @param {string} eventName - Nombre del evento a escuchar
   * @param {Function} callback - Función a ejecutar cuando se emita el evento
   * @returns {Function} Función para dejar de escuchar el evento
   */
  on(eventName, callback) {
    const handler = (event) => callback(event.detail);
    window.addEventListener(eventName, handler);
    
    // Retornar función para cleanup
    return () => window.removeEventListener(eventName, handler);
  }

  /**
   * Escucha un evento una sola vez
   * @param {string} eventName - Nombre del evento a escuchar
   * @param {Function} callback - Función a ejecutar cuando se emita el evento
   */
  once(eventName, callback) {
    const handler = (event) => {
      callback(event.detail);
      window.removeEventListener(eventName, handler);
    };
    window.addEventListener(eventName, handler);
  }
}

// Exportar instancia singleton
export const eventBus = new EventBus();

// Nombres de eventos predefinidos
export const EVENTS = {
  ADEUDO_ACTUALIZADO: 'adeudo:actualizado',
  ADEUDO_PAGADO: 'adeudo:pagado',
  ADEUDO_ELIMINADO: 'adeudo:eliminado',
  ADEUDO_CREADO: 'adeudo:creado',
  RECARGAR_ALERTAS: 'alertas:recargar',
};

export default eventBus;
