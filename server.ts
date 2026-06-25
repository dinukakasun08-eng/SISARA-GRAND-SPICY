import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';

// Use a self-invoking function so we can use async/await for Vite middleware setup
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Database Path
  const DB_PATH = path.join(process.cwd(), 'orders.json');

  // Encryption Setup
  const ALGORITHM = 'aes-256-cbc';
  const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'sisara123';
  
  // Create a stable 32-byte key from the password
  const ENCRYPTION_KEY = crypto.createHash('sha256').update(ADMIN_PASS).digest();
  
  // Bearer Token for Admin Authentication
  const ADMIN_TOKEN = crypto.createHash('sha256').update(ADMIN_PASS + '-salt-2026').digest('hex');

  // Encryption helper
  function encrypt(text: string) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      data: encrypted
    };
  }

  // Decryption helper
  function decrypt(encryptedText: string, ivHex: string) {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      return '[Decryption Failed]';
    }
  }

  // Helper to read orders safely from orders.json
  function readOrdersFromFile(): any[] {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify([]));
      return [];
    }
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data || '[]');
    } catch (e) {
      console.error('Error reading database file:', e);
      return [];
    }
  }

  // Helper to write orders safely
  function writeOrdersToFile(orders: any[]) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(orders, null, 2));
    } catch (e) {
      console.error('Error writing to database file:', e);
    }
  }

  // --- API ROUTES ---

  // 1. PLACE AN ORDER (Customer Public Endpoint)
  app.post('/api/orders', (req, res) => {
    try {
      const { customerName, customerPhone, deliveryAddress, coordinates, items, totalAmount } = req.body;

      if (!customerName || !customerPhone || !deliveryAddress || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Missing required order details' });
      }

      // Generate a unique order ID
      const orderId = 'SIS-' + Math.floor(100000 + Math.random() * 900000);

      // Encrypt sensitive location fields
      const encryptedAddress = encrypt(deliveryAddress);
      let encryptedCoordinates = null;
      if (coordinates) {
        encryptedCoordinates = encrypt(JSON.stringify(coordinates));
      }

      // Prepare order record with encrypted location details
      const newOrderRecord = {
        id: orderId,
        customerName,
        customerPhone,
        encryptedAddress,
        encryptedCoordinates,
        items,
        totalAmount,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Save order to persistent storage
      const orders = readOrdersFromFile();
      orders.unshift(newOrderRecord); // Place newest at the top
      writeOrdersToFile(orders);

      // Return the unencrypted order to the customer for their receipt screen
      return res.status(201).json({
        id: orderId,
        customerName,
        customerPhone,
        deliveryAddress,
        coordinates,
        items,
        totalAmount,
        status: 'pending',
        createdAt: newOrderRecord.createdAt
      });
    } catch (error) {
      console.error('Order creation failed:', error);
      return res.status(500).json({ error: 'Failed to process order' });
    }
  });

  // 2. ADMIN LOGIN (Public Endpoint)
  app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASS) {
      return res.json({
        success: true,
        token: ADMIN_TOKEN,
        message: 'Login successful'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid administrator password'
    });
  });

  // Admin authorization middleware
  const adminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader === `Bearer ${ADMIN_TOKEN}`) {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized. Invalid admin token.' });
  };

  // 3. GET ALL ORDERS WITH DECRYPTED LOCATION (Admin Only)
  app.get('/api/admin/orders', adminAuth, (req, res) => {
    try {
      const orders = readOrdersFromFile();

      // Decrypt order details for authorized restaurant administrator
      const decryptedOrders = orders.map(order => {
        let deliveryAddress = '[Decryption Failed]';
        let coordinates = null;

        if (order.encryptedAddress) {
          deliveryAddress = decrypt(order.encryptedAddress.data, order.encryptedAddress.iv);
        }

        if (order.encryptedCoordinates) {
          try {
            const coordStr = decrypt(order.encryptedCoordinates.data, order.encryptedCoordinates.iv);
            coordinates = JSON.parse(coordStr);
          } catch (e) {
            console.error('Failed to parse decrypted coordinates:', e);
          }
        }

        return {
          id: order.id,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          deliveryAddress,
          coordinates,
          items: order.items,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt
        };
      });

      return res.json({ orders: decryptedOrders });
    } catch (error) {
      console.error('Failed to fetch admin orders:', error);
      return res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // 4. UPDATE ORDER STATUS (Admin Only)
  app.post('/api/admin/orders/:id/status', adminAuth, (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'preparing', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      const orders = readOrdersFromFile();
      const orderIndex = orders.findIndex(o => o.id === id);

      if (orderIndex === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      orders[orderIndex].status = status;
      writeOrdersToFile(orders);

      return res.json({ success: true, status });
    } catch (error) {
      console.error('Failed to update order status:', error);
      return res.status(500).json({ error: 'Failed to update order' });
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
