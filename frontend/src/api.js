import axios from 'axios';

// 始终使用相对路径，由Vite代理或生产环境的反向代理处理
const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// 添加请求拦截器，自动添加token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 用户相关API
export const authAPI = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  getProfile: () => api.get('/user/me'),
  updateProfile: (userData) => api.put('/user/me', userData),
};

// 匹配相关API
export const matchAPI = {
  getMatches: () => api.get('/matches'),
};

// 问题相关API
export const problemAPI = {
  getAll: () => api.get('/problems'),
  getMy: () => api.get('/problems/my'),
  create: (problemData) => api.post('/problems', problemData),
  accept: (problemId) => api.post(`/problems/${problemId}/accept`),
  complete: (problemId) => api.post(`/problems/${problemId}/complete`),
  getRecommendedSolvers: (problemId) => api.get(`/problems/${problemId}/recommended-solvers`),
};

// 排行榜API
export const leaderboardAPI = {
  get: () => api.get('/leaderboard'),
};

export default api;
