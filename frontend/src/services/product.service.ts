import { apiClient } from './api';
import { Product, ApiResponse } from '@/types';

export const productService = {
  async getAll(params?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        products: Product[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>
    >('/products', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data.data;
  },

  async getByBarcode(barcode: string): Promise<Product> {
    const response = await apiClient.get<ApiResponse<Product>>(
      `/products/barcode/${barcode}`
    );
    return response.data.data;
  },

  async create(data: Partial<Product>): Promise<Product> {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data);
    return response.data.data;
  },

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const response = await apiClient.put<ApiResponse<Product>>(
      `/products/${id}`,
      data
    );
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/products/${id}`);
  },

  async getLowStock(): Promise<Product[]> {
    const response = await apiClient.get<ApiResponse<Product[]>>(
      '/products/low-stock'
    );
    return response.data.data;
  },
};
