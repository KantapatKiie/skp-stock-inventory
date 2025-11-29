import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', transactionController.getAll);
router.get('/logs', transactionController.getInventoryLogs);
router.get('/:id', transactionController.getById);

export default router;
