import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';

// Use a self-invoking function so we can use async/await for Vite middleware setup
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- API ROUTES ---
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
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

