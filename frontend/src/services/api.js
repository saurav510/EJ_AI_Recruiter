import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

// Request interceptor — attach auth token
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

// Response interceptor — normalise errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const analyzeJD = (jobDescription) =>
  api.post('/jd/analyze', { jobDescription });

export const getHistory = (page = 1, limit = 10) =>
  api.get(`/jd/history?page=${page}&limit=${limit}`);

export const getAnalysisById = (id) => api.get(`/jd/${id}`);

export const deleteAnalysis = (id) => api.delete(`/jd/${id}`);

export const runJDPipeline = (id, files, calendarLink) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append('resumes', file);
  });
  if (calendarLink) {
    formData.append('calendarLink', calendarLink);
  }
  return api.post(`/jd/${id}/pipeline`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    timeout: 180000, // 3 minutes timeout for up to 5 Gemini calls
  });
};

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });

export const getMe = () => api.get('/auth/me');

export const getStats = () => api.get('/auth/stats');

export default api;
