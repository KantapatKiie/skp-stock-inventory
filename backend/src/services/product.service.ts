import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';

interface CreateProductData {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  price?: number;
  cost?: number;
  imageUrl?: string;
  createdById: string;
}

interface UpdateProductData {
  sku?: string;
  barcode?: string;
  name?: string;
  description?: string;
  categoryId?: string;
  unit?: string;
  minStock?: number;
  maxStock?: number;
  price?: number;
  cost?: number;
  imageUrl?: string;
  isActive?: boolean;
  updatedById: string;
}

export const productService = {
  async getAll(filters?: {
    search?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { sku: { contains: filters.search, mode: 'insensitive' } },
        { barcode: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        include: {
          categories: true,
          inventory: {
            include: {
              warehouses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.products.count({ where }),
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  async getById(id: string) {
    const product = await prisma.products.findUnique({
      where: { id },
      include: {
        categories: true,
        inventory: {
          include: {
            warehouses: true,
          },
        },
        users_products_createdByIdTousers: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  },

  async getByBarcode(barcode: string) {
    const product = await prisma.products.findUnique({
      where: { barcode },
      include: {
        categories: true,
        inventory: {
          include: {
            warehouses: true,
          },
        },
      },
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    return product;
  },

  async create(data: CreateProductData) {
    // Check if SKU already exists
    const existingSku = await prisma.products.findUnique({
      where: { sku: data.sku },
    });

    if (existingSku) {
      throw new AppError('SKU already exists', 400);
    }

    // Check if barcode already exists
    if (data.barcode) {
      const existingBarcode = await prisma.products.findUnique({
        where: { barcode: data.barcode },
      });

      if (existingBarcode) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    const product = await prisma.products.create({
      data,
      include: {
        categories: true,
      },
    });

    return product;
  },

  async update(id: string, data: UpdateProductData) {
    const existing = await prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    // Check SKU uniqueness
    if (data.sku && data.sku !== existing.sku) {
      const skuExists = await prisma.products.findUnique({
        where: { sku: data.sku },
      });

      if (skuExists) {
        throw new AppError('SKU already exists', 400);
      }
    }

    // Check barcode uniqueness
    if (data.barcode && data.barcode !== existing.barcode) {
      const barcodeExists = await prisma.products.findUnique({
        where: { barcode: data.barcode },
      });

      if (barcodeExists) {
        throw new AppError('Barcode already exists', 400);
      }
    }

    const product = await prisma.products.update({
      where: { id },
      data,
      include: {
        categories: true,
      },
    });

    return product;
  },

  async delete(id: string) {
    const existing = await prisma.products.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Product not found', 404);
    }

    await prisma.products.delete({
      where: { id },
    });

    return { message: 'Product deleted successfully' };
  },

  async getLowStock() {
    const products = await prisma.products.findMany({
      where: {
        isActive: true,
      },
      include: {
        categories: true,
        inventory: {
          include: {
            warehouses: true,
          },
        },
      },
    });

    // Filter products with low stock
    const lowStockProducts = products.filter((product : any) => {
      const totalQuantity = product.inventory.reduce(
        (sum : any, inv: any) => sum + inv.quantity,
        0
      );
      return totalQuantity <= product.minStock;
    });

    return lowStockProducts;
  },
};
