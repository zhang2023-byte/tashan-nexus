import axios from 'axios';

// 自动检测API地址：开发环境使用localhost，局域网访问使用当前host
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3001/api'
  : `http://${window.location.hostname}:3001/api`;

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
