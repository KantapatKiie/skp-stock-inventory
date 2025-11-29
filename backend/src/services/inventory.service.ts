import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Helper function to generate unique IDs
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

interface AdjustStockData {
  productId: string;
  warehouseId: string;
  quantity: number;
  notes?: string;
  userId: string;
}

interface TransferStockData {
  productId: string;
  fromWarehouseId: string;
  toWarehouseId: string;
  quantity: number;
  notes?: string;
  userId: string;
}

export const inventoryService = {
  async getAll(filters?: {
    productId?: string;
    warehouseId?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.warehouseId) {
      where.warehouseId = filters.warehouseId;
    }

    const [inventory, total] = await Promise.all([
      prisma.inventory.findMany({
        where,
        include: {
          products: {
            include: {
              categories: true,
            },
          },
          warehouses: true,
        },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.inventory.count({ where }),
    ]);

    return {
      inventory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const inventory = await prisma.inventory.findUnique({
      where: { id },
      include: {
        products: {
          include: {
            categories: true,
          },
        },
        warehouses: true,
        logs: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!inventory) {
      throw new AppError('Inventory not found', 404);
    }

    return inventory;
  },

  async adjustStock(data: AdjustStockData, type: 'IN' | 'OUT' | 'ADJUSTMENT') {
    const { productId, warehouseId, quantity, notes, userId } = data;

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if warehouse exists
    const warehouse = await prisma.warehouses.findUnique({
      where: { id: warehouseId },
    });

    if (!warehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    // Get or create inventory
    let inventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId,
        },
      },
    });

    const oldQuantity = inventory?.quantity || 0;
    let newQuantity = oldQuantity;

    if (type === 'IN') {
      newQuantity = oldQuantity + quantity;
    } else if (type === 'OUT') {
      if (oldQuantity < quantity) {
        throw new AppError('Insufficient stock', 400);
      }
      newQuantity = oldQuantity - quantity;
    } else if (type === 'ADJUSTMENT') {
      newQuantity = quantity;
    }

    // Update or create inventory
    if (inventory) {
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: {
          quantity: newQuantity,
          availableQty: newQuantity,
          lastStockIn: type === 'IN' ? new Date() : inventory.lastStockIn,
          lastStockOut: type === 'OUT' ? new Date() : inventory.lastStockOut,
        },
      });
    } else {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          warehouseId,
          quantity: newQuantity,
          availableQty: newQuantity,
          lastStockIn: type === 'IN' ? new Date() : undefined,
          lastStockOut: type === 'OUT' ? new Date() : undefined,
        },
      });
    }

    // Create inventory log
    await prisma.inventory_logs.create({
      data: {
        id: generateId(),
        inventoryId: inventory.id,
        userId,
        action: type,
        quantityBefore: oldQuantity,
        quantityAfter: newQuantity,
        difference: newQuantity - oldQuantity,
        notes,
        createdAt: new Date(),
      },
    });

    // Create transaction
    const transaction = await prisma.transactions.create({
      data: {
        id: generateId(),
        type: type === 'IN' ? 'IN' : type === 'OUT' ? 'OUT' : 'ADJUSTMENT',
        status: 'COMPLETED',
        productId,
        toWarehouseId: type === 'IN' ? warehouseId : undefined,
        fromWarehouseId: type === 'OUT' ? warehouseId : undefined,
        quantity: Math.abs(newQuantity - oldQuantity),
        notes,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        products: true,
        warehouses_transactions_fromWarehouseIdTowarehouses: true,
        warehouses_transactions_toWarehouseIdTowarehouses: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return { inventory, transaction };
  },

  async transferStock(data: TransferStockData) {
    const { productId, fromWarehouseId, toWarehouseId, quantity, notes, userId } = data;

    if (fromWarehouseId === toWarehouseId) {
      throw new AppError('Cannot transfer to the same warehouse', 400);
    }

    // Check if product exists
    const product = await prisma.products.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check if warehouses exist
    const [fromWarehouse, toWarehouse] = await Promise.all([
      prisma.warehouses.findUnique({ where: { id: fromWarehouseId } }),
      prisma.warehouses.findUnique({ where: { id: toWarehouseId } }),
    ]);

    if (!fromWarehouse || !toWarehouse) {
      throw new AppError('Warehouse not found', 404);
    }

    // Check source inventory
    const fromInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId: fromWarehouseId,
        },
      },
    });

    if (!fromInventory || fromInventory.quantity < quantity) {
      throw new AppError('Insufficient stock in source warehouse', 400);
    }

    // Update source inventory
    const updatedFromInventory = await prisma.inventory.update({
      where: { id: fromInventory.id },
      data: {
        quantity: fromInventory.quantity - quantity,
        availableQty: fromInventory.availableQty - quantity,
        lastStockOut: new Date(),
      },
    });

    // Create log for source
    await prisma.inventory_logs.create({
      data: {
        id: generateId(),
        inventoryId: fromInventory.id,
        userId,
        action: 'TRANSFER_OUT',
        quantityBefore: fromInventory.quantity,
        quantityAfter: updatedFromInventory.quantity,
        difference: -quantity,
        notes: `Transfer to ${toWarehouse.name}${notes ? ': ' + notes : ''}`,
        createdAt: new Date(),
      },
    });

    // Get or create destination inventory
    let toInventory = await prisma.inventory.findUnique({
      where: {
        productId_warehouseId: {
          productId,
          warehouseId: toWarehouseId,
        },
      },
    });

    const oldToQuantity = toInventory?.quantity || 0;

    if (toInventory) {
      toInventory = await prisma.inventory.update({
        where: { id: toInventory.id },
        data: {
          quantity: toInventory.quantity + quantity,
          availableQty: toInventory.availableQty + quantity,
          lastStockIn: new Date(),
        },
      });
    } else {
      toInventory = await prisma.inventory.create({
        data: {
          productId,
          warehouseId: toWarehouseId,
          quantity,
          availableQty: quantity,
          lastStockIn: new Date(),
        },
      });
    }

    // Create log for destination
    await prisma.inventory_logs.create({
      data: {
        id: generateId(),
        inventoryId: toInventory.id,
        userId,
        action: 'TRANSFER_IN',
        quantityBefore: oldToQuantity,
        quantityAfter: toInventory.quantity,
        difference: quantity,
        notes: `Transfer from ${fromWarehouse.name}${notes ? ': ' + notes : ''}`,
        createdAt: new Date(),
      },
    });

    // Create transaction
    const transaction = await prisma.transactions.create({
      data: {
        id: generateId(),
        type: 'TRANSFER',
        status: 'COMPLETED',
        productId,
        fromWarehouseId,
        toWarehouseId,
        quantity,
        notes,
        userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        products: true,
        warehouses_transactions_fromWarehouseIdTowarehouses: true,
        warehouses_transactions_toWarehouseIdTowarehouses: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      fromInventory: updatedFromInventory,
      toInventory,
      transaction,
    };
  },

  async getLowStock() {
    const inventory = await prisma.inventory.findMany({
      where: {
        products: {
          isActive: true,
        },
      },
      include: {
        products: {
          include: {
            categories: true,
          },
        },
        warehouses: true,
      },
    });

    const lowStock = inventory.filter((item : any) => {
      return item.quantity <= item.products.minStock;
    });

    return lowStock;
  },
};
