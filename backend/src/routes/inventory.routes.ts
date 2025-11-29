import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', inventoryController.getAll);
router.get('/low-stock', inventoryController.getLowStock);
router.get('/:id', inventoryController.getById);

// Stock operations - Staff and above
router.post('/adjust', authorize('ADMIN', 'MANAGER', 'STAFF'), inventoryController.adjustStock);

// Transfer - Manager and Admin only
router.post('/transfer', authorize('ADMIN', 'MANAGER'), inventoryController.transferStock);

export default router;
