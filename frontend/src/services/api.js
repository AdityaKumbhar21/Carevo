import axios from 'axios';


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});



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



API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);



export const authAPI = {
  register: (data) => API.post('/auth/register', data),

  login: (data) => API.post('/auth/login', data),

  // verifyEmail removed — using OTP flow instead

  forgotPassword: (email) =>
    API.post('/auth/forgot-password', { email }),

  resetPassword: (token, password) =>
    API.post(`/auth/reset-password/${encodeURIComponent(token)}`, {
      password,
    }),

  getCurrentUser: () => API.get('/auth/me'),

  debugToken: (email) =>
    API.get(`/auth/debug-token?email=${encodeURIComponent(email)}`),
  sendOtp: (email) => API.post('/auth/send-otp', { email }),
  verifyOtp: (email, otp) => API.post('/auth/verify-otp', { email, otp }),

  proctoringViolation: () => API.post('/auth/proctoring-violation'),
};



export const profileAPI = {
  setupProfile: (data) =>
    API.post('/user/profile/setup', data),

  updateProfile: (data) =>
    API.put('/user/profile/update', data),

  getProfile: () =>
    API.get('/user/profile'),

};



export const careerDnaAPI = {
  getCareerDNA: () => API.get('/career-dna'),
};


export const analyticsAPI = {
  // Fetch analytics overview (backend currently exposes skill progress and probability endpoints).
  // `career` is optional and should be the career name used in Skill entries.
  getAnalytics: (career) => API.get(`/analytics/skills${career ? `?careerId=${encodeURIComponent(career)}` : ''}`),
  // Accept a period string (e.g., '1M') and optional career name to scope analytics
  getAnalyticsByPeriod: (period, career) =>
    API.get(`/analytics/skills?period=${encodeURIComponent(period)}${career ? `&careerId=${encodeURIComponent(career)}` : ''}`),
  // New overview endpoint returns aggregated metrics and heatmap
  getOverview: (career) => API.get(`/analytics/overview${career ? `?careerId=${encodeURIComponent(career)}` : ''}`),
};



export const careerAPI = {
  getCareers: () => API.get('/careers'),
  getCareerById: (id) => API.get(`/careers/${id}`),
  getRecommendations: () => API.get('/careers/recommendations'),
  simulateCareer: (data) => API.post('/careers/simulate', data),
};



export const roadmapAPI = {
  generateRoadmap: (data) =>
    API.post('/roadmap/generate', data),

  getRoadmap: (careerId) =>
    API.get(`/roadmap${careerId ? `?careerId=${careerId}` : ''}`),

  updateRoadmapProgress: (data) =>
    API.put('/roadmap/progress', data),
};


export const taskAPI = {
  getTodayTasks: () => API.get('/tasks/today'),
  completeTask: (taskId) =>
    API.post('/tasks/complete', { taskId }),
  checkDailyCompletion: () =>
    API.get('/tasks/check-completion'),
};


export const gamificationAPI = {
  checkIn: () => API.post('/gamification/check-in'),
  getGamification: () => API.get('/gamification'),
  getStatus: () => API.get('/gamification/status'),
  getBadges: () => API.get('/gamification/badges'),
};



export const badgeAPI = {
  getUserBadges: () => API.get('/badges'),
  getShareableBadge: (token) =>
    API.get(`/badges/share/${encodeURIComponent(token)}`),
};


export const quizAPI = {
  generateQuiz: (data) =>
    API.post('/quiz/generate', data),

  // New validation endpoints (backend updated)
  generateValidation: (data) =>
    API.post('/quiz/validation/generate', data),

  getValidation: (params) =>
    API.get(`/quiz/validation?career=${encodeURIComponent(params.career)}&skill=${encodeURIComponent(params.skill)}&level=${encodeURIComponent(params.level)}`),

  submitQuiz: (data) =>
    API.post('/quiz/submit', data),

  getQuizHistory: () =>
    API.get('/quiz/history'),
};


export const marketAPI = {
  analyzeMarket: () => API.get('/market/analyze'),
};


export default API;