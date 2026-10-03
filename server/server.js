import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB, getDbStatus } from './config/db.js';
import { seedMongoIfEmpty } from './services/dbStore.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend on localhost:5173 or preview host
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);

// Body parsers for JSON and URL-encoded form data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
// Files saved in server/uploads/profileImages/ will be accessible at http://localhost:5000/uploads/profileImages/<filename>
const uploadsPath = path.resolve(__dirname, 'uploads');
const profileUploadsPath = path.resolve(__dirname, 'uploads', 'profileImages');

if (!fs.existsSync(profileUploadsPath)) {
  fs.mkdirSync(profileUploadsPath, { recursive: true });
}

app.use('/uploads/profileImages', express.static(profileUploadsPath));
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Health & System status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    database: getDbStatus(),
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error occurred.',
  });
});

// Initialize database and start listening
const startServer = async () => {
  await connectDB();
  await seedMongoIfEmpty();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=========================================`);
    console.log(`🚀 Ink & Quill MERN Server is running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📁 Uploads served at: http://localhost:${PORT}/uploads`);
    console.log(`📁 Profile images at: http://localhost:${PORT}/uploads/profileImages`);
    console.log(`=========================================`);
  });
};

startServer();

export default app;
