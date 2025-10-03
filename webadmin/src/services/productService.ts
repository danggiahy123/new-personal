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

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  tags: string[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  formattedPrice?: string;
}

export interface ProductsResponse {
  success: boolean;
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
}

export const productService = {
  // Get all products with filters
  async getProducts(filters: ProductFilters = {}): Promise<ProductsResponse> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Get single product
  async getProduct(id: string): Promise<{ success: boolean; product: Product }> {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Create product
  async createProduct(productData: Partial<Product>): Promise<{ success: boolean; product: Product }> {
    try {
      const response = await api.post('/products', productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // Update product
  async updateProduct(id: string, productData: Partial<Product>): Promise<{ success: boolean; product: Product }> {
    try {
      const response = await api.put(`/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product
  async deleteProduct(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Get categories
  async getCategories(): Promise<{ success: boolean; categories: string[] }> {
    try {
      const response = await api.get('/products/categories/list');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch categories');
    }
  },
};
