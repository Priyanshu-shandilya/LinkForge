import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// ── URLs ──────────────────────────────────────────────────────────────────────
export const createUrl = (data) => API.post('/urls', data);
export const getMyUrls = (params) => API.get('/urls', { params });
export const getUrl = (code) => API.get(`/urls/${code}`);
export const updateUrl = (code, data) => API.put(`/urls/${code}`, data);
export const deleteUrl = (code) => API.delete(`/urls/${code}`);
export const generateQR = (code) => API.get(`/urls/${code}/qr`);
export const getUrlAnalytics = (code, days = 30) => API.get(`/urls/${code}/analytics`, { params: { days } });

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getOverview = () => API.get('/analytics/overview');

export default API;
