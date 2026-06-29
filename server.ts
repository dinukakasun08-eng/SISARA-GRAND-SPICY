import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Use a self-invoking function so we can use async/await for Vite middleware setup
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  const { db } = await import('./src/db/index.ts');
  const schema = await import('./src/db/schema.ts');
  const { eq, desc } = await import('drizzle-orm');
  const { adminAuth } = await import('./src/lib/firebase-admin.ts');

  // Middleware
  const requireAuth = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing token' });
    }
    const token = authHeader.split('Bearer ')[1];
    try {
      const decodedToken = await adminAuth.verifyIdToken(token);
      (req as any).user = decodedToken;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
  };

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const allProducts = await db.select().from(schema.products);
      res.json(allProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });
  
  app.post('/api/products', requireAuth, async (req, res) => {
    try {
      const newProduct = await db.insert(schema.products).values(req.body).returning();
      res.json(newProduct[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });

  app.put('/api/products/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await db.update(schema.products).set(req.body).where(eq(schema.products.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  app.delete('/api/products/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await db.delete(schema.products).where(eq(schema.products.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  // Orders
  app.get('/api/orders', async (req, res) => {
    try {
      const allOrders = await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
      res.json(allOrders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.get('/api/orders/user/:uid', requireAuth, async (req, res) => {
    try {
      if ((req as any).user.uid !== req.params.uid) return res.status(403).json({ error: 'Forbidden' });
      const userOrders = await db.select().from(schema.orders).where(eq(schema.orders.customerId, req.params.uid)).orderBy(desc(schema.orders.createdAt));
      res.json(userOrders);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user orders' });
    }
  });

  app.post('/api/orders', async (req, res) => {
    try {
      const newOrder = await db.insert(schema.orders).values(req.body).returning();
      res.json(newOrder[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.put('/api/orders/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await db.update(schema.orders).set(req.body).where(eq(schema.orders.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update order' });
    }
  });

  // Reviews
  app.get('/api/reviews', async (req, res) => {
    try {
      const allReviews = await db.select().from(schema.reviews).orderBy(desc(schema.reviews.createdAt));
      res.json(allReviews);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', requireAuth, async (req, res) => {
    try {
      const newReview = await db.insert(schema.reviews).values(req.body).returning();
      res.json(newReview[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create review' });
    }
  });

  app.put('/api/reviews/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await db.update(schema.reviews).set(req.body).where(eq(schema.reviews.id, id)).returning();
      res.json(updated[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update review' });
    }
  });

  app.delete('/api/reviews/:id', requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await db.delete(schema.reviews).where(eq(schema.reviews.id, id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete review' });
    }
  });

  // Settings
  app.get('/api/settings/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const result = await db.select().from(schema.settings).where(eq(schema.settings.id, id));
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(404).json({ error: 'Setting not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings/:id', requireAuth, async (req, res) => {
    try {
      const id = req.params.id;
      // Upsert
      const result = await db.insert(schema.settings)
        .values({ id, ...req.body })
        .onConflictDoUpdate({
          target: schema.settings.id,
          set: req.body,
        })
        .returning();
      res.json(result[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  // --- STATIC ASSETS & VITE INTEGRATION ---

  if (process.env.NODE_ENV !== 'production') {
    // In development mode, mount the Vite development server middleware
    console.log('Starting Vite in development middleware mode...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production mode
    console.log('Serving production-ready static assets...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sisara Restaurant server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start full-stack server:', err);
});

