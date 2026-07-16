import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';
import { upload } from '../middlewares/upload.middleware.js';
import { z } from 'zod';

export const productsRouter = Router();

const productSchema = z.object({
  sku: z.string().min(1),
  internalCode: z.string().optional().nullable(),
  barcode: z.string().optional().nullable(),
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  brand: z.string().optional().nullable(),
  collectionId: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  typeId: z.string().min(1),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  supplierId: z.string().optional().nullable(),
  costPrice: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0),
  weight: z.coerce.number().optional().nullable(),
  minStock: z.coerce.number().min(0),
  maxStock: z.coerce.number().min(0),
  location: z.string().optional().nullable(),
  status: z.string().default('ACTIVE'),
  observations: z.string().optional().nullable(),
});

productsRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 20);
    const sortBy = (req.query.sortBy as string) || 'name';
    const order = (req.query.order as string) === 'desc' ? 'desc' : 'asc';
    const search = req.query.search as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { internalCode: { contains: search } },
        { barcode: { contains: search } },
        { color: { contains: search } },
        { size: { contains: search } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          category: true,
          collection: true,
          sockType: true,
          stockItems: { include: { warehouse: true } }, recipeItems: { include: { rawMaterial: true } }
        }
      })
    ]);

    res.json({ success: true, data: { total, page, limit, products } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});


productsRouter.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id }
    });
    if (!product) {
      res.status(404).json({ success: false, message: 'Not found' });
      return;
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

productsRouter.post('/', authenticate, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = { ...req.body };
    // Convert empty strings to null for relations and optional fields
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    const parsed = productSchema.parse(body);
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const margin = parsed.salePrice > 0 ? (parsed.salePrice - parsed.costPrice) / parsed.salePrice : 0;

    const product = await prisma.product.create({
      data: {
        ...parsed,
        margin,
        imageUrl,
      }
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});


productsRouter.put('/test/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    const parsed = productSchema.parse(body);
    const margin = parsed.salePrice > 0 ? (parsed.salePrice - parsed.costPrice) / parsed.salePrice : 0;
    
    const updateData = { ...parsed, margin };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: product });
  } catch (error) {
    if (error.name === 'ZodError') {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
});

productsRouter.put('/:id', authenticate, upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const body = { ...req.body };
    Object.keys(body).forEach(key => {
      if (body[key] === '') {
        body[key] = null;
      }
    });

    const parsed = productSchema.parse(body);
    const margin = parsed.salePrice > 0 ? (parsed.salePrice - parsed.costPrice) / parsed.salePrice : 0;
    
    const updateData: any = { ...parsed, margin };
    if (req.file) {
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData
    });

    res.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error });
    }
  }
});

productsRouter.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.product.delete({ where: { id } });
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error });
  }
});

const recipeSchema = z.object({
  items: z.array(z.object({
    rawMaterialId: z.string().uuid(),
    quantity: z.number().positive()
  }))
});

productsRouter.put('/:id/recipe', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const parsed = recipeSchema.parse(req.body);

    const product = await prisma.$transaction(async (tx) => {
      // delete old
      await tx.productRecipeItem.deleteMany({ where: { productId: id } });
      
      // create new
      if (parsed.items.length > 0) {
        await tx.productRecipeItem.createMany({
          data: parsed.items.map(item => ({
            productId: id,
            rawMaterialId: item.rawMaterialId,
            quantity: item.quantity
          }))
        });
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          category: true,
          collection: true,
          sockType: true,
          stockItems: { include: { warehouse: true } },
          recipeItems: { include: { rawMaterial: true } }
        }
      });
    });

    res.json({ success: true, data: product });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: 'Validation error', errors: error.issues });
    } else {
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }
});
