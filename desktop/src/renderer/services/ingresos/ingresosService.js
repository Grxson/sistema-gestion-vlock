import api from '../api';

const ingresosService = {
  async list(params = {}) {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qp.append(k, v);
    });
    const query = qp.toString();
    return api.get(`/ingresos${query ? `?${query}` : ''}`);
  },
  async stats(params = {}) {
    const qp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') qp.append(k, v);
    });
    const query = qp.toString();
    return api.get(`/ingresos/estadisticas${query ? `?${query}` : ''}`);
  },
  async getById(id) {
    return api.get(`/ingresos/${id}`);
  },
  async create(data) {
    return api.post('/ingresos', data);
  },
  async update(id, data) {
    return api.put(`/ingresos/${id}`, data);
  },
  async remove(id) {
    return api.delete(`/ingresos/${id}`);
  }
};

export default ingresosService;
