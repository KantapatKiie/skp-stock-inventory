import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', authenticate, async (req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      status: 'success',
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
