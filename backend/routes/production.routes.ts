import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const productionRouter = Router();

const orderSchema = z.object({
  orderNumber: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    rawMaterialId: z.string().min(1),
    quantity: z.number().positive()
  })).optional().default([])
});

productionRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.productionOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: true,
        user: { select: { name: true } },
        items: { include: { rawMaterial: true } }
      }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

productionRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = orderSchema.parse(req.body);
    const userId = req.user!.id;

    // Use transaction to create order and items, and reduce stock of raw materials
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.productionOrder.create({
        data: {
          orderNumber: parsed.orderNumber,
          productId: parsed.productId,
          quantity: parsed.quantity,
          status: 'PENDING',
          notes: parsed.notes,
          userId: userId,
          items: {
            create: parsed.items.map(item => ({
              rawMaterialId: item.rawMaterialId,
              quantity: item.quantity
            }))
          }
        },
        include: { items: true }
      });

      // We won't decrease stock until status changes, or we can do it now. 
      // Let's assume stock decreases when order is created (PENDING implies reserved or allocated)
      for (const item of parsed.items) {
        await tx.rawMaterial.update({
          where: { id: item.rawMaterialId },
          data: { currentStock: { decrement: item.quantity } }
        });
      }

      return order;
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

productionRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.productionOrder.findUnique({ 
        where: { id },
        include: { items: true }
      });
      
      if (!currentOrder) {
        throw new Error('Order not found');
      }

      if (currentOrder.status === status) {
        return currentOrder;
      }

      // If cancelling, restore raw material stock
      if (status === 'CANCELLED' && currentOrder.status !== 'COMPLETED' && currentOrder.status !== 'CANCELLED') {
        for (const item of currentOrder.items) {
          await tx.rawMaterial.update({
            where: { id: item.rawMaterialId },
            data: { currentStock: { increment: item.quantity } }
          });
        }
      }

      // If completing, increment product stock
      if (status === 'COMPLETED' && currentOrder.status !== 'COMPLETED') {
        await tx.product.update({
          where: { id: currentOrder.productId },
          data: { currentStock: { increment: currentOrder.quantity } }
        });
      }

      return tx.productionOrder.update({
        where: { id },
        data: { 
          status,
          startDate: status === 'IN_PROGRESS' && !currentOrder.startDate ? new Date() : undefined,
          endDate: status === 'COMPLETED' ? new Date() : undefined,
        }
      });
    });

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Server error' });
  }
});
