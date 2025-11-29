import { apiClient } from './api';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'MANAGER' | 'STAFF';
  isActive?: boolean;
}

export const userService = {
  getAll: async (params?: { role?: string; isActive?: boolean; page?: number; limit?: number }) => {
    const response = await apiClient.get('/users', { params });
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  create: async (data: CreateUserDto) => {
    const response = await apiClient.post('/users', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateUserDto) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data.data;
  },

  toggleActive: async (id: string, isActive: boolean) => {
    const response = await apiClient.patch(`/users/${id}/toggle-active`, { isActive });
    return response.data.data;
  },
};
