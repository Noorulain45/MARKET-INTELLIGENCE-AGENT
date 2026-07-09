import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor: handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(
          `${API_BASE}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.put(`/auth/reset-password/${token}`, { password }),
  verifyEmail: (token: string) => api.get(`/auth/verify-email/${token}`),
};

// ─── Dashboard / Analytics ───────────────────────────────────────────────────
export const analyticsApi = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getActivityTimeline: (days = 30) => api.get(`/analytics/timeline?days=${days}`),
  getMarketOverview: () => api.get('/analytics/market-overview'),
};

// ─── News ─────────────────────────────────────────────────────────────────────
export const newsApi = {
  getNews: (params?: Record<string, unknown>) => api.get('/news', { params }),
  getNewsById: (id: string) => api.get(`/news/${id}`),
  getNewsSummary: () => api.get('/news/summary'),
  getCategories: () => api.get('/news/categories'),
  triggerCollection: () => api.post('/news/collect'),
};

// ─── Competitors ─────────────────────────────────────────────────────────────
export const competitorApi = {
  getCompetitors: (params?: Record<string, unknown>) => api.get('/competitors', { params }),
  getCompetitorById: (id: string) => api.get(`/competitors/${id}`),
  createCompetitor: (data: Record<string, unknown>) => api.post('/competitors', data),
  updateCompetitor: (id: string, data: Record<string, unknown>) => api.put(`/competitors/${id}`, data),
  deleteCompetitor: (id: string) => api.delete(`/competitors/${id}`),
  getActivity: (id: string) => api.get(`/competitors/${id}/activity`),
  getSWOT: (id: string) => api.get(`/competitors/${id}/swot`),
  compare: (ids: string[]) => api.get('/competitors/compare', { params: { ids: ids.join(',') } }),
};

// ─── Trends ───────────────────────────────────────────────────────────────────
export const trendsApi = {
  getTrends: (params?: Record<string, unknown>) => api.get('/trends', { params }),
  getEmergingTech: () => api.get('/trends/emerging'),
  getTrendById: (id: string) => api.get(`/trends/${id}`),
};

// ─── Sentiment ────────────────────────────────────────────────────────────────
export const sentimentApi = {
  getSentiments: (params?: Record<string, unknown>) => api.get('/sentiment', { params }),
  getSentimentById: (id: string) => api.get(`/sentiment/${id}`),
  analyze: (text: string) => api.post('/sentiment/analyze', { text }),
};

// ─── Chat ─────────────────────────────────────────────────────────────────────
export const chatApi = {
  getChats: () => api.get('/chat'),
  getChatById: (id: string) => api.get(`/chat/${id}`),
  createChat: (title?: string) => api.post('/chat', { title }),
  sendMessage: (message: string, chatId?: string) =>
    api.post('/chat/message', { message, chatId }),
  deleteChat: (id: string) => api.delete(`/chat/${id}`),
};

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agentsApi = {
  runAgent: (type: string, query?: string) =>
    api.post(`/agents/run/${type}`, { query }),
  getDailySummary: () => api.get('/agents/summary'),
  runFull: (query?: string) => api.post('/agents/run', { type: 'full', query }),
};

// ─── Reports ──────────────────────────────────────────────────────────────────
export const reportsApi = {
  getReports: (params?: Record<string, unknown>) => api.get('/reports', { params }),
  getReportById: (id: string) => api.get(`/reports/${id}`),
  generateReport: (data: Record<string, unknown>) => api.post('/reports/generate', data),
  deleteReport: (id: string) => api.delete(`/reports/${id}`),
};

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const alertsApi = {
  getAlerts: () => api.get('/alerts'),
  createAlert: (data: Record<string, unknown>) => api.post('/alerts', data),
  updateAlert: (id: string, data: Record<string, unknown>) => api.put(`/alerts/${id}`, data),
  deleteAlert: (id: string) => api.delete(`/alerts/${id}`),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (query: string, filters?: Record<string, unknown>) =>
    api.get('/search', { params: { q: query, ...filters } }),
};

// ─── Watchlist ────────────────────────────────────────────────────────────────
export const watchlistApi = {
  getWatchlists: () => api.get('/watchlists'),
  createWatchlist: (data: Record<string, unknown>) => api.post('/watchlists', data),
  updateWatchlist: (id: string, data: Record<string, unknown>) => api.put(`/watchlists/${id}`, data),
  deleteWatchlist: (id: string) => api.delete(`/watchlists/${id}`),
};

// ─── User ─────────────────────────────────────────────────────────────────────
export const userApi = {
  updateProfile: (data: Record<string, unknown>) => api.put('/users/profile', data),
  updatePreferences: (data: Record<string, unknown>) => api.put('/users/preferences', data),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.put('/users/password', { oldPassword, newPassword }),
};
