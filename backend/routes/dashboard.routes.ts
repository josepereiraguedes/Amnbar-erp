import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware.js';
import { prisma } from '../prisma.js';

export const dashboardRouter = Router();

dashboardRouter.get('/summary', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const totalProducts = await prisma.product.count();
    const totalRawMaterials = await prisma.rawMaterial.count();
    
    const products = await prisma.product.findMany({ select: { currentStock: true, salePrice: true, minStock: true, name: true } });
    const rawMaterials = await prisma.rawMaterial.findMany({ select: { currentStock: true, costPerUnit: true, minStock: true, name: true } });
    
    let totalStockValue = 0;
    let lowStockCount = 0;
    const recentAlerts: any[] = [];
    
    products.forEach(p => {
      totalStockValue += p.currentStock * p.salePrice;
      if (p.currentStock <= p.minStock) {
        lowStockCount++;
        if (recentAlerts.length < 5) recentAlerts.push({ id: `p-${Date.now()}-${Math.random()}`, message: `Produto ${p.name} com estoque baixo`, type: 'warning' });
      }
    });

    rawMaterials.forEach(rm => {
      totalStockValue += rm.currentStock * rm.costPerUnit;
      if (rm.currentStock <= rm.minStock) {
        lowStockCount++;
        if (recentAlerts.length < 5) recentAlerts.push({ id: `rm-${Date.now()}-${Math.random()}`, message: `Matéria-Prima ${rm.name} com estoque baixo`, type: 'warning' });
      }
    });

    const pendingSales = await prisma.salesOrder.count({ where: { status: { in: ['DRAFT', 'CONFIRMED'] } } });
    
    const productionInProgress = await prisma.productionOrder.findMany({ where: { status: 'IN_PROGRESS' }, select: { quantity: true } });
    const inProduction = productionInProgress.reduce((acc, order) => acc + order.quantity, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlySalesData = await prisma.salesOrder.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { not: 'CANCELLED' }
      },
      _sum: { netAmount: true }
    });
    
    const monthlySales = monthlySalesData._sum.netAmount || 0;

    res.json({
      success: true,
      data: {
        totalStockValue,
        totalProducts,
        totalRawMaterials,
        finishedProducts: products.reduce((acc, p) => acc + p.currentStock, 0),
        inProduction,
        pendingOrders: pendingSales,
        monthlyPurchases: 0, // Mock for now until Purchasing module
        monthlySales,
        estimatedProfit: monthlySales * 0.4, // Rough 40% margin mock
        lowStockItems: lowStockCount,
        recentAlerts
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
