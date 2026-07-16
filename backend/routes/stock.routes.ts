import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const stockRouter = Router();

const movementSchema = z.object({
  productId: z.string().min(1),
  type: z.enum(['IN', 'OUT', 'TRANSFER', 'ADJUSTMENT', 'INVENTORY', 'RESERVE', 'SEPARATION']),
  quantity: z.number().int().positive(),
  fromWarehouseId: z.string().optional().nullable(),
  toWarehouseId: z.string().optional().nullable(),
  reason: z.string().optional().nullable(),
});

stockRouter.post('/movement', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = movementSchema.parse(req.body);
    const userId = req.user!.id;

    if (parsed.type === 'TRANSFER' && (!parsed.fromWarehouseId || !parsed.toWarehouseId)) {
      res.status(400).json({ success: false, message: 'Transfer requires both from and to warehouses' });
      return;
    }

    if (['IN', 'ADJUSTMENT'].includes(parsed.type) && !parsed.toWarehouseId) {
      res.status(400).json({ success: false, message: 'This movement requires a destination warehouse' });
      return;
    }

    if (['OUT', 'RESERVE', 'SEPARATION'].includes(parsed.type) && !parsed.fromWarehouseId) {
      res.status(400).json({ success: false, message: 'This movement requires a source warehouse' });
      return;
    }

    // Execute within a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Handle source warehouse deduction
      if (parsed.fromWarehouseId) {
        const fromItem = await tx.stockItem.findUnique({
          where: { productId_warehouseId: { productId: parsed.productId, warehouseId: parsed.fromWarehouseId } }
        });
        
        if (!fromItem || fromItem.quantity < parsed.quantity) {
          throw new Error('Insufficient stock in source warehouse');
        }

        await tx.stockItem.update({
          where: { id: fromItem.id },
          data: { quantity: { decrement: parsed.quantity } }
        });
      }

      // Handle destination warehouse addition
      if (parsed.toWarehouseId) {
        await tx.stockItem.upsert({
          where: { productId_warehouseId: { productId: parsed.productId, warehouseId: parsed.toWarehouseId } },
          create: { productId: parsed.productId, warehouseId: parsed.toWarehouseId, quantity: parsed.quantity },
          update: { quantity: { increment: parsed.quantity } }
        });
      }

      // Update total product stock (naive total for simplicity, real ERPs might calculate from DB)
      // but let's recalculate total currentStock from all warehouses
      const allItems = await tx.stockItem.findMany({ where: { productId: parsed.productId } });
      const newTotal = allItems.reduce((acc, item) => acc + item.quantity, 0);
      
      let finalTotal = newTotal;
      // We must consider the updates made in this transaction.
      // Upsert/Update might not be reflected in findMany immediately depending on isolation level,
      // but in Prisma it usually is if we do it sequentially.
      
      // Better yet, just aggregate directly.
      const agg = await tx.stockItem.aggregate({
        where: { productId: parsed.productId },
        _sum: { quantity: true }
      });
      
      await tx.product.update({
        where: { id: parsed.productId },
        data: { currentStock: agg._sum.quantity || 0 }
      });

      // Record movement
      const movement = await tx.stockMovement.create({
        data: {
          productId: parsed.productId,
          type: parsed.type,
          fromWarehouseId: parsed.fromWarehouseId,
          toWarehouseId: parsed.toWarehouseId,
          quantity: parsed.quantity,
          reason: parsed.reason,
          automatic: false,
          userId: userId,
        }
      });

      return movement;
    });

    res.status(201).json({ success: true, data: result });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Server error' });
    }
  }
});

stockRouter.get('/movements', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const productId = req.query.productId as string;

    const where = productId ? { productId } : {};

    const [total, movements] = await Promise.all([
      prisma.stockMovement.count({ where }),
      prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
          fromWarehouse: { select: { name: true } },
          toWarehouse: { select: { name: true } },
          user: { select: { name: true } }
        }
      })
    ]);

    res.json({ success: true, data: { total, page, limit, movements } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
