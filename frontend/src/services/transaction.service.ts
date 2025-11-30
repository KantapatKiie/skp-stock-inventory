import { apiClient } from './api';

export interface Transaction {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'TRANSFER';
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  productId: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  quantity: number;
  notes?: string;
  referenceNo?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  products?: {
    id: string;
    sku: string;
    name: string;
  };
  warehouses_transactions_fromWarehouseIdTowarehouses?: {
    id: string;
    code: string;
    name: string;
  };
  warehouses_transactions_toWarehouseIdTowarehouses?: {
    id: string;
    code: string;
    name: string;
  };
  users?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface InventoryLog {
  id: string;
  inventoryId: string;
  userId: string;
  action: string;
  quantityBefore: number;
  quantityAfter: number;
  difference: number;
  notes?: string;
  createdAt: string;
  inventory?: {
    id: string;
    products?: {
      id: string;
      sku: string;
      name: string;
    };
    warehouses?: {
      id: string;
      code: string;
      name: string;
    };
  };
  users?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export const transactionService = {
  getAll: async (params?: {
    type?: string;
    status?: string;
    productId?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/transactions', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data.data;
  },

  getInventoryLogs: async (params?: {
    inventoryId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) => {
    const response = await apiClient.get('/transactions/logs', { params });
    return response.data.data;
  },
};
