/**
 * Utilidades para diagnóstico del sistema
 * Proporciona funciones helpers para monitoreo y health checks
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Realiza un health check básico del backend
 */
export const checkBackendHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        data: data,
        responseTime: performance.now()
      };
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}`,
        responseTime: performance.now()
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      responseTime: performance.now()
    };
  }
};

/**
 * Realiza un health check de la base de datos
 */
export const checkDatabaseHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/db/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'healthy',
        data: data,
        responseTime: performance.now()
      };
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}`,
        responseTime: performance.now()
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message,
      responseTime: performance.now()
    };
  }
};

/**
 * Obtiene métricas del sistema desde el backend
 */
export const getSystemMetrics = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/metrics`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'success',
        metrics: data
      };
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Verifica el estado de todos los servicios
 */
export const checkAllServices = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'GET',
      signal: AbortSignal.timeout(10000) // Más tiempo para verificar múltiples servicios
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        status: 'success',
        services: data
      };
    } else {
      return {
        status: 'error',
        error: `HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

/**
 * Mide el tiempo de respuesta de un endpoint específico
 */
export const measureResponseTime = async (endpoint, options = {}) => {
  const start = performance.now();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
      ...options
    });
    
    const responseTime = performance.now() - start;
    
    return {
      endpoint,
      responseTime: parseFloat(responseTime.toFixed(2)),
      status: response.status,
      ok: response.ok,
      error: null
    };
  } catch (error) {
    const responseTime = performance.now() - start;
    
    return {
      endpoint,
      responseTime: parseFloat(responseTime.toFixed(2)),
      status: null,
      ok: false,
      error: error.message
    };
  }
};

/**
 * Obtiene información básica del navegador y sistema
 */
export const getBrowserInfo = () => {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages,
    platform: navigator.platform,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    vendor: navigator.vendor,
    hardwareConcurrency: navigator.hardwareConcurrency,
    maxTouchPoints: navigator.maxTouchPoints,
    pdfViewerEnabled: navigator.pdfViewerEnabled || false
  };
};

/**
 * Obtiene información de memoria si está disponible
 */
export const getMemoryInfo = () => {
  if (window.performance && window.performance.memory) {
    const memory = window.performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024 * 100) / 100,
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024 * 100) / 100,
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024 * 100) / 100,
      available: true
    };
  }
  return {
    used: 0,
    total: 0,
    limit: 0,
    available: false
  };
};

/**
 * Obtiene información de rendimiento de la página
 */
export const getPerformanceInfo = () => {
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    return {
      navigationStart: timing.navigationStart,
      loadStart: timing.loadEventStart - timing.navigationStart,
      loadEnd: timing.loadEventEnd - timing.navigationStart,
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      available: true
    };
  }
  return {
    available: false
  };
};

/**
 * Registra un evento en el log local
 */
export const logDiagnosticEvent = (level, message, details = null) => {
  const event = {
    timestamp: new Date().toISOString(),
    level,
    message,
    details,
    source: 'diagnostic-utils'
  };
  
  // Almacenar en localStorage si es posible
  try {
    const existingLogs = JSON.parse(localStorage.getItem('vlock_diagnostic_logs') || '[]');
    existingLogs.unshift(event);
    
    // Mantener solo los últimos 100 logs
    if (existingLogs.length > 100) {
      existingLogs.splice(100);
    }
    
    localStorage.setItem('vlock_diagnostic_logs', JSON.stringify(existingLogs));
  } catch (error) {
    console.warn('No se pudo guardar el log en localStorage:', error);
  }
  
  // También hacer log en consola
  console.log(`[DIAGNOSTIC] ${level.toUpperCase()}: ${message}`, details || '');
  
  return event;
};

/**
 * Obtiene todos los logs de diagnóstico almacenados
 */
export const getDiagnosticLogs = () => {
  try {
    return JSON.parse(localStorage.getItem('vlock_diagnostic_logs') || '[]');
  } catch (error) {
    console.warn('Error al obtener logs de diagnóstico:', error);
    return [];
  }
};

/**
 * Limpia todos los logs de diagnóstico
 */
export const clearDiagnosticLogs = () => {
  try {
    localStorage.removeItem('vlock_diagnostic_logs');
    return true;
  } catch (error) {
    console.warn('Error al limpiar logs de diagnóstico:', error);
    return false;
  }
};
