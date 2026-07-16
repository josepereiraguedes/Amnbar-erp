import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const purchasingRouter = Router();

const purchaseOrderItemSchema = z.object({
  rawMaterialId: z.string().uuid(),
  quantity: z.number().positive(),
  unitPrice: z.number().min(0),
});

const purchaseOrderSchema = z.object({
  orderNumber: z.string().min(1),
  supplierId: z.string().uuid(),
  expectedDate: z.string().optional().nullable().transform(str => str ? new Date(str) : null),
  notes: z.string().optional().nullable(),
  items: z.array(purchaseOrderItemSchema).min(1)
});

purchasingRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: true,
        user: { select: { name: true } },
        items: { include: { rawMaterial: true } }
      }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

purchasingRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const order = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: true,
        items: { include: { rawMaterial: true } }
      }
    });
    if (!order) {
      res.status(404).json({ success: false, message: 'Order not found' });
      return;
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

purchasingRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = purchaseOrderSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const orderItems = parsed.items.map(item => {
        const totalPrice = item.quantity * item.unitPrice;
        totalAmount += totalPrice;
        return {
          rawMaterialId: item.rawMaterialId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice
        };
      });

      const order = await tx.purchaseOrder.create({
        data: {
          orderNumber: parsed.orderNumber,
          supplierId: parsed.supplierId,
          status: 'PENDING',
          totalAmount,
          expectedDate: parsed.expectedDate,
          notes: parsed.notes,
          userId: userId,
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      });

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

purchasingRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['DRAFT', 'PENDING', 'APPROVED', 'RECEIVED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.purchaseOrder.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      if (currentOrder.status === status) {
        return currentOrder;
      }

      // If transitioning to RECEIVED, increment raw material stock
      if (status === 'RECEIVED' && currentOrder.status !== 'RECEIVED') {
        for (const item of currentOrder.items) {
          await tx.rawMaterial.update({
            where: { id: item.rawMaterialId },
            data: { currentStock: { increment: item.quantity } }
          });
        }
      }

      // If reverting from RECEIVED, decrement raw material stock
      if (currentOrder.status === 'RECEIVED' && status !== 'RECEIVED') {
        for (const item of currentOrder.items) {
          await tx.rawMaterial.update({
            where: { id: item.rawMaterialId },
            data: { currentStock: { decrement: item.quantity } }
          });
        }
      }

      return tx.purchaseOrder.update({
        where: { id },
        data: { 
          status,
          receivedDate: status === 'RECEIVED' ? new Date() : undefined
        }
      });
    });

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Server error' });
  }
});
