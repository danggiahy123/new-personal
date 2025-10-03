import axios from 'axios';

const API_BASE_URL = 'http://localhost:5002/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const hostService = {
  // Get host information
  async getHostInfo() {
    try {
      const response = await api.get('/host/info');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch host information');
    }
  },

  // Get host services
  async getServices() {
    try {
      const response = await api.get('/host/services');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  },

  // Get storage information
  async getStorageInfo() {
    try {
      const response = await api.get('/host/storage');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch storage information');
    }
  },

  // Get networking information
  async getNetworkingInfo() {
    try {
      const response = await api.get('/host/networking');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch networking information');
    }
  },

  // Get host status
  async getHostStatus() {
    try {
      const response = await api.get('/host/status');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch host status');
    }
  }
};
