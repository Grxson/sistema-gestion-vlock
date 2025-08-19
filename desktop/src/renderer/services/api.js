const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

class ApiService {
  constructor() {
    this.baseURL = API_URL;
  }

  // Obtener token del localStorage
  getToken() {
    return localStorage.getItem('token');
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

  // Método genérico para hacer requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: this.getHeaders(options.auth !== false),
    };

    try {
      const response = await fetch(url, config);
      
      // Si la respuesta es 401, el token ha expirado
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        throw new Error('Token expirado');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la solicitud');
      }

      return await response.json();
    } catch (error) {
      console.error(`Error en ${endpoint}:`, error);
      throw error;
    }
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
    return this.get(`/roles/${idRol}/permisos`);
  }
  
  async updatePermisosRol(idRol, permisos) {
    return this.put(`/roles/${idRol}/permisos`, { permisos });
  }
  
  async getAccionesPermiso() {
    return this.get('/roles/acciones-permiso/all');
  }

  // Utilidades
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

// Exportar una instancia singleton
export default new ApiService();
