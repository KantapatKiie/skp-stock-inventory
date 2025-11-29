import { apiClient } from './api';
import { Inventory, ApiResponse } from '@/types';

export const inventoryService = {
  async getAll(params?: {
    productId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    inventory: Inventory[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        inventory: Inventory[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>
    >('/inventory', { params });
    return response.data.data;
  },

  async getById(id: string): Promise<Inventory> {
    const response = await apiClient.get<ApiResponse<Inventory>>(
      `/inventory/${id}`
    );
    return response.data.data;
  },

  async adjustStock(data: {
    type: 'IN' | 'OUT' | 'ADJUSTMENT';
    productId: string;
    warehouseId: string;
    quantity: number;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/inventory/adjust',
      data
    );
    return response.data.data;
  },

  async transferStock(data: {
    productId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post<ApiResponse<any>>(
      '/inventory/transfer',
      data
    );
    return response.data.data;
  },

  async getLowStock(): Promise<Inventory[]> {
    const response = await apiClient.get<ApiResponse<Inventory[]>>(
      '/inventory/low-stock'
    );
    return response.data.data;
  },
};
