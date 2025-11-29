import { Response, NextFunction } from 'express';
import { transactionService } from '../services/transaction.service';
import { AuthRequest } from '../middleware/auth';

export const transactionController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { type, status, productId, userId, page, limit } = req.query;

      const result = await transactionService.getAll({
        type: type as string,
        status: status as string,
        productId: productId as string,
        userId: userId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const transaction = await transactionService.getById(id);

      res.json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  },

  async getInventoryLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { inventoryId, userId, page, limit } = req.query;

      const result = await transactionService.getInventoryLogs({
        inventoryId: inventoryId as string,
        userId: userId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },
};
