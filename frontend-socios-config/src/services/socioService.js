import axios from 'axios';

const API_URL = 'http://localhost:8080/api/socios';

// Configurar interceptor para autenticación básica de Spring Security
axios.interceptors.request.use(
  config => {
    // Spring Security genera un password en consola, usar: user / password-generado
    // Para desarrollo, deshabilitamos la autenticación en SecurityConfig
    return config;
  },
  error => Promise.reject(error)
);

const socioService = {
  // Obtener todos los socios con paginación y búsqueda
  getAll: async (page = 0, size = 10, search = '') => {
    const response = await axios.get(API_URL, {
      params: { page, size, search }
    });
    return response.data;
  },

  // Obtener socio por ID
  getById: async (id) => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Buscar socio por identificación
  getByIdentificacion: async (identificacion) => {
    const response = await axios.get(`${API_URL}/identificacion/${identificacion}`);
    return response.data;
  },

  // Crear nuevo socio
  create: async (socio) => {
    const response = await axios.post(API_URL, socio);
    return response.data;
  },

  // Actualizar socio
  update: async (id, socio) => {
    const response = await axios.put(`${API_URL}/${id}`, socio);
    return response.data;
  },

  // Eliminar socio
  delete: async (id) => {
    await axios.delete(`${API_URL}/${id}`);
  }
};

export default socioService;
