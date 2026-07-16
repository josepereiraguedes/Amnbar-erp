import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const customersRouter = Router();

const customerSchema = z.object({
  name: z.string().min(1),
  document: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  type: z.enum(['RETAIL', 'WHOLESALE']).default('RETAIL'),
});

customersRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const search = req.query.search as string;
    const where = search ? {
      OR: [
        { name: { contains: search } },
        { document: { contains: search } },
        { email: { contains: search } },
      ]
    } : {};

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

customersRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // If email is empty string, make it null to avoid unique constraint issues if we add them, or validation issues
    let body = { ...req.body };
    if (body.email === '') body.email = null;

    const parsed = customerSchema.parse(body);
    const customer = await prisma.customer.create({ data: parsed });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

customersRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    let body = { ...req.body };
    if (body.email === '') body.email = null;

    const parsed = customerSchema.parse(body);
    const customer = await prisma.customer.update({ where: { id }, data: parsed });
    res.json({ success: true, data: customer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

customersRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.customer.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
