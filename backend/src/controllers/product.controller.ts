import { Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth';

export const productController = {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { search, categoryId, isActive, page, limit } = req.query;

      const result = await productService.getAll({
        search: search as string,
        categoryId: categoryId as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
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

      const product = await productService.getById(id);

      res.json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async getByBarcode(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { barcode } = req.params;

      const product = await productService.getByBarcode(barcode);

      res.json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const product = await productService.create({
        ...req.body,
        createdById: req.user.id,
      });

      res.status(201).json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated',
        });
      }

      const { id } = req.params;

      const product = await productService.update(id, {
        ...req.body,
        updatedById: req.user.id,
      });

      res.json({
        status: 'success',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const result = await productService.delete(id);

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
      const products = await productService.getLowStock();

      res.json({
        status: 'success',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  },
};
