const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  /**
   * Obtiene el token JWT del almacenamiento local
   * @returns {string|null} El token JWT o null si no existe
   */
  getToken() {
    return localStorage.getItem('token');
  }
  
  /**
   * Analiza un token JWT y devuelve su payload
   * @param {string} token - El token JWT a decodificar
   * @returns {object|null} El payload del token o null si el token es inválido
   */
  parseJwt(token) {
    if (!token) return null;
    
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error al parsear token JWT:', error);
      return null;
    }
  }
  
  /**
   * Obtiene la fecha de expiración del token actual
   * @returns {Date|null} La fecha de expiración o null si no hay token o es inválido
   */
  getTokenExpiry() {
    const token = this.getToken();
    if (!token) return null;
    
    const payload = this.parseJwt(token);
    if (!payload || !payload.exp) return null;
    
    // La expiración está en segundos desde epoch
    return new Date(payload.exp * 1000);
  }
  
  /**
   * Verifica si el token actual ha expirado
   * @returns {boolean} true si el token ha expirado o no existe, false si es válido
   */
  isTokenExpired() {
    const expiry = this.getTokenExpiry();
    if (!expiry) return true;
    
    // Comprobar si la fecha de expiración ya pasó
    return expiry <= new Date();
  }

  // Configurar headers con autenticación
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Método genérico para hacer peticiones HTTP
   * Incluye manejo de errores y verificación de token
   * 
   * @param {string} endpoint - La ruta del endpoint
   * @param {object} options - Opciones de configuración
   * @returns {Promise<object>} - La respuesta del servidor
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.auth !== false),
    };

    // Para depuración
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(2, 10);
    
    console.log(`[API:${requestId}] 🌐 Enviando petición a ${endpoint}`);
    
    try {
      // Verificar token antes de enviar la petición si se requiere autenticación
      if (options.auth !== false && this.isTokenExpired()) {
        console.warn(`[API:${requestId}] ⚠️ Token expirado antes de realizar petición`);
        
        // Redirigir y lanzar error
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Token expirado');
      }
      
      // Realizar la petición
      const response = await fetch(url, config);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      console.log(`[API:${requestId}] ✅ Respuesta recibida (${response.status}) en ${duration}ms`);
      
      // Si la respuesta es 401, el token ha expirado
      if (response.status === 401) {
        console.warn(`[API:${requestId}] ⚠️ Autenticación rechazada por el servidor (401)`);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Sesión expirada');
      }
      
      // Si la respuesta es 403, no tiene permiso
      if (response.status === 403) {
        console.warn(`[API:${requestId}] ⚠️ Acceso denegado (403)`);
        const errorData = await response.json();
        const error = new Error(errorData.message || 'No tienes permiso para realizar esta acción');
        error.status = 403;
        error.data = errorData;
        error.endpoint = endpoint;
        throw error;
      }

      // Manejo de otros errores por código de estado
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Error en la respuesta del servidor' };
        }

        console.error(`[API:${requestId}] ❌ Error ${response.status} en ${endpoint}:`, errorData);
        const error = new Error(errorData.message || this.getDefaultErrorMessage(response.status));
        error.status = response.status;
        error.data = errorData;
        error.endpoint = endpoint;
        throw error;
      }

      // Procesar respuesta exitosa
      const data = await response.json();
      console.log(`[API:${requestId}] 📦 Datos recibidos (${Object.keys(data).length} propiedades)`);
      return data;
      
    } catch (error) {
      // Manejar errores de red
      if (!error.status && error.name === 'TypeError') {
        console.error(`[API:${requestId}] 🔌 Error de conexión con ${endpoint}`);
        error.message = 'Error de conexión con el servidor. Verifica tu conexión a internet.';
      }
      
      // Registrar el error
      console.error(`[API:${requestId}] ❌ Error en ${endpoint}:`, error);
      throw error;
    }
  }
  
  // Mensajes de error por defecto según el código de estado
  getDefaultErrorMessage(statusCode) {
    const messages = {
      400: 'Solicitud incorrecta. Por favor, verifica los datos enviados.',
      401: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
      403: 'No tienes permisos para realizar esta acción.',
      404: 'El recurso solicitado no fue encontrado.',
      409: 'Existe un conflicto con el estado actual del recurso.',
      422: 'No se pudo procesar la información enviada.',
      429: 'Demasiadas solicitudes. Por favor, intenta más tarde.',
      500: 'Error interno del servidor. Por favor, intenta más tarde.',
      503: 'Servicio no disponible temporalmente. Por favor, intenta más tarde.'
    };
    
    return messages[statusCode] || 'Error en la solicitud';
  }

  // Métodos HTTP
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  // Métodos de autenticación
  async login(credentials) {
    // Adaptar el formato de credenciales si viene 'usuario' en lugar de 'email'
    const adaptedCredentials = { 
      email: credentials.usuario || credentials.email,
      password: credentials.password
    };
    
    const response = await this.post('/auth/login', adaptedCredentials, { auth: false });
    
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.usuario));
    }
    
    return response;
  }

  async register(userData) {
    return this.post('/auth/register', userData, { auth: false });
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Error al hacer logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  async verifyAuth() {
    return this.get('/auth/verify');
  }

  // Métodos específicos para empleados
  async getEmpleados() {
    return this.get('/empleados');
  }

  async createEmpleado(empleadoData) {
    return this.post('/empleados', empleadoData);
  }

  async updateEmpleado(id, empleadoData) {
    return this.put(`/empleados/${id}`, empleadoData);
  }

  async deleteEmpleado(id) {
    return this.delete(`/empleados/${id}`);
  }

  // Métodos para nómina
  async getNominas() {
    return this.get('/nomina');
  }

  async procesarNomina(nominaData) {
    return this.post('/nomina', nominaData);
  }

  // Métodos para contratos
  async getContratos() {
    return this.get('/contratos');
  }
  
  // Métodos para oficios
  async getOficios() {
    return this.get('/oficios');
  }

  async createContrato(contratoData) {
    return this.post('/contratos', contratoData);
  }

  // Métodos para auditoría
  async getAuditorias() {
    return this.get('/auditoria');
  }

  // Métodos para oficios
  async getOficios() {
    return this.get('/oficios');
  }

  async createOficio(oficioData) {
    return this.post('/oficios', oficioData);
  }

  // Métodos para usuarios
  async getUsuarios() {
    return this.get('/usuarios');
  }

  async getUsuarioById(id) {
    return this.get(`/usuarios/${id}`);
  }

  async createUsuario(userData) {
    return this.post('/usuarios', userData);
  }

  async updateUsuario(id, userData) {
    return this.put(`/usuarios/${id}`, userData);
  }

  async resetPassword(id, passwordData) {
    return this.post(`/usuarios/${id}/reset-password`, passwordData);
  }

  async deleteUsuario(id) {
    return this.delete(`/usuarios/${id}`);
  }
  
  // Métodos para roles
  async getRoles() {
    return this.get('/roles');
  }
  
  async getRolById(id) {
    return this.get(`/roles/${id}`);
  }
  
  async createRol(rolData) {
    return this.post('/roles', rolData);
  }
  
  async updateRol(id, rolData) {
    return this.put(`/roles/${id}`, rolData);
  }
  
  async deleteRol(id) {
    return this.delete(`/roles/${id}`);
  }
  
  // Métodos para permisos
  async getPermisosRol(idRol) {
    console.log(`[API] Obteniendo permisos para rol ${idRol}`);
    // Añadir un parámetro de tiempo para evitar cacheo
    const timestamp = Date.now();
    const response = await this.get(`/roles/${idRol}/permisos?_t=${timestamp}`);
    console.log(`[API] Permisos obtenidos para rol ${idRol}:`, response);
    return response;
  }
  
  async updatePermisosRol(idRol, permisos) {
    return this.put(`/roles/${idRol}/permisos`, { permisos });
  }
  
  async getAccionesPermiso() {
    return this.get('/roles/acciones-permiso/all');
  }

  // Utilidades
  /**
   * Verifica si el usuario está autenticado y el token es válido
   * @returns {boolean} true si está autenticado y el token es válido
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar también que el token no haya expirado
    return !this.isTokenExpired();
  }

  /**
   * Obtiene el usuario actual desde el almacenamiento local
   * @returns {object|null} El objeto de usuario o null si no está autenticado
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  
  /**
   * Obtiene información de depuración del estado de autenticación
   * @returns {object} Información sobre el estado de autenticación
   */
  getAuthDebugInfo() {
    const token = this.getToken();
    const user = this.getCurrentUser();
    const tokenPayload = token ? this.parseJwt(token) : null;
    const tokenExpiry = this.getTokenExpiry();
    
    return {
      hasToken: !!token,
      isTokenValid: token && !this.isTokenExpired(),
      tokenExpiry: tokenExpiry ? tokenExpiry.toISOString() : null,
      secondsRemaining: tokenExpiry ? Math.floor((tokenExpiry - new Date()) / 1000) : null,
      user: user,
      tokenPayload: tokenPayload
    };
  }
}

// Exportar una instancia singleton
export default new ApiService();
