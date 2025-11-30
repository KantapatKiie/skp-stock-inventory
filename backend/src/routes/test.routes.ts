import { Router } from 'express';
import prisma from '../config/database';

const router = Router();

/**
 * Test all API endpoints
 * GET /api/test/endpoints
 */
router.get('/endpoints', async (req, res) => {
  const results: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    tests: {},
  };

  // Test 1: Database Connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    results.tests.database = { status: '✅ OK', message: 'Database connected' };
  } catch (error: any) {
    results.tests.database = { status: '❌ FAIL', message: error.message };
  }

  // Test 2: Products Count
  try {
    const count = await prisma.products.count();
    results.tests.products = { status: '✅ OK', count, message: `${count} products found` };
  } catch (error: any) {
    results.tests.products = { status: '❌ FAIL', message: error.message };
  }

  // Test 3: Categories Count
  try {
    const count = await prisma.categories.count();
    results.tests.categories = { status: '✅ OK', count, message: `${count} categories found` };
  } catch (error: any) {
    results.tests.categories = { status: '❌ FAIL', message: error.message };
  }

  // Test 4: Inventory Count
  try {
    const count = await prisma.inventory.count();
    results.tests.inventory = { status: '✅ OK', count, message: `${count} inventory records found` };
  } catch (error: any) {
    results.tests.inventory = { status: '❌ FAIL', message: error.message };
  }

  // Test 5: Warehouses Count
  try {
    const count = await prisma.warehouses.count();
    results.tests.warehouses = { status: '✅ OK', count, message: `${count} warehouses found` };
  } catch (error: any) {
    results.tests.warehouses = { status: '❌ FAIL', message: error.message };
  }

  // Test 6: Users Count
  try {
    const count = await prisma.users.count();
    results.tests.users = { status: '✅ OK', count, message: `${count} users found` };
  } catch (error: any) {
    results.tests.users = { status: '❌ FAIL', message: error.message };
  }

  // Test 7: Transactions Count
  try {
    const count = await prisma.transactions.count();
    results.tests.transactions = { status: '✅ OK', count, message: `${count} transactions found` };
  } catch (error: any) {
    results.tests.transactions = { status: '❌ FAIL', message: error.message };
  }

  // Calculate overall status
  const allTests = Object.values(results.tests);
  const passed = allTests.filter((t: any) => t.status === '✅ OK').length;
  const failed = allTests.filter((t: any) => t.status === '❌ FAIL').length;

  results.summary = {
    total: allTests.length,
    passed,
    failed,
    status: failed === 0 ? '✅ ALL TESTS PASSED' : `⚠️ ${failed} TEST(S) FAILED`,
  };

  res.json(results);
});

/**
 * Test API routes availability
 * GET /api/test/routes
 */
router.get('/routes', (req, res) => {
  const apiRoutes = {
    timestamp: new Date().toISOString(),
    availableRoutes: {
      auth: {
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/refresh': 'Refresh access token',
        'POST /api/auth/logout': 'Logout user',
      },
      products: {
        'GET /api/products': 'Get all products (paginated)',
        'GET /api/products/:id': 'Get product by ID',
        'GET /api/products/barcode/:barcode': 'Get product by barcode',
        'POST /api/products': 'Create new product',
        'PATCH /api/products/:id': 'Update product',
        'DELETE /api/products/:id': 'Delete product',
        'GET /api/products/low-stock': 'Get low stock products',
      },
      inventory: {
        'GET /api/inventory': 'Get all inventory',
        'POST /api/inventory/adjust': 'Adjust stock levels',
        'POST /api/inventory/transfer': 'Transfer stock between warehouses',
      },
      transactions: {
        'GET /api/transactions': 'Get all transactions (paginated)',
        'GET /api/transactions/:id': 'Get transaction by ID',
        'POST /api/transactions': 'Create new transaction',
        'PATCH /api/transactions/:id': 'Update transaction',
      },
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PATCH /api/users/:id': 'Update user',
        'DELETE /api/users/:id': 'Delete user',
      },
      categories: {
        'GET /api/categories': 'Get all categories',
        'POST /api/categories': 'Create new category',
        'PATCH /api/categories/:id': 'Update category',
        'DELETE /api/categories/:id': 'Delete category',
      },
      production: {
        'GET /api/production/sections': 'Get production sections',
        'GET /api/production/warehouses': 'Get warehouses for production',
        'GET /api/production/orders': 'Get production orders',
        'POST /api/production/orders': 'Create production order',
        'GET /api/production/scan-logs': 'Get scan logs',
        'POST /api/production/scan-logs': 'Create scan log',
        'PATCH /api/production/processes/:id': 'Update production process',
      },
    },
    testEndpoints: {
      'GET /api/test/endpoints': 'Test all database endpoints',
      'GET /api/test/routes': 'Get this list of available routes',
      'GET /health': 'Health check (no auth required)',
    },
  };

  res.json(apiRoutes);
});

/**
 * Quick API health check
 * GET /api/test/health
 */
router.get('/health', async (req, res) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message,
    });
  }
});

export default router;
