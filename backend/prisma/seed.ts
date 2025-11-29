import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

enum Role {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

enum TransactionType {
  IN = 'IN',
  OUT = 'OUT',
  TRANSFER = 'TRANSFER',
  ADJUSTMENT = 'ADJUSTMENT',
}

enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

const prisma = new PrismaClient();

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clear existing data
  console.log('🗑️ Clearing existing data...');
  await prisma.inventory_logs.deleteMany();
  await prisma.transactions.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.products.deleteMany();
  await prisma.categories.deleteMany();
  await prisma.warehouses.deleteMany();
  await prisma.refresh_tokens.deleteMany();
  await prisma.users.deleteMany();

  console.log('✅ Cleared existing data');

  // Create Users
  const admin = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'admin@skp.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: Role.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const manager = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'manager@skp.com',
      password: await bcrypt.hash('manager123', 10),
      firstName: 'Manager',
      lastName: 'User',
      role: Role.MANAGER,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const staff = await prisma.users.create({
    data: {
      id: generateId(),
      email: 'staff@skp.com',
      password: await bcrypt.hash('staff123', 10),
      firstName: 'Staff',
      lastName: 'User',
      role: Role.STAFF,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created users');

  // Create Categories
  const catRawMaterials = await prisma.categories.create({
    data: {
      id: generateId(),
      name: 'Raw Materials',
      description: 'วัตถุดิบต่างๆ',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const catComponents = await prisma.categories.create({
    data: {
      id: generateId(),
      name: 'Components',
      description: 'ชิ้นส่วน/อุปกรณ์ประกอบ',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const catFinishedGoods = await prisma.categories.create({
    data: {
      id: generateId(),
      name: 'Finished Goods',
      description: 'สินค้าสำเร็จรูป',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const catPackaging = await prisma.categories.create({
    data: {
      id: generateId(),
      name: 'Packaging',
      description: 'วัสดุบรรจุภัณฑ์',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created categories');

  // Create Warehouses
  const whMain = await prisma.warehouses.create({
    data: {
      id: generateId(),
      code: 'WH-MAIN',
      name: 'Main Warehouse',
      location: 'Building A',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const whProduction = await prisma.warehouses.create({
    data: {
      id: generateId(),
      code: 'WH-PROD',
      name: 'Production Warehouse',
      location: 'Building B - Floor 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Created warehouses');

  // Create Products
  const products = [];

  // Raw Materials
  for (let i = 1; i <= 5; i++) {
    const id = generateId();
    const sku = `RM-${String(i).padStart(3, '0')}`;
    const product = await prisma.products.create({
      data: {
        id,
        sku,
        barcode: `${sku}-${id}`,
        name: `Raw Material ${i}`,
        description: `วัตถุดิบประเภทที่ ${i}`,
        categoryId: catRawMaterials.id,
        unit: 'kg',
        price: 100 + i * 10,
        cost: 80 + i * 8,
        minStock: 50,
        createdById: admin.id,
        updatedById: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    products.push(product);
  }

  // Components
  for (let i = 1; i <= 6; i++) {
    const id = generateId();
    const sku = `COM-${String(i).padStart(3, '0')}`;
    const product = await prisma.products.create({
      data: {
        id,
        sku,
        barcode: `${sku}-${id}`,
        name: `Component ${i}`,
        description: `ชิ้นส่วนประเภทที่ ${i}`,
        categoryId: catComponents.id,
        unit: 'pcs',
        price: 50 + i * 5,
        cost: 40 + i * 4,
        minStock: 100,
        createdById: admin.id,
        updatedById: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    products.push(product);
  }

  // Finished Goods
  for (let i = 1; i <= 5; i++) {
    const id = generateId();
    const sku = `FG-${String(i).padStart(3, '0')}`;
    const product = await prisma.products.create({
      data: {
        id,
        sku,
        barcode: `${sku}-${id}`,
        name: `Finished Product ${i}`,
        description: `สินค้าสำเร็จรูปรุ่นที่ ${i}`,
        categoryId: catFinishedGoods.id,
        unit: 'unit',
        price: 500 + i * 50,
        cost: 400 + i * 40,
        minStock: 20,
        createdById: admin.id,
        updatedById: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    products.push(product);
  }

  // Packaging
  for (let i = 1; i <= 3; i++) {
    const id = generateId();
    const sku = `PKG-${String(i).padStart(3, '0')}`;
    const product = await prisma.products.create({
      data: {
        id,
        sku,
        barcode: `${sku}-${id}`,
        name: `Packaging ${i}`,
        description: `วัสดุบรรจุภัณฑ์ประเภทที่ ${i}`,
        categoryId: catPackaging.id,
        unit: 'box',
        price: 30 + i * 10,
        cost: 25 + i * 8,
        minStock: 200,
        createdById: admin.id,
        updatedById: admin.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    products.push(product);
  }

  console.log('✅ Created products');

  // Create Inventory
  for (const product of products) {
    const quantity = Math.floor(Math.random() * 500) + 100;
    await prisma.inventory.create({
      data: {
        id: generateId(),
        productId: product.id,
        warehouseId: whMain.id,
        quantity: quantity,
        reservedQty: 0,
        availableQty: quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    if (Math.random() > 0.5) {
      const qty = Math.floor(Math.random() * 200) + 50;
      await prisma.inventory.create({
        data: {
          id: generateId(),
          productId: product.id,
          warehouseId: whProduction.id,
          quantity: qty,
          reservedQty: 0,
          availableQty: qty,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  }

  console.log('✅ Created inventory');

  // Create Transactions
  for (let i = 0; i < 10; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const type = [TransactionType.IN, TransactionType.OUT, TransactionType.ADJUSTMENT][Math.floor(Math.random() * 3)];
    
    await prisma.transactions.create({
      data: {
        id: generateId(),
        type,
        productId: product.id,
        quantity: Math.floor(Math.random() * 50) + 10,
        fromWarehouseId: whMain.id,
        userId: admin.id,
        status: TransactionStatus.COMPLETED,
        notes: `Test transaction ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Created transactions');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
