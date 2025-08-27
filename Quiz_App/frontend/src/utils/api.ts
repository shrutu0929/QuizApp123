import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add JWT token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration and refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          if (response.data.success) {
            const { accessToken } = response.data.data;
            localStorage.setItem('accessToken', accessToken);
            
            // Retry the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }

      // No refresh token or refresh failed, redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  refreshToken: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  getCurrentUser: () => api.get('/auth/me'),
};

// Quiz API
export const quizAPI = {
  getAllQuizzes: (params?: { category?: string; difficulty?: string; search?: string; page?: number; limit?: number }) =>
    api.get('/quiz', { params }),
  
  getQuizById: (id: string) => api.get(`/quiz/${id}`),
  
  createQuiz: (data: any) => api.post('/quiz', data),
  
  updateQuiz: (id: string, data: any) => api.put(`/quiz/${id}`, data),
  
  deleteQuiz: (id: string) => api.delete(`/quiz/${id}`),
  
  publishQuiz: (id: string, isPublished: boolean) => 
    api.post(`/quiz/${id}/publish`, { isPublished }),
  
  getMyQuizzes: () => api.get('/quiz/my-quizzes'),
};

// Attempt API
export const attemptAPI = {
  startAttempt: (quizId: string) => api.post('/attempt/start', { quizId }),
  
  submitAnswer: (attemptId: string, data: { questionIndex: number; selectedOption: number; timeSpent: number }) =>
    api.post(`/attempt/${attemptId}/answer`, data),
  
  completeAttempt: (attemptId: string) => api.post(`/attempt/${attemptId}/complete`),
  
  getMyAttempts: () => api.get('/attempt/my-attempts'),
  
  getAttemptById: (id: string) => api.get(`/attempt/${id}`),
};

// User Profile API (placeholder for future)
export const userAPI = {
  updateProfile: (data: any) => api.put('/user/profile', data),
  getStats: () => api.get('/user/stats'),
  addBadge: (data: { id: string; name: string; description?: string; icon?: string }) => api.post('/user/badges', data),
};

// Leaderboard API (placeholder for future)
export const leaderboardAPI = {
  getGlobalLeaderboard: () => api.get('/leaderboard/global'),
  getQuizLeaderboard: (quizId: string) => api.get(`/leaderboard/quiz/${quizId}`),
};

export default api;
