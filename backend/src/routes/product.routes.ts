import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', productController.getAll);
router.get('/low-stock', productController.getLowStock);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/:id', productController.getById);

// Admin and Manager only
router.post('/', authorize('ADMIN', 'MANAGER'), productController.create);
router.put('/:id', authorize('ADMIN', 'MANAGER'), productController.update);
router.delete('/:id', authorize('ADMIN'), productController.delete);

export default router;
