import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor để thêm session ID vào header
api.interceptors.request.use(
  (config) => {
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      config.headers['vmware-api-session-id'] = sessionId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi authentication
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Session expired, clear local storage
      localStorage.removeItem('sessionId');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async login(username, password) {
    try {
      const response = await api.post('/api/login', {
        username,
        password,
      });

      if (response.data.success) {
        return {
          success: true,
          sessionId: response.data.sessionId,
          user: response.data.user,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error',
      };
    }
  },

  async logout() {
    try {
      await api.post('/api/logout');
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false };
    }
  },

  async validateSession() {
    try {
      const response = await api.get('/api/validate');
      return response.data.success;
    } catch (error) {
      return false;
    }
  },
};

export default api;
