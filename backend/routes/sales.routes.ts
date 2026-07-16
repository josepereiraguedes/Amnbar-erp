import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const salesRouter = Router();

const salesOrderSchema = z.object({
  orderNumber: z.string().min(1),
  customerId: z.string().min(1),
  discount: z.number().min(0).default(0),
  paymentMethod: z.string().optional().nullable(),
  paymentStatus: z.enum(['PENDING', 'PAID', 'PARTIAL']).default('PENDING'),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().positive()
  })).min(1)
});

salesRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.salesOrder.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
        user: { select: { name: true } },
        items: { include: { product: true } }
      }
    });
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

salesRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = salesOrderSchema.parse(req.body);
    const userId = req.user!.id;

    const result = await prisma.$transaction(async (tx) => {
      // Calculate totals
      let totalAmount = 0;
      const orderItems = parsed.items.map(item => {
        const totalPrice = item.quantity * item.unitPrice;
        totalAmount += totalPrice;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice
        };
      });

      const netAmount = totalAmount - parsed.discount;

      const order = await tx.salesOrder.create({
        data: {
          orderNumber: parsed.orderNumber,
          customerId: parsed.customerId,
          status: 'CONFIRMED',
          totalAmount,
          discount: parsed.discount,
          netAmount,
          paymentMethod: parsed.paymentMethod,
          paymentStatus: parsed.paymentStatus,
          notes: parsed.notes,
          userId: userId,
          items: {
            create: orderItems
          }
        },
        include: { items: true }
      });

      // Decrease stock for sold items
      for (const item of parsed.items) {
        // Simple stock reduction from product currentStock.
        // In a more complex system, this would reduce from a specific warehouse via StockMovement.
        await tx.product.update({
          where: { id: item.productId },
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

salesRouter.patch('/:id/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status' });
      return;
    }

    const order = await prisma.$transaction(async (tx) => {
      const currentOrder = await tx.salesOrder.findUnique({
        where: { id },
        include: { items: true }
      });

      if (!currentOrder) {
        throw new Error('Order not found');
      }

      if (currentOrder.status === status) {
        return currentOrder;
      }

      // If cancelling and stock was reduced, we should restore it
      // Note: we decreased stock on creation for CONFIRMED. In this simplistic model, 
      // sales orders start as CONFIRMED. If cancelled, restore.
      if (status === 'CANCELLED' && currentOrder.status !== 'CANCELLED') {
        for (const item of currentOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { increment: item.quantity } }
          });
        }
      }

      return tx.salesOrder.update({
        where: { id },
        data: { status }
      });
    });

    res.json({ success: true, data: order });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || 'Server error' });
  }
});
