import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import inventoryRoutes from './inventory.routes';
import categoryRoutes from './category.routes';
import productionRoutes from './production.routes';
import transactionRoutes from './transaction.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/categories', categoryRoutes);
router.use('/production', productionRoutes);
router.use('/transactions', transactionRoutes);
router.use('/users', userRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
