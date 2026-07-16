import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { z } from 'zod';
import { hashPassword } from '../utils/auth.js';

export const usersRouter = Router();

// Only ADMIN should access this in a real system, but for now we just require authentication
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).optional(), // Optional on update
  role: z.enum(['ADMIN', 'MANAGER', 'PRODUCTION', 'PURCHASING', 'SALES', 'STOCK']),
  active: z.boolean().default(true)
});

usersRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

usersRouter.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = userSchema.parse(req.body);
    
    // Check if email exists
    const existing = await prisma.user.findUnique({ where: { email: parsed.email } });
    if (existing) {
      res.status(400).json({ success: false, message: 'Email já cadastrado.' });
      return;
    }

    if (!parsed.password) {
      res.status(400).json({ success: false, message: 'Senha é obrigatória para criar usuário.' });
      return;
    }

    const hashedPassword = await hashPassword(parsed.password);

    const user = await prisma.user.create({ 
      data: {
        name: parsed.name,
        email: parsed.email,
        password: hashedPassword,
        role: parsed.role,
        active: parsed.active
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      }
    });
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

usersRouter.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = userSchema.parse(req.body);
    
    const existingEmail = await prisma.user.findFirst({
      where: { email: parsed.email, id: { not: id } }
    });
    if (existingEmail) {
      res.status(400).json({ success: false, message: 'Email já está em uso por outro usuário.' });
      return;
    }

    const dataToUpdate: any = {
      name: parsed.name,
      email: parsed.email,
      role: parsed.role,
      active: parsed.active
    };

    if (parsed.password) {
      dataToUpdate.password = await hashPassword(parsed.password);
    }

    const user = await prisma.user.update({ 
      where: { id }, 
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      }
    });
    res.json({ success: true, data: user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

usersRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // Don't delete, just deactivate to keep relations intact
    await prisma.user.update({ where: { id }, data: { active: false } });
    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
