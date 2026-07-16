import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { authRouter } from './backend/routes/auth.routes.js';
import { dashboardRouter } from './backend/routes/dashboard.routes.js';
import { referencesRouter } from './backend/routes/references.routes.js';
import { productsRouter } from './backend/routes/products.routes.js';
import { stockRouter } from './backend/routes/stock.routes.js';
import { rawMaterialsRouter } from './backend/routes/raw-materials.routes.js';
import { productionRouter } from './backend/routes/production.routes.js';
import { customersRouter } from './backend/routes/customers.routes.js';
import { salesRouter } from './backend/routes/sales.routes.js';
import { suppliersRouter } from './backend/routes/suppliers.routes.js';
import { purchasingRouter } from './backend/routes/purchasing.routes.js';
import { usersRouter } from './backend/routes/users.routes.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(cookieParser());

  // Static uploads
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  // API Routes
  app.use('/api/auth', authRouter);
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/references', referencesRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/stock', stockRouter);
  app.use('/api/raw-materials', rawMaterialsRouter);
  app.use('/api/production', productionRouter);
  app.use('/api/suppliers', suppliersRouter);
  app.use('/api/purchasing', purchasingRouter);
  app.use('/api/customers', customersRouter);
  app.use('/api/sales', salesRouter);
  app.use('/api/users', usersRouter);
  
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
