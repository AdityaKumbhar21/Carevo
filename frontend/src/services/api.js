import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for error handling
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth token and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// AUTH API CALLS
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  verifyEmail: (token) => API.get(`/auth/verify-email/${token}`),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  getCurrentUser: () => API.get('/auth/me')
};

// PROFILE API CALLS
export const profileAPI = {
  setupProfile: (data) => API.post('/user/profile/setup', data),
  updateProfile: (data) => API.put('/user/profile/update', data),
  getProfile: () => API.get('/user/profile')
};

// CAREER DNA API CALLS
export const careerDnaAPI = {
  getCareerDNA: () => API.get('/career-dna')
};

// CAREER API CALLS
export const careerAPI = {
  getCareers: () => API.get('/careers'),
  getCareerById: (id) => API.get(`/careers/${id}`)
};

// ROADMAP API CALLS
export const roadmapAPI = {
  generateRoadmap: (data) => API.post('/roadmap/generate', data),
  getRoadmap: () => API.get('/roadmap'),
  updateRoadmapProgress: (data) => API.put('/roadmap/progress', data)
};

// GAMIFICATION API CALLS
export const gamificationAPI = {
  getGamification: () => API.get('/gamification'),
  addXP: (data) => API.post('/gamification/xp', data),
  getBadges: () => API.get('/gamification/badges'),
  claimBadge: (badgeId) => API.post(`/gamification/badges/${badgeId}/claim`, {})
};

// ANALYTICS API CALLS
export const analyticsAPI = {
  getAnalytics: () => API.get('/analytics'),
  getAnalyticsByPeriod: (period) => API.get(`/analytics?period=${period}`)
};

// QUIZ API CALLS
export const quizAPI = {
  getQuiz: () => API.get('/quiz'),
  submitQuiz: (data) => API.post('/quiz/submit', data)
};

// BADGE API CALLS
export const badgeAPI = {
  getBadges: () => API.get('/badge'),
  getUserBadges: () => API.get('/badge/user')
};

export default API;
