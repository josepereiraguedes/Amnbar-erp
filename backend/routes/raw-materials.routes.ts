import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';

export const rawMaterialsRouter = Router();

const rmSchema = z.object({
  name: z.string().min(1),
  sku: z.string().optional().nullable(),
  type: z.string().min(1),
  supplier: z.string().optional().nullable(),
  unit: z.string().min(1),
  costPerUnit: z.coerce.number().min(0),
  currentStock: z.coerce.number().min(0),
  minStock: z.coerce.number().min(0),
});

rawMaterialsRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rawMaterials = await prisma.rawMaterial.findMany({
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: rawMaterials });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

rawMaterialsRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = rmSchema.parse(req.body);
    const rm = await prisma.rawMaterial.create({ data: parsed });
    res.status(201).json({ success: true, data: rm });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

rawMaterialsRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = rmSchema.parse(req.body);
    const rm = await prisma.rawMaterial.update({ where: { id }, data: parsed });
    res.json({ success: true, data: rm });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

rawMaterialsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.rawMaterial.delete({ where: { id } });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
