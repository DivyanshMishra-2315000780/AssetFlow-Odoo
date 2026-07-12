import axios from 'axios';

const baseURL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Attach auth token from localStorage on each request if present
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

export default api;

// ── Application API Endpoints ──

export const authService = {
  login: (data: any) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
};

export const assetService = {
  getAssets: () => api.get('/api/assets'),
  getAssetById: (id: string) => api.get(`/api/assets/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/api/dashboard/stats'),
};

export const healthService = {
  ping: () => api.get('/api/health'),
};
