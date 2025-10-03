import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UsersResponse {
  success: boolean;
  users: User[];
  total: number;
  page: number;
  pages: number;
}

export const userService = {
  // Get all users
  async getUsers(page = 1, limit = 10): Promise<UsersResponse> {
    try {
      const response = await api.get(`/users?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  async getUser(id: string): Promise<{ success: boolean; user: User }> {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Update user
  async updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; user: User }> {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  },

  // Update user role
  async updateUserRole(id: string, role: string): Promise<{ success: boolean; user: User }> {
    try {
      const response = await api.put(`/users/${id}/role`, { role });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update user role');
    }
  },
};
