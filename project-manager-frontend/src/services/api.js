import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) return process.env.REACT_APP_API_URL;
  if (process.env.NODE_ENV === 'production') return '/index.php/api';
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
});

const savedToken = localStorage.getItem('auth_token');
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

const publicPaths = ['/login', '/project-created', '/pricing', '/portfolio-showcase'];

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401 && !error.config.url?.includes('/login')) {
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      const isPublicPage = publicPaths.some(p => window.location.pathname.startsWith(p));
      if (!isPublicPage) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user'),
  getUsers: () => api.get('/users'),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Clients
export const clientApi = {
  getAll: (params) => api.get('/clients', { params }),
  getAllList: () => api.get('/clients/all'),
  getById: (id) => api.get(`/clients/${id}`),
  getByCode: (code) => api.get(`/public/client/${code}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Projects
export const projectApi = {
  getAll: (params) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  getStatistics: (params) => api.get('/projects/statistics', { params }),
  getAllFeatures: () => api.get('/projects/features'),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images' && data[key]) {
        data[key].forEach(file => formData.append('images[]', file));
      } else if (key === 'features' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post('/projects', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'images' && data[key]) {
        data[key].forEach(file => formData.append('images[]', file));
      } else if (key === 'features' && Array.isArray(data[key])) {
        formData.append(key, JSON.stringify(data[key]));
      } else if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
        formData.append(key, data[key]);
      }
    });
    return api.post(`/projects/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/projects/${id}`),
  deleteImage: (imageId) => api.delete(`/projects/images/${imageId}`),
};

// Hosting
export const hostingApi = {
  getHistory: (projectId) => api.get(`/hosting/${projectId}/history`),
  renew: (projectId, data) => api.post(`/hosting/${projectId}/renew`, data),
  upgrade: (projectId, data) => api.post(`/hosting/${projectId}/upgrade`, data),
  getExpiring: (days = 30) => api.get('/hosting/expiring', { params: { days } }),
};

// Settings
export const settingApi = {
  getAll: () => api.get('/settings'),
  update: (settings) => api.post('/settings', { settings }),
  uploadLogo: (file) => {
    const formData = new FormData();
    formData.append('logo', file);
    return api.post('/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Service Packages
export const servicePackageApi = {
  getAll: (params) => api.get('/service-packages', { params }),
  getById: (id) => api.get(`/service-packages/${id}`),
  create: (data) => api.post('/service-packages', data),
  update: (id, data) => api.put(`/service-packages/${id}`, data),
  delete: (id) => api.delete(`/service-packages/${id}`),
};

// Notifications
export const notificationApi = {
  send: (data) => api.post('/notifications/send', data),
  getProjectLogs: (projectId) => api.get(`/notifications/project/${projectId}`),
  getAllLogs: (params) => api.get('/notifications/logs', { params }),
};

// Portfolio
export const portfolioApi = {
  getCategories: () => api.get('/portfolio/categories'),
  createCategory: (data) => api.post('/portfolio/categories', data),
  updateCategory: (id, data) => api.put(`/portfolio/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/portfolio/categories/${id}`),
  getAll: (params) => api.get('/portfolio', { params }),
  create: (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'thumbnail' && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    return api.post('/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id, data) => api.put(`/portfolio/${id}`, data),
  delete: (id) => api.delete(`/portfolio/${id}`),
  batchAdd: (data) => api.post('/portfolio/batch-add', data),
  batchRemove: (data) => api.post('/portfolio/batch-remove', data),
  getPublic: () => api.get('/public/portfolio'),
};

const getStorageUrl = () => {
  if (process.env.REACT_APP_STORAGE_URL) return process.env.REACT_APP_STORAGE_URL;
  if (process.env.NODE_ENV === 'production') return '/storage';
  return 'http://localhost:8000/storage';
};

export const STORAGE_URL = getStorageUrl();

export default api;
