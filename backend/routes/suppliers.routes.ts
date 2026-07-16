import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const suppliersRouter = Router();

const supplierSchema = z.object({
  name: z.string().min(1),
  document: z.string().optional().nullable(),
  contact: z.string().optional().nullable(),
  email: z.string().email().optional().nullable().or(z.literal('')),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
});

suppliersRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    let where = {};
    if (search && typeof search === 'string') {
      where = {
        OR: [
          { name: { contains: search } },
          { document: { contains: search } },
          { email: { contains: search } },
        ]
      };
    }
    const suppliers = await prisma.supplier.findMany({
      where,
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

suppliersRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }
    res.json({ success: true, data: supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

suppliersRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = { ...req.body };
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    const parsed = supplierSchema.parse(body);

    const supplier = await prisma.supplier.create({ data: parsed });
    res.status(201).json({ success: true, data: supplier });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Server error' });
    }
  }
});

suppliersRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    const parsed = supplierSchema.parse(body);

    const supplier = await prisma.supplier.update({
      where: { id },
      data: parsed
    });
    res.json({ success: true, data: supplier });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(400).json({ success: false, message: error.message || 'Server error' });
    }
  }
});

suppliersRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.supplier.delete({ where: { id } });
    res.json({ success: true, message: 'Supplier deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
