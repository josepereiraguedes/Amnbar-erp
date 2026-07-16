import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';

export const referencesRouter = Router();

referencesRouter.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const [categories, collections, sockTypes, warehouses, suppliers] = await Promise.all([
      prisma.category.findMany(),
      prisma.collection.findMany(),
      prisma.sockType.findMany(),
      prisma.warehouse.findMany(),
      prisma.supplier.findMany(),
    ]);

    res.json({
      success: true,
      data: {
        categories,
        collections,
        sockTypes,
        warehouses,
        suppliers,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
