import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const transactionService = {
  async getAll(params: {
    type?: string;
    status?: string;
    productId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { type, status, productId, userId, page = 1, limit = 50 } = params;

    const where: any = {};

    if (type && type !== 'ALL') {
      where.type = type;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (productId) {
      where.productId = productId;
    }

    if (userId) {
      where.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transactions.findMany({
        where,
        include: {
          products: {
            select: {
              id: true,
              sku: true,
              name: true,
            },
          },
          warehouses_transactions_fromWarehouseIdTowarehouses: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          warehouses_transactions_toWarehouseIdTowarehouses: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.transactions.count({ where }),
    ]);

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const transaction = await prisma.transactions.findUnique({
      where: { id },
      include: {
        products: true,
        warehouses_transactions_fromWarehouseIdTowarehouses: true,
        warehouses_transactions_toWarehouseIdTowarehouses: true,
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  },

  async getInventoryLogs(params: {
    inventoryId?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { inventoryId, userId, page = 1, limit = 50 } = params;

    const where: any = {};

    if (inventoryId) {
      where.inventoryId = inventoryId;
    }

    if (userId) {
      where.userId = userId;
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.inventory_logs.findMany({
        where,
        include: {
          inventory: {
            include: {
              products: {
                select: {
                  id: true,
                  sku: true,
                  name: true,
                },
              },
              warehouses: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                },
              },
            },
          },
          users: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.inventory_logs.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },
};
