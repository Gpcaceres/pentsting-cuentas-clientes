import axios from 'axios';

const API_URL = 'http://localhost:3000/cuentas';

const cuentaService = {
  // Obtener todas las cuentas con paginación y búsqueda
  getAll: async (page = 0, size = 10, search = '') => {
    const response = await axios.get(API_URL, {
      params: { page, size, search }
    });
    return response.data;
  },

  // Obtener cuenta por ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Obtener cuentas por socio
  getBySocio: async (socioId) => {
    const response = await axios.get(`${API_URL}/socio/${socioId}`);
    return response.data;
  },

  // Crear nueva cuenta
  create: async (cuenta) => {
    const response = await axios.post(API_URL, cuenta);
    return response.data;
  },

  // Actualizar cuenta
  update: async (id, cuenta) => {
    const response = await axios.put(`${API_URL}/${id}`, cuenta);
    return response.data;
  },

  // Eliminar cuenta
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  },

  // Realizar depósito
  deposito: async (id, monto) => {
    const response = await axios.post(`${API_URL}/${id}/deposito`, { monto });
    return response.data;
  },

  // Realizar retiro
  retiro: async (id, monto) => {
    const response = await axios.post(`${API_URL}/${id}/retiro`, { monto });
    return response.data;
  }
};

export default cuentaService;
