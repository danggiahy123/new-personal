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

export const vmService = {
  // Get all VMs
  async getVMs() {
    try {
      const response = await api.get('/vms');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch VMs');
    }
  },

  // Get VM details
  async getVMDetails(vmId) {
    try {
      const response = await api.get(`/vms/${vmId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch VM details');
    }
  },

  // Start VM
  async startVM(vmId) {
    try {
      const response = await api.post(`/vms/${vmId}/start`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to start VM');
    }
  },

  // Stop VM
  async stopVM(vmId) {
    try {
      const response = await api.post(`/vms/${vmId}/stop`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to stop VM');
    }
  },

  // Restart VM
  async restartVM(vmId) {
    try {
      const response = await api.post(`/vms/${vmId}/restart`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to restart VM');
    }
  },
};
