import axios from 'axios';

// Base API Configuration
const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for handling global errors (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password, isAdmin = false) => api.post('/auth/login', { email, password, isAdmin }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/verify'),
};

export const studentAPI = {
  getAll: (page = 1, search = '') => api.get(`/students?page=${page}&search=${search}`),
  add: (data) => api.post('/students', data),
};

export const feedbackAPI = {
  submit: (data) => api.post('/feedback', data),
  getRecent: () => api.get('/feedback'),
};

export const leaveAPI = {
  apply: (data) => api.post('/leaves', data),
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getAll: () => api.get('/leaves'),
  update: (id, data) => api.put(`/leaves/${id}`, data),
};

export const reportsAPI = {
  submit: (data) => api.post('/reports', data),
  getMyReports: () => api.get('/reports/my-reports'),
  getAll: () => api.get('/reports'),
  update: (id, data) => api.put(`/reports/${id}`, data),
};

export const roomAllocationAPI = {
  getAll: () => api.get('/room-allocations'),
  allocate: (data) => api.post('/room-allocations', data),
  getAvailability: () => api.get('/room-allocations/availability'),
};

export const attendanceAPI = {
  getAll: () => api.get('/attendance'),
  mark: (data) => api.post('/attendance', data),
};

export const visitorsAPI = {
  getAll: () => api.get('/visitors'),
  register: (data) => api.post('/visitors', data),
};

export const paymentsAPI = {
  getAll: () => api.get('/payments'),
  record: (data) => api.post('/payments', data),
};

export default api;
