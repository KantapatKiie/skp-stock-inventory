import { Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { AuthRequest } from '../middleware/auth';

export const inventoryController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { productId, warehouseId, page, limit } = req.query;

      const result = await inventoryService.getAll({
        productId: productId as string,
        warehouseId: warehouseId as string,
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

      const inventory = await inventoryService.getById(id);

      res.json({
        status: 'success',
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  },

  async adjustStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { type, ...data } = req.body;

      const result = await inventoryService.adjustStock(
        {
          ...data,
          userId: req.user.id,
        },
        type
      );

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async transferStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const result = await inventoryService.transferStock({
        ...req.body,
        userId: req.user.id,
      });

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  async getLowStock(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const inventory = await inventoryService.getLowStock();

      res.json({
        status: 'success',
        data: inventory,
      });
    } catch (error) {
      next(error);
    }
  },
};
