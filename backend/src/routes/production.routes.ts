import { Router } from 'express';
import { productionController } from '../controllers/production.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Production sections
router.get('/sections', productionController.getSections);

// Warehouses
router.get('/warehouses', productionController.getWarehouses);

// Scan logs
router.post('/scan-logs', productionController.createScanLog);
router.get('/scan-logs', productionController.getScanLogs);

// Production orders
router.get('/orders', productionController.getProductionOrders);
router.post('/orders', productionController.createProductionOrder);

// Production processes
router.patch('/processes/:id', productionController.updateProductionProcess);

export default router;
