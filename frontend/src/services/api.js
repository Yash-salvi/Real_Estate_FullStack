import axios from 'axios';

const API = axios.create({
  baseURL: 'https://realestate-backend-x1cl.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically inject the JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;
