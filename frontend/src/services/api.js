import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds — allows for MongoDB Atlas cold start
});

// Response interceptor to extract data or propagate error message cleanly
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return Promise.reject(
        new Error('Request timed out. The server may be starting up — please try again in a moment.')
      );
    }
    if (!error.response) {
      return Promise.reject(
        new Error('Cannot connect to server. Please make sure the backend is running on port 5000.')
      );
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

export const donationService = {
  getAll: (params) => api.get('/donations', { params }),
  getById: (id) => api.get(`/donations/${id}`),
  create: (data) => api.post('/donations', data),
  update: (id, data) => api.put(`/donations/${id}`, data),
  delete: (id) => api.delete(`/donations/${id}`),
};

export const recipientService = {
  getAll: (params) => api.get('/recipients', { params }),
  getById: (id) => api.get(`/recipients/${id}`),
  create: (data) => api.post('/recipients', data),
  update: (id, data) => api.put(`/recipients/${id}`, data),
  delete: (id) => api.delete(`/recipients/${id}`),
};

export const distributionService = {
  getAll: (params) => api.get('/distributions', { params }),
  create: (data) => api.post('/distributions', data),
  update: (id, data) => api.put(`/distributions/${id}`, data),
  delete: (id) => api.delete(`/distributions/${id}`),
};

export const inventoryService = {
  getAll: (params) => api.get('/inventory', { params }),
  getSummary: () => api.get('/inventory/summary'),
  checkStock: (itemName) => api.get(`/inventory/check/${encodeURIComponent(itemName)}`),
};

export const reportService = {
  getDashboard: () => api.get('/reports/dashboard'),
  getCategoryStats: () => api.get('/reports/category-stats'),
};

export const systemService = {
  getHealth: () => api.get('/health'),
};

export default api;
