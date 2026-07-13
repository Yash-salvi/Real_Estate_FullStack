import API from './api';

export const authService = {
  login: async (email, password) => {
    const response = await API.post('/api/auth/login', { email, password });
    return response.data;
  },

  register: async (name, email, password, role, phone) => {
    const response = await API.post('/api/auth/register', { name, email, password, role, phone });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await API.get('/api/auth/me');
    return response.data;
  }
};

export default authService;
