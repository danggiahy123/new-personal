import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const hostService = {
  // Get ESXi host services
  async getServices() {
    try {
      const response = await api.get('/api/host/services');
      return response.data;
    } catch (error) {
      console.error('Failed to get services:', error);
      throw error;
    }
  },

  // Get ESXi host information
  async getHostInfo() {
    try {
      const response = await api.get('/api/host/info');
      return response.data;
    } catch (error) {
      console.error('Failed to get host info:', error);
      throw error;
    }
  },

  // Get ESXi host storage information
  async getStorageInfo() {
    try {
      const response = await api.get('/api/host/storage');
      return response.data;
    } catch (error) {
      console.error('Failed to get storage info:', error);
      throw error;
    }
  },

  // Get ESXi host networking information
  async getNetworkingInfo() {
    try {
      const response = await api.get('/api/host/networking');
      return response.data;
    } catch (error) {
      console.error('Failed to get networking info:', error);
      throw error;
    }
  },

  // Get ESXi host status
  async getHostStatus() {
    try {
      const response = await api.get('/api/host/status');
      return response.data;
    } catch (error) {
      console.error('Failed to get host status:', error);
      throw error;
    }
  },
};

export default hostService;
