import { apiClient as api } from './api';

export interface ProductionSection {
  id: string;
  code: string;
  name: string;
  description: string | null;
  sequence: number;
  isActive: boolean;
}

export interface ScanLog {
  id: string;
  productId: string;
  actionType: 'RECEIVE' | 'ISSUE' | 'RETURN' | 'MOVE' | 'INSPECT' | 'COMPLETE';
  quantity: number;
  locationCode: string | null;
  locationName: string | null;
  sectionId: string | null;
  orderId: string | null;
  processId: string | null;
  warehouseId: string | null;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  scannedById: string;
  scannedAt: string;
  product?: any;
  section?: ProductionSection;
  warehouse?: any;
  scannedBy?: any;
}

export interface ProductionOrder {
  id: string;
  orderNo: string;
  productId: string;
  targetQuantity: number;
  completedQuantity: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  startDate: string | null;
  dueDate: string | null;
  completedDate: string | null;
  notes: string | null;
  createdById: string;
  createdAt: string;
  product?: any;
  createdBy?: any;
  processes?: any[];
}

export interface CreateScanLogDto {
  productId: string;
  actionType: 'RECEIVE' | 'ISSUE' | 'RETURN' | 'MOVE' | 'INSPECT' | 'COMPLETE';
  quantity: number;
  locationCode?: string;
  locationName?: string;
  sectionId?: string;
  orderId?: string;
  processId?: string;
  warehouseId?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export interface CreateProductionOrderDto {
  orderNo: string;
  productId: string;
  targetQuantity: number;
  dueDate?: string;
  notes?: string;
}

const productionService = {
  // Get production sections
  async getSections(): Promise<ProductionSection[]> {
    const response = await api.get('/production/sections');
    return response.data.data;
  },

  // Get warehouses
  async getWarehouses(): Promise<any[]> {
    const response = await api.get('/production/warehouses');
    return response.data.data;
  },

  // Create scan log
  async createScanLog(data: CreateScanLogDto): Promise<ScanLog> {
    const response = await api.post('/production/scan-logs', data);
    return response.data.data;
  },

  // Get scan logs
  async getScanLogs(params?: {
    productId?: string;
    actionType?: string;
    sectionId?: string;
    limit?: number;
  }): Promise<ScanLog[]> {
    const response = await api.get('/production/scan-logs', { params });
    return response.data.data;
  },

  // Get production orders
  async getProductionOrders(status?: string): Promise<ProductionOrder[]> {
    const response = await api.get('/production/orders', {
      params: status ? { status } : undefined,
    });
    return response.data.data;
  },

  // Create production order
  async createProductionOrder(data: CreateProductionOrderDto): Promise<ProductionOrder> {
    const response = await api.post('/production/orders', data);
    return response.data.data;
  },

  // Update production process
  async updateProductionProcess(
    processId: string,
    data: {
      status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
      quantity?: number;
      notes?: string;
    }
  ): Promise<any> {
    const response = await api.patch(`/production/processes/${processId}`, data);
    return response.data.data;
  },
};

export default productionService;
