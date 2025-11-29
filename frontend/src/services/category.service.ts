import { apiClient } from './api';

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export const categoryService = {
  getAll: async (): Promise<{ data: Category[] }> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },
};
