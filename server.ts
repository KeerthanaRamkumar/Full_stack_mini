import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDbStatus } from './server/config/db.js';
import { seedMongoIfEmpty } from './server/services/dbStore.js';

// Route imports
import authRoutes from './server/routes/authRoutes.js';
import blogRoutes from './server/routes/blogRoutes.js';
import categoryRoutes from './server/routes/categoryRoutes.js';
import commentRoutes from './server/routes/commentRoutes.js';
import adminRoutes from './server/routes/adminRoutes.js';
import uploadRoutes from './server/routes/uploadRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Basic middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads folders
const serverUploadsPath = path.resolve(__dirname, 'server', 'uploads');
const rootUploadsPath = path.resolve(__dirname, 'uploads');
const serverProfileImagesPath = path.join(serverUploadsPath, 'profileImages');
const rootProfileImagesPath = path.join(rootUploadsPath, 'profileImages');

// Ensure directories exist
if (!fs.existsSync(serverProfileImagesPath)) fs.mkdirSync(serverProfileImagesPath, { recursive: true });
if (!fs.existsSync(rootProfileImagesPath)) fs.mkdirSync(rootProfileImagesPath, { recursive: true });

app.use('/uploads/profileImages', express.static(serverProfileImagesPath));
app.use('/uploads/profileImages', express.static(rootProfileImagesPath));
app.use('/uploads', express.static(serverUploadsPath));
app.use('/uploads', express.static(rootUploadsPath));

// Backend API routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
});

async function start() {
  await connectDB();
  await seedMongoIfEmpty();

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dev Server] Full-stack server running at http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('[Dev Server] Startup failure:', err);
});
